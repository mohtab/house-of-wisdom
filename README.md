# House of Wisdom | بيت الحكمة

House of Wisdom is a browser-first restoration mystery set in an alternate-history Abbasid Baghdad. A nameless researcher enters a ruined House, finds a torn manuscript and worn hammer, and begins restoring meaning and place together.

Version 0.3, **The First Word**, is a polished 10–15 minute prologue. It introduces the unidentified ghost of Al-Jahiz, Arabic Language and Literature as the first skill tree, a small timber-and-stone salvage loop, the Keeper’s Desk restoration, and Ignorance as the first environmental Shadow.

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

## The First Word

- Arabic-first four-panel opening comic with complete English support
- 16-bit room art, researcher sprite, Al-Jahiz ghost, and Najdi-inspired interface patterns
- Fragmented dialogue that becomes understandable through the Language tree
- Four opening Language insights: letters, roots, grammar, and eloquence
- Al-Jahiz identity reveal with progressively restored dialogue and dry humour
- Timber and stone salvage using the real-time auto-repeat activity system
- One visible restoration: the Keeper’s Desk
- Ignorance introduced through the environment rather than combat
- Versioned local save, v0.1/v0.2 migration, and offline progression capped at 8 hours
- Responsive desktop, tablet, mobile, RTL, reduced-motion, and keyboard-focus presentation

The previous Al-Kindi/Mathematics slice remains useful design history but is no longer the playable opening.

## Validation

```bash
npm test
npm run test:playthrough
npm run test:e2e
npm run build
```

The deterministic playthrough guards the complete prologue against exceeding 15 minutes. Unit tests cover rewards, real elapsed time, auto-repeat, skill dependencies, resource spending, save migration, and offline limits. Browser tests cover the Arabic-first comic, the six-second real-time loop, Al-Jahiz reveal, Keeper’s Desk restoration, Ignorance reveal, English/Arabic switching, RTL, and desktop/tablet/mobile layouts.

## Scope boundary

Deliberately deferred from v0.3:

- full market economy and mining
- free city exploration
- complete crafting and Architecture trees
- combat or humanoid Shadow forms
- Astronomy, Al-Battani, and the revised Al-Kindi chapter
- accounts, cloud saves, multiplayer, monetization, achievements, and daily rewards

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md), [docs/NARRATIVE_AND_ART_DIRECTION.md](docs/NARRATIVE_AND_ART_DIRECTION.md), [docs/ROADMAP.md](docs/ROADMAP.md), and [docs/PLAYTEST.md](docs/PLAYTEST.md).

## License

MIT. See [LICENSE](LICENSE).
