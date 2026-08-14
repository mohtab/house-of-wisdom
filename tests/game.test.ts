import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GAME_VERSION,
  OFFLINE_CAP_MS,
  activityTiming,
  advanceGame,
  buyLanguageSkill,
  campaignDarknessPercent,
  canRepairDesk,
  canRestoreScriptorium,
  createInitialState,
  darknessPercent,
  deskRequirements,
  hasItem,
  hasSkill,
  inspectManuscript,
  knowledgeMultiplier,
  languageSkills,
  levelForXp,
  loadGame,
  objective,
  recommendedDestination,
  repairKeeperDesk,
  queueDailyPlan,
  restoreScriptorium,
  scriptoriumRequirements,
  selectActivity,
  serializeGame,
  skillAvailable,
  skipTutorial,
  startGame,
  storyDialogue,
} from '../src/game.ts';

function entered(now = 0) {
  return startGame(createInitialState(now, 'en'), now);
}

function working(now = 0) {
  return inspectManuscript(entered(now), now);
}

function skill(id: string) {
  return languageSkills.find((candidate) => candidate.id === id)!;
}

function literateState(now = 0) {
  const state = working(now);
  state.knowledge = 1_000;
  state.xp.language = 105;
  state.tutorialStep = 'guided';
  return ['first-letter', 'word-roots', 'grammar', 'eloquence']
    .reduce((current, id) => buyLanguageSkill(current, id, now), state);
}

test('Arabic is primary and a fresh Baghdad begins at 100% Darkness', () => {
  const state = createInitialState(0);
  assert.equal(state.language, 'ar');
  assert.equal(state.tutorialStep, 'comic');
  assert.equal(darknessPercent(state), 100);
});

test('entering pauses for a deliberate manuscript inspection', () => {
  const state = entered(1_000);
  assert.equal(state.started, true);
  assert.equal(state.activeActivityId, null);
  assert.equal(state.tutorialStep, 'inspect-manuscript');
  assert.equal(recommendedDestination(state), 'house');
  assert.match(storyDialogue(state, 'en')!.text, /torn manuscript/);

  const inspected = inspectManuscript(state, 1_000);
  assert.equal(inspected.activeActivityId, 'trace-letters');
  assert.equal(inspected.tutorialStep, 'first-reward');
  assert.equal(recommendedDestination(inspected), 'work');
});

test('the displayed six-second activity completes at six real seconds and redirects to Knowledge', () => {
  const state = working(1_000);
  const before = advanceGame(state, 6_999).state;
  assert.equal(before.knowledge, 0);
  assert.equal(activityTiming(before, 6_999)?.remainingMs, 1);

  const completed = advanceGame(before, 7_000);
  assert.equal(completed.summary.completions, 1);
  assert.equal(completed.state.knowledge, 8);
  assert.equal(completed.state.xp.language, 8);
  assert.equal(completed.state.tutorialStep, 'first-insight');
  assert.equal(recommendedDestination(completed.state), 'knowledge');
});

test('one queued task completes exactly once and the queue stops when empty', () => {
  const once = advanceGame(working(0), 6_000);
  assert.equal(advanceGame(once.state, 6_000).summary.completions, 0);
  assert.equal(once.state.knowledge, 8);
  assert.equal(once.state.activeActivityId, null);

  let queued = skipTutorial(createInitialState(0, 'en'), 0);
  queued = selectActivity(queued, 'trace-letters', 0);
  queued = selectActivity(queued, 'trace-letters', 0);
  const batch = advanceGame(queued, 18_250);
  assert.equal(batch.summary.completions, 3);
  assert.equal(batch.state.knowledge, 3);
  assert.equal(batch.state.xp.language, 12);
  assert.equal(batch.state.activityProgressMs, 0);
  assert.equal(batch.state.workQueue.length, 0);
});

test('Language XP crosses deterministic level thresholds', () => {
  assert.equal(levelForXp(0), 1);
  assert.equal(levelForXp(8), 2);
  assert.equal(levelForXp(28), 3);
  assert.equal(levelForXp(105), 5);
});

