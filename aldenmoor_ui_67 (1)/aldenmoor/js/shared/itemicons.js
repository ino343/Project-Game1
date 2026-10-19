/**
 * MMORPG-style item icons. Every weapon, armor, headgear and necklace has its OWN drawn design
 * (its own silhouette, materials and details) - see icons-weapons.js, icons-armor.js, icons-head.js
 * and icons-neck.js, which register a drawing function per item id in ITEM_ART.
 * The tile behind the icon is a neutral dark slot; the grade colour only shows up as the frame
 * (CSS), a faint aura on high grades and small accents (gems / glow) inside the drawing itself.
 *
 *   itemIcon(item)       -> data URL (PNG), painted once on a canvas and cached
 *   itemIconImg(item)    -> '<img class="ico ...">' markup, framed in the item's grade colour
 */
const ITEM_ICON_CACHE = {};
const ITEM_ART = {}; // item id -> (g, c, t, it) => void   (g is a 56x56 context, c = grade colour, t = tier)

function iconShade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16,
    g = (n >> 8) & 255,
    b = n & 255;
  const f = (c) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
}
// iconShade() returns rgb(); this one accepts either and returns hex-safe rgb too
const iconAlpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
};

function itemIcon(it) {
  if (ITEM_ICON_CACHE[it.id]) return ITEM_ICON_CACHE[it.id];
  const S = 56,
    cv = document.createElement('canvas');
  cv.width = cv.height = S * 2; // drawn at 2x so it stays sharp
  const g = cv.getContext('2d');
  g.scale(2, 2);
  const c = it.col,
    t = it.tier;
  // neutral slot: dark stone gradient + soft top light + ground shadow. No grade-coloured fill.
  const bg = g.createLinearGradient(0, 0, 0, S);
  bg.addColorStop(0, '#222b35');
  bg.addColorStop(1, '#0d1217');
  g.fillStyle = bg;
  g.fillRect(0, 0, S, S);
  const lit = g.createRadialGradient(S * 0.4, S * 0.25, 2, S * 0.4, S * 0.25, S * 0.8);
  lit.addColorStop(0, 'rgba(255,255,255,.10)');
  lit.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = lit;
  g.fillRect(0, 0, S, S);
  if (t >= 5) {
    // only the rare grades get a faint aura behind the item
    const aura = g.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.55);
    aura.addColorStop(0, iconAlpha(c, t >= 7 ? 0.32 : 0.22));
    aura.addColorStop(1, iconAlpha(c, 0));
    g.fillStyle = aura;
    g.fillRect(0, 0, S, S);
  }
  g.save();
  g.shadowColor = 'rgba(0,0,0,.65)';
  g.shadowBlur = 4;
  g.shadowOffsetY = 2;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  const art = ITEM_ART[it.id];
  if (art) art(g, c, t, it);
  g.restore();
  if (t >= 7) {
    // 2nd-job grades: little star glints in the corners
    g.fillStyle = c;
    g.globalAlpha = 0.9;
    for (const [sx, sy, sr] of [[8, 9, 2], [48, 12, 1.4], [10, 47, 1.3]]) {
      g.fillRect(sx - sr, sy - 0.4, sr * 2, 0.8);
      g.fillRect(sx - 0.4, sy - sr, 0.8, sr * 2);
    }
    g.globalAlpha = 1;
  }
  ITEM_ICON_CACHE[it.id] = cv.toDataURL('image/png');
  return ITEM_ICON_CACHE[it.id];
}

// <img> framed in the grade colour. Legendary and above get a pulsing glow (CSS .hi).
function itemIconImg(it, cls) {
  return '<img class="ico' + (it.tier >= 5 ? ' hi' : '') + (cls ? ' ' + cls : '') + '" style="--c:' + it.col + '" alt="" src="' + itemIcon(it) + '">';
}

/* ---------- drawing helpers shared by the icon files ---------- */

