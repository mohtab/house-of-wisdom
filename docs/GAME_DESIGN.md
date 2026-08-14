# Game Design v0.4 — The Day’s Work

House of Wisdom is a browser-first idle restoration mystery set in an alternate-history Abbasid Baghdad. Version 0.4 extends the guided first 10–15 minutes into the first complete return loop.

## Player fantasy

The player is a timeless, nameless researcher seeking knowledge. They restore a visible institution by recovering meaning, applying disciplines, and rebuilding spaces that let knowledge serve people again.

The player does not fight conventional monsters. Baghdad is trapped under permanent supernatural Darkness with no day/night cycle. Its environmental Shadows—Ignorance, Greed, Famine, Fear, and Forgetting—damage language, trust, resources, institutions, and memory.

## First-session promise

Read the narrated arrival → follow the in-room guide to the manuscript → turn Work into Knowledge → restore speech through Language → reveal Al-Jahiz → salvage purposeful materials → repair the Keeper’s Desk → move city Darkness from 100% to 99% → discover that circulating knowledge weakens Ignorance.

The desired emotional rhythm is mystery → comprehension → companionship → useful work → visible hope → larger threat.

## Full-game loop

A need appears → **Learn** what is needed → **Make** a useful response → **Serve** a person or district → clear today’s encroaching Darkness → invest the surplus to **Restore** permanently → unlock new needs, disciplines, people, and stories.

This loop works at three speeds: queue decisions over minutes, one civic need over a day, and permanent House and city restoration across the campaign. [CORE_GAME_LOOP.md](CORE_GAME_LOOP.md) is the authoritative mechanic specification.

The v0.3.1 prologue proves the first permanent restoration. v0.4 adds the queue, Scriptorium, and first Daily Need as a playable vertical slice.

## Implemented systems

- Knowledge as the opening intellectual resource
- Language, Translation, Mathematics, and Architecture XP foundations
- deterministic level thresholds and connected Language insights
- one ordered three-slot queue for timestamp-driven study, salvage, and civic work
- timber and stone as bounded restoration materials
- one repair recipe: the Keeper’s Desk
- progressively restored ghost dialogue and Al-Jahiz identity reveal
- one visible room restoration and district-light response
- one citywide Darkness meter with a permanent Campaign baseline and capped temporary Daily Encroachment
- Ignorance as an environmental effect and narrative antagonist
- House / Work / Knowledge navigation, a Satchel drawer, and story memories inside the House
- versioned local save with v0.1–v0.3.1 migration
- timestamp-based offline work capped at eight hours
- Arabic-first presentation, full English support, and RTL layout
- a Work queue shared by Learn, Make, and Serve tasks
- one authored Daily Need at a time, resolved by a linked Learn → Make → Serve chain
- a non-stacking three-point Daily Encroachment above a permanent Campaign Darkness baseline
- permanent Darkness reduction only through major Restore projects
- a short return report for completed offline work
- manuscript copying that preserves originals and lets copies serve the district
- a restored Scriptorium and relit eastern school

## Current content boundary

Playable now:

- narrated four-panel arrival comic
- speech-bubble tutorial through the first immediately affordable insight
- Language and Literature: letters, word roots, grammar, and eloquence
- four Language study activities
- timber and stone salvage
- Keeper’s Desk restoration
- Scriptorium restoration
- three-slot Work queue and return ledger
- eastern-school Daily Need: decipher, copy, and deliver a primer
- Campaign Darkness at 95% with a visible three-point daily layer
- Al-Jahiz reveal and first journal chapter
- Ignorance reveal and prologue ending

Visible but not playable:

- Poetry and Metre
- Translation
- Mathematics and Architecture

Deferred:

- a broader manuscript-copying catalogue, trade, full market, mining, expeditions, and free city exploration
- complete crafting and Architecture trees
- humanoid Shadows, combat, or battle system
- revised Al-Kindi chapter and Astronomy
- accounts, backend, cloud saves, multiplayer, monetization, achievements, streaks, and login rewards

## Design rules

- Game first, education second.
- Teach through interaction and consequences, not trivia.
- Make every resource answer a visible need.
- Categorize tasks by purpose—Learn, Make, Serve, Restore—not by discipline or frequency.
- Use one Work queue; Daily, Story, Repeatable, and disciplines are tags rather than extra menus.
- Give the city at most one unresolved Daily Need.
- Let temporary Darkness create direction without ever erasing permanent progress.
- Never stack missed days, expire civic needs, or punish absence with a broken streak.
- Always show what is running, how long remains, and what it rewards.
- Keep movement short and task-directed.
- Represent conflict environmentally before adding confrontation systems.
- Show knowledge changing institutions and communities, not acting like magic.
- Preserve one authoritative state model and one game clock.
- Expand only after new players want to know what happens next.

## Visual identity

The House uses deliberate 16-bit pixel art: deep indigo supernatural Darkness and dusty umber in the ruin, lit only by locally earned lamps and warming toward amber, turquoise, muted red, and green through restoration. A three-quarter cutaway room keeps the House as the visual focus. Najdi-inspired geometry, painted-door colours, borders, and pattern bands give the interface a distinctive regional graphic language.

This is a respectful creative synthesis, not a literal reconstruction of a lost building. Avoid generic fantasy-Arabia imagery, excessive gold, ornamental clutter, and orientalist shorthand. Arabic body text remains shaped, readable web text inside pixel-art frames.

See [CORE_GAME_LOOP.md](CORE_GAME_LOOP.md), [NARRATIVE_AND_ART_DIRECTION.md](NARRATIVE_AND_ART_DIRECTION.md), [VISUAL_ASSET_INVENTORY.md](VISUAL_ASSET_INVENTORY.md), and [ROADMAP.md](ROADMAP.md).
