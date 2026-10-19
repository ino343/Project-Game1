# Aldenmoor Online

Browser RPG: **login → character select → game**. New heroes start at **Lv 0** with **no free points** (`START_AP` / `START_SP` in `js/data/config.js` are 0; older Lv 0 saves lose their unspent starter points); 15 EXP to Lv 1 (see `need()`), and every level-up grants 3 attribute points + 2 skill points as a 1st job and as a 2nd job ( `SP_PER_LV` / `SP_PER_LV_2ND` in `js/data/config.js`). Plain HTML/CSS/JS, no build step.

## Run
Open `index.html` (double-click works), or serve the folder, e.g. `npx serve .` / VS Code Live Server.

## Structure
```
index.html              redirects to login or character select
pages/
  login.html            log in / create account
  characters.html       3 hero slots, create / delete
  game.html             the game (canvas + HUD)
css/
  base.css              design tokens (colors, radius, shadows) + resets (all pages)
  components.css        card, buttons, form fields, keycaps (all pages)
  scene.css             night-sky backdrop used by login + character select
  auth.css              login page
  characters.css        character select page
  game.css hud.css dialog.css   game page
  classic.css           classic MMORPG skin (bronze/gold frames, bevelled buttons); loaded last on every page
js/
  entry.js              landing redirect
  shared/               utils.js, storage.js (accounts, session, characters),
                        avatar.js (character sprite, used by game + creator preview)
  data/                 config, skills, jobs, items (equipment + pets), monsters, maps, appearance (pure data)
  audio/                sfx.js, music.js, menu-music.js (login + character select theme)
  auth/login.js
  characters/characters.js
  game/                 state, player, feedback, world, combat, pets, update,
                        render/, hud, dialogs, lifecycle, input, main
```

## Gameplay rules
- **Level-ups only raise Max HP.** Attack, MP and Defense are flat per job (`atk`, `mp`, `def` in `js/data/jobs.js`; only `hp` has a per-level value). Power comes from the **weapon** (flat Attack, `W_ATK` / `J2_ATK` in `js/data/items.js`), **Str / Dex points**, skills, buffs, pets and necklaces; Defense from armor and headgear; extra MP from headgear. Each level still gives 3 attribute points + 1 skill point to spend yourself. The old Rookie penalty (weak at Lv 1, full strength at Lv 10) was a stat that grew with level, so it is off: `ROOKIE_ATK_MIN` / `ROOKIE_SPD_MIN` in `js/data/config.js` are 1 (set them below 1 to bring it back).
- Each attribute (Str, Dex, Spd, Luk, Dod, Vit) is capped at **100 points** (`STAT_MAX` in `js/data/config.js`). **Spd** gives +1% attack speed per point (max x2.00 at 100); the rest of the speed comes from **headgear and necklaces** (`aspd`, tiers 1-9: +3% up to +100% each, `ASPD_T` in `js/data/items.js`), so best head + best neck + 100 Spd = x4.00, plus the class buff. Older saves above the cap are trimmed on load and the extra points are refunded.
- 2nd job advancement needs **level 50** (`JOB2LV` in `js/data/config.js`); a 1st job **cannot level past 50** (EXP bar shows MAX until you advance), and the max level is **100** (2nd job only, `MAXLV`). Advancing **resets you to level 40** (`JOB2_RESET_LV`, EXP to 0) and resets all attributes and skills, but refunds every attribute and skill point you had spent or unspent, so you can re-allocate them. Level-ups from 40 grant points again as usual.
- Skills are **never learned automatically and have no level requirement**. Each level gives
  **2 skill points** as a 1st job and as a 2nd job (`SP_PER_LV` / `SP_PER_LV_2ND`); press **C** > **Skills**. Learning a skill costs 1 SP (Lv 1) and
  every upgrade costs 1 SP more, up to **Lv 15** (`SKILL_MAX` in `js/data/skills.js`; a skill can set its own `max`, Rage is capped at **Lv 5**).
