# House of Wisdom | بيت الحكمة

> **Experimental v0.1 validation prototype.** The goal is to prove the core idle loop and historical-story concept before expanding the game.

House of Wisdom is a browser-first idle game about rebuilding a House of Knowledge through study, research, offline progression, and historically grounded Chronicles inspired by figures from the Arabic scientific tradition.

## Play the prototype

The fastest way to try the current build is to open:

`standalone-prototype.html`

It is a zero-dependency build intended for early playtesting.

## Current slice

- Translation → Mathematics progression
- Knowledge currency + discipline XP/levels
- Auto-repeating study activities
- Local save and 8-hour offline progression
- Research unlocks and visible House restoration
- Al-Kindi: The Cipher Chronicle
- Astronomy unlock and Al-Battani teaser
- English/Arabic UI toggle with RTL handling
- Installable PWA shell
- Save export/import and local reset

## Run the React prototype locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The React/Vite source is the intended long-term implementation. The standalone HTML build is the currently verified playtest artifact.

## Product rule

Do not expand the game because the ideas are exciting. Expand only after this slice is fun enough that players return and ask for more.

## What we are deliberately not building yet

- additional disciplines beyond the validation slice
- multiplayer or social systems
- mod/plugin frameworks
- backend accounts or cloud saves
- monetization systems
- native mobile packaging
- large architectural abstractions

## Contributing

This project is open source and intentionally early. Bug fixes, balance observations, accessibility work, Arabic/RTL improvements, historical sourcing corrections, and small UI improvements are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing larger features.

## License

MIT. See [LICENSE](LICENSE).
