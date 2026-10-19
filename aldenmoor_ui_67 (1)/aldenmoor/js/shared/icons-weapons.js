/* Weapon icons: every weapon has its own blade / bow shape. Local space: hilt at y=0, blade towards -y. */

/* ================= WAIF / ASSASSIN : daggers & katars ================= */

// 1 Iron Dagger: plain kite-shaped iron blade, leather grip, round pommel
ITEM_ART.waif_weapon_1 = (g) => {
  g.save();
  iconPlace(g, 0.62, -26, 17, 50);
  iconBlade(g, [0, -26, 4.2, -17, 3.6, 0, -3.6, 0, -4.2, -17], '#9aa3ad');
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.fillRect(-0.5, -18, 1, 14);
  iconBar(g, 0, 13, 2.8, '#6b6f78');
  iconGrip(g, 2.8, 10, 4.4, '#5a3b22', '#33200f');
  iconBall(g, 0, 14.6, 2.7, '#8a8f98');
  g.restore();
};

// 2 Steel Stiletto: long needle blade, bell guard, ring pommel
ITEM_ART.waif_weapon_2 = (g) => {
  g.save();
  iconPlace(g, 0.6, -36, 17, 52);
  iconPoly(g, [0, -36, 2.7, -1.5, -2.7, -1.5], iconSteel(g, -2.7, 2.7, '#e4ebf2'), '#4a5560');
  iconLine(g, [0, -34, 0, -2], 'rgba(255,255,255,.7)', 0.7);
  iconPath(g, (p) => { p.moveTo(-7.5, 1.5); p.quadraticCurveTo(0, -6, 7.5, 1.5); p.quadraticCurveTo(0, 3.6, -7.5, 1.5); }, iconSteel(g, -7.5, 7.5, '#c9a24a'), '#5e4510');
  iconGrip(g, 2.6, 9, 3.2, '#1f3a2a', '#52a870');
  iconCircle(g, 0, 14.6, 2.5, null, '#c9a24a', 1.5);
  g.restore();
};

// 3 Venom Fang: curved bone fang dripping poison, fanged guard
ITEM_ART.waif_weapon_3 = (g) => {
  g.save();
  iconPlace(g, 0.55, -32, 17, 52);
  iconPath(g, (p) => { p.moveTo(-4.2, 0); p.bezierCurveTo(-5.5, -14, -1, -26, 7, -32); p.bezierCurveTo(5, -22, 5.2, -10, 4.2, 0); p.closePath(); }, iconSteel(g, -5, 6, '#e4efc8'), '#4d5a30');
  iconPath(g, (p) => { p.moveTo(-0.5, -3); p.bezierCurveTo(-1.5, -14, 0.5, -22, 5, -29); }, null, '#58e04a', 1.6);
  for (const [dx, dy, r] of [[8.4, -26, 1.5], [7.6, -19, 1.2], [6.2, -12, 1]]) {
    iconCircle(g, dx, dy, r, '#8aff5a');
    iconPoly(g, [dx, dy - r * 2, dx + r * 0.7, dy - r * 0.4, dx - r * 0.7, dy - r * 0.4], '#8aff5a');
  }
  iconPoly(g, [-9, 3.6, -4.5, -1.5, 0, 1, 4.5, -1.5, 9, 3.6, 5, 4.5, 0, 3, -5, 4.5], '#3b2a4a', '#58e04a', 0.9);
  iconGrip(g, 3, 10, 4, '#26331f', '#5fae5c');
  iconGem(g, 0, 15.6, 2.4, '#6bff6b');
  g.restore();
};

// 4 Shadow Kris: wavy blackened blade with an asymmetric guard
ITEM_ART.waif_weapon_4 = (g) => {
  g.save();
  iconPlace(g, 0.55, -36, 17, 52);
  const L = [],
    R = [];
  for (let y = 0; y >= -33; y -= 1.2) {
    const w = 5.6 * (1 - -y / 62) + 0.4,
      cx = Math.sin(-y * 0.7) * 2.6;
    L.push(cx - w, y);
    R.unshift(cx + w, y);
  }
  const tip = [Math.sin(34 * 0.7) * 2.8 * -1 * -1, -36];
  iconPoly(g, L.concat(tip, R), iconVert(g, -36, 0, '#8a7ab8', '#2c2844'), '#0c0a14', 1.1);
  iconPath(g, (p) => { p.moveTo(L[0] + 1.6, 0); for (let i = 0; i < L.length; i += 2) p.lineTo(L[i] + 2.6, L[i + 1]); }, null, 'rgba(230,215,255,.8)', 0.8);
  iconPoly(g, [-6, -0.5, 9.5, -1.8, 10.5, 3, 4, 4.2, -6, 3.5], '#2a2238', '#8b6ad8', 0.9);
  iconGrip(g, 3.6, 9, 4, '#1b1824', '#6d5aa8');
  iconGem(g, 0, 14.6, 2.4, '#b36bff');
  g.restore();
};

