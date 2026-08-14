import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OFFLINE_CAP_MS,
  activityTiming,
  advanceGame,
  buyLanguageSkill,
  canRepairDesk,
  createInitialState,
  deskRequirements,
  ghostDialogue,
  hasItem,
  hasSkill,
  knowledgeMultiplier,
  languageSkills,
  levelForXp,
  loadGame,
  objective,
  repairKeeperDesk,
  selectActivity,
  serializeGame,
  skillAvailable,
  startGame,
} from '../src/game.ts';

function started(now = 0) {
  return startGame(createInitialState(now, 'en'), now);
}

function skill(id: string) {
  return languageSkills.find((candidate) => candidate.id === id)!;
}

function literateState(now = 0) {
  const state = started(now);
  state.knowledge = 1_000;
  state.xp.language = 105;
  return ['first-letter', 'word-roots', 'grammar', 'eloquence']
    .reduce((current, id) => buyLanguageSkill(current, id, now), state);
}

test('Arabic is the primary language for a completely new journey', () => {
  assert.equal(createInitialState(0).language, 'ar');
});

test('the displayed six-second activity completes at six real seconds', () => {
  const state = started(1_000);
  const before = advanceGame(state, 6_999).state;
  assert.equal(before.knowledge, 0);
  assert.equal(before.xp.language, 0);
  assert.equal(activityTiming(before, 6_999)?.remainingMs, 1);

  const completed = advanceGame(before, 7_000);
  assert.equal(completed.summary.completions, 1);
  assert.equal(completed.state.knowledge, 1);
  assert.equal(completed.state.xp.language, 4);
  assert.equal(completed.state.activityProgressMs, 0);
});

test('completion rewards are granted exactly once', () => {
  const once = advanceGame(started(0), 6_000);
  assert.deepEqual(
    { knowledge: once.summary.knowledge, xp: once.summary.xp, repetitions: once.summary.completions },
    { knowledge: 1, xp: 4, repetitions: 1 },
  );
  const duplicateAttempt = advanceGame(once.state, 6_000);
  assert.equal(duplicateAttempt.summary.completions, 0);
  assert.equal(duplicateAttempt.state.knowledge, 1);
  assert.equal(duplicateAttempt.state.xp.language, 4);
});

test('auto-repeat processes every complete cycle and preserves the remainder', () => {
  const result = advanceGame(started(0), 18_250);
  assert.equal(result.summary.completions, 3);
  assert.equal(result.state.knowledge, 3);
  assert.equal(result.state.xp.language, 12);
  assert.equal(result.state.activityProgressMs, 250);
});

test('Language XP crosses deterministic level thresholds', () => {
  assert.equal(levelForXp(0), 1);
  assert.equal(levelForXp(7), 1);
  assert.equal(levelForXp(8), 2);
  assert.equal(levelForXp(27), 2);
  assert.equal(levelForXp(28), 3);
  assert.equal(levelForXp(105), 5);
});

test('the Language tree requires both level and prior understanding', () => {
  const state = started(0);
  state.knowledge = 100;
  state.xp.language = 8;
  assert.equal(skillAvailable(state, skill('first-letter')), true);
  assert.equal(skillAvailable(state, skill('word-roots')), false);

  const first = buyLanguageSkill(state, 'first-letter', 0);
  assert.equal(hasSkill(first, 'first-letter'), true);
  assert.equal(skillAvailable(first, skill('word-roots')), false, 'level three still gates Word Roots');
  first.xp.language = 28;
  assert.equal(skillAvailable(first, skill('word-roots')), true);
});

test('skill purchases spend Knowledge and cannot be bought twice', () => {
  const state = started(0);
  state.knowledge = 8;
  state.xp.language = 8;
  const purchased = buyLanguageSkill(state, 'first-letter', 0);
  assert.equal(purchased.knowledge, 0);
  assert.deepEqual(purchased.skills, ['first-letter']);
  const duplicate = buyLanguageSkill(purchased, 'first-letter', 0);
  assert.equal(duplicate.knowledge, 0);
  assert.deepEqual(duplicate.skills, ['first-letter']);
});

test('Eloquence reveals Al-Jahiz only after the full Language path', () => {
  const state = literateState(0);
  assert.equal(state.ghostIdentityRevealed, true);
  assert.equal(hasItem(state, 'al-jahiz-signature'), true);
  assert.match(ghostDialogue(state, 'en')!.text, /Al-Jahiz/);
  assert.match(ghostDialogue(state, 'ar')!.speaker, /الجاحظ/);
});

