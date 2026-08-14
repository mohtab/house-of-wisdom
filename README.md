# House of Wisdom | بيت الحكمة

House of Wisdom is a browser-first idle game about restoring a neglected House of Knowledge through study, research, and historically grounded Chronicles.

Version 0.2 is a polished first-session vertical slice. It begins with one damaged folio and ends with Al-Kindi’s Method of Analysis, a restored Scriptorium, and a clear explanation of offline work.

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

The React + TypeScript application is the only game implementation. The former standalone HTML prototype was removed in v0.2 so timing, balance, saves, and content cannot diverge.

## First-session slice

- Progressive opening: a neglected room, one manuscript, and one clear action
- Translation and Mathematics activities with smooth timestamp-driven auto-repeat
- Knowledge, discipline XP, levels, and visible next-level progress
- A compact connected research path with one exclusive first-priority choice
- Four visible House stages: neglected room, restored desk, improving library, restored Scriptorium
- Al-Kindi’s Cipher as a forgiving frequency-analysis interaction
- Permanent Method of Analysis reward: +10% Knowledge from every discipline
- Local versioned save, v0.1 save migration, and timestamp-based offline production capped at 8 hours
- English and Arabic UI with persistent progress and RTL layout
- Responsive desktop, tablet, and 390px mobile layouts
- Astronomy and Al-Battani shown only as future paths

## Verified pacing

The deterministic fresh-save simulation currently reaches:

| Milestone | Simulated active time |
| --- | ---: |
| First reward | 0:06 |
| Restore the desk | 3.2 minutes |
| Unlock Mathematics | 8.4 minutes |
| First priority choice | 12.2 minutes |
| Discover and complete Al-Kindi | 27.5 minutes plus player interaction |
| Restore the Scriptorium | 37.9 minutes |

These are playtest targets, not guarantees. A player who deliberately selects lower-output activities will take longer.

## Validation

```bash
npm test
npm run test:playthrough
npm run test:e2e
npm run build
```

The logic suite covers duration, rewards, auto-repeat, XP and levels, research, modifiers, offline time and its cap, duplicate prevention, saves, and Al-Kindi’s permanent reward. The browser suite covers the real six-second clock across rerenders and browser-tab switching, the research choice, Chronicle interaction, console errors, English/Arabic switching, RTL, and desktop/tablet/mobile layouts.

## Product rule

Do not expand the game because the ideas are exciting. Expand only after this slice is enjoyable enough that players return and ask for more.

## Deliberately deferred

- Al-Battani’s complete Chronicle and an active Astronomy loop
- Optics and Ibn al-Haytham
- other disciplines, expeditions, and recruitable scholars
- accounts, backend, cloud saves, multiplayer, monetization, achievements, and daily rewards

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md), [docs/FIRST_3_HOURS.md](docs/FIRST_3_HOURS.md), and [docs/PLAYTEST.md](docs/PLAYTEST.md) for the authoritative slice and test notes.

## License

MIT. See [LICENSE](LICENSE).
