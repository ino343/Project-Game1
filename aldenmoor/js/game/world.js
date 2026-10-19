/**
 * World: map building, collisions and map transitions.
 */
const MAPS = {};
function buildMap(id) {
  const D = MAPDEF[id],
    R = mulberry(D.seed),
    M = { id, ...D, obs: [], decor: [], mobs: [], npcs: [], paths: [], portals: D.portals.slice() };
  const nearPortal = (x, y, d) => M.portals.some((p) => Math.hypot(p.x - x, p.y - y) < d);
  M.npcs = NPCS.filter((n) => n.map === id).map((n) => ({ ...n }));
  if (D.interior) return buildInterior(M, D);
  if (id === 'village') buildVillage(M, D);
  const keep = [
    ...M.npcs.map((n) => [n.x, n.y, 70]),
    ...M.portals.map((p) => [p.x, p.y, 160]),
    ...M.mobs.map((m) => [m.x, m.y, 40]),
    [M.spawn ? M.spawn.x : 0, M.spawn ? M.spawn.y : 0, 120],
  ];
  if (id === 'village') {
    villageTrees(M, keep);
  } else {
    const T = D.trees,
      theme = D.theme;
    for (let i = 0; i < T; i++) {
      const x = rnd(40, M.w - 40),
        y = rnd(40, M.h - 40);
      if (nearPortal(x, y, 210)) continue;
      M.obs.push(themeProp(theme, x, y));
    }
    // border props (not on the ruins)
    if (theme !== 'ruins')
      for (let i = 0; i < M.w / 60; i++)
        for (const by of [16, M.h - 16]) {
          const x = i * 60 + rnd(10, 50);
          if (!nearPortal(x, by, 160)) {
            const o = themeProp(theme, x, by + rnd(-6, 6), true);
            M.obs.push(o);
          }
        }
  }
  // decor
  const n = Math.floor((M.w * M.h) / 5200);
  for (let i = 0; i < n; i++) {
    const d = { x: rnd(M.w), y: rnd(M.h), k: ri(0, 5), s: rnd(0.7, 1.3) };
    // in the village keep the grass tufts off roads, plaza, yard and buildings
    if (id === 'village') {
      const PZ = VILLAGE_PLAZA;
      if (
        M.paths.some((p) => segDist(d.x, d.y, p[0], p[1]) < 40) ||
        Math.hypot((d.x - PZ.x) / (PZ.rx + 10), (d.y - PZ.y) / (PZ.ry + 10)) < 1 ||
        rectNear(d.x, d.y, M.yard, 6) ||
        M.obs.some((o) => o.type === 'building' && rectNear(d.x, d.y, o, 8))
      )
        continue;
    }
    M.decor.push(d);
  }
  // spawns  ([type, count, f0, f1, fixedPos, 'y'] — 'y' makes f0..f1 a vertical band instead of horizontal)
  for (const sp of D.spawns || []) {
    const [t, cnt, f0, f1, pos, axis] = sp;
    for (let i = 0; i < cnt; i++) {
      let x,
        y,
        tries = 0;
      if (pos) {
        x = pos.x;
        y = pos.y;
      } else
        do {
          if (axis === 'y') {
            x = rnd(100, M.w - 100);
            y = rnd(M.h * f0, M.h * f1);
          } else {
            x = rnd(M.w * f0, M.w * f1);
            y = rnd(100, M.h - 100);
          }
          tries++;
        } while (tries < 60 && (nearPortal(x, y, 280) || blocked(M, x, y, 30)));
      M.mobs.push(newMob(MOBS[t], x, y));
    }
  }
  return M;
}
/** One scenery obstacle for a map theme. `border` forces a tall prop for the map edge. */
function themeProp(theme, x, y, border) {
  const k = Math.random();
  switch (theme) {
    case 'ruins':
      return k < 0.45
        ? { x: x - 14, y: y - 14, w: 28, h: 28, type: 'pillar', tall: ri(20, 60) }
        : k < 0.75
          ? { x, y, r: 11, type: 'rock' }
          : { x, y, r: 12, type: 'deadtree' };
    case 'swamp':
      if (border || k < 0.5) return { x, y, r: 12, type: 'tree', s: rnd(0.9, 1.3) };
      return k < 0.75 ? { x, y, r: 12, type: 'deadtree' } : { x, y, r: 11, type: 'rock' };
    case 'desert':
      if (border) return { x, y, r: 11, type: 'cactus', s: rnd(1.1, 1.5) };
      return k < 0.5 ? { x, y, r: 10, type: 'cactus', s: rnd(0.8, 1.3) } : k < 0.85 ? { x, y, r: 11, type: 'rock' } : { x, y, r: 12, type: 'deadtree' };
    case 'frozen':
      if (border || k < 0.45) return { x, y, r: 12, type: 'tree', s: rnd(0.9, 1.3) };
      return k < 0.75 ? { x, y, r: 11, type: 'crystal', s: rnd(0.8, 1.3) } : { x, y, r: 11, type: 'rock' };
    case 'volcano':
      if (border) return { x, y, r: 12, type: 'deadtree' };
      return k < 0.5 ? { x, y, r: 11, type: 'rock' } : k < 0.8 ? { x, y, r: 12, type: 'deadtree' } : { x, y, r: 10, type: 'crystal', s: rnd(0.7, 1.1) };
    case 'abyss':
      if (border) return { x, y, r: 11, type: 'crystal', s: rnd(1.2, 1.7) };
      return k < 0.5 ? { x, y, r: 11, type: 'crystal', s: rnd(0.8, 1.4) } : k < 0.8 ? { x: x - 14, y: y - 14, w: 28, h: 28, type: 'pillar', tall: ri(20, 60) } : { x, y, r: 12, type: 'deadtree' };
    default:
      if (border) return { x, y, r: 12, type: 'tree', s: 1.3 };
      return Math.random() < (theme === 'forest' ? 0.12 : 0.2)
        ? { x, y, r: 11, type: 'rock' }
        : { x, y, r: 12, type: 'tree', s: rnd(0.9, 1.35) };
  }
}
function segDist(px, py, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    l = dx * dx + dy * dy || 1;
  let t = clamp(((px - a[0]) * dx + (py - a[1]) * dy) / l, 0, 1);
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
}
function blocked(M, x, y, r) {
  return M.obs.some((o) =>
    o.w
      ? x > o.x - r && x < o.x + o.w + r && y > o.y - r && y < o.y + o.h + r
      : Math.hypot(o.x - x, o.y - y) < o.r + r,
  );
}
function newMob(T, x, y) {
  return {
    t: T,
    x,
    y,
    hx: x,
    hy: y,
    hp: T.hp,
    max: T.hp,
    r: T.r,
    agg: 0,
    ret: 0,
    atkCd: rnd(1),
    stun: 0,
    pois: null,
    wt: rnd(1, 3),
    tx: x,
    ty: y,
    dead: 0,
    resp: 0,
    ph: rnd(6.28),
    flash: 0,
    face: rnd(6.28),
    vx: 0,
    vy: 0,
  };
}
/* ---------------- collisions ---------------- */
function resolve(e, r) {
  for (const o of M.obs) {
    if (o.w) {
      const cx = clamp(e.x, o.x, o.x + o.w),
        cy = clamp(e.y, o.y, o.y + o.h),
        dx = e.x - cx,
        dy = e.y - cy,
        d = Math.hypot(dx, dy);
      if (d < r) {
        if (d > 0.001) {
          e.x += (dx / d) * (r - d);
          e.y += (dy / d) * (r - d);
        } else e.y = o.y - r;
      }
    } else {
      const dx = e.x - o.x,
        dy = e.y - o.y,
        d = Math.hypot(dx, dy),
        m = r + o.r;
      if (d < m && d > 0.001) {
        e.x += (dx / d) * (m - d);
        e.y += (dy / d) * (m - d);
      }
    }
  }
  e.x = clamp(e.x, r + 4, M.w - r - 4);
  e.y = clamp(e.y, r + 4, M.h - r - 4);
}
function pointBlocked(x, y) {
  return M.obs.some((o) =>
    o.w ? x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h : Math.hypot(o.x - x, o.y - y) < o.r,
  );
}
/* ---------------- map switching ---------------- */
function changeMap(id, x, y, after) {
  if (transition) return;
  transition = true;
  const f = $('#fade');
  f.style.opacity = 1;
  setTimeout(() => {
    if (!MAPS[id]) MAPS[id] = buildMap(id);
    M = MAPS[id];
    P.x = x;
    P.y = y;
    P.dest = null;
    P.target = null;
    P.auto = false;
    P.dash = null;
    P.sit = false;
    fx = [];
    projs = [];
    zones = [];
    floats = [];
    for (const m of M.mobs)
      if (!m.dead) {
        m.agg = 0;
        m.ret = 0;
      }
    cam.x = clamp(P.x - VWw / 2, 0, Math.max(0, M.w - VWw));
    cam.y = clamp(P.y - VHw / 2, 0, Math.max(0, M.h - VHw));
    $('#mapname').innerHTML = M.name + '<small>' + M.sub + '</small>';
    syncWarp();
    portalCd = 1.2;
    Mu.want = M.music || id;
    if (P.visited) P.visited[id] = 1;
    musicSync();
    if (after) after();
    save(true);
    f.style.opacity = 0;
    setTimeout(() => {
      transition = false;
    }, 250);
  }, 260);
}

