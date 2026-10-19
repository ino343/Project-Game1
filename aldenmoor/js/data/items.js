/**
 * Equipment (weapons, armors, headgears) and pets.
 *
 * Gear is class-specific: each 1st-job family (waif / swordsman / archer, shared with its 2nd job)
 * has its own merchant NPC and its own item set. Slots: weapon, armor, head. Each set has 6 tiers.
 * ITEMS[id] = { id, n, slot, fam, tier, lv, price, col, kind?, atk, def, hp, mp, crit, dodge, dr }
 *   watk = flat Attack added by a weapon (the hero's own Attack never grows with level, so the weapon carries it),
 *   atk = +% damage (necklaces), hp / mp = +% max HP / MP, def = flat defense, crit / dodge / dr = +chance (0.01 = 1%), aspd = +attack speed (headgear + necklace only).
 * PETS[id]  = { id, n, lv, price, perk:{atk,crit,dodge,spd,hp,dr}, ... }  (one active pet at a time)
 */
const SLOTS = ['weapon', 'armor', 'head', 'neck'];
const SLOT_NAME = { weapon: 'Weapon', armor: 'Armor', head: 'Headgear', neck: 'Necklace' };
const JOB_FAM = { waif: 'waif', assassin: 'waif', swordsman: 'swordsman', knight: 'swordsman', archer: 'archer', ranger: 'archer' };
const FAM_NAME = { waif: 'Waif / Assassin', swordsman: 'Swordsman / Knight', archer: 'Archer / Ranger' };
const famOf = (job) => JOB_FAM[job];

const GEAR_TIER_LV = [5, 15, 30, 45, 60, 80];
// MMORPG-style item grades. Tiers 1-6 = shop gear, 7-9 = 2nd-job gear. Item colour = grade colour.
const GRADES = [
  { n: 'Common', c: '#b9c2cc' },
  { n: 'Uncommon', c: '#5fd37a' },
  { n: 'Rare', c: '#4aa8ff' },
  { n: 'Epic', c: '#b36bff' },
  { n: 'Legendary', c: '#ffa63a' },
  { n: 'Mythic', c: '#ff5a5a' },
  { n: 'Ancient', c: '#ff6bd6' },
  { n: 'Eternal', c: '#43f0e0' },
  { n: 'Divine', c: '#fff08a' },
];
const gradeOf = (it) => GRADES[Math.min(GRADES.length, Math.max(1, it.tier)) - 1];
const GEAR_TIER_COL = GRADES.slice(0, 6).map((g) => g.c);
const GEAR_PRICE = [250, 1200, 5000, 17000, 45000, 110000]; // 1st-job weapon price; armor x0.7, headgear x0.5, necklace x0.6
// Weapon Attack (flat). Level-ups give no Attack, so the weapon is the main source of it: each tier roughly doubles it.
const W_ATK = [11, 44, 104, 184, 290, 465];
const W_CRIT = [0, 0, 0.01, 0.02, 0.04, 0.06];
const A_DEF = [3, 10, 25, 50, 90, 150];
const A_HP = [0.04, 0.08, 0.12, 0.17, 0.22, 0.3];
const H_DEF = [2, 6, 15, 30, 55, 90];
const H_MP = [0.05, 0.08, 0.12, 0.16, 0.2, 0.25];
// Attack speed on headgear + necklace (+1.0 = +100%), tiers 1-9. Best 2nd-job head + neck (1.0 + 1.0) with 100 Spd points = x4.00.
const ASPD_T = [0.03, 0.06, 0.1, 0.15, 0.21, 0.28, 0.45, 0.7, 1.0];
const H_EX = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06]; // class flavour on headgear: waif dodge, swordsman dmg reduction, archer crit

