# v0.3.1 Playtest Notes — The Long Darkness

## Launch

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a fresh session, select **New journey** at the bottom and confirm the local reset.

## Moderation rule

Do not explain the premise, skill tree, resources, or objective. Ask the player to think aloud. Intervene only for a technical failure, and record where that happened.

## Questions to answer

1. From the comic alone, do they understand that Baghdad has no dawn, the Darkness is persistent, and their quest is to restore light?
2. Do they understand the manuscript and hammer as two connected forms of progression without Al-Jahiz or Ignorance being named early?
3. Does the ghost’s broken speech create curiosity rather than narrative confusion?
4. Does the in-room speech bubble lead them through Inspect manuscript → Work → first reward → Knowledge → The First Letter without prompting?
5. Do House, Work, and Knowledge feel sufficient and distinct? Is the Satchel easier to understand than a fourth Inventory tab?
6. Do they understand why Language progress restores the ghost’s speech?
7. Is Al-Jahiz’s identity reveal satisfying, and does his humour feel appropriate?
8. Do timber and stone feel purposeful rather than like generic loot?
9. Does repairing the Keeper’s Desk and moving 100% → 99% feel meaningful rather than too small?
10. Do they understand that milestones—not repetitive grinding—push back Darkness?
11. At the end, can they explain Ignorance and why circulating copied manuscripts can restore the city?
12. What do they expect or want to restore next?

## Record for each session

- device and screen size
- language used
- time to enter, inspect the manuscript, reach the first insight, reveal Al-Jahiz, and restore the desk
- every point where the player pauses for more than 20 seconds
- mistaken assumptions about Knowledge, XP, materials, or activity auto-repeat
- emotional reaction to the comic, first joke, identity reveal, and Ignorance reveal
- whether they choose to continue interacting after the prologue end card

## Success gate

Test with 5–10 new players. Proceed to v0.4 only if most players:

- complete the prologue without explanation
- reach The First Letter through the tutorial without exploring the wrong screen
- understand their role and the two-tool premise
- describe the city as permanently dark and their quest as restoring light
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

The browser suite checks desktop, 768 × 1024 Arabic/RTL tablet, and 390 × 844 mobile layouts; narrated comic and guided first insight; three-section navigation and Satchel; the real six-second clock; progress-preserving v0.3 migration; Al-Jahiz reveal; desk restoration; the 100%→99% milestone; House memories; horizontal overflow; and page/console errors.

## Known constraints

- Saves are local to one browser profile and device.
- There is no sound pass.
- Character animation is intentionally minimal in this slice.
- The surrounding district changes visually but is not explorable.
- Manuscript copying/trade, Poetry, Translation, Mathematics, Architecture, markets, mining, herbalism, and Shadow confrontation are future paths.
- AI-generated bitmap assets are production prototypes and should receive a dedicated pixel-grid consistency pass before final release.
