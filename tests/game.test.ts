import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GAME_VERSION,
  OFFLINE_CAP_MS,
  activityTiming,
  advanceGame,
  buyLanguageSkill,
  canRepairDesk,
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

test('completion rewards are granted exactly once and auto-repeat preserves the remainder', () => {
  const once = advanceGame(working(0), 6_000);
  assert.equal(advanceGame(once.state, 6_000).summary.completions, 0);
  assert.equal(once.state.knowledge, 8);

  const batch = advanceGame(skipTutorial(createInitialState(0, 'en'), 0), 18_250);
  assert.equal(batch.summary.completions, 3);
  assert.equal(batch.state.knowledge, 3);
  assert.equal(batch.state.xp.language, 12);
  assert.equal(batch.state.activityProgressMs, 250);
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
  const selected = selectActivity(literateState(0), 'salvage-timber', 0);
  const result = advanceGame(selected, 40_000);
  assert.equal(result.summary.completions, 5);
  assert.equal(result.state.materials.timber, 5);
  assert.equal(result.state.xp.architecture, 10);
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
  assert.equal(objective(repaired, 'en'), 'Learn how circulating knowledge can relight Baghdad');
  assert.match(storyDialogue(repaired, 'en')!.text, /Ignorance given weight/);
  assert.deepEqual(repairKeeperDesk(repaired, 0), repaired);
});

test('the restored desk modifier composes consistently online and in a batch', () => {
  const state = working(0);
  state.deskRepaired = true;
  state.tutorialStep = 'complete';
  assert.equal(knowledgeMultiplier(state, 'language'), 1.1);
  const batch = advanceGame(state, 60_000);
  assert.equal(batch.state.knowledge, 11);

  let incremental = state;
  for (let time = 6_000; time <= 60_000; time += 6_000) incremental = advanceGame(incremental, time).state;
  assert.equal(incremental.knowledge, batch.state.knowledge);
});

test('offline elapsed time uses timestamps and caps production at eight hours', () => {
  const returned = advanceGame(working(10_000), 10_000 + OFFLINE_CAP_MS + 3_600_000);
  assert.equal(returned.summary.appliedElapsedMs, OFFLINE_CAP_MS);
  assert.equal(returned.summary.cappedMs, 3_600_000);
  assert.equal(returned.summary.completions, OFFLINE_CAP_MS / 6_000);
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

test('save and load preserve current v0.3.1 state and reconcile only unsimulated time', () => {
  const progressed = advanceGame(working(1_000), 7_000).state;
  const loaded = loadGame(serializeGame(progressed), 10_000);
  assert.equal(loaded.migrated, false);
  assert.equal(loaded.state.version, GAME_VERSION);
  assert.equal(loaded.state.knowledge, 8);
  assert.equal(loaded.state.activityProgressMs, 3_000);
  assert.equal(loadGame(serializeGame(loaded.state), 10_000).summary?.completions, 0);
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