- **1st jobs** have **3 active skills + 3-4 passive skills**. Passives are always on once learned (1 SP to
  learn, 1 SP per upgrade, up to Lv 15) and are not on the skill bar. **2nd jobs** have 10 active skills
  (including buffs) and keep their 1st job's passives. Lists live in `js/data/jobs.js`, definitions in
  `js/data/skills.js` (`kind: 'passive'`, `pas` = bonus per level).
  - Archer: **Eagle Eye** (+4% arrow skill range, +12% bow basic-attack range per level; the basic bow range starts short: Archer 110, Ranger 240, and reaches its old max at Eagle Eye Lv 15), **Bow Mastery** (+3% damage), **Deadeye Focus** (+1% crit rate).
  - Swordsman: **Sword Mastery** (+3% damage), **Iron Body** (+3% max HP), **Tough Skin** (+1% less damage taken), **Rage** (max Lv 5; +20% damage per level at near 0 HP, so +100% at Lv 5, scaling with missing HP).
  - Waif: **Poison Mastery** (+6% poison damage), **Nimble Body** (+0.8% dodge, +0.6% move speed), **Lethal Edge** (+4% crit damage, +0.4% crit rate), **Double Edge** (+2% chance per level that a normal attack strikes twice).
  - Saves from before this change: skills that no longer exist are refunded as skill points on load.
