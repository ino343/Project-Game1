/* Headgear icons: caps, bandanas, beanies, hoods, masks, helms, crowns, visors, headsets. Origin = head centre. */

function iconBrim(g, x, y, rx, ry, col) {
  iconPath(g, (p) => p.ellipse(x, y, rx, ry, 0, 0, 3.1416), col, 'rgba(0,0,0,.6)');
}

/* ================= WAIF / ASSASSIN ================= */

// 1 Street Cap: grey baseball cap, flat brim, patch
ITEM_ART.waif_head_1 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-15, 5); p.quadraticCurveTo(-16, -17, 0, -17); p.quadraticCurveTo(16, -17, 15, 5); p.closePath(); }, iconVert(g, -17, 5, '#5a5f70', '#2f3240'), 'rgba(0,0,0,.65)');
  for (const a of [-0.9, -0.3, 0.3, 0.9]) iconLine(g, [0, -17, a * 14, 4], 'rgba(0,0,0,.3)', 0.8);
  iconCircle(g, 0, -17.4, 1.6, '#3a3e4c', 'rgba(0,0,0,.6)');
  iconPath(g, (p) => { p.moveTo(-15, 4); p.lineTo(22, 4); p.quadraticCurveTo(24, 9, 16, 10); p.lineTo(-13, 9); p.closePath(); }, '#262a36', 'rgba(0,0,0,.7)');
  iconLine(g, [-12, 6.6, 18, 6.8], 'rgba(255,255,255,.15)', 0.8);
  iconRect(g, -5, -11, 10, 7, '#e07a3a', 'rgba(0,0,0,.5)', 1.5);
  iconLine(g, [-2.6, -5.6, 0, -9.4, 2.6, -5.6], '#fff', 1.1);
  g.restore();
};

// 2 Neon Bandana: magenta paisley bandana tied at the side with fluttering tails
ITEM_ART.waif_head_2 = (g) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-16, 8); p.quadraticCurveTo(-17, -16, 0, -16); p.quadraticCurveTo(17, -16, 16, 8); p.quadraticCurveTo(0, -1, -16, 8); }, iconVert(g, -16, 8, '#ff4ab0', '#b01a78'), 'rgba(0,0,0,.6)');
  g.save();
  g.clip();
  g.fillStyle = 'rgba(255,255,255,.65)';
  for (const [x, y] of [[-8, -6], [0, -10], [8, -6], [-3, -2], [5, 0], [-11, 2]]) {
    iconCircle(g, x, y, 1.5, 'rgba(255,255,255,.7)');
    iconCircle(g, x + 1.5, y + 1.2, 0.8, 'rgba(255,255,255,.7)');
  }
  g.restore();
  iconRect(g, -17, 4, 34, 5, '#d82a94', 'rgba(0,0,0,.6)', 2);
  iconCircle(g, 15, 6.6, 3, '#ff4ab0', 'rgba(0,0,0,.6)');
  iconPoly(g, [15, 6, 24, 1, 25, 8, 17, 9], '#ff4ab0', 'rgba(0,0,0,.6)');
  iconPoly(g, [15, 8, 22, 15, 18, 17, 14, 10], '#d82a94', 'rgba(0,0,0,.6)');
  g.restore();
};

// 3 Shadow Beanie: charcoal knit beanie with a folded cuff and a pompom
ITEM_ART.waif_head_3 = (g, c) => {
  g.save();
  g.translate(28, 31);
  iconPath(g, (p) => { p.moveTo(-14, 2); p.quadraticCurveTo(-15, -16, 0, -17); p.quadraticCurveTo(15, -16, 14, 2); p.closePath(); }, iconVert(g, -17, 2, '#4a4e60', '#2a2c38'), 'rgba(0,0,0,.65)');
  g.strokeStyle = 'rgba(0,0,0,.3)';
  g.lineWidth = 0.8;
  for (let x = -10; x <= 10; x += 4) iconLine(g, [x * 0.9, -15, x * 1.05, 1], 'rgba(0,0,0,.3)', 0.8);
  iconRect(g, -15.4, 1, 30.8, 8, '#1c1e28', 'rgba(0,0,0,.7)', 3);
  for (let x = -12; x <= 12; x += 3.4) iconLine(g, [x, 2, x, 8], 'rgba(255,255,255,.12)', 0.9);
  iconLine(g, [-9, 5, 9, 5], c, 1);
  for (let i = 0; i < 9; i++) iconCircle(g, Math.cos(i * 0.7) * 3.2, -20.4 + Math.sin(i * 0.7) * 3.2, 2.2, '#8a8fa4');
  iconCircle(g, 0, -20.4, 3.6, '#a8adc0');
  g.restore();
};

// 4 Nightmask Hood: black ninja hood with a face-covering mask and slit eyes
ITEM_ART.waif_head_4 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-17, 15); p.quadraticCurveTo(-19, -20, 0, -21); p.quadraticCurveTo(19, -20, 17, 15); p.quadraticCurveTo(8, 11, 0, 12); p.quadraticCurveTo(-8, 11, -17, 15); }, iconVert(g, -21, 15, '#2c2c3c', '#12121a'), 'rgba(0,0,0,.7)');
  iconPath(g, (p) => p.ellipse(0, 0, 10.6, 12.6, 0, 0, 6.28), '#08080e');
  iconPath(g, (p) => { p.moveTo(-10.6, 3); p.quadraticCurveTo(0, 6, 10.6, 3); p.quadraticCurveTo(9, 13, 0, 14); p.quadraticCurveTo(-9, 13, -10.6, 3); }, '#1f1f2c', 'rgba(0,0,0,.6)');
  iconLine(g, [-10.6, 3, 10.6, 3], '#3a3a52', 1);
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 5;
  iconPoly(g, [-8, -4, -2, -2.4, -2.4, 0.4, -7.6, -0.6], c);
  iconPoly(g, [8, -4, 2, -2.4, 2.4, 0.4, 7.6, -0.6], c);
  g.restore();
  iconLine(g, [-3, 8, 3, 8], 'rgba(255,255,255,.1)', 1);
  g.restore();
};

