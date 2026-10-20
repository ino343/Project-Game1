/**
 * Rendering: the classic medieval village (dirt roads, cobbled plaza, timber houses, torches) and the building interiors.
 * drawGround() calls drawVillageGround() / drawInteriorGround(); drawObs() calls drawObsMod() first,
 * which handles every obstacle type defined here and returns true when it drew something.
 */
const rrect = (x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};
const shade = (hex, k) => {
  // k > 0 lightens, k < 0 darkens
  const n = parseInt(hex.slice(1), 16),
    f = (c) => Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k))));
  return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
};
function vgrad(x, y, h, c0, c1) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  return g;
}

/* ---------------- village ground (classic: dirt roads, cobbled plaza, trampled training yard) ---------------- */
// Textures are tiny seamless tiles turned into canvas patterns once, so the per-frame cost is a few fills.
const COBBLE_COL = ['#9a9384', '#8c8576', '#a49d8d', '#7f7869', '#948d7e', '#a8a08f'];
const vlPat = {};
function vlMakePattern(key, size, paint) {
  if (vlPat[key]) return vlPat[key];
  const c = document.createElement('canvas'),
    k = 2; // drawn at 2x so the texture stays sharp when the camera zooms in
  c.width = c.height = size * k;
  const g = c.getContext('2d');
  g.scale(k, k);
  paint(g, mulberry(size * 31 + key.length * 7), size);
  const p = ctx.createPattern(c, 'repeat');
  try {
    p.setTransform(new DOMMatrix().scale(1 / k));
  } catch (e) {
    /* older browsers: the texture is just drawn 2x larger */
  }
  return (vlPat[key] = p);
}
// draws fn(x, y) at (x, y) and at the wrapped copies so details never get cut at the tile edge
function vlWrap(S, x, y, r, fn) {
  for (const dx of [0, -S, S])
    for (const dy of [0, -S, S]) {
      const px = x + dx,
        py = y + dy;
      if (px > -r && px < S + r && py > -r && py < S + r) fn(px, py);
    }
}
function vlDirt() {
  return vlMakePattern('dirt', 128, (g, R, S) => {
    g.fillStyle = '#a88a5b';
    g.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) {
      const x = R() * S,
        y = R() * S,
        rx = 6 + R() * 14,
        ry = 3 + R() * 7,
        a = R() * 3;
      g.fillStyle = R() < 0.5 ? 'rgba(120,88,48,.16)' : 'rgba(205,178,128,.18)';
      vlWrap(S, x, y, rx, (px, py) => {
        g.beginPath();
        g.ellipse(px, py, rx, ry, a, 0, 6.28);
        g.fill();
      });
    }
    for (let i = 0; i < 150; i++) {
      const x = R() * S,
        y = R() * S,
        r = 0.8 + R() * 2.2;
      g.fillStyle = R() < 0.55 ? 'rgba(78,56,28,.38)' : 'rgba(236,216,168,.42)';
      vlWrap(S, x, y, r, (px, py) => {
        g.beginPath();
        g.ellipse(px, py, r * 1.3, r, R() * 3, 0, 6.28);
        g.fill();
      });
    }
  });
}
function vlCobble() {
  return vlMakePattern('cobble', 128, (g, R, S) => {
    g.fillStyle = '#4f493e';
    g.fillRect(0, 0, S, S);
    const rows = 8,
      rh = S / rows;
    for (let r = 0; r < rows; r++) {
      const n = 4 + ((R() * 2) | 0),
        ws = Array.from({ length: n }, () => 0.7 + R() * 0.6),
        tot = ws.reduce((a, b) => a + b, 0);
      let x = 0;
      for (const wv of ws) {
        const w = (wv / tot) * S,
          y = r * rh;
        g.fillStyle = COBBLE_COL[(R() * COBBLE_COL.length) | 0];
        g.beginPath();
        g.roundRect(x + 1.2, y + 1.2, w - 2.4, rh - 2.4, 4);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,.14)';
        g.beginPath();
        g.roundRect(x + 2.2, y + 2, w - 5, 3, 2);
        g.fill();
        g.fillStyle = 'rgba(0,0,0,.16)';
        g.beginPath();
        g.roundRect(x + 2.2, y + rh - 5, w - 5, 3, 2);
        g.fill();
        x += w;
      }
    }
  });
}
function paintVillageGround() {
  const PZ = VILLAGE_PLAZA,
    Y = M.yard,
    R = mulberry(M.seed * 13 + 5),
    ox = -cam.x,
    oy = -cam.y;
  if (!M.vgEdge) {
    // stones along the road edges, computed once
    M.vgEdge = [];
    const E = mulberry(M.seed * 17 + 3);
    for (const [a, b] of M.paths) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]),
        ux = (b[0] - a[0]) / len,
        uy = (b[1] - a[1]) / len;
      for (let d = 6; d < len; d += 22)
        for (const s of [-1, 1]) {
          if (E() < 0.35) continue;
          const o = 33 + E() * 3;
          M.vgEdge.push([a[0] + ux * d - uy * o * s + E() * 4, a[1] + uy * d + ux * o * s + E() * 4, 2.2 + E() * 3.2]);
        }
    }
  }
  ctx.save();
  ctx.translate(ox, oy);
  // training yard: trampled earth with straw
  ctx.fillStyle = '#6b4f2e';
  rrect(Y.x - 5, Y.y - 5, Y.w + 10, Y.h + 10, 14);
  ctx.fill();
  ctx.fillStyle = vlDirt();
  rrect(Y.x, Y.y, Y.w, Y.h, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(112,78,36,.2)';
  rrect(Y.x, Y.y, Y.w, Y.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(222,190,98,.6)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 0; i < 60; i++) {
    const x = Y.x + 14 + R() * (Y.w - 28),
      y = Y.y + 14 + R() * (Y.h - 28);
    ctx.moveTo(x, y);
    ctx.lineTo(x + R() * 9 - 4.5, y + R() * 5 - 2.5);
  }
  ctx.stroke();
  // roads: grass blend, dark earth rim, packed dirt, wheel ruts
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const road = (w, st) => {
    ctx.strokeStyle = st;
    ctx.lineWidth = w;
    ctx.beginPath();
    for (const p of M.paths) {
      ctx.moveTo(p[0][0], p[0][1]);
      ctx.lineTo(p[1][0], p[1][1]);
    }
    ctx.stroke();
  };
  road(80, 'rgba(46,74,32,.32)');
  road(69, '#6b4f2e');
  road(61, vlDirt());
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(92,66,36,.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (const [a, b] of M.mainRoads || []) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]),
      nx = -(b[1] - a[1]) / len,
      ny = (b[0] - a[0]) / len;
    for (const off of [-9, 9]) {
      ctx.moveTo(a[0] + nx * off, a[1] + ny * off);
      ctx.lineTo(b[0] + nx * off, b[1] + ny * off);
    }
  }
  ctx.stroke();
  // edge stones (only the ones on screen)
  const vx0 = cam.x - 12,
    vy0 = cam.y - 12,
    vx1 = cam.x + VWw + 12,
    vy1 = cam.y + VHw + 12;
  ctx.fillStyle = '#8c8576';
  ctx.beginPath();
  for (const [x, y, r] of M.vgEdge) {
    if (x < vx0 || x > vx1 || y < vy0 || y > vy1) continue;
    ctx.moveTo(x + r, y);
    ctx.ellipse(x, y, r, r * 0.72, 0, 0, 6.28);
  }
  ctx.fill();
  // plaza: cobblestones inside a stone kerb
  ctx.fillStyle = '#463f35';
  ctx.beginPath();
  ctx.ellipse(PZ.x, PZ.y + 2, PZ.rx + 11, PZ.ry + 10, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#8f887a';
  ctx.beginPath();
  ctx.ellipse(PZ.x, PZ.y, PZ.rx + 7, PZ.ry + 6, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = vlCobble();
  ctx.beginPath();
  ctx.ellipse(PZ.x, PZ.y, PZ.rx, PZ.ry, 0, 0, 6.28);
  ctx.fill();
  // kerb stones around the rim + a ring of pale stones as inlay
  ctx.strokeStyle = 'rgba(30,24,16,.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([16, 2]);
  ctx.beginPath();
  ctx.ellipse(PZ.x, PZ.y, PZ.rx + 7, PZ.ry + 6, 0, 0, 6.28);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(214,203,170,.78)';
  ctx.lineWidth = 6;
  ctx.setLineDash([13, 4]);
  ctx.beginPath();
  ctx.ellipse(PZ.x, PZ.y, PZ.rx * 0.64, PZ.ry * 0.64, 0, 0, 6.28);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.setLineDash([9, 5]);
  ctx.beginPath();
  ctx.ellipse(PZ.x, PZ.y, PZ.rx * 0.88, PZ.ry * 0.88, 0, 0, 6.28);
  ctx.stroke();
  ctx.setLineDash([]);
  // stone doorsteps in front of every building
  for (const p of M.portals) {
    if (!p.door) continue;
    ctx.fillStyle = '#4c463b';
    rrect(p.x - 36, p.y - 9, 72, 28, 5);
    ctx.fill();
    ctx.fillStyle = '#9b9486';
    rrect(p.x - 33, p.y - 6, 66, 22, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.fillRect(p.x - 31, p.y - 5, 62, 3);
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x - 11, p.y - 6);
    ctx.lineTo(p.x - 11, p.y + 16);
    ctx.moveTo(p.x + 11, p.y - 6);
    ctx.lineTo(p.x + 11, p.y + 16);
    ctx.moveTo(p.x - 33, p.y + 5);
    ctx.lineTo(p.x + 33, p.y + 5);
    ctx.stroke();
  }
  ctx.restore();
}
function drawVillageGround() {
  paintVillageGround();
}

/* ---------------- interior ground ---------------- */
function drawInteriorGround() {
  const I = M.interior,
    ox = -cam.x,
    oy = -cam.y,
    W = M.w,
    H = M.h;
  ctx.fillStyle = '#15110f';
  ctx.fillRect(0, 0, VWw, VHw);
  // floor
  ctx.fillStyle = I.floor[0];
  ctx.fillRect(ox, oy + 118, W, H - 118);
  if (I.tile) {
    for (let y = 118, r = 0; y < H; y += 48, r++)
      for (let x = 0, c = 0; x < W; x += 48, c++) {
        ctx.fillStyle = (r + c) % 2 ? I.floor[1] : I.floor[0];
        ctx.fillRect(ox + x, oy + y, 48, Math.min(48, H - y));
      }
  } else {
    for (let y = 118, r = 0; y < H; y += 34, r++) {
      ctx.fillStyle = r % 2 ? I.floor[1] : I.floor[0];
      ctx.fillRect(ox, oy + y, W, Math.min(34, H - y));
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(ox, oy + y, W, 1.5);
      const off = (r * 97) % 150;
      for (let x = off; x < W; x += 150) ctx.fillRect(ox + x, oy + y, 1.5, 34);
    }
  }
  // rugs
  for (const r of I.rugs || []) {
    if (r.k === 'c') {
      const x = ox + r.x,
        y = oy + r.y;
      ctx.fillStyle = shade(r.col, -0.55);
      ctx.beginPath();
      ctx.ellipse(x, y, r.r + 8, (r.r + 8) * 0.62, 0, 0, 6.28);
      ctx.fill();
      ctx.strokeStyle = r.col;
      ctx.lineWidth = 3;
      for (const k of [1, 0.72, 0.4]) {
        ctx.beginPath();
        ctx.ellipse(x, y, r.r * k, r.r * k * 0.62, 0, 0, 6.28);
        ctx.stroke();
      }
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(time * 2) * 0.2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + time * 0.2;
        ctx.lineTo(x + Math.cos(a) * r.r * 0.9, y + Math.sin(a) * r.r * 0.9 * 0.62);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = shade(r.col, -0.45);
      rrect(ox + r.x - 6, oy + r.y - 6, r.w + 12, r.h + 12, 8);
      ctx.fill();
      ctx.fillStyle = r.col;
      rrect(ox + r.x, oy + r.y, r.w, r.h, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.28)';
      ctx.lineWidth = 2;
      rrect(ox + r.x + 9, oy + r.y + 9, r.w - 18, r.h - 18, 3);
      ctx.stroke();
    }
  }
  // back wall + wainscot + skirting
  ctx.fillStyle = vgrad(oy, oy, 118, shade(I.wall, 0.12), I.wall);
  ctx.fillRect(ox, oy, W, 118);
  ctx.fillStyle = 'rgba(0,0,0,.08)';
  ctx.fillRect(ox, oy + 78, W, 40);
  ctx.fillStyle = I.trim;
  ctx.fillRect(ox, oy + 112, W, 8);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.fillRect(ox, oy + 112, W, 2);
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  for (let x = 0; x < W; x += 60) ctx.fillRect(ox + x, oy, 1, 78);
  // side walls
  ctx.fillStyle = shade(I.wall, -0.25);
  ctx.fillRect(ox, oy, 16, H);
  ctx.fillRect(ox + W - 16, oy, 16, H);
  ctx.fillStyle = I.trim;
  ctx.fillRect(ox + 14, oy + 118, 3, H - 118);
  ctx.fillRect(ox + W - 17, oy + 118, 3, H - 118);
  // windows with a soft light shaft on the floor
  const wins = [];
  for (let x = 120; x < W - 100; x += 230) wins.push(x);
  for (const x of wins) {
    if ((I.furn || []).some((f) => f.kind === 'shelf' && x + 24 > f.x && x - 24 < f.x + f.w)) continue;
    const X = ox + x,
      Yw = oy + 22;
    ctx.fillStyle = I.trim;
    rrect(X - 28, Yw - 4, 56, 66, 6);
    ctx.fill();
    ctx.fillStyle = vgrad(Yw, Yw, 58, '#bfe6ff', '#fdf3d0');
    rrect(X - 24, Yw, 48, 58, 4);
    ctx.fill();
    ctx.fillStyle = I.trim;
    ctx.fillRect(X - 1, Yw, 2, 58);
    ctx.fillRect(X - 24, Yw + 28, 48, 2);
    ctx.fillStyle = 'rgba(255,244,200,.10)';
    ctx.beginPath();
    ctx.moveTo(X - 24, oy + 120);
    ctx.lineTo(X + 24, oy + 120);
    ctx.lineTo(X + 90, oy + 320);
    ctx.lineTo(X + 10, oy + 320);
    ctx.closePath();
    ctx.fill();
  }
  // banners
  for (const [x, c] of I.banners || []) {
    const X = ox + x;
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(X - 20, oy + 8, 40, 5);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(X - 17, oy + 13);
    ctx.lineTo(X + 17, oy + 13);
    ctx.lineTo(X + 17, oy + 86);
    ctx.lineTo(X, oy + 74);
    ctx.lineTo(X - 17, oy + 86);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath();
    ctx.arc(X, oy + 38, 7, 0, 6.28);
    ctx.fill();
  }
  // exit mat + doorway glow at the bottom
  const door = M.portals[0],
    gx = door.x + ox,
    gy = door.y + oy;
  const gl = ctx.createRadialGradient(gx, gy + 10, 4, gx, gy + 10, 90);
  gl.addColorStop(0, 'rgba(255,240,190,' + (0.5 + Math.sin(time * 3) * 0.08) + ')');
  gl.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(gx - 100, gy - 80, 200, 120);
  ctx.fillStyle = shade(M.building.accent, -0.35);
  rrect(gx - 44, gy - 14, 88, 34, 6);
  ctx.fill();
  ctx.fillStyle = M.building.accent;
  rrect(gx - 40, gy - 10, 80, 26, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath();
  ctx.moveTo(gx, gy + 12);
  ctx.lineTo(gx - 9, gy);
  ctx.lineTo(gx + 9, gy);
  ctx.closePath();
  ctx.fill();
  // vignette so the room feels lit from the middle
  const vg = ctx.createRadialGradient(ox + W / 2, oy + H * 0.55, Math.min(W, H) * 0.3, ox + W / 2, oy + H * 0.55, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,6,4,.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(ox, oy, W, H);
}

/* ---------------- building glyphs (vector icons for the signs) ---------------- */
function glyph(kind, x, y, s, col) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 10, s / 10);
  ctx.fillStyle = col;
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (kind) {
    case 'scroll':
      rrect(-6, -7, 12, 14, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3, -3);
      ctx.lineTo(3, -3);
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.moveTo(-3, 3);
      ctx.lineTo(1, 3);
      ctx.stroke();
      break;
    case 'potion':
      ctx.beginPath();
      ctx.moveTo(-2, -8);
      ctx.lineTo(2, -8);
      ctx.lineTo(2, -3);
      ctx.lineTo(6, 5);
      ctx.quadraticCurveTo(6, 8, 3, 8);
      ctx.lineTo(-3, 8);
      ctx.quadraticCurveTo(-6, 8, -6, 5);
      ctx.lineTo(-2, -3);
      ctx.closePath();
      ctx.stroke();
      ctx.fillRect(-4, 3, 8, 3);
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(7, -5);
      ctx.lineTo(6, 3);
      ctx.quadraticCurveTo(4, 7, 0, 9);
      ctx.quadraticCurveTo(-4, 7, -6, 3);
      ctx.lineTo(-7, -5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, 5);
      ctx.moveTo(-3.5, 0);
      ctx.lineTo(3.5, 0);
      ctx.stroke();
      break;
    case 'crate':
      ctx.strokeRect(-7, -6, 14, 12);
      ctx.beginPath();
      ctx.moveTo(-7, -6);
      ctx.lineTo(7, 6);
      ctx.moveTo(7, -6);
      ctx.lineTo(-7, 6);
      ctx.stroke();
      break;
    case 'board':
      ctx.strokeRect(-7, -6, 14, 12);
      ctx.fillRect(-4, -3, 4, 4);
      ctx.fillRect(1, -3, 3, 2);
      ctx.fillRect(1, 1, 3, 3);
      ctx.fillRect(-4, 2, 3, 2);
      break;
    case 'sword':
      ctx.beginPath();
      ctx.moveTo(-6, 6);
      ctx.lineTo(5, -5);
      ctx.moveTo(1, 3);
      ctx.lineTo(5, 7);
      ctx.moveTo(-1, 1);
      ctx.lineTo(3, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, -5);
      ctx.lineTo(7, -7);
      ctx.stroke();
      break;
    case 'orb':
      ctx.beginPath();
      ctx.arc(0, -1, 6, 0, 6.28);
      ctx.stroke();
      ctx.fillRect(-4, 6, 8, 2.5);
      ctx.beginPath();
      ctx.arc(-2, -3, 1.6, 0, 6.28);
      ctx.fill();
      break;
    case 'paw':
      ctx.beginPath();
      ctx.ellipse(0, 3.5, 4.5, 3.5, 0, 0, 6.28);
      ctx.fill();
      for (const [px, py] of [[-5.5, -1], [-2, -5], [2, -5], [5.5, -1]]) {
        ctx.beginPath();
        ctx.arc(px, py, 1.9, 0, 6.28);
        ctx.fill();
      }
      break;
    case 'cross':
      ctx.fillRect(-2, -8, 4, 16);
      ctx.fillRect(-7, -3, 14, 4);
      break;
    case 'hanger':
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.arc(0, -5, 2, Math.PI / 2, -Math.PI * 0.2, true);
      ctx.moveTo(0, -3);
      ctx.lineTo(-8, 5);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'coin':
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, 6.28);
      ctx.stroke();
      ctx.font = '800 10px "Nunito Sans",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0.5);
      break;
    case 'ring':
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 7, 0, 0, 6.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.4, 3.4, 0, 0, 6.28);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

/* ---------------- buildings (classic medieval: timber or stone walls, tiled / thatched roofs) ---------------- */
const VL_WOOD = '#4a321c';
function vlStoneWall(X, Y, w, h, base, R) {
  ctx.fillStyle = vgrad(Y, Y, h, shade(base, 0.08), shade(base, -0.1));
  ctx.fillRect(X, Y, w, h);
  for (let y = 0, r = 0; y < h; y += 15, r++) {
    let x = -((r % 2) * 18);
    const bh = Math.min(15, h - y);
    while (x < w) {
      const bw = 30 + ((R() * 14) | 0),
        x0 = Math.max(0, x),
        x1 = Math.min(w, x + bw);
      if (x1 > x0) {
        ctx.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)';
        ctx.fillRect(X + x0, Y + y, x1 - x0, bh);
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        ctx.fillRect(X + x1 - 1, Y + y, 1.3, bh);
      }
      x += bw;
    }
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(X, Y + y, w, 1.3);
  }
}
function vlTimberWall(X, Y, w, h, base) {
  ctx.fillStyle = vgrad(Y, Y, h, shade(base, 0.08), shade(base, -0.09));
  ctx.fillRect(X, Y, w, h);
  const n = Math.max(2, Math.round(w / 72)),
    step = w / n,
    bandB = Y + 52;
  ctx.fillStyle = VL_WOOD;
  ctx.fillRect(X, Y, w, 5); // top plate
  ctx.fillRect(X, bandB, w, 5); // floor beam
  ctx.fillRect(X, Y + h - 6, w, 6); // sill beam
  for (let i = 0; i <= n; i++) ctx.fillRect(X + Math.min(i * step, w - 6), Y, 6, h);
  ctx.strokeStyle = VL_WOOD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = X + i * step + 5,
      x1 = X + (i + 1) * step - 1;
    if (i % 2) {
      ctx.moveTo(x0, Y + 6);
      ctx.lineTo(x1, bandB);
    } else {
      ctx.moveTo(x0, bandB);
      ctx.lineTo(x1, Y + 6);
    }
  }
  ctx.stroke();
}
// rows of roof tiles inside the current clip: staggered ticks + a dark line under each row
function vlTileRows(x0, x1, yTop, yBot, rowH) {
  ctx.strokeStyle = 'rgba(0,0,0,.3)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let yy = yBot, r = 0; yy > yTop; yy -= rowH, r++) {
    ctx.moveTo(x0, yy);
    ctx.lineTo(x1, yy);
    for (let x = x0 - (r % 2) * 8; x < x1; x += 16) {
      ctx.moveTo(x, yy);
      ctx.lineTo(x, yy - rowH);
    }
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  for (let yy = yBot, r = 0; yy > yTop; yy -= rowH, r++) ctx.fillRect(x0, yy - rowH + 1, x1 - x0, 2);
}
function vlChimney(x, y, w) {
  ctx.fillStyle = '#6f6759';
  ctx.fillRect(x, y - 28, w, 34);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(x, y - 28, 3, 34);
  ctx.fillStyle = '#4a443a';
  ctx.fillRect(x - 3, y - 33, w + 6, 7);
  for (let i = 0; i < 4; i++) {
    const t = (time * 0.28 + i / 4) % 1;
    ctx.fillStyle = 'rgba(225,225,228,' + (0.34 * (1 - t)).toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(x + w / 2 + Math.sin(time * 1.3 + i * 2) * 6 * t + t * 6, y - 38 - t * 46, 4 + t * 9, 0, 6.28);
    ctx.fill();
  }
}
function vlAtticWindow(x, y, ac) {
  ctx.fillStyle = VL_WOOD;
  rrect(x - 13, y - 3, 26, 30, [13, 13, 2, 2]);
  ctx.fill();
  ctx.fillStyle = vgrad(y, y, 24, '#ffe9a6', '#d99a45');
  rrect(x - 10, y, 20, 24, [10, 10, 1, 1]);
  ctx.fill();
  ctx.fillStyle = VL_WOOD;
  ctx.fillRect(x - 1, y, 2, 24);
  ctx.fillRect(x - 10, y + 11, 20, 2);
}
function drawBuilding(o, X, Y) {
  const b = o.b,
    w = o.w,
    h = o.h,
    ac = b.accent,
    dx = X + w / 2,
    R = mulberry(Math.abs(b.x * 7 + b.y) + 3),
    stone = b.mat === 'stone',
    style = b.style === 'flat' ? 'hip' : b.style;
  // ground shadow
  ctx.fillStyle = 'rgba(28,20,10,.26)';
  rrect(X - 6, Y + h - 8, w + 30, 20, 10);
  ctx.fill();
  // walls
  if (stone) {
    vlStoneWall(X, Y, w, h, b.wall, R);
    // lighter corner stones (quoins)
    for (let y = 0, i = 0; y < h; y += 15, i++) {
      ctx.fillStyle = 'rgba(255,255,255,' + (i % 2 ? 0.16 : 0.08) + ')';
      ctx.fillRect(X, Y + y, i % 2 ? 14 : 22, 14);
      ctx.fillRect(X + w - (i % 2 ? 14 : 22), Y + y, i % 2 ? 14 : 22, 14);
    }
  } else {
    vlTimberWall(X, Y, w, h - 18, b.wall);
    vlStoneWall(X - 2, Y + h - 22, w + 4, 22, '#85806f', R); // stone foundation
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(X - 2, Y + h - 22, w + 4, 2);
  }
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ctx.fillRect(X + w - 8, Y, 8, h);
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.fillRect(X, Y, 3, h);
  // roof
  let rh;
  if (style === 'gable') {
    rh = w > 300 ? 104 : 82;
    const ov = 14;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X - ov, Y + 6);
    ctx.lineTo(dx, Y - rh);
    ctx.lineTo(X + w + ov, Y + 6);
    ctx.closePath();
    ctx.fillStyle = vgrad(Y - rh, Y - rh, rh + 6, shade(b.roof, 0.16), shade(b.roof, -0.14));
    ctx.fill();
    ctx.clip();
    vlTileRows(X - ov, X + w + ov, Y - rh, Y + 6, 11);
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    ctx.fillRect(X - ov, Y - rh, w / 2 + ov, rh + 8);
    ctx.fillStyle = 'rgba(0,0,0,.1)';
    ctx.fillRect(dx, Y - rh, w / 2 + ov, rh + 8);
    ctx.restore();
    ctx.strokeStyle = shade(b.roof, -0.5);
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(X - ov, Y + 6);
    ctx.lineTo(dx, Y - rh);
    ctx.lineTo(X + w + ov, Y + 6);
    ctx.stroke();
    ctx.fillStyle = shade(b.roof, -0.35);
    rrect(X - ov, Y - 2, w + ov * 2, 9, 3);
    ctx.fill();
    ctx.fillStyle = VL_WOOD;
    ctx.fillRect(X - ov + 3, Y + 7, w + ov * 2 - 6, 4);
    vlAtticWindow(dx, Y - rh * 0.5, ac);
    ctx.fillStyle = '#d9b25a';
    ctx.beginPath();
    ctx.arc(dx, Y - rh - 3, 4, 0, 6.28);
    ctx.fill();
    vlChimney(X + w * 0.74, Y - rh + ((X + w * 0.74 - dx) / (w / 2 + ov)) * (rh + 6) + 4, 16);
    if (b.id === 'guild') {
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(dx - 1.5, Y - rh - 50, 3, 46);
      ctx.fillStyle = ac;
      ctx.beginPath();
      ctx.moveTo(dx + 1.5, Y - rh - 50);
      ctx.lineTo(dx + 36 + Math.sin(time * 4) * 3, Y - rh - 41);
      ctx.lineTo(dx + 1.5, Y - rh - 30);
      ctx.fill();
    }
  } else if (style === 'thatch') {
    rh = 74;
    const ov = 16;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X - ov - 4, Y + 8);
    ctx.bezierCurveTo(X - ov + 2, Y - rh * 0.3, X + w * 0.1, Y - rh, dx, Y - rh);
    ctx.bezierCurveTo(X + w * 0.9, Y - rh, X + w + ov - 2, Y - rh * 0.3, X + w + ov + 4, Y + 8);
    for (let x = X + w + ov + 4, i = 0; x > X - ov - 4; x -= 9, i++) ctx.lineTo(x, Y + 8 + (i % 2) * 5);
    ctx.closePath();
    ctx.fillStyle = vgrad(Y - rh, Y - rh, rh + 12, shade(b.roof, 0.18), shade(b.roof, -0.2));
    ctx.fill();
    ctx.clip();
    ctx.lineWidth = 1;
    for (let i = 0; i < 260; i++) {
      const x = X - ov + R() * (w + ov * 2),
        y = Y - rh + R() * (rh + 12),
        l = 7 + R() * 10;
      ctx.strokeStyle = R() < 0.5 ? 'rgba(70,46,12,.34)' : 'rgba(255,232,150,.3)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (x - dx) * 0.03, y + l);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(60,40,10,.3)';
    ctx.lineWidth = 2;
    for (let yy = Y - rh + 18; yy < Y + 8; yy += 18) {
      ctx.beginPath();
      ctx.moveTo(X - ov - 6, yy + 6);
      ctx.quadraticCurveTo(dx, yy - 8, X + w + ov + 6, yy + 6);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(X - ov - 6, Y - rh, w / 2 + ov + 6, rh + 14);
    ctx.restore();
    vlAtticWindow(dx, Y - rh * 0.48, ac);
    ctx.fillStyle = shade(b.roof, -0.35);
    rrect(dx - 26, Y - rh - 5, 52, 9, 4);
    ctx.fill();
    vlChimney(X + w * 0.8, Y - rh * 0.4, 14);
  } else {
    // hip roof
    rh = 66;
    const ov = 12;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X - ov, Y + 6);
    ctx.lineTo(X + w * 0.15, Y - rh);
    ctx.lineTo(X + w * 0.85, Y - rh);
    ctx.lineTo(X + w + ov, Y + 6);
    ctx.closePath();
    ctx.fillStyle = vgrad(Y - rh, Y - rh, rh + 6, shade(b.roof, 0.18), shade(b.roof, -0.14));
    ctx.fill();
    ctx.clip();
    vlTileRows(X - ov, X + w + ov, Y - rh, Y + 6, 11);
    ctx.fillStyle = 'rgba(255,255,255,.09)';
    ctx.fillRect(X - ov, Y - rh, w / 2 + ov, rh + 8);
    ctx.restore();
    ctx.strokeStyle = shade(b.roof, -0.5);
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(X - ov, Y + 6);
    ctx.lineTo(X + w * 0.15, Y - rh);
    ctx.lineTo(X + w * 0.85, Y - rh);
    ctx.lineTo(X + w + ov, Y + 6);
    ctx.stroke();
    ctx.fillStyle = shade(b.roof, -0.3);
    rrect(X + w * 0.15 - 6, Y - rh - 3, w * 0.7 + 12, 7, 3); // ridge cap
    ctx.fill();
    ctx.fillStyle = shade(b.roof, -0.35);
    rrect(X - ov, Y - 2, w + ov * 2, 9, 3);
    ctx.fill();
    ctx.fillStyle = VL_WOOD;
    ctx.fillRect(X - ov + 3, Y + 7, w + ov * 2 - 6, 4);
    if (b.id === 'warp') {
      // glowing rune ring on the roof
      const g = ctx.createRadialGradient(dx, Y - rh * 0.5, 2, dx, Y - rh * 0.5, 50);
      g.addColorStop(0, 'rgba(120,220,255,.85)');
      g.addColorStop(1, 'rgba(120,220,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx - 52, Y - rh - 12, 104, 100);
      ctx.strokeStyle = '#d9f6ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(dx, Y - rh * 0.5, 22 + Math.sin(time * 3) * 2, 12, 0, 0, 6.28);
      ctx.stroke();
    } else {
      const dorm = w >= 250 ? [0.3, 0.7] : [0.5];
      for (const f of dorm) vlAtticWindow(X + w * f, Y - rh * 0.62, ac);
    }
    vlChimney(X + w * 0.88, Y - rh * 0.3, 14);
  }
  // hanging wooden sign
  const sy = Y + 24,
    sh = 26;
  ctx.font = '700 12.5px Cinzel,"Nunito Sans",serif';
  const tw = Math.min(w - 74, ctx.measureText(b.n).width),
    sw = tw + 52;
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(dx - sw / 2 + 12, sy - 13);
  ctx.lineTo(dx - sw / 2 + 12, sy);
  ctx.moveTo(dx + sw / 2 - 12, sy - 13);
  ctx.lineTo(dx + sw / 2 - 12, sy);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(dx - sw / 2 + 2, sy - 13);
  ctx.lineTo(dx + sw / 2 - 2, sy - 13);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  rrect(dx - sw / 2 + 3, sy + 3, sw, sh, 4);
  ctx.fill();
  ctx.fillStyle = vgrad(sy, sy, sh, '#8a6034', '#573a1e');
  rrect(dx - sw / 2, sy, sw, sh, 4);
  ctx.fill();
  ctx.strokeStyle = '#d9b25a';
  ctx.lineWidth = 1.5;
  rrect(dx - sw / 2 + 2.5, sy + 2.5, sw - 5, sh - 5, 3);
  ctx.stroke();
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(dx - sw / 2 + 17, sy + sh / 2, 9.5, 0, 6.28);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  glyph(b.icon, dx - sw / 2 + 17, sy + sh / 2, 11, '#1b1f27');
  ctx.fillStyle = '#f6e7c2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.n, dx + 13, sy + sh / 2 + 1, tw);
  ctx.textBaseline = 'alphabetic';
  // shuttered windows with warm light (left and right of the door)
  const gw = 26,
    gh = 36,
    wy = Y + 64,
    slots = Math.max(1, Math.floor((w - 100) / 2 / 46));
  for (const side of [-1, 1])
    for (let i = 0; i < slots; i++) {
      const wx = dx + side * (58 + i * 46) - gw / 2;
      if (wx - 9 < X + 4 || wx + gw + 9 > X + w - 4) continue;
      ctx.fillStyle = VL_WOOD;
      rrect(wx - 3, wy - 3, gw + 6, gh + 6, [gw / 2 + 3, gw / 2 + 3, 2, 2]);
      ctx.fill();
      ctx.fillStyle = vgrad(wy, wy, gh, '#ffe9a6', '#d99a45');
      rrect(wx, wy, gw, gh, [gw / 2, gw / 2, 1, 1]);
      ctx.fill();
      ctx.fillStyle = VL_WOOD;
      ctx.fillRect(wx + gw / 2 - 1, wy, 2, gh);
      ctx.fillRect(wx, wy + gh * 0.45, gw, 2);
      ctx.fillStyle = shade(ac, -0.32);
      for (const sx of [wx - 9, wx + gw + 2]) {
        ctx.fillRect(sx, wy, 7, gh);
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        for (let k = 3; k < gh; k += 5) ctx.fillRect(sx, wy + k, 7, 1);
        ctx.fillStyle = shade(ac, -0.32);
      }
      // flower box
      ctx.fillStyle = '#5a3b1f';
      rrect(wx - 4, wy + gh + 2, gw + 8, 8, 2);
      ctx.fill();
      for (let k = 0; k < 4; k++) {
        ctx.fillStyle = k % 2 ? '#5fa84a' : ac;
        ctx.beginPath();
        ctx.arc(wx + 1 + k * 8, wy + gh + 1, 3, 0, 6.28);
        ctx.fill();
      }
    }
  // arched wooden door with soft glow (the door is the portal)
  const near = Math.hypot(P.x - o.x - w / 2, P.y - (o.y + h + 10)) < 120,
    pulse = 0.5 + Math.sin(time * 3 + b.x) * 0.15 + (near ? 0.25 : 0),
    dw = 44,
    dh = 68,
    dy = Y + h - dh;
  const glow = ctx.createRadialGradient(dx, Y + h, 4, dx, Y + h - 20, 70);
  glow.addColorStop(0, ac + 'cc');
  glow.addColorStop(1, ac + '00');
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = glow;
  ctx.fillRect(dx - 80, Y + h - 90, 160, 110);
  ctx.restore();
  ctx.fillStyle = '#6f695c';
  rrect(dx - dw / 2 - 7, dy - 7, dw + 14, dh + 7, [dw / 2 + 7, dw / 2 + 7, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#35291a';
  rrect(dx - dw / 2 - 3, dy - 3, dw + 6, dh + 3, [dw / 2 + 3, dw / 2 + 3, 0, 0]);
  ctx.fill();
  ctx.fillStyle = vgrad(dy, dy, dh, '#8d5c2e', '#5b3a1b');
  rrect(dx - dw / 2, dy, dw, dh, [dw / 2, dw / 2, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const k of [-11, 0, 11]) {
    ctx.moveTo(dx + k, dy + (k === 0 ? 2 : 10));
    ctx.lineTo(dx + k, dy + dh);
  }
  ctx.stroke();
  ctx.fillStyle = '#2b2b30';
  ctx.fillRect(dx - dw / 2, dy + 22, dw, 5);
  ctx.fillRect(dx - dw / 2, dy + dh - 20, dw, 5);
  ctx.strokeStyle = '#d9b25a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(dx + 12, dy + dh * 0.56, 3.2, 0, 6.28);
  ctx.stroke();
  // accent keystone marks the portal
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(dx, dy - 7, 4 + Math.sin(time * 3 + b.x) * 0.5, 0, 6.28);
  ctx.fill();
  // wall lanterns either side of the door
  for (const s of [-1, 1]) {
    const lx = dx + s * 38,
      ly = dy + 10,
      fl = 1 + Math.sin(time * 9 + lx) * 0.12;
    const lg = ctx.createRadialGradient(lx, ly + 6, 1, lx, ly + 6, 26 * fl);
    lg.addColorStop(0, 'rgba(255,190,90,.55)');
    lg.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 30, ly - 24, 60, 60);
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly - 6);
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.fillStyle = '#2b2118';
    rrect(lx - 4.5, ly, 9, 13, 2);
    ctx.fill();
    ctx.fillStyle = '#ffd87a';
    rrect(lx - 2.5, ly + 2.5, 5, 8, 2);
    ctx.fill();
  }
}

/* ---------------- small props ---------------- */
function drawLamp(x, y) {
  // standing torch (iron brazier on a wooden post)
  const fl = 1 + Math.sin(time * 9 + x * 0.13) * 0.08 + Math.sin(time * 13 + x) * 0.05;
  shadow(x + 3, y + 2, 9, 3.5, 0.25);
  const g = ctx.createRadialGradient(x, y - 66, 2, x, y - 66, 58 * fl);
  g.addColorStop(0, 'rgba(255,170,70,.5)');
  g.addColorStop(1, 'rgba(255,170,70,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 64, y - 126, 128, 128);
  ctx.fillStyle = '#7d776a';
  rrect(x - 7, y - 4, 14, 7, 2);
  ctx.fill();
  ctx.fillStyle = '#4a3420';
  ctx.fillRect(x - 3, y - 54, 6, 54);
  ctx.fillStyle = '#2b2724';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 72);
  ctx.lineTo(x + 10, y - 72);
  ctx.lineTo(x + 5, y - 54);
  ctx.lineTo(x - 5, y - 54);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff8a2a';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 70);
  ctx.quadraticCurveTo(x - 9, y - 82, x + Math.sin(time * 7 + x) * 1.5, y - 70 - 20 * fl);
  ctx.quadraticCurveTo(x + 9, y - 82, x + 7, y - 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd45a';
  ctx.beginPath();
  ctx.moveTo(x - 3.5, y - 70);
  ctx.quadraticCurveTo(x - 4, y - 77, x, y - 70 - 12 * fl);
  ctx.quadraticCurveTo(x + 4, y - 77, x + 3.5, y - 70);
  ctx.closePath();
  ctx.fill();
}
function drawBench(x, y, fl) {
  shadow(x, y + 5, 26, 7, 0.22);
  ctx.fillStyle = '#4a3420';
  ctx.fillRect(x - 22, y - 2, 5, 9);
  ctx.fillRect(x + 17, y - 2, 5, 9);
  ctx.fillStyle = '#8a6238';
  rrect(x - 24, y - 7, 48, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#6f4d2b';
  rrect(x - 24, y - 20, 48, 8, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.fillRect(x - 22, y - 7, 44, 2);
}
const PLANTER_COL = [['#ff7aa8', '#ffd96a'], ['#ffffff', '#ff9a5a'], ['#b07aff', '#ffe46a']];
function drawPlanter(x, y, c) {
  // half barrel with flowers
  const f = PLANTER_COL[c % 3];
  shadow(x, y + 4, 15, 5, 0.2);
  ctx.fillStyle = '#7a5230';
  rrect(x - 12, y - 9, 24, 15, 3);
  ctx.fill();
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(x - 12, y - 6, 24, 2);
  ctx.fillRect(x - 12, y + 1, 24, 2);
  ctx.fillStyle = '#58a14a';
  ctx.beginPath();
  ctx.arc(x - 5, y - 11, 8, 0, 6.28);
  ctx.arc(x + 5, y - 11, 8, 0, 6.28);
  ctx.arc(x, y - 16, 8, 0, 6.28);
  ctx.fill();
  for (const [ox, oy, k] of [[-7, -14, 0], [3, -18, 1], [7, -11, 0], [-1, -10, 1]]) {
    ctx.fillStyle = f[k];
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, 2.6, 0, 6.28);
    ctx.fill();
  }
}
function drawFountain(x, y) {
  // weathered stone fountain with a little moss
  shadow(x, y + 16, 74, 28, 0.28);
  ctx.fillStyle = '#6a6458';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 66, 44, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#a8a191';
  ctx.beginPath();
  ctx.ellipse(x, y, 64, 42, 0, 0, 6.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 6.28;
    ctx.moveTo(x + Math.cos(a) * 54, y + Math.sin(a) * 33);
    ctx.lineTo(x + Math.cos(a) * 64, y + Math.sin(a) * 42);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(88,128,68,.55)';
  for (const [ox, oy, r] of [[-52, 18, 9], [-40, 28, 6], [48, 24, 8], [58, 8, 5]]) {
    ctx.beginPath();
    ctx.ellipse(x + ox, y + oy, r, r * 0.6, 0, 0, 6.28);
    ctx.fill();
  }
  const wg = ctx.createRadialGradient(x, y - 2, 4, x, y - 2, 52);
  wg.addColorStop(0, '#9fdde6');
  wg.addColorStop(1, '#3c92ad');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 54, 33, 0, 0, 6.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const t = (time * 0.7 + i / 3) % 1;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 12 + t * 40, 7 + t * 24, 0, 0, 6.28);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // pedestal + upper basin
  ctx.fillStyle = '#8b8575';
  ctx.fillRect(x - 6, y - 36, 12, 34);
  ctx.fillStyle = '#a8a191';
  ctx.beginPath();
  ctx.ellipse(x, y - 38, 26, 14, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#62b6cc';
  ctx.beginPath();
  ctx.ellipse(x, y - 39, 21, 10.5, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = 'rgba(210,245,255,.9)';
  for (let i = 0; i < 9; i++) {
    const t = (time * 1.4 + i / 9) % 1,
      a = i * 0.7 + 1,
      r = 6 + t * 26;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * (t > 0.5 ? 1 : 0.5), y - 62 + (t * 2 - 1) * (t * 2 - 1) * 28 - 6 + t * 24 - 22 * (1 - t), 2.1, 0, 6.28);
    ctx.fill();
  }
}
function drawFence(o, x, y) {
  const horiz = o.w > o.h;
  ctx.fillStyle = '#7a5634';
  if (horiz) {
    ctx.fillRect(x, y + 2, o.w, 3);
    ctx.fillRect(x, y + 9, o.w, 3);
    ctx.fillStyle = '#5e4026';
    for (let i = 0; i <= o.w; i += 40) {
      const px = x + Math.min(i, o.w - 5);
      ctx.fillRect(px, y - 8, 5, 24);
      ctx.fillStyle = '#8a6238';
      ctx.fillRect(px - 0.5, y - 10, 6, 3);
      ctx.fillStyle = '#5e4026';
    }
  } else {
    ctx.fillRect(x + 2, y, 3, o.h);
    for (let i = 0; i <= o.h; i += 40) {
      ctx.fillStyle = '#5e4026';
      ctx.fillRect(x, y + Math.min(i, o.h - 5) - 4, 8, 14);
      ctx.fillStyle = '#8a6238';
      ctx.fillRect(x - 0.5, y + Math.min(i, o.h - 5) - 6, 9, 3);
    }
  }
}
/* village scenery: well, market stalls, hay, barrels, crates, signpost (obstacles added in world.js) */
function vlWell(x, y) {
  shadow(x, y + 14, 32, 10, 0.3);
  ctx.fillStyle = '#7d776a';
  ctx.fillRect(x - 24, y - 8, 48, 20);
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 24, 10, 0, 0, 6.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let r = 0; r < 2; r++) {
    ctx.moveTo(x - 24, y - 8 + r * 9 + 4);
    ctx.lineTo(x + 24, y - 8 + r * 9 + 4);
  }
  for (let i = -18; i <= 18; i += 12) {
    ctx.moveTo(x + i, y - 4);
    ctx.lineTo(x + i, y + 4);
  }
  ctx.stroke();
  ctx.fillStyle = '#a39c8c';
  ctx.beginPath();
  ctx.ellipse(x, y - 8, 25, 12, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#1c2a33';
  ctx.beginPath();
  ctx.ellipse(x, y - 8, 18, 8, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#4a321c';
  ctx.fillRect(x - 24, y - 52, 5, 46);
  ctx.fillRect(x + 19, y - 52, 5, 46);
  ctx.fillRect(x - 26, y - 56, 52, 5);
  ctx.fillStyle = '#7a4a2a';
  ctx.beginPath();
  ctx.moveTo(x - 32, y - 52);
  ctx.lineTo(x, y - 74);
  ctx.lineTo(x + 32, y - 52);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.28)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let k = 1; k < 4; k++) {
    ctx.moveTo(x - 32 + k * 5, y - 52 - k * 5.5);
    ctx.lineTo(x + 32 - k * 5, y - 52 - k * 5.5);
  }
  ctx.stroke();
  ctx.strokeStyle = '#8a7a5a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 55);
  ctx.lineTo(x, y - 24);
  ctx.stroke();
  ctx.fillStyle = '#6f4d2b';
  rrect(x - 5, y - 24, 10, 9, 2);
  ctx.fill();
}
const VL_STALL = {
  fruit: ['#d8453a', '#f0a030', '#6fb04a', '#f0d040'],
  bread: ['#c98a3f', '#a8672c', '#e0b060'],
  pots: ['#b5653a', '#8f4a2a', '#c98a5a'],
  cloth: ['#4a5ab8', '#e0553f', '#f2b84b', '#2f9d7f'],
};
function vlStall(o, x, y) {
  const w = o.w,
    col = o.col || '#c0392b',
    goods = VL_STALL[o.goods] || VL_STALL.fruit;
  shadow(x + w / 2, y + o.h + 4, w / 2 + 8, 8, 0.28);
  // posts + counter
  ctx.fillStyle = '#4a321c';
  ctx.fillRect(x + 3, y - 50, 5, 54);
  ctx.fillRect(x + w - 8, y - 50, 5, 54);
  ctx.fillStyle = vgrad(y, y, o.h, '#8a6034', '#5e3f20');
  rrect(x, y + 4, w, o.h - 4, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 1; i < 5; i++) {
    ctx.moveTo(x + (i * w) / 5, y + 6);
    ctx.lineTo(x + (i * w) / 5, y + o.h - 2);
  }
  ctx.stroke();
  ctx.fillStyle = '#a07040';
  rrect(x - 3, y, w + 6, 8, 3);
  ctx.fill();
  // goods on the counter
  const R = mulberry(Math.floor(o.x) + Math.floor(o.y));
  for (let i = 0; i < 9; i++) {
    const gx = x + 8 + i * ((w - 16) / 8.5),
      gy = y - 1 - (i % 2) * 3;
    ctx.fillStyle = goods[(R() * goods.length) | 0];
    ctx.beginPath();
    if (o.goods === 'bread') ctx.ellipse(gx, gy, 7, 4.5, 0, 0, 6.28);
    else if (o.goods === 'pots') ctx.roundRect(gx - 5, gy - 8, 10, 10, 4);
    else if (o.goods === 'cloth') ctx.roundRect(gx - 6, gy - 6, 12, 7, 1.5);
    else ctx.arc(gx, gy - 2, 4.3, 0, 6.28);
    ctx.fill();
  }
  // striped canvas awning, wider at the front, with a scalloped edge
  const n = 8,
    ay = y - 56,
    tw = w / n,
    bw = (w + 18) / n;
  for (let i = 0; i < n; i++) {
    const t0 = x + i * tw,
      b0 = x - 9 + i * bw;
    ctx.fillStyle = i % 2 ? '#f1e6c8' : col;
    ctx.beginPath();
    ctx.moveTo(t0, ay);
    ctx.lineTo(t0 + tw, ay);
    ctx.lineTo(b0 + bw, ay + 22);
    ctx.arc(b0 + bw / 2, ay + 22, bw / 2, 0, Math.PI);
    ctx.lineTo(t0, ay);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(x, ay, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.fillRect(x - 8, ay + 17, w + 16, 3);
}
function vlHay(x, y) {
  shadow(x, y + 6, 17, 6, 0.26);
  ctx.fillStyle = '#b78d2f';
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 16, 13, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#e0bd5a';
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 14, 10.5, 0, 0, 6.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,84,20,.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -3; i <= 3; i++) {
    ctx.moveTo(x + i * 3.6, y - 12);
    ctx.lineTo(x + i * 3.8 + 2, y + 5);
  }
  ctx.stroke();
  ctx.strokeStyle = '#7a5a20';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(x, y - 3, 16, 12, 0, 0.3, 2.84);
  ctx.stroke();
}
function vlBarrel(x, y) {
  shadow(x, y + 5, 14, 5, 0.26);
  ctx.fillStyle = '#7a4f2a';
  rrect(x - 11, y - 22, 22, 26, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.fillRect(x - 9, y - 20, 4, 22);
  ctx.fillStyle = '#34261a';
  ctx.fillRect(x - 11, y - 17, 22, 3);
  ctx.fillRect(x - 11, y - 5, 22, 3);
  ctx.fillStyle = '#a47440';
  ctx.beginPath();
  ctx.ellipse(x, y - 22, 10, 4, 0, 0, 6.28);
  ctx.fill();
}
function vlCrate(x, y, n) {
  shadow(x, y + 6, 16, 5, 0.26);
  for (let i = 0; i < (n || 1); i++) {
    const by = y - i * 19;
    ctx.fillStyle = '#9a6e3c';
    ctx.fillRect(x - 12 + i * 2, by - 18, 24, 22);
    ctx.strokeStyle = '#5e3f20';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 11 + i * 2, by - 17, 22, 20);
    ctx.beginPath();
    ctx.moveTo(x - 11 + i * 2, by - 17);
    ctx.lineTo(x + 11 + i * 2, by + 3);
    ctx.moveTo(x + 11 + i * 2, by - 17);
    ctx.lineTo(x - 11 + i * 2, by + 3);
    ctx.stroke();
  }
}
function vlSignpost(x, y, o) {
  shadow(x, y + 4, 12, 4, 0.25);
  ctx.fillStyle = '#4a321c';
  ctx.fillRect(x - 3, y - 62, 6, 64);
  const boards = o.boards || [];
  boards.forEach((t, i) => {
    const by = y - 58 + i * 20,
      dir = t.dir || 1;
    ctx.fillStyle = '#8a6034';
    ctx.beginPath();
    ctx.moveTo(x - dir * 4, by);
    ctx.lineTo(x + dir * 44, by);
    ctx.lineTo(x + dir * 54, by + 8);
    ctx.lineTo(x + dir * 44, by + 16);
    ctx.lineTo(x - dir * 4, by + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a2814';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = '#f6e7c2';
    ctx.font = '700 9.5px Cinzel,"Nunito Sans",serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.t, x + dir * 22, by + 11.5, 42);
  });
}

/* ---------------- interior furniture ---------------- */
function drawShelfContents(sk, x, y, w, h) {
  const rows = [y + 10, y + 36, y + 62];
  const col = ['#e0604d', '#4fa0e0', '#6fd36b', '#f2b84b', '#b07aff', '#ff8bd0'];
  const R = mulberry(Math.floor(x));
  ctx.fillStyle = '#5a3e26';
  for (const ry of rows) ctx.fillRect(x + 4, ry + 14, w - 8, 3);
  if (sk === 'vault') {
    ctx.fillStyle = '#9aa4ae';
    rrect(x + 6, y + 6, w - 12, h - 8, 6);
    ctx.fill();
    ctx.fillStyle = '#7d8791';
    rrect(x + 16, y + 14, w - 32, h - 24, 4);
    ctx.fill();
    ctx.strokeStyle = '#d6dde3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 17, 0, 6.28);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h / 2);
      ctx.lineTo(x + w / 2 + Math.cos(a) * 17, y + h / 2 + Math.sin(a) * 17);
      ctx.stroke();
    }
    ctx.fillStyle = '#f2c14b';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 4, 0, 6.28);
    ctx.fill();
    return;
  }
  if (sk === 'board') {
    ctx.fillStyle = '#b98a58';
    rrect(x + 6, y + 6, w - 12, h - 10, 4);
    ctx.fill();
    for (let i = 0; i < Math.floor((w - 24) / 34); i++) {
      ctx.fillStyle = ['#fff8e0', '#ffe9a8', '#e8f0ff'][i % 3];
      const px = x + 16 + i * 34,
        py = y + 14 + (i % 2) * 22;
      ctx.save();
      ctx.translate(px + 12, py + 14);
      ctx.rotate(((i * 37) % 7) * 0.03 - 0.08);
      ctx.fillRect(-12, -14, 24, 28);
      ctx.restore();
      ctx.fillStyle = '#e0553f';
      ctx.beginPath();
      ctx.arc(px + 12, py + 2, 2.2, 0, 6.28);
      ctx.fill();
    }
    return;
  }
  for (let r = 0; r < 3; r++) {
    const ry = rows[r];
    let px = x + 8;
    while (px < x + w - 20) {
      const c = col[Math.floor(R() * col.length)];
      ctx.fillStyle = c;
      if (sk === 'potion') {
        ctx.beginPath();
        ctx.moveTo(px + 3, ry + 1);
        ctx.lineTo(px + 7, ry + 1);
        ctx.lineTo(px + 7, ry + 5);
        ctx.lineTo(px + 10, ry + 13);
        ctx.lineTo(px, ry + 13);
        ctx.lineTo(px + 3, ry + 5);
        ctx.fill();
        px += 14;
      } else if (sk === 'book') {
        const bh = 10 + Math.floor(R() * 4);
        ctx.fillRect(px, ry + 14 - bh, 5, bh);
        px += 6;
      } else if (sk === 'weapon') {
        ctx.fillStyle = '#c9d1da';
        ctx.fillRect(px + 3, ry - 2, 2, 15);
        ctx.fillStyle = c;
        ctx.fillRect(px, ry + 8, 8, 2);
        px += 16;
      } else if (sk === 'armor') {
        rrect(px, ry + 2, 14, 11, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fillRect(px + 3, ry + 4, 3, 6);
        px += 20;
      } else if (sk === 'bow') {
        ctx.strokeStyle = '#8a5a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px + 4, ry + 7, 8, -1.3, 1.3);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.fillRect(px + 12, ry + 2, 2, 11);
        px += 20;
      } else if (sk === 'cloth') {
        ctx.fillRect(px, ry + 2, 12, 12);
        ctx.fillStyle = 'rgba(255,255,255,.3)';
        ctx.fillRect(px, ry + 2, 12, 3);
        px += 15;
      } else if (sk === 'trophy') {
        ctx.fillStyle = '#f2c14b';
        ctx.fillRect(px + 4, ry + 8, 4, 5);
        ctx.beginPath();
        ctx.moveTo(px, ry);
        ctx.lineTo(px + 12, ry);
        ctx.lineTo(px + 9, ry + 8);
        ctx.lineTo(px + 3, ry + 8);
        ctx.fill();
        px += 20;
      } else if (sk === 'cage') {
        ctx.strokeStyle = '#aab';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, ry + 1, 16, 12);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(px + 8, ry + 9, 3.5, 0, 6.28);
        ctx.fill();
        px += 22;
      } else {
        // crates
        ctx.fillStyle = '#b98a58';
        ctx.fillRect(px, ry + 2, 14, 12);
        ctx.strokeStyle = '#7a5a30';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, ry + 2, 14, 12);
        px += 18;
      }
    }
  }
}
function drawFurnRect(o, x, y) {
  const w = o.w,
    h = o.h;
  switch (o.kind) {
    case 'shelf':
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(x + 2, y + h - 2, w, 6);
      ctx.fillStyle = '#7a5532';
      rrect(x, y, w, h, 3);
      ctx.fill();
      ctx.fillStyle = '#3b2a1a';
      rrect(x + 4, y + 4, w - 8, h - 7, 2);
      ctx.fill();
      drawShelfContents(o.sk, x, y, w, h);
      break;
    case 'counter': {
      shadow(x + w / 2, y + h + 2, w * 0.55, 8, 0.25);
      ctx.fillStyle = shade(o.col, -0.3);
      rrect(x, y + 12, w, h - 12, 3);
      ctx.fill();
      ctx.fillStyle = o.col;
      ctx.fillRect(x + 6, y + 18, w - 12, h - 26);
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      for (let i = 14; i < w - 10; i += 28) ctx.fillRect(x + i, y + 18, 1.5, h - 26);
      ctx.fillStyle = shade(o.col, 0.35);
      rrect(x - 4, y, w + 8, 16, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fillRect(x, y + 2, w, 2);
      // goods on top
      const R = mulberry(Math.floor(x + y));
      for (let i = 16; i < w - 18; i += 38) {
        ctx.fillStyle = ['#e0604d', '#4fa0e0', '#6fd36b', '#f2b84b', '#b07aff'][Math.floor(R() * 5)];
        rrect(x + i, y - 6, 12, 12, 3);
        ctx.fill();
      }
      break;
    }
    case 'table':
      shadow(x + w / 2, y + h + 2, w * 0.55, 7, 0.22);
      ctx.fillStyle = '#6d4a2a';
      ctx.fillRect(x + 6, y + h - 14, 6, 16);
      ctx.fillRect(x + w - 12, y + h - 14, 6, 16);
      ctx.fillStyle = '#b07a46';
      rrect(x, y, w, h - 10, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillRect(x + 4, y + 3, w - 8, 3);
      if (o.sk === 'map') {
        ctx.fillStyle = '#f2e6c0';
        rrect(x + 14, y + 8, w - 28, h - 32, 2);
        ctx.fill();
        ctx.strokeStyle = '#c0432a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 26, y + 20);
        ctx.lineTo(x + w / 2, y + 34);
        ctx.lineTo(x + w - 30, y + 16);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#f4efe4';
        ctx.fillRect(x + 18, y + 10, 22, 16);
        ctx.fillStyle = '#4a5ab8';
        ctx.fillRect(x + w - 40, y + 12, 8, 14);
      }
      break;
    case 'bench':
      shadow(x + w / 2, y + h + 2, w * 0.55, 6, 0.2);
      ctx.fillStyle = '#6d4a2a';
      ctx.fillRect(x + 8, y + h - 8, 6, 10);
      ctx.fillRect(x + w - 14, y + h - 8, 6, 10);
      ctx.fillStyle = '#a97a4a';
      rrect(x, y + 8, w, h - 10, 4);
      ctx.fill();
      ctx.fillStyle = '#8a5f38';
      rrect(x, y - 4, w, 10, 4);
      ctx.fill();
      break;
    case 'altar': {
      shadow(x + w / 2, y + h + 2, w * 0.6, 8, 0.25);
      ctx.fillStyle = '#cfc8b8';
      rrect(x, y + 14, w, h - 14, 4);
      ctx.fill();
      ctx.fillStyle = '#efe8d8';
      rrect(x - 6, y, w + 12, 18, 5);
      ctx.fill();
      ctx.fillStyle = '#7a5cc0';
      ctx.fillRect(x + 14, y + 22, w - 28, 20);
      ctx.fillStyle = '#ffd96a';
      ctx.fillRect(x + w / 2 - 2, y + 24, 4, 16);
      ctx.fillRect(x + w / 2 - 7, y + 29, 14, 4);
      for (const cx2 of [x + 14, x + w - 14]) {
        ctx.fillStyle = '#fff6e0';
        ctx.fillRect(cx2 - 3, y - 12, 6, 14);
        const fg = ctx.createRadialGradient(cx2, y - 16, 1, cx2, y - 16, 16);
        fg.addColorStop(0, 'rgba(255,210,110,.9)');
        fg.addColorStop(1, 'rgba(255,210,110,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(cx2 - 18, y - 34, 36, 36);
      }
      break;
    }
  }
}
function drawFurnCircle(o, x, y) {
  switch (o.kind) {
    case 'plant':
      shadow(x, y + 3, 14, 5, 0.22);
      ctx.fillStyle = '#b4623e';
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 14);
      ctx.lineTo(x + 11, y - 14);
      ctx.lineTo(x + 8, y + 3);
      ctx.lineTo(x - 8, y + 3);
      ctx.fill();
      ctx.fillStyle = '#3f9a4a';
      for (const [ox, oy, r] of [[0, -34, 11], [-9, -26, 9], [9, -26, 9], [0, -24, 10]]) {
        ctx.beginPath();
        ctx.arc(x + ox, y + oy, r, 0, 6.28);
        ctx.fill();
      }
      break;
    case 'crate':
      shadow(x, y + 4, 20, 6, 0.22);
      ctx.fillStyle = '#b98a58';
      ctx.fillRect(x - 15, y - 26, 30, 28);
      ctx.fillStyle = '#d3a770';
      ctx.fillRect(x - 15, y - 26, 30, 7);
      ctx.strokeStyle = '#7a5a30';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 15, y - 26, 30, 28);
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 26);
      ctx.lineTo(x + 15, y + 2);
      ctx.stroke();
      break;
    case 'barrel':
      shadow(x, y + 4, 18, 6, 0.22);
      ctx.fillStyle = '#8a5a30';
      rrect(x - 13, y - 30, 26, 34, 8);
      ctx.fill();
      ctx.fillStyle = '#c9d1da';
      ctx.fillRect(x - 13, y - 22, 26, 3);
      ctx.fillRect(x - 13, y - 8, 26, 3);
      ctx.fillStyle = '#a8763f';
      ctx.beginPath();
      ctx.ellipse(x, y - 30, 12, 5, 0, 0, 6.28);
      ctx.fill();
      break;
    case 'doll':
      shadow(x, y + 3, 14, 5, 0.22);
      ctx.fillStyle = '#5b4a3a';
      ctx.fillRect(x - 1.5, y - 20, 3, 22);
      ctx.fillRect(x - 10, y, 20, 3);
      ctx.fillStyle = o.col;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 40);
      ctx.lineTo(x + 9, y - 40);
      ctx.lineTo(x + 12, y - 12);
      ctx.lineTo(x - 12, y - 12);
      ctx.fill();
      ctx.fillStyle = '#e8d2b8';
      ctx.beginPath();
      ctx.arc(x, y - 48, 7, 0, 6.28);
      ctx.fill();
      break;
    case 'crystal': {
      const g = ctx.createRadialGradient(x, y - 22, 2, x, y - 22, 40);
      g.addColorStop(0, o.col + 'aa');
      g.addColorStop(1, o.col + '00');
      ctx.fillStyle = g;
      ctx.fillRect(x - 40, y - 62, 80, 80);
      shadow(x, y + 3, 14, 5, 0.22);
      ctx.fillStyle = '#4a4f5a';
      ctx.fillRect(x - 10, y - 8, 20, 10);
      ctx.fillStyle = o.col;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 8);
      ctx.lineTo(x, y - 44 + Math.sin(time * 2 + x) * 2);
      ctx.lineTo(x + 9, y - 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 10);
      ctx.lineTo(x, y - 40);
      ctx.lineTo(x + 2, y - 10);
      ctx.fill();
      break;
    }
    case 'cage':
      shadow(x, y + 3, 18, 6, 0.22);
      ctx.fillStyle = '#e8dccb';
      rrect(x - 15, y - 22, 30, 24, 4);
      ctx.fill();
      ctx.strokeStyle = '#8a8f98';
      ctx.lineWidth = 1.5;
      for (let i = -12; i <= 12; i += 6) {
        ctx.beginPath();
        ctx.moveTo(x + i, y - 20);
        ctx.lineTo(x + i, y);
        ctx.stroke();
      }
      ctx.fillStyle = ['#ff7aa8', '#6fd36b', '#4fa0e0', '#f2b84b'][Math.abs(Math.floor(x)) % 4];
      ctx.beginPath();
      ctx.arc(x, y - 6 + Math.sin(time * 4 + x) * 1.5, 5, 0, 6.28);
      ctx.fill();
      break;
    case 'globe':
      shadow(x, y + 3, 14, 5, 0.22);
      ctx.fillStyle = '#6d4a2a';
      ctx.fillRect(x - 3, y - 12, 6, 14);
      ctx.fillRect(x - 10, y - 1, 20, 3);
      ctx.fillStyle = '#4f8fd8';
      ctx.beginPath();
      ctx.arc(x, y - 26, 14, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = '#5fbf6a';
      ctx.beginPath();
      ctx.arc(x - 4, y - 28, 5, 0, 6.28);
      ctx.arc(x + 6, y - 22, 4, 0, 6.28);
      ctx.fill();
      ctx.strokeStyle = '#c9a24a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y - 26, 16, 2.2, 5.2);
      ctx.stroke();
      break;
  }
}

/* One obstacle: returns true when it was drawn here. x,y are screen coordinates (top-left for rects). */
function drawObsMod(o, x, y) {
  switch (o.type) {
    case 'building':
      drawBuilding(o, x, y);
      return true;
    case 'lamp':
      drawLamp(x, y);
      return true;
    case 'bench':
      drawBench(x, y, o.fl);
      return true;
    case 'planter':
      drawPlanter(x, y, o.c);
      return true;
    case 'fountain':
      drawFountain(x, y);
      return true;
    case 'fence':
      drawFence(o, x, y);
      return true;
    case 'well':
      vlWell(x, y);
      return true;
    case 'stall':
      vlStall(o, x, y);
      return true;
    case 'hay':
      vlHay(x, y);
      return true;
    case 'vbarrel':
      vlBarrel(x, y);
      return true;
    case 'vcrate':
      vlCrate(x, y, o.n);
      return true;
    case 'signpost':
      vlSignpost(x, y, o);
      return true;
    case 'invis':
      return true;
    case 'furn':
      if (o.w) drawFurnRect(o, x, y);
      else drawFurnCircle(o, x, y);
      return true;
  }
  return false;
}