test('the first insight completes onboarding and the Language tree keeps its gates', () => {
  const state = working(0);
  state.knowledge = 100;
  state.xp.language = 8;
  state.tutorialStep = 'first-insight';
  assert.equal(skillAvailable(state, skill('first-letter')), true);
  assert.equal(skillAvailable(state, skill('word-roots')), false);

  const first = buyLanguageSkill(state, 'first-letter', 0);
  assert.equal(first.tutorialStep, 'guided');
  assert.equal(hasSkill(first, 'first-letter'), true);
  assert.equal(hasItem(first, 'first-word'), true);
  assert.equal(first.knowledge, 92);
  assert.equal(skillAvailable(first, skill('word-roots')), false);
  first.xp.language = 28;
  assert.equal(skillAvailable(first, skill('word-roots')), true);
  assert.deepEqual(buyLanguageSkill(first, 'first-letter', 0).skills, ['first-letter']);
});

test('guidance can be skipped without skipping progression', () => {
  const state = skipTutorial(createInitialState(0, 'en'), 0);
  assert.equal(state.started, true);
  assert.equal(state.tutorialSkipped, true);
  assert.equal(state.tutorialStep, 'guided');
  assert.equal(state.activeActivityId, 'trace-letters');
  assert.equal(state.skills.length, 0);
});

test('Eloquence reveals historical Al-Jahiz only after the full Language path', () => {
  const state = literateState(0);
  assert.equal(state.ghostIdentityRevealed, true);
  assert.equal(hasItem(state, 'al-jahiz-signature'), true);
  assert.match(storyDialogue(state, 'en')!.text, /Al-Jahiz/);
});

test('salvage activities award physical materials through the same timestamp clock', () => {
  let selected = literateState(0);
  selected.workQueue = [];
  selected.activeActivityId = null;
  selected = selectActivity(selected, 'salvage-timber', 0);
  selected = selectActivity(selected, 'salvage-timber', 0);
  selected = selectActivity(selected, 'salvage-timber', 0);
  const result = advanceGame(selected, 40_000);
  assert.equal(result.summary.completions, 3);
  assert.equal(result.state.materials.timber, 3);
  assert.equal(result.state.xp.architecture, 6);
});

test('the Keeper’s Desk moves the permanent milestone from 100% to 99% exactly once', () => {
  const state = literateState(0);
  state.knowledge = deskRequirements.knowledge;
  state.materials = { timber: deskRequirements.timber, stone: deskRequirements.stone };
  assert.equal(canRepairDesk(state), true);
  assert.equal(darknessPercent(state), 100);

  const repaired = repairKeeperDesk(state, 0);
  assert.deepEqual(repaired.materials, { timber: 0, stone: 0 });
  assert.equal(repaired.deskRepaired, true);
  assert.equal(repaired.ignoranceRevealed, true);
  assert.equal(repaired.prologueComplete, true);
  assert.equal(repaired.tutorialStep, 'complete');
  assert.deepEqual(repaired.lightMilestones, ['keeper-desk']);
  assert.equal(darknessPercent(repaired), 99);
  assert.equal(objective(repaired, 'en'), 'Restore the Scriptorium so knowledge can begin to travel');
  assert.match(storyDialogue(repaired, 'en')!.text, /Ignorance given weight/);
  assert.deepEqual(repairKeeperDesk(repaired, 0), repaired);
});

test('the Scriptorium creates a permanent 95% baseline and one three-step Daily Need', () => {
  const state = literateState(0);
  state.knowledge = deskRequirements.knowledge + scriptoriumRequirements.knowledge;
  state.materials = {
    timber: deskRequirements.timber + scriptoriumRequirements.timber,
    stone: deskRequirements.stone + scriptoriumRequirements.stone,
  };
  const desk = repairKeeperDesk(state, 0);
  desk.workQueue = [];
  desk.activeActivityId = null;
  assert.equal(canRestoreScriptorium(desk), true);

  const restored = restoreScriptorium(desk, 0);
  assert.equal(restored.scriptoriumRepaired, true);
  assert.deepEqual(restored.lightMilestones, ['keeper-desk', 'scriptorium']);
  assert.equal(campaignDarknessPercent(restored), 95);
  assert.equal(darknessPercent(restored), 98);
  assert.equal(restored.dailyNeedId, 'eastern-school');
  assert.equal(restored.dailyEncroachment, 3);
});

