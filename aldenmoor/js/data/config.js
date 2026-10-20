/**
 * Global balance constants and the EXP curve.
 */
// EXP needed to go from level l to l+1. A brand-new hero starts at Lv 0 and needs 15 EXP to reach Lv 1.
const need = (l) => (l < 1 ? 15 : Math.floor(30 * Math.pow(l, 1.7)));
const MAXLV = 100, // max level (2nd job only)
  JOB2LV = 50, // a 1st job stops here until it advances to the 2nd job (level then drops to JOB2_RESET_LV)
  JOB2_RESET_LV = 40; // advancing to the 2nd job sends you back to this level (points are refunded)
// Highest level this job can reach: 1st jobs stop at JOB2LV, 2nd jobs go on to MAXLV.
const lvCapFor = (jobId) => (typeof JOBS !== 'undefined' && JOBS[jobId] && JOBS[jobId].tier === 1 ? JOB2LV : MAXLV);
// MASTERY (Mlvl): a second level bar that only exists for 2nd jobs (locked as a 1st job). Every kill feeds it the same EXP
// as the base level, but each Mlvl needs MLV_EXP_MULT x the EXP of the same base level, so it climbs much slower.
// Base level gives AP_PER_LV (3) attribute points, mastery gives MLV_AP (2): both in one kill = 5 points.
const MLV_AP = 2,
  MLV_EXP_MULT = 2.5,
  MLV_MAX = 100;
const mneed = (l) => Math.floor(MLV_EXP_MULT * need(l));
const SP_PER_LV = 2, // skill points per level-up as a 1st job
  SP_PER_LV_2ND = 2, // skill points per level-up as a 2nd job
  AP_PER_LV = 3,
  START_AP = 0, // a brand-new Lv 0 hero starts with no free points (points come from level-ups)
  START_SP = 0,
  STAT_MAX = 100, // max points in any single attribute (Str, Dex, Spd, Luk, Dod, Vit)
  VIT_HP = 12;

// Level-ups only raise Max HP (see JOBS in jobs.js). Attack, defense and MP are flat per job; power comes from the
// weapon, Str / Dex points, skills, buffs and gear. The old "rookie" ramp (weak at Lv 1, full strength at Lv 10) was
// a stat that grew with level, so it is switched off: both minimums are 1 (= 100%). Set them below 1 to bring it back.
const ROOKIE_LV = 10,
  ROOKIE_ATK_MIN = 1,
  ROOKIE_SPD_MIN = 1;
const rookieT = (lv) => Math.min(1, Math.max(0, (lv - 1) / (ROOKIE_LV - 1)));
const rookieAtk = (lv) => ROOKIE_ATK_MIN + (1 - ROOKIE_ATK_MIN) * rookieT(lv);
const rookieSpd = (lv) => ROOKIE_SPD_MIN + (1 - ROOKIE_SPD_MIN) * rookieT(lv);

/* CRITICAL HITS: a brand-new hero crits 1% of the time for +50% damage (x1.50). Everything else is earned.
 * Luk is the main source: 100 Luk = +60% crit chance and +100% crit damage (x2.50). Gear, pets, passives and buffs
 * add on top; crit chance is capped at 95%. */
const CRIT_BASE = 0.01, // starting crit chance (every job)
  CRIT_DMG_BASE = 1.5, // starting crit multiplier (+50% damage)
  LUK_CRIT = 0.006, // crit chance per Luk point
  LUK_CRITDMG = 0.01, // crit multiplier per Luk point
  CRIT_MAX = 0.95;
// seconds the weapon stays in hand (idle stance) after the last attack
const WIELD_HOLD = 8;

/* ------------------------------------------------------------------------------------------------
 * COMBAT BALANCE (damage vs HP)
 * Player damage grows roughly with level^2 (base attack + attribute bonus + gear), so monster HP and
 * player HP have to grow the same way or high-level fights end in one hit. Everything here is a
 * table of [level, value] anchors; values between anchors are interpolated on a log scale.
 * Tweak the numbers below to re-balance the whole game; no other file needs to change.
 * ---------------------------------------------------------------------------------------------- */
