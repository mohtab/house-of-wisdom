import assert from 'node:assert/strict';
import {
  activities,
  advanceGame,
  buyLanguageSkill,
  canRepairDesk,
  createInitialState,
  deskRequirements,
  hasSkill,
  languageSkills,
  levelForXp,
  repairKeeperDesk,
  selectActivity,
  skillAvailable,
  startGame,
  type GameState,
} from '../src/game.ts';

type Milestone = {
  name: string;
  minute: number;
  knowledge: number;
  languageLevel: number;
  timber: number;
  stone: number;
};

let now = 0;
let state = startGame(createInitialState(now, 'en'), now);
const milestones: Milestone[] = [];

function record(name: string) {
  milestones.push({
    name,
    minute: Math.round((now / 60_000) * 10) / 10,
    knowledge: Math.round(state.knowledge * 10) / 10,
    languageLevel: levelForXp(state.xp.language),
    timber: state.materials.timber,
    stone: state.materials.stone,
  });
}

function advanceSeconds(seconds: number) {
  now += seconds * 1_000;
  state = advanceGame(state, now).state;
}

function preferredStudy() {
  if (hasSkill(state, 'grammar')) return 'study-eloquence';
  if (hasSkill(state, 'word-roots')) return 'copy-phrase';
  if (hasSkill(state, 'first-letter')) return 'restore-word';
  return 'trace-letters';
}

function select(id: string) {
  if (state.activeActivityId !== id) state = selectActivity(state, id, now);
}

function waitForSkill(id: string, deadlineMinutes: number) {
  const skill = languageSkills.find((candidate) => candidate.id === id);
  assert.ok(skill && skill.cost !== null, `Missing playable skill ${id}`);
  const deadline = deadlineMinutes * 60_000;
  while (!(skillAvailable(state, skill) && state.knowledge >= skill.cost)) {
    select(preferredStudy());
    advanceSeconds(1);
    if (now > deadline) throw new Error(`Playthrough stalled before ${id}`);
  }
  state = buyLanguageSkill(state, id, now);
  record(id);
}

advanceSeconds(6);
assert.equal(state.knowledge, 1);
record('first reward');

waitForSkill('first-letter', 1.5);
waitForSkill('word-roots', 4);
waitForSkill('grammar', 7);
waitForSkill('eloquence', 10);
assert.equal(state.ghostIdentityRevealed, true);

while (state.materials.timber < deskRequirements.timber) {
  select('salvage-timber');
  advanceSeconds(1);
}
record('timber recovered');

while (state.materials.stone < deskRequirements.stone) {
  select('sort-stone');
  advanceSeconds(1);
}
record('stone recovered');

while (state.knowledge < deskRequirements.knowledge) {
  select('study-eloquence');
  advanceSeconds(1);
}

assert.equal(canRepairDesk(state), true);
state = repairKeeperDesk(state, now);
record('Keeper desk repaired');

assert.equal(state.prologueComplete, true);
assert.equal(state.ignoranceRevealed, true);
assert.ok(activities.every((activity) => activity.durationMs >= 6_000));
assert.ok(milestones.find((item) => item.name === 'first-letter')!.minute <= 1.5);
assert.ok(milestones.find((item) => item.name === 'word-roots')!.minute <= 4);
assert.ok(milestones.find((item) => item.name === 'grammar')!.minute <= 7);
assert.ok(milestones.find((item) => item.name === 'eloquence')!.minute <= 10);
assert.ok(milestones.find((item) => item.name === 'Keeper desk repaired')!.minute <= 15);

console.table(milestones);
console.log(`The First Word playthrough completes in ${(now / 60_000).toFixed(1)} minutes.`);
