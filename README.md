# House of Wisdom

A browser-first idle restoration mystery set in an alternate-history Abbasid Baghdad.

Version 0.5, **A Scholar’s Life**, preserves the fast narrated prologue and introduces the long-form game: choose one repeating activity, progress for up to 24 hours offline, build interconnected disciplines, master individual actions, and complete persistent Ledger goals that restore the House and circulate knowledge through the city.

## Play

```powershell
npm install
npm run dev
```

Open the local address shown by Vite. Progress is stored on the current device and earlier prototype saves migrate automatically.

## Test

```powershell
npm test
npm run test:playthrough
npm run build
npm run test:e2e
```

## A Scholar’s Life

- One repeating **Current Work** activity rather than an action queue
- 10, 100, or continuous repetition targets
- 24-hour offline progression and return report
- Persistent **Scholar’s Ledger** with three pinned-goal slots
- Arabic, Gathering, Scribing, Translation, Mathematics, and Architecture
- Discipline levels and activity mastery to 100
- Story-gated skill dependencies
- Stackable ink and manuscript copies
- A day-scale Scriptorium restoration
- A twenty-copy eastern-school civic request
- Three substantial renewable Daily Duties and non-stacking temporary Darkness
- Permanent Campaign Darkness lowered only through service and restoration

The player grinds to recover knowledge, but progresses the story by putting that knowledge to work.

## Documentation

- [Core game loop](docs/CORE_GAME_LOOP.md)
- [Game design](docs/GAME_DESIGN.md)
- [Roadmap](docs/ROADMAP.md)
- [Narrative and art direction](docs/NARRATIVE_AND_ART_DIRECTION.md)
- [Visual asset inventory](docs/VISUAL_ASSET_INVENTORY.md)
- [Playtest guide](docs/PLAYTEST.md)

## Current boundary

The six-skill foundation is playable, but later disciplines remain intentionally shallow. Markets, staffed-room automation, mining regions, Herbalism, combat, accounts, and cloud saves are deferred until the core grind and return loop are validated.