// 5 Moonlit Kukri: heavy forward-curved blade with a crescent moon
ITEM_ART.waif_weapon_5 = (g) => {
  g.save();
  iconPlace(g, 0.5, -29, 16, 52, 26, 28);
  iconPath(g, (p) => { p.moveTo(-3.8, 0); p.bezierCurveTo(-4.8, -14, 0, -25, 10, -29); p.bezierCurveTo(12.5, -20, 13, -8, 4.2, 0); p.closePath(); }, iconSteel(g, -4, 13, '#c4d4ea'), '#34465e');
  iconPath(g, (p) => { p.arc(5.5, -14, 4, 1.1, 5.2, false); p.arc(7.2, -14, 3.1, 5.0, 1.3, true); }, '#fff0a8');
  iconGem(g, 4, -6, 0.1, '#fff');
  iconBar(g, 0, 11, 2.6, '#b08a3a');
  iconGrip(g, 2.6, 10, 4.6, '#7a4a28', '#4a2a14');
  iconRect(g, -2.6, 12.2, 5.2, 2.6, '#b08a3a', 'rgba(0,0,0,.5)', 1);
  g.restore();
};

// 6 Void Reaper: scythe-hooked blade, void orb at the guard
ITEM_ART.waif_weapon_6 = (g) => {
  g.save();
  iconPlace(g, 0.42, -38, 19, 54, 25, 29);
  iconGlow(g, 0, 1, 11, '#8a3cff', 0.6);
  iconPath(g, (p) => { p.moveTo(-3, 0); p.lineTo(-3, -20); p.bezierCurveTo(-4, -33, 8, -41, 20, -31); p.bezierCurveTo(10, -33, 3.4, -29, 3, -18); p.lineTo(3, 0); p.closePath(); }, iconVert(g, -40, 0, '#6a3a5a', '#25202f'), '#12101a');
  iconPath(g, (p) => { p.moveTo(3.2, -18); p.bezierCurveTo(3.6, -29, 10, -33, 20, -31); }, null, '#ff6a7a', 1.1);
  iconGrip(g, 6, 12, 3.8, '#17141f', '#a03a5a');
  iconPoly(g, [0, 21, 2.6, 17.5, -2.6, 17.5], '#444055');
  iconBall(g, 0, 2, 4.6, '#18102a');
  iconCircle(g, 0, 2, 4.6, null, '#b36bff', 1.1);
  iconCircle(g, 0, 2, 1.5, '#e0b8ff');
  g.restore();
};

// katar: punch dagger (blade + H-shaped grip box); drawn upright at the origin
function iconKatar(g, metal, plate, trim) {
  iconBlade(g, [0, -25, 5.2, -5, -5.2, -5], metal);
  iconLine(g, [0, -22, 0, -6], 'rgba(0,0,0,.28)', 0.8);
  iconRect(g, -8, -5.4, 16, 3.2, plate, 'rgba(0,0,0,.6)', 1);
  iconRect(g, -8, -2.2, 2.6, 9, plate, 'rgba(0,0,0,.6)', 1);
  iconRect(g, 5.4, -2.2, 2.6, 9, plate, 'rgba(0,0,0,.6)', 1);
  iconRect(g, -6, 2, 12, 2.2, trim, 'rgba(0,0,0,.6)', 1);
  iconPoly(g, [0, -4.6, 1.2, -3.4, 0, -2.2, -1.2, -3.4], trim);
}
// 7 Nightfall Katars: a pair of punch daggers crossed over a night-sky glow
ITEM_ART.waif_weapon_7 = (g) => {
  iconGlow(g, 28, 26, 22, '#7a4aff', 0.35);
  for (const s of [-1, 1]) {
    g.save();
    g.translate(28 + s * 8.5, 43);
    g.rotate(s * 0.42);
    g.scale(1.22, 1.22);
    iconKatar(g, s < 0 ? '#aab0d6' : '#c8cdec', '#1d2040', '#e8c35a');
    iconStar(g, 0, -0.6, 1.5, 0.6, 4, '#ffe9a8');
    g.restore();
  }
  iconStar(g, 28, 8, 3, 1.2, 4, '#ffe9a8');
};