- **Character look (modern redesign):** the body is now a shaped torso (men: broad shoulders tapering to the waist, women: fitted waist and soft hips, no skirt), with tapered trousers, rounded sneakers, rounded hands, ears, a shaded jaw and a detailed face (eyes with highlights, brows, nose, lips, blush and stud earrings for women). Code: `avatarTorsoPath`, `avatarArm`, `avatarHead`, `avatarFace` and the leg loop in `js/shared/avatar.js`.
- **Side view redo (walk + attack + hair):** walking / facing left or right now has a real profile head (`avatarHeadSide`, `avatarFaceSide`: one eye, brow, nose, lips, chin, ear, neck) instead of a squeezed front face, and its own hair for every one of the 26 hairstyles (`AVATAR_HAIR_SIDE` + `avatarHairSide`: back hair / buns / ponytails / braids, the scalp cap, then fringe and side locks; strand shading + contour). Walking has a longer stride, bent knees, a lifted swing foot, heel roll and bigger arm swing (`avatarSideLegs`, `avatarLimb`); the upper body leans into the walk and folds forward into an attack while the feet plant in a fighting stance. To add / tweak a side hairstyle edit its entry in `AVATAR_HAIR_SIDE` (paths are in a right-facing frame, u = forward, v = up, and are mirrored automatically for left).
- **Side view body (option E):** longer legs (`hipUp`), feet apart when idle (`stance`, `kb`), shorter jacket / parka / tasset hems (`hem`) and the head nudged back (`head`). All tunable in `AVATAR_SIDE_OPT` at the top of `js/shared/avatar.js`.
- **Sitting (X):** each class keeps its own sit pose (swordsman relaxed, waif cross-legged, knight on one knee, assassin crouch, archer hugging knees, ranger one knee up) and now has a real front, side (left / right) and back view: `avatarSitLegsSide`, `avatarSitPropSide`, `SIT_SIDE`, `SIT_LEAN`, `SIT_ARMS` in `js/shared/avatar.js`. While seated the direction keys (WASD / arrows) only turn the hero; press **X** again to stand (`update.js`). Clicking to move, selecting an enemy, auto attack, skills or taking a hit still stand you up.
- **Sitting, weapon + front / back:** the weapon that lies next to the seated hero is the **equipped** weapon with its real art (`avatarRestWeapon`; plain class weapon when nothing is equipped); the bow stands beside the archer / ranger. Seen from behind (facing up) the weapon lies behind the body and the front-only parts (shoes, knees) are hidden. Trousers got a rim light so the legs read against the dark ground.
- **Swordsman / Knight outfits:** Swordsman = *Mercenary Leather* (brown leather jacket, cross-chest strap, scarf in the outfit colour, steel pauldron); Knight = *Tactical Paladin* (black tactical top, silver breast/back plate with a gold cross, pauldrons, tassets, vambraces). Both have a separate back view in `avatarModernOutfit()` (`js/shared/avatar.js`).
- **Direction-based body views (all classes):** the avatar has three body designs depending on where it is facing. Walking / facing **left or right** draws a profile body (narrow torso, one swinging arm, legs in stride, shoes pointing forward, profile head with a nose and a single ear) with a side look per class (`avatarSideOutfit()`, `avatarSideLegs()`); walking **up** draws the back view (hood / collar, back panels, straps, quiver, plates) per class in `avatarModernOutfit()`; **down** is the front view. The view is picked in `drawAvatar()` from the facing angle (`facingUp`, `sideView`). Weapons, bows and costumes follow the same views.
- **Headgear in side view:** equipped headgear (icons) is turned into a profile by `avatarHeadProfile()` (each row of the icon is rotated 90 degrees around the head, so the front details move to the facing edge, the back half is darker); costume hats have their own side handling in `avatarCosHead()` (ears / horns overlap, witch tip trails behind, bicorn narrows, jester mask turns in profile). Back view still shows the plain back of the hat.
- **Rotate the preview:** in character creation the preview can be turned to Front / Right / Back / Left with the ◀ ▶ buttons, by dragging the character sideways, or with the arrow keys while it is focused; the middle button snaps back to the front view. See `VIEWS` / `setView()` in `js/characters/characters.js`.
- **Hair:** modern, trendy cuts, drawn in `avatarHair()` from layered SVG-path shapes (body colour, strand shadows, highlights, glossy specular band, cast shadow on the forehead, thin contour) with proper back views. Men: Textured crop, Taper fade, Two-block, Comma hair, Curtains, Fade quiff, Slick back, Buzz cut, Modern mullet, Top knot, Curly top, Wavy flow, Bald. Women: Butterfly cut, Curtain bangs, Wolf cut, French bob, Long bob, Hime cut, Sleek high pony, Sleek low bun, Claw clip, Textured pixie, Space buns, Side braid, Curly shag. Lists live in `js/data/appearance.js`; old style ids are mapped to the closest new cut (`legacyStyles`), so saved characters keep a matching hair.
- **Bow arms facing up:** when an Archer / Ranger aims up (back to the camera) the bow and both hands reach out ahead of the character, above the head, instead of hanging in front of the body. The front hand holds the grip and the back arm pulls the string on every shot. See `avatarBowLead`, `holdBow` and `avatarBowHands` in `js/shared/avatar.js`.
- **Player name plate:** the level label is hidden. The plate shows the guild name (if the hero is in a guild) on top and the player name (IGN) below it; without a guild only the name is shown (`js/game/render/scene.js`, `plate()` in `render/entities.js`).
- **Attacking is manual:** clicking an enemy only **selects** it (red ring, HP bar and a name + `Lv.` label). Press **Space once** to toggle **auto attack**: the hero walks to the **clicked** enemy only, stops in reach and attacks until it dies, then stops (click another one and press Space again). It also stops on a second Space, WASD, a ground click, sitting or a map change; with no clicked enemy Space does nothing; Space never swings at empty air (`toggleAutoAttack()` / `autoAttackStep()` in `js/game/combat.js`). Touch devices get an on-screen **Attack** button (`#atkBtn`) that toggles it. A selected target is still the one bows aim at and the one a skill prefers.
- **Single target (all classes, 1st and 2nd job):** every basic attack and skill hurts exactly **one** enemy: the clicked / locked target if it is in reach, otherwise the closest one. Arcs, novas, dashes (first enemy touched), arrows (no pierce, no splash damage, all arrows of one cast share a victim) and arrow rain (one enemy per volley) never damage the others. With an enemy selected, ONLY it can be hurt (skills, arrows, dashes and rain never touch another enemy; out of reach = no hit); with nothing selected the closest one is hit. Helpers: `lockedTarget()` / `pickOne()` in `js/game/combat.js`; the rest is in `perform()` and `update.js`.
- **No attacking while walking (all classes, 1st and 2nd job):** basic attacks and attack skills only fire while the hero stands still. Walking (WASD / arrows / click-to-move) blocks them; a blocked skill is refunded (no MP spent, no cooldown) and shows "Stand still to attack". Buff skills can still be cast on the move. Logic: `isWalking()` in `js/game/combat.js` and the auto-attack step in `js/game/update.js`.
- **Assassin** wields dual daggers: every normal attack (each fill of the green attack bar under the hero) deals **2 hits / 2 damage numbers**. The second hit lands halfway through the bar, so it never gets skipped at high attack speed (`basicAttack()` in `js/game/combat.js`).
- Per skill level: damage +6%, cooldown -1.5%, MP cost +2%, range/area +1.2%, buffs +4% and +0.3s,
  extra projectiles/waves at Lv 8 and 15, (see `skillDef`).
