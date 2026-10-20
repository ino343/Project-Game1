/* Armor / jacket icons: each one has its own cut (hoodie, parka, biker, vest, trench, tailcoat ...). Origin = chest centre. */

function iconSl(g, s, col, cuff, o) {
  o = o || {};
  const w = o.w || 7,
    len = o.len || 28;
  g.save();
  g.translate(s * (o.x || 11), o.y === undefined ? -14 : o.y);
  g.rotate(s * (o.rot === undefined ? 0.16 : o.rot));
  iconRect(g, -w / 2, 0, w, len, iconVert(g, 0, len, iconShade(col, 0.12), iconShade(col, -0.2)), 'rgba(0,0,0,.55)', 3);
  if (cuff) iconRect(g, -w / 2, len - (o.cuffH || 3.6), w, o.cuffH || 3.6, cuff, 'rgba(0,0,0,.5)', 1.2);
  g.restore();
}
function iconTorso(g, col, w, h, y0, r) {
  iconRect(g, -w / 2, y0, w, h, iconVert(g, y0, y0 + h, iconShade(col, 0.14), iconShade(col, -0.22)), 'rgba(0,0,0,.6)', r === undefined ? 3 : r);
}
function iconZip(g, x, y0, y1, col) {
  iconLine(g, [x, y0, x, y1], col || '#d8dee6', 1.1);
  g.fillStyle = 'rgba(0,0,0,.35)';
  for (let y = y0 + 1; y < y1; y += 2.2) g.fillRect(x - 1.3, y, 2.6, 0.7);
  iconRect(g, x - 1.3, y0, 2.6, 2.6, col || '#d8dee6', 'rgba(0,0,0,.5)', 0.8);
}
function iconPocket(g, x, y, w, h, col, flap) {
  iconRect(g, x, y, w, h, col, 'rgba(0,0,0,.55)', 1);
  if (flap) iconRect(g, x, y, w, h * 0.38, flap, 'rgba(0,0,0,.5)', 1);
}
function iconButtons(g, xs, ys, r, col) {
  for (const x of xs) for (const y of ys) iconCircle(g, x, y, r, col, 'rgba(0,0,0,.5)', 0.5);
}

/* ================= WAIF / ASSASSIN ================= */

// 1 Street Hoodie: orange hoodie, hood, kangaroo pocket, drawstrings
ITEM_ART.waif_armor_1 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#e07a3a', '#a8561f');
  iconSl(g, 1, '#e07a3a', '#a8561f');
  iconPath(g, (p) => p.ellipse(0, -14.5, 10.5, 5.6, 0, 0, 6.28), '#b85c26', 'rgba(0,0,0,.55)');
  iconTorso(g, '#e07a3a', 23, 31, -15);
  iconPath(g, (p) => p.ellipse(0, -14, 5.6, 3.2, 0, 0, 3.1416), '#7a3c14');
  iconPoly(g, [-8, 3, 8, 3, 10, 13, -10, 13], '#c4601f', 'rgba(0,0,0,.5)');
  iconLine(g, [-3, -12, -3.4, -5], '#f4f0e0', 1.2);
  iconLine(g, [3, -12, 3.4, -5], '#f4f0e0', 1.2);
  iconRect(g, -11.5, 14.4, 23, 3.4, '#a8561f', 'rgba(0,0,0,.5)', 1);
  g.restore();
};

// 2 Urban Parka: khaki parka, fur-trimmed hood, big patch pockets, toggles
ITEM_ART.waif_armor_2 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#8a7a4a', '#4a4026', { len: 29 });
  iconSl(g, 1, '#8a7a4a', '#4a4026', { len: 29 });
  iconTorso(g, '#8a7a4a', 23, 35, -15, 3);
  iconPoly(g, [-4.5, -16, 4.5, -16, 0, -6], '#5a5030');
  for (let i = -5; i <= 5; i++) iconCircle(g, i * 2.1, -16 + Math.abs(i) * 0.28, 2.5, '#f2ead8', 'rgba(60,50,30,.5)', 0.5);
  iconPocket(g, -10, 4, 8, 9, '#6e6038', '#5a4e2e');
  iconPocket(g, 2, 4, 8, 9, '#6e6038', '#5a4e2e');
  for (const y of [-7, -2]) {
    iconRect(g, -1.5, y, 3, 1.6, '#4a2a14', null, 0.6);
    iconRect(g, -5, y, 2.2, 1.6, '#4a2a14', null, 0.6);
    iconRect(g, 2.8, y, 2.2, 1.6, '#4a2a14', null, 0.6);
  }
  iconRect(g, -11.5, 17, 23, 3, '#e07a3a', 'rgba(0,0,0,.5)', 1);
  g.restore();
};

// 3 Shadow Windbreaker: charcoal shell, diagonal reflective stripe, tall collar, zip
ITEM_ART.waif_armor_3 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#2c3140', '#4aa8ff', { len: 29 });
  iconSl(g, 1, '#2c3140', '#4aa8ff', { len: 29 });
  iconTorso(g, '#2c3140', 23, 33, -15);
  g.save();
  g.beginPath();
  g.roundRect(-11.5, -15, 23, 33, 3);
  g.clip();
  iconPoly(g, [-12, 2, -12, -3, 12, -12, 12, -7], '#c8d2de');
  iconPoly(g, [-12, 8, -12, 6, 12, -3, 12, -1], '#6a7a8e');
  g.restore();
  iconRect(g, -6, -18, 12, 5, '#1c202b', 'rgba(0,0,0,.6)', 2);
  iconZip(g, 0, -14, 17, '#e8eef4');
  iconRect(g, -11.5, 15, 23, 3, '#1c202b', 'rgba(0,0,0,.6)', 1);
  g.restore();
};