const GEAR_NAMES = {
  waif: {
    weapon: ['Iron Dagger', 'Steel Stiletto', 'Venom Fang', 'Shadow Kris', 'Moonlit Kukri', 'Void Reaper'],
    armor: ['Street Hoodie', 'Urban Parka', 'Shadow Windbreaker', 'Nightweave Jacket', 'Phantom Techwear', 'Voidsilk Coat'],
    head: ['Street Cap', 'Neon Bandana', 'Shadow Beanie', 'Nightmask Hood', 'Phantom Visor', 'Voidveil Headset'],
    headKind: 'hood',
  },
  swordsman: {
    weapon: ['Iron Sword', 'Steel Longsword', 'Mithril Blade', 'Flamebrand', 'Dragonfang Claymore', 'Dawnbreaker'],
    armor: ['Varsity Jacket', 'Bomber Jacket', 'Tactical Vest', 'Knight Overcoat', 'Dragonscale Trench', 'Dawnforged Longcoat'],
    head: ['Sports Headband', 'Steel Snapback', 'Knight Beret', 'Crested Visor', 'Dragon Headset', 'Crown of Dawn'],
    headKind: 'helm',
  },
  archer: {
    weapon: ['Hunter Bow', 'Oak Longbow', 'Elven Bow', 'Windpiercer', 'Stormcaller Bow', 'Celestial Bow'],
    armor: ['Hunter Utility Vest', 'Ranger Field Jacket', 'Forest Parka', 'Wind Shell', 'Stormweave Parka', 'Starlit Trench'],
    head: ['Feather Cap', 'Ranger Bucket Hat', 'Scout Goggles', 'Wind Beanie', 'Storm Visor', 'Star Tiara'],
    headKind: 'cap',
  },
};

const ITEMS = {};
for (const fam in GEAR_NAMES) {
  const N = GEAR_NAMES[fam];
  for (let t = 0; t < 6; t++) {
    const base = { fam, tier: t + 1, lv: GEAR_TIER_LV[t], col: GEAR_TIER_COL[t] };
    const w = { ...base, id: fam + '_weapon_' + (t + 1), n: N.weapon[t], slot: 'weapon', price: GEAR_PRICE[t], watk: W_ATK[t] };
    if (W_CRIT[t]) w.crit = W_CRIT[t];
    const a = { ...base, id: fam + '_armor_' + (t + 1), n: N.armor[t], slot: 'armor', price: Math.round(GEAR_PRICE[t] * 0.7), def: A_DEF[t], hp: A_HP[t] };
    const h = { ...base, id: fam + '_head_' + (t + 1), n: N.head[t], slot: 'head', kind: N.headKind, price: Math.round(GEAR_PRICE[t] * 0.5), def: H_DEF[t], mp: H_MP[t], aspd: ASPD_T[t] };
    if (fam === 'waif') h.dodge = H_EX[t];
    else if (fam === 'swordsman') h.dr = H_EX[t];
    else h.crit = H_EX[t];
    ITEMS[w.id] = w;
    ITEMS[a.id] = a;
    ITEMS[h.id] = h;
  }
}
// Necklaces are not class-specific (fam 'all'): any job can wear them.
const NECK_NAMES = ['Dog Tag Chain', 'Silver Locket', 'Emerald Pendant', 'Amethyst Choker', 'Sunfire Talisman', 'Starheart Necklace'];
const N_ATK = [0.02, 0.04, 0.06, 0.09, 0.12, 0.16];
const N_HP = [0.02, 0.04, 0.06, 0.08, 0.1, 0.14];
for (let t = 0; t < 6; t++) {
  const n = { id: 'all_neck_' + (t + 1), n: NECK_NAMES[t], slot: 'neck', fam: 'all', tier: t + 1, lv: GEAR_TIER_LV[t], col: GEAR_TIER_COL[t], price: Math.round(GEAR_PRICE[t] * 0.6), atk: N_ATK[t], hp: N_HP[t], aspd: ASPD_T[t] };
  ITEMS[n.id] = n;
}
// 2nd-job gear (j2: 1) needs a 2nd job (Knight / Assassin / Ranger); class gear also needs the right family.
const usableBy = (it, job) => (!it.j2 || JOBS[job].tier === 2) && (it.fam === 'all' || it.fam === famOf(job));
const reqLine = (it, job) => (it.j2 && JOBS[job].tier !== 2 ? '2nd job only' : FAM_NAME[it.fam] + ' only');