- Keys: **1-9 / Q R T Y U** = your hotbar slots (empty until you assign them; put the HP / MP potions where you like).
- Buff fields: `atk` (damage), `aspd` (attack speed), `spd`, `crit`, `dodge`, `dr`.
- Character customization (gender, hairstyle, hair color, body color, outfit color) lives in
  `js/data/appearance.js`; add options there and they appear in the creator.

## Equipment & pets
- The blacksmith weapon upgrade (+1..+10) was replaced by **equipment merchants**, one per class family,
  in the village: **Garon** (Swordsman / Knight), **Veyra** (Waif / Assassin), **Sylas** (Archer / Ranger).
  Each sells 6 tiers of **weapons, armors and headgears** (Lv 5 / 15 / 30 / 45 / 60 / 80) for that class only.
  Weapons add damage %, armors add defense and max HP %, headgears add defense, max MP % and a class perk
  (Waif dodge, Swordsman damage reduction, Archer crit). Gear is shown on the character.
- **Gear (G)** button / key opens a window showing everything you wear (weapon, armor, headgear, necklace) plus your active pet, with Remove / Summon / Send home.
- **Necklaces** (6 tiers, any class: +damage % and max HP %) are sold by every equipment merchant under the *Necklaces* tab.
- **Items (I)** button / key: bag with tabs Equipment (equip, sell for 40%), Potions, Materials and Pets.
- Gear is managed in **Gear (G)** and **Items (I)**. Old saves get their weapon upgrade gold refunded.
- **Pippa** (Pet Dealer) sells 6 pets (Jelly, Fang, Whisker, Hoot, Bruno, Ember). One pet follows you and gives a
  stat perk only (pets never attack). Summon or send it home from **Gear (G)**, **Items (I)** or from Pippa.
- Data lives in `js/data/items.js` (`ITEMS`, `PETS`); pet logic and drawing in `js/game/pets.js`.
- **Item icons**: every item has its own hand-drawn design (own silhouette, materials and details), registered by item id in `ITEM_ART`: `js/shared/icons-weapons.js`, `icons-armor.js`, `icons-head.js`, `icons-neck.js` (core + helpers in `itemicons.js`). The tile behind an icon is neutral; the grade colour is only the frame, a faint aura on high grades and small gem / glow accents. To add an item, add `ITEM_ART['<item id>'] = (g, gradeColour, tier, item) => { ... }` (56x56 canvas).