// 5 Phantom Visor: sleek black visor band with a glowing lens and side pods
ITEM_ART.waif_head_5 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-16, 6); p.quadraticCurveTo(-18, -18, 0, -18); p.quadraticCurveTo(18, -18, 16, 6); p.lineTo(11, 6); p.quadraticCurveTo(10, -9, 0, -9); p.quadraticCurveTo(-10, -9, -11, 6); p.closePath(); }, '#262a38', 'rgba(0,0,0,.7)');
  iconPath(g, (p) => { p.moveTo(-18, -4); p.lineTo(18, -4); p.lineTo(16, 5); p.quadraticCurveTo(0, 9, -16, 5); p.closePath(); }, iconVert(g, -4, 8, '#1a1d28', '#0a0c12'), 'rgba(0,0,0,.8)');
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 6;
  iconPath(g, (p) => { p.moveTo(-14, -1.6); p.lineTo(14, -1.6); p.lineTo(12.6, 3); p.quadraticCurveTo(0, 6, -12.6, 3); p.closePath(); }, iconVert(g, -2, 5, c, iconShade(c, -0.4)));
  g.restore();
  iconLine(g, [-12, 0, -2, 0], 'rgba(255,255,255,.7)', 1);
  iconRect(g, -21, -3, 5, 10, '#2c3040', 'rgba(0,0,0,.7)', 2);
  iconRect(g, 16, -3, 5, 10, '#2c3040', 'rgba(0,0,0,.7)', 2);
  g.restore();
};

// 6 Voidveil Headset: black gaming headset with a boom mic and a drifting translucent violet veil
ITEM_ART.waif_head_6 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-14, -9); p.quadraticCurveTo(-19, 8, -13, 16); p.quadraticCurveTo(-8, 22, -4, 15); p.quadraticCurveTo(0, 22, 4, 15); p.quadraticCurveTo(8, 22, 13, 16); p.quadraticCurveTo(19, 8, 14, -9); p.closePath(); }, iconVert(g, -9, 20, 'rgba(150,90,255,.85)', 'rgba(90,40,200,.35)'), 'rgba(190,150,255,.8)', 0.9);
  for (const [x, y] of [[-8, 4], [6, 8], [0, -2], [10, -3]]) iconStar(g, x, y, 1.8, 0.7, 4, 'rgba(255,255,255,.85)');
  iconPath(g, (p) => { p.moveTo(-15, 4); p.quadraticCurveTo(-16, -19, 0, -19); p.quadraticCurveTo(16, -19, 15, 4); }, null, '#14121c', 4.4);
  iconPath(g, (p) => { p.moveTo(-15, 4); p.quadraticCurveTo(-16, -19, 0, -19); p.quadraticCurveTo(16, -19, 15, 4); }, null, '#4a4660', 2.2);
  for (const s of [-1, 1]) {
    iconRect(g, s * 15 - 5, -4, 10, 15, iconVert(g, -4, 11, '#2c2a3a', '#14121c'), 'rgba(0,0,0,.75)', 4);
    g.save();
    g.shadowColor = c;
    g.shadowBlur = 5;
    iconCircle(g, s * 15, 3.5, 2.6, null, c, 1.3);
    g.restore();
  }
  iconPath(g, (p) => { p.moveTo(-15, 11); p.quadraticCurveTo(-14, 19, -4, 18); }, null, '#4a4660', 1.4);
  iconCircle(g, -3, 18, 2.2, '#14121c', c, 1);
  g.restore();
};

// 7 Nightstalker Mask: half-face assassin mask with pointed ears and violet eyes
ITEM_ART.waif_head_7 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPoly(g, [-13, -6, -18, -20, -7, -13], '#1c1830', 'rgba(0,0,0,.7)');
  iconPoly(g, [13, -6, 18, -20, 7, -13], '#1c1830', 'rgba(0,0,0,.7)');
  iconPath(g, (p) => { p.moveTo(-15, -8); p.quadraticCurveTo(0, -17, 15, -8); p.quadraticCurveTo(17, 6, 7, 16); p.quadraticCurveTo(0, 19, -7, 16); p.quadraticCurveTo(-17, 6, -15, -8); }, iconVert(g, -17, 19, '#34285a', '#14102a'), 'rgba(0,0,0,.75)');
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 6;
  iconPoly(g, [-12, -3, -3, -1, -4, 4, -11, 3], '#0a0614', c, 1.1);
  iconPoly(g, [12, -3, 3, -1, 4, 4, 11, 3], '#0a0614', c, 1.1);
  iconPoly(g, [-9.4, -0.6, -4.8, 0, -5.2, 2.4, -8.8, 1.6], c);
  iconPoly(g, [9.4, -0.6, 4.8, 0, 5.2, 2.4, 8.8, 1.6], c);
  g.restore();
  iconLine(g, [0, -14, 0, -4], c, 1);
  iconLine(g, [-5, 11, 0, 8, 5, 11], 'rgba(255,255,255,.25)', 1);
  iconLine(g, [-9, 8, -4, 13], 'rgba(255,255,255,.2)', 0.8);
  iconLine(g, [9, 8, 4, 13], 'rgba(255,255,255,.2)', 0.8);
  g.restore();
};