// 4 Nightweave Jacket: indigo biker jacket - asymmetric zip, lapels, studs, belt
ITEM_ART.waif_armor_4 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#2a1f4a', '#6d5aa8', { len: 26, rot: 0.2 });
  iconSl(g, 1, '#2a1f4a', '#6d5aa8', { len: 26, rot: 0.2 });
  iconTorso(g, '#2a1f4a', 23, 30, -15, 4);
  iconPoly(g, [-1, -15, -11, -15, -5, -3, 3, -14], '#4a3a7a', 'rgba(0,0,0,.6)');
  iconPoly(g, [1, -15, 11, -15, 7, 0, 2, -8], '#3a2c62', 'rgba(0,0,0,.6)');
  iconLine(g, [-2, -14, 2.5, -2, 5, 14], '#d8dee6', 1.4);
  iconRect(g, -11.5, 12, 23, 3, '#14102a', 'rgba(0,0,0,.6)', 1);
  iconRect(g, -2, 11.8, 4, 3.4, '#c0c8d4', 'rgba(0,0,0,.6)', 0.6);
  for (const [x, y] of [[-10, -12], [10, -12], [-7, -9], [7, -9]]) iconCircle(g, x, y, 0.9, '#d8dee6');
  iconLine(g, [-8, 2, -4, 5], 'rgba(255,255,255,.18)', 1);
  iconStar(g, -6, 7, 2, 0.8, 4, '#b79aff');
  g.restore();
};

// 5 Phantom Techwear: black techwear, cross-body straps with buckles, cargo pockets, mask collar
ITEM_ART.waif_armor_5 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#17181f', '#2c2f3c', { len: 29 });
  iconSl(g, 1, '#17181f', '#2c2f3c', { len: 29 });
  iconTorso(g, '#1d1f27', 23, 33, -15, 2.5);
  iconRect(g, -7, -20, 14, 8, '#101116', 'rgba(255,255,255,.12)', 3);
  iconLine(g, [-4, -17, 4, -17], c, 0.9);
  iconLine(g, [-10, -14, 9, 12], '#3a3d4a', 3.4);
  iconLine(g, [10, -14, -9, 12], '#3a3d4a', 3.4);
  iconRect(g, -2, -3.4, 4, 4.4, '#9aa3b0', 'rgba(0,0,0,.6)', 0.8);
  iconPocket(g, -11, 6, 8, 9, '#262a35', '#303544');
  iconPocket(g, 3, 6, 8, 9, '#262a35', '#303544');
  iconLine(g, [-10, -3, -10, 4], c, 1.2);
  iconLine(g, [10, -3, 10, 4], c, 1.2);
  g.restore();
};

// 6 Voidsilk Coat: long violet silk coat with a split hem, wide collar and void clasp
ITEM_ART.waif_armor_6 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#4a2f7a', '#2a1a4a', { len: 30, x: 11.5 });
  iconSl(g, 1, '#4a2f7a', '#2a1a4a', { len: 30, x: 11.5 });
  iconPoly(g, [-12, -15, 12, -15, 14, 25, 1, 21, 0, 25, -1, 21, -14, 25], iconVert(g, -15, 25, '#6a45a8', '#2a1a4a'), 'rgba(0,0,0,.65)');
  iconLine(g, [-9, -8, -11, 18], 'rgba(220,200,255,.35)', 1.2);
  iconLine(g, [8, -6, 10, 16], 'rgba(220,200,255,.25)', 1);
  iconPoly(g, [-12, -16, -4, -17, 0, -8, -9, -4], '#2a1a4a', 'rgba(0,0,0,.6)');
  iconPoly(g, [12, -16, 4, -17, 0, -8, 9, -4], '#2a1a4a', 'rgba(0,0,0,.6)');
  iconBall(g, 0, -8, 3.1, '#120a24');
  iconCircle(g, 0, -8, 3.1, null, '#b36bff', 1);
  iconLine(g, [0, -5, 0, 20], '#18102a', 1);
  g.restore();
};

// 7 Nightstalker Techwear: hooded black techwear with glowing violet seams and a utility belt
ITEM_ART.waif_armor_7 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#15161d', c, { len: 29 });
  iconSl(g, 1, '#15161d', c, { len: 29 });
  iconPath(g, (p) => { p.moveTo(-12, -13); p.quadraticCurveTo(-10, -25, 0, -24); p.quadraticCurveTo(10, -25, 12, -13); p.lineTo(0, -9); p.closePath(); }, '#1c1d28', 'rgba(0,0,0,.65)');
  iconPath(g, (p) => p.ellipse(0, -14, 6.2, 3.8, 0, 0, 3.1416), '#06060a');
  iconTorso(g, '#15161d', 23, 31, -15, 2.5);
  iconPath(g, (p) => p.ellipse(0, -14.5, 7, 4, 0, 0, 3.1416), '#1c1d28', 'rgba(0,0,0,.6)');
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 4;
  iconLine(g, [0, -10, 0, 16], c, 1.1);
  iconLine(g, [-11, -2, -3, -2, -3, 8], c, 1);
  iconLine(g, [11, -2, 3, -2, 3, 8], c, 1);
  g.restore();
  iconRect(g, -11.5, 8, 23, 3, '#2a2c38', 'rgba(0,0,0,.6)', 1);
  iconPocket(g, -10, 11, 6, 6, '#23252f');
  iconPocket(g, 4, 11, 6, 6, '#23252f');
  g.restore();
};