test('Learn, Make, and Serve clear daily encroachment without risking permanent restoration', () => {
  const state = literateState(0);
  state.knowledge = deskRequirements.knowledge + scriptoriumRequirements.knowledge;
  state.materials = {
    timber: deskRequirements.timber + scriptoriumRequirements.timber,
    stone: deskRequirements.stone + scriptoriumRequirements.stone,
  };
  const desk = repairKeeperDesk(state, 0);
  desk.workQueue = [];
  desk.activeActivityId = null;
  let daily = restoreScriptorium(desk, 0);
  daily = queueDailyPlan(daily, 0);
  assert.deepEqual(daily.workQueue.map((entry) => entry.activityId), ['decipher-primer', 'copy-primer', 'deliver-primer']);

  daily = advanceGame(daily, 10_000).state;
  assert.equal(daily.dailyNeedStep, 1);
  assert.equal(darknessPercent(daily), 97);
  assert.equal(daily.knowledge, 5.5);

  daily = advanceGame(daily, 22_000).state;
  assert.equal(daily.dailyNeedStep, 2);
  assert.equal(darknessPercent(daily), 96);
  assert.equal(hasItem(daily, 'primer-copy'), true);

  daily = advanceGame(daily, 30_000).state;
  assert.equal(daily.dailyNeedId, null);
  assert.equal(daily.dailyEncroachment, 0);
  assert.equal(daily.schoolRelit, true);
  assert.equal(hasItem(daily, 'primer-copy'), false);
  assert.equal(darknessPercent(daily), 95);
  assert.equal(campaignDarknessPercent(daily), 95);

  const nextDay = advanceGame(daily, 24 * 60 * 60 * 1_000 + 30_000).state;
  assert.equal(nextDay.dailyNeedId, 'eastern-school');
  assert.equal(nextDay.dailyEncroachment, 3);
  assert.equal(darknessPercent(nextDay), 98);
  assert.equal(campaignDarknessPercent(nextDay), 95);
});

test('missed days never stack Daily Needs or increase Campaign Darkness', () => {
  const state = literateState(0);
  state.knowledge = deskRequirements.knowledge + scriptoriumRequirements.knowledge;
  state.materials = {
    timber: deskRequirements.timber + scriptoriumRequirements.timber,
    stone: deskRequirements.stone + scriptoriumRequirements.stone,
  };
  const desk = repairKeeperDesk(state, 0);
  desk.workQueue = [];
  desk.activeActivityId = null;
  const daily = restoreScriptorium(desk, 0);
  const returned = advanceGame(daily, 7 * 24 * 60 * 60 * 1_000).state;
  assert.equal(returned.dailyNeedId, 'eastern-school');
  assert.equal(returned.dailyEncroachment, 3);
  assert.equal(campaignDarknessPercent(returned), 95);
  assert.equal(darknessPercent(returned), 98);
});

test('the restored desk modifier composes consistently online and in a batch', () => {
  const state = working(0);
  state.deskRepaired = true;
  state.tutorialStep = 'complete';
  assert.equal(knowledgeMultiplier(state, 'language'), 1.1);
  state.workQueue.push({ activityId: 'trace-letters' }, { activityId: 'trace-letters' });
  const batch = advanceGame(state, 60_000);
  assert.equal(batch.state.knowledge, 3.3);

  let incremental = state;
  for (let time = 6_000; time <= 18_000; time += 6_000) incremental = advanceGame(incremental, time).state;
  assert.equal(incremental.knowledge, batch.state.knowledge);
});

test('offline elapsed time honors the cap but never invents work beyond the queue', () => {
  let state = working(10_000);
  state = selectActivity(state, 'trace-letters', 10_000);
  state = selectActivity(state, 'trace-letters', 10_000);
  const returned = advanceGame(state, 10_000 + OFFLINE_CAP_MS + 3_600_000);
  assert.equal(returned.summary.appliedElapsedMs, OFFLINE_CAP_MS);
  assert.equal(returned.summary.cappedMs, 3_600_000);
  assert.equal(returned.summary.completions, 3);
  assert.equal(returned.state.workQueue.length, 0);
});