/* ---- 2nd-job gear: 3 weapons, 3 armors, 3 headgears per class + 3 necklaces (tiers 7-9, level 40 / 60 / 85) ---- */
const J2_LV = [40, 60, 85];
const J2_COL = GRADES.slice(6).map((g) => g.c);
const J2_PRICE = [60000, 160000, 400000]; // weapon price; armor x0.7, headgear x0.5, necklace x0.6
const J2_ATK = [280, 540, 1020]; // weapon Attack (flat)
const J2_CRIT = [0.03, 0.05, 0.08];
const J2_A_DEF = [70, 130, 220];
const J2_A_HP = [0.2, 0.3, 0.42];
const J2_H_DEF = [45, 80, 130];
const J2_H_MP = [0.18, 0.25, 0.32];
const J2_H_EX = [0.05, 0.07, 0.09];
const J2_NAMES = {
  waif: {
    weapon: ['Nightfall Katars', 'Eclipse Fangs', 'Whisper of Oblivion'],
    armor: ['Nightstalker Techwear', 'Eclipse Shell Jacket', 'Oblivion Longcoat'],
    head: ['Nightstalker Mask', 'Eclipse Hood', 'Oblivion Visor'],
  },
  swordsman: {
    weapon: ['Crusader Greatsword', 'Seraphic Claymore', 'Sovereign Edge'],
    armor: ['Crusader Greatcoat', 'Seraphic Tailcoat', 'Sovereign Longcoat'],
    head: ['Crusader Visor', 'Seraphic Crown', 'Sovereign Crown'],
  },
  archer: {
    weapon: ['Gale Warbow', 'Tempest Longbow', 'Skyfall Greatbow'],
    armor: ['Windrunner Parka', 'Tempest Shell', 'Skyfall Trenchcoat'],
    head: ['Windrunner Cap', 'Tempest Headset', 'Skyfall Diadem'],
  },
};
const J2_NECK = ['Mythril Locket', 'Dragonheart Pendant', 'Celestial Amulet'];
const J2_N_ATK = [0.15, 0.22, 0.3];
const J2_N_HP = [0.12, 0.18, 0.25];
for (const fam in J2_NAMES) {
  const N = J2_NAMES[fam];
  for (let t = 0; t < 3; t++) {
    const base = { fam, tier: 7 + t, lv: J2_LV[t], col: J2_COL[t], j2: 1 };
    const w = { ...base, id: fam + '_weapon_' + (7 + t), n: N.weapon[t], slot: 'weapon', price: J2_PRICE[t], watk: J2_ATK[t], crit: J2_CRIT[t] };
    const a = { ...base, id: fam + '_armor_' + (7 + t), n: N.armor[t], slot: 'armor', price: Math.round(J2_PRICE[t] * 0.7), def: J2_A_DEF[t], hp: J2_A_HP[t] };
    const h = { ...base, id: fam + '_head_' + (7 + t), n: N.head[t], slot: 'head', kind: GEAR_NAMES[fam].headKind, price: Math.round(J2_PRICE[t] * 0.5), def: J2_H_DEF[t], mp: J2_H_MP[t], aspd: ASPD_T[6 + t] };
    if (fam === 'waif') h.dodge = J2_H_EX[t];
    else if (fam === 'swordsman') h.dr = J2_H_EX[t];
    else h.crit = J2_H_EX[t];
    ITEMS[w.id] = w;
    ITEMS[a.id] = a;
    ITEMS[h.id] = h;
  }
}
for (let t = 0; t < 3; t++) {
  const n = { id: 'all_neck_' + (7 + t), n: J2_NECK[t], slot: 'neck', fam: 'all', tier: 7 + t, lv: J2_LV[t], col: J2_COL[t], j2: 1, price: Math.round(J2_PRICE[t] * 0.6), atk: J2_N_ATK[t], hp: J2_N_HP[t], aspd: ASPD_T[6 + t] };
  ITEMS[n.id] = n;
}
const itemsFor = (fam, slot) => Object.values(ITEMS).filter((i) => (i.fam === fam || i.fam === 'all') && i.slot === slot).sort((a, b) => a.tier - b.tier);
const sellPrice = (it) => Math.round(it.price * 0.4);