function iconPoly(g, pts, fill, stroke, lw) {
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.lineWidth = lw || 1;
    g.strokeStyle = stroke;
    g.stroke();
  }
}
// build(g) adds segments to the current path (it must not call beginPath); then fill + stroke
function iconPath(g, build, fill, stroke, lw) {
  g.beginPath();
  build(g);
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.lineWidth = lw || 1;
    g.strokeStyle = stroke;
    g.stroke();
  }
}
function iconLine(g, pts, col, lw) {
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.strokeStyle = col;
  g.lineWidth = lw || 1;
  g.stroke();
}
function iconRect(g, x, y, w, h, fill, stroke, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r === undefined ? 1.5 : r);
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.lineWidth = 0.9;
    g.strokeStyle = stroke;
    g.stroke();
  }
}
function iconCircle(g, x, y, r, fill, stroke, lw) {
  g.beginPath();
  g.arc(x, y, r, 0, 6.2832);
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.lineWidth = lw || 1;
    g.strokeStyle = stroke;
    g.stroke();
  }
}
function iconBall(g, x, y, r, col) {
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  gr.addColorStop(0, iconShade(col, 0.65));
  gr.addColorStop(1, iconShade(col, -0.4));
  iconCircle(g, x, y, r, gr, 'rgba(0,0,0,.55)', 0.8);
}
function iconGem(g, x, y, r, c) {
  iconPoly(g, [x, y - r, x + r * 0.8, y, x, y + r, x - r * 0.8, y], c, iconShade(c, -0.55));
  iconPoly(g, [x, y - r, x + r * 0.8, y, x, y], iconShade(c, 0.55));
}
function iconStar(g, x, y, ro, ri, n, fill, stroke) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro,
      a = -1.5708 + (i * Math.PI) / n;
    g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.lineWidth = 0.8;
    g.strokeStyle = stroke;
    g.stroke();
  }
}
function iconGlow(g, x, y, r, c, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, iconAlpha(c, a === undefined ? 0.8 : a));
  gr.addColorStop(1, iconAlpha(c, 0));
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}
// horizontal metal sheen across x0..x1
function iconSteel(g, x0, x1, base) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, iconShade(base, -0.32));
  gr.addColorStop(0.45, iconShade(base, 0.55));
  gr.addColorStop(0.58, iconShade(base, 0.2));
  gr.addColorStop(1, iconShade(base, -0.28));
  return gr;
}
function iconVert(g, y0, y1, a, b) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  return gr;
}
// move local (0, mid of top..bot) to the tile centre, rotate, and scale so the length is L px
// ICON_SPRITE is set while avatar.js paints a held-weapon sprite: blades are drawn upright and their length recorded
let ICON_SPRITE = null;
function iconPlace(g, rot, top, bot, L, cx, cy) {
  if (ICON_SPRITE) {
    ICON_SPRITE.L = L;
    rot = 0;
  }
  const s = L / (bot - top);
  g.translate(cx === undefined ? 28 : cx, cy === undefined ? 28 : cy);
  g.rotate(rot);
  g.scale(s, s);
  g.translate(0, -(top + bot) / 2);
  return s;
}
// hilt helpers (local space, grip runs downwards from y0)
function iconGrip(g, y0, len, w, col, wrap) {
  iconRect(g, -w / 2, y0, w, len, col, 'rgba(0,0,0,.5)', w / 3);
  if (wrap) {
    g.fillStyle = wrap;
    for (let i = 1.2; i < len - 1; i += 2.8) g.fillRect(-w / 2 + 0.2, y0 + i, w - 0.4, 0.9);
  }
}
function iconBar(g, y, w, h, col) {
  iconRect(g, -w / 2, y, w, h, iconSteel(g, -w / 2, w / 2, col), 'rgba(0,0,0,.55)', h / 2.5);
}
// a polygon filled with a steel gradient, e.g. a blade
function iconBlade(g, pts, base, edge) {
  let lo = 1e9,
    hi = -1e9;
  for (let i = 0; i < pts.length; i += 2) {
    lo = Math.min(lo, pts[i]);
    hi = Math.max(hi, pts[i]);
  }
  iconPoly(g, pts, iconSteel(g, lo, hi, base), edge || iconShade(base, -0.65));
}