// 8 Eclipse Fangs: two curved fang blades crossing in front of an eclipse
ITEM_ART.waif_weapon_8 = (g, c) => {
  iconGlow(g, 28, 24, 20, '#ffd27a', 0.55);
  iconCircle(g, 28, 24, 11.5, null, '#ffe9b0', 2.4);
  iconCircle(g, 28, 24, 10.2, '#06080c');
  for (const s of [-1, 1]) {
    g.save();
    g.translate(28 - s * 10, 43);
    g.rotate(s * 0.72);
    g.scale(0.92, 0.92);
    g.scale(s, 1);
    iconPath(g, (p) => { p.moveTo(-3.4, 0); p.bezierCurveTo(-5, -13, -1, -25, 10, -31); p.bezierCurveTo(5.5, -21, 4.5, -10, 3.4, 0); p.closePath(); }, iconSteel(g, -4, 8, '#26364a'), '#0a1018');
    iconPath(g, (p) => { p.moveTo(3.2, -2); p.bezierCurveTo(4.5, -12, 5.5, -21, 10, -31); }, null, c, 1.2);
    iconBar(g, 0, 10, 2.4, '#b08a3a');
    iconGrip(g, 2.4, 8, 3.8, '#1b2330', '#43f0e0');
    iconCircle(g, 0, 12.4, 2.2, null, '#b08a3a', 1.3);
    g.restore();
  }
};

// 9 Whisper of Oblivion: a ghostly, cracked, translucent blade wrapped in wisps
ITEM_ART.waif_weapon_9 = (g, c) => {
  g.save();
  iconPlace(g, 0.5, -42, 17, 54);
  iconGlow(g, 0, -20, 22, '#c8b8ff', 0.4);
  const blade = iconVert(g, -42, 0, 'rgba(230,222,255,.35)', 'rgba(245,242,255,.97)');
  iconPoly(g, [0, -42, 4.4, -31, 3.8, 0, -3.8, 0, -4.4, -31], blade, '#8f84c8');
  iconLine(g, [0, -36, -1.6, -28, 1.4, -21, -1.2, -13, 0.8, -6], 'rgba(60,40,110,.7)', 0.9);
  g.globalAlpha = 0.65;
  for (const s of [-1, 1]) iconPath(g, (p) => { p.moveTo(s * 5, -2); p.bezierCurveTo(s * 11, -12, s * 3, -20, s * 9, -32); }, null, '#d8ccff', 1.1);
  g.globalAlpha = 1;
  iconPoly(g, [-3, -20, -4, -24, -2.6, -22], '#e6deff');
  iconPoly(g, [10, -14, 11.6, -17, 12, -13], '#e6deff');
  iconPoly(g, [-9, 3.4, -10, -2.6, -3, 0, 0, -2.4, 3, 0, 10, -2.6, 9, 3.4, 0, 2, ], '#251d38', '#d8c060', 0.9);
  iconGrip(g, 3, 10, 4, '#17121f', '#8f84c8');
  iconGem(g, 0, 15, 2.6, '#fff08a');
  g.restore();
};

/* ================= SWORDSMAN / KNIGHT : swords ================= */

// 1 Iron Sword: short plain blade
ITEM_ART.swordsman_weapon_1 = (g) => {
  g.save();
  iconPlace(g, 0.5, -34, 17, 52);
  iconBlade(g, [0, -34, 5.2, -27, 4.6, 0, -4.6, 0, -5.2, -27], '#a3abb5');
  iconLine(g, [0, -28, 0, -4], 'rgba(0,0,0,.25)', 1.2);
  iconBar(g, 0, 16, 3, '#6a5a3a');
  iconGrip(g, 3, 9.5, 4.6, '#4a3320', '#2a1a0c');
  iconBall(g, 0, 14.4, 2.8, '#7a7f88');
  g.restore();
};

// 2 Steel Longsword: longer bright blade, curled quillons, wheel pommel
ITEM_ART.swordsman_weapon_2 = (g) => {
  g.save();
  iconPlace(g, 0.5, -44, 17, 54);
  iconBlade(g, [0, -44, 4.2, -36, 3.8, 0, -3.8, 0, -4.2, -36], '#e2e9f1');
  iconLine(g, [0, -38, 0, -4], 'rgba(60,80,100,.4)', 1);
  iconPoly(g, [-13, 3.4, -11, -1.2, -4, -1.8, 4, -1.8, 11, -1.2, 13, 3.4, 10.5, 5, 5, 1.8, -5, 1.8, -10.5, 5], iconSteel(g, -13, 13, '#caa44a'), '#6e5418');
  iconGrip(g, 1.8, 10, 4.4, '#2b2f3a', '#8a93a0');
  iconCircle(g, 0, 14.4, 3, '#caa44a', '#6e5418');
  iconCircle(g, 0, 14.4, 1, '#6e5418');
  g.restore();
};

