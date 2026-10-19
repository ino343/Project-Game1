/**
 * Player feedback: chat log, floating damage numbers and toasts.
 */
function log(t, col = '#e9eff3') {
  const d = document.createElement('div');
  d.textContent = t;
  d.style.color = col;
  const L = $('#log');
  L.appendChild(d);
  while (L.children.length > 8) L.firstChild.remove();
  L.scrollTop = L.scrollHeight;
}
// Numbers appear in one fixed spot, rise straight up at a steady speed and fade out as they climb.
// Quick hits don't spread sideways: each earlier number has already floated up when the next one appears.
// kind: 'dmg' (hits, damage taken, misses, heals; size from Settings > Damage numbers)
//       or 'loot' (EXP, gold, drops; can be hidden in Settings).
// Sizes passed by callers are the "old" sizes; they get a x1.2 boost here so numbers stay readable.
const FT_LANES = [0]; // single column: every number appears at the same spot and floats straight up
const FT_SCALE = { small: 0.85, normal: 1, large: 1.35 };
let ftLane = 0;
function ft(x, y, txt, col = '#fff', size = 14, vy = -38, crit = false, kind = 'dmg') {
  if (kind === 'loot' ? !SET.lootText : SET.dmgNum === 'off') return;
  const mul = kind === 'loot' ? 1 : FT_SCALE[SET.dmgNum] || 1,
    str = typeof txt === 'number' ? txt.toLocaleString() : String(txt),
    sz = Math.round(size * 0.9 * mul),
    w = Math.max(34, str.length * sz * 0.5), // rough text width, so neighbours never overlap
    i = ftLane++ % FT_LANES.length;
  floats.push({ x: x + FT_LANES[i] * w * 0.85, y, txt: str, col, size: sz, t: 0, vy: vy * 1.7, crit });
}
let toastT = 0;
function toast(t) {
  const e = $('#toast');
  e.textContent = t;
  e.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => e.classList.remove('on'), 2200);
}