function curve(anchors, x) {
  if (x <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    if (x <= x1) {
      const [x0, y0] = anchors[i - 1];
      return Math.exp(Math.log(y0) + (Math.log(y1) - Math.log(y0)) * ((x - x0) / (x1 - x0)));
    }
  }
  return anchors[anchors.length - 1][1];
}
// Sustained damage per second of a typical, properly geared hero at this level (measured with tools/dps-sim.js).
// Hero power no longer grows with level, only with gear and attribute points, so this is a staircase: it jumps when the
// next gear tier unlocks (Lv 5 / 15 / 30 / 45 / 60 / 80, and the 2nd-job gear at 51 / 60 / 85), hence the paired anchors.
const REF_DPS = [[1, 26], [5, 77], [10, 215], [14, 260], [15, 525], [20, 690], [29, 1041], [30, 1826], [40, 2525], [44, 2920], [45, 4294], [50, 4800], [51, 9174], [59, 9100], [60, 22070], [70, 33648], [79, 40670], [80, 41572], [84, 45448], [85, 68410], [100, 97538]];
// Multiplier on the hero's max HP by level: Lv 100 heroes sit around 1.5M HP (tank builds 3M+).
const HERO_HP_MULT = [[1, 1], [10, 1.2], [20, 2], [30, 4], [40, 9], [50, 40], [60, 90], [70, 160], [80, 250], [100, 350]];
// How long (seconds) a typical hero needs to kill a monster of this level. Bosses are the long fights.
const TTK_NORMAL = (lv) => 1 + 2 * Math.min(1, (lv - 1) / 59); // 1s at Lv 1  ->  3s at Lv 60+
const TTK_BOSS = (lv) => 4 + 56 * Math.min(1, Math.max(0, (lv - 8) / 62)); // 4s at Lv 8 -> 60s at Lv 70
const BOSS_ATK = 0.6; // bosses hit this much softer per swing than the curve says (their fights are long)
const TANK_MULT = 2; // golems have this much more HP than a normal monster of the same level
// Monster attack growth relative to the old flat numbers (hero HP grew HERO_HP_MULT, fights last longer).
const MOB_ATK_EASE = [[10, 1], [50, 0.2]]; // 1.0 up to Lv 10, falling to 0.2 by Lv 50
const mobHpFor = (m) =>
  Math.round(curve(REF_DPS, m.lv) * (m.boss ? TTK_BOSS(m.lv) : TTK_NORMAL(m.lv) * (m.shape === 'golem' ? TANK_MULT : 1)) * (m.hpw || 1));
const mobAtkFor = (m) =>
  Math.max(1, Math.round(m.atk * curve(HERO_HP_MULT, m.lv) * curve(MOB_ATK_EASE, m.lv) * (m.boss ? BOSS_ATK : 1)));
// Defense is a percentage cut now (def / (def + K)); K grows with the attacker's level.
const defReduction = (def, mobLv) => {
  const K = 50 + 6 * mobLv;
  return K / (K + Math.max(0, def));
};

/* ------------------------------------------------------------------------------------------------
 * GUILDS (Guildmaster Brenna in the Guild Hall; logic in js/game/npcs.js, storage in shared/storage.js)
 * ---------------------------------------------------------------------------------------------- */
const GUILD_MIN_LV = 5, // level needed to found a guild
  GUILD_COST = 1000, // gold to found one
  GUILD_NAME_MIN = 3,
  GUILD_NAME_MAX = 16;
// total gold donated that a guild needs to reach level 1..6 (index = level - 1)
const GUILD_LV_FUNDS = [0, 5000, 25000, 80000, 200000, 500000];
const guildCap = (lv) => 15 + 5 * (lv - 1); // member limit
const guildPerk = (lv) => lv * 0.02; // bonus EXP from every kill
