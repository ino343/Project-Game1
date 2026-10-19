/* Necklace icons: each has its own chain style and its own pendant shape. */

// chain from the two top corners down to the pendant at (0, ey)
function iconChain(g, style, ey, col) {
  const build = (p) => { p.moveTo(-19, -9); p.quadraticCurveTo(-15, ey + 2, 0, ey); p.quadraticCurveTo(15, ey + 2, 19, -9); };
  const pt = (t, side) => {
    // point on the left (side -1) or right (+1) half at parameter t (0 = top, 1 = pendant)
    const x0 = side * 19, y0 = -9, cx = side * 15, cy = ey + 2, x1 = 0, y1 = ey;
    const u = 1 - t;
    return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
  };
  if (style === 'ball') {
    for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.07) { const [x, y] = pt(t, s); iconBall(g, x, y, 1.15, '#c9ced4'); }
  } else if (style === 'link') {
    iconPath(g, build, null, '#5a6270', 2.6);
    iconPath(g, build, null, '#e4eaf2', 1.5);
    g.setLineDash([1.6, 1.4]);
    iconPath(g, build, null, '#8a94a4', 1.5);
    g.setLineDash([]);
  } else if (style === 'gold') {
    iconPath(g, build, null, '#6e5010', 2.8);
    iconPath(g, build, null, '#e8c35a', 1.8);
    g.setLineDash([2.4, 1]);
    iconPath(g, build, null, '#fff0a8', 0.8);
    g.setLineDash([]);
  } else if (style === 'cord') {
    iconPath(g, build, null, '#1a0e08', 2.8);
    iconPath(g, build, null, col, 1.8);
    g.setLineDash([1, 1.6]);
    iconPath(g, build, null, 'rgba(0,0,0,.4)', 1.8);
    g.setLineDash([]);
  } else if (style === 'scale') {
    for (const s of [-1, 1]) for (let t = 0; t <= 1; t += 0.085) {
      const [x, y] = pt(t, s);
      iconPoly(g, [x, y - 1.8, x + 1.5, y, x, y + 1.8, x - 1.5, y], iconSteel(g, x - 1.5, x + 1.5, '#7a8a96'), '#242c34', 0.6);
    }
  } else if (style === 'star') {
    iconPath(g, build, null, '#6e5010', 2.4);
    iconPath(g, build, null, '#e8c35a', 1.4);
    for (const [t, s] of [[0.35, -1], [0.35, 1], [0.7, -1], [0.7, 1]]) { const [x, y] = pt(t, s); iconStar(g, x, y, 2.4, 0.9, 4, '#fff6c0', '#8a6a1a'); }
  }
}

function iconBail(g, y, col) {
  iconCircle(g, 0, y, 1.9, null, col || '#d8dee6', 1.4);
}

// 1 Dog Tag Chain: ball chain with two stacked military dog tags and a rubber ring
ITEM_ART.all_neck_1 = (g) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'ball', 22);
  g.translate(0, 26);
  for (const [dx, dy, rot, col] of [[3, 3, 0.18, '#8a909a'], [-1, 1, -0.1, '#cfd4da']]) {
    g.save();
    g.translate(dx, dy);
    g.rotate(rot);
    iconRect(g, -6, -2, 12, 18, iconSteel(g, -6, 6, col), 'rgba(0,0,0,.65)', 5);
    iconCircle(g, 0, 1, 1.1, '#2a2e36');
    g.fillStyle = 'rgba(0,0,0,.4)';
    for (const [w, y] of [[7, 5], [7, 8], [4.5, 11]]) g.fillRect(-3.5, y, w, 1.1);
    g.restore();
  }
  iconCircle(g, -1, -1.4, 3.4, null, '#2a2e36', 1.4);
  g.restore();
};

// 2 Silver Locket: oval silver locket with an engraved rim, tiny heart and a clasp
ITEM_ART.all_neck_2 = (g) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'link', 22);
  g.translate(0, 31);
  iconBail(g, -10.5);
  iconPath(g, (p) => p.ellipse(0, 0, 9.2, 11.4, 0, 0, 6.28), iconSteel(g, -9, 9, '#d8dee6'), '#3a4452', 1);
  iconPath(g, (p) => p.ellipse(0, 0, 6.8, 9, 0, 0, 6.28), null, 'rgba(60,70,90,.7)', 0.8);
  g.setLineDash([1, 1.2]);
  iconPath(g, (p) => p.ellipse(0, 0, 7.8, 10.2, 0, 0, 6.28), null, 'rgba(90,100,120,.7)', 0.7);
  g.setLineDash([]);
  iconPath(g, (p) => { p.moveTo(0, 4.2); p.bezierCurveTo(-6, -0.4, -3, -5, 0, -1.8); p.bezierCurveTo(3, -5, 6, -0.4, 0, 4.2); }, '#e0507a', '#7a1a3a', 0.7);
  iconRect(g, 8.4, -1.4, 2.6, 3, '#a8b0bc', '#3a4452', 0.8);
  g.restore();
};

