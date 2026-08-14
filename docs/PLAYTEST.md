# v0.3 Playtest Notes — The First Word

## Launch

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a fresh session, select **New journey** at the bottom and confirm the local reset.

## Moderation rule

Do not explain the premise, skill tree, resources, or objective. Ask the player to think aloud. Intervene only for a technical failure, and record where that happened.

## Questions to answer

1. Within the opening comic, who do they think they are and what happened to the House?
2. Do they understand the manuscript and hammer as two connected forms of progression?
3. Does the ghost’s broken speech create curiosity or only confusion?
4. Do they discover the Study and Language screens without prompting?
5. Do they understand why Language progress restores the ghost’s speech?
6. Is Al-Jahiz’s identity reveal satisfying, and does his humour feel appropriate?
7. Do timber and stone feel purposeful rather than like generic loot?
8. Does repairing the Keeper’s Desk feel like a meaningful visible change?
9. Do they perceive Ignorance as an active threat without a battle system?
10. At the end, can they explain why the House was “silenced”?
11. What do they expect or want to restore next?

## Record for each session

- device and screen size
- language used
- time to first action, first word, Al-Jahiz reveal, and desk restoration
- every point where the player pauses for more than 20 seconds
- mistaken assumptions about Knowledge, XP, materials, or activity auto-repeat
- emotional reaction to the comic, first joke, identity reveal, and Ignorance reveal
- whether they choose to continue interacting after the prologue end card

## Success gate

Test with 5–10 new players. Proceed to v0.4 only if most players:

- complete the prologue without explanation
- understand their role and the two-tool premise
- describe Ignorance as a force acting against the House
- notice the room and district restoration
- want to restore another part of the House
- recognize the visual identity as distinctive and coherent

## Automated verification

```bash
npm test
npm run test:playthrough
npm run test:e2e
npm run build
```

The browser suite checks desktop, 768 × 1024 Arabic/RTL tablet, and 390 × 844 mobile layouts; the real six-second clock; save migration; the Al-Jahiz reveal; desk restoration; the journal ending; horizontal overflow; and page/console errors.

## Known constraints

- Saves are local to one browser profile and device.
- There is no sound pass.
- Character animation is intentionally minimal in this slice.
- The surrounding district changes visually but is not explorable.
- Poetry, Translation, Mathematics, Architecture, markets, mining, and Shadow confrontation are future paths.
- AI-generated bitmap assets are production prototypes and should receive a dedicated pixel-grid consistency pass before final release.
