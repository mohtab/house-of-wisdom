# The First Session and the Next Three Hours

Version 0.4 keeps the 10–15 minute prologue and implements the first complete loop beyond it. The broader three-hour arc remains gated by new-player and return-session testing.

## Prologue pacing guardrails

| Milestone | Target | Deterministic simulation |
| --- | ---: | ---: |
| Understand the premise | under 30 seconds | player-paced comic |
| Inspect the manuscript | under 45 seconds | player-paced guide |
| First Knowledge reward | 6 seconds after inspection | 0.1 minutes |
| Recover the first word | under 2 minutes | 0.1 minutes |
| Understand a complete sentence | under 7 minutes | 4.3 minutes |
| Reveal Al-Jahiz | under 10 minutes | 6.8 minutes |
| Gather the desk materials | under 13 minutes | 8.1 minutes |
| Restore the Keeper’s Desk | under 15 minutes | 9.6 minutes |

The deterministic simulation advances in one-second increments, chooses the newest useful Language activity, gathers exactly five timber and four stone, and uses the same game functions as the interface. It is a balance guardrail, not a promise about every human player.

## Implemented opening flow

1. View a narrated four-panel comic establishing Baghdad’s permanent Darkness and the quest to restore light.
2. Enter the ruined House with the torn manuscript and worn hammer.
3. Follow the researcher’s speech bubble to inspect the manuscript while the ghost remains unknown.
4. Trace letters for a first-discovery reward that immediately unlocks The First Letter.
5. Follow the guide to Knowledge, restore the first word, then continue roots, grammar, and tone.
6. Understand Al-Jahiz’s first complete joke and reveal his identity.
7. Salvage five timber and four stone from the room.
8. Gather 30 Knowledge and repair the Keeper’s Desk.
9. See one distant lamp answer and the Darkness meter fall from 100% to 99%.
10. Name Ignorance, record the recovered story inside the House, and foreshadow circulating manuscript copies.

## Economy notes

- Knowledge buys Language insights and the first restoration.
- Language XP controls when the next insight can be understood.
- Timber and stone appear only when Al-Jahiz identifies a concrete restoration need.
- Activities repeat using timestamp-based progression, including away time up to eight hours.
- The repaired desk grants +10% Knowledge to Language work, giving the restoration a lasting mechanical effect.
- No manuscript-copying economy, market, mining, generic loot, or secondary currencies are needed for this prologue.

## Implemented next slice — The Day’s Work

The first expansion proves the complete return loop with one room and one civic need:

1. The player plans Learn, Make, and Serve work in one three-slot queue.
2. Restoring the Scriptorium lowers permanent Campaign Darkness from 99% to 95% and unlocks Daily Needs.
3. The first need comes from an eastern-district school whose damaged primer can no longer be used.
4. Daily Encroachment temporarily raises current Darkness to 98%.
5. The player queues a clear three-step plan: decipher the primer, make a copy while preserving the original, and donate the copy.
6. Each completed step clears one encroachment point: 98% → 97% → 96% → 95%.
7. The school visibly relights and its people respond; the Scriptorium and 95% baseline remain permanently restored.
8. Repeatable work and Story projects remain available after the need is resolved. A later return presents a new need and a concise report of completed queued work.

An unfinished need waits indefinitely and Daily Encroachment never stacks. Missing a day cannot undo restoration, destroy resources, or break a streak.

The implementation deliberately postpones the full market, random daily generation, multiple solution paths, several rooms, and the broader Mathematics/Architecture economy. Greed is foreshadowed through circulation and hoarding, but does not yet have its own system.

Do not expand beyond this proof until players understand the queue, perceive the daily pressure as motivating rather than punitive, enjoy applying Knowledge to a person’s need, and choose work they want completed before returning.