## Chat & commands
- Press **Enter** (or **/**) to open the chat box, **Enter** to send, **Esc** to cancel, **Up/Down** to recall earlier lines. Plain text appears in the log.
- Commands live in the `COMMANDS` list at the top of `js/game/chat.js` (level, gold, help). **/help** opens a window listing every enabled command. To remove a command, delete its entry (or set `on: false`); /help updates by itself. To add one, add an entry with `name`, `alias`, `usage`, `desc` and `run(args)`.

## Training dummies
- 3 dummies stand in the village (SE of the fountain). Walk near them and a **Damage Test** panel shows attack speed (swings per second, measured, plus the max from your stats), DPS, last / highest / average hit, crit rate and total damage. Damage numbers also pop up on the dummy. A test ends after 4s idle; press **Reset** to clear. Dummies never die, drop nothing and cannot miss (logic in `js/game/dummy.js`).

## Materials
- Every leveling map has its own 7 materials (`js/data/materials.js`): 3 common (one per regular mob), then an uncommon, rare and epic any mob on that map can drop, and a legendary dropped only by the map boss. Rarer = pricier (x1 / x3 / x8 / x25 / x80 of the map's base price).
- View and sell them in **Items (I) > Materials** (sell 1, sell a whole stack, or sell all of a rarity).

## 2nd-job gear
- Each equipment merchant also sells **3 weapons, 3 armors and 3 headgears** for the 2nd job (Knight / Assassin / Ranger), and every merchant sells 3 2nd-job necklaces (Lv 40 / 60 / 85). They need a 2nd job and are much stronger than the 1st-job sets (weapon +100% / +160% / +250% damage). 1st-job gear is ~40% cheaper than before. Data: `J2_*` constants in `js/data/items.js`.

## Weapon while walking
- The held weapon is put away (fades out in ~0.12s) while the hero walks, and comes back out on an attack / dash (`P.wield` in `js/game/update.js`).

## Modern village, buildings and NPCs
- The village (2200x1500) is rebuilt with paved roads, a plaza fountain, street lamps, benches, planters and a fenced training yard. Every building has a **glowing door (a portal)**; walk in to enter its interior map (`in_<id>`), walk onto the exit mat to leave. All NPCs now stand inside their building.
- Buildings, roads and interiors are data in `js/data/maps.js` (`BUILDINGS`, `INTERIORS`, `NPCS`). To add a shop: a row in `BUILDINGS`, a room in `INTERIORS`, and NPCs with `map: 'in_<id>'`. Drawing is in `js/game/render/village.js`; the map builder is in `js/game/world.js`.
- **Buildings / NPCs**: Academy (Master Kael) · Alchemy (Mina) · Guild Hall (Brenna) · Material Exchange (Brokk) · Quest Hall (Captain Roderic) · Armory Hall (Garon, Veyra, Sylas) · Sage's Tower (Sage Orin) · Pet Emporium (Pippa) · Fashion Street (Luna, Rowan) · Bank (Odette) · Waystation (Zephyr). Lumi (Town Guide) waits near the south spawn. Sister Lia (Healer) stands at the plaza fountain; there is no automatic HP/MP regen in the village.
- **Guild** (Brenna, `js/game/npcs.js`, stored in `Store.Guilds`): found a guild (Lv 5, 1,000g), join one of the open guilds, donate gold to level it up (6 levels), see members, leave or disband. Members get **+2% EXP per guild level**; the guild name shows under your name. Guilds live in this browser's localStorage, shared by every account/hero on it. Three starter guilds are created on first use. Constants: `GUILD_*` in `js/data/config.js`.
- **Quest Master**: pick a hunt (12-30 of a monster, or a boss), kill them anywhere, return for EXP, gold and potions. Tracker under the player frame; `!` / `?` marker above the NPC.
- **Banker**: vault for gold, spare equipment and materials. **Material Trader**: sells materials for +15%. **Warp Master**: travel to discovered maps for a fee. **Sage Orin**: reset attributes or skills for gold.
- New save fields: `vault`, `visited`, `quest`, `qdone`, `guild` (old saves load fine).

## Notes
- Scripts share one global scope, so **load order in `pages/game.html` matters**
  (shared → data → audio → game). This keeps it working from `file://` with no bundler.
- Accounts and saves live in this browser's `localStorage` (per device). Passwords are
  salted + hashed, but this is not real server-side authentication.
- Storage keys: `aldenmoor:accounts`, `aldenmoor:session`, `aldenmoor:characters:<user>`.
  Audio settings keep the old key `aldenmoor_audio`.
- Old single-file saves (`aldenmoor_save_v1`) are not imported.

## World map
```
Village -E- Meadow -E- Whisperwood
                            |S
        Murk Swamp -W- Sunken Ruins   (Ruins: N back to Whisperwood)
            |S
        Scorched Dunes -E- Frostpeak -E- Emberfall
                                           |N
                                      Void Abyss (Lv 62-70, final boss Lv 70)
```
Portals sit on all four edges (N/S/E/W). Add maps in `js/data/maps.js`; spawn tuples are
`[mob, count, from, to, fixedPos, 'y']` (`'y'` = fractions apply to height instead of width).

## Combat balance (damage vs HP)
Hero damage no longer grows with level; it grows with gear tier and attribute points, so it moves in steps when a new weapon tier unlocks (Lv 5 / 15 / 30 / 45 / 60 / 80, 2nd-job gear at Lv 40 / 60 / 85). Monster HP follows that staircase (`REF_DPS`, re-measured with `node tools/dps-sim.js`), and hero HP follows `HERO_HP_MULT`. Everything is a table at the bottom of `js/data/config.js`; no other file needs editing to re-balance.
- **Monster HP** = typical hero DPS at the monster's level x time-to-kill. Normal monsters take about 1s (Lv 1) rising to 3s (Lv 60+); golems take 2x that; bosses take 4s (Lv 8) rising to 60s (Lv 70). Results: Pharaoh King ~0.16M, Frost Lich ~0.42M, Magma Colossus ~1.3M, Void Lord ~2.0M HP. Add `hpw: 1.5` to any monster in `monsters.js` for +50% HP. The `hp` numbers written in `monsters.js` are only the base design values (they are overridden); `atk` is kept as each monster's relative strength.
- **Hero max HP** is multiplied by `HERO_HP_MULT` (x1 at Lv 1 up to x350 at Lv 100): about 0.8M for a damage build, 1.5M balanced, 2M+ with all points in Vitality at Lv 100.
- **Monster attack** is scaled up with the hero HP curve but eased (`MOB_ATK_EASE`, `BOSS_ATK`) so a normal monster hit costs roughly 1-7% of your HP and a whole boss fight costs about one to two potions' worth.
- **Defense** is now a percentage cut, `K / (K + def)` with `K = 50 + 6 x monster level` (see `defReduction`). Before, defense was subtracted flat, so from Lv ~40 on monsters could only ever deal 1 damage.
- HP / MP numbers use thousands separators in the HUD and Hero window.

## Dev tools
`tools/set-level.js` – paste into the browser console to set an Archer/Ranger save to level 100 (Ranger)
(works because saves are in localStorage). Needs `MAXLV = 100` in `js/data/config.js`.
`tools/dps-sim.js` – `node tools/dps-sim.js` prints the typical-hero DPS per level; use it to re-tune `REF_DPS` after changing gear, crit or attribute numbers.

## Costumes (cosmetic gear)
- **Gear (G)** has a **Cosmetic** area with 3 slots: **Costume Hat**, **Costume Outfit**, **Costume Back** (cape / wings). Costumes have **no stats**, work for every class, need no level, and show on your character (a worn costume replaces the look of your stat headgear / class outfit but never its stats). A preview of your character is shown next to the slots.
- 17 costumes (Common to Epic) are sold only by two village shops: **Luna** (Moonlight Boutique, south-west of the fountain) and **Rowan** (Costume Corner, south). Use **Try on** in a shop to preview before buying. A bought costume is worn automatically only if its slot is empty. Spare costumes live in **Items (I) > Costumes** (sell for 40%).
- Data: `js/data/costumes.js` (`COSTUMES` list, slots `chead` / `cbody` / `cback`, shop ids `boutique` / `corner`). Looks: `js/shared/avatar-costume.js` (hooks in `drawAvatar` via `o.cos`). Icons: `js/shared/icons-costume.js`. To add a costume: a row in `COSTUMES`, a `style` case in `avatar-costume.js`, and an `ITEM_ART['cos_<slot>_<key>']` icon.

## UI layout (game page) - classic MMORPG style, following the wireframe
- **Look**: dark leather panels with bronze + gold frames, parchment text, Cinzel titles, bevelled square buttons, folder tabs, windows with a gold title bar. Palette tokens in `css/base.css`; the skin is `css/classic.css` (change `--gold`, `--bronze`, `--leather` at its top to re-colour everything).
- **Top-left bar panel**: `Life | Lvl` over `Mana | Mlvl`. Lvl bar = EXP progress. **Mlvl (mastery)** = a second, EXP-based level that exists only for 2nd jobs (as a 1st job it shows `Mlvl --` / `2nd job`, greyed out, and never levels). Kills feed it the same EXP as the base level, but each Mlvl needs `MLV_EXP_MULT` (2.5x) the EXP of the same base level (`mneed()`), and each Mlvl gives `MLV_AP` (2) attribute points versus 3 per base level, so a double level-up is 5 points. Max Mlvl 100 (`MLV_MAX`); logic in `gainMastery()` (`js/game/combat.js`), constants in `js/data/config.js`. Dev command: `/mlvl <n>`. Big HP / MP numbers are shortened in the bars (`barNum()`); exact values are in Abilities.
- **Top-center skill hotkeys**: top row = slots 1-9 + a roll button; rolled down, a second row Q W E R T Y U I O opens (remembered in `localStorage` key `aldenmoor_hotbar_open`). **Every slot is player-assigned** (`P.hotbar`, saved with the hero; **every slot starts empty** for all classes, 1st and 2nd job, potions included): click an empty slot (or right-click / long-press a filled one) to open a blurred pop-up showing the whole bar: tap the slot, tap the skill (only learned active / buff skills, or a potion) and it is placed. Picking a skill that is already on the bar swaps the two slots.  Keys 1-9, Q R T Y U fire their slot; W E I O keep their game functions, so those 4 slots are click-only. Resets on 2nd job. Each learned active / buff skill in Abilities > Skills also has a hotkey strip (`hotkeyStrip()` in `js/game/dialogs.js`) to move it to any slot. Code: `buildBar()` / `hotbarPicker()` in `js/game/hud.js`.
- **Top-right menu**: `Items | Map | Gears | Abilities | Friends | Option` (keys I, N, G, C, F, O). A red badge on Abilities shows unspent attribute + skill points. Abilities = the hero window (Stats / Attributes / Skills tabs). Map = world map of discovered places (`mapWindow()` in `js/game/dialogs.js`). Friends is a placeholder window until there is online play. Under the menu: map name plate and the framed minimap. On screens <= 820px the menu becomes a full-width row under the panel.
- **Bottom-left** framed chat (last 8 lines) + input. **Bottom-right** Warp (only outside the village).


- **Crit balance:** a new hero has **1% crit chance** and **x1.50 crit damage** (`CRIT_BASE`, `CRIT_DMG_BASE` in `js/data/config.js`, the same for every job). Every Luk point adds **+0.6% crit chance** (`LUK_CRIT`) and **+1% crit damage** (`LUK_CRITDMG`): 100 Luk = 61% crit chance and x2.50. Weapons (+1% to +8%), headgear (archers), pets, passives and buffs add on top; crit chance is capped at 95% (`CRIT_MAX`), so reaching the cap now needs Luk plus gear / buffs.