// 8 Eclipse Shell Jacket: segmented armoured shell, round pauldrons, eclipse emblem
ITEM_ART.waif_armor_8 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#1f2a3a', '#3a4a60', { len: 28 });
  iconSl(g, 1, '#1f2a3a', '#3a4a60', { len: 28 });
  iconTorso(g, '#26344a', 22, 32, -15, 4);
  for (const y of [-6, 2, 10]) iconRect(g, -10.5, y, 21, 5.6, iconSteel(g, -10.5, 10.5, '#34465e'), 'rgba(0,0,0,.6)', 2);
  for (const s of [-1, 1]) {
    iconCircle(g, s * 12.6, -12, 5.4, iconSteel(g, s * 7, s * 18, '#4a5e7a'), 'rgba(0,0,0,.65)');
    iconCircle(g, s * 12.6, -12, 2.2, null, c, 1);
  }
  iconGlow(g, 0, -3, 9, '#ffd27a', 0.5);
  iconCircle(g, 0, -3, 5.6, '#06080c', '#ffe9b0', 1.5);
  iconRect(g, -11.5, 17, 23, 3, '#4a5e7a', 'rgba(0,0,0,.6)', 1);
  g.restore();
};

// 9 Oblivion Longcoat: hooded tattered coat, ragged hem, glowing sigil, drifting wisps
ITEM_ART.waif_armor_9 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#241d34', '#3a3050', { len: 30, x: 11.5 });
  iconSl(g, 1, '#241d34', '#3a3050', { len: 30, x: 11.5 });
  iconPoly(g, [-12.5, -15, 12.5, -15, 13, 14, 15, 21, 10, 19, 8, 26, 4, 20, 0, 25, -4, 19, -8, 25, -10, 19, -15, 22, -13, 13], iconVert(g, -15, 26, '#3a2f52', '#14101e'), 'rgba(0,0,0,.7)');
  iconPath(g, (p) => { p.moveTo(-11, -13); p.quadraticCurveTo(-9, -24, 0, -23); p.quadraticCurveTo(9, -24, 11, -13); p.lineTo(0, -8); p.closePath(); }, '#2c2440', 'rgba(0,0,0,.65)');
  iconPath(g, (p) => p.ellipse(0, -14, 5.6, 3.6, 0, 0, 3.1416), '#05040a');
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 5;
  iconPoly(g, [0, -5, 4, 1, 0, 7, -4, 1], null, c, 1.1);
  iconCircle(g, 0, 1, 1.2, c);
  g.restore();
  g.globalAlpha = 0.6;
  for (const s of [-1, 1]) iconPath(g, (p) => { p.moveTo(s * 11, 20); p.bezierCurveTo(s * 16, 14, s * 9, 10, s * 14, 3); }, null, '#d8ccff', 1);
  g.globalAlpha = 1;
  g.restore();
};

/* ================= SWORDSMAN / KNIGHT ================= */

// 1 Varsity Jacket: blue body, cream sleeves, ribbed trims, letter patch, snaps
ITEM_ART.swordsman_armor_1 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#f1ede0', '#3b6fd4', { len: 28 });
  iconSl(g, 1, '#f1ede0', '#3b6fd4', { len: 28 });
  iconTorso(g, '#3b6fd4', 22, 31, -15);
  iconRect(g, -6.5, -16.4, 13, 3.6, '#f1ede0', 'rgba(0,0,0,.5)', 1.4);
  iconRect(g, -11.5, 13.6, 23, 3.8, '#f1ede0', 'rgba(0,0,0,.5)', 1.2);
  iconLine(g, [0, -13, 0, 13.6], '#1f3f8a', 1);
  iconButtons(g, [0], [-8, -2, 4, 10], 0.9, '#e8eef8');
  iconPoly(g, [-9.5, -9, -3.5, -9, -3.5, -2, -6.5, 0, -9.5, -2], '#f1ede0', 'rgba(0,0,0,.5)', 0.8);
  iconLine(g, [-8.2, -3.2, -6.5, -8, -4.8, -3.2], '#c9402a', 1.2);
  iconLine(g, [-7.5, -5, -5.5, -5], '#c9402a', 0.9);
  g.restore();
};

// 2 Bomber Jacket: olive satin, orange lining, ribbed collar / hem / cuffs, sleeve zip pocket
ITEM_ART.swordsman_armor_2 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#566a3a', '#2a3a1c', { len: 26, w: 8, cuffH: 4 });
  iconSl(g, 1, '#566a3a', '#2a3a1c', { len: 26, w: 8, cuffH: 4 });
  iconRect(g, -14.6, -3, 5, 6.6, '#3a4a28', 'rgba(0,0,0,.5)', 1);
  iconTorso(g, '#566a3a', 24, 28, -14, 4);
  iconPoly(g, [-6, -15, -1, -15, -1, -5], '#e07a3a', 'rgba(0,0,0,.5)', 0.8);
  iconPoly(g, [6, -15, 1, -15, 1, -5], '#e07a3a', 'rgba(0,0,0,.5)', 0.8);
  iconRect(g, -7, -17, 14, 4, '#2a3a1c', 'rgba(0,0,0,.6)', 2);
  iconRect(g, -12, 11, 24, 4.4, '#2a3a1c', 'rgba(0,0,0,.6)', 1.4);
  iconZip(g, 0, -13, 11, '#e8c35a');
  iconRect(g, 4, 0, 6, 5, '#475c2e', 'rgba(0,0,0,.55)', 1);
  iconLine(g, [4.5, 0.8, 9.5, 0.8], '#e8c35a', 0.8);
  g.restore();
};

