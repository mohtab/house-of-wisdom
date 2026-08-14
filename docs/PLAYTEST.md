# v0.4 Playtest Notes — The Day’s Work

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
10. Do they understand that Restore projects lower Campaign Darkness permanently while Daily tasks clear only temporary encroachment?
11. At the end, can they explain Ignorance and why circulating copied manuscripts can restore the city?
12. What do they expect or want to restore next?

## Record for each session

- device and screen size
- language used
- time to enter, inspect the manuscript, reach the first insight, reveal Al-Jahiz, and restore the desk
- every point where the player pauses for more than 20 seconds
- mistaken assumptions about Knowledge, XP, materials, queue order, or the two Darkness layers
- emotional reaction to the comic, first joke, identity reveal, and Ignorance reveal
- what they queue before leaving and whether they return curious about the result

## Success gate

Test the prologue with 5–10 new players. Keep the v0.4 expansion only if most players:

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

The browser suite checks desktop, 768 × 1024 Arabic/RTL tablet, and 390 × 844 mobile layouts; narrated comic and guided first insight; three-section navigation and Satchel; the real six-second clock; progress-preserving migration; Al-Jahiz reveal; both restorations; the complete school queue; the return ledger; both Darkness layers; House memories; horizontal overflow; and page/console errors.

## Known constraints

- Saves are local to one browser profile and device.
- There is no sound pass.
- Character animation is intentionally minimal in this slice.
- The surrounding district changes visually but is not explorable.
- Broader manuscript copying and trade, Poetry, Translation, Mathematics, Architecture, markets, mining, Herbalism, and Shadow confrontation are future paths.
- AI-generated bitmap assets are production prototypes and should receive a dedicated pixel-grid consistency pass before final release.

## v0.4 return-loop test

Use a fresh save for the first session and return to the same save on a later calendar day. Observe rather than explain.

Test whether players can:

- distinguish Learn, Make, Serve, and Restore from their purpose and icons;
- predict the order and result of the three-slot queue;
- use **Queue this plan** for the eastern school without losing control of the queue;
- explain why current Darkness rose above the permanent Campaign Darkness baseline;
- clear the three encroachment points and recognize that the 95% baseline is permanent;
- understand that an unfinished Daily Need will wait and missed days will not stack;
- connect the preserved original, donated copy, and relit school;
- choose what should run while they are away and express curiosity about the next return.

Reject or simplify the mechanic if players describe it as upkeep, fear missing a day, confuse temporary encroachment with lost restoration, or cannot tell why a completed task helped the city.
