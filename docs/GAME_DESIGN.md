# Game Design v0.5 — A Scholar’s Life

House of Wisdom is a browser-first idle restoration mystery set in an alternate-history Abbasid Baghdad. Version 0.5 preserves the guided narrative opening and rebuilds the repeatable game around a deliberate long-form grind, interconnected disciplines, persistent goals, and offline progression.

## Player fantasy

The player is a timeless, nameless researcher seeking knowledge. They arrive at an abandoned House, recover the Arabic needed to understand its ghostly guardian, and learn that Baghdad’s permanent supernatural Darkness is Ignorance given weight.

The player begins alone. Through study, copying, gathering, translation, calculation, service, and restoration, they rebuild the House into a functioning institution whose scholars and rooms can eventually work alongside them.

## Narrative promise

The manuscript restores meaning. The hammer restores its home. Knowledge defeats the Shadows only when it becomes culture, teaching, craft, fair exchange, or public infrastructure.

The environmental Shadows remain:

- Ignorance separates books, minds, and ideas.
- Greed hoards material and distorts exchange.
- Famine strains food, water, and health.
- Fear silences speech and public gathering.
- Forgetting severs people from connected memory.

## Main game loop

Choose a goal in the Scholar’s Ledger → select one Current Work activity → repeat it online or for up to 24 hours offline → gain resources, skill XP, and activity mastery → feed another skill → complete a civic or restoration task → push back Darkness and unlock more of the House, city, and story.

[CORE_GAME_LOOP.md](CORE_GAME_LOOP.md) is the authoritative mechanic specification.

## Implemented v0.5 systems

- fast four-panel opening and speech-bubble tutorial
- Arabic-first presentation, English support, RTL, desktop, tablet, and mobile layouts
- one repeating Current Work activity rather than a three-action queue
- 10, 100, or continuous repetition targets
- 24-hour offline simulation and aggregated return report
- persistent Scholar’s Ledger with Chronicle, Restoration, Civic, Research, and Daily categories
- three pinned goals used only for tracking
- six visible interconnected disciplines: Arabic, Scribing, Gathering, Translation, Mathematics, and Architecture
- story gating that reveals those disciplines in order
- discipline XP with a long level curve to 100
- activity-specific mastery to 100 with interval and output improvements
- Knowledge, timber, stone, ink, and manuscript-copy chains
- a long Scriptorium restoration requiring a day-scale grind
- persistent eastern-school request requiring one deciphering action and twenty copied and delivered primers
- Campaign Darkness at 96% after the Scriptorium and 95% after the school relights
- three renewable Daily Duties: 5,000 Knowledge, 100 Make actions, and 50 Serve actions
- three-point non-stacking Daily Encroachment
- save version 6 with migration from v0.4 and earlier supported formats

## Playable discipline scope

### Arabic Language

Trace letters, restore words, rebuild phrases, study eloquence, and teach reading. The original Arabic insight path still reveals Al-Jahiz before the long grind begins.

### Gathering

Recover timber and sort stone from the ruined House. Gathering supplies restoration and is the foundation for later quarrying and mining.

### Scribing

Prepare ink, copy primers, copy useful folios, preserve originals, and circulate copies. Ink is consumed when a copy is made.

### Translation

Unlocked after the eastern school relights. The current proof activity compares a Syriac passage and begins the road into Mathematics.

### Mathematics

Unlocked at Translation level 10. The current proof activity studies geometric measures.

### Architecture

Unlocked at Mathematics level 10. The current proof activity drafts a load-bearing arch.

## Current content boundary

Playable now:

- the complete First Word prologue
- Keeper’s Desk restoration
- multi-hour Scriptorium restoration
- eastern-school civic chain
- all six skill cards and their first dependency path
- repeating work, targets, offline returns, skill XP, mastery, items, tasks, pins, and Daily Duties

Still deliberately shallow:

- Translation, Mathematics, and Architecture each have only their first proof activity
- Scribing and Gathering have a small initial catalogue
- Daily Duties use fixed targets rather than a large authored pool
- no staffed room automation yet
- no random rare-discovery catalogue yet

Deferred:

- full market and Greed chapter
- quarrying, regional mining, and expeditions
- complete crafting and Architecture catalogues
- Herbalism, medicine, agriculture, and potions
- free city exploration
- humanoid Shadows, combat, or battle systems
- accounts, cloud saves, multiplayer, monetization, streaks, and login rewards

## Design rules

- Game first, education second.
- Embrace long automatic repetition as part of play.
- Make each grind action advance resource, skill XP, and mastery.
- Separate persistent goals from the activity currently running.
- Allow only one personal activity until restoration earns institutional automation.
- Keep the prologue fast; begin the hours-long grind only after the player understands the fantasy.
- Reveal disciplines through story milestones.
- Make every resource answer a visible need.
- Preserve originals and circulate copies.
- Let temporary Darkness provide a daily objective without erasing permanent progress.
- Show exactly why work stopped.
- Represent conflict environmentally before adding confrontation systems.

## Visual identity

The House retains its deliberate 16-bit identity: deep indigo supernatural Darkness, dusty umber ruins, earned amber light, turquoise and muted red accents, three-quarter cutaway architecture, and Najdi-inspired geometric interface bands. Arabic remains readable web text inside pixel-art frames.

See [CORE_GAME_LOOP.md](CORE_GAME_LOOP.md), [NARRATIVE_AND_ART_DIRECTION.md](NARRATIVE_AND_ART_DIRECTION.md), [VISUAL_ASSET_INVENTORY.md](VISUAL_ASSET_INVENTORY.md), and [ROADMAP.md](ROADMAP.md).
