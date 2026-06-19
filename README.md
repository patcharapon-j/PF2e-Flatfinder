# PF2e Flatfinder
A compendium of replacements for Feats, Actions and Activities to streamline running Flatfinder on Foundry, **plus automation** for Competence-check result badges, the Incapacitation adjustment, item/inline DC flattening, the Flatfinder Elite/Weak templates, and a Flatfinder encounter XP/difficulty badge in the combat tracker. To be used with the Pathfinder 2e system and the Proficiency without Level variant enabled.

Compatible with Foundry VTT v13–v14 and the current Pathfinder 2e system. The badges follow the **GL Universe "Etched Glass" design language** (dark frosted-glass slabs with a chamfered corner, an accent edge bar, etched micro-labels and the Oxanium/JetBrains Mono type pairing), so they sit consistently on both light/parchment and dark chat backgrounds and harmonize with the sibling [gluniverse-initiative](https://github.com/patcharapon-j/gluniverse-initiative) and Clocks & Tracker modules.

NOTE: this is a module in active development.

## What is included (and what isn't)
- Most Actions, Activities and Feats modified by Flatfinder have a modified version included in the module, marked with (FF).
- The description of the Treat Wounds activity has a table which can post the heal results to chat for you, but you must manually roll the Medicine check. **For it to work, it must be added to the character sheet of whoever is attempting the check**.
  - Medic Dedication correctly modifies the heal amounts of the Treat Wounds.
  - Two alternate Treat Wounds activities for Risky Surgery and Natural Medicine.
- The Follow the Expert effect and the Untrained Improvisation feat automation has been modified to work with Flatfinder.
- Effects to apply the modified Weak and Elite templates without changing level to avoid issues with "reflattening"

## How to use
- Install the module and activate it in your Pathfinder 2e World. 
- Enable the Proficiency without Level variant in the Game Settings.
  - Make sure the Untrained Proficiency Penalty is -2.
- Use the content in the Flatfinder compendium. 
  - The modified versions of the game elements changed by Flatfinder are marked (FF).
- **PF2e Flatten Proficiency Level Bonus for PCs and NPCs** is recommended to adjust NPC proficiency bonuses.
  
### Competence checks
As of release 0.2.0, Competence checks must be adjudicated manually by the GM. Properly automating Competence checks is not possible through simple Rules Elements, and coding them in TypeScript goes beyond my abilities. Maybe some day.
  
### Healing Feats
Remember to add the **Treat Wounds (FF)** activity to all characters who will ever Treat Wounds, use Battle Medicine or the like. That gives them a Base Healing attribute, which is required for the following to work.
- Roll the Medicine check in the **Treat Wounds (FF)** activity description.
- Click the field in the row of the table corresponding to the result of your Competence check.
- Apply the healing that just popped up in the chat.

**Medic Dedication (FF)** correctly modifies the Base Healing values in the **Treat Wounds (FF)** activity. **Mortal Healing (FF)** gives a toggle in the Action tab to add the +4 circumstance bonus.
To use **Risky Surgery (FF)** or **Natural Medicine (FF)**, add the **Risky Treat Wounds (FF)** and **Natural Treat Wounds (FF)** respectively and use those instead of the regular activity.
**Encouraging Words (FF)** works similarly, but the feat automatically gives you the corresponding action with working automatic calculations.

### Follow the Expert
Use **Effect: Follow the Expert (FF)** in lieu of the regular effect. You can drag it from the description for **Follow the Expert (FF)** or directly from the Flatfinder compendium.

### Weak and Elite templates
If you want to apply the Weak and Elite templates as described in Flatfinder, you should use the effects in the **FF Adjustments** folder instead of using the default Weak and Elite templates. These effects modify all stats properly, but they do not change level to avoid **pf2e-flatten** "reflattening" the creatures and undoing the changes. Use the **<2** version for creatures of level 1 or below.

### Other
The rest of the feats, actions and activities changed by Flatfinder, except the exceptions noted below, are included in the Flatfinder compendium and should appear in the Compendium Browser. Use the Flatfinder-modified items, marked by **(FF)**.

## Automation features
All of the following can be toggled under *Game Settings → Configure Settings → PF2e Flatfinder*.

### Competence-check badges
When a character makes a **skill check** (and, optionally, perception checks), a badge is added to the roll card showing where the total lands on the Flatfinder v3 *Competence* table (Disastrous → Inept → Poor → Passable → Solid → Impressive → Remarkable → Phenomenal). Because the Proficiency-without-Level variant already strips level from the roll, the check total maps directly onto the tier.
- A **natural 20** shifts the tier up one step; a **natural 1** shifts it down one step (Flatfinder treats these as ±5, i.e. one tier).
- **Lore skills** automatically gain a one-step increase (equivalent to +5).
- The badge follows the Etched Glass design language, with a semantic accent per tier.

### Incapacitation adjustment
PF2e's native incapacitation rule improves the target's save by one degree of success. With *Incapacitation adjustment* enabled, that native behavior is **suppressed** and replaced with the Flatfinder rule: when a creature is higher level than the source of an incapacitation effect, it gains an **untyped bonus to the save equal to twice the level difference, up to +10** (a spell counts as level equal to twice its rank). The bonus is added as a real modifier (it shows in the roll breakdown and affects the degree of success), so no manual adjustment is needed. This works by wrapping `game.pf2e.Check.roll`; **lib-wrapper is recommended**.

### Item & inline DC flattening
pf2e-flatten removes a creature's level from everything derived from its statistics, but it can't see numbers baked directly into content. With *Flatten item & inline DCs* enabled (default), this module subtracts the originating item's level — at roll time — from **static DCs** the system would otherwise leave too high:
- **inline checks** written into descriptions, e.g. `@Check[fortitude|dc:25]`, and
- **fixed save DCs** carried by items/spells that aren't computed from an actor.

Only *static* DCs are touched. A DC that resolves from a live actor statistic is left to pf2e-flatten, so the two never stack and double-count. If no source item level can be determined, the roll is left untouched (native behavior). The flattened value is what's used for the degree of success and shown in the result. This works by wrapping `game.pf2e.Check.roll`; **lib-wrapper is recommended**.

### Elite / Weak templates (and pf2e-flatten)
**Use the bundled "FF Elite/Weak" effects** to apply the templates — they add a clean +/-2 to all checks/DCs and leave the creature's level alone, which is exactly what's needed alongside [pf2e-flatten](https://github.com/patcharapon-j/pf2e-flatten).

> ⚠️ The **native Elite/Weak button does not work correctly under pf2e-flatten.** pf2e-flatten subtracts the creature's level from every check/DC and re-flattens whenever the level changes; the native button raises level by +1, so re-flattening cancels half of the template's +2. (Earlier versions of this module tried to bump the level on the sheet — that made the problem *worse* and has been removed.)

With *Count Elite/Weak as +/-2 levels* enabled (default), this module treats an Elite/Weak creature — whether adjusted via the **bundled FF effects** or the **native button** — as **+/-2 levels** for the encounter-XP and incapacitation math, *without* touching the sheet, so pf2e-flatten is never disturbed. For base level −1/0/1 creatures, where Flatfinder says not to change HP/damage, use the **FF ... &lt;2** effects.

### Apex (solo boss) extra turns
Flatfinder's **Apex** template (v3 §8) gives a lone boss more *actions* instead of bigger numbers. With this enabled, you can mark any **NPC** as Apex and choose how many turns it takes per round:
- Open the NPC sheet and click the **crown ("Apex") button** in the title bar. Toggle *Apex* on and set **Turns per round** (2 by default; 3 is suggested against a 5–6 PC party). You can also call `game.modules.get("pf2e-flatfinder").api.configureApex(actor)` from a macro.
- Once a creature is Apex, its **sheet reads as a solo boss at a glance**: an etched **APEX** emblem banner (with the turns-per-round count, and a one-click **Counteract** button for the GM) at the top of the sheet body, plus an amber tint on the title-bar crown. The treatment stays inside the sheet — there is no outer window glow, so it never bleeds onto the PF2e token HUD. Toggling Apex off clears it on the next render.
- In **standard initiative**, once the boss rolls, the module inserts its extra turns automatically at **(rolled initiative − 10)**, **(− 20)**, etc. Each extra turn is a genuine Foundry turn, so the system **resets the boss's Multiple Attack Penalty** for free.
- The combat tracker badges each of the boss's turns: **PRIME · 1/N** for the Prime turn and **APEX · k/N** for the extras. Per Flatfinder, **per-turn effects (persistent damage, frightened, start/end-of-turn triggers) resolve only on the Prime turn** — the badge tells you which one that is.
- **Per-turn effects resolve only on the Prime turn (Component 1).** The module hooks PF2e's turn processing so persistent damage, frightened (and other start/end-of-turn ticks) and turn-based effect expiry never fire on the extra turns — only on Prime. Toggle under *Apex: Prime-turn-only effects*.
- **HP-phase beats (Component 4).** When the boss crosses **66%** and **33%** HP, the module whispers the GM a reminder card: take a free turn, shed one condition, shift tactics. Once per threshold per combat; toggle under *Apex: HP-phase beats*.
- **Condition-counteract action (Component 3).** A **shield button** on the boss's Prime row in the combat tracker, a matching **Counteract** button on the Apex emblem of its **sheet**, and `api.apexCounteract(actor)` each roll the once-per-turn counteract using the boss's **highest save modifier** at its **full creature level**. The chat card shows the boss's **counteract rank** (Player Core: half its level, rounded up) and a built-in **reference table** — for each degree of success (Critical Success / Success / Failure / Critical Failure) it lists the highest effect **rank and level band** the boss counteracts. Compare the check to the effect's DC to find the tier, then read off what it stops.
- **gluniverse-initiative compatibility:** in **Standard** mode the extra turns render naturally as additional cards on the boss's rail. While gluniverse's **Card** mode is active, the extra-turn insertion **stands down automatically**, because that mode already deals multi-turn bosses their own slots (configure turns there via its deck control instead).

> Component 2 (the boss's single baitable reaction) is unchanged stock PF2e behaviour and needs no automation. The numerical "optional dial" is intentionally left off.

### Encounter XP budget & difficulty badge
As the GM adds PCs and monsters/hazards to the **combat tracker**, a badge at the top shows the total **Flatfinder (Proficiency-without-Level) XP** and the resulting **difficulty band** (Trivial → Extreme), scaled to the party's level and size. Simple hazards count for 20% of a same-level creature; complex hazards count fully. Friendly/neutral NPCs are ignored. An **Apex (solo boss)** counts its XP **once per turn it takes** (Flatfinder §8) — a 3-turn same-level boss is roughly three creatures' worth of threat — and its auto-inserted extra-turn entries are not double-counted.

## Known gaps and issues
- Competence checks still need the GM to interpret the band into fiction/outcome; the badge only displays the band.
- The Incapacitation adjustment relies on the originating effect being discoverable on the save's roll context; for effects where the source level cannot be determined, the roll is left untouched (native behavior).
- Ritual DCs are not implemented.
- Several feats are not automated properly.
- Unified Equipment Quality is not implemented.
- Earn Income and Craft are not implemented.
- Spells such as Animal Form don't have flattened *modifiers* (battle-form attack/AC); only DCs are flattened. pf2e-flatten already adjusts battle-form strikes via the character's level.
- DC flattening needs a discoverable source-item level on the roll context; inline checks rolled with no item origin (e.g. from a journal) are left untouched.
- The inline `@Check` button still shows the book DC before it's clicked; the flattened DC appears in the roll result.
