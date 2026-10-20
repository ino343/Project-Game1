/**
 * Training dummies (village): damage test meter.
 * Tracks attack speed (swings per second), DPS, last / highest / average hit, crit rate and total damage.
 * A test starts with the first hit on a dummy and ends after DT_IDLE seconds without damage; the final
 * numbers stay on screen until the next hit starts a new test (or you press Reset).
 */
const DT_IDLE = 4;
const DT = { recent: [], n: 0, pn: 0, crits: 0, total: 0, max: 0, last: 0, lastDmg: 0, lastCrit: false, t0: 0, sw0: 0, swN: 0, swLast: 0 };
function dummyActive() {
  return DT.n > 0 && time - DT.last <= DT_IDLE;
}
function dummyReset() {
  Object.assign(DT, { n: 0, pn: 0, crits: 0, total: 0, max: 0, last: 0, lastDmg: 0, lastCrit: false, t0: 0, sw0: 0, swN: 0, swLast: 0 });
}
// Called for every attack / skill the player performs.
function dummySwing() {
  DT.recent.push(time);
  if (DT.recent.length > 40) DT.recent.shift();
  if (dummyActive()) {
    DT.swN++;
    DT.swLast = time;
  }
}
// Called for every point of damage dealt to a dummy. kind: 'hit' | 'crit' | 'poison' | 'pet'.
function dummyHit(m, dmg, kind) {
  if (!dummyActive()) {
    dummyReset();
    DT.t0 = time;
    const sw = DT.recent.filter((t) => time - t <= 1.5); // swings that led to this first hit
    DT.swN = sw.length || 1;
    DT.sw0 = sw.length ? sw[0] : time;
    DT.swLast = sw.length ? sw[sw.length - 1] : time;
  }
  DT.n++;
  DT.total += dmg;
  DT.last = time;
  if (kind === 'hit' || kind === 'crit') {
    DT.pn++;
    if (kind === 'crit') DT.crits++;
    DT.lastDmg = dmg;
    DT.lastCrit = kind === 'crit';
  }
  DT.max = Math.max(DT.max, dmg);
  m.last = dmg;
}
const dCache = {};
function dSet(id, txt) {
  if (dCache[id] === txt) return;
  dCache[id] = txt;
  $('#' + id).textContent = txt;
}
function updateDummyPanel() {
  const near = M && M.mobs.some((m) => m.t.dummy && Math.hypot(m.x - P.x, m.y - P.y) < 320),
    p = $('#dps');
  if (p.hidden === near) p.hidden = !near;
  if (!near) return;
  const f = (v) => Math.round(v).toLocaleString(),
    dur = Math.max(1, DT.last - DT.t0),
    span = DT.swLast - DT.sw0,
    rate = DT.swN > 1 && span > 0 ? (DT.swN - 1) / span : 0,
    b = J().basic,
    maxRate = 1 / Math.max(0.07, b.cd / P.st.aspd);
  dSet('dAs', (rate ? rate.toFixed(2) : '—') + ' /s  (max ' + maxRate.toFixed(2) + ')');
  dSet('dDps', DT.n ? f(DT.total / dur) : '0');
  dSet('dLast', DT.pn ? f(DT.lastDmg) + (DT.lastCrit ? ' CRIT' : '') : '—');
  dSet('dMax', f(DT.max));
  dSet('dAvg', DT.n ? f(DT.total / DT.n) : '0');
  dSet('dCrit', DT.pn ? Math.round((DT.crits / DT.pn) * 100) + '%' : '0%');
  dSet('dTot', f(DT.total));
  dSet('dNote', !DT.n ? 'Attack a dummy to start the test.' : dummyActive() ? 'Testing… ' + dur.toFixed(1) + 's' : 'Finished (' + dur.toFixed(1) + 's). Hit a dummy to start a new test.');
}
$('#dReset').onclick = dummyReset;
