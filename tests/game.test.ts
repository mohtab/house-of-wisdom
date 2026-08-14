import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DAILY_DUTY_TARGETS,
  EASTERN_SCHOOL_TARGET,
  GAME_VERSION,
  OFFLINE_CAP_MS,
  activityDurationMs,
  activityMasteryLevel,
  advanceGame,
  buyLanguageSkill,
  campaignDarknessPercent,
  canRestoreScriptorium,
  createInitialState,
  darknessPercent,
  disciplineUnlocked,
  getActivity,
  getItemCount,
  ledgerTasks,
  loadGame,
  repairKeeperDesk,
  restoreScriptorium,
  scriptoriumRequirements,
  selectActivity,
  serializeGame,
  setWorkTarget,
  skipTutorial,
  startGame,
  stopCurrentWork,
  togglePinnedTask,
} from '../src/game.ts';

function entered(now = 0) {
  return startGame(createInitialState(now, 'en'), now);
}

function literateState(now = 0) {
  const state = skipTutorial(entered(now), now);
  state.skills = ['first-letter', 'word-roots', 'grammar', 'eloquence'];
  state.ghostIdentityRevealed = true;
  state.xp.language = 200;
  state.activeActivityId = null;
  state.workQueue = [];
  state.workTargetRemaining = null;
  return state;
}

function deskState(now = 0) {
  const state = literateState(now);
  state.knowledge = 100;
  state.materials = { timber: 10, stone: 10 };
  return repairKeeperDesk(state, now);
}

function scriptoriumState(now = 0) {
  const state = deskState(now);
  state.activeActivityId = null;
  state.workQueue = [];
  state.knowledge = scriptoriumRequirements.knowledge;
  state.materials = { timber: scriptoriumRequirements.timber, stone: scriptoriumRequirements.stone };
  return restoreScriptorium(state, now);
}

function runActivity(state: ReturnType<typeof createInitialState>, id: string, repetitions: number, now: number) {
  let selected = selectActivity(state, id, now);
  selected = setWorkTarget(selected, repetitions, now);
  const activity = getActivity(id)!;
  return advanceGame(selected, now + activity.durationMs * repetitions + 1).state;
}

function relitSchoolState(now = 0) {
  let state = scriptoriumState(now);
  state = runActivity(state, 'decipher-primer', 1, now);
  state.knowledge = 10_000;
  state = runActivity(state, 'prepare-ink', EASTERN_SCHOOL_TARGET, now + 70_000);
  state = runActivity(state, 'copy-primer', EASTERN_SCHOOL_TARGET, now + 600_000);
  state = runActivity(state, 'deliver-primer', EASTERN_SCHOOL_TARGET, now + 2_000_000);
  return state;
}

test('Arabic remains primary and a fresh Baghdad begins at 100% Darkness', () => {
  const state = createInitialState(0);
  assert.equal(state.language, 'ar');
  assert.equal(state.version, GAME_VERSION);
  assert.equal(darknessPercent(state), 100);
  assert.equal(OFFLINE_CAP_MS, 24 * 60 * 60 * 1_000);
});

test('the fast prologue still begins with the manuscript and first Arabic insight', () => {
  let state = entered(0);
  assert.equal(state.tutorialStep, 'inspect-manuscript');
  state = skipTutorial(state, 0);
  state.xp.language = 28;
  state.knowledge = 8;
  state = buyLanguageSkill(state, 'first-letter', 0);
  assert.equal(state.skills.includes('first-letter'), true);
  assert.equal(state.inventory.includes('first-word'), true);
});

test('one selected activity repeats until stopped', () => {
  let state = skipTutorial(entered(0), 0);
  state = selectActivity(state, 'trace-letters', 0);
  const result = advanceGame(state, 18_001);
  assert.equal(result.summary.completions, 3);
  assert.equal(result.state.activeActivityId, 'trace-letters');
  assert.equal(result.state.knowledge >= 3, true);
  assert.equal(result.state.activityMasteryXp['trace-letters'], 3);
});

test('a repetition target stops Current Work without creating a queue', () => {
  let state = skipTutorial(entered(0), 0);
  state = selectActivity(state, 'trace-letters', 0);
  state = setWorkTarget(state, 10, 0);
  state = advanceGame(state, 120_000).state;
  assert.equal(state.activeActivityId, null);
  assert.deepEqual(state.workQueue, []);
  assert.equal(state.activityMasteryXp['trace-letters'], 10);
});

test('switching work reconciles elapsed progress and keeps only the new activity', () => {
  let state = literateState(0);
  state = selectActivity(state, 'salvage-timber', 0);
  state = selectActivity(state, 'sort-stone', 24_000);
  assert.equal(state.materials.timber, 3);
  assert.equal(state.activeActivityId, 'sort-stone');
  assert.deepEqual(state.workQueue, [{ activityId: 'sort-stone' }]);
});