test('switching activities reconciles elapsed work before starting a new clock', () => {
  const state = literateState(0);
  state.activeActivityId = 'trace-letters';
  state.activityProgressMs = 0;
  state.lastUpdatedAt = 0;
  const switched = selectActivity(state, 'salvage-timber', 6_000);
  assert.equal(switched.knowledge, 883);
  assert.equal(switched.activeActivityId, 'salvage-timber');
  assert.equal(advanceGame(switched, 14_000).summary.completions, 1);
});

test('save and load preserve the v0.4 queue and reconcile only unsimulated time', () => {
  let progressed = working(1_000);
  progressed = selectActivity(progressed, 'trace-letters', 1_000);
  progressed = advanceGame(progressed, 4_000).state;
  const loaded = loadGame(serializeGame(progressed), 5_000);
  assert.equal(loaded.migrated, false);
  assert.equal(loaded.state.version, GAME_VERSION);
  assert.equal(loaded.state.knowledge, 0);
  assert.equal(loaded.state.activityProgressMs, 4_000);
  assert.equal(loaded.state.workQueue.length, 2);
  assert.equal(loadGame(serializeGame(loaded.state), 5_000).summary?.completions, 0);
});

test('v0.3.1 saves migrate their active work into the first v0.4 queue slot', () => {
  const raw = JSON.stringify({
    version: 4, language: 'en', knowledge: 12, materials: { timber: 1, stone: 2 },
    xp: { language: 40, translation: 0, mathematics: 0, architecture: 0 },
    activeActivityId: 'restore-word', activityProgressMs: 2_000, lastUpdatedAt: 5_000,
    skills: ['first-letter'], inventory: ['torn-manuscript', 'worn-hammer', 'first-word'],
    lightMilestones: [], started: true, comicSeen: true, ghostEncountered: true,
    ghostIdentityRevealed: false, deskRepaired: false, ignoranceRevealed: false,
    prologueComplete: false, offlineExplained: false, tutorialStep: 'guided', tutorialSkipped: true,
    lastReward: null,
  });
  const loaded = loadGame(raw, 5_000);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.fromVersion, 4);
  assert.equal(loaded.state.version, GAME_VERSION);
  assert.deepEqual(loaded.state.workQueue, [{ activityId: 'restore-word' }]);
  assert.equal(loaded.state.activityProgressMs, 2_000);
  assert.equal(loaded.state.knowledge, 12);
});

test('v0.3 saves preserve progress, gain the desk milestone, and skip forced onboarding', () => {
  const raw = JSON.stringify({
    version: 3, language: 'en', knowledge: 23.5, materials: { timber: 2, stone: 1 },
    xp: { language: 72, translation: 0, mathematics: 0, architecture: 6 },
    activeActivityId: 'copy-phrase', activityProgressMs: 1_000, lastUpdatedAt: 50_000,
    skills: ['first-letter', 'word-roots'], inventory: ['torn-manuscript', 'first-word'],
    started: true, comicSeen: true, ghostEncountered: true, deskRepaired: false,
  });
  const loaded = loadGame(raw, 50_000);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.fromVersion, 3);
  assert.equal(loaded.state.knowledge, 23.5);
  assert.deepEqual(loaded.state.skills, ['first-letter', 'word-roots']);
  assert.equal(loaded.state.tutorialSkipped, true);
  assert.equal(loaded.state.tutorialStep, 'guided');
  assert.equal(loaded.state.activeActivityId, 'copy-phrase');
  assert.equal(darknessPercent(loaded.state), 100);

  const restored = loadGame(JSON.stringify({ ...JSON.parse(raw), deskRepaired: true, prologueComplete: true }), 50_000).state;
  assert.deepEqual(restored.lightMilestones, ['keeper-desk']);
  assert.equal(darknessPercent(restored), 99);
});

test('invalid saves reset safely while v0.2 only preserves language', () => {
  const invalid = loadGame('{not-json', 25_000);
  assert.equal(invalid.isNew, true);
  assert.equal(invalid.state.language, 'ar');
  assert.equal(invalid.state.activeActivityId, null);

  const old = loadGame(JSON.stringify({ version: 2, language: 'en', knowledge: 999, started: true }), 50_000);
  assert.equal(old.migrated, true);
  assert.equal(old.fromVersion, 2);
  assert.equal(old.state.language, 'en');
  assert.equal(old.state.knowledge, 0);
  assert.equal(old.state.started, false);
});
