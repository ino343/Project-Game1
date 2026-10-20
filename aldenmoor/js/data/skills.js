/**
 * Skill definitions (SK).
 */
const SK = {
  stab: {
    n: 'Backstab Dash',
    ab: 'BD',
    kind: 'dash',
    dist: 150,
    mult: 1.8,
    mp: 8,
    cd: 3,
    col: '#c9a0ff',
    d: 'Dash forward and slash everything in your path.',
  },
  venom: {
    n: 'Venom Edge',
    ab: 'VE',
    kind: 'arc',
    range: 58,
    arc: 2.2,
    mult: 1.3,
    poison: { m: 0.35, t: 5 },
    mp: 10,
    cd: 4,
    col: '#8be36a',
    d: 'Poisoned slash. The poison keeps damaging the target.',
  },
  flurry: {
    n: 'Blade Flurry',
    ab: 'BF',
    kind: 'nova',
    radius: 78,
    mult: 2.6,
    mp: 20,
    cd: 8,
    col: '#c9a0ff',
    d: 'Spin and slash the enemy in front of you.',
  },
  shadow: {
    n: 'Shadow Strike',
    ab: 'SH',
    kind: 'dash',
    dist: 210,
    mult: 3,
    mp: 10,
    cd: 3,
    col: '#7d5cff',
    d: 'Long shadow dash with heavy damage.',
  },
  deadly: {
    n: 'Deadly Venom',
    ab: 'DV',
    kind: 'arc',
    range: 66,
    arc: 2.4,
    mult: 2,
    poison: { m: 0.6, t: 6 },
    mp: 14,
    cd: 4,
    col: '#5fe08a',
    d: 'Strong slash with lethal poison.',
  },
  vanish: {
    n: 'Vanish',
    ab: 'VA',
    kind: 'buff',
    t: 8,
    spd: 0.6,
    dodge: 0.6,
    crit: 0.35,
    mp: 16,
    cd: 16,
    col: '#9aa4ff',
    d: 'Fade from sight: faster, harder to hit, and deadlier.',
  },
  bladestorm: {
    n: 'Blade Storm',
    ab: 'BS',
    kind: 'nova',
    radius: 115,
    mult: 5,
    mp: 30,
    cd: 10,
    col: '#9a7bff',
    d: 'A storm of blades around you.',
  },
  slash: {
    n: 'Power Slash',
    ab: 'PS',
    kind: 'arc',
    range: 82,
    arc: 2.0,
    mult: 2,
    kb: 70,
    mp: 8,
    cd: 2.5,
    col: '#ffd27a',
    d: 'A wide, heavy slash that pushes enemies back.',
  },
  bash: {
    n: 'Shield Bash',
    ab: 'SB',
    kind: 'arc',
    range: 58,
    arc: 1.5,
    mult: 1.4,
    stun: 1.6,
    kb: 40,
    mp: 10,
    cd: 6,
    col: '#9ec9ff',
    d: 'Slam your shield into the enemies in front of you, stunning them.',
  },
  whirl: {
    n: 'Whirlwind',
    ab: 'WW',
    kind: 'nova',
    radius: 98,
    mult: 3,
    kb: 40,
    mp: 20,
    cd: 8,
    col: '#ffd27a',
    d: 'Whirl your blade around you.',
  },
  holy: {
    n: 'Holy Strike',
    ab: 'HS',
    kind: 'arc',
    range: 92,
    arc: 2.0,
    mult: 3,
    heal: 0.06,
    mp: 14,
    cd: 3,
    col: '#fff1a8',
    d: 'Radiant slash that heals you when it hits.',
  },
  guard: {
    n: 'Iron Guard',
    ab: 'IG',
    kind: 'buff',
    t: 8,
    dr: 0.5,
    mp: 14,
    cd: 16,
    col: '#9ec9ff',
    d: 'Brace behind your shield and take far less damage.',
  },
  charge: {
    n: 'Shield Charge',
    ab: 'SC',
    kind: 'dash',
    dist: 225,
    mult: 2.6,
    stun: 1.5,
    mp: 16,
    cd: 8,
    col: '#9ec9ff',
    d: 'Charge forward and stun enemies.',
  },
  judge: {
    n: 'Judgement',
    ab: 'JD',
    kind: 'nova',
    radius: 135,
    mult: 5,
    stun: 1,
    mp: 32,
    cd: 12,
    col: '#fff1a8',
    d: 'Heavenly blast stuns enemies around you.',
  },
  dshot: {
    n: 'Double Shot',
    ab: 'DS',
    kind: 'proj',
    count: 2,
    spread: 0.2,
    mult: 1.2,
    speed: 560,
    range: 360,
    mp: 8,
    cd: 2.5,
    col: '#a7e26a',
    d: 'Fire two arrows at once.',
  },
  pierce: {
    n: 'Piercing Arrow',
    ab: 'PA',
    kind: 'proj',
    count: 1,
    spread: 0,
    mult: 2.1,
    pierce: 5,
    speed: 720,
    range: 420,
    mp: 12,
    cd: 4,
    col: '#7fd6ff',
    d: 'A fast, hard-hitting arrow at a single enemy.',
  },
  rain: {
    n: 'Arrow Rain',
    ab: 'AR',
    kind: 'rain',
    r: 85,
    mult: 2.2,
    ticks: 1,
    range: 340,
    mp: 18,
    cd: 8,
    col: '#a7e26a',
    d: 'Rain arrows on the target area.',
  },
  triple: {
    n: 'Triple Shot',
    ab: 'TS',
    kind: 'proj',
    count: 3,
    spread: 0.34,
    mult: 1.6,
    speed: 600,
    range: 400,
    mp: 12,
    cd: 2.5,
    col: '#a7e26a',
    d: 'Fire three arrows in a fan.',
  },
  explo: {
    n: 'Explosive Arrow',
    ab: 'EX',
    kind: 'proj',
    count: 1,
    spread: 0,
    mult: 3.5,
    splash: 85,
    speed: 620,
    range: 420,
    mp: 16,
    cd: 5,
    col: '#ff9a4d',
    d: 'Explodes on impact for heavy damage to the target.',
  },
  storm: {
    n: 'Arrow Storm',
    ab: 'AS',
    kind: 'rain',
    r: 125,
    mult: 2.2,
    ticks: 4,
    range: 380,
    mp: 30,
    cd: 12,
    col: '#7fd6ff',
    d: 'Four waves of arrows on the target area.',
  },
  hawk: {
    n: 'Power Draw',
    ab: 'PD',
    kind: 'buff',
    t: 12,
    atk: 0.7,
    mp: 18,
    cd: 22,
    col: '#ff9a4d',
    d: 'Draw the bow to its limit: your arrows deal much more damage.',
  },


  /* ===== 1st-job passives (always active once learned; bonus PER SKILL LEVEL; carried into the 2nd job) =====
   * pas keys: atk (damage), crit, critMul (crit damage), range (bow/arrow reach), dodge, spd (move speed),
   * dr (damage taken), hp (max HP), poison (poison damage). */
  eagle: {
    n: 'Eagle Eye',
    ab: 'EE',
    kind: 'passive',
    pas: { range: 0.04 },
    col: '#7fd6ff',
    d: 'Passive. Your arrows fly farther: every level extends the range of your bow attacks (big boost) and arrow skills.',
  },
  bowmastery: {
    n: 'Bow Mastery',
    ab: 'BM',
    kind: 'passive',
    pas: { atk: 0.03 },
    col: '#a7e26a',
    d: 'Passive. Years of practice make every shot hit harder.',
  },
  focus: {
    n: 'Deadeye Focus',
    ab: 'DF',
    kind: 'passive',
    pas: { crit: 0.01 },
    col: '#ffd27a',
    d: 'Passive. Aim for the weak spots: raises your critical hit rate.',
  },
  poisonmastery: {
    n: 'Poison Mastery',
    ab: 'PM',
    kind: 'passive',
    pas: { poison: 0.06 },
    col: '#8be36a',
    d: 'Passive. Your poisons are far deadlier.',
  },
  nimble: {
    n: 'Nimble Body',
    ab: 'NB',
    kind: 'passive',
    pas: { dodge: 0.008, spd: 0.006 },
    col: '#c9a0ff',
    d: 'Passive. Light on your feet: more dodge and a little more move speed.',
  },
  lethaledge: {
    n: 'Lethal Edge',
    ab: 'LE',
    kind: 'passive',
    pas: { critMul: 0.04, crit: 0.004 },
    col: '#ff6a8a',
    d: 'Passive. Critical hits cut deeper: more crit damage and a bit more crit rate.',
  },
  doubleedge: {
    n: 'Double Edge',
    ab: 'DE',
    kind: 'passive',
    pas: { double: 0.02 },
    col: '#e0d0ff',
    d: 'Passive. Your normal attacks have a chance to strike twice in a row.',
  },
  rage: {
    n: 'Rage',
    ab: 'RG',
    kind: 'passive',
    max: 5, // Rage tops out at Lv 5 (every other skill uses SKILL_MAX)
    pas: { rage: 0.2 }, // +20% damage per level at near 0 HP -> +100% at Lv 5, scaling with missing HP (see hitMob)
    col: '#ff4a3a',
    d: 'Passive. The lower your HP, the harder you hit. The bonus grows as you lose health (full bonus near 0 HP). Max Lv 5.',
  },
  swordmastery: {
    n: 'Sword Mastery',
    ab: 'SW',
    kind: 'passive',
    pas: { atk: 0.03 },
    col: '#ffd27a',
    d: 'Passive. Mastery of the blade raises all of your damage.',
  },
  ironbody: {
    n: 'Iron Body',
    ab: 'IB',
    kind: 'passive',
    pas: { hp: 0.03 },
    col: '#e0604d',
    d: 'Passive. A hardened body with more max HP.',
  },
  toughskin: {
    n: 'Tough Skin',
    ab: 'TK',
    kind: 'passive',
    pas: { dr: 0.01 },
    col: '#9ec9ff',
    d: 'Passive. Take less damage from every monster attack.',
  },

  /* ===== New 2nd-job buffs: attack speed and damage ===== */
  haste: {
    n: 'Shadow Haste',
    ab: 'SZ',
    kind: 'buff',
    t: 10,
    aspd: 0.6,
    spd: 0.15,
    mp: 14,
    cd: 20,
    col: '#9aa4ff',
    d: 'Move like a shadow: attack much faster and run quicker.',
  },
  instinct: {
    n: 'Killer Instinct',
    ab: 'KI',
    kind: 'buff',
    t: 12,
    atk: 0.45,
    crit: 0.15,
    mp: 16,
    cd: 22,
    col: '#ff6a8a',
    d: 'Lock onto weak spots: more damage and critical chance.',
  },
  fury: {
    n: 'Battle Fury',
    ab: 'FU',
    kind: 'buff',
    t: 12,
    atk: 0.35,
    aspd: 0.4,
    mp: 18,
    cd: 22,
    col: '#ff8a5c',
    d: 'Fight in a rage: more damage and faster attacks.',
  },
  rapid: {
    n: 'Rapid Fire',
    ab: 'RF',
    kind: 'buff',
    t: 10,
    aspd: 0.7,
    mp: 14,
    cd: 20,
    col: '#7fd6ff',
    d: 'Loose arrows at a blistering pace: much faster attack speed.',
  },


  /* ===== More 2nd-job skills ===== */
  phantom: {
    n: 'Phantom Slash',
    ab: 'PH',
    kind: 'dash',
    dist: 240,
    mult: 3.4,
    mp: 14,
    cd: 5,
    col: '#7d5cff',
    d: 'A very long dash that cuts everything in its way.',
  },
  crimson: {
    n: 'Crimson Fang',
    ab: 'CF',
    kind: 'arc',
    range: 70,
    arc: 2.2,
    mult: 3.2,
    poison: { m: 0.8, t: 6 },
    mp: 15,
    cd: 5,
    col: '#ff5a7a',
    d: 'A brutal slash with a lethal bleed-poison.',
  },
  tempest: {
    n: 'Dagger Tempest',
    ab: 'DT',
    kind: 'rain',
    r: 100,
    mult: 2.4,
    ticks: 3,
    range: 300,
    mp: 28,
    cd: 11,
    col: '#9a7bff',
    d: 'A storm of daggers falls on the target area.',
  },
  execute: {
    n: 'Execution',
    ab: 'EC',
    kind: 'arc',
    range: 60,
    arc: 1.2,
    mult: 6,
    mp: 24,
    cd: 10,
    col: '#ff3a5a',
    d: 'A single devastating finishing blow.',
  },
  smite: {
    n: 'Divine Smite',
    ab: 'SM',
    kind: 'arc',
    range: 100,
    arc: 1.8,
    mult: 3.6,
    mp: 18,
    cd: 5,
    col: '#fff1a8',
    d: 'A long-reaching blow of holy light.',
  },
  radiant: {
    n: 'Radiant Burst',
    ab: 'RB',
    kind: 'nova',
    radius: 120,
    mult: 3.0,
    mp: 24,
    cd: 9,
    col: '#fff1a8',
    d: 'A burst of light that damages all around you.',
  },
  shieldslam: {
    n: 'Shield Slam',
    ab: 'SL',
    kind: 'arc',
    range: 66,
    arc: 1.8,
    mult: 2.8,
    stun: 2.0,
    kb: 60,
    mp: 14,
    cd: 7,
    col: '#9ec9ff',
    d: 'A crushing slam that stuns and shoves.',
  },
  aura: {
    n: 'Blessed Aura',
    ab: 'BL',
    kind: 'buff',
    t: 14,
    atk: 0.25,
    dr: 0.2,
    mp: 18,
    cd: 24,
    col: '#fff1a8',
    d: 'A holy aura: more damage and less damage taken.',
  },
  rush: {
    n: 'Crusader Rush',
    ab: 'CR',
    kind: 'dash',
    dist: 260,
    mult: 3.0,
    stun: 1.2,
    mp: 20,
    cd: 10,
    col: '#ffd27a',
    d: 'A thundering charge that stuns on contact.',
  },
  deadshot: {
    n: 'Deadly Shot',
    ab: 'DY',
    kind: 'proj',
    count: 1,
    spread: 0,
    mult: 5.5,
    pierce: 2,
    speed: 900,
    range: 560,
    mp: 24,
    cd: 9,
    col: '#ff6a6a',
    d: 'A lethal, piercing shot from extreme range.',
  },
  barrage: {
    n: 'Multi Barrage',
    ab: 'MB',
    kind: 'proj',
    count: 7,
    spread: 0.7,
    mult: 1.5,
    speed: 620,
    range: 380,
    mp: 22,
    cd: 7,
    col: '#a7e26a',
    d: 'Seven arrows in a wide spread.',
  },
  frostarrow: {
    n: 'Frost Arrow',
    ab: 'FR',
    kind: 'proj',
    count: 1,
    spread: 0,
    mult: 2.6,
    stun: 1.8,
    speed: 640,
    range: 420,
    mp: 16,
    cd: 8,
    col: '#9fe8ff',
    d: 'A freezing arrow that stuns its target.',
  },
  meteor: {
    n: 'Meteor Arrow',
    ab: 'MA',
    kind: 'rain',
    r: 100,
    mult: 3.8,
    ticks: 1,
    range: 400,
    mp: 26,
    cd: 12,
    col: '#ff9a4d',
    d: 'Call a single massive arrow down on the target area.',
  },
  sharpeyes: {
    n: 'Sharp Eyes',
    ab: 'SE',
    kind: 'buff',
    t: 14,
    crit: 0.4,
    mp: 16,
    cd: 24,
    col: '#ffd27a',
    d: 'Spot every weak point: a much higher critical chance.',
  },
};