// 3 Mithril Blade: slim blue-silver blade with glowing runes and a swept-wing guard
ITEM_ART.swordsman_weapon_3 = (g, c) => {
  g.save();
  iconPlace(g, 0.5, -42, 17, 54);
  iconBlade(g, [0, -42, 3.8, -34, 3.2, 0, -3.2, 0, -3.8, -34], '#b4d0f5');
  g.fillStyle = '#4aa8ff';
  for (let y = -30; y < -4; y += 5) g.fillRect(-0.7, y, 1.4, 2.4);
  for (const s of [-1, 1]) iconPoly(g, [s * 3.5, 1, s * 8, -2, s * 15, -7, s * 13.5, -1.5, s * 10, 2.6, s * 5, 4], iconSteel(g, -15, 15, '#d8e4f2'), '#5d7aa0');
  iconGrip(g, 3.6, 9, 4, '#23324d', '#9fb8d8');
  iconGem(g, 0, 14.6, 3, '#4aa8ff');
  g.restore();
};

// 4 Flamebrand: flame-wavy flamberge blade with flames licking off it
ITEM_ART.swordsman_weapon_4 = (g) => {
  g.save();
  iconPlace(g, 0.5, -46, 17, 56);
  const L = [],
    R = [];
  for (let y = 0; y >= -39; y -= 1.5) {
    const w = 3.2 + 2.4 * Math.max(0, 1 - -y / 42) + Math.sin(-y * 0.75) * 1.5;
    L.push(-w, y);
    R.unshift(w, y);
  }
  iconPoly(g, L.concat([0, -45], R), iconVert(g, -45, 0, '#ffd36a', '#c9402a'), '#5a1608');
  iconLine(g, [0, -40, 0, -4], 'rgba(255,240,190,.8)', 1);
  for (const [fx, fy, s] of [[-5.5, -30, 1.2], [5.5, -22, 1], [-4.5, -14, 0.9], [6, -36, 0.8]]) {
    iconPath(g, (p) => { p.moveTo(fx, fy); p.quadraticCurveTo(fx + 3 * s, fy - 4 * s, fx + 0.5 * s, fy - 9 * s); p.quadraticCurveTo(fx - 3 * s, fy - 4 * s, fx, fy); }, '#ffb347');
  }
  iconPoly(g, [-11, 3.4, -7, -4, -3.4, 0, 0, -6, 3.4, 0, 7, -4, 11, 3.4, 4, 4.6, -4, 4.6], '#2a1a14', '#ff8a2a', 0.9);
  iconGrip(g, 4.6, 9, 4.4, '#1a1410', '#c9402a');
  iconGem(g, 0, 15, 2.6, '#ff5a2a');
  g.restore();
};

// 5 Dragonfang Claymore: fang-toothed wide blade, dragon-horn guard
ITEM_ART.swordsman_weapon_5 = (g) => {
  g.save();
  iconPlace(g, 0.5, -44, 18, 56);
  iconBlade(g, [0, -44, 5.4, -35, 5.4, -29, 9.4, -26, 5.8, -22, 5.8, -15, 10, -12.5, 6.2, -8, 6.4, 0, -6.4, 0, -5.4, -35], '#cdb88c', '#4a3a18');
  iconLine(g, [0, -38, 0, -4], 'rgba(60,40,10,.4)', 1.6);
  for (const s of [-1, 1]) iconPath(g, (p) => { p.moveTo(s * 3, 0); p.quadraticCurveTo(s * 11, 1, s * 14, -9); p.quadraticCurveTo(s * 9, -4, s * 3, -3); }, '#9a7a38', '#3a2808');
  iconPoly(g, [-4.4, -2.4, 0, -6.4, 4.4, -2.4, 3.6, 3.4, -3.6, 3.4], iconSteel(g, -4, 4, '#9a7a38'), '#3a2808');
  iconCircle(g, -1.6, 0, 0.8, '#ff4a2a');
  iconCircle(g, 1.6, 0, 0.8, '#ff4a2a');
  iconGrip(g, 3.4, 11, 4.6, '#5a1a1a', '#2a0a0a');
  iconPoly(g, [-3, 15, 0, 20, 3, 15, 0, 13], '#9a7a38', '#3a2808');
  g.restore();
};

// 6 Dawnbreaker: golden blade rising from a sun-disc guard
ITEM_ART.swordsman_weapon_6 = (g) => {
  g.save();
  iconPlace(g, 0.5, -46, 17, 56);
  iconGlow(g, 0, 0, 16, '#ffd27a', 0.6);
  iconBlade(g, [0, -46, 5, -38, 4.4, 0, -4.4, 0, -5, -38], '#ffe9a0', '#8a5a10');
  iconLine(g, [0, -40, 0, -9], 'rgba(255,255,255,.85)', 1.2);
  g.strokeStyle = 'rgba(255,240,170,.8)';
  g.lineWidth = 0.9;
  for (let i = 0; i < 12; i++) {
    const a = i * 0.5236;
    iconPoly(g, [Math.cos(a - 0.14) * 7, Math.sin(a - 0.14) * 7, Math.cos(a) * 11.5, Math.sin(a) * 11.5, Math.cos(a + 0.14) * 7, Math.sin(a + 0.14) * 7], '#ffcf5a', '#8a5a10', 0.7);
  }
  iconCircle(g, 0, 0, 7, iconSteel(g, -7, 7, '#ffd27a'), '#8a5a10');
  iconCircle(g, 0, 0, 3.2, '#ff8a2a', '#8a3a08');
  iconGrip(g, 8, 8, 4.2, '#f6f0dc', '#caa44a');
  iconBall(g, 0, 18, 2.8, '#ffd27a');
  g.restore();
};