// 3 Tactical Vest: sleeveless plate-carrier with molle webbing and ammo pouches
ITEM_ART.swordsman_armor_3 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconRect(g, -13.4, -16, 7, 7, '#caa88a', 'rgba(0,0,0,.4)', 3);
  iconRect(g, 6.4, -16, 7, 7, '#caa88a', 'rgba(0,0,0,.4)', 3);
  iconPoly(g, [-12, -17, -6, -17, -6, -10, 6, -10, 6, -17, 12, -17, 12.5, 18, -12.5, 18], iconVert(g, -17, 18, '#6a7662', '#3a4436'), 'rgba(0,0,0,.65)');
  iconRect(g, -12, -17, 6, 3, '#2e3828', 'rgba(0,0,0,.5)', 1);
  iconRect(g, 6, -17, 6, 3, '#2e3828', 'rgba(0,0,0,.5)', 1);
  g.strokeStyle = 'rgba(0,0,0,.28)';
  g.lineWidth = 0.7;
  for (let y = -6; y < 17; y += 3) iconLine(g, [-11.4, y, 11.4, y], 'rgba(0,0,0,.28)', 0.7);
  for (const x of [-10, -3.6, 2.8]) {
    iconPocket(g, x, -4, 6.8, 8, '#4a5640', '#3a4430');
    iconLine(g, [x + 1, -2.6, x + 5.8, -2.6], c, 0.8);
  }
  iconPocket(g, -9, 7, 8, 8, '#4a5640', '#3a4430');
  iconPocket(g, 1, 7, 8, 8, '#4a5640', '#3a4430');
  iconRect(g, -12.5, 15.4, 25, 2.6, '#2e3828', 'rgba(0,0,0,.5)', 1);
  g.restore();
};

// 4 Knight Overcoat: wine double-breasted overcoat, peaked lapels, gold buttons and epaulettes
ITEM_ART.swordsman_armor_4 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#6a1f2a', '#e8c35a', { len: 29, cuffH: 2.6 });
  iconSl(g, 1, '#6a1f2a', '#e8c35a', { len: 29, cuffH: 2.6 });
  iconPoly(g, [-12, -15, 12, -15, 13, 21, -13, 21], iconVert(g, -15, 21, '#8a2a38', '#4a1018'), 'rgba(0,0,0,.65)');
  iconPoly(g, [-12, -16, -3, -16, 0, -4, -7, -1], '#4a1018', 'rgba(0,0,0,.6)');
  iconPoly(g, [12, -16, 3, -16, 0, -4, 7, -1], '#4a1018', 'rgba(0,0,0,.6)');
  iconPoly(g, [-3, -16, 3, -16, 0, -8], '#efe8d8');
  iconButtons(g, [-4.4, 4.4], [0, 6, 12], 1.2, '#e8c35a');
  for (const s of [-1, 1]) {
    iconRect(g, s * 12.4 - 3.4, -16.5, 6.8, 3.2, '#e8c35a', 'rgba(110,80,10,.8)', 0.8);
    for (let i = -2; i <= 2; i++) iconLine(g, [s * 12.4 + i * 1.3, -13.4, s * 12.4 + i * 1.3, -10.6], '#e8c35a', 0.7);
  }
  iconLine(g, [-12.6, 19.4, 12.6, 19.4], '#e8c35a', 1);
  g.restore();
};

// 5 Dragonscale Trench: green scale-patterned trench with belt and storm flap
ITEM_ART.swordsman_armor_5 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#2f5a4a', '#8a6a30', { len: 29 });
  iconSl(g, 1, '#2f5a4a', '#8a6a30', { len: 29 });
  iconPoly(g, [-12, -15, 12, -15, 14, 23, -14, 23], iconVert(g, -15, 23, '#3f7a62', '#1c3a2e'), 'rgba(0,0,0,.65)');
  g.save();
  g.beginPath();
  g.moveTo(-12, -15);
  g.lineTo(12, -15);
  g.lineTo(14, 23);
  g.lineTo(-14, 23);
  g.clip();
  g.strokeStyle = 'rgba(0,0,0,.4)';
  g.lineWidth = 0.8;
  for (let r = 0; r < 9; r++) for (let q = -4; q <= 4; q++) {
    const x = q * 6 + (r % 2 ? 3 : 0),
      y = -12 + r * 4.4;
    g.beginPath();
    g.arc(x, y, 3, 0.1, 3.04);
    g.stroke();
  }
  g.restore();
  iconPoly(g, [-12, -16, -3, -16, -1, -2, -8, -4], '#1c3a2e', 'rgba(0,0,0,.6)');
  iconPoly(g, [12, -16, 3, -16, 1, -2, 8, -4], '#1c3a2e', 'rgba(0,0,0,.6)');
  iconRect(g, -13, 6, 26, 3.6, '#7a5a28', 'rgba(0,0,0,.6)', 1);
  iconRect(g, -2.4, 5.6, 4.8, 4.4, '#e8c35a', 'rgba(110,80,10,.8)', 0.8);
  iconPoly(g, [-13, -13, -5, -15, -5, -9, -13, -7], '#8a6a30', 'rgba(0,0,0,.55)', 0.8);
  iconGem(g, 0, -9, 1.9, c);
  g.restore();
};