// 8 Eclipse Hood: deep hooded cloak with a crescent clasp and a glowing eclipse in the shadow
ITEM_ART.waif_head_8 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-18, 16); p.quadraticCurveTo(-20, -18, 0, -21); p.quadraticCurveTo(20, -18, 18, 16); p.lineTo(10, 12); p.lineTo(0, 17); p.lineTo(-10, 12); p.closePath(); }, iconVert(g, -21, 17, '#25405a', '#0e1c2a'), 'rgba(0,0,0,.7)');
  iconPath(g, (p) => { p.moveTo(-11, 10); p.quadraticCurveTo(-13, -12, 0, -13); p.quadraticCurveTo(13, -12, 11, 10); p.quadraticCurveTo(0, 5, -11, 10); }, '#05080d');
  g.save();
  g.shadowColor = '#ffe9b0';
  g.shadowBlur = 6;
  iconCircle(g, 0, -2, 5, '#05080d', '#ffe9b0', 1.3);
  g.restore();
  iconRect(g, -12, 11, 24, 3, '#1a3046', 'rgba(0,0,0,.6)', 1.5);
  iconPath(g, (p) => { p.arc(0, 17, 4.4, Math.PI * 0.1, Math.PI * 0.9, true); p.arc(0, 15.6, 3.2, Math.PI * 0.9, Math.PI * 0.1, false); }, '#e8e4d0');
  iconPath(g, (p) => { p.arc(-9, -12, 3.4, 3.4, 5.9, false); }, null, c, 1);
  g.restore();
};

// 9 Oblivion Visor: ghostly pale visor with a halo of floating shards
ITEM_ART.waif_head_9 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconGlow(g, 0, 0, 24, '#c8b8ff', 0.4);
  iconPath(g, (p) => p.ellipse(0, -10, 14, 3.6, 0, 0, 6.28), null, 'rgba(255,240,170,.9)', 1.5);
  for (const [x, y, r] of [[-17, -16, 3], [17, -14, 2.6], [-20, -3, 2], [20, -1, 2.2], [-12, -22, 1.8], [11, -22, 2]]) iconPoly(g, [x, y - r * 1.5, x + r, y, x, y + r * 1.5, x - r, y], '#e8e0ff', '#8f84c8', 0.6);
  iconPath(g, (p) => { p.moveTo(-14, 7); p.quadraticCurveTo(-16, -14, 0, -14); p.quadraticCurveTo(16, -14, 14, 7); p.lineTo(10, 7); p.quadraticCurveTo(9, -7, 0, -7); p.quadraticCurveTo(-9, -7, -10, 7); p.closePath(); }, '#d8d0f4', '#6a5aa0');
  iconPath(g, (p) => { p.moveTo(-15, -3); p.lineTo(15, -3); p.lineTo(13, 7); p.quadraticCurveTo(0, 11, -13, 7); p.closePath(); }, iconVert(g, -3, 10, 'rgba(60,40,120,.95)', 'rgba(20,10,50,.95)'), '#6a5aa0');
  g.save();
  g.shadowColor = '#fff08a';
  g.shadowBlur = 6;
  iconPoly(g, [-10, 0, -2, 0, -3, 3, -9, 3], '#fff08a');
  iconPoly(g, [10, 0, 2, 0, 3, 3, 9, 3], '#fff08a');
  g.restore();
  g.restore();
};

/* ================= SWORDSMAN / KNIGHT ================= */

// 1 Sports Headband: red headband with knotted tails and a white stripe
ITEM_ART.swordsman_head_1 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-17, -4); p.quadraticCurveTo(0, -10, 17, -4); p.lineTo(17, 5); p.quadraticCurveTo(0, -1, -17, 5); p.closePath(); }, iconVert(g, -8, 5, '#e85a48', '#b02a1c'), 'rgba(0,0,0,.65)');
  iconPath(g, (p) => { p.moveTo(-16, -0.4); p.quadraticCurveTo(0, -6, 16, -0.4); }, null, '#ffffff', 1.8);
  iconCircle(g, 17, 0, 3.4, '#c83a2a', 'rgba(0,0,0,.65)');
  iconPoly(g, [18, -1, 27, -8, 28, 0, 20, 3], '#e85a48', 'rgba(0,0,0,.65)');
  iconPoly(g, [18, 2, 26, 11, 22, 14, 17, 5], '#b02a1c', 'rgba(0,0,0,.65)');
  iconLine(g, [-12, 3, -8, 2], 'rgba(255,255,255,.3)', 1);
  g.restore();
};

// 2 Steel Snapback: navy flat-brim snapback with a steel plate and strap
ITEM_ART.swordsman_head_2 = (g) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-15, 5); p.quadraticCurveTo(-15, -17, 0, -17); p.quadraticCurveTo(15, -17, 15, 5); p.closePath(); }, iconVert(g, -17, 5, '#3a4a78', '#1c2644'), 'rgba(0,0,0,.65)');
  iconRect(g, -15, 3, 30, 3.4, '#8a94a8', 'rgba(0,0,0,.6)', 1);
  iconPath(g, (p) => { p.moveTo(-16, 4); p.lineTo(-24, 5.4); p.lineTo(-22, 11); p.lineTo(-14, 9); p.closePath(); }, '#1c2644', 'rgba(0,0,0,.7)');
  iconPath(g, (p) => { p.moveTo(-14, 5); p.lineTo(23, 5); p.quadraticCurveTo(26, 11, 16, 11); p.lineTo(-12, 10); p.closePath(); }, '#141c38', 'rgba(0,0,0,.7)');
  iconLine(g, [-10, 8, 18, 8.4], 'rgba(255,255,255,.15)', 0.8);
  iconPoly(g, [-6, -12, 6, -12, 8, -2, 0, 1, -8, -2], iconSteel(g, -8, 8, '#cfd6e0'), '#4a5568');
  iconStar(g, 0, -6, 3.2, 1.3, 5, '#e8c35a');
  g.restore();
};