// 7 Crusader Greatsword: massive broad blade with a cross inlay, cross guard
ITEM_ART.swordsman_weapon_7 = (g) => {
  g.save();
  iconPlace(g, 0.5, -42, 21, 57);
  iconBlade(g, [0, -42, 7.6, -33, 7.2, 0, -7.2, 0, -7.6, -33], '#c8d0da');
  iconRect(g, -1.1, -33, 2.2, 28, '#e8c35a', 'rgba(110,80,10,.7)', 0.4);
  iconRect(g, -5, -24, 10, 2.2, '#e8c35a', 'rgba(110,80,10,.7)', 0.4);
  iconBar(g, 0, 22, 4, '#d6d8e0');
  iconRect(g, -11.8, -0.6, 3.2, 5.2, '#e8c35a', 'rgba(110,80,10,.7)', 0.6);
  iconRect(g, 8.6, -0.6, 3.2, 5.2, '#e8c35a', 'rgba(110,80,10,.7)', 0.6);
  iconGrip(g, 4, 13, 4.8, '#efe9d8', '#8a6a3a');
  iconPoly(g, [0, 17, 4, 20, 0, 24, -4, 20], '#e8c35a', '#6e5010');
  g.restore();
};

// 8 Seraphic Claymore: pearl blade, big feathered wings and a halo
ITEM_ART.swordsman_weapon_8 = (g) => {
  g.save();
  iconPlace(g, 0.5, -46, 18, 56);
  iconGlow(g, 0, -4, 16, '#fff6d0', 0.5);
  iconBlade(g, [0, -46, 4.6, -38, 4, 0, -4, 0, -4.6, -38], '#f2f6ff', '#8f9cb8');
  iconLine(g, [0, -40, 0, -6], 'rgba(150,170,210,.45)', 1.2);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(s * 3, 1 - i * 0.2);
      g.rotate(s * (1.25 + i * 0.2));
      iconPath(g, (p) => p.ellipse(0, -(7 + (3 - i) * 1.4), 2.3, 7 + (3 - i) * 1.4, 0, 0, 6.28), i % 2 ? '#fff' : '#eef3ff', '#a9b6d0', 0.7);
      g.restore();
    }
  }
  iconCircle(g, 0, -3, 9.5, null, '#ffd96a', 1.6);
  iconGrip(g, 3.6, 9, 4.2, '#f6f2e6', '#d6b25a');
  iconBall(g, 0, 15, 2.8, '#fffaf0');
  g.restore();
};

// 9 Sovereign Edge: royal long blade, jewelled gold guard, crown pommel
ITEM_ART.swordsman_weapon_9 = (g) => {
  g.save();
  iconPlace(g, 0.5, -48, 21, 58);
  iconBlade(g, [0, -48, 4.8, -39, 4.2, 0, -4.2, 0, -4.8, -39], '#dcd6f2');
  iconLine(g, [-2.6, -36, -2.6, -4], '#e8c35a', 0.8);
  iconLine(g, [2.6, -36, 2.6, -4], '#e8c35a', 0.8);
  iconPoly(g, [-14, 4.5, -13, -2.5, -6, -1.5, 0, -5, 6, -1.5, 13, -2.5, 14, 4.5, 7.5, 2.4, 0, 1.4, -7.5, 2.4], iconSteel(g, -14, 14, '#e8c35a'), '#7a5a14');
  iconGem(g, 0, -1.2, 2.8, '#ff4a6a');
  iconGem(g, -10, 0.4, 1.6, '#4aa8ff');
  iconGem(g, 10, 0.4, 1.6, '#4aa8ff');
  iconGrip(g, 4.4, 10, 4.4, '#4a2a6a', '#e8c35a');
  iconPoly(g, [-4.4, 21, -4.4, 16, -2.2, 18, 0, 15, 2.2, 18, 4.4, 16, 4.4, 21], '#e8c35a', '#7a5a14');
  iconCircle(g, 0, 18.2, 1.1, '#ff4a6a');
  g.restore();
};

/* ================= ARCHER / RANGER : bows ================= */

