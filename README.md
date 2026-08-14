# House of Wisdom | بيت الحكمة

House of Wisdom is a browser-first restoration mystery set in an alternate-history Abbasid Baghdad. A nameless researcher enters a ruined House, finds a torn manuscript and worn hammer, and begins restoring meaning and place together.

Version 0.4, **The Day’s Work**, keeps the guided 10–15 minute prologue and adds the first repeatable return loop. The researcher restores the Scriptorium, plans Learn → Make → Serve work in a three-slot queue, and answers a school’s need while permanent progress remains safe from missed days.

## Play locally

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## The Day’s Work

- Arabic-first four-panel comic with live narration and complete English support
- Clear speech-bubble tutorial from manuscript inspection to the first Language insight
- Permanent citywide Darkness meter: 100% at arrival, 99% after the Keeper’s Desk
- Three primary sections—House, Work, and Knowledge—with Satchel inventory and House memories
- 16-bit room art, researcher sprite, Al-Jahiz ghost, and Najdi-inspired interface patterns
- Fragmented dialogue that becomes understandable through the Language tree
- Four opening Language insights: letters, roots, grammar, and eloquence
- Al-Jahiz identity reveal with progressively restored dialogue and dry humour
- One ordered three-slot Work queue that stops when the chosen plan is complete
- Learn, Make, and Serve task purposes, with Daily and discipline labels instead of new menus
- Timber and stone salvage using the same timestamp-driven queue
- One visible restoration: the Keeper’s Desk
- A second permanent restoration: the Scriptorium, lowering Campaign Darkness from 99% to 95%
- One authored Daily Need: decipher, copy, and deliver a primer to the eastern school
- Three non-stacking points of temporary Darkness, cleared from 98% back to the 95% baseline
- A return ledger listing completed tasks, gains, Darkness cleared, and any blocked task
- Ignorance introduced through the environment rather than combat
- Versioned local save, progress-preserving v0.3/v0.3.1 migration, and offline progression capped at 8 hours
- Responsive desktop, tablet, mobile, RTL, reduced-motion, and keyboard-focus presentation

The previous Al-Kindi/Mathematics slice remains useful design history but is no longer the playable opening.

## Validation

```bash
npm test
npm run test:playthrough
npm run test:e2e
npm run build
```

The deterministic playthrough guards the complete prologue against exceeding 15 minutes. Unit tests cover guided onboarding, queue ordering and limits, both Darkness layers, the Scriptorium and Daily chain, skill dependencies, resource spending, save migration, and offline limits. Browser tests cover the narrated comic, first insight, three-section navigation, Satchel, Al-Jahiz reveal, both restorations, the complete school chain, the return ledger, RTL, and responsive layouts.

## Scope boundary

Deliberately deferred from v0.4:

- a broader manuscript-copying catalogue, trading economy, full market, and mining
- free city exploration
- complete crafting and Architecture trees
- combat or humanoid Shadow forms
- Astronomy, Al-Battani, and the revised Al-Kindi chapter
- a larger authored pool of Daily Needs and alternative discipline solutions
- accounts, cloud saves, multiplayer, monetization, achievements, streaks, and login rewards

See [docs/CORE_GAME_LOOP.md](docs/CORE_GAME_LOOP.md), [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md), [docs/NARRATIVE_AND_ART_DIRECTION.md](docs/NARRATIVE_AND_ART_DIRECTION.md), [docs/ROADMAP.md](docs/ROADMAP.md), and [docs/PLAYTEST.md](docs/PLAYTEST.md).

## License

MIT. See [LICENSE](LICENSE).
