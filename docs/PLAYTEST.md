# v0.2 Playtest Notes

## Launch

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a completely fresh session, use **New session** at the bottom of the game and confirm the local reset.

## What to ask playtesters

Do not explain the controls. Ask them to share their screen or record notes, then observe:

1. What do they think their role is?
2. How quickly do they begin Translation?
3. Do they trust the six-second timer and understand auto-repeat?
4. Do they notice Knowledge and XP as different forms of progress?
5. Do they understand why Mathematics unlocked?
6. Does the first priority feel like a choice or a test with a correct answer?
7. Can they complete Al-Kindi without outside cryptography knowledge?
8. Can they state what Method of Analysis changed?
9. Do they notice the House stages?
10. After the Scriptorium, do they understand what happens when they leave?

## Verified technical matrix

- Desktop: 1280px-wide automated browser playthrough and screenshot inspection
- Tablet: 768 × 1024 Arabic/RTL playthrough and screenshot inspection
- Mobile portrait: 390 × 844 research, House, navigation, touch targets, and overflow checks
- Real clock: six-second activity measured across React rerenders, in-game navigation, background browser-tab time, and return
- Runtime: no page or console errors during the verified browser suite
- Save: v0.2 serialization, corrupt-save fallback, v0.1 migration, and duplicate-load prevention tested
- Offline: timestamp calculation, repeated completions, and 8-hour cap tested

## Test commands

```bash
npm test
npm run test:playthrough
npm run test:e2e
npm run build
```

The end-to-end suite uses an installed Microsoft Edge executable by default. If Edge is installed elsewhere, update `playwright.config.ts` or use a compatible Chromium executable.

## Known playtest constraints

- Saves are local to one browser profile and device.
- There is no sound pass in v0.2.
- The House art is deliberately lightweight SVG/CSS illustration rather than final commissioned art.
- Astronomy and Al-Battani are teasers, not playable content.
- The first-session timing simulation follows an efficient activity path; human pacing varies.
