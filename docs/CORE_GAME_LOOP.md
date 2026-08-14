# Core Game Loop — The Day’s Work

Status: approved full-game backbone. v0.4 implements its first vertical slice: one three-slot queue, the Scriptorium, and the eastern-school Daily Need.

## Design goal

House of Wisdom should give the player a reason to return without turning Baghdad into a checklist or punishing time away. Every return should present one understandable need, useful work already completed, and a meaningful choice about what to do next.

The complete loop is:

**A need appears → Learn what is needed → Make a useful response → Serve a person or district → push back today’s Darkness → invest the surplus to Restore permanently → unlock new needs, disciplines, people, and stories.**

```mermaid
flowchart LR
    A["A need appears"] --> B["Choose a response"]
    B --> C["Learn"]
    C --> D["Make"]
    D --> E["Serve"]
    E --> F["Daily Darkness retreats"]
    F --> G["Restore House or city"]
    G --> H["Campaign Darkness falls"]
    H --> I["New people, skills, and stories"]
    I --> A
```

## Why the player returns

The game operates on three connected horizons:

| Horizon | Player question | Reward |
| --- | --- | --- |
| Minutes | What should I put in the queue next? | completed work, resources, and visible activity |
| A day | How can my knowledge help this need? | today’s encroaching Darkness is cleared |
| Campaign | Which part of the House or city should I restore? | permanent light, new spaces, disciplines, people, and story |

Enjoyment should come from planning useful work, returning to satisfying results, seeing the city respond, and discovering new combinations of knowledge. It should not depend on streak anxiety, repetitive tapping, or losing progress while away.

## One task language

Tasks are categorized by their purpose. This remains understandable as the discipline list grows.

| Type | What the player does | Mechanical role | Examples |
| --- | --- | --- | --- |
| **Learn** | studies, decodes, translates, or investigates | creates Knowledge and discipline XP | decipher a primer, study water measurements |
| **Make** | copies, crafts, prepares, brews, or builds | converts Knowledge and materials into a useful thing | copy a manuscript, prepare a remedy |
| **Serve** | teaches, donates, delivers, trades fairly, or repairs | applies that useful thing to a person or district | deliver primers to a school, repair a public well |
| **Restore** | completes a major House or civic project | permanently changes the world and lowers Campaign Darkness | restore the Scriptorium, reopen a library |

**Daily**, **Story**, and **Repeatable** are tags, not separate task categories or menus. Language, Translation, Mathematics, Architecture, Poetry, Herbalism, and other disciplines are also tags and requirements. This avoids multiplying screens every time the game expands.

## The work queue

There is one ordered queue for all Learn, Make, and Serve tasks.

- The first entry runs; the rest wait in the chosen order.
- The queue begins with three slots and can grow to five through House restoration.
- Each entry states its purpose, duration, reward, requirements, and contribution to the current need.
- The running task finishes in place. Waiting entries may be reordered or cancelled without losing resources; no input is spent before its task begins.
- Repeatable tasks use a chosen count rather than an endless repeat that can starve Story or Daily work.
- Time continues while away, using the existing eight-hour offline cap.
- On return, one short report explains what finished, what was gained, what changed, and why the queue stopped.
- A Story or Daily Need may offer **Queue this plan**, adding its linked steps in order. The player can still change that plan.

The queue belongs in **Work**. **House** shows the current civic need, city condition, restoration choices, and story. **Knowledge** explains disciplines and unlocks. The Satchel remains a drawer for concrete items. No additional Daily or Tasks tab is needed.

## One Daily Need, not daily chores

At most one authored Daily Need is active. It is a small story about someone or somewhere in the visible district, resolved through three linked tasks.

Example: **The eastern school has gone quiet**

1. **Learn:** decipher the school’s damaged primer.
2. **Make:** create a working copy while preserving the original.
3. **Serve:** donate the copy to the school.

Each step clears one point of Daily Encroachment. Completing the chain returns current Darkness to the permanent campaign level and produces a visible response: a lamp, voices, an open stall, repaired stonework, people returning, or a new line of dialogue.

Early Daily Needs have one obvious solution so the system is easy to learn. Later needs may offer two approaches unlocked by different disciplines, such as solving a water shortage through Architecture or Herbalism. Alternatives should create expression, not a hidden correct answer.