// 6 Dawnforged Longcoat: white-gold long coat with a golden sun on the chest
ITEM_ART.swordsman_armor_6 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#f4efe0', '#e8c35a', { len: 30, x: 11.5 });
  iconSl(g, 1, '#f4efe0', '#e8c35a', { len: 30, x: 11.5 });
  iconPoly(g, [-12, -15, 12, -15, 14, 25, 0, 22, -14, 25], iconVert(g, -15, 25, '#fffaf0', '#cfc6ae'), 'rgba(80,60,20,.7)');
  iconLine(g, [0, -10, 0, 23], '#e8c35a', 1.2);
  iconLine(g, [-13.6, 23.4, 13.6, 23.4], '#e8c35a', 1.4);
  iconPoly(g, [-12, -16, -3, -16, 0, -8, -8, -3], '#e8c35a', 'rgba(110,80,10,.7)');
  iconPoly(g, [12, -16, 3, -16, 0, -8, 8, -3], '#e8c35a', 'rgba(110,80,10,.7)');
  iconGlow(g, 0, 2, 10, '#ffd27a', 0.5);
  for (let i = 0; i < 8; i++) {
    const a = i * 0.7854;
    iconPoly(g, [Math.cos(a - 0.2) * 4.5, 2 + Math.sin(a - 0.2) * 4.5, Math.cos(a) * 8, 2 + Math.sin(a) * 8, Math.cos(a + 0.2) * 4.5, 2 + Math.sin(a + 0.2) * 4.5], '#ffcf5a', 'rgba(110,80,10,.7)', 0.6);
  }
  iconCircle(g, 0, 2, 4, '#ffd27a', 'rgba(110,80,10,.8)');
  iconCircle(g, 0, 2, 1.6, '#ff8a2a');
  g.restore();
};

// 7 Crusader Greatcoat: white greatcoat with a big red cross, steel pauldrons and belt
ITEM_ART.swordsman_armor_7 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#e4e4ec', '#7a8494', { len: 29, w: 7.6 });
  iconSl(g, 1, '#e4e4ec', '#7a8494', { len: 29, w: 7.6 });
  iconPoly(g, [-12, -15, 12, -15, 13, 22, -13, 22], iconVert(g, -15, 22, '#f6f6fa', '#b8bcc8'), 'rgba(0,0,0,.6)');
  iconRect(g, -2.8, -14, 5.6, 26, '#c9302a', 'rgba(70,10,10,.8)', 0.6);
  iconRect(g, -8.4, -6.6, 16.8, 5.6, '#c9302a', 'rgba(70,10,10,.8)', 0.6);
  iconRect(g, -13, 11, 26, 3.6, '#5a4a38', 'rgba(0,0,0,.6)', 1);
  iconRect(g, -2.6, 10.6, 5.2, 4.4, '#e8c35a', 'rgba(110,80,10,.8)', 0.8);
  for (const s of [-1, 1]) {
    iconPath(g, (p) => { p.moveTo(s * 6, -17); p.quadraticCurveTo(s * 15, -19, s * 17, -9); p.lineTo(s * 8, -9); p.closePath(); }, iconSteel(g, -17, 17, '#aab4c4'), 'rgba(0,0,0,.65)');
    iconLine(g, [s * 8, -13, s * 15, -12.4], 'rgba(255,255,255,.5)', 0.8);
  }
  iconRect(g, -5, -17.4, 10, 3, '#8a94a4', 'rgba(0,0,0,.6)', 1.2);
  g.restore();
};

// 8 Seraphic Tailcoat: white-gold swallowtail coat with a feathered wing embroidered on the chest
ITEM_ART.swordsman_armor_8 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#f2f4fa', '#e8c35a', { len: 27 });
  iconSl(g, 1, '#f2f4fa', '#e8c35a', { len: 27 });
  iconPoly(g, [-12, -15, 12, -15, 12, 8, 16, 26, 7, 17, 0, 12, -7, 17, -16, 26, -12, 8], iconVert(g, -15, 26, '#ffffff', '#b8c0d8'), 'rgba(60,70,100,.7)');
  iconPoly(g, [-1.6, -16, 1.6, -16, 0, 10], '#2a3a6a');
  iconRect(g, -6, -19, 12, 4.6, '#e8c35a', 'rgba(110,80,10,.8)', 2);
  iconLine(g, [-12, 8, 0, 12, 12, 8], '#e8c35a', 1);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    g.save();
    g.translate(s * 2.6, -5 + i * 2.4);
    g.rotate(s * (1.0 + i * 0.22));
    iconPath(g, (p) => p.ellipse(0, -4.6, 1.5, 4.6 - i * 0.7, 0, 0, 6.28), '#e8c35a', 'rgba(110,80,10,.6)', 0.5);
    g.restore();
  }
  iconGem(g, 0, -10, 1.8, c);
  g.restore();
};

