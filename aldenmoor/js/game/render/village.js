/**
 * Rendering: the modern village (roads, plaza, buildings, lamps) and the building interiors.
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

/* ---------------- village ground ---------------- */
function drawVillageGround() {
  const PZ = VILLAGE_PLAZA,
    Y = M.yard,
    ox = -cam.x,
    oy = -cam.y;
  // training yard: packed sand
  ctx.fillStyle = '#d9c79a';
  rrect(Y.x + ox, Y.y + oy, Y.w, Y.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,95,50,.25)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Y.x + ox + 12, Y.y + oy + i * 32);
    ctx.lineTo(Y.x + ox + Y.w - 12, Y.y + oy + i * 32);
    ctx.stroke();
  }
  // roads: dark curb, light paving, faint tile pattern
  ctx.lineJoin = 'round';
  ctx.lineCap = 'butt';
  for (const [w, c] of [
    [64, '#8d929b'],
    [56, '#cfd2d8'],
  ]) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    for (const p of M.paths) {
      ctx.moveTo(p[0][0] + ox, p[0][1] + oy);
      ctx.lineTo(p[1][0] + ox, p[1][1] + oy);
    }
    ctx.stroke();
  }
  ctx.setLineDash([3, 27]);
  ctx.strokeStyle = 'rgba(110,116,128,.2)';
  ctx.lineWidth = 52;
  ctx.beginPath();
  for (const p of M.paths) {
    ctx.moveTo(p[0][0] + ox, p[0][1] + oy);
    ctx.lineTo(p[1][0] + ox, p[1][1] + oy);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  // plaza
  const cx = PZ.x + ox,
    cy = PZ.y + oy;
  ctx.fillStyle = '#8d929b';
  ctx.beginPath();
  ctx.ellipse(cx, cy, PZ.rx + 8, PZ.ry + 7, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#dcdee3';
  ctx.beginPath();
  ctx.ellipse(cx, cy, PZ.rx, PZ.ry, 0, 0, 6.28);
  ctx.fill();
  ctx.strokeStyle = '#c3c7cf';
  ctx.lineWidth = 3;
  for (const k of [0.86, 0.62]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, PZ.rx * k, PZ.ry * k, 0, 0, 6.28);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    ctx.moveTo(cx + Math.cos(a) * PZ.rx * 0.62, cy + Math.sin(a) * PZ.ry * 0.62);
    ctx.lineTo(cx + Math.cos(a) * PZ.rx * 0.98, cy + Math.sin(a) * PZ.ry * 0.98);
  }
  ctx.stroke();
  // inlay in the middle of the plaza
  const ig = ctx.createRadialGradient(cx, cy, 10, cx, cy, PZ.rx * 0.6);
  ig.addColorStop(0, '#f6f3ea');
  ig.addColorStop(1, '#e3dfd2');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.ellipse(cx, cy, PZ.rx * 0.6, PZ.ry * 0.6, 0, 0, 6.28);
  ctx.fill();
  // door mats in front of every building
  for (const p of M.portals) {
    if (!p.door) continue;
    const x = p.x + ox,
      y = p.y + oy,
      a = p.b.accent;
    ctx.fillStyle = shade(a, -0.35);
    rrect(x - 30, y - 8, 60, 26, 6);
    ctx.fill();
    ctx.fillStyle = a;
    rrect(x - 27, y - 5, 54, 20, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 4; i++) ctx.fillRect(x - 21 + i * 12, y - 1, 6, 12);
  }
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

/* ---------------- buildings ---------------- */
function drawBuilding(o, X, Y) {
  const b = o.b,
    w = o.w,
    h = o.h,
    ac = b.accent,
    dx = X + w / 2,
    seed = Math.abs(b.x * 7 + b.y) % 5;
  // ground shadow
  ctx.fillStyle = 'rgba(25,30,40,.22)';
  rrect(X - 6, Y + h - 8, w + 30, 20, 10);
  ctx.fill();
  // facade
  ctx.fillStyle = vgrad(Y, Y, h, shade(b.wall, 0.06), shade(b.wall, -0.1));
  ctx.fillRect(X, Y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.fillRect(X, Y + h - 12, w, 12);
  ctx.fillStyle = 'rgba(0,0,0,.1)';
  ctx.fillRect(X + w - 8, Y, 8, h);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.fillRect(X, Y, 3, h);
  // roof
  if (b.style === 'gable') {
    const rh = 74,
      ov = 14;
    ctx.fillStyle = b.roof;
    ctx.beginPath();
    ctx.moveTo(X - ov, Y + 4);
    ctx.lineTo(X + w * 0.14, Y - rh);
    ctx.lineTo(X + w * 0.86, Y - rh);
    ctx.lineTo(X + w + ov, Y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) {
      const yy = Y + 4 - (i * (rh + 4)) / 5;
      ctx.beginPath();
      ctx.moveTo(X - ov + (X + w * 0.14 - (X - ov)) * (i / 5) * 0.98, yy);
      ctx.lineTo(X + w + ov - (X + w + ov - (X + w * 0.86)) * (i / 5) * 0.98, yy);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath();
    ctx.moveTo(X - ov, Y + 4);
    ctx.lineTo(X + w * 0.14, Y - rh);
    ctx.lineTo(X + w * 0.5, Y - rh);
    ctx.lineTo(X + w * 0.5, Y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shade(b.roof, -0.35);
    rrect(X - ov, Y - 2, w + ov * 2, 9, 3);
    ctx.fill();
    // dormer window / chimney
    ctx.fillStyle = shade(b.wall, -0.15);
    ctx.fillRect(X + w * 0.78, Y - rh - 18, 16, 30);
    ctx.fillStyle = shade(b.wall, -0.4);
    ctx.fillRect(X + w * 0.78 - 2, Y - rh - 22, 20, 6);
    if (b.id === 'guild') {
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(dx - 1.5, Y - rh - 46, 3, 40);
      ctx.fillStyle = ac;
      ctx.beginPath();
      ctx.moveTo(dx + 1.5, Y - rh - 46);
      ctx.lineTo(dx + 34 + Math.sin(time * 4) * 3, Y - rh - 38);
      ctx.lineTo(dx + 1.5, Y - rh - 28);
      ctx.fill();
    }
  } else {
    const rh = 58;
    // flat roof seen from above: lit top face + parapet lip
    ctx.fillStyle = vgrad(Y - rh, Y - rh, rh, shade(b.roof, 0.2), b.roof);
    rrect(X - 8, Y - rh, w + 16, rh + 4, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 2;
    rrect(X - 2, Y - rh + 8, w + 4, rh - 18, 3);
    ctx.stroke();
    if (seed % 2 === 0) {
      // solar panels
      ctx.fillStyle = '#2b3f66';
      for (let i = 0; i < Math.min(4, Math.floor(w / 60)); i++) {
        rrect(X + 14 + i * 50, Y - rh + 14, 42, 26, 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(160,200,255,.45)';
      ctx.lineWidth = 1;
      for (let i = 0; i < Math.min(4, Math.floor(w / 60)); i++) {
        ctx.beginPath();
        ctx.moveTo(X + 14 + i * 50 + 21, Y - rh + 14);
        ctx.lineTo(X + 14 + i * 50 + 21, Y - rh + 40);
        ctx.moveTo(X + 14 + i * 50, Y - rh + 27);
        ctx.lineTo(X + 14 + i * 50 + 42, Y - rh + 27);
        ctx.stroke();
      }
    } else {
      // skylight + vents
      ctx.fillStyle = 'rgba(190,230,255,.8)';
      rrect(X + w - 74, Y - rh + 14, 56, 28, 3);
      ctx.fill();
      ctx.fillStyle = shade(b.roof, -0.3);
      ctx.fillRect(X + 18, Y - rh + 18, 18, 18);
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.fillRect(X + 18, Y - rh + 18, 18, 4);
    }
    ctx.fillStyle = shade(b.roof, -0.4);
    rrect(X - 8, Y - 4, w + 16, 10, 3);
    ctx.fill();
    ctx.fillStyle = ac;
    ctx.fillRect(X - 8, Y + 4, w + 16, 3);
    if (b.id === 'warp') {
      const g = ctx.createRadialGradient(dx, Y - rh + 24, 2, dx, Y - rh + 24, 50);
      g.addColorStop(0, 'rgba(120,220,255,.9)');
      g.addColorStop(1, 'rgba(120,220,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx - 52, Y - rh - 26, 104, 100);
      ctx.strokeStyle = '#d9f6ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(dx, Y - rh + 24, 22 + Math.sin(time * 3) * 2, 12, 0, 0, 6.28);
      ctx.stroke();
    }
  }
  // sign band
  const sy = Y + 16,
    sh = 28;
  ctx.font = '800 13px "Nunito Sans",sans-serif';
  const tw = Math.min(w - 34, ctx.measureText(b.n).width),
    sw = tw + 46;
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  rrect(dx - sw / 2 + 2, sy + 3, sw, sh, sh / 2);
  ctx.fill();
  ctx.fillStyle = '#20262f';
  rrect(dx - sw / 2, sy, sw, sh, sh / 2);
  ctx.fill();
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(dx - sw / 2 + 15, sy + sh / 2, 11, 0, 6.28);
  ctx.fill();
  glyph(b.icon, dx - sw / 2 + 15, sy + sh / 2, 12, '#1b1f27');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.n, dx + 12, sy + sh / 2 + 1, tw);
  ctx.textBaseline = 'alphabetic';
  // windows (left and right of the door)
  const gw = 30,
    gh = 40,
    wy = Y + 58,
    slots = Math.max(1, Math.floor((w - 100) / 2 / 46));
  for (const side of [-1, 1])
    for (let i = 0; i < slots; i++) {
      const wx = dx + side * (56 + i * 46) - gw / 2;
      if (wx < X + 6 || wx + gw > X + w - 6) continue;
      ctx.fillStyle = shade(b.wall, -0.4);
      rrect(wx - 3, wy - 3, gw + 6, gh + 6, 5);
      ctx.fill();
      ctx.fillStyle = vgrad(wy, wy, gh, '#cdeeff', '#6aa7d8');
      rrect(wx, wy, gw, gh, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.beginPath();
      ctx.moveTo(wx + 4, wy + gh - 2);
      ctx.lineTo(wx + 14, wy + 2);
      ctx.lineTo(wx + 20, wy + 2);
      ctx.lineTo(wx + 10, wy + gh - 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(wx + gw / 2 - 1, wy, 2, gh);
      ctx.fillStyle = ac;
      ctx.fillRect(wx - 4, wy + gh + 3, gw + 8, 4);
    }
  // door with soft glow (the door is the portal)
  const near = Math.hypot(P.x - o.x - w / 2, P.y - (o.y + h + 10)) < 120,
    pulse = 0.5 + Math.sin(time * 3 + b.x) * 0.15 + (near ? 0.25 : 0),
    dw = 44,
    dh = 66,
    dy = Y + h - dh;
  const glow = ctx.createRadialGradient(dx, Y + h, 4, dx, Y + h - 20, 70);
  glow.addColorStop(0, ac + 'cc');
  glow.addColorStop(1, ac + '00');
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = glow;
  ctx.fillRect(dx - 80, Y + h - 90, 160, 110);
  ctx.restore();
  ctx.fillStyle = shade(b.wall, -0.5);
  rrect(dx - dw / 2 - 5, dy - 5, dw + 10, dh + 5, [10, 10, 0, 0]);
  ctx.fill();
  ctx.fillStyle = vgrad(dy, dy, dh, shade(ac, 0.5), shade(ac, -0.15));
  rrect(dx - dw / 2, dy, dw, dh, [8, 8, 0, 0]);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath();
  ctx.moveTo(dx - dw / 2 + 5, dy + dh);
  ctx.lineTo(dx - dw / 2 + 5, dy + 16);
  ctx.lineTo(dx - dw / 2 + 18, dy + 5);
  ctx.lineTo(dx - dw / 2 + 24, dy + 5);
  ctx.lineTo(dx - dw / 2 + 11, dy + dh);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fillRect(dx - 1, dy, 2, dh);
  // striped awning over the door
  const ay = dy - 14;
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 ? '#fff' : ac;
    ctx.beginPath();
    const x0 = dx - 38 + i * (76 / 7),
      x1 = x0 + 76 / 7;
    ctx.moveTo(x0 + (i - 3) * 0.6, ay + 22);
    ctx.lineTo(x0, ay);
    ctx.lineTo(x1, ay);
    ctx.lineTo(x1 + (i - 2) * 0.6, ay + 22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(dx - 38, ay + 22, 76, 3);
}

/* ---------------- small props ---------------- */
function drawLamp(x, y) {
  shadow(x + 3, y + 2, 9, 3.5, 0.25);
  const g = ctx.createRadialGradient(x, y - 58, 2, x, y - 58, 52 + Math.sin(time * 2 + x) * 3);
  g.addColorStop(0, 'rgba(255,225,150,.5)');
  g.addColorStop(1, 'rgba(255,225,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 60, y - 112, 120, 120);
  ctx.fillStyle = '#2c313a';
  ctx.fillRect(x - 5, y - 2, 10, 4);
  ctx.fillRect(x - 2, y - 56, 4, 56);
  rrect(x - 7, y - 70, 14, 16, [7, 7, 3, 3]);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  rrect(x - 4.5, y - 67, 9, 11, 4);
  ctx.fill();
}
function drawBench(x, y, fl) {
  shadow(x, y + 5, 26, 7, 0.22);
  ctx.fillStyle = '#5b4a3a';
  ctx.fillRect(x - 22, y - 2, 4, 9);
  ctx.fillRect(x + 18, y - 2, 4, 9);
  ctx.fillStyle = '#a77a4c';
  rrect(x - 24, y - 7, 48, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#8f6540';
  rrect(x - 24, y - 20, 48, 8, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ctx.fillRect(x - 22, y - 7, 44, 2);
}
const PLANTER_COL = [['#ff7aa8', '#ffd96a'], ['#ffffff', '#ff9a5a'], ['#b07aff', '#ffe46a']];
function drawPlanter(x, y, c) {
  const f = PLANTER_COL[c % 3];
  shadow(x, y + 4, 15, 5, 0.2);
  ctx.fillStyle = '#3d4552';
  rrect(x - 12, y - 8, 24, 14, 3);
  ctx.fill();
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
  shadow(x, y + 16, 74, 28, 0.25);
  ctx.fillStyle = '#9ea4ad';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 66, 44, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#eceff3';
  ctx.beginPath();
  ctx.ellipse(x, y, 64, 42, 0, 0, 6.28);
  ctx.fill();
  const wg = ctx.createRadialGradient(x, y - 2, 4, x, y - 2, 52);
  wg.addColorStop(0, '#9be3ff');
  wg.addColorStop(1, '#3ea8dc');
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
  ctx.fillStyle = '#c9ced6';
  ctx.fillRect(x - 6, y - 36, 12, 34);
  ctx.fillStyle = '#eceff3';
  ctx.beginPath();
  ctx.ellipse(x, y - 38, 26, 14, 0, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = '#6fc6ee';
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
  ctx.fillStyle = '#8a6a45';
  if (horiz) {
    ctx.fillRect(x, y + 2, o.w, 3);
    ctx.fillRect(x, y + 9, o.w, 3);
    for (let i = 0; i <= o.w; i += 40) ctx.fillRect(x + Math.min(i, o.w - 5), y - 8, 5, 24);
  } else {
    ctx.fillRect(x + 2, y, 3, o.h);
    for (let i = 0; i <= o.h; i += 40) {
      ctx.fillRect(x, y + Math.min(i, o.h - 5) - 4, 8, 14);
    }
  }
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
    case 'invis':
      return true;
    case 'furn':
      if (o.w) drawFurnRect(o, x, y);
      else drawFurnCircle(o, x, y);
      return true;
  }
  return false;
}