// bow helpers: limb path is built by `limb(p)`, string runs between the two tips
function iconBowLimb(g, build, col, w, hi) {
  iconPath(g, build, null, '#1c130a', w + 1.6);
  iconPath(g, build, null, col, w);
  if (hi) iconPath(g, build, null, hi, Math.max(0.6, w * 0.3));
}
function iconBowString(g, a, b, pull, col, w) {
  if (typeof ICON_SPRITE !== 'undefined' && ICON_SPRITE) pull = [a[0], 0]; // held bow: relaxed, straight string
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(pull[0], pull[1]);
  g.lineTo(b[0], b[1]);
  g.strokeStyle = col || '#f2efe6';
  g.lineWidth = w || 0.9;
  g.stroke();
}
function iconArrow(g, x0, x1, y, shaft, head, fletch, hcol) {
  if (typeof ICON_SPRITE !== 'undefined' && ICON_SPRITE) return; // the held bow has no arrow nocked
  iconLine(g, [x0, y, x1, y], shaft || '#d8c79a', 1.6);
  iconPoly(g, [x1 + 5.5, y, x1 - 0.5, y - 2.6, x1 - 0.5, y + 2.6], hcol || '#dfe6ee', '#3a4450', 0.7);
  for (const d of [-1, 1]) iconPoly(g, [x0 - 1, y, x0 + 5.5, y + d * 0.4, x0 + 6.5, y + d * 3.2, x0, y + d * 3], fletch || '#d94a3a');
}

// 1 Hunter Bow: plain wooden shortbow with a nocked stone-tip arrow
ITEM_ART.archer_weapon_1 = (g) => {
  g.save();
  g.translate(25, 28);
  g.rotate(-0.3);
  g.scale(1.1, 1.1);
  iconBowLimb(g, (p) => { p.moveTo(2, -23); p.quadraticCurveTo(-17, 0, 2, 23); }, '#9a6a38', 3.4, '#c8985a');
  iconLine(g, [-6.7, -3.6, -6.7, 3.6], '#4a3320', 4.6);
  iconBowString(g, [2, -23], [2, 23], [8, 0]);
  iconArrow(g, 8, 28, 0, '#d8c79a', 0, '#d94a3a', '#8a8f98');
  g.restore();
};

// 2 Oak Longbow: tall dark-oak longbow with a leather grip, horn nocks and a tassel (no arrow)
ITEM_ART.archer_weapon_2 = (g) => {
  g.save();
  g.translate(31, 28);
  g.rotate(0.12);
  iconBowLimb(g, (p) => { p.moveTo(0, -27); p.quadraticCurveTo(-16, 0, 0, 27); }, '#5a3a1c', 3.6, '#8a5a2c');
  for (const y of [-14, 14]) iconLine(g, [-6.1, y - 1, -6.1, y + 1], '#c9a24a', 4.6);
  iconCircle(g, 0, -27, 1.4, '#efe3c0');
  iconCircle(g, 0, 27, 1.4, '#efe3c0');
  iconLine(g, [-8, -5, -8, 5], '#3a2414', 5);
  iconLine(g, [-8, -4, -8, 4], '#8a5a2c', 1);
  iconBowString(g, [0, -27], [0, 27], [0, 0], '#e8dfc8', 0.9);
  iconLine(g, [-8, 5, -9.4, 10], '#c9402a', 1.2);
  iconPoly(g, [-9.4, 10, -11, 14, -8, 14], '#c9402a');
  g.restore();
};

// 3 Elven Bow: swept leaf-tipped silver limbs, vines, emerald at the grip
ITEM_ART.archer_weapon_3 = (g) => {
  g.save();
  g.translate(27, 28);
  g.rotate(-0.28);
  g.scale(1.05, 1.05);
  const limb = (p) => { p.moveTo(3, -25); p.bezierCurveTo(-4, -21, -15, -9, -9, 0); p.bezierCurveTo(-15, 9, -4, 21, 3, 25); };
  iconBowLimb(g, limb, '#e6dcb0', 2.8, '#fff8d8');
  iconPath(g, (p) => { p.moveTo(-8, -9); p.bezierCurveTo(-13, -5, -4, -3, -10, 2); }, null, '#4fbf6a', 0.9);
  for (const s of [-1, 1]) iconPoly(g, [3, s * 25, 1.2, s * 28, 5.4, s * 29.6, 6.6, s * 26], '#4fbf6a', '#1d5a2c', 0.7);
  iconGem(g, -9, 0, 3, '#3fe08a');
  iconBowString(g, [3, -25], [3, 25], [9, 0], '#f4f0dc');
  iconArrow(g, 9, 28, 0, '#e8dcb0', 0, '#4fbf6a', '#dfe6ee');
  g.restore();
};