// 9 Sovereign Longcoat: black-violet longcoat, ermine mantle, gold chain, crown emblem
ITEM_ART.swordsman_armor_9 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#2a1c46', '#e8c35a', { len: 30, x: 12 });
  iconSl(g, 1, '#2a1c46', '#e8c35a', { len: 30, x: 12 });
  iconPoly(g, [-12, -15, 12, -15, 14, 25, -14, 25], iconVert(g, -15, 25, '#3e2a68', '#150e26'), 'rgba(0,0,0,.7)');
  iconLine(g, [-13.6, 23.2, 13.6, 23.2], '#e8c35a', 1.6);
  iconLine(g, [0, -6, 0, 23], '#e8c35a', 1);
  iconPoly(g, [-4, 8, 0, 3, 4, 8, 3, 12, -3, 12], '#e8c35a', 'rgba(110,80,10,.8)', 0.7);
  iconGem(g, 0, 8.4, 1.4, '#ff4a6a');
  iconPath(g, (p) => { p.moveTo(-17, -10); p.quadraticCurveTo(-16, -21, 0, -20); p.quadraticCurveTo(16, -21, 17, -10); p.quadraticCurveTo(10, -4, 0, -3); p.quadraticCurveTo(-10, -4, -17, -10); }, '#f6f4f0', 'rgba(60,50,40,.7)');
  for (const [x, y] of [[-12, -11], [-6, -7], [0, -9], [6, -7], [12, -11], [-9, -16], [9, -16]]) {
    iconLine(g, [x, y - 1.2, x, y + 1.2], '#1a1a22', 1.3);
  }
  iconPath(g, (p) => { p.moveTo(-10, -9); p.quadraticCurveTo(0, 1, 10, -9); }, null, '#e8c35a', 1.2);
  iconCircle(g, 0, -1.4, 1.6, '#e8c35a');
  g.restore();
};

/* ================= ARCHER / RANGER ================= */

// 1 Hunter Utility Vest: green pouch vest over a cream shirt, quiver strap with arrow feathers
ITEM_ART.archer_armor_1 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#e0d4b4', '#2a2a2a', { len: 28 });
  iconSl(g, 1, '#e0d4b4', '#2a2a2a', { len: 28 });
  iconTorso(g, '#e0d4b4', 21, 32, -15);
  iconPoly(g, [-4, -16, 4, -16, 0, -6], '#c8bc9c', 'rgba(0,0,0,.4)');
  iconPoly(g, [-11, -15, -4, -15, -1, 17, -11, 17], '#566a3a', 'rgba(0,0,0,.6)');
  iconPoly(g, [11, -15, 4, -15, 1, 17, 11, 17], '#566a3a', 'rgba(0,0,0,.6)');
  iconPocket(g, -10, -2, 6.6, 6.6, '#3d4b28', '#344022');
  iconPocket(g, 3.4, -2, 6.6, 6.6, '#3d4b28', '#344022');
  iconPocket(g, -10, 7, 7, 7, '#3d4b28');
  iconPocket(g, 3, 7, 7, 7, '#3d4b28');
  iconLine(g, [-10, -14, 11, 12], '#6a4a2a', 2.6);
  for (const x of [11, 13.4, 15.6]) iconPoly(g, [x, -17, x + 1.4, -19, x + 2.4, -13], c);
  iconRect(g, -11, 14, 22, 3, '#2a2a2a', null, 1);
  g.restore();
};

// 2 Ranger Field Jacket: olive jacket - chest flap pockets, belt, cuff straps, feather patch
ITEM_ART.archer_armor_2 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#5f6e3e', '#3a4426', { len: 28 });
  iconSl(g, 1, '#5f6e3e', '#3a4426', { len: 28 });
  iconTorso(g, '#5f6e3e', 23, 32, -15);
  iconPoly(g, [-7, -16, 7, -16, 3, -9, -3, -9], '#3f4a28', 'rgba(0,0,0,.6)');
  iconPoly(g, [-7, -16, -1, -16, -1, -6], '#74854a', 'rgba(0,0,0,.5)', 0.8);
  iconPoly(g, [7, -16, 1, -16, 1, -6], '#74854a', 'rgba(0,0,0,.5)', 0.8);
  iconPocket(g, -10, -5, 7.4, 7, '#4c5a30', '#3f4a28');
  iconPocket(g, 2.6, -5, 7.4, 7, '#4c5a30', '#3f4a28');
  iconButtons(g, [-6.3, 6.3], [-3.2], 0.8, '#c9a24a');
  iconRect(g, -11.5, 6, 23, 3.4, '#3a2a18', 'rgba(0,0,0,.6)', 1);
  iconRect(g, -2.2, 5.8, 4.4, 3.8, '#c9a24a', 'rgba(0,0,0,.6)', 0.8);
  iconPocket(g, -10, 11, 7, 6, '#4c5a30', '#3f4a28');
  iconPocket(g, 3, 11, 7, 6, '#4c5a30', '#3f4a28');
  iconPath(g, (p) => { p.moveTo(-18, 6); p.quadraticCurveTo(-15, 2, -13, 6); p.quadraticCurveTo(-15, 9, -18, 6); }, '#e8e0c8', 'rgba(0,0,0,.5)', 0.6);
  g.restore();
};

