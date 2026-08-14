import assert from 'node:assert/strict';
import {
  activities,
  advanceGame,
  beginKindi,
  buyResearch,
  chooseKindiPlaintext,
  chooseKindiSubstitution,
  chooseKindiSymbol,
  compareKindiFrequency,
  createInitialState,
  hasResearch,
  levelForXp,
  researchAvailable,
  researchNodes,
  selectActivity,
  startGame,
  type GameState,
} from '../src/game.ts';

type Milestone = { name: string; minute: number; knowledge: number; translation: number; mathematics: number };

let now = 0;
let state = startGame(createInitialState(now), now);
const milestones: Milestone[] = [];

function record(name: string) {
  milestones.push({
    name,
    minute: Math.round((now / 60_000) * 10) / 10,
    knowledge: Math.round(state.knowledge * 10) / 10,
    translation: levelForXp(state.xp.translation),
    mathematics: levelForXp(state.xp.mathematics),
  });
}

function bestAvailableActivity() {
  const gatedDiscipline = hasResearch(state, 'mathematics') && levelForXp(state.xp.mathematics) < 5
    ? 'mathematics'
    : levelForXp(state.xp.translation) < 4
      ? 'translation'
      : null;
  return activities
    .filter((activity) => activity.discipline !== 'astronomy'
      && (!gatedDiscipline || activity.discipline === gatedDiscipline)
      && activityAvailableForState(state, activity.id))
    .sort((a, b) => (b.knowledge / b.durationMs) - (a.knowledge / a.durationMs))[0];
}

function activityAvailableForState(candidate: GameState, id: string) {
  const activity = activities.find((item) => item.id === id)!;
  return levelForXp(candidate.xp[activity.discipline]) >= activity.minLevel
    && (!activity.requiresResearch || hasResearch(candidate, activity.requiresResearch));
}

function advanceSeconds(seconds: number) {
  now += seconds * 1_000;
  state = advanceGame(state, now).state;
}

function selectBest() {
  const activity = bestAvailableActivity();
  if (activity && state.activeActivityId !== activity.id) state = selectActivity(state, activity.id, now);
}

function waitUntilResearch(id: string, maximumMinutes: number) {
  const node = researchNodes.find((candidate) => candidate.id === id)!;
  const deadline = now + maximumMinutes * 60_000;
  while (!(researchAvailable(state, node) && node.cost !== null && state.knowledge >= node.cost)) {
    selectBest();
    advanceSeconds(1);
    if (now > deadline) throw new Error(`Playthrough stalled before ${id}`);
  }
  state = buyResearch(state, id, now);
  record(id);
}

advanceSeconds(6);
assert.equal(state.knowledge, 1);
record('first reward');
waitUntilResearch('desk', 6);
waitUntilResearch('mathematics', 12);
state = selectActivity(state, 'numerals', now);
waitUntilResearch('follow', 18);
waitUntilResearch('language', 40);

state = beginKindi(state, now);
state = chooseKindiSymbol(state, '◆', now);
state = compareKindiFrequency(state, now);
state = chooseKindiSubstitution(state, 'common', now);
state = chooseKindiPlaintext(state, 'correct', now);
record('Al-Kindi complete');
assert.equal(state.kindi.complete, true);

waitUntilResearch('scriptorium', 55);
assert.equal(hasResearch(state, 'scriptorium'), true);
assert.ok(milestones.find((milestone) => milestone.name === 'desk')!.minute <= 5);
assert.ok(milestones.find((milestone) => milestone.name === 'mathematics')!.minute >= 6);
assert.ok(milestones.find((milestone) => milestone.name === 'mathematics')!.minute <= 11);
assert.ok(milestones.find((milestone) => milestone.name === 'language')!.minute >= 25);
assert.ok(milestones.find((milestone) => milestone.name === 'language')!.minute <= 38);
assert.ok(milestones.find((milestone) => milestone.name === 'scriptorium')!.minute <= 52);

console.table(milestones);
console.log(`First-session simulation complete in ${(now / 60_000).toFixed(1)} minutes.`);