/**
 * Skill levels: every skill can be leveled 1..SKILL_MAX with skill points.
 * skillDef(id, lv) returns the skill with its stats scaled for that level.
 *   damage x1.06 per level, cooldown -1.5% per level, MP cost +2% per level,
 *   range / area +1.2% per level, buffs +4% strength and +0.3s per level,
 *   +1 projectile at Lv 8 and Lv 15, +1 rain wave at Lv 8 and 15.
 */
const SKILL_MAX = 15;
// Highest level of one skill: SKILL_MAX unless the skill sets its own `max` (Rage = 5).
const skillMax = (id) => Math.min(SKILL_MAX, (SK[id] && SK[id].max) || SKILL_MAX);
const _skillCache = {};
function skillDef(id, lv) {
  lv = Math.max(1, Math.min(skillMax(id), Math.floor(lv) || 1));
  const key = id + ':' + lv;
  if (_skillCache[key]) return _skillCache[key];
  const b = SK[id],
    k = lv - 1;
  if (b.kind === 'passive') return (_skillCache[key] = { ...b, id, lv });
  if (!k) return (_skillCache[key] = b);
  const d = { ...b },
    f = 1 + 0.06 * k,
    r2 = (v) => Math.round(v * 100) / 100;
  d.cd = Math.max(0.5, Math.round(b.cd * (1 - 0.015 * k) * 10) / 10);
  d.mp = Math.ceil(b.mp * (1 + 0.02 * k));
  if (b.mult) d.mult = r2(b.mult * f);
  for (const a of ['range', 'radius', 'r', 'splash']) if (b[a]) d[a] = Math.round(b[a] * (1 + 0.012 * k));
  if (b.dist) d.dist = Math.round(b.dist * (1 + 0.012 * k));
  if (b.poison) d.poison = { m: r2(b.poison.m * f), t: b.poison.t };
  if (b.stun) d.stun = r2(b.stun + 0.03 * k);
  if (b.heal) d.heal = r2(b.heal + 0.003 * k);
  if (b.kind === 'proj' && b.count > 1) d.count = b.count + (lv >= 8 ? 1 : 0) + (lv >= 15 ? 1 : 0);
  if (b.pierce) d.pierce = b.pierce + Math.floor(k / 5);
  if (b.kind === 'rain') d.ticks = b.ticks + (b.ticks > 1 ? (lv >= 8 ? 1 : 0) + (lv >= 15 ? 1 : 0) : 0);
  if (b.kind === 'buff') {
    d.t = r2(b.t + 0.3 * k);
    for (const a of ['atk', 'aspd', 'spd', 'crit', 'dodge', 'dr']) if (b[a]) d[a] = r2(b[a] * (1 + 0.04 * k));
  }
  return (_skillCache[key] = d);
}
// Total passive bonus (stat -> amount) a passive gives at a level.
function passiveBonus(id, lv) {
  const o = {};
  for (const a in SK[id].pas) o[a] = SK[id].pas[a] * lv;
  return o;
}
// One-line summary of what a skill does at a given level (for the skill list and tooltips).
function skillLine(d) {
  const pc = (v) => Math.round(v * 10000) / 100 + '%',
    p = [];
  if (d.kind === 'passive') {
    const b = passiveBonus(d.id, d.lv),
      names = { atk: 'damage', crit: 'crit rate', critMul: 'crit damage', range: 'range', dodge: 'dodge', spd: 'move speed', dr: 'less damage taken', hp: 'max HP', poison: 'poison damage', double: 'chance to double attack', rage: 'damage at near 0 HP' };
    for (const a in b) p.push((a === 'dr' ? '' : '+') + pc(b[a]) + ' ' + names[a]);
    return p.join(' · ');
  }
  if (d.kind === 'buff') {
    if (d.atk) p.push('+' + pc(d.atk) + ' damage');
    if (d.aspd) p.push('+' + pc(d.aspd) + ' atk speed');
    if (d.spd) p.push('+' + pc(d.spd) + ' move speed');
    if (d.crit) p.push('+' + pc(d.crit) + ' crit');
    if (d.dodge) p.push('+' + pc(d.dodge) + ' dodge');
    if (d.dr) p.push(pc(d.dr) + ' less damage taken');
    p.push(d.t.toFixed(1) + 's');
  } else {
    let x = 'Damage ' + pc(d.mult);
    if (d.kind === 'proj' && d.count > 1) x += ' ×' + d.count;
    if (d.kind === 'rain' && d.ticks > 1) x += ' ×' + d.ticks;
    p.push(x);
    if (d.poison) p.push('poison ' + pc(d.poison.m) + ' ×' + d.poison.t + 's');
    if (d.stun) p.push('stun ' + d.stun.toFixed(1) + 's');
    if (d.heal) p.push('heal ' + pc(d.heal));
  }
  p.push('MP ' + d.mp + ', CD ' + d.cd + 's');
  return p.join(' · ');
}
