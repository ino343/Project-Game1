/**
 * HUD: skill bar and live stat bars.
 */
const bar = $('#bar');
let slotEls = [];
// Skill hotkeys: top row = keys 1-9 + a roll down / roll up button; rolled down, a second row (Q W E R T Y U I O) opens.
// Every slot is player-assigned (P.hotbar, saved): any active / buff skill of the class, the HP potion or the MP potion.
// Click an empty slot to pick what goes in it; right-click or long-press a filled slot to change / clear it.
// W E I O keep their game functions (move, talk, items, settings), so those 4 slots work by click only.
const HB_KEYS = '123456789QWERTYUIO',
  HB_RESERVED = ['w', 'e', 'i', 'o'],
  HB_COLS = 9,
  HB_KEY = 'aldenmoor_hotbar_open';
let hbOpen = false;
try {
  hbOpen = localStorage.getItem(HB_KEY) === '1';
} catch (e) {}
function setHotbarOpen(v) {
  hbOpen = !!v;
  bar.classList.toggle('open', hbOpen);
  const t = bar.querySelector('.hb-toggle');
  if (t) {
    t.setAttribute('aria-expanded', String(hbOpen));
    t.title = t.ariaLabel = hbOpen ? 'Roll up skill bar' : 'Roll down skill bar (more slots)';
  }
  try {
    localStorage.setItem(HB_KEY, hbOpen ? '1' : '0');
  } catch (e) {}
}
// Assignable skills: the job's active + buff skills (passives are always on).
const hbSkills = () => J().skills.filter((id) => SK[id] && SK[id].kind !== 'passive');
function normalizeHotbar() {
  const ok = hbSkills();
  let h = P.hotbar;
  if (!Array.isArray(h) || P.hotbarJob !== P.job) {
    // default: every slot is empty, the player fills them in (all classes, 1st and 2nd job)
    h = new Array(18).fill(null);
    P.hotbarJob = P.job;
  }
  const seen = {};
  P.hotbar = Array.from({ length: 18 }, (_, i) => {
    const v = h[i];
    if (v !== 'hp' && v !== 'mp' && !ok.includes(v)) return null;
    if (seen[v]) return null;
    seen[v] = 1;
    return v;
  });
}
function hotbarUse(i) {
  const v = P.hotbar && P.hotbar[i];
  if (!v) return;
  if (v === 'hp' || v === 'mp') usePotion(v);
  else useSkill(J().skills.indexOf(v));
}
function hotbarSet(i, v) {
  if (v) {
    const from = P.hotbar.indexOf(v);
    if (from >= 0 && from !== i) P.hotbar[from] = P.hotbar[i]; // already on the bar: swap places
  }
  P.hotbar[i] = v;
  buildBar();
  updateHud();
}
// Pop-up editor (blurred background): the whole hotbar on top, the skills below. Tap the slot you want and the skill
// that goes in it, in either order; opening it from a slot pre-selects that slot, so one tap on a skill places it.
function hotbarPicker(i, v) {
  const lab = (x) => (x === 'hp' ? 'HP' : x === 'mp' ? 'MP' : x ? SK[x].ab : '');
  const col = (x) => (x && x !== 'hp' && x !== 'mp' ? SK[x].col : 'var(--bronze-dk)');
  const cells = P.hotbar
    .map(
      (x, k) =>
        '<button type="button" class="hbm' + (k === i ? ' sel' : '') + (x ? '' : ' empty') + '" data-i="' + k + '" style="--sc:' + col(x) + '" title="Slot ' + HB_KEYS[k] + '"><i>' + HB_KEYS[k] + '</i><b>' + (lab(x) || '+') + '</b></button>',
    )
    .join('');
  const item = (x, name, tag, sub) =>
    '<button type="button" class="hbp' + (v === x ? ' sel' : '') + '" data-v="' + x + '" style="--sc:' + col(x) + '"><b>' + lab(x) + '</b><span><strong>' + name + '</strong> ' + tag + '<br><small>' + sub + '</small></span></button>';
  // only skills the player has learned (spent a skill point on) can be placed
  const rows = hbSkills()
    .filter((id) => P.learned[id] > 0)
    .map((id) => item(id, SK[id].n, skillTag(id), 'Lv ' + P.learned[id] + '/' + skillMax(id) + ' — ' + SK[id].d));
  if (!rows.length) rows.push('<p class="hbhint">No skills learned yet. Learn some in Abilities (C) > Skills.</p>');
  rows.push(item('hp', 'HP Potion', '', 'Restores 40% HP'), item('mp', 'MP Potion', '', 'Restores 40% MP'));
  const grid = '<div class="hbmap">' + cells + '</div>';
  openDlg('Set hotkey', 'Pick a slot and a skill', '<p class="hbhint">' + (i == null ? 'Tap a <b>slot</b>, then a <b>skill</b>.' : 'Slot <b>' + HB_KEYS[i] + '</b> selected — tap a <b>skill</b> to put it there (or tap another slot).') + '</p>' + grid + '<div class="hbpl">' + rows.join('') + '</div>', [
    { t: 'Clear slot', fn: () => (closeDlg(), hotbarSet(i, null)), dis: i == null || !P.hotbar[i] },
    { t: 'Cancel', fn: closeDlg },
  ]);
  dlg.classList.add('hbblur');
  const place = (si, val) => {
    sfxClick();
    closeDlg();
    hotbarSet(si, val);
  };
  for (const b of dlgc.querySelectorAll('.hbm'))
    b.onclick = () => {
      const k = +b.dataset.i;
      if (v) place(k, v);
      else hotbarPicker(k, v);
    };
  for (const b of dlgc.querySelectorAll('.hbp'))
    b.onclick = () => {
      if (i != null) place(i, b.dataset.v);
      else hotbarPicker(i, b.dataset.v);
    };
}
function buildBar() {
  normalizeHotbar();
  bar.innerHTML = '';
  slotEls = [];
  const main = document.createElement('div');
  main.className = 'hb-row hb-main';
  const more = document.createElement('div');
  more.className = 'hb-more';
  const row2 = document.createElement('div');
  row2.className = 'hb-row';
  more.appendChild(row2);
  for (let i = 0; i < 18; i++) {
    const v = P.hotbar[i],
      key = HB_KEYS[i],
      locked = HB_RESERVED.includes(key.toLowerCase());
    const b = document.createElement('button');
    b.type = 'button';
    b._v = v;
    const pot = v === 'hp' || v === 'mp';
    b.className = 'slot' + (!v ? ' empty' : pot ? ' pot ' + v : '') + (locked ? ' clickonly' : '');
    if (v && !pot) b.style.setProperty('--sc', SK[v].col);
    let tip = !v ? 'Empty slot (' + key + '): click to choose a skill' : '';
    if (pot) tip = v === 'hp' ? 'HP Potion (' + key + '): restores 40% HP' : 'MP Potion (' + key + '): restores 40% MP';
    b.title = tip;
    b.setAttribute('aria-label', tip);
    b.innerHTML =
      '<span class="k">' + key + '</span><span class="ab">' + (!v ? '+' : pot ? (v === 'hp' ? 'HP' : 'MP') : SK[v].ab) + '</span><span class="n"></span><span class="cd"></span>';
    let timer = 0,
      long = false;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.button === 2) return;
      long = false;
      clearTimeout(timer);
      if (v) timer = setTimeout(() => ((long = true), hotbarPicker(i)), 550);
    });
    b.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      if (long || e.button === 2) return;
      if (!v) hotbarPicker(i);
      else hotbarUse(i);
    });
    b.addEventListener('pointerleave', () => clearTimeout(timer));
    b.addEventListener('pointercancel', () => clearTimeout(timer));
    b.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(timer);
      hotbarPicker(i);
    });
    slotEls.push(b);
    (i < HB_COLS ? main : row2).appendChild(b);
  }
  const t = document.createElement('button');
  t.type = 'button';
  t.className = 'hb-toggle';
  t.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  t.addEventListener('click', () => setHotbarOpen(!hbOpen));
  main.appendChild(t);
  bar.appendChild(main);
  bar.appendChild(more);
  setHotbarOpen(hbOpen);
}
// Big HP / MP numbers are shortened inside the small bars (exact values are in Abilities).
const barNum = (n) => {
  n = Math.ceil(n);
  return n >= 100000 ? (n / 1e6 >= 1 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : Math.round(n / 1000) + 'k') : n.toLocaleString();
};
// Mastery (Mlvl): an EXP-based second level, active only for 2nd jobs (a 1st job shows it locked and it does not level).
const masteryActive = () => J().tier === 2;
function updateHud() {
  updateDummyPanel();
  const st = P.st,
    j = J();
  $('#plv').textContent = 'Lvl ' + P.lvl;
  const set = (id, v, max, txt) => {
    const e = $(id);
    e.firstElementChild.style.width = Math.max(0, Math.min(100, (v / max) * 100)) + '%';
    e.lastElementChild.textContent = txt;
  };
  set('#hpb', P.hp, st.max, barNum(P.hp) + ' / ' + barNum(st.max));
  set('#mpb', P.mp, st.maxMp, barNum(P.mp) + ' / ' + barNum(st.maxMp));
  const mOn = masteryActive();
  $('#pmlv').textContent = mOn ? 'Mlvl ' + P.mlvl : 'Mlvl --';
  set('#msb', mOn ? P.mexp : 0, mOn ? mneed(P.mlvl) : 1, !mOn ? '2nd job' : P.mlvl >= MLV_MAX ? 'MAX' : ((P.mexp / mneed(P.mlvl)) * 100).toFixed(1) + '%');
  $('#msb').parentElement.style.opacity = mOn ? '' : '0.45';
  const nx = need(P.lvl);
  set(
    '#xpb',
    P.exp,
    nx,
    P.lvl >= lvCapFor(P.job) ? 'MAX' : ((P.exp / nx) * 100).toFixed(1) + '%',
  );
  {
    const cb = $('#bChar'),
      pip = cb.querySelector('.pip'),
      learnable = learnableSkills(),
      n = P.ap + learnable;
    if (pip.textContent !== String(n)) pip.textContent = n;
    pip.hidden = n < 1;
    cb.classList.toggle('alert', n > 0);
  }
  const bf = Object.keys(P.buffs)
    .map((k) => '<span>' + k + ' ' + Math.ceil(P.buffs[k].t) + 's</span>')
    .join('');
  if ($('#buffs').dataset.h !== bf) {
    $('#buffs').innerHTML = bf;
    $('#buffs').dataset.h = bf;
  }
  for (const e of slotEls) {
    const v = e._v;
    if (!v) continue;
    const cd = e.querySelector('.cd'),
      n = e.querySelector('.n');
    if (v !== 'hp' && v !== 'mp') {
      const id = v,
        lv = P.learned[id] || 0,
        d = skillDef(id, lv || 1);
      const c = P.cds[id] || 0;
      const tip = SK[id].n + ' [' + (SK[id].kind === 'buff' ? 'Buff' : 'Active') + ']' + (lv ? ' Lv ' + lv + '/' + skillMax(id) : ' (not learned)') + ' — ' + SK[id].d + ' ' + skillLine(d) + ' · right-click / hold to change';
      if (e.title !== tip) {
        e.title = tip;
        e.setAttribute('aria-label', tip);
      }
      cd.style.transform = 'scaleY(' + clamp(c / d.cd, 0, 1) + ')';
      const ok = !!P.learned[id];
      e.classList.toggle('lock', !ok);
      e.classList.toggle('nomp', ok && P.mp < d.mp);
      n.textContent = !ok ? 'Learn' : c > 0 ? c.toFixed(1) : 'Lv' + lv;
    } else {
      cd.style.transform = 'scaleY(' + clamp(P.potCd, 0, 1) + ')';
      n.textContent = v === 'hp' ? P.hpP : P.mpP;
    }
  }
}