// 3 Knight Beret: tilted blue beret with a gold badge and a feather
ITEM_ART.swordsman_head_3 = (g, c) => {
  g.save();
  g.translate(28, 31);
  g.rotate(-0.12);
  iconPath(g, (p) => { p.moveTo(-18, 4); p.bezierCurveTo(-22, -12, -6, -18, 8, -15); p.bezierCurveTo(20, -13, 22, -2, 16, 5); p.quadraticCurveTo(0, 9, -18, 4); }, iconVert(g, -17, 8, '#3a5ab8', '#1c2c68'), 'rgba(0,0,0,.65)');
  iconPath(g, (p) => { p.moveTo(-16, 3); p.quadraticCurveTo(0, 8, 15, 4); p.lineTo(15, 8); p.quadraticCurveTo(0, 12, -16, 7); p.closePath(); }, '#141c48', 'rgba(0,0,0,.7)');
  iconCircle(g, 2, -16, 1.8, '#1c2c68', 'rgba(0,0,0,.6)');
  iconPoly(g, [-11, -2, -5, -4, -2, 2, -8, 5], '#e8c35a', 'rgba(110,80,10,.8)');
  iconGem(g, -6.4, 0, 1.6, c);
  iconPath(g, (p) => { p.moveTo(-8, -2); p.bezierCurveTo(-10, -16, 2, -26, 14, -24); p.bezierCurveTo(8, -20, 4, -12, -5, -3); }, '#f4f0e8', 'rgba(0,0,0,.55)', 0.8);
  iconLine(g, [-7, -3, 11, -22], 'rgba(0,0,0,.35)', 0.7);
  g.restore();
};

// 4 Crested Visor: steel knight helm with a raised visor slit and a red plume crest
ITEM_ART.swordsman_head_4 = (g, c) => {
  g.save();
  g.translate(28, 31);
  iconPath(g, (p) => { p.moveTo(-3, -17); p.bezierCurveTo(-8, -28, 8, -30, 14, -20); p.bezierCurveTo(8, -22, 6, -18, 4, -17); p.closePath(); }, '#c9302a', 'rgba(70,10,10,.8)');
  iconPath(g, (p) => { p.moveTo(-15, 14); p.lineTo(-15, -4); p.quadraticCurveTo(-15, -18, 0, -18); p.quadraticCurveTo(15, -18, 15, -4); p.lineTo(15, 14); p.lineTo(8, 14); p.lineTo(8, 8); p.lineTo(-8, 8); p.lineTo(-8, 14); p.closePath(); }, iconSteel(g, -15, 15, '#b8c2d0'), 'rgba(0,0,0,.7)');
  iconRect(g, -13, -5, 26, 4, '#06080c', 'rgba(0,0,0,.8)', 1.4);
  iconLine(g, [-11, -3, 11, -3], 'rgba(255,255,255,.12)', 0.8);
  iconRect(g, -2, -14, 4, 22, '#8a94a8', 'rgba(0,0,0,.6)', 1);
  for (const y of [2, 5]) iconLine(g, [-6, y, 6, y], 'rgba(0,0,0,.45)', 0.9);
  iconGem(g, 0, -10, 2.4, c);
  g.restore();
};

// 5 Dragon Headset: horned dragon helm with cup-style headset ear guards and a mic
ITEM_ART.swordsman_head_5 = (g, c) => {
  g.save();
  g.translate(28, 30);
  for (const s of [-1, 1]) iconPath(g, (p) => { p.moveTo(s * 7, -13); p.quadraticCurveTo(s * 15, -16, s * 17, -27); p.quadraticCurveTo(s * 11, -20, s * 4, -16); p.closePath(); }, iconSteel(g, -17, 17, '#e8d8a8'), '#5a4818');
  iconPath(g, (p) => { p.moveTo(-14, 10); p.lineTo(-14, -3); p.quadraticCurveTo(-14, -17, 0, -17); p.quadraticCurveTo(14, -17, 14, -3); p.lineTo(14, 10); p.quadraticCurveTo(0, 4, -14, 10); }, iconVert(g, -17, 10, '#7a3a22', '#3a1a10'), 'rgba(0,0,0,.7)');
  g.strokeStyle = 'rgba(0,0,0,.3)';
  for (let r = 0; r < 3; r++) for (let q = -2; q <= 2; q++) {
    g.beginPath();
    g.arc(q * 5.2 + (r % 2 ? 2.6 : 0), -11 + r * 5, 2.6, 0.1, 3.04);
    g.stroke();
  }
  iconPoly(g, [-4, -18, 0, -23, 4, -18], '#e8d8a8', '#5a4818', 0.8);
  for (const s of [-1, 1]) {
    iconRect(g, s * 15 - 5, -3, 10, 14, iconVert(g, -3, 11, '#4a4e5c', '#22242c'), 'rgba(0,0,0,.75)', 4);
    iconCircle(g, s * 15, 4, 2.6, '#1a1c24', c, 1.2);
  }
  iconPath(g, (p) => { p.moveTo(-15, 11); p.quadraticCurveTo(-12, 19, -3, 17); }, null, '#4a4e5c', 1.4);
  iconCircle(g, -3, 17, 2, '#1a1c24', c, 1);
  g.restore();
};

