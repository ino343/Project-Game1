/**
 * Player creation and stat calculation.
 */
function J() {
  return JOBS[P.job];
}
// Movement feel per class. accel / decel in px/s^2 (how quickly the hero reaches full speed / comes to rest),
// turn = extra grip when changing direction, px = pixels walked per radian of the walk cycle (smaller = quicker steps),
// heavy = footfall weight (squash, dust, volume). Light classes are snappy, the Knight is heavy and steady.
const MOVE_FEEL = {
  waif: { accel: 1500, decel: 1700, turn: 1.6, px: 13, heavy: 0.6 },
  assassin: { accel: 1900, decel: 2100, turn: 1.9, px: 14.5, heavy: 0.35 },
  swordsman: { accel: 1050, decel: 1250, turn: 1.4, px: 14.5, heavy: 1 },
  knight: { accel: 800, decel: 1000, turn: 1.2, px: 16, heavy: 1.5 },
  archer: { accel: 1250, decel: 1450, turn: 1.5, px: 13.5, heavy: 0.7 },
  ranger: { accel: 1350, decel: 1550, turn: 1.6, px: 15, heavy: 0.5 },
};
// Ground under the hero, used for footstep sounds and dust colour.
function groundSurface() {
  const th = M.theme;
  if (th === 'interior') return M.interior && M.interior.tile ? 'tile' : 'wood';
  if (th === 'town') {
    const PZ = VILLAGE_PLAZA;
    if (Math.hypot((P.x - PZ.x) / PZ.rx, (P.y - PZ.y) / PZ.ry) < 1) return 'stone';
    if ((M.paths || []).some((s) => segDist(P.x, P.y, s[0], s[1]) < 30)) return 'stone';
    return 'grass';
  }
  return { grass: 'grass', forest: 'grass', ruins: 'stone', swamp: 'mud', desert: 'sand', frozen: 'snow', volcano: 'rock', abyss: 'rock' }[th] || 'grass';
}
const ATTR = [
  { k: 'str', n: 'Strength', d: 'Adds damage to melee hits (blades and melee skills).' },
  { k: 'dex', n: 'Dexterity', d: 'Adds damage to ranged hits (bow attacks and arrow skills).' },
  { k: 'spd', n: 'Speed', d: 'Faster basic attacks.' },
  { k: 'luk', n: 'Luck', d: 'More critical hits, and they hit harder.' },
  { k: 'dod', n: 'Dodge', d: 'Chance to evade monster attacks.' },
  { k: 'vit', n: 'Vitality', d: 'Raises max HP.' },
];
function calcStats() {
  const j = J(),
    L = Math.max(1, P.lvl), // Lv 0 uses the Lv 1 base stats
    t2 = j.tier === 2,
    A = P.attr;
  let atkB = 0,
    spdB = 0,
    critB = 0,
    aspdB = 0,
    dodge = 0,
    dr = 0;
  for (const k in P.buffs) {
    const b = P.buffs[k];
    atkB += b.atk || 0;
    spdB += b.spd || 0;
    critB += b.crit || 0;
    aspdB += b.aspd || 0;
    dodge += b.dodge || 0;
    dr += b.dr || 0;
  }
  // passive skills (1st-job passives carry over to the 2nd job)
  const pb = { atk: 0, crit: 0, critMul: 0, range: 0, dodge: 0, spd: 0, dr: 0, hp: 0, poison: 0, double: 0, rage: 0 };
  for (const id of passivesOf(P.job)) {
    const lv = (P.learned || {})[id] || 0;
    if (!lv) continue;
    const b = passiveBonus(id, lv);
    for (const k in b) pb[k] += b[k];
  }
  // equipment + active pet (see data/items.js)
  const eq = { watk: 0, atk: 0, def: 0, hp: 0, mp: 0, crit: 0, dodge: 0, dr: 0, spd: 0, aspd: 0 };
  for (const s of SLOTS) {
    const it = P.equip && ITEMS[P.equip[s]];
    if (it) for (const k in eq) eq[k] += it[k] || 0;
  }
  const pk = (P.pet && PETS[P.pet] && PETS[P.pet].perk) || {};
  for (const k in pk) eq[k] += pk[k];
  // Level-ups only add Max HP: Attack, MP and Defense are flat per job. Attack = (job base + weapon) x % bonuses.
  const atk = (j.atk * (t2 ? 1.4 : 1) + eq.watk) * (1 + atkB + pb.atk + eq.atk) * rookieAtk(P.lvl);
  P.st = {
    max: Math.round(((j.hp[0] + j.hp[1] * (L - 1)) * (t2 ? 1.35 : 1) * (1 + pb.hp + eq.hp) + A.vit * VIT_HP) * curve(HERO_HP_MULT, L)),
    maxMp: Math.round(j.mp * (t2 ? 1.3 : 1) * (1 + eq.mp)),
    atk,
    strBonus: A.str * (1 + 0.03 * atk),
    dexBonus: A.dex * (1 + 0.03 * atk),
    def: j.def * (t2 ? 1.4 : 1) + eq.def,
    spd: j.spd * (1 + spdB + pb.spd + eq.spd),
    aspd: (1 + 0.01 * A.spd + eq.aspd + aspdB) * rookieSpd(P.lvl), // 100 Spd points = +100% (x2); headgear + necklace add the rest
    crit: Math.min(CRIT_MAX, j.crit + critB + pb.crit + eq.crit + A.luk * LUK_CRIT),
    critMul: CRIT_DMG_BASE + A.luk * LUK_CRITDMG + pb.critMul,
    dodge: Math.min(0.8, dodge + pb.dodge + eq.dodge + A.dod * 0.006),
    dr: Math.min(0.8, dr + pb.dr + eq.dr),
    rangeMul: 1 + pb.range, // Eagle Eye: bow attacks and arrow skills reach farther
    poisonMul: 1 + pb.poison,
    double: Math.min(0.9, pb.double), // Double Edge: chance for a basic attack to repeat
    rage: pb.rage, // Rage: max bonus damage, scaled by missing HP (see hitMob)
  };
}
function newPlayer(name, job) {
  P = {
    name,
    job,
    lvl: 0,
    exp: 0,
    mlvl: 0, // mastery level (2nd job only, see gainMastery)
    mexp: 0,
    gold: 60,
    attr: { str: 0, dex: 0, spd: 0, luk: 0, dod: 0, vit: 0 },
    ap: 0,
    sp: 0,
    learned: {},
    hpP: 5,
    mpP: 5,
    own: {}, // owned equipment ids
    equip: { weapon: null, armor: null, head: null, neck: null, chead: null, cbody: null, cback: null }, // chead / cbody / cback = costumes (no stats)
    mats: {}, // material id -> quantity
    pets: {}, // owned pet ids
    pet: null, // active pet id
    guild: null, // guild id (see npcs.js)
    guildName: '',
    guildLv: 0,
    vault: { gold: 0, items: {}, mats: {} }, // bank storage
    visited: { village: 1 }, // discovered maps (Warp Master)
    quest: null, // active hunting quest
    qdone: 0,
    petS: null, // active pet runtime state
    x: 0,
    y: 0,
    r: 12,
    face: Math.PI / 2, // default: facing front (down)
    hp: 1,
    mp: 1,
    atkCd: 0,
    atkCdMax: 0.5,
    cds: {},
    buffs: {},
    potCd: 0,
    swing: 0,
    swingDur: 0.2,
    dest: null,
    target: null,
    dash: null,
    iframes: 0,
    moving: 0,
    vx: 0, // current velocity (px/s), eased toward the wanted velocity (see MOVE_FEEL)
    vy: 0,
    mv: 0, // 0..1 how far into the walk cycle (eases the legs in and out)
    sq: 0, // squash / stretch impulse for the sprite (footfalls, stops, starts)
    stepIdx: 0,
    stepCd: 0,
    flash: 0,
    walk: 0,
    combat: 0,
    sit: false,
    sitT: 0, // 0 standing .. 1 fully seated (animation blend)
    sitAcc: { hp: 0, mp: 0, t: 0 },
  };
  calcStats();
  P.hp = P.st.max;
  P.mp = P.st.maxMp;
}
