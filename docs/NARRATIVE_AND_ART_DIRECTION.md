# Narrative and Art Direction

Status: approved v0.3.1 direction implemented. Focused human validation of the clearer tutorial and permanent-Darkness premise remains open.

## Creative premise

House of Wisdom is a 16-bit restoration mystery set in an alternate-history Abbasid Baghdad. A timeless, unknown researcher arrives seeking knowledge and finds a city under a supernatural Darkness that never lifts. There is no day/night cycle. The ruined House is the first place from which light may return.

The player restores two things in parallel:

- meaning, through language, study, translation, and culture
- the institution, through salvage, crafting, mathematics, and architecture

The emotional arc begins mysterious and melancholic, then becomes increasingly warm, playful, and hopeful as knowledge and people return.

## The player

The researcher has no fixed name, origin, gender, or historical identity. The sprite should be visually readable but deliberately open enough for the player to inhabit.

Movement is intentionally limited. The player selects a station or task and watches the researcher walk a short path to read, inspect, carry, craft, or repair. House of Wisdom remains an idle and progression game rather than becoming a movement simulator.

## Al-Jahiz, the unidentified ghost

The first companion is the ghost of Al-Jahiz, but the player initially knows him only as The Ghost.

The Shadow of Ignorance has fragmented his speech and damaged the records that identify him. Early dialogue contains missing, obscured, or displaced words. Progress through the Language tree restores meaning. His identity is revealed only after the player can understand his introduction and read his name in a recovered manuscript.

Al-Jahiz should be:

- perceptive, curious, sociable, and occasionally vain
- warm enough to become a lasting companion
- humorous without becoming a modern joke machine
- willing to puncture solemn moments with dry observations
- an unreliable witness because parts of his memory are missing

His fictional presence in the House is part of the alternate-history premise and must not be presented as a documented historical fact.

Example tone:

> You came seeking knowledge? Excellent. I was beginning to suspect the rubble had more curiosity than the living.

## The Shadows

The main antagonists are environmental personifications of forces that diminish human flourishing. They are not conventional monsters and do not yet have humanoid bodies.

Their influence appears in architecture, light, sound, manuscripts, resources, institutions, and the behaviour of the surrounding city. A future battle or confrontation system may give them more direct forms, but that system is deliberately deferred.

### Ignorance

The first Shadow. Ignorance has gained physical weight and covered Baghdad. It removes relationships between ideas, isolates books and minds, and makes unfamiliar knowledge feel threatening. Al-Jahiz names it only after the player can understand him.

Its visual language includes missing letters, severed skill-tree connections, ink-like darkness, muted colour, contradictory annotations, and speech that cannot be understood.

The player weakens it through language, teaching, translation, open inquiry, and access to manuscripts.

### Greed

Greed hoards manuscripts, tools, food, and building materials. It appears through locked collections, distorted prices, empty public shelves, overfilled private stores, and deals that trade long-term restoration for immediate gain.

The player weakens it through fair exchange, shared institutions, civic trust, and choices that make knowledge and resources available to others.

### Famine

Famine appears through empty vessels, dust, failed gardens, abandoned streets, and a shrinking community. It cannot be solved by accumulating abstract Knowledge alone.

The player weakens it by applying agriculture, irrigation, mathematics, medicine, preservation, engineering, and distribution.

### Fear

Fear silences scholars, prevents residents from returning, and turns uncertainty into suspicion.

The player weakens it through poetry, storytelling, philosophy, debate, preserved testimony, and institutions where inquiry is protected.

### Forgetting

Forgetting is the slow, overarching Shadow. It erases names, relationships, achievements, and eventually the House itself. Recovering the memories behind the other Shadows gradually reveals why the House was abandoned.

## Four-panel prologue

### Panel 1 — The destination

Beneath a sky with no dawn, the researcher crosses the edge of Baghdad carrying a small satchel. The House of Wisdom is visible beyond the unlit street, dark and partially collapsed. The surrounding district is silent.

### Panel 2 — Two tools

Inside the ruined hall, the researcher’s small lamp reveals rubble, a worn hammer, and a torn manuscript on a broken desk. No celestial light enters the room.

### Panel 3 — The impossible greeting

A translucent scholar appears. He speaks, but his words fragment into disconnected Arabic letters and dark ink-like gaps. He gestures impatiently toward the manuscript.

### Panel 4 — The decision

