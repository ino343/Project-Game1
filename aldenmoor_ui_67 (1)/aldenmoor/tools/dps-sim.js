/**
 * Dev helper: estimates the sustained basic-attack DPS of a "typical" hero at several levels, to re-tune REF_DPS in
 * js/data/config.js whenever gear, crit or attribute numbers change.   Run:  node tools/dps-sim.js [L,L,L...]
 *
 * Typical hero = best gear the level allows (weapon / armor / head / neck), 3 points per level spent as
 * 40% main damage stat (Str or Dex), 30% Spd, 20% Luk, 10% Vit (each capped at STAT_MAX).
 * Level itself adds no Attack, so DPS only moves with gear tiers and points. Skills are not simulated, so multiply by
 * about 1.0-2.0 (the skill factor shrinks as levels rise) before using a value as a REF_DPS anchor.
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..', 'js', 'data');
const ctx = vm.createContext({ console, Math });
for (const f of ['config.js', 'jobs.js', 'items.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const get = (e) => vm.runInContext(e, ctx);
const JOBS = get('JOBS'), ITEMS = get('ITEMS'), usableBy = get('usableBy');
const FAMS = { waif: ['waif', 'assassin'], swordsman: ['swordsman', 'knight'], archer: ['archer', 'ranger'] };
function dps(fam, L) {
  const job = L <= 50 ? FAMS[fam][0] : FAMS[fam][1], j = JOBS[job];
  const eq = { watk: 0, atk: 0, crit: 0, aspd: 0 };
  for (const slot of ['weapon', 'armor', 'head', 'neck']) {
    let best = null;
    for (const it of Object.values(ITEMS)) if (it.slot === slot && usableBy(it, job) && it.lv <= L && (!best || it.tier > best.tier)) best = it;
    if (best) for (const k in eq) eq[k] += best[k] || 0;
  }
  const AP = 3 * L, cap = (v) => Math.min(get('STAT_MAX'), v);
  const main = cap(AP * 0.4), spd = cap(AP * 0.3), luk = cap(AP * 0.2);
  const atk = (j.atk * (j.tier === 2 ? 1.4 : 1) + eq.watk) * (1 + eq.atk);
  const bonus = main * (1 + 0.03 * atk);
  const c = Math.min(get('CRIT_MAX'), j.crit + eq.crit + luk * get('LUK_CRIT'));
  const m = get('CRIT_DMG_BASE') + luk * get('LUK_CRITDMG');
  return ((atk + bonus) * j.basic.mult * (1 + c * (m - 1)) * (1 + 0.01 * spd + eq.aspd)) / j.basic.cd;
}
const Ls = (process.argv[2] || '1,5,10,15,20,30,45,50,51,60,70,80,85,100').split(',').map(Number);
console.log('Lv   waif   swordsman   archer   (geo-mean)');
for (const L of Ls) {
  const v = Object.keys(FAMS).map((f) => dps(f, L));
  const g = Math.exp(v.reduce((a, b) => a + Math.log(b), 0) / v.length);
  console.log(String(L).padStart(3), v.map((x) => String(Math.round(x)).padStart(8)).join(''), '  ', Math.round(g));
}