// 4 Windpiercer: recurve with feathered limb tips; the arrow is already flying with wind streaks
ITEM_ART.archer_weapon_4 = (g) => {
  g.save();
  g.translate(22, 28);
  g.rotate(-0.25);
  iconBowLimb(g, (p) => { p.moveTo(6, -24); p.bezierCurveTo(-3, -20, -15, -9, -9, 0); p.bezierCurveTo(-15, 9, -3, 20, 6, 24); }, '#cfe4f5', 3, '#ffffff');
  for (const s of [-1, 1]) {
    g.save();
    g.translate(6, s * 24);
    g.rotate(s * -0.6);
    iconPath(g, (p) => p.ellipse(3, 0, 6, 2.4, 0, 0, 6.28), '#f4f8ff', '#8aa8c8', 0.7);
    iconLine(g, [-1, 0, 8, 0], '#8aa8c8', 0.6);
    g.restore();
  }
  iconBowString(g, [6, -24], [6, 24], [6, 0]);
  iconLine(g, [-7, -3.2, -7, 3.2], '#4a6a8a', 4.4);
  iconArrow(g, 11, 30, 0, '#eef4fa', 0, '#7ac8ff', '#dfe6ee');
  g.strokeStyle = 'rgba(160,220,255,.85)';
  g.lineWidth = 1;
  for (const [y, a, b] of [[-6, 12, 26], [6, 14, 28], [-11, 20, 32]]) iconLine(g, [a, y, b, y], 'rgba(160,220,255,.8)', 1);
  iconPath(g, (p) => { p.moveTo(18, 11); p.bezierCurveTo(24, 8, 28, 15, 23, 16); }, null, 'rgba(160,220,255,.7)', 0.9);
  g.restore();
};

// 5 Stormcaller Bow: lightning-bolt limbs with a storm cloud
ITEM_ART.archer_weapon_5 = (g) => {
  g.save();
  g.translate(28, 28);
  g.rotate(-0.2);
  g.fillStyle = 'rgba(86,76,140,.95)';
  for (const [x, y, r] of [[-12, -20, 6], [-6, -23, 5.5], [-17, -16, 4.6], [-9, -17, 5]]) iconCircle(g, x, y, r, '#4a3f7a');
  const bolt = [4, -25, -4, -15, -1, -13, -9, -3, -5, -1, -12, 0];
  const mir = [];
  for (let i = bolt.length - 2; i >= 0; i -= 2) mir.push(bolt[i], -bolt[i + 1]);
  const pts = bolt.concat(mir.slice(2));
  iconLine(g, pts, '#2a2060', 5.4);
  iconLine(g, pts, '#ffe45a', 3.2);
  iconLine(g, pts, '#fffbd0', 1);
  iconBowString(g, [4, -25], [4, 25], [10, 0], '#8ad0ff', 1);
  iconLine(g, [10, 0, 14, -2, 18, 2, 22, -1], '#8ad0ff', 0.9);
  iconLine(g, [10, 0, 27, 0], '#3a3450', 1.7);
  iconPoly(g, [32, 0, 26.6, -2.8, 28, 0, 26.6, 2.8], '#ffe45a', '#6a5a10', 0.7);
  for (const d of [-1, 1]) iconPoly(g, [9, 0, 14, d * 0.4, 15, d * 3, 9, d * 3], '#ffe45a');
  g.restore();
};

// 6 Celestial Bow: a golden crescent-moon bow with a star at the grip
ITEM_ART.archer_weapon_6 = (g) => {
  g.save();
  g.translate(26, 28);
  g.rotate(-0.25);
  iconGlow(g, -4, 0, 24, '#fff0b0', 0.35);
  iconPath(g, (p) => { p.moveTo(4, -25); p.bezierCurveTo(-18, -17, -18, 17, 4, 25); p.bezierCurveTo(-8, 13, -8, -13, 4, -25); p.closePath(); }, iconSteel(g, -14, 4, '#f6edc0'), '#8a6a1c', 1);
  iconStar(g, -7.6, 0, 5, 1.8, 4, '#ffffff', '#c89a2c');
  iconBowString(g, [4, -25], [4, 25], [11, 0], '#c8f4ff', 1);
  iconLine(g, [11, 0, 30, 0], '#fff0b0', 1.6);
  iconStar(g, 31, 0, 4.4, 1.6, 4, '#fff8d0', '#c89a2c');
  for (const [x, y, r] of [[18, -14, 1.8], [-14, -22, 1.4], [-12, 22, 1.6], [24, 12, 1.2]]) iconStar(g, x, y, r * 1.8, r * 0.6, 4, '#fff6c0');
  g.restore();
};