// 6 Crown of Dawn: golden crown whose tips are sun rays, with a rising-sun gem
ITEM_ART.swordsman_head_6 = (g, c) => {
  g.save();
  g.translate(28, 31);
  iconGlow(g, 0, -4, 22, '#ffd27a', 0.5);
  iconPath(g, (p) => { p.moveTo(-17, 9); p.lineTo(-18, -9); p.lineTo(-10, -2); p.lineTo(-9, -17); p.lineTo(-3, -5); p.lineTo(0, -21); p.lineTo(3, -5); p.lineTo(9, -17); p.lineTo(10, -2); p.lineTo(18, -9); p.lineTo(17, 9); p.closePath(); }, iconSteel(g, -18, 18, '#ffd96a'), '#7a5410');
  iconRect(g, -17, 4, 34, 5.4, '#e8b83a', '#7a5410', 1.5);
  for (const [x, y] of [[-18, -10], [-9, -18], [0, -22], [9, -18], [18, -10]]) iconCircle(g, x, y, 1.6, '#fff8d0', '#7a5410', 0.6);
  iconPath(g, (p) => { p.arc(0, 4, 6, Math.PI, 0); p.closePath(); }, '#ff8a2a', '#7a5410', 0.9);
  for (let i = 0; i < 5; i++) iconLine(g, [Math.cos(Math.PI + i * 0.785) * 7, 4 + Math.sin(Math.PI + i * 0.785) * 7, Math.cos(Math.PI + i * 0.785) * 10, 4 + Math.sin(Math.PI + i * 0.785) * 10], '#fff0a8', 1);
  iconGem(g, -12, 6.6, 1.4, '#ff4a6a');
  iconGem(g, 12, 6.6, 1.4, '#ff4a6a');
  g.restore();
};

// 7 Crusader Visor: white great helm with a cross-shaped visor slit and a gold band
ITEM_ART.swordsman_head_7 = (g) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-14, 16); p.lineTo(-15, -4); p.quadraticCurveTo(-15, -19, 0, -19); p.quadraticCurveTo(15, -19, 15, -4); p.lineTo(14, 16); p.closePath(); }, iconSteel(g, -15, 15, '#e8ebf2'), 'rgba(0,0,0,.7)');
  iconRect(g, -15, -4, 30, 3, '#e8c35a', 'rgba(110,80,10,.8)', 1);
  iconRect(g, -15, 8, 30, 3, '#e8c35a', 'rgba(110,80,10,.8)', 1);
  iconRect(g, -1.6, -14, 3.2, 18, '#06080c', null, 0.8);
  iconRect(g, -9, -10, 18, 3.2, '#06080c', null, 0.8);
  iconRect(g, -1.6, -14, 3.2, 18, '#06080c', 'rgba(0,0,0,.8)', 0.8);
  for (let y = 2; y < 16; y += 3) for (const x of [-9, -5, 5, 9]) iconCircle(g, x, y, 0.7, '#2a2e38');
  iconRect(g, -2, -20, 4, 5, '#c9302a', 'rgba(70,10,10,.8)', 1);
  g.restore();
};

// 8 Seraphic Crown: slim golden circlet with small feathered wings and a floating halo
ITEM_ART.swordsman_head_8 = (g, c) => {
  g.save();
  g.translate(28, 32);
  iconGlow(g, 0, -8, 22, '#fff6d0', 0.55);
  iconPath(g, (p) => p.ellipse(0, -17, 11, 3, 0, 0, 6.28), null, '#ffe9a0', 2);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    g.save();
    g.translate(s * 12, -1);
    g.rotate(s * (0.7 + i * 0.32));
    iconPath(g, (p) => p.ellipse(0, -(7 - i * 0.4), 2.6, 7.4 - i * 0.7, 0, 0, 6.28), i % 2 ? '#ffffff' : '#f2f6ff', '#9fb0d0', 0.7);
    g.restore();
  }
  iconPath(g, (p) => { p.moveTo(-13, 6); p.quadraticCurveTo(0, 12, 13, 6); p.lineTo(13, 1); p.quadraticCurveTo(0, 7, -13, 1); p.closePath(); }, iconSteel(g, -13, 13, '#ffe9a0'), '#7a5a14');
  iconPoly(g, [0, -9, 3, -2, 0, 5, -3, -2], '#fff', '#b8a06a', 0.7);
  iconGem(g, 0, -2, 2.4, c);
  iconPoly(g, [-8, 1, -6, -4, -4, 2], '#ffe9a0', '#7a5a14', 0.6);
  iconPoly(g, [8, 1, 6, -4, 4, 2], '#ffe9a0', '#7a5a14', 0.6);
  g.restore();
};