/* ---------------- village + interiors ---------------- */
const rectNear = (x, y, o, d) => x > o.x - d && x < o.x + o.w + d && y > o.y - d && y < o.y + o.h + d;
function buildVillage(M, D) {
  const PZ = VILLAGE_PLAZA,
    roads = VILLAGE_MAIN_ROADS.map((r) => [r[0].slice(), r[1].slice()]);
  const rowRoad = (yb) => (yb < 500 ? 470 : yb < 800 ? 800 : 1200);
  for (const b of BUILDINGS) {
    const dx = b.x + b.w / 2,
      dy = b.y + b.h + 10,
      I = MAPDEF['in_' + b.id];
    M.obs.push({ x: b.x, y: b.y, w: b.w, h: b.h, type: 'building', b });
    M.portals.push({ x: dx, y: dy, to: 'in_' + b.id, tx: I.spawn.x, ty: I.spawn.y, door: 1, label: b.n, b });
    roads.push([[dx, dy], [dx, rowRoad(b.y + b.h)]]);
    // planters either side of the door
    for (const s of [-1, 1]) M.obs.push({ x: dx + s * 62, y: b.y + b.h + 10, r: 10, type: 'planter', c: ((b.x + s * 7) % 3 + 3) % 3 });
  }
  M.paths = roads;
  M.mainRoads = roads.slice(0, VILLAGE_MAIN_ROADS.length);
  M.obs.push({ x: PZ.x, y: PZ.y, r: 54, type: 'fountain' });
  // plaza lamps + benches
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    M.obs.push({ x: PZ.x + Math.cos(a) * (PZ.rx - 14), y: PZ.y + Math.sin(a) * (PZ.ry - 12), r: 6, type: 'lamp' });
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    M.obs.push({ x: PZ.x + Math.cos(a) * (PZ.rx * 0.74), y: PZ.y + Math.sin(a) * (PZ.ry * 0.74), r: 15, type: 'bench', fl: Math.cos(a) > 0 ? 1 : -1 });
  }
  // market, well, hay and clutter (all kept off the roads, plaza, yard and doors)
  const Yd = VILLAGE_YARD,
    free = (x, y, r) =>
      !M.paths.some((p) => segDist(x, y, p[0], p[1]) < 34 + r) &&
      Math.hypot((x - PZ.x) / (PZ.rx + 26 + r), (y - PZ.y) / (PZ.ry + 26 + r)) > 1 &&
      !rectNear(x, y, Yd, 24 + r) &&
      !M.obs.some((o) => (o.w ? rectNear(x, y, o, 18 + r) : Math.hypot(o.x - x, o.y - y) < o.r + r + 10)) &&
      !M.npcs.some((n) => Math.hypot(n.x - x, n.y - y) < 70 + r) &&
      !M.portals.some((p) => Math.hypot(p.x - x, p.y - y) < 90 + r);
  const put = (o, r) => {
    if (free(o.x + (o.w ? o.w / 2 : 0), o.y + (o.h ? o.h / 2 : 0), r)) M.obs.push(o);
  };
  [['fruit', '#c0392b'], ['bread', '#d99a3a'], ['pots', '#4a5ab8'], ['cloth', '#2f9d7f']].forEach(([goods, col], i) => put({ x: 1440 + i * 120, y: 885, w: 96, h: 32, type: 'stall', goods, col }, 30));
  put({ x: 200, y: 930, r: 22, type: 'well' }, 24);
  put({ x: 2040, y: 742, r: 8, type: 'signpost', boards: [{ t: 'Sunny Meadow', dir: 1 }, { t: 'Village', dir: -1 }] }, 8);
  for (const [x, y] of [[150, 1000], [182, 1018], [128, 1030], [1980, 940], [2012, 962], [1700, 640], [1740, 655]]) put({ x, y, r: 14, type: 'hay' }, 14);
  BUILDINGS.forEach((b, i) => {
    const by = b.y + b.h - 2;
    put(i % 2 ? { x: b.x - 42, y: by, r: 13, type: 'vbarrel' } : { x: b.x - 44, y: by, r: 14, type: 'vcrate', n: 2 }, 10);
    put(i % 3 ? { x: b.x + b.w + 44, y: by, r: 14, type: 'vcrate', n: 1 } : { x: b.x + b.w + 42, y: by, r: 13, type: 'vbarrel' }, 10);
  });
  // street lamps along the main roads
  const doors = M.portals.filter((p) => p.door).map((p) => [p.x, p.y]);
  for (let ri2 = 0; ri2 < M.mainRoads.length; ri2++) {
    const [a, b] = M.mainRoads[ri2],
      len = Math.hypot(b[0] - a[0], b[1] - a[1]),
      ux = (b[0] - a[0]) / len,
      uy = (b[1] - a[1]) / len;
    for (let d = 90, k = 0; d < len - 40; d += 200, k++) {
      const s = k % 2 ? 1 : -1,
        x = a[0] + ux * d - uy * 46 * s,
        y = a[1] + uy * d + ux * 46 * s;
      if (M.obs.some((o) => (o.w ? rectNear(x, y, o, 26) : Math.hypot(o.x - x, o.y - y) < o.r + 22))) continue;
      if (doors.some((q) => Math.hypot(q[0] - x, q[1] - y) < 70)) continue;
      if (Math.hypot((x - PZ.x) / (PZ.rx + 40), (y - PZ.y) / (PZ.ry + 40)) < 1) continue;
      if (roads.some((r, i) => i !== ri2 && segDist(x, y, r[0], r[1]) < 36)) continue;
      M.obs.push({ x, y, r: 6, type: 'lamp' });
    }
  }
  // training yard (fenced) with 3 dummies
  const Y = VILLAGE_YARD;
  M.yard = Y;
  M.obs.push({ x: Y.x, y: Y.y, w: Y.w, h: 8, type: 'fence' });
  M.obs.push({ x: Y.x + Y.w - 8, y: Y.y, w: 8, h: Y.h, type: 'fence' });
  M.obs.push({ x: Y.x, y: Y.y + Y.h - 8, w: Y.w, h: 8, type: 'fence' });
  M.obs.push({ x: Y.x, y: Y.y, w: 8, h: 160, type: 'fence' });
  M.obs.push({ x: Y.x, y: Y.y + 240, w: 8, h: 20, type: 'fence' });
  for (const x of [Y.x + 110, Y.x + 220, Y.x + 330]) M.mobs.push(newMob(MOBS.dummy, x, Y.y + 120));
}
function villageTrees(M, keep) {
  const PZ = VILLAGE_PLAZA,
    houses = M.obs.filter((o) => o.type === 'building' || o.type === 'stall'),
    Y = M.yard,
    okPlace = (x, y, d) =>
      !houses.some((h) => rectNear(x, y, h, d + 20)) &&
      !rectNear(x, y, Y, d) &&
      Math.hypot((x - PZ.x) / (PZ.rx + d), (y - PZ.y) / (PZ.ry + d)) > 1 &&
      !keep.some((k) => Math.hypot(k[0] - x, k[1] - y) < k[2] + 20) &&
      !M.paths.some((p) => segDist(x, y, p[0], p[1]) < 62 + d * 0.3) &&
      !M.obs.some((o) => !o.w && Math.hypot(o.x - x, o.y - y) < o.r + 22);
  // tree line around the village (gap at the east gate)
  const edge = [];
  for (let x = 40; x < M.w; x += 80) edge.push([x, 36], [x, M.h - 30]);
  for (let y = 120; y < M.h - 60; y += 80) edge.push([36, y], [M.w - 36, y]);
  for (const [x0, y0] of edge) {
    const x = x0 + rnd(-14, 14),
      y = y0 + rnd(-10, 10);
    if (Math.abs(y - 800) < 120 && x > M.w - 200) continue;
    M.obs.push({ x, y, r: 12, type: 'tree', s: rnd(1.1, 1.45) });
  }
  for (let i = 0; i < 160; i++) {
    const x = rnd(110, M.w - 110),
      y = rnd(110, M.h - 90);
    if (!okPlace(x, y, 40)) continue;
    M.obs.push({ x, y, r: 12, type: 'tree', s: rnd(0.9, 1.25) });
  }
}
function buildInterior(M, D) {
  const I = D.interior;
  M.spawn = { ...D.spawn };
  M.interior = I;
  const W = M.w,
    H = M.h;
  M.obs.push({ x: 0, y: 0, w: W, h: 118, type: 'invis' }, { x: 0, y: 0, w: 16, h: H, type: 'invis' }, { x: W - 16, y: 0, w: 16, h: H, type: 'invis' });
  for (const f of I.furn) M.obs.push({ ...f });
  return M;
}