// 7 Gale Warbow: compound war bow - block riser, straight steel limbs, cam wheels, cables
ITEM_ART.archer_weapon_7 = (g) => {
  g.save();
  g.translate(25, 28);
  g.rotate(-0.22);
  g.scale(1.05, 1.05);
  iconLine(g, [3, -24, -7, -9, -9, 0, -7, 9, 3, 24], '#1a2428', 5.2);
  iconLine(g, [3, -24, -7, -9, -9, 0, -7, 9, 3, 24], '#8fa6b0', 3.4);
  iconRect(g, -14, -8, 7, 16, '#2e4a52', '#0e1a1c', 2);
  iconLine(g, [-12.5, -5, -12.5, 5], '#43f0e0', 1.2);
  iconPath(g, (p) => { p.moveTo(-10.5, -3); p.bezierCurveTo(-14, -1, -8, 1, -11, 4); }, null, '#b8fff6', 0.7);
  for (const s of [-1, 1]) {
    iconCircle(g, 3, s * 24, 3.4, '#aebdc4', '#2a363c');
    iconCircle(g, 3, s * 24, 1.2, '#2a363c');
    iconLine(g, [3, s * 24, -6, s * 6], 'rgba(240,240,230,.8)', 0.7);
  }
  iconBowString(g, [3, -24], [3, 24], [10, 0], '#f2efe6', 1);
  iconLine(g, [10, 0, 27, 0], '#cfd6dc', 1.8);
  iconPoly(g, [34, 0, 26, -3.8, 28, 0, 26, 3.8], '#dfe6ee', '#2a363c', 0.8);
  for (const d of [-1, 1]) iconPoly(g, [9, 0, 14, d * 0.4, 15, d * 3, 9, d * 3], '#43f0e0');
  g.restore();
};

// 8 Tempest Longbow: tall blue-lacquer longbow with silver bands and curling wave tips
ITEM_ART.archer_weapon_8 = (g) => {
  g.save();
  g.translate(30, 28);
  g.rotate(0.1);
  iconBowLimb(g, (p) => { p.moveTo(2, -26); p.quadraticCurveTo(-17, 0, 2, 26); }, '#2a4a7a', 3.6, '#5d8ac8');
  for (const y of [-17, -9, 9, 17]) iconLine(g, [-6.4 + Math.abs(y) * 0.1, y - 1, -6.4 + Math.abs(y) * 0.1, y + 1], '#d8dee6', 4.6);
  for (const s of [-1, 1]) iconPath(g, (p) => { p.moveTo(2, s * 26); p.bezierCurveTo(6, s * 26, 8, s * 30, 4.6, s * 30.4); }, null, '#43d0f0', 1.4);
  iconLine(g, [-8.4, -5, -8.4, 5], '#d8dee6', 5);
  iconLine(g, [-8.4, -3.6, -8.4, 3.6], '#2a4a7a', 3);
  iconBowString(g, [2, -26], [2, 26], [8, 0], '#9aefff', 1);
  iconArrow(g, 8, 27, 0, '#cfd8e2', 0, '#43d0f0', '#dfe6ee');
  iconPath(g, (p) => { p.moveTo(-14, -12); p.bezierCurveTo(-19, -9, -13, -5, -18, -2); }, null, '#9aefff', 0.9);
  iconPath(g, (p) => { p.moveTo(-14, 12); p.bezierCurveTo(-19, 9, -13, 5, -18, 2); }, null, '#9aefff', 0.9);
  g.restore();
};

// 9 Skyfall Greatbow: huge golden bow with spread wings and a falling-star arrow
ITEM_ART.archer_weapon_9 = (g) => {
  g.save();
  g.translate(25, 28);
  g.rotate(-0.2);
  iconGlow(g, -2, 0, 26, '#fff08a', 0.35);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(-7, s * 5);
      g.rotate(s * (0.1 + i * 0.28) - 1.5708 * s * 0);
      iconPath(g, (p) => p.ellipse(-2 - i * 0.6, s * (-6 - (3 - i) * 2.2), 2.4, 6 + (3 - i) * 2, 0, 0, 6.28), i % 2 ? '#fff6c0' : '#ffffff', '#c8a23a', 0.7);
      g.restore();
    }
  }
  iconBowLimb(g, (p) => { p.moveTo(4, -27); p.bezierCurveTo(-4, -22, -17, -10, -11, 0); p.bezierCurveTo(-17, 10, -4, 22, 4, 27); }, '#e8c35a', 3.2, '#fff4b8');
  iconGem(g, -11, 0, 3.4, '#fff08a');
  iconBowString(g, [4, -27], [4, 27], [11, 0], '#fff8d8', 1);
  iconLine(g, [11, 0, 29, 0], '#fff8d8', 1.6);
  iconStar(g, 32, 0, 5, 1.9, 4, '#fff8d0', '#c89a2c');
  iconLine(g, [11, 0, 19, 0], 'rgba(255,240,160,.9)', 3);
  g.restore();
};