// 9 Sovereign Crown: grand royal crown - five jewelled points, velvet cap, ermine band
ITEM_ART.swordsman_head_9 = (g) => {
  g.save();
  g.translate(28, 31);
  iconPath(g, (p) => { p.moveTo(-14, 5); p.quadraticCurveTo(-15, -12, 0, -13); p.quadraticCurveTo(15, -12, 14, 5); p.closePath(); }, iconVert(g, -13, 5, '#b02a48', '#5a0e22'), 'rgba(0,0,0,.65)');
  iconPath(g, (p) => { p.moveTo(-18, 10); p.lineTo(-19, -9); p.lineTo(-11, -2); p.lineTo(-9.4, -18); p.lineTo(-3.6, -4); p.lineTo(0, -22); p.lineTo(3.6, -4); p.lineTo(9.4, -18); p.lineTo(11, -2); p.lineTo(19, -9); p.lineTo(18, 10); p.closePath(); }, iconSteel(g, -19, 19, '#e8c35a'), '#7a5a14');
  iconPath(g, (p) => p.roundRect(-18.6, 5.4, 37.2, 6.4, 3), '#f6f4f0', 'rgba(70,60,50,.7)');
  for (const x of [-12, -4, 4, 12]) iconLine(g, [x, 7, x, 10], '#1a1a22', 1.2);
  for (const [x, y, r] of [[-19, -10, 1.8], [-9.4, -19, 1.8], [0, -23, 2.2], [9.4, -19, 1.8], [19, -10, 1.8]]) iconCircle(g, x, y, r, '#fff8d0', '#7a5a14', 0.6);
  iconGem(g, 0, -4, 3.2, '#ff3a5a');
  iconGem(g, -9.4, 1, 1.8, '#4aa8ff');
  iconGem(g, 9.4, 1, 1.8, '#4aa8ff');
  g.restore();
};

/* ================= ARCHER / RANGER ================= */

// 1 Feather Cap: green hunter cap with a curled brim and a long feather
ITEM_ART.archer_head_1 = (g, c) => {
  g.save();
  g.translate(28, 31);
  iconPath(g, (p) => { p.moveTo(-15, 5); p.quadraticCurveTo(-16, -15, 0, -15); p.quadraticCurveTo(16, -15, 15, 5); p.closePath(); }, iconVert(g, -15, 5, '#6a8a44', '#3a5026'), 'rgba(0,0,0,.65)');
  iconBrim(g, 4, 5, 23, 5.6, '#3d4b28');
  iconLine(g, [-14, 4, 14, 4], '#2a3a1c', 2);
  iconPath(g, (p) => { p.moveTo(7, -4); p.bezierCurveTo(16, -22, 22, -20, 26, -12); p.bezierCurveTo(20, -14, 14, -8, 9, -2); p.closePath(); }, '#e8e0c8', 'rgba(0,0,0,.55)', 0.8);
  iconPath(g, (p) => { p.moveTo(8, -3); p.bezierCurveTo(16, -18, 22, -18, 25, -12); }, null, c, 1.2);
  iconLine(g, [-3, -4, 9, -3], '#8a3a22', 1.6);
  g.restore();
};

// 2 Ranger Bucket Hat: wide-brimmed tan bucket hat with a braided cord and a small pin
ITEM_ART.archer_head_2 = (g) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.ellipse(0, 6, 25, 7, 0, 0, 6.28); }, iconVert(g, -1, 13, '#c8aa6a', '#8a6e3a'), 'rgba(0,0,0,.65)');
  iconPath(g, (p) => { p.moveTo(-13, 6); p.lineTo(-11, -12); p.quadraticCurveTo(0, -16, 11, -12); p.lineTo(13, 6); p.quadraticCurveTo(0, 10, -13, 6); }, iconVert(g, -16, 8, '#dcc48a', '#a68a4c'), 'rgba(0,0,0,.65)');
  iconPath(g, (p) => { p.moveTo(-13, 3); p.quadraticCurveTo(0, 8, 13, 3); p.lineTo(13, 6); p.quadraticCurveTo(0, 10, -13, 6); p.closePath(); }, '#5a3a22', 'rgba(0,0,0,.6)');
  for (let x = -10; x <= 10; x += 3) iconLine(g, [x, 4.6 + Math.abs(x) * 0.02, x + 1, 7], 'rgba(255,255,255,.25)', 0.8);
  iconPath(g, (p) => { p.moveTo(-14, -9); p.quadraticCurveTo(0, -14, 14, -9); }, null, 'rgba(0,0,0,.22)', 0.8);
  iconPoly(g, [8, 5, 13, 0, 14, 4], '#4fa86a', 'rgba(0,0,0,.5)', 0.7);
  iconLine(g, [-5, -3, -3, -9], 'rgba(0,0,0,.2)', 1);
  g.restore();
};

// 3 Scout Goggles: leather strap with two big brass-rimmed lenses
ITEM_ART.archer_head_3 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconRect(g, -21, -5, 42, 8, '#5a4028', 'rgba(0,0,0,.7)', 3);
  for (let x = -19; x < 19; x += 4) iconLine(g, [x, -4, x, 2], 'rgba(0,0,0,.2)', 0.8);
  iconRect(g, -3, -2, 6, 3, '#caa44a', 'rgba(0,0,0,.6)', 1);
  for (const s of [-1, 1]) {
    iconCircle(g, s * 10, -1, 9.2, iconSteel(g, s * 10 - 9, s * 10 + 9, '#caa44a'), 'rgba(0,0,0,.75)');
    iconCircle(g, s * 10, -1, 6.6, '#1a1410');
    iconCircle(g, s * 10, -1, 5.8, iconAlpha('#4aa8ff', 0.9));
    iconGlow(g, s * 10, -1, 6, c, 0.5);
    iconRect(g, s * 10 - 3.4, -4.4, 3, 1.8, 'rgba(255,255,255,.7)', null, 0.9);
    iconCircle(g, s * 10 + 2, 2, 0.9, 'rgba(255,255,255,.5)');
    for (let i = 0; i < 6; i++) iconCircle(g, s * 10 + Math.cos(i * 1.047) * 8.1, -1 + Math.sin(i * 1.047) * 8.1, 0.7, '#7a5a14');
  }
  g.restore();
};