// Short text for an item's stats.
function itemLine(it) {
  const pc = (v) => Math.round(v * 1000) / 10 + '%',
    p = [];
  if (it.watk) p.push('+' + it.watk + ' attack');
  if (it.atk) p.push('+' + pc(it.atk) + ' damage');
  if (it.def) p.push('+' + it.def + ' defense');
  if (it.hp) p.push('+' + pc(it.hp) + ' max HP');
  if (it.mp) p.push('+' + pc(it.mp) + ' max MP');
  if (it.crit) p.push('+' + pc(it.crit) + ' crit');
  if (it.dodge) p.push('+' + pc(it.dodge) + ' dodge');
  if (it.dr) p.push(pc(it.dr) + ' less damage taken');
  if (it.aspd) p.push('+' + pc(it.aspd) + ' attack speed');
  return p.join(' · ');
}
// Stat lines as separate pieces (for the MMORPG-style item cards): [{ k: 'atk', t: '+25% Damage' }, ...]
function itemStats(it) {
  const pc = (v) => Math.round(v * 1000) / 10 + '%',
    p = [];
  if (it.watk) p.push({ k: 'atk', t: '+' + it.watk + ' Attack' });
  if (it.atk) p.push({ k: 'atk', t: '+' + pc(it.atk) + ' Damage' });
  if (it.def) p.push({ k: 'def', t: '+' + it.def + ' Defense' });
  if (it.hp) p.push({ k: 'hp', t: '+' + pc(it.hp) + ' Max HP' });
  if (it.mp) p.push({ k: 'mp', t: '+' + pc(it.mp) + ' Max MP' });
  if (it.crit) p.push({ k: 'crit', t: '+' + pc(it.crit) + ' Crit' });
  if (it.dodge) p.push({ k: 'dodge', t: '+' + pc(it.dodge) + ' Dodge' });
  if (it.dr) p.push({ k: 'dr', t: pc(it.dr) + ' Damage Reduction' });
  if (it.aspd) p.push({ k: 'aspd', t: '+' + pc(it.aspd) + ' Attack Speed' });
  return p;
}

/* ---------------- pets ---------------- */
const PETS = {
  jelly: {
    n: 'Jelly', lv: 1, price: 300, shape: 'slime', col: '#6fd36b', col2: '#3a9e45',
    perk: { hp: 0.06 }, d: 'A bouncy little slime. Makes you tougher.',
  },
  fang: {
    n: 'Fang', lv: 10, price: 1500, shape: 'wolf', col: '#9aa3ad', col2: '#e8eef2',
    perk: { atk: 0.06 }, d: 'A fierce wolf pup that sharpens your strikes.',
  },
  whisker: {
    n: 'Whisker', lv: 20, price: 5000, shape: 'cat', col: '#f0a64a', col2: '#fff1d0',
    perk: { crit: 0.04, dodge: 0.03 }, d: 'A sly cat with a knack for weak spots.',
  },
  hoot: {
    n: 'Hoot', lv: 30, price: 12000, shape: 'owl', col: '#8a6a4a', col2: '#e8d6b0',
    perk: { spd: 0.08, dodge: 0.03 }, d: 'A wise owl that helps you move faster.',
  },
  bruno: {
    n: 'Bruno', lv: 45, price: 35000, shape: 'bear', col: '#7a4a2a', col2: '#d9b48a',
    perk: { hp: 0.1, dr: 0.04 }, d: 'A sturdy bear cub that shields you from harm.',
  },
  ember: {
    n: 'Ember', lv: 60, price: 90000, shape: 'dragon', col: '#e0483a', col2: '#ffd27a',
    perk: { atk: 0.12, crit: 0.05 }, d: 'A baby dragon that breathes power into every strike.',
  },
};
for (const k in PETS) PETS[k].id = k;
function petLine(p) {
  const pc = (v) => Math.round(v * 1000) / 10 + '%',
    n = { atk: 'damage', crit: 'crit', dodge: 'dodge', spd: 'move speed', hp: 'max HP', dr: 'less damage taken' },
    o = [];
  for (const k in p.perk) o.push((k === 'dr' ? '' : '+') + pc(p.perk[k]) + ' ' + n[k]);
  return o.join(' · ');
}