The researcher takes the manuscript in one hand and the hammer in the other. Their lamp is the only warm point in the room. The quest is clear: bring light back to Baghdad.

## v0.3.1 opening sequence: The First Word

The first implementation target is a focused 10–15 minute prologue:

1. View four narrated panels establishing the city without dawn, the Darkness, the unknown guardian, and the two tools. Neither Al-Jahiz nor Ignorance is named yet.
2. Enter the ruined House.
3. Encounter the unidentified ghost and fail to understand him.
4. Follow the researcher’s speech bubble to inspect the torn manuscript; Work begins automatically.
5. Receive the first-discovery reward after six seconds and follow the guide to Knowledge.
6. Understand The First Letter immediately, then continue the Language tree.
7. Recover the ghost's first complete word.
8. Understand his first complete sentence and first joke.
9. Salvage timber and stone from the room.
10. Repair the Keeper's Desk with the hammer.
11. Learn that the Darkness is Ignorance given weight; see the citywide meter fall from 100% to 99%.
12. End with the need to circulate knowledge through copied manuscripts, trade, and donation.

No manuscript-copying economy, mining, full market, city traversal, or battle system is required for this slice; those systems are foreshadowed only.

## Core progression loop

Decode a message -> understand a need -> study the required discipline -> salvage or obtain materials -> craft or repair -> restore part of the House -> attract people back -> weaken a Shadow -> recover a memory.

## Knowledge progression

The first discipline is Arabic Language and Literature. The Shadow is disrupting the ghost's speech; the mechanic does not imply that the human player or researcher lacks ordinary Arabic literacy.

Initial Language branches:

- letters and sounds
- spelling and word roots
- grammar and meaning
- rhetoric and eloquence
- poetry and metre
- translation and manuscript interpretation

Translation opens access to works carried through Greek, Syriac, Persian, and other scholarly traditions. Mathematics grows from that exchange and becomes a requirement for advanced Architecture.

Provisional dependency:

Language -> Translation -> Mathematics -> Architecture

Architecture then branches into structural repair, geometric ornament, water systems, and advanced construction. Other disciplines can later connect to this foundation rather than forming isolated skill trees.

## Material progression

The opening uses a deliberately small physical economy:

- salvage timber and stone from the ruined room
- recover and repair the hammer
- craft or rebuild the Keeper's Desk
- stabilize one wall or arch

A market becomes useful after people begin returning to the surrounding district. Mining belongs to later expeditions or regional supply systems and should not be added to the prologue.

## House and city

The playable focus remains inside the House. The surrounding Baghdad district is visible through windows, skyline layers, and a chapter map.

Restoration changes both spaces:

- lights reappear in neighbouring buildings
- market stalls reopen
- pedestrians and scholars return as small background sprites
- gardens and water features recover
- each Shadow alters the district's colour, weather, and activity

This communicates social impact without requiring free city exploration.

## Visual identity

The visual identity is an alternate-history Abbasid world rendered in deliberate 16-bit pixel art, with a Najdi-inspired graphic and decorative language.

- House architecture draws from Abbasid Baghdad rather than claiming to reconstruct a specific lost building.
- Najdi-inspired geometry, painted-door colour, wall motifs, textiles, borders, and icon framing give the interface its distinctive personality.
- The art direction must state clearly that this is a regional creative synthesis, not a literal historical reconstruction.
- Arabic is the primary presentation language, with complete English support.
- Arabic body copy uses a highly readable shaped font inside pixel-art frames; it should not be forced into an illegible bitmap typeface.

## Visual-production rules

- Use a 16 px base tile and integer scaling wherever practical.
- Use a three-quarter cutaway room rather than free-roaming top-down space.
- Keep player movement short and task-directed.
- Reserve high saturation and warm light for restored spaces.
- Represent Shadows through environmental corruption before designing bodies.
- Use crisp pixel edges, a restrained palette, and no smoothing on game sprites.
- Avoid generic fantasy-Arabia imagery, excessive gold, ornamental clutter, and orientalist shorthand.

## Narrative guardrails

- Knowledge is applied through people and institutions; it is not a magic resource that automatically solves famine or injustice.
- The antagonists represent harmful forces, not cultures, religions, ethnicities, or classes of people.
- Historical figures retain recognizable intellectual interests and human complexity.
- Humour comes from character and observation, not mockery of language or historical cultures.
- Restoration is hopeful, but it should require choices, trade-offs, and collaboration.
