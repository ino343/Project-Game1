/**
 * Equipment looks and the pet companion: summon / dismiss, follow, and drawing (pets give stats only, they never attack).
 */
// Convert equipped item ids to the plain "gear look" objects drawAvatar understands.
function gearLook(equip) {
  if (!equip) return null;
  const w = ITEMS[equip.weapon],
    h = ITEMS[equip.head];
  if (!w && !h) return null;
  return {
    weapon: w ? { id: w.id, col: w.col, tier: w.tier } : null,
    armor: null, // armor and necklace still give their stats but are never drawn on the character
    head: h ? { id: h.id, col: h.col, tier: h.tier, kind: h.kind } : null,
  };
}
// Costumes (cosmetic gear) worn in the cosmetic slots -> the looks drawAvatar understands (o.cos).
function cosLook(equip) {
  if (!equip) return null;
  const h = ITEMS[equip.chead],
    b = ITEMS[equip.cbody],
    k = ITEMS[equip.cback];
  if (!h && !b && !k) return null;
  return { head: h ? h.cos : null, body: b ? b.cos : null, back: k ? k.cos : null };
}
/* ---------------- pet state ---------------- */
function petSummon(id, quiet) {
  if (!PETS[id] || !P.pets[id]) return;
  P.pet = id;
  P.petS = { x: P.x - 30, y: P.y + 10, dir: 1, cd: 1, lunge: 0, lx: 0, ly: 0, moving: 0, walk: 0 };
  calcStats();
  P.hp = Math.min(P.hp, P.st.max);
  if (!quiet) {
    sfxSummon();
    fx.push({ k: 'ring', x: P.x, y: P.y, r: 46, t: 0, dur: 0.5, col: PETS[id].col, fill: 1 });
    log(PETS[id].n + ' is following you now.', '#ffd27a');
  }
}
function petDismiss() {
  if (!P.pet) return;
  log(PETS[P.pet].n + ' went back to rest.', '#cfd8de');
  P.pet = null;
  P.petS = null;
  calcStats();
  P.hp = Math.min(P.hp, P.st.max);
}
function updatePet(dt) {
  if (!P.pet || !P.petS) return;
  const s = P.petS,
    pet = PETS[P.pet],
    f = P.face || 0,
    tx = P.x - Math.cos(f) * 34 - Math.sin(f) * 16,
    ty = P.y - Math.sin(f) * 18 + Math.cos(f) * 10 + 6,
    dx = tx - s.x,
    dy = ty - s.y,
    d = Math.hypot(dx, dy);
  if (d > 420) {
    s.x = tx;
    s.y = ty;
  } else if (d > 6) {
    const mv = Math.min(d, Math.max(P.st.spd * 1.2, 150) * dt * (d > 40 ? 1 : 0.6));
    s.x += (dx / d) * mv;
    s.y += (dy / d) * mv;
    s.moving = 1;
    s.walk += dt * 11;
    if (Math.abs(dx) > 3) s.dir = dx > 0 ? 1 : -1;
  } else s.moving = 0;
  s.lunge = 0; // pets are companions only: they never attack, they just give their stat perk
}
/* ---------------- drawing ---------------- */
function drawPet() {
  const s = P.petS,
    pet = PETS[P.pet],
    g = ctx,
    sx = s.x - cam.x,
    sy = s.y - cam.y,
    lg = s.lunge > 0 ? Math.sin((s.lunge / 0.25) * Math.PI) * 9 : 0,
    bob = s.moving ? -Math.abs(Math.sin(s.walk)) * 3 : Math.sin(time * 2.2) * 0.8;
  g.fillStyle = 'rgba(0,0,0,.28)';
  g.beginPath();
  g.ellipse(sx, sy + 2, 9, 3.4, 0, 0, 6.28);
  g.fill();
  g.save();
  g.translate(sx + s.lx * lg, sy + s.ly * lg * 0.5 + bob);
  g.scale(s.dir, 1);
  const c = pet.col,
    c2 = pet.col2,
    dk = avatarShade(c, -0.35),
    eye = (x, y, r) => {
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(x, y, r, 0, 6.28);
      g.fill();
      g.fillStyle = '#111';
      g.beginPath();
      g.arc(x + r * 0.3, y, r * 0.55, 0, 6.28);
      g.fill();
    },
    tri = (a, b, cc, d, e, f2, col) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(a, b);
      g.lineTo(cc, d);
      g.lineTo(e, f2);
      g.fill();
    },
    el = (x, y, rx, ry, col) => {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, 6.28);
      g.fill();
    },
    legs = (xs, col) => {
      const st = s.moving ? Math.sin(s.walk) : 0;
      xs.forEach((x, i) => {
        g.fillStyle = col;
        g.fillRect(x + (i % 2 ? -st : st) * 1.6, -3, 3, 3);
      });
    };
  switch (pet.shape) {
    case 'slime':
      el(0, -5, 9.5 - bob * 0.2, 7 + bob * 0.3, c);
      el(-2.5, -8.5, 3, 1.8, 'rgba(255,255,255,.55)');
      eye(-3, -6, 1.8);
      eye(3, -6, 1.8);
      break;
    case 'wolf':
      legs([-7, -3, 3, 7], dk);
      el(-1, -8, 10, 5.5, c);
      el(2, -6.5, 6, 3, c2);
      tri(-9, -10, -15, -15, -8, -6, dk); // tail
      el(9, -11, 5.5, 5, c);
      el(12.5, -9.5, 3, 2.2, c2);
      tri(6, -15, 8, -21, 10, -15, dk);
      tri(9, -15, 12, -20, 13, -14, dk);
      eye(9.5, -12, 1.2);
      g.fillStyle = '#111';
      g.fillRect(14, -11, 1.8, 1.6);
      break;
    case 'cat':
      legs([-6, -3, 3, 6], dk);
      el(-1, -7.5, 8.5, 5, c);
      g.strokeStyle = dk;
      g.lineWidth = 1.4;
      for (const x of [-4, -1, 2]) {
        g.beginPath();
        g.moveTo(x, -12);
        g.lineTo(x + 1, -8);
        g.stroke();
      }
      g.strokeStyle = c;
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(-8, -8);
      g.quadraticCurveTo(-15, -10, -12, -18);
      g.stroke();
      el(8, -11, 5, 4.6, c);
      el(10.5, -9.5, 2.6, 1.8, c2);
      tri(5, -14, 6, -20, 9, -15, c);
      tri(9, -15, 11, -20, 12, -14, c);
      eye(8.5, -12, 1.2);
      break;
    case 'owl':
      el(0, -12 - Math.sin(time * 3) * 0.6, 7, 9, c);
      el(0, -9.5, 4.5, 6, c2);
      tri(-7, -14, -13, -9, -5, -7, dk); // wings
      tri(7, -14, 13, -9, 5, -7, dk);
      tri(-6, -19, -7, -24, -3, -20, dk);
      tri(6, -19, 7, -24, 3, -20, dk);
      el(-3, -15.5, 3.2, 3.2, '#fff');
      el(3, -15.5, 3.2, 3.2, '#fff');
      eye(-3, -15.5, 2);
      eye(3, -15.5, 2);
      tri(-1.3, -13, 1.3, -13, 0, -10.5, '#f2b84b');
      break;
    case 'bear':
      legs([-6, -2, 3, 7], dk);
      el(-1, -8.5, 9.5, 6.5, c);
      el(8, -12, 6, 5.5, c);
      el(7, -17, 2.4, 2.4, c);
      el(12, -16.5, 2.4, 2.4, c);
      el(11, -10, 3.2, 2.4, c2);
      eye(8.5, -13, 1.2);
      g.fillStyle = '#111';
      g.fillRect(12, -11.5, 2, 1.6);
      break;
    case 'dragon':
      legs([-5, -1, 3, 6], dk);
      tri(-9, -8, -17, -6, -9, -13, dk); // tail
      el(-1, -8.5, 9, 5.5, c);
      el(0, -6.5, 6, 3, c2);
      tri(-4, -12, -12, -22 - Math.sin(time * 8) * 2, 1, -13, dk); // wing
      el(9, -12, 5.2, 4.6, c);
      el(12.5, -10.5, 3, 2.2, c);
      tri(7, -15.5, 6, -21, 10, -16, c2); // horns
      tri(10, -16, 11, -21, 13, -15, c2);
      eye(9.5, -12.5, 1.3);
      if (Math.sin(time * 3) > 0.7) {
        g.fillStyle = '#ffb04a';
        g.beginPath();
        g.arc(17, -10, 2 + Math.sin(time * 20), 0, 6.28);
        g.fill();
      }
      break;
  }
  g.restore();
}