// 3 Forest Parka: deep-green parka, thick fur-lined hood up, leaf motif, wooden toggles
ITEM_ART.archer_armor_3 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#2f5a34', '#e8dfc4', { len: 29, w: 7.6 });
  iconSl(g, 1, '#2f5a34', '#e8dfc4', { len: 29, w: 7.6 });
  iconTorso(g, '#2f5a34', 23, 35, -15, 4);
  iconPath(g, (p) => p.ellipse(0, -15, 12, 7, 0, 3.1416, 6.2832), '#1f3f24', 'rgba(0,0,0,.6)');
  for (let a = 0; a < 15; a++) iconCircle(g, Math.cos(2.9 - a * 0.19) * 10.4, -15 - Math.sin(2.9 - a * 0.19) * 5.8 + 3.6, 2.6, '#f2ead8', 'rgba(70,60,40,.5)', 0.5);
  iconPath(g, (p) => p.ellipse(0, -13.4, 6, 3.4, 0, 0, 3.1416), '#16301a');
  for (const y of [-6, -1, 4]) iconRect(g, -1.6, y, 3.2, 1.8, '#7a4a22', 'rgba(0,0,0,.5)', 0.7);
  iconLine(g, [0, -10, 0, 18], '#1f3f24', 0.8);
  iconPath(g, (p) => { p.moveTo(-8, 12); p.quadraticCurveTo(-4, 5, -2, 12); p.quadraticCurveTo(-5, 14, -8, 12); }, '#5fa860', 'rgba(0,0,0,.4)', 0.5);
  iconPath(g, (p) => { p.moveTo(8, 8); p.quadraticCurveTo(4, 1, 2, 8); p.quadraticCurveTo(5, 10, 8, 8); }, '#5fa860', 'rgba(0,0,0,.4)', 0.5);
  iconRect(g, -11.5, 17, 23, 3, '#e8dfc4', 'rgba(0,0,0,.4)', 1);
  g.restore();
};

// 4 Wind Shell: light teal shell with flowing wind lines, drawstring hood down
ITEM_ART.archer_armor_4 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#7ac8d0', '#e8fbfc', { len: 27, w: 6.6 });
  iconSl(g, 1, '#7ac8d0', '#e8fbfc', { len: 27, w: 6.6 });
  iconTorso(g, '#7ac8d0', 22, 31, -15, 5);
  iconPath(g, (p) => { p.moveTo(-9, -15); p.quadraticCurveTo(-10, -9, 0, -8); p.quadraticCurveTo(10, -9, 9, -15); p.quadraticCurveTo(0, -19, -9, -15); }, '#5aa8b2', 'rgba(0,0,0,.55)');
  iconLine(g, [-2, -9, -2.4, -3], '#ffffff', 1);
  iconLine(g, [2, -9, 2.4, -3], '#ffffff', 1);
  iconZip(g, 0, -8, 15, '#ffffff');
  g.save();
  g.beginPath();
  g.roundRect(-11, -15, 22, 31, 5);
  g.clip();
  for (const [y, k] of [[-1, 1], [5, 0.8], [11, 1]]) {
    iconPath(g, (p) => { p.moveTo(-10, y); p.bezierCurveTo(-5, y - 4 * k, -1, y + 4 * k, 3, y); p.bezierCurveTo(5, y - 2, 8, y - 1, 10, y - 3); }, null, 'rgba(255,255,255,.75)', 1.1);
  }
  g.restore();
  iconRect(g, -11, 14, 22, 2.6, '#e8fbfc', 'rgba(0,0,0,.4)', 1.2);
  g.restore();
};

// 5 Stormweave Parka: slate parka, gray fur collar, yellow lightning across the chest
ITEM_ART.archer_armor_5 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#3a4a68', '#2a3450', { len: 29, w: 7.4 });
  iconSl(g, 1, '#3a4a68', '#2a3450', { len: 29, w: 7.4 });
  iconTorso(g, '#3a4a68', 23, 35, -15, 3.5);
  iconRect(g, -8, -19.5, 16, 6, '#2a3450', 'rgba(0,0,0,.6)', 3);
  for (let i = -3; i <= 3; i++) iconCircle(g, i * 2.4, -19.6 + Math.abs(i) * 0.4, 2.3, '#b8c0cc', 'rgba(40,50,70,.5)', 0.5);
  iconPath(g, (p) => p.ellipse(0, -13.4, 5.6, 3, 0, 0, 3.1416), '#1c2438');
  g.save();
  g.shadowColor = '#ffe45a';
  g.shadowBlur = 4;
  iconPoly(g, [5, -9, -4, 1, 0, 2, -6, 14, 5, 3, 1, 2.4, 6, -9], '#ffe45a', '#8a6a10', 0.7);
  g.restore();
  iconZip(g, -9, -12, 16, '#b8c0cc');
  iconRect(g, -11.5, 17, 23, 3, '#2a3450', 'rgba(0,0,0,.6)', 1);
  g.restore();
};

// 6 Starlit Trench: navy trench with silver stars, wide lapels and a belt
ITEM_ART.archer_armor_6 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#1c2860', '#8a96c8', { len: 29 });
  iconSl(g, 1, '#1c2860', '#8a96c8', { len: 29 });
  iconPoly(g, [-12, -15, 12, -15, 14, 23, -14, 23], iconVert(g, -15, 23, '#2c3c88', '#0e1438'), 'rgba(0,0,0,.7)');
  iconPoly(g, [-12, -16, -3, -16, 0, -3, -9, -5], '#141c48', 'rgba(0,0,0,.6)');
  iconPoly(g, [12, -16, 3, -16, 0, -3, 9, -5], '#141c48', 'rgba(0,0,0,.6)');
  iconRect(g, -13, 6, 26, 3.4, '#0e1438', 'rgba(140,150,200,.5)', 1);
  iconRect(g, -2.4, 5.6, 4.8, 4.2, '#c8d0f0', 'rgba(0,0,0,.6)', 0.8);
  for (const [x, y, r] of [[-8, 0, 2.2], [7, 2, 1.6], [-5, 14, 1.8], [8, 16, 2.4], [-9, -9, 1.4], [3, 13, 1.2], [10, -8, 1.3]]) iconStar(g, x, y, r * 1.3, r * 0.5, 4, '#e8eeff');
  iconStar(g, 0, -8, 3.2, 1.2, 4, '#fff0a8');
  g.restore();
};