// 3 Emerald Pendant: teardrop emerald in a gold bezel on a gold chain
ITEM_ART.all_neck_3 = (g) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'gold', 22);
  g.translate(0, 31);
  iconBail(g, -11, '#e8c35a');
  iconPath(g, (p) => { p.moveTo(0, -9.6); p.bezierCurveTo(10, 0, 9, 9, 0, 12); p.bezierCurveTo(-9, 9, -10, 0, 0, -9.6); }, iconSteel(g, -10, 10, '#e8c35a'), '#6e5010', 1);
  iconPath(g, (p) => { p.moveTo(0, -7); p.bezierCurveTo(7.4, 0, 6.6, 7, 0, 9.4); p.bezierCurveTo(-6.6, 7, -7.4, 0, 0, -7); }, iconVert(g, -7, 9.4, '#6af0a0', '#0e8a4a'), '#0a4a26', 0.8);
  iconPoly(g, [0, -7, 5, 0, 0, 2, -5, 0], 'rgba(255,255,255,.35)');
  iconLine(g, [-3.4, 3, 0, 9.4, 3.4, 3], 'rgba(0,0,0,.25)', 0.7);
  iconCircle(g, -2.2, -2.4, 1, 'rgba(255,255,255,.8)');
  g.restore();
};

// 4 Amethyst Choker: black velvet choker band with a hexagonal violet amulet
ITEM_ART.all_neck_4 = (g, c) => {
  g.save();
  g.translate(28, 20);
  iconPath(g, (p) => { p.moveTo(-22, -8); p.quadraticCurveTo(0, 18, 22, -8); p.lineTo(22, -2); p.quadraticCurveTo(0, 25, -22, -2); p.closePath(); }, iconVert(g, -8, 22, '#2e2440', '#120c1c'), 'rgba(0,0,0,.75)');
  g.setLineDash([1.4, 1.8]);
  iconPath(g, (p) => { p.moveTo(-21, -5); p.quadraticCurveTo(0, 21, 21, -5); }, null, 'rgba(200,170,255,.5)', 0.8);
  g.setLineDash([]);
  g.translate(0, 15);
  iconPath(g, (p) => { for (let i = 0; i < 6; i++) p.lineTo(Math.cos(i * 1.0472 + 0.5236) * 11, Math.sin(i * 1.0472 + 0.5236) * 11); p.closePath(); }, iconSteel(g, -11, 11, '#8a7a9a'), '#2a1a3a', 1.2);
  iconPath(g, (p) => { for (let i = 0; i < 6; i++) p.lineTo(Math.cos(i * 1.0472 + 0.5236) * 8, Math.sin(i * 1.0472 + 0.5236) * 8); p.closePath(); }, '#241636', c, 1.2);
  iconPath(g, (p) => { p.moveTo(0, -6); p.lineTo(5.2, -1.6); p.lineTo(3, 5.4); p.lineTo(-3, 5.4); p.lineTo(-5.2, -1.6); p.closePath(); }, iconVert(g, -6, 5, '#d8a0ff', '#7a2ac8'), '#3a1a5a', 0.8);
  iconPoly(g, [0, -6, 5.2, -1.6, 0, 0], 'rgba(255,255,255,.4)');
  g.restore();
};

// 5 Sunfire Talisman: ruby-centred sun with flame rays on a red braided cord
ITEM_ART.all_neck_5 = (g) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'cord', 21, '#c9402a');
  g.translate(0, 32);
  iconGlow(g, 0, 0, 18, '#ff9a2a', 0.55);
  for (let i = 0; i < 12; i++) {
    g.save();
    g.rotate(i * 0.5236);
    if (i % 2) iconPoly(g, [-2, -8, 2, -8, 0, -13], '#ffb347', '#8a4a0a', 0.7);
    else iconPath(g, (p) => { p.moveTo(-2.6, -8); p.quadraticCurveTo(-1, -13, 0, -16.5); p.quadraticCurveTo(1, -13, 2.6, -8); p.closePath(); }, '#ff7a1a', '#8a2a0a', 0.7);
    g.restore();
  }
  iconCircle(g, 0, 0, 8.6, iconSteel(g, -8.6, 8.6, '#ffd27a'), '#7a4a0a', 1);
  iconCircle(g, 0, 0, 6, null, '#c88a2a', 0.8);
  iconGem(g, 0, 0, 4.2, '#e8283a');
  g.restore();
};

