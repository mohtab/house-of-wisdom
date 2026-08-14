import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OFFLINE_CAP_MS,
  activityTiming,
  advanceGame,
  beginKindi,
  buyResearch,
  chooseKindiPlaintext,
  chooseKindiSubstitution,
  chooseKindiSymbol,
  compareKindiFrequency,
  createInitialState,
  hasResearch,
  knowledgeMultiplier,
  levelForXp,
  loadGame,
  researchAvailable,
  researchNodes,
  selectActivity,
  serializeGame,
  startGame,
} from '../src/game.ts';

function started(now = 0) {
  return startGame(createInitialState(now), now);
}

function node(id: string) {
  return researchNodes.find((candidate) => candidate.id === id)!;
}

test('a displayed six-second activity completes at six real seconds', () => {
  const state = started(1_000);
  const before = advanceGame(state, 6_999).state;
  assert.equal(before.knowledge, 0);
  assert.equal(before.xp.translation, 0);
  assert.equal(activityTiming(before, 6_999)?.remainingMs, 1);

  const completed = advanceGame(before, 7_000);
  assert.equal(completed.summary.completions, 1);
  assert.equal(completed.state.knowledge, 1);
  assert.equal(completed.state.xp.translation, 4);
  assert.equal(completed.state.activityProgressMs, 0);
});

test('completion awards the configured Knowledge and XP exactly once', () => {
  const once = advanceGame(started(0), 6_000);
  assert.deepEqual(
    { knowledge: once.summary.knowledge, xp: once.summary.xp, repetitions: once.summary.completions },
    { knowledge: 1, xp: 4, repetitions: 1 },
  );
  const duplicateAttempt = advanceGame(once.state, 6_000);
  assert.equal(duplicateAttempt.summary.completions, 0);
  assert.equal(duplicateAttempt.state.knowledge, 1);
  assert.equal(duplicateAttempt.state.xp.translation, 4);
});

test('auto-repeat processes every full cycle and preserves the remainder', () => {
  const result = advanceGame(started(0), 18_250);
  assert.equal(result.summary.completions, 3);
  assert.equal(result.state.knowledge, 3);
  assert.equal(result.state.xp.translation, 12);
  assert.equal(result.state.activityProgressMs, 250);
});

test('XP accumulation crosses deterministic level thresholds', () => {
  assert.equal(levelForXp(0), 1);
  assert.equal(levelForXp(19), 1);
  assert.equal(levelForXp(20), 2);
  assert.equal(levelForXp(54), 2);
  assert.equal(levelForXp(55), 3);
  assert.equal(levelForXp(175), 5);
});

test('research requirements gate the path and the first priority choice', () => {
  const state = createInitialState(0);
  assert.equal(researchAvailable(state, node('desk')), true);
  assert.equal(researchAvailable(state, node('mathematics')), false);

  state.knowledge = 1_000;
  const desk = buyResearch(state, 'desk', 0);
  const math = buyResearch(desk, 'mathematics', 0);
  const preserve = buyResearch(math, 'preserve', 0);
  assert.equal(hasResearch(preserve, 'preserve'), true);
  assert.equal(researchAvailable(preserve, node('follow')), false);
  assert.equal(researchAvailable(preserve, node('language')), false, 'levels still gate Al-Kindi');
});

test('research purchases spend Knowledge and cannot be bought twice', () => {
  const state = createInitialState(0);
  state.knowledge = 45;
  const purchased = buyResearch(state, 'desk', 0);
  assert.equal(purchased.knowledge, 5);
  assert.deepEqual(purchased.research, ['desk']);
  const duplicate = buyResearch(purchased, 'desk', 0);
  assert.equal(duplicate.knowledge, 5);
  assert.deepEqual(duplicate.research, ['desk']);
});

test('Knowledge modifiers compose consistently online and in batches', () => {
  const state = started(0);
  state.research.push('desk', 'preserve');
  assert.equal(knowledgeMultiplier(state, 'translation'), 1.2);
  const batch = advanceGame(state, 60_000);
  assert.equal(batch.summary.completions, 10);
  assert.equal(batch.state.knowledge, 12);

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
  const state = started(0);
  state.research.push('mathematics');
  const switched = selectActivity(state, 'numerals', 6_000);
  assert.equal(switched.knowledge, 1);
  assert.equal(switched.xp.translation, 4);
  assert.equal(switched.activeActivityId, 'numerals');
  assert.equal(switched.activityProgressMs, 0);
  assert.equal(advanceGame(switched, 13_000).summary.completions, 1);
});

test('save and load preserve state and reconcile only unsimulated time', () => {
  const progressed = advanceGame(started(1_000), 7_000).state;
  const raw = serializeGame(progressed);
  const loaded = loadGame(raw, 10_000);
  assert.equal(loaded.isNew, false);
  assert.equal(loaded.state.knowledge, 1);
  assert.equal(loaded.state.activityProgressMs, 3_000);
  assert.equal(loaded.state.lastUpdatedAt, 10_000);
  const secondLoad = loadGame(serializeGame(loaded.state), 10_000);
  assert.equal(secondLoad.state.knowledge, 1);
  assert.equal(secondLoad.summary?.completions, 0);
});

test('invalid saves fall back safely to a fresh state', () => {
  const loaded = loadGame('{not-json', 25_000);
  assert.equal(loaded.isNew, true);
  assert.equal(loaded.state.knowledge, 0);
  assert.equal(loaded.state.activeActivityId, null);
  assert.equal(loaded.state.lastUpdatedAt, 25_000);
});

test('Al-Kindi interaction grants the permanent Method of Analysis reward', () => {
  const state = started(0);
  state.knowledge = 1_000;
  state.xp.translation = 105;
  state.xp.mathematics = 175;
  state.research.push('desk', 'mathematics', 'preserve');
  const unlocked = buyResearch(state, 'language', 0);
  const begun = beginKindi(unlocked, 0);
  const found = chooseKindiSymbol(begun, '◆', 0);
  const compared = compareKindiFrequency(found, 0);
  const substituted = chooseKindiSubstitution(compared, 'common', 0);
  const completed = chooseKindiPlaintext(substituted, 'correct', 0);
  assert.equal(completed.kindi.complete, true);
  assert.equal(completed.kindi.phase, 'complete');
  assert.equal(completed.manuscripts.includes('method-of-analysis'), true);
  assert.equal(knowledgeMultiplier(completed, 'translation'), 1.3);
  assert.equal(knowledgeMultiplier(completed, 'mathematics'), 1.1);
});

test('wrong Chronicle choices are forgiving and never create a fail state', () => {
  const state = createInitialState(0);
  state.kindi = { unlocked: true, phase: 'frequency', complete: false, selectedSymbol: null, substitution: null, attempts: 0 };
  const wrongSymbol = chooseKindiSymbol(state, '○', 0);
  assert.equal(wrongSymbol.kindi.phase, 'frequency');
  const rightSymbol = chooseKindiSymbol(wrongSymbol, '◆', 0);
  const compare = compareKindiFrequency(rightSymbol, 0);
  const wrongLetter = chooseKindiSubstitution(compare, 'rare', 0);
  assert.equal(wrongLetter.kindi.phase, 'substitution');
});