test('salvage activities award physical materials through the same timestamp clock', () => {
  const state = literateState(0);
  const selected = selectActivity(state, 'salvage-timber', 0);
  const result = advanceGame(selected, 40_000);
  assert.equal(result.summary.completions, 5);
  assert.equal(result.summary.timber, 5);
  assert.equal(result.state.materials.timber, 5);
  assert.equal(result.state.xp.architecture, 10);
});

test('the Keeper’s Desk consumes requirements and completes the prologue once', () => {
  const state = literateState(0);
  state.knowledge = deskRequirements.knowledge;
  state.materials = { timber: deskRequirements.timber, stone: deskRequirements.stone };
  assert.equal(canRepairDesk(state), true);
  const repaired = repairKeeperDesk(state, 0);
  assert.equal(repaired.knowledge, 0);
  assert.deepEqual(repaired.materials, { timber: 0, stone: 0 });
  assert.equal(repaired.deskRepaired, true);
  assert.equal(repaired.ignoranceRevealed, true);
  assert.equal(repaired.prologueComplete, true);
  assert.equal(repaired.activeActivityId, 'study-eloquence');
  assert.equal(objective(repaired, 'en'), 'Discover why the House was silenced');
  assert.equal(hasItem(repaired, 'keeper-desk'), true);
  assert.deepEqual(repairKeeperDesk(repaired, 0), repaired);
});

test('the restored desk modifier composes consistently online and in a batch', () => {
  const state = started(0);
  state.deskRepaired = true;
  assert.equal(knowledgeMultiplier(state, 'language'), 1.1);
  const batch = advanceGame(state, 60_000);
  assert.equal(batch.summary.completions, 10);
  assert.equal(batch.state.knowledge, 11);

  let incremental = state;
  for (let time = 6_000; time <= 60_000; time += 6_000) incremental = advanceGame(incremental, time).state;
  assert.equal(incremental.knowledge, batch.state.knowledge);
});

test('offline elapsed time uses timestamps and caps production at eight hours', () => {
  const state = started(10_000);
  const returned = advanceGame(state, 10_000 + OFFLINE_CAP_MS + 3_600_000);
  assert.equal(returned.summary.appliedElapsedMs, OFFLINE_CAP_MS);
  assert.equal(returned.summary.cappedMs, 3_600_000);
  assert.equal(returned.summary.completions, OFFLINE_CAP_MS / 6_000);
  assert.equal(returned.state.lastUpdatedAt, 10_000 + OFFLINE_CAP_MS + 3_600_000);
});

test('switching activities reconciles elapsed work before starting a new clock', () => {
  const state = literateState(0);
  state.activeActivityId = 'trace-letters';
  state.activityProgressMs = 0;
  state.lastUpdatedAt = 0;
  const switched = selectActivity(state, 'salvage-timber', 6_000);
  assert.equal(switched.knowledge, 883);
  assert.equal(switched.xp.language, 109);
  assert.equal(switched.activeActivityId, 'salvage-timber');
  assert.equal(switched.activityProgressMs, 0);
  assert.equal(advanceGame(switched, 14_000).summary.completions, 1);
});

test('save and load preserve v0.3 state and reconcile only unsimulated time', () => {
  const progressed = advanceGame(started(1_000), 7_000).state;
  const raw = serializeGame(progressed);
  const loaded = loadGame(raw, 10_000);
  assert.equal(loaded.isNew, false);
  assert.equal(loaded.migrated, false);
  assert.equal(loaded.state.knowledge, 1);
  assert.equal(loaded.state.activityProgressMs, 3_000);
  assert.equal(loaded.state.lastUpdatedAt, 10_000);
  const secondLoad = loadGame(serializeGame(loaded.state), 10_000);
  assert.equal(secondLoad.state.knowledge, 1);
  assert.equal(secondLoad.summary?.completions, 0);
});

test('invalid saves fall back safely to a fresh Arabic journey', () => {
  const loaded = loadGame('{not-json', 25_000);
  assert.equal(loaded.isNew, true);
  assert.equal(loaded.state.language, 'ar');
  assert.equal(loaded.state.knowledge, 0);
  assert.equal(loaded.state.activeActivityId, null);
  assert.equal(loaded.state.lastUpdatedAt, 25_000);
});

test('v0.2 saves preserve language but restart the redesigned prologue', () => {
  const raw = JSON.stringify({ version: 2, language: 'en', knowledge: 999, started: true });
  const loaded = loadGame(raw, 50_000);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.fromVersion, 2);
  assert.equal(loaded.state.language, 'en');
  assert.equal(loaded.state.knowledge, 0);
  assert.equal(loaded.state.started, false);
  assert.deepEqual(loaded.state.inventory, ['torn-manuscript', 'worn-hammer']);
});