test('mastery grows from repetition and reduces that action interval', () => {
  let state = literateState(0);
  const activity = getActivity('salvage-timber')!;
  const base = activityDurationMs(state, activity);
  state.activityMasteryXp[activity.id] = 20_000;
  assert.equal(activityMasteryLevel(state, activity.id) > 1, true);
  assert.equal(activityDurationMs(state, activity) < base, true);
});

test('the six skills unlock in story order', () => {
  const fresh = entered(0);
  assert.equal(disciplineUnlocked(fresh, 'language'), true);
  assert.equal(disciplineUnlocked(fresh, 'gathering'), false);
  const literate = literateState(0);
  assert.equal(disciplineUnlocked(literate, 'gathering'), true);
  assert.equal(disciplineUnlocked(literate, 'scribing'), false);
  const scriptorium = scriptoriumState(0);
  assert.equal(disciplineUnlocked(scriptorium, 'scribing'), true);
  assert.equal(disciplineUnlocked(scriptorium, 'translation'), false);
  const school = relitSchoolState(0);
  assert.equal(disciplineUnlocked(school, 'translation'), true);
  assert.equal(disciplineUnlocked(school, 'mathematics'), false);
});

test('the Scriptorium is a multi-hour restoration and secures 96% Campaign Darkness', () => {
  const state = deskState(0);
  assert.deepEqual(scriptoriumRequirements, { knowledge: 6_000, timber: 800, stone: 600 });
  assert.equal(canRestoreScriptorium(state), false);
  const restored = scriptoriumState(0);
  assert.equal(campaignDarknessPercent(restored), 96);
  assert.equal(restored.dailyNeedId, 'eastern-school');
  assert.equal(restored.dailyEncroachment, 0);
});

test('the eastern school is a persistent civic task requiring twenty copies', () => {
  const state = relitSchoolState(0);
  assert.equal(state.schoolRelit, true);
  assert.equal(state.civicProgress.easternSchoolDeciphered, true);
  assert.equal(state.civicProgress.primersCopied, EASTERN_SCHOOL_TARGET);
  assert.equal(state.civicProgress.primersDelivered, EASTERN_SCHOOL_TARGET);
  assert.equal(getItemCount(state, 'primer-copy'), 0);
  assert.equal(campaignDarknessPercent(state), 95);
});

test('the Scholar Ledger separates persistent goals and supports three pins', () => {
  let state = scriptoriumState(0);
  const tasks = ledgerTasks(state);
  assert.equal(tasks.some((task) => task.id === 'civic-eastern-school' && task.status === 'available'), true);
  for (const id of [...state.pinnedTaskIds]) state = togglePinnedTask(state, id, 0);
  state = togglePinnedTask(state, 'restore-keeper-desk', 0);
  state = togglePinnedTask(state, 'restore-scriptorium', 0);
  state = togglePinnedTask(state, 'civic-eastern-school', 0);
  assert.equal(state.pinnedTaskIds.length, 3);
  state = togglePinnedTask(state, 'research-translation', 0);
  assert.equal(state.pinnedTaskIds.length, 3);
});

test('a later local day creates one non-stacking set of three Daily Duties', () => {
  const completedAt = new Date(2026, 0, 1, 10).getTime();
  let state = relitSchoolState(completedAt);
  const sevenDaysLater = completedAt + 7 * 24 * 60 * 60 * 1_000;
  state = advanceGame(state, sevenDaysLater).state;
  assert.equal(state.dailyEncroachment, 3);
  assert.deepEqual(state.dailyDutyProgress, { learn: 0, make: 0, serve: 0 });
  assert.equal(darknessPercent(state), 98);
  assert.equal(campaignDarknessPercent(state), 95);
});

test('Learn, Make, and Serve duties each clear one temporary point', () => {
  const completedAt = new Date(2026, 0, 1, 10).getTime();
  let state = relitSchoolState(completedAt);
  const nextDay = completedAt + 24 * 60 * 60 * 1_000;
  state = advanceGame(state, nextDay).state;
  state.dailyDutyProgress.learn = DAILY_DUTY_TARGETS.learn - 1;
  state = runActivity(state, 'trace-letters', 1, nextDay);
  assert.equal(state.dailyEncroachment, 2);
  state.dailyDutyProgress.make = DAILY_DUTY_TARGETS.make - 1;
  state = runActivity(state, 'prepare-ink', 1, nextDay + 10_000);
  assert.equal(state.dailyEncroachment, 1);
  state.dailyDutyProgress.serve = DAILY_DUTY_TARGETS.serve - 1;
  state.knowledge = 100;
  state = runActivity(state, 'teach-reading', 1, nextDay + 20_000);
  assert.equal(state.dailyEncroachment, 0);
  assert.equal(darknessPercent(state), campaignDarknessPercent(state));
});