// 4 Wind Beanie: teal knit beanie with ear flaps, braided ties and a swirl motif
ITEM_ART.archer_head_4 = (g) => {
  g.save();
  g.translate(28, 29);
  for (const s of [-1, 1]) {
    iconPath(g, (p) => { p.moveTo(s * 13, 2); p.lineTo(s * 17, 10); p.quadraticCurveTo(s * 15, 17, s * 11, 14); p.lineTo(s * 9, 4); p.closePath(); }, '#2e8a98', 'rgba(0,0,0,.65)');
    iconLine(g, [s * 13.4, 15, s * 13.8, 21], '#e8fbfc', 1.4);
    iconCircle(g, s * 13.8, 22.4, 1.8, '#e8fbfc', 'rgba(0,0,0,.5)', 0.6);
  }
  iconPath(g, (p) => { p.moveTo(-14, 3); p.quadraticCurveTo(-15, -15, 0, -16); p.quadraticCurveTo(15, -15, 14, 3); p.closePath(); }, iconVert(g, -16, 3, '#5ac8d4', '#2a8a98'), 'rgba(0,0,0,.65)');
  iconRect(g, -15, 0, 30, 6, '#e8fbfc', 'rgba(0,0,0,.6)', 3);
  for (let x = -12; x <= 12; x += 3.4) iconLine(g, [x, 1, x, 5], 'rgba(0,0,0,.15)', 0.9);
  iconPath(g, (p) => { p.moveTo(-6, -2); p.bezierCurveTo(-6, -11, 6, -11, 6, -4); p.bezierCurveTo(6, 0, 0, 0, 0, -4); }, null, '#ffffff', 1.3);
  iconCircle(g, 0, -17, 3.4, '#e8fbfc', 'rgba(0,0,0,.5)');
  g.restore();
};

// 5 Storm Visor: dark aviator helmet cap with a yellow lightning stripe and a pushed-up lens
ITEM_ART.archer_head_5 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-16, 8); p.lineTo(-16, -4); p.quadraticCurveTo(-16, -19, 0, -19); p.quadraticCurveTo(16, -19, 16, -4); p.lineTo(16, 8); p.lineTo(10, 8); p.lineTo(10, 2); p.lineTo(-10, 2); p.lineTo(-10, 8); p.closePath(); }, iconVert(g, -19, 8, '#4a5870', '#222a3a'), 'rgba(0,0,0,.7)');
  iconPoly(g, [3, -19, -3, -9, 0, -8, -4, 2, 5, -9, 1.6, -10, 6, -19], '#ffe45a', '#8a6a10', 0.7);
  for (const s of [-1, 1]) iconRect(g, s * 16 - 3, -2, 6, 12, '#2a3244', 'rgba(0,0,0,.7)', 2);
  iconRect(g, -17, -5, 34, 6, '#1a2030', 'rgba(0,0,0,.8)', 3);
  g.save();
  g.shadowColor = c;
  g.shadowBlur = 5;
  iconRect(g, -14, -3.6, 28, 3.2, iconAlpha(c, 0.95), null, 1.4);
  g.restore();
  iconRect(g, -12, -3.2, 8, 1, 'rgba(255,255,255,.7)', null, 0.5);
  g.restore();
};

// 6 Star Tiara: slender silver tiara with a centre star and tiny star spikes
ITEM_ART.archer_head_6 = (g, c) => {
  g.save();
  g.translate(28, 32);
  iconGlow(g, 0, -4, 22, '#c8d8ff', 0.5);
  iconPath(g, (p) => { p.moveTo(-18, 6); p.quadraticCurveTo(-18, -6, -9, -8); p.lineTo(-6, -12); p.lineTo(-3, -8); p.lineTo(0, -16); p.lineTo(3, -8); p.lineTo(6, -12); p.lineTo(9, -8); p.quadraticCurveTo(18, -6, 18, 6); p.lineTo(14, 6); p.quadraticCurveTo(14, -1, 0, -1); p.quadraticCurveTo(-14, -1, -14, 6); p.closePath(); }, iconSteel(g, -18, 18, '#e4ecf8'), '#5a6a88');
  iconStar(g, 0, -10, 7.4, 3, 5, '#fff6c0', '#b8922a');
  iconGem(g, 0, -4, 0.1, c);
  iconStar(g, -12, -2, 3, 1.2, 4, '#ffffff', '#7a8aa8');
  iconStar(g, 12, -2, 3, 1.2, 4, '#ffffff', '#7a8aa8');
  iconCircle(g, -16, 5, 1.2, '#c8d8ff');
  iconCircle(g, 16, 5, 1.2, '#c8d8ff');
  iconStar(g, 0, -20, 2.4, 0.9, 4, '#fff6c0');
  g.restore();
};