Daily Needs should initially come from a small rotating pool of authored situations. Procedural combinations can be investigated only after the authored version is enjoyable and coherent.

After a need is resolved, the game records that local calendar date. The next need appears on the player’s first return on a later date. Returning several days later still creates only one need.

## Darkness without punishment

Darkness has two layers:

- **Campaign Darkness** is the permanent baseline. Major Restore projects lower it and ordinary daily work can never raise it.
- **Daily Encroachment** is a temporary pressure of three points attached to the current Daily Need.

The displayed value is:

`Current Darkness = min(100, Campaign Darkness + unresolved Daily Encroachment)`

The Daily system unlocks only after the Scriptorium restoration lowers Campaign Darkness from 99% to 95%. The first daily cycle therefore reads clearly as 98% → 97% → 96% → 95% as its three steps are completed. The existing Keeper’s Desk milestone remains the prologue’s 100% → 99% proof of permanent progress.

These percentages are initial playtest values and can be tuned without changing the two-layer model.

Rules that protect the player:

- Daily Encroachment never stacks. Seven days away still produces one need and at most three points, not seven needs or twenty-one points.
- An unfinished Daily Need waits for the player. It does not expire and no second need appears on top of it.
- Missing a day never increases Campaign Darkness, removes a restoration, consumes resources, or breaks a streak.
- There is no streak reward, login calendar, or separate Light currency.
- After today’s need is complete, the player can pursue repeatable work, Story tasks, or permanent Restore projects at their own pace.

“Daily” means the city has a fresh need when the player is ready to return; it does not mean the game owns the player’s calendar.

## Economy

The economy stays deliberately small:

- **Knowledge** is the common intellectual resource created by Learn tasks.
- **Discipline XP** unlocks methods and more advanced tasks.
- **Materials and made items** appear only when a visible need gives them a purpose.
- **Make** converts Knowledge and materials into useful things.
- **Serve** applies those things to people and removes Daily Encroachment.
- **Restore** spends larger surpluses to create permanent progress.

Do not add Light, Civic Trust, Momentum, daily tokens, or similar abstract currencies unless playtesting proves a specific missing function. The city’s visible recovery and the Darkness percentage are the main feedback.

## Full campaign structure

Every Shadow changes the kinds of needs the city presents, but uses the same loop.

| Chapter | Shadow pressure | Disciplines and institutions | Typical service |
| --- | --- | --- | --- |
| The First Word | Ignorance fragments language and isolates texts | Language, Scriptorium, schools | copy, teach, and circulate books |
| Knowledge in Circulation | Greed hoards materials and distorts exchange | Translation, Mathematics, records, market | establish fair measures and exchange |
| Knowledge Applied | Famine strains water, food, and health | Architecture, engineering, agriculture, Herbalism | build, preserve, irrigate, and care |
| The Courage to Gather | Fear silences people and public life | Poetry, rhetoric, philosophy, assembly | persuade, perform, record testimony |
| The Living Archive | Forgetting severs people from connected memory | all disciplines, Grand Archive | preserve, connect, and share the recovered record |

Shadows remain environmental forces until a separate confrontation design proves that combat, debate, puzzles, or another system would add something the restoration loop cannot.

## v0.4 playable proof

The implemented slice proves the loop with one complete chain:

1. Replace infinite auto-repeat with a three-slot ordered queue.
2. Restore the Scriptorium and lower Campaign Darkness from 99% to 95%.
3. Introduce one authored Daily Need at the eastern school with three points of encroachment.
4. Learn by deciphering its damaged primer.
5. Make one copy while the original remains archived.
6. Serve by donating the copy and visibly relighting the school.
7. Clear current Darkness from 98% back to the 95% baseline.
8. Return later to a concise completed-work report and a new need only after the previous one is resolved.

The first version does not need a full market, random daily generation, multiple solutions per need, more currencies, streaks, combat, or several restored rooms.

## Validation questions

Test whether a new player can explain, without prompting:

- why Learn, Make, Serve, and Restore are different;
- what will happen next in their queue;
- why Darkness rose temporarily and what will lower it;
- which progress is permanent;
- why a manuscript copy helps the city more than hoarding the original;
- what they want to queue before leaving;
- what they are curious to find on their next return.

If the system feels like compulsory maintenance, reduce the frequency or number of steps before adding rewards. If players complete the need but do not care about the result, improve its character, consequence, and visible city response before adding more task templates.