// 6 Starheart Necklace: crimson five-point star with a glowing white heart on a star-studded chain
ITEM_ART.all_neck_6 = (g) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'star', 21);
  g.translate(0, 32);
  iconGlow(g, 0, 0, 20, '#ff5a6a', 0.55);
  iconStar(g, 0, 0.6, 15, 6.2, 5, iconVert(g, -15, 12, '#ff8a8a', '#c81a3a'), '#5a0a18');
  iconStar(g, 0, 0.6, 9, 3.8, 5, 'rgba(255,255,255,.28)');
  iconCircle(g, 0, 1, 4.2, '#ffffff', '#ffb0b8', 1);
  iconCircle(g, 0, 1, 2, '#ffe0e4');
  g.restore();
};

// 7 Mythril Locket: heart-shaped mythril locket with leaf filigree and a sapphire
ITEM_ART.all_neck_7 = (g, c) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'link', 22);
  g.translate(0, 30);
  iconBail(g, -11.4, '#e6f0ff');
  iconPath(g, (p) => { p.moveTo(0, 12); p.bezierCurveTo(-16, 1, -11, -11, 0, -5); p.bezierCurveTo(11, -11, 16, 1, 0, 12); }, iconSteel(g, -14, 14, '#cfe0ff'), '#2a3e66', 1.1);
  iconPath(g, (p) => { p.moveTo(0, 9); p.bezierCurveTo(-11, 1, -8, -7.5, 0, -3); p.bezierCurveTo(8, -7.5, 11, 1, 0, 9); }, null, 'rgba(40,70,120,.7)', 0.8);
  for (const s of [-1, 1]) {
    iconPath(g, (p) => { p.moveTo(s * 2.4, 5); p.quadraticCurveTo(s * 9, 4, s * 8, -2); p.quadraticCurveTo(s * 3, 0, s * 2.4, 5); }, '#9fc4ff', '#2a3e66', 0.6);
    iconPath(g, (p) => { p.moveTo(s * 2, -3); p.quadraticCurveTo(s * 5.4, -7, s * 8, -5); }, null, '#fff', 0.7);
  }
  iconGem(g, 0, 1, 3.2, '#3a8aff');
  iconCircle(g, 0, -6.4, 0.8, '#fff');
  g.restore();
};

// 8 Dragonheart Pendant: a dragon claw gripping a fiery heart-orb, on a scaled chain
ITEM_ART.all_neck_8 = (g, c) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'scale', 21);
  g.translate(0, 32);
  iconGlow(g, 0, 1, 19, '#43f0e0', 0.5);
  iconBail(g, -13, '#8a9aa6');
  iconBall(g, 0, 1, 7.4, '#14b8a8');
  iconCircle(g, 0, 1, 7.4, null, '#0a4a44', 0.8);
  iconPath(g, (p) => { p.moveTo(0, 5); p.bezierCurveTo(-5, 1, -3, -3, 0, -1); p.bezierCurveTo(3, -3, 5, 1, 0, 5); }, '#c8fff6');
  for (const [x, rot] of [[-7.4, -0.5], [0, 0], [7.4, 0.5]]) {
    g.save();
    g.translate(x, -4);
    g.rotate(rot);
    iconPath(g, (p) => { p.moveTo(-2.6, 0); p.quadraticCurveTo(-3.4, -8, 0, -12); p.quadraticCurveTo(3.4, -8, 2.6, 0); p.closePath(); }, iconSteel(g, -3, 3, '#a8b8c4'), '#2a3640', 0.9);
    g.restore();
  }
  for (const [x, rot] of [[-8.4, 0.3], [8.4, -0.3]]) {
    g.save();
    g.translate(x, 7);
    g.rotate(rot);
    iconPoly(g, [-2.4, 0, 0, 7, 2.4, 0], iconSteel(g, -2.4, 2.4, '#a8b8c4'), '#2a3640', 0.9);
    g.restore();
  }
  g.restore();
};

// 9 Celestial Amulet: golden crescent moon cradling a star gem inside an orbit ring
ITEM_ART.all_neck_9 = (g) => {
  g.save();
  g.translate(28, 8);
  g.scale(0.88, 0.88);
  iconChain(g, 'star', 20);
  g.translate(0, 32);
  iconGlow(g, 0, 0, 22, '#fff08a', 0.55);
  iconPath(g, (p) => p.ellipse(0, 0, 15, 5.6, -0.5, 0, 6.28), null, 'rgba(255,240,160,.85)', 1.2);
  iconPath(g, (p) => { p.arc(0, 0, 11, 0.75, 5.53, false); p.arc(4.4, -0.4, 8.2, 5.1, 1.2, true); p.closePath(); }, iconSteel(g, -11, 8, '#ffe9a0'), '#7a5a14', 1);
  iconStar(g, 3, 0, 8, 3, 4, '#ffffff', '#c8a23a');
  iconGem(g, 3, 0, 2.4, '#fff08a');
  iconCircle(g, 12.4, -6.4, 1.8, '#fff6c0', '#8a6a1a', 0.6);
  iconStar(g, -13, 8, 3, 1.1, 4, '#fff6c0');
  iconBail(g, -13.4, '#ffe9a0');
  g.restore();
};
