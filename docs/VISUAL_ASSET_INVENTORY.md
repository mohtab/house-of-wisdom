# Visual Asset Inventory

Status: approved production map. The static v0.3.1 permanent-Darkness asset set is integrated; animation atlases and final pixel-grid cleanup remain future polish.

The concept and integrated production sets are catalogued in [art/README.md](art/README.md). The current build uses static layered room and character assets plus CSS effects; the broader list below remains the map for later animation and restoration stages.

## Shared technical target

- pixel-art presentation inspired by 16-bit console games
- 16 px base environment tile
- 24 x 32 px provisional character frame
- integer display scaling and nearest-neighbour rendering
- three-quarter cutaway room composition
- short station-to-station character movement
- Arabic-first interface with readable non-bitmap body typography
- restrained ruin palette under permanent Darkness; warmth comes only from milestone-earned local lamps
- no sun, moon, stars, dusk, dawn, or automatic day/night lighting states

## P0 — style approval set

These references must be approved before production sprites are integrated.

| ID | Asset | Contents |
| --- | --- | --- |
| ART-001 | Visual style sheet | palette, materials, lighting, pixel density, Najdi-inspired border and motif samples |
| ART-002 | Researcher character sheet | front/three-quarter silhouette, idle, short walk, reading, inspecting, hammering, carrying |
| ART-003 | Al-Jahiz ghost sheet | unidentified silhouette, speaking, pointing, amused, fading, partially restored |
| ART-004 | Ruined hall key art | three-quarter cutaway room, desk, manuscript, hammer, arch, rubble, window and district view |
| ART-005 | Opening comic | four readable panels matching the approved prologue |
| ART-006 | UI direction sheet | dialogue frame, resource bar, skill node, inventory slot, button states, page border and dividers |
| ART-007 | Shadow of Ignorance sheet | missing-letter effect, severed connection, ink-darkness overlay, desaturation and recovery effect |

## P1 — v0.3 playable prologue

### Researcher sprites

- idle loop: 4 frames
- walk left/right: 6 frames plus mirrored use where appropriate
- read manuscript: 4 frames
- inspect object: 3 frames
- hammer repair: 6 frames
- lift/carry material: 4 frames
- receive Knowledge or understanding: 4 frames

### Al-Jahiz sprites

- unidentified idle float: 6 frames
- fragmented speech: 4 frames
- point toward manuscript: 4 frames
- amused reaction: 3 frames
- impatient reaction: 3 frames
- fade under Ignorance: 6 frames
- partial identity restoration: 6 frames
- dialogue portrait states: neutral, amused, concerned, evasive

### Room and architecture

- ruined hall background and collision/station map
- cracked plaster wall tiles
- exposed brick variants
- floor tile variants
- damaged arch and stabilized arch
- lattice window with the sky and city swallowed by supernatural Darkness
- broken desk and restored Keeper's Desk
- empty niche and manuscript niche
- rubble piles in three sizes
- damaged wooden beam and replacement beam
- dust, torn textile, broken pottery and scattered paper dressing
- distant Baghdad district: dark and first-light variants

### Items and resources

- worn hammer
- repaired hammer
- torn manuscript
- recovered manuscript page
- timber
- stone
- binding cord
- ink vessel
- writing reed
- simple tool bundle

### Interface

- main page frame
- top resource bar
- task card states: available, active, complete and obstructed
- dialogue frame with portrait slot
- obscured-dialogue treatment
- Language skill-tree node set
- connector states: hidden, severed, discovered and restored
- Satchel drawer, item slot and tooltip frame
- restoration requirement panel
- four-panel comic viewer with live Arabic/English narration boxes
- House / Work / Knowledge navigation and House memory accordion
- citywide Darkness percentage and milestone-light track
- primary and secondary button states
- Arabic/English language control
- accessibility focus, reduced-motion and high-contrast states

### Initial icons

- Language and Literature
- Translation
- Mathematics
- Architecture
- Knowledge
- Understanding
- Timber
- Stone
- Crafting
- Restoration
- Ignorance influence

### Effects

- ambient dust
- local lamp motes
- ghost glow
- fragmented-letter particles
- dark ink spread
- connection-restored pulse
- repaired-object dust burst
- warm-light return
- district window-light activation

### Sound placeholders for later production

- room wind and timber creak
- page movement
- ghost arrival and speech texture
- manuscript discovery cue
- hammer impact set
- restored-object cue
- Shadow reaction cue

Sound is listed for coordination but is not part of the first visual-production batch.

## P2 — House restoration expansion

- one ordered Work queue with clear Learn / Make / Serve markers, three visible slots, and reorder states
- one House-level Daily Need card with a three-step progress chain
- Campaign Darkness baseline marker plus three temporary Daily Encroachment segments
- compact offline return report for completed tasks, gains, changes, and blockers
- eastern-school dark, responding, and relit district states
- Scriptorium ruined, under-repair, and restored states
- preserved original manuscript and player-made copy item variants

- hall restoration stages: ruin, cleared, stabilized, working and flourishing
- Scriptorium, workshop, library and courtyard station sets
- Architecture skill-tree icons
- crafting recipes and workstation sprites
- returning scholar and artisan background sprites
- market-stall progression visible through the district
- Darkness-percentage milestone states with no day/night cycle
- Greed environmental influence and recovery states

## P3 — later chapters

- Famine environmental state: empty vessels, damaged gardens, dry channels and recovery
- Fear environmental state: shuttered spaces, absent crowds, muted speech and recovery
- Forgetting environmental state: erased names, missing silhouettes and disappearing architecture
- agriculture, irrigation, medicine and preservation item sets
- district chapter map and state variants
- Chronicle-specific portraits, manuscripts and interaction assets
- potential Shadow confrontation forms only after a battle-system design is approved

## Najdi-inspired motif library

Create a reusable, documented set rather than decorating every surface independently:

- stepped triangles and chevrons
- diamond and lozenge grids
- painted-door colour blocks
- narrow horizontal wall bands
- textile-inspired borders
- geometric corner pieces
- monochrome and full-colour variants

These motifs belong primarily in interface frames, textiles, doors, dividers, and selected interior bands. They should complement rather than overwrite the alternate-history Abbasid architectural setting.

## Production sequence

1. Approve ART-001 through ART-007 as a coherent concept set.
2. Lock the palette, base tile, sprite proportions and room perspective.
3. Redraw production sprites on a strict pixel grid.
4. Export atlases and still assets with stable names.
5. Integrate only the v0.3 prologue assets.
6. Verify Arabic, English, desktop, tablet, mobile and reduced-motion presentation.
7. Expand the asset library only after the playable prologue is tested.

## Acceptance criteria

- The visual identity is recognizable without relying on the title or explanatory text.
- The researcher and Al-Jahiz remain readable at mobile scale.
- The room communicates its restoration state at a glance.
- Ignorance is visible as an environmental force without needing a humanoid enemy.
- Najdi-inspired motifs feel systematic rather than decorative noise.
- Arabic text remains comfortable to read.
- Every required v0.3 state has a production asset or an explicitly approved procedural effect.