// 7 Windrunner Parka: pale cyan light parka with a swirl and a flowing cyan scarf
ITEM_ART.archer_armor_7 = (g) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#e2f0f2', '#43c8e0', { len: 27, w: 6.8 });
  iconSl(g, 1, '#e2f0f2', '#43c8e0', { len: 27, w: 6.8 });
  iconTorso(g, '#e2f0f2', 22, 30, -15, 5);
  iconPath(g, (p) => { p.moveTo(-6, 4); p.bezierCurveTo(-6, -6, 6, -6, 6, 2); p.bezierCurveTo(6, 8, -2, 8, -2, 3); p.bezierCurveTo(-2, 0, 2, 0, 2, 2); }, null, '#43c8e0', 1.6);
  iconPath(g, (p) => { p.moveTo(-9, -15); p.quadraticCurveTo(0, -9, 9, -15); p.quadraticCurveTo(10, -19, 0, -19); p.quadraticCurveTo(-10, -19, -9, -15); }, '#43c8e0', 'rgba(0,60,80,.6)');
  iconPath(g, (p) => { p.moveTo(6, -14); p.bezierCurveTo(14, -10, 8, 0, 16, 6); p.lineTo(18, 3); p.bezierCurveTo(12, -2, 18, -10, 8, -17); p.closePath(); }, '#43c8e0', 'rgba(0,60,80,.6)');
  iconRect(g, -11, 13, 22, 2.8, '#43c8e0', null, 1);
  g.restore();
};

// 8 Tempest Shell: dark teal armoured shell, rolling wave pattern, tall storm collar
ITEM_ART.archer_armor_8 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#1f4a5a', '#0e2630', { len: 28 });
  iconSl(g, 1, '#1f4a5a', '#0e2630', { len: 28 });
  iconTorso(g, '#1f4a5a', 23, 33, -15, 4);
  g.save();
  g.beginPath();
  g.roundRect(-11.5, -15, 23, 33, 4);
  g.clip();
  g.strokeStyle = 'rgba(120,230,255,.55)';
  g.lineWidth = 0.9;
  for (let y = -7; y < 18; y += 5.4) {
    g.beginPath();
    for (let x = -12; x <= 12; x += 6) {
      g.moveTo(x, y);
      g.arc(x + 3, y, 3, Math.PI, 0);
    }
    g.stroke();
  }
  g.restore();
  iconPoly(g, [-11, -17, -4, -22, 0, -15, 4, -22, 11, -17, 9, -9, 0, -6, -9, -9], '#12303c', 'rgba(0,0,0,.65)');
  iconLine(g, [-6, -17, -3, -11], c, 0.9);
  iconLine(g, [6, -17, 3, -11], c, 0.9);
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 3;
  iconZip(g, 0, -6, 17, c);
  g.restore();
  iconRect(g, -11.5, 15, 23, 3.4, '#0e2630', 'rgba(0,0,0,.6)', 1);
  g.restore();
};

// 9 Skyfall Trenchcoat: sky-blue and gold trench, feather-wing epaulettes, flared white lining
ITEM_ART.archer_armor_9 = (g, c) => {
  g.save();
  g.translate(28, 29);
  iconSl(g, -1, '#5a9ae0', '#e8c35a', { len: 30, x: 11.5 });
  iconSl(g, 1, '#5a9ae0', '#e8c35a', { len: 30, x: 11.5 });
  iconPoly(g, [-12, -15, 12, -15, 15, 25, 0, 21, -15, 25], '#f6f2e4', 'rgba(0,0,0,.5)');
  iconPoly(g, [-12, -15, 12, -15, 13.4, 22, 0, 19, -13.4, 22], iconVert(g, -15, 22, '#7ab4f0', '#3a6ab8'), 'rgba(0,0,0,.65)');
  iconPoly(g, [-12, -16, -3, -16, 0, -4, -9, -6], '#2e5aa0', 'rgba(0,0,0,.6)');
  iconPoly(g, [12, -16, 3, -16, 0, -4, 9, -6], '#2e5aa0', 'rgba(0,0,0,.6)');
  iconButtons(g, [-3.4, 3.4], [-1, 5, 11], 1.1, '#e8c35a');
  iconRect(g, -13, 7.6, 26, 2.6, '#e8c35a', 'rgba(110,80,10,.8)', 1);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    g.save();
    g.translate(s * 9, -15);
    g.rotate(s * (0.5 + i * 0.32));
    iconPath(g, (p) => p.ellipse(0, -6.4 + i * 0.4, 2.2, 6.4 - i * 0.8, 0, 0, 6.28), i % 2 ? '#fff8d8' : '#ffffff', '#c8a23a', 0.6);
    g.restore();
  }
  iconGem(g, 0, -9, 1.9, c);
  g.restore();
};
