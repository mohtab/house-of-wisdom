# Core Game Loop — A Scholar’s Life

Status: approved direction implemented as the v0.5 systems foundation.

## Design goal

House of Wisdom is a long-form idle game about recovering, practicing, preserving, and circulating knowledge. Repetition is part of the fantasy. The player should regularly make one strategic decision: **what should the researcher spend the next several hours practicing?**

The complete loop is:

**Choose a goal → select one repeating activity → grind online or offline → gain resources, skill XP, and activity mastery → use one skill’s output in another → complete a civic or restoration task → unlock new knowledge, institutions, and story.**

```mermaid
flowchart LR
    A["Choose a Ledger goal"] --> B["Select Current Work"]
    B --> C["Repeat online and offline"]
    C --> D["Gain resources, skill XP, and mastery"]
    D --> E["Feed another skill"]
    E --> F["Serve or Restore"]
    F --> G["Darkness retreats and content unlocks"]
    G --> A
```

## Tasks and work are different systems

### Scholar’s Ledger

The Ledger is a persistent list of things worth accomplishing. It can hold many goals. Three may be pinned for convenient tracking, but pinning never schedules work.

| Category | Function | Examples |
| --- | --- | --- |
| Chronicle | main story and mysteries | recover Al-Jahiz’s identity |
| Restoration | permanent House and city projects | Keeper’s Desk, Scriptorium |
| Civic | finite requests from people and districts | relight the eastern school |
| Research | discipline and mastery milestones | reach Translation level 10 |
| Daily | renewable responses to temporary Darkness | study, make, and serve |

Progress is recognized automatically. A task may require several skill activities and remain in the Ledger across many sessions.

### Current Work

The researcher personally performs one activity at a time. It repeats until:

- the player stops it;
- a selected repetition target is reached;
- an input such as Knowledge, ink, or a manuscript runs out; or
- a one-time story step is complete.

The player may choose 10 repetitions, 100 repetitions, or continuous work. A later iteration may add exact resource targets and “until this pinned requirement is complete.”

Current Work continues while away for up to 24 hours. Returning players receive one concise report of cycles completed, resources gained, skill XP, mastery, items, Darkness cleared, and any blocker.

## The value of the grind

Long repetition is intentional, but it must never be empty. A normal action should advance at least three layers:

1. a resource or useful item;
2. the activity’s discipline XP;
3. that activity’s mastery.

It may also advance a Ledger task, clear temporary Darkness, or reveal a rare folio, marginal note, memory, diagram, or technique.

Pacing targets:

| Horizon | Intended result |
| --- | --- |
| seconds | one visible action and reward |
| minutes | the fast narrated prologue and first levels |
| several hours | daily duties, mastery gains, and a meaningful unlock |
| one day | enough Knowledge and material for a substantial project |
| several days | civic restoration or a new institutional ability |
| weeks | a discipline, district, Shadow, or chapter |

The first true grind is the Scriptorium: 6,000 Knowledge, 800 timber, and 600 stone. At base rates, gathering its requirements asks the player to change activities across a long day. The opening still reveals Al-Jahiz and repairs the Keeper’s Desk in roughly 10–15 minutes.

## Skills and dependencies

Six disciplines form the initial network:

| Skill | Primary function | Story gate |
| --- | --- | --- |
| Arabic Language | creates Knowledge and restores meaning | available in the prologue |
| Gathering | recovers timber, stone, reeds, and later ore | Al-Jahiz identified |
| Scribing | prepares ink, copies folios, and preserves originals | Scriptorium restored |
| Translation | carries ideas between scholarly traditions | eastern school relit |
| Mathematics | recovers measurement, geometry, and algebra | Translation level 10 |
| Architecture | turns calculations and material into structures | Mathematics level 10 |

The central dependency remains:

**Arabic → Translation → Mathematics → Architecture**

Gathering and Scribing cross-cut that line by providing the material and copied texts that let knowledge travel.

### Skill levels

Each discipline has a long level curve to 100. Levels unlock activities and later systems.

### Activity mastery

Every repeatable activity has mastery from 1 to 100. Mastery reduces that activity’s interval and, at checkpoints, increases Knowledge, material, or item output. This makes early activities remain worthwhile even after their discipline has advanced.

The first implementation deliberately omits a spendable mastery pool. It can be investigated only if plain levels and action mastery prove insufficient.

## Learn, Make, Serve, Restore

These are stages in the knowledge-production chain, not separate task menus:

- **Learn** creates understanding and discipline progress.
- **Make** turns understanding and material into something useful.
- **Serve** puts the result into another person’s hands.
- **Restore** creates permanent institutional capacity.

Accumulating Knowledge alone makes the researcher capable. Baghdad changes when that knowledge is preserved, circulated, applied, or built into an institution.

## Eastern-school civic proof

Restoring the Scriptorium reduces Campaign Darkness from 99% to 96% and opens a persistent civic request:

1. Decipher the damaged primer once.
2. Prepare ink and make twenty working copies while preserving the original.
3. Deliver all twenty copies.

The school then relights, Campaign Darkness falls permanently to 95%, Translation unlocks, and renewable Daily Duties begin on the next local day.

## Daily Darkness

Each later local day creates three renewable duties:

- **Daily Study:** create 5,000 Knowledge through Learn activities.
- **Daily Craft:** complete 100 Make actions.
- **Daily Service:** complete 50 Serve actions.

Each completed duty removes one point of temporary Daily Encroachment. Completing all three returns displayed Darkness to the permanent Campaign baseline.

Protective rules remain:

- missed days never stack multiple sets of duties;
- Daily Encroachment never changes Campaign Darkness;
- permanent restorations and inventory are never lost for absence;
- work done toward an unfinished duty still grants resources, XP, mastery, and items;
- there are no streaks or login rewards.

The daily layer supplies rhythm. Persistent Ledger goals remain the real long-term game.

## Institutional automation

The researcher begins alone and can personally perform only one activity. Later restoration should recruit people and convert rooms into carefully bounded parallel systems:

- Scriptorium copyists fulfill copying orders;
- Workshop crafts civic components;
- Garden grows herbs;
- Observatory records observations.

These are room or staff orders, not additional personal task queues. Automation is a reward for rebuilding the House into an institution.

## Story guardrails

- Keep the narrated opening fast and authored.
- Reveal skills through the story instead of exposing all systems at once.
- Frame quantities through people, institutions, and visible needs.
- Preserve originals; circulate copies.
- Make Darkness retreat when knowledge is applied, not merely hoarded.
- Keep Shadows environmental until a confrontation system is separately approved.
- Let the grind be long, automatic, and strategically chosen—but never meaningless.

## v0.5 validation questions

Test whether players can explain without prompting:

- the difference between a Ledger goal and Current Work;
- why only one personal activity runs at once;
- what skill, resource, mastery, and task progress an activity will produce;
- why the Scriptorium takes hours rather than minutes;
- how Arabic, Scribing, Translation, Mathematics, and Architecture depend on one another;
- why hoarded Knowledge does not restore a school until copies are delivered;
- what they will leave running and what they hope to unlock on return.
