# Contributing

House of Wisdom v0.2 is validating one first-session slice. Contributions should make that slice clearer, more reliable, more beautiful, or more historically responsible without expanding its systems.

Useful contributions include:

- clock, save, offline-progress, and duplicate-reward fixes
- balance observations from a complete fresh-save session
- accessibility and Arabic/RTL improvements
- historical sourcing corrections
- focused visual and interaction improvements

Before opening a change, run:

```bash
npm install
npm test
npm run test:playthrough
npm run test:e2e
npm run build
```

Please do not add disciplines, scholars, expeditions, multiplayer, mod frameworks, a backend, accounts, monetization, achievements, or daily rewards until the current slice is validated.