// 7 Windrunner Cap: brown leather aviator cap with ear flaps, goggles on the brow and a wing badge
ITEM_ART.archer_head_7 = (g, c) => {
  g.save();
  g.translate(28, 30);
  for (const s of [-1, 1]) {
    iconPath(g, (p) => { p.moveTo(s * 11, 0); p.lineTo(s * 18, 2); p.quadraticCurveTo(s * 20, 14, s * 14, 15); p.lineTo(s * 9, 12); p.closePath(); }, iconVert(g, 0, 15, '#b07a46', '#6a4422'), 'rgba(0,0,0,.7)');
    iconLine(g, [s * 14, 13, s * 15, 19], '#3a2410', 1.4);
    iconLine(g, [s * 15, 3, s * 12, 11], 'rgba(255,255,255,.18)', 0.8);
  }
  iconPath(g, (p) => { p.moveTo(-14, 5); p.quadraticCurveTo(-16, -18, 0, -18); p.quadraticCurveTo(16, -18, 14, 5); p.quadraticCurveTo(0, 8, -14, 5); }, iconVert(g, -18, 6, '#b88050', '#7a4c26'), 'rgba(0,0,0,.7)');
  iconLine(g, [0, -18, 0, 5], 'rgba(0,0,0,.28)', 1);
  iconLine(g, [-7, -16, -9, 4], 'rgba(0,0,0,.2)', 0.9);
  iconLine(g, [7, -16, 9, 4], 'rgba(0,0,0,.2)', 0.9);
  iconRect(g, -15, -6, 30, 4.6, '#3a2410', 'rgba(0,0,0,.7)', 2);
  for (const s of [-1, 1]) {
    iconCircle(g, s * 7.2, -3.6, 5.6, iconSteel(g, s * 7.2 - 5, s * 7.2 + 5, '#caa44a'), 'rgba(0,0,0,.75)');
    iconCircle(g, s * 7.2, -3.6, 3.8, iconAlpha('#8ad0ff', 0.95));
    iconRect(g, s * 7.2 - 2.2, -5.8, 2.2, 1.2, 'rgba(255,255,255,.85)', null, 0.5);
  }
  iconCircle(g, 0, -3.6, 1.2, '#caa44a');
  for (const s of [-1, 1]) iconPoly(g, [s * 1.6, -12, s * 8, -15, s * 6.4, -12.6, s * 8, -10.4, s * 2.4, -9.6], '#efe8d0', 'rgba(0,0,0,.55)', 0.6);
  iconGem(g, 0, -11.6, 1.5, c);
  g.restore();
};

// 8 Tempest Headset: steel tactical headset with a storm-wave antenna and cyan ear lights
ITEM_ART.archer_head_8 = (g, c) => {
  g.save();
  g.translate(28, 30);
  iconPath(g, (p) => { p.moveTo(-15, 4); p.quadraticCurveTo(-16, -19, 0, -19); p.quadraticCurveTo(16, -19, 15, 4); }, null, '#10202a', 5);
  iconPath(g, (p) => { p.moveTo(-15, 4); p.quadraticCurveTo(-16, -19, 0, -19); p.quadraticCurveTo(16, -19, 15, 4); }, null, '#6a8a9a', 2.8);
  iconRect(g, -6, -22, 12, 4, '#2a4a5a', 'rgba(0,0,0,.7)', 1.5);
  for (const s of [-1, 1]) {
    iconRect(g, s * 15 - 5.4, -4, 10.8, 16, iconVert(g, -4, 12, '#3a5a6c', '#162a36'), 'rgba(0,0,0,.75)', 4);
    g.save();
    g.shadowColor = c;
    g.shadowBlur = 5;
    iconPath(g, (p) => { p.moveTo(s * 15 - 3, 4); p.bezierCurveTo(s * 15 - 2, 0, s * 15, 8, s * 15 + 3, 4); }, null, c, 1.4);
    g.restore();
  }
  iconLine(g, [13, -2, 14, -12], '#6a8a9a', 1.6);
  for (let i = 0; i < 3; i++) iconPath(g, (p) => p.arc(14, -13, 2.6 + i * 2.2, -2.5, -0.65), null, iconAlpha(c, 0.9 - i * 0.25), 1);
  iconPath(g, (p) => { p.moveTo(-15, 12); p.quadraticCurveTo(-13, 20, -3, 18); }, null, '#6a8a9a', 1.5);
  iconCircle(g, -3, 18, 2.2, '#10202a', c, 1);
  g.restore();
};

// 9 Skyfall Diadem: golden diadem with a falling-star gem and a pair of feathered wings
ITEM_ART.archer_head_9 = (g, c) => {
  g.save();
  g.translate(28, 32);
  iconGlow(g, 0, -4, 22, '#fff08a', 0.5);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    g.save();
    g.translate(s * 13, 0);
    g.rotate(s * (0.55 + i * 0.3));
    iconPath(g, (p) => p.ellipse(0, -(7 + (3 - i)), 2.4, 7 + (3 - i), 0, 0, 6.28), i % 2 ? '#fff6c0' : '#ffffff', '#c8a23a', 0.6);
    g.restore();
  }
  iconPath(g, (p) => { p.moveTo(-15, 5); p.quadraticCurveTo(-15, -5, -6, -7); p.lineTo(0, -13); p.lineTo(6, -7); p.quadraticCurveTo(15, -5, 15, 5); p.lineTo(11, 5); p.quadraticCurveTo(11, -1, 0, -1); p.quadraticCurveTo(-11, -1, -11, 5); p.closePath(); }, iconSteel(g, -15, 15, '#f2d56a'), '#7a5a14');
  iconStar(g, 0, -3, 6, 2.4, 4, '#fff8d0', '#b8922a');
  iconLine(g, [-4, -10, -13, -16], 'rgba(255,240,160,.9)', 1.4);
  iconLine(g, [-6, -8, -17, -11], 'rgba(255,240,160,.6)', 1);
  iconGem(g, 0, -3, 0.1, c);
  g.restore();
};