test('24-hour offline progression repeats the chosen work and caps excess time', () => {
  let state = literateState(0);
  state = selectActivity(state, 'salvage-timber', 0);
  const result = advanceGame(state, 3 * OFFLINE_CAP_MS);
  assert.equal(result.summary.appliedElapsedMs, OFFLINE_CAP_MS);
  assert.equal(result.summary.cappedMs, 2 * OFFLINE_CAP_MS);
  assert.equal(result.summary.completions > 1_000, true);
  assert.equal(result.state.activeActivityId, 'salvage-timber');
});

test('resource-consuming work stops cleanly when its input runs out', () => {
  let state = relitSchoolState(0);
  state.knowledge = 9;
  state.itemCounts.ink = 1;
  if (!state.inventory.includes('ink')) state.inventory.push('ink');
  state = selectActivity(state, 'copy-folio', 0);
  const result = advanceGame(state, 100_000);
  assert.equal(result.summary.completions, 1);
  assert.equal(result.state.activeActivityId, null);
  assert.equal(result.summary.blockedActivityId, null);
});

test('stopping work preserves the progress already reconciled', () => {
  let state = literateState(0);
  state = selectActivity(state, 'salvage-timber', 0);
  state = stopCurrentWork(state, 16_000);
  assert.equal(state.materials.timber, 2);
  assert.equal(state.activeActivityId, null);
});

test('v0.5 saves preserve mastery, pins, item counts, and Current Work', () => {
  let state = relitSchoolState(0);
  state = selectActivity(state, 'compare-syriac', 0);
  state = togglePinnedTask(state, 'research-translation', 0);
  state.itemCounts['folio-copy'] = 42;
  if (!state.inventory.includes('folio-copy')) state.inventory.push('folio-copy');
  const loaded = loadGame(serializeGame(state), 80_000);
  assert.equal(loaded.state.version, GAME_VERSION);
  assert.equal(loaded.state.activeActivityId, 'compare-syriac');
  assert.equal(loaded.state.pinnedTaskIds.includes('research-translation'), true);
  assert.equal(getItemCount(loaded.state, 'folio-copy'), 42);
  assert.equal(loaded.state.activityMasteryXp['compare-syriac'] > 0, true);
});

test('v0.4 queue saves migrate to one repeating activity and preserve restoration', () => {
  const old = {
    version: 5, language: 'en', knowledge: 12, materials: { timber: 1, stone: 2 },
    xp: { language: 200, translation: 0, mathematics: 0, architecture: 14 },
    activeActivityId: 'trace-letters', workQueue: [{ activityId: 'trace-letters' }, { activityId: 'salvage-timber' }],
    activityProgressMs: 0, lastUpdatedAt: 0, skills: ['first-letter', 'word-roots', 'grammar', 'eloquence'],
    inventory: ['torn-manuscript', 'worn-hammer'], lightMilestones: ['keeper-desk', 'scriptorium'], started: true,
    comicSeen: true, ghostEncountered: true, ghostIdentityRevealed: true, deskRepaired: true, scriptoriumRepaired: true,
    ignoranceRevealed: true, prologueComplete: true, offlineExplained: true, tutorialStep: 'complete', tutorialSkipped: false,
    lastReward: null, dailyNeedId: 'eastern-school', dailyNeedStep: 1, dailyEncroachment: 2,
    dailyNeedGeneratedOn: '2026-01-01', lastDailyResolvedOn: null, schoolRelit: false,
  };
  const loaded = loadGame(JSON.stringify(old), 0);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.fromVersion, 5);
  assert.deepEqual(loaded.state.workQueue, [{ activityId: 'trace-letters' }]);
  assert.equal(loaded.state.workTargetRemaining, null);
  assert.equal(loaded.state.xp.gathering, 14);
  assert.equal(loaded.state.civicProgress.easternSchoolDeciphered, true);
  assert.equal(campaignDarknessPercent(loaded.state), 96);
});

test('invalid saves reset safely while old v0.2 saves preserve only language', () => {
  assert.equal(loadGame('{bad json', 0).isNew, true);
  const old = loadGame(JSON.stringify({ version: 2, language: 'en', knowledge: 999, started: true }), 50_000);
  assert.equal(old.state.language, 'en');
  assert.equal(old.state.knowledge, 0);
  assert.equal(old.state.started, false);
});
