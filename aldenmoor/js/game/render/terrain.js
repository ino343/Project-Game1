/**
 * Rendering: ground, themes and static obstacles.
 */
/* ---------------- drawing ---------------- */
const THEMES = {
  grass: { a: '#5fae4a', b: '#559f43', tuft: '#3f8a37', fl: ['#f4e86a', '#fff', '#f08ab0'] },
  town: { a: '#68b04f', b: '#5ea146', tuft: '#43853c', fl: ['#fff3a0', '#fff', '#ff9ac0'] },
  forest: { a: '#3f7f45', b: '#38723e', tuft: '#2a5e33', fl: ['#c9a24a', '#d9d0a0', '#8a5a3a'] },
  ruins: { a: '#7b7468', b: '#70695e', tuft: '#5a554c', fl: ['#9a9488', '#5a554c', '#b0aa9c'] },
  swamp: { a: '#4a5a3c', b: '#415034', tuft: '#2f3d28', fl: ['#9acd32', '#c8d84a', '#7a4a7a'] },
  desert: { a: '#d8bd7a', b: '#cfb26c', tuft: '#a8864a', fl: ['#e8d49a', '#b08a4a', '#f2e6c0'] },
  frozen: { a: '#dbe8f2', b: '#cfdfec', tuft: '#a8c0d4', fl: ['#ffffff', '#bfe4ff', '#9ac8ea'] },
  volcano: { a: '#4a3836', b: '#40302e', tuft: '#2a1f1e', fl: ['#ff7a2a', '#c8401a', '#6a4a40'] },
  abyss: { a: '#2c2440', b: '#271f3a', tuft: '#1c1630', fl: ['#a05aff', '#5a3a9a', '#d08aff'] },
  interior: { a: '#3b3029', b: '#3b3029', tuft: '#2a211c', fl: ['#fff', '#fff', '#fff'] },
};
// leafy trees per theme, rock colour per theme, and themes whose ground decor is pebbles instead of grass
const TREE_COL = {
  grass: ['#3f9a3f', '#4aaa48', '#358a37'],
  forest: ['#2c6a3a', '#357a43', '#2a5e33'],
  swamp: ['#4a5e2a', '#566e32', '#3c4e22'],
  frozen: ['#e8f2fa', '#f6fbff', '#c8dcec'],
};
const ROCK_COL = {
  ruins: '#8d8678',
  desert: '#b89a68',
  frozen: '#b8c8d8',
  volcano: '#4a3a38',
  swamp: '#6a7058',
  abyss: '#4a4060',
};
const CRYSTAL_COL = { frozen: '#9fdcff', volcano: '#ff7a2a', abyss: '#b06aff' };
const PEBBLE_THEMES = ['ruins', 'desert', 'frozen', 'volcano', 'abyss'];
function drawGround() {
  if (M.interior) return drawInteriorGround();
  const th = THEMES[M.theme];
  ctx.fillStyle = th.a;
  ctx.fillRect(0, 0, VWw, VHw);
  // soft patches
  const R = mulberry(M.seed * 7);
  for (let i = 0; i < (M.w * M.h) / 90000; i++) {
    const x = R() * M.w,
      y = R() * M.h,
      r = 80 + R() * 160,
      sx = x - cam.x,
      sy = y - cam.y;
    if (sx < -r || sy < -r || sx > VWw + r || sy > VHw + r) continue;
    ctx.fillStyle = th.b;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.6, 0, 0, 6.28);
    ctx.fill();
  }
  if (M.id === 'village') drawVillageGround();
  for (const d of M.decor) {
    const x = d.x - cam.x,
      y = d.y - cam.y;
    if (x < -20 || y < -20 || x > VWw + 20 || y > VHw + 20) continue;
    if (PEBBLE_THEMES.includes(M.theme)) {
      ctx.fillStyle = th.fl[d.k % 3];
      if (d.k < 3) {
        ctx.fillRect(x, y, 6 * d.s, 3 * d.s);
      } else {
        ctx.strokeStyle = th.tuft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10 * d.s, y + 4);
        ctx.lineTo(x + 16 * d.s, y + 2);
        ctx.stroke();
      }
    } else if (d.k < 4) {
      ctx.strokeStyle = th.tuft;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x - 5, y - 7 * d.s);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 9 * d.s);
      ctx.moveTo(x + 4, y);
      ctx.lineTo(x + 5, y - 6 * d.s);
      ctx.stroke();
    } else {
      ctx.fillStyle = th.fl[d.k % 3];
      ctx.beginPath();
      ctx.arc(x, y, 2.4 * d.s, 0, 6.28);
      ctx.fill();
    }
  }
}
function shadow(x, y, rx, ry = rx * 0.4, a = 0.28) {
  ctx.fillStyle = 'rgba(0,0,0,' + a + ')';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 6.28);
  ctx.fill();
}
function drawObs(o, x, y) {
  if (drawObsMod(o, x, y)) return;
  if (o.type === 'tree') {
    const s = o.s || 1;
    shadow(x, y + 2, 18 * s);
    ctx.fillStyle = '#6b4a2a';
    ctx.fillRect(x - 5 * s, y - 26 * s, 10 * s, 28 * s);
    const c = TREE_COL[M.theme] || TREE_COL.grass;
    for (const [ox, oy, r, ci] of [
      [-14, -34, 22, 0],
      [14, -36, 22, 0],
      [0, -52, 26, 1],
      [-6, -40, 22, 2],
      [10, -28, 16, 2],
    ]) {
      ctx.fillStyle = c[ci];
      ctx.beginPath();
      ctx.arc(x + ox * s, y + oy * s, r * s, 0, 6.28);
      ctx.fill();
    }
  } else if (o.type === 'deadtree') {
    shadow(x, y + 2, 14);
    ctx.strokeStyle = '#4a3f35';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x, y - 40);
    ctx.moveTo(x, y - 26);
    ctx.lineTo(x - 18, y - 46);
    ctx.moveTo(x, y - 34);
    ctx.lineTo(x + 16, y - 54);
    ctx.stroke();
  } else if (o.type === 'rock') {
    shadow(x, y + 4, 16);
    ctx.fillStyle = ROCK_COL[M.theme] || '#8a8f94';
    ctx.beginPath();
    ctx.ellipse(x, y - 6, 15, 12, 0, 0, 6.28);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.ellipse(x - 4, y - 10, 7, 4, -0.4, 0, 6.28);
    ctx.fill();
  } else if (o.type === 'cactus') {
    const s = o.s || 1;
    shadow(x, y + 2, 14 * s);
    ctx.fillStyle = '#4f9a4a';
    ctx.strokeStyle = '#3c7a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 6 * s, y - 44 * s, 12 * s, 46 * s, 6 * s);
    ctx.roundRect(x - 20 * s, y - 32 * s, 10 * s, 6 * s, 3 * s);
    ctx.roundRect(x - 20 * s, y - 40 * s, 6 * s, 14 * s, 3 * s);
    ctx.roundRect(x + 10 * s, y - 26 * s, 10 * s, 6 * s, 3 * s);
    ctx.roundRect(x + 14 * s, y - 36 * s, 6 * s, 16 * s, 3 * s);
    ctx.fill();
    ctx.stroke();
  } else if (o.type === 'crystal') {
    const s = o.s || 1,
      c = CRYSTAL_COL[M.theme] || '#9fdcff';
    shadow(x, y + 2, 14 * s);
    ctx.save();
    ctx.shadowColor = c;
    ctx.shadowBlur = 10;
    ctx.fillStyle = c;
    for (const [ox, h, w] of [
      [-9, 26, 7],
      [0, 42, 9],
      [10, 20, 6],
    ]) {
      ctx.beginPath();
      ctx.moveTo(x + (ox - w) * s, y);
      ctx.lineTo(x + ox * s, y - h * s);
      ctx.lineTo(x + (ox + w) * s, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath();
    ctx.moveTo(x - 2 * s, y - 4 * s);
    ctx.lineTo(x, y - 40 * s);
    ctx.lineTo(x + 2 * s, y - 4 * s);
    ctx.closePath();
    ctx.fill();
  } else if (o.type === 'pillar') {
    const h = o.tall + 30;
    shadow(x + 14, y + 30, 22);
    ctx.fillStyle = '#9a9384';
    ctx.fillRect(x, y + 28 - h, 28, h);
    ctx.fillStyle = '#b5ae9e';
    ctx.fillRect(x - 3, y + 28 - h, 34, 6);
    ctx.fillRect(x - 3, y + 22, 34, 8);
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    ctx.fillRect(x + 18, y + 28 - h, 10, h);
  } else if (o.type === 'fountain') {
    shadow(x, y + 12, 62, 24);
    ctx.fillStyle = '#9aa4ac';
    ctx.beginPath();
    ctx.ellipse(x, y, 56, 38, 0, 0, 6.28);
    ctx.fill();
    ctx.fillStyle = '#4fa9d8';
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 46, 30, 0, 0, 6.28);
    ctx.fill();
    ctx.fillStyle = '#b8c0c6';
    ctx.fillRect(x - 7, y - 34, 14, 32);
    ctx.fillStyle = 'rgba(200,240,255,.8)';
    for (let i = 0; i < 6; i++) {
      const t = time * 3 + i;
      ctx.beginPath();
      ctx.arc(x + Math.sin(t) * 14, y - 34 - ((t * 13) % 22), 2.5, 0, 6.28);
      ctx.fill();
    }
  } else if (o.type === 'house') {
    const X = o.x - cam.x,
      Y = o.y - cam.y;
    shadow(X + o.w / 2, Y + o.h, o.w * 0.6, 12);
    ctx.fillStyle = o.wall;
    ctx.fillRect(X, Y, o.w, o.h);
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.fillRect(X, Y + o.h - 10, o.w, 10);
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(X + o.w / 2 - 14, Y + o.h - 44, 28, 44);
    ctx.fillStyle = '#8ac4e8';
    ctx.fillRect(X + 14, Y + 22, 26, 26);
    ctx.fillRect(X + o.w - 40, Y + 22, 26, 26);
    ctx.fillStyle = o.roof;
    ctx.beginPath();
    ctx.moveTo(X - 14, Y + 6);
    ctx.lineTo(X + o.w / 2, Y - 62);
    ctx.lineTo(X + o.w + 14, Y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.beginPath();
    ctx.moveTo(X + o.w / 2, Y - 62);
    ctx.lineTo(X + o.w + 14, Y + 6);
    ctx.lineTo(X + o.w / 2, Y + 6);
    ctx.closePath();
    ctx.fill();
  }
}
