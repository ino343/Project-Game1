/* Costume icons (cosmetic gear, see data/costumes.js): hats, outfits, capes and wings. Each is drawn from the item's own `cos` colours. */

const ICO_LINE = 'rgba(0,0,0,.62)';

/* ================= HATS ================= */

// Bunny Ears: two tall ears on a satin headband with a bow
ITEM_ART.cos_chead_bunny = (g, c, t, it) => {
  const k = it.cos;
  for (const s of [-1, 1]) {
    g.save();
    g.translate(28 + s * 9, 36);
    g.rotate(s * 0.24);
    iconPath(g, (p) => p.ellipse(0, -14, 6.6, 17, 0, 0, 6.2832), iconSteel(g, -7, 7, k.c1), ICO_LINE);
    iconPath(g, (p) => p.ellipse(0, -13, 3.3, 13, 0, 0, 6.2832), iconVert(g, -26, 0, iconShade(k.c2, 0.3), k.c2));
    g.restore();
  }
  iconPath(g, (p) => { p.moveTo(10, 40); p.quadraticCurveTo(28, 54, 46, 40); }, null, ICO_LINE, 5);
  iconPath(g, (p) => { p.moveTo(10, 40); p.quadraticCurveTo(28, 54, 46, 40); }, null, iconShade(k.c3, -0.05), 3.4);
  iconPoly(g, [38, 44, 50, 39, 49, 50], k.c3, ICO_LINE);
  iconPoly(g, [38, 44, 28, 40, 29, 51], iconShade(k.c3, 0.15), ICO_LINE);
  iconCircle(g, 38, 44, 2.6, iconShade(k.c3, -0.25), ICO_LINE);
};

// Flower Crown: a leafy wreath of blossoms
ITEM_ART.cos_chead_flower = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => p.ellipse(28, 33, 19, 11, 0, 0, 6.2832), null, ICO_LINE, 4.4);
  iconPath(g, (p) => p.ellipse(28, 33, 19, 11, 0, 0, 6.2832), null, iconShade(k.c2, -0.2), 3);
  const cols = [k.c1, '#ffffff', '#c9a0ff', '#ffd27a', k.c1, '#ffffff', '#c9a0ff', '#ffd27a'];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.2832 + 0.4,
      x = 28 + Math.cos(a) * 19,
      y = 33 + Math.sin(a) * 11;
    g.save();
    g.translate(x + Math.cos(a + 0.4) * 3.5, y + Math.sin(a + 0.4) * 2);
    g.rotate(a + 1.3);
    iconPath(g, (p) => p.ellipse(0, 0, 4.8, 2, 0, 0, 6.2832), k.c2, ICO_LINE, 0.7);
    g.restore();
    for (let j = 0; j < 5; j++) iconCircle(g, x + Math.cos(j * 1.2566) * 3.3, y + Math.sin(j * 1.2566) * 3.3, 2.7, cols[i], 'rgba(0,0,0,.45)', 0.7);
    iconBall(g, x, y, 2.1, k.c3);
  }
};

// Witch Hat: wide brim, bent cone, buckled band, star
ITEM_ART.cos_chead_witch = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => p.ellipse(28, 41, 24, 6.5, 0, 0, 6.2832), iconVert(g, 34, 48, iconShade(k.c1, 0.1), iconShade(k.c1, -0.35)), ICO_LINE);
  iconPath(g, (p) => { p.moveTo(15, 40); p.quadraticCurveTo(18, 22, 28, 14); p.quadraticCurveTo(33, 9, 42, 11); p.quadraticCurveTo(38, 16, 40, 22); p.quadraticCurveTo(42, 31, 41, 40); p.quadraticCurveTo(28, 45, 15, 40); }, iconSteel(g, 15, 42, k.c1), ICO_LINE);
  iconPath(g, (p) => { p.moveTo(16.4, 34); p.quadraticCurveTo(28, 39, 40.6, 34); p.lineTo(41, 40); p.quadraticCurveTo(28, 45, 15, 40); p.closePath(); }, iconVert(g, 34, 44, iconShade(k.c2, 0.25), iconShade(k.c2, -0.25)), ICO_LINE);
  iconRect(g, 24.5, 35.5, 8, 7, k.c3, ICO_LINE, 1);
  iconRect(g, 26.6, 37.5, 3.8, 3, iconShade(k.c1, -0.3), null, 0.5);
  iconStar(g, 33, 22, 2.8, 1.2, 5, '#fff3b0');
  iconGlow(g, 33, 22, 6, '#fff3b0', 0.5);
};

// Cat Ears: tabby ears on a thin band
ITEM_ART.cos_chead_cat = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => { p.moveTo(10, 43); p.quadraticCurveTo(28, 52, 46, 43); }, null, ICO_LINE, 4.2);
  iconPath(g, (p) => { p.moveTo(10, 43); p.quadraticCurveTo(28, 52, 46, 43); }, null, k.c3, 2.6);
  for (const s of [-1, 1]) {
    const X = (v) => 28 + s * v;
    iconPoly(g, [X(20), 45, X(24), 12, X(6), 33], iconSteel(g, 8, 48, k.c1), ICO_LINE, 1.1);
    iconPoly(g, [X(17.4), 41, X(21), 21, X(10), 33.5], k.c2);
    iconLine(g, [X(13), 33, X(18.6), 31], 'rgba(0,0,0,.2)', 0.8);
  }
  iconLine(g, [22, 30, 24, 34], 'rgba(0,0,0,.18)', 0.9);
};

// Pirate Tricorn: black three-cornered hat, gold trim, skull badge
ITEM_ART.cos_chead_pirate = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => { p.moveTo(3, 38); p.quadraticCurveTo(8, 22, 18, 24); p.quadraticCurveTo(28, 12, 38, 24); p.quadraticCurveTo(48, 22, 53, 38); p.quadraticCurveTo(28, 52, 3, 38); }, iconVert(g, 14, 50, iconShade(k.c1, 0.25), iconShade(k.c1, -0.4)), ICO_LINE, 1.2);
  iconPath(g, (p) => { p.moveTo(18, 24); p.quadraticCurveTo(28, 38, 38, 24); p.quadraticCurveTo(28, 15, 18, 24); }, iconShade(k.c1, 0.12), null);
  iconPath(g, (p) => { p.moveTo(4, 38.4); p.quadraticCurveTo(28, 51, 52, 38.4); }, null, k.c3, 1.7);
  iconPath(g, (p) => { p.moveTo(3.5, 37.6); p.quadraticCurveTo(8, 23, 18, 25); }, null, k.c3, 1.2);
  iconPath(g, (p) => { p.moveTo(52.5, 37.6); p.quadraticCurveTo(48, 23, 38, 25); }, null, k.c3, 1.2);
  // skull badge
  iconCircle(g, 28, 31, 5.4, k.c2, ICO_LINE, 0.8);
  iconRect(g, 24.8, 34, 6.4, 4.6, k.c2, ICO_LINE, 1);
  iconCircle(g, 26, 31, 1.4, '#14141a');
  iconCircle(g, 30, 31, 1.4, '#14141a');
  iconLine(g, [28, 33, 28, 34.4], '#14141a', 1);
  iconLine(g, [26.4, 36.6, 26.4, 38.4, 28, 36.6, 28, 38.4, 29.6, 36.6, 29.6, 38.4], '#14141a', 0.7);
};

// Crimson Jester Mask: modern full-face mask, split red shell, angular eye slits, swept horn blades with glowing tips
ITEM_ART.cos_chead_jester = (g, c, t, it) => {
  const k = it.cos;
  const shell = (p) => { p.moveTo(12, 26); p.quadraticCurveTo(28, 20, 44, 26); p.lineTo(43, 38); p.quadraticCurveTo(40, 49, 28, 54); p.quadraticCurveTo(16, 49, 13, 38); p.closePath(); };
  // full-face shell: lit red left half, deep red right half
  g.save();
  g.beginPath();
  shell(g);
  g.clip();
  g.fillStyle = iconVert(g, 20, 54, iconShade(k.c3, 0.1), iconShade(k.c3, -0.16));
  g.fillRect(0, 0, 28, 60);
  g.fillStyle = iconVert(g, 20, 54, iconShade(k.c3, -0.1), iconShade(k.c3, -0.3));
  g.fillRect(28, 0, 30, 60);
  g.restore();
  iconPath(g, shell, null, ICO_LINE, 1.2);
  iconLine(g, [28, 28, 28, 53], 'rgba(0,0,0,.35)', 0.8);
  // angular eye slits with a thin light edge
  for (const s of [-1, 1]) {
    const X = (v) => 28 + s * v;
    iconPoly(g, [X(13.5), 30.2, X(2.5), 33.4, X(3.4), 38.4, X(12.4), 36], '#150509');
    iconLine(g, [X(13.8), 29.8, X(2.4), 33], k.c1, 1.3);
    iconPoly(g, [X(15.5), 38.5, X(18.2), 42.2, X(15.5), 46, X(12.8), 42.2], k.c1, ICO_LINE, 0.6);
  }
  // wide red smile with dimple ticks + little red nose diamond
  iconPath(g, (p) => { p.moveTo(19, 44.4); p.quadraticCurveTo(28, 53, 37, 44.4); }, null, ICO_LINE, 3.6);
  iconPath(g, (p) => { p.moveTo(19, 44.4); p.quadraticCurveTo(28, 53, 37, 44.4); }, null, k.c1, 2.2);
  iconLine(g, [19, 44.4, 17.8, 41.8], k.c1, 1.6);
  iconLine(g, [37, 44.4, 38.2, 41.8], k.c1, 1.6);
  iconPoly(g, [28, 37.8, 30, 40.4, 28, 43, 26, 40.4], k.c2, ICO_LINE, 0.6);
  // cap: split dome + swept blades with glow orbs
  for (const s of [-1, 1]) {
    const X = (v) => 28 + s * v,
      col = s < 0 ? k.c2 : k.c1;
    iconPoly(g, [28, 3.5, X(5.5), 26, 28, 28], iconVert(g, 4, 28, iconShade(col, 0.22), iconShade(col, -0.3)), ICO_LINE, 1.1);
    iconPoly(g, [X(3), 24, X(8), 8, X(15), 14, X(25), 18.5, X(14), 27, X(9), 27], iconVert(g, 8, 27, iconShade(col, 0.22), iconShade(col, -0.3)), ICO_LINE, 1.1);
    iconPath(g, (p) => { p.moveTo(28, 28); p.ellipse(28, 28, 15, 9.5, 0, s < 0 ? Math.PI : Math.PI * 1.5, s < 0 ? Math.PI * 1.5 : Math.PI * 2); p.closePath(); }, iconVert(g, 18, 28, iconShade(col, 0.25), iconShade(col, -0.25)), ICO_LINE, 1.1);
    iconGlow(g, X(25), 18.5, 7, k.c3, 0.55);
    iconBall(g, X(25), 18.5, 2.6, k.c3);
  }
  iconGlow(g, 28, 4.5, 7, k.c3, 0.55);
  iconBall(g, 28, 4.5, 2.6, k.c3);
  iconPath(g, (p) => { p.moveTo(13, 27.4); p.quadraticCurveTo(28, 31, 43, 27.4); }, null, ICO_LINE, 3.2);
  iconPath(g, (p) => { p.moveTo(13, 27.4); p.quadraticCurveTo(28, 31, 43, 27.4); }, null, k.c3, 1.8);
  iconPoly(g, [28, 14.5, 30.8, 19.5, 28, 24.5, 25.2, 19.5], k.c3, ICO_LINE, 0.7);
};

// Dragon Horns: two curled horns on a band
ITEM_ART.cos_chead_horns = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => { p.moveTo(11, 44); p.quadraticCurveTo(28, 54, 45, 44); }, null, ICO_LINE, 5);
  iconPath(g, (p) => { p.moveTo(11, 44); p.quadraticCurveTo(28, 54, 45, 44); }, null, '#5a4230', 3.4);
  for (const s of [-1, 1]) {
    const X = (v) => 28 + s * v;
    iconPath(g, (p) => { p.moveTo(X(7), 46); p.quadraticCurveTo(X(8), 22, X(19), 13); p.quadraticCurveTo(X(26), 8, X(23), 18); p.quadraticCurveTo(X(17), 24, X(17), 46); p.closePath(); }, iconSteel(g, 5, 24, k.c1), ICO_LINE, 1.1);
    iconPath(g, (p) => { p.moveTo(X(10), 42); p.quadraticCurveTo(X(11), 25, X(19), 16); }, null, k.c2, 1.4);
    for (const y of [38, 31, 24]) iconLine(g, [X(9 + (38 - y) * 0.05), y, X(15.4 + (38 - y) * 0.02), y - 1.2], 'rgba(0,0,0,.25)', 0.9);
    iconCircle(g, X(23), 12.6, 2, k.c3, ICO_LINE, 0.7);
    iconGlow(g, X(23), 12.6, 6, k.c3, 0.5);
  }
};

/* ================= OUTFITS ================= */

// shared T-shaped jacket silhouette: body + sleeves; fill gradients come from the caller
function icoCoat(g, body, sleeve, long) {
  const hem = long ? 52 : 46;
  iconPath(g, (p) => { p.moveTo(19, 10); p.lineTo(37, 10); p.lineTo(47, 15); p.lineTo(51, 38); p.lineTo(44, 40); p.lineTo(42, 27); p.lineTo(42, hem); p.lineTo(14, hem); p.lineTo(14, 27); p.lineTo(12, 40); p.lineTo(5, 38); p.lineTo(9, 15); p.closePath(); }, body, ICO_LINE, 1.1);
  iconPath(g, (p) => { p.moveTo(9, 15); p.lineTo(14, 27); p.lineTo(12, 40); p.lineTo(5, 38); p.closePath(); }, sleeve);
  iconPath(g, (p) => { p.moveTo(47, 15); p.lineTo(42, 27); p.lineTo(44, 40); p.lineTo(51, 38); p.closePath(); }, sleeve);
  iconPath(g, (p) => { p.moveTo(9, 15); p.lineTo(14, 27); p.lineTo(12, 40); p.lineTo(5, 38); p.closePath(); }, null, ICO_LINE, 1.1);
  iconPath(g, (p) => { p.moveTo(47, 15); p.lineTo(42, 27); p.lineTo(44, 40); p.lineTo(51, 38); p.closePath(); }, null, ICO_LINE, 1.1);
}

// School Uniform: navy blazer, white shirt, red tie, pleated skirt
ITEM_ART.cos_cbody_uniform = (g, c, t, it) => {
  const k = it.cos,
    body = iconVert(g, 10, 48, iconShade(k.c1, 0.2), iconShade(k.c1, -0.3));
  icoCoat(g, body, iconSteel(g, 4, 14, k.c1));
  iconPoly(g, [22, 10, 34, 10, 28, 28], k.c2, ICO_LINE, 0.8);
  iconPoly(g, [19, 10, 22, 10, 28, 28, 25, 40, 18, 40, 16, 20], iconShade(k.c1, -0.25), ICO_LINE, 0.8);
  iconPoly(g, [37, 10, 34, 10, 28, 28, 31, 40, 38, 40, 40, 20], iconShade(k.c1, -0.25), ICO_LINE, 0.8);
  iconPoly(g, [26.8, 13, 29.2, 13, 30, 20, 28, 25, 26, 20], k.c3, ICO_LINE, 0.7);
  iconRect(g, 17, 26, 5, 5, k.c2, ICO_LINE, 1);
  iconRect(g, 18.6, 27.6, 1.8, 1.8, k.c3, null, 0.4);
  iconRect(g, 14, 43, 28, 3, iconShade(k.c1, -0.4));
  for (const y of [35, 38.5]) iconCircle(g, 33, y, 1, '#e8c35a');
  for (const x of [8.5, 47.5]) iconLine(g, [x - 3, 36.5, x + 3, 38], k.c2, 1.8);
};

// Bear Onesie: fluffy brown suit with a hood and round ears
ITEM_ART.cos_cbody_bear = (g, c, t, it) => {
  const k = it.cos;
  // legs
  for (const s of [-1, 1]) iconRect(g, 28 + s * 8 - 5.5, 38, 11, 14, iconSteel(g, 14, 42, k.c1), ICO_LINE, 4);
  for (const s of [-1, 1]) iconCircle(g, 28 + s * 8, 51.5, 3.4, k.c2, ICO_LINE, 0.8);
  // arms
  for (const s of [-1, 1]) {
    g.save();
    g.translate(28 + s * 17, 25);
    g.rotate(-s * 0.3);
    iconRect(g, -4, -2, 8, 17, iconSteel(g, -4, 4, k.c1), ICO_LINE, 3.4);
    iconCircle(g, 0, 15, 3.8, k.c2, ICO_LINE, 0.8);
    g.restore();
  }
  // torso + belly
  iconPath(g, (p) => p.ellipse(28, 33, 13, 16, 0, 0, 6.2832), iconSteel(g, 14, 42, k.c1), ICO_LINE, 1.1);
  iconPath(g, (p) => p.ellipse(28, 36, 8, 10, 0, 0, 6.2832), iconVert(g, 26, 46, iconShade(k.c2, 0.2), k.c2));
  iconLine(g, [28, 17, 28, 29], iconShade(k.c1, -0.5), 1.1);
  iconRect(g, 26.6, 17, 2.8, 3, '#ddd', ICO_LINE, 0.8);
  // hood with ears
  for (const s of [-1, 1]) {
    iconCircle(g, 28 + s * 11, 7, 5, k.c1, ICO_LINE, 1);
    iconCircle(g, 28 + s * 11, 7.2, 2.6, k.c2);
  }
  iconPath(g, (p) => p.ellipse(28, 14, 12, 8.4, 0, 0, 6.2832), iconSteel(g, 16, 40, k.c1), ICO_LINE, 1);
  iconPath(g, (p) => p.ellipse(28, 15.4, 6, 4.2, 0, 0, 6.2832), k.c2);
  iconCircle(g, 28, 14.4, 1.4, '#2a1a10');
};

// Summer Yukata: indigo robe, wide sleeves, floral dots and a big pink obi
ITEM_ART.cos_cbody_yukata = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => { p.moveTo(19, 9); p.lineTo(37, 9); p.lineTo(40, 13); p.lineTo(43, 53); p.lineTo(13, 53); p.lineTo(16, 13); p.closePath(); }, iconVert(g, 9, 53, iconShade(k.c1, 0.22), iconShade(k.c1, -0.3)), ICO_LINE, 1.1);
  for (const s of [-1, 1]) {
    iconPath(g, (p) => { p.moveTo(28 + s * 11, 12); p.lineTo(28 + s * 25, 16); p.lineTo(28 + s * 25, 42); p.lineTo(28 + s * 13, 42); p.lineTo(28 + s * 12, 26); p.closePath(); }, iconSteel(g, 3, 25, k.c1), ICO_LINE, 1.1);
    iconLine(g, [28 + s * 13, 41, 28 + s * 25, 41], k.c2, 1.2);
  }
  g.save();
  iconPath(g, (p) => { p.moveTo(19, 9); p.lineTo(37, 9); p.lineTo(40, 13); p.lineTo(43, 53); p.lineTo(13, 53); p.lineTo(16, 13); p.closePath(); });
  g.clip();
  g.fillStyle = k.c2;
  for (const [x, y] of [[19, 20], [34, 22], [24, 31], [37, 35], [18, 44], [30, 46], [40, 49], [22, 15]]) {
    for (let i = 0; i < 5; i++) iconCircle(g, x + Math.cos(i * 1.2566) * 1.7, y + Math.sin(i * 1.2566) * 1.7, 1.1, k.c2);
    iconCircle(g, x, y, 0.9, '#ffd27a');
  }
  g.restore();
  iconPoly(g, [22, 9, 26, 9, 33, 26, 30, 26], '#fff8ff', ICO_LINE, 0.8);
  iconPoly(g, [34, 9, 30, 9, 23, 26, 26, 26], iconShade(k.c1, -0.35), ICO_LINE, 0.8);
  iconRect(g, 13, 26, 30, 9, iconVert(g, 26, 35, iconShade(k.c3, 0.25), iconShade(k.c3, -0.25)), ICO_LINE, 1.5);
  iconLine(g, [14, 28, 42, 28], 'rgba(255,255,255,.35)', 0.9);
  iconPoly(g, [28, 30, 38, 22, 40, 36], iconShade(k.c3, -0.05), ICO_LINE, 0.9);
  iconPoly(g, [28, 30, 18, 22, 16, 36], iconShade(k.c3, 0.1), ICO_LINE, 0.9);
  iconRect(g, 24.5, 27, 7, 7, iconShade(k.c3, 0.35), ICO_LINE, 1.4);
};

// Captain's Coat: burgundy coat, gold buttons and trim, frilly shirt, belt
ITEM_ART.cos_cbody_piratecoat = (g, c, t, it) => {
  const k = it.cos,
    body = iconVert(g, 10, 52, iconShade(k.c1, 0.2), iconShade(k.c1, -0.35));
  icoCoat(g, body, iconSteel(g, 4, 14, k.c1), true);
  iconPoly(g, [22, 10, 34, 10, 33, 52, 23, 52], '#f4f0e4', ICO_LINE, 0.8);
  iconPoly(g, [23.5, 12, 32.5, 12, 30.5, 20, 28, 24, 25.5, 20], '#ffffff', 'rgba(0,0,0,.4)', 0.7);
  for (const y of [15, 18.5]) iconLine(g, [25.4, y, 30.6, y], 'rgba(0,0,0,.2)', 0.7);
  iconPoly(g, [19, 10, 22, 10, 23, 52, 14, 52, 14, 27, 16, 17], iconShade(k.c1, -0.12), ICO_LINE, 0.8);
  iconPoly(g, [37, 10, 34, 10, 33, 52, 42, 52, 42, 27, 40, 17], iconShade(k.c1, -0.12), ICO_LINE, 0.8);
  iconLine(g, [22.4, 10, 23.4, 52], k.c2, 1.3);
  iconLine(g, [33.6, 10, 32.6, 52], k.c2, 1.3);
  for (const y of [17, 23, 29]) {
    iconBall(g, 18.4, y, 1.5, k.c2);
    iconBall(g, 37.6, y, 1.5, k.c2);
  }
  iconRect(g, 14, 33, 28, 4, k.c3, ICO_LINE, 1);
  iconRect(g, 25, 32.2, 6, 5.6, k.c2, ICO_LINE, 1);
  iconRect(g, 27, 34, 2, 2, k.c3, null, 0.4);
  iconLine(g, [14, 51, 42, 51], k.c2, 1.2);
  for (const x of [8.5, 47.5]) {
    iconRect(g, x - 4.4, 33.5, 8.8, 5.5, '#f4f0e4', ICO_LINE, 1.4);
    iconLine(g, [x - 4.4, 33.5, x + 4.4, 33.5], k.c2, 1);
  }
};

// Astronaut Suit: white suit with orange stripes, chest panel, glass helmet
ITEM_ART.cos_cbody_astro = (g, c, t, it) => {
  const k = it.cos;
  iconCircle(g, 28, 12, 10, iconVert(g, 2, 22, '#ffffff', '#b8c0cc'), ICO_LINE, 1.1);
  iconPath(g, (p) => p.ellipse(28, 12.6, 7.2, 6, 0, 0, 6.2832), iconVert(g, 7, 19, '#2a4a7a', '#0c1830'), ICO_LINE, 0.9);
  iconPath(g, (p) => { p.moveTo(23, 10); p.quadraticCurveTo(26, 7, 31, 8.4); }, null, 'rgba(255,255,255,.7)', 1.3);
  icoCoat(g, iconVert(g, 20, 54, '#ffffff', '#b9c1cd'), iconSteel(g, 4, 14, k.c1));
  g.save();
  g.translate(0, 8);
  iconPath(g, (p) => { p.moveTo(19, 10); p.lineTo(37, 10); p.lineTo(47, 15); p.lineTo(51, 38); p.lineTo(44, 40); p.lineTo(42, 27); p.lineTo(42, 46); p.lineTo(14, 46); p.lineTo(14, 27); p.lineTo(12, 40); p.lineTo(5, 38); p.lineTo(9, 15); p.closePath(); });
  g.restore();
  iconRect(g, 14, 38, 28, 3, k.c2, null, 0.5);
  iconRect(g, 5.6, 33, 6, 2.2, k.c2, null, 0.5);
  iconRect(g, 44.4, 33, 6, 2.2, k.c2, null, 0.5);
  iconRect(g, 21, 20, 14, 9, iconVert(g, 20, 29, '#566178', k.c3), ICO_LINE, 2);
  iconCircle(g, 24.6, 24.6, 1.5, '#ff5a50');
  iconCircle(g, 28, 24.6, 1.5, '#6fe08a');
  iconCircle(g, 31.4, 24.6, 1.5, '#6fa8ff');
  iconLine(g, [23, 27.4, 33, 27.4], '#9aa3b4', 0.9);
  iconRect(g, 15.5, 31, 5, 3, '#d93a4a', ICO_LINE, 0.5);
  iconRect(g, 14, 36.4, 28, 1.6, k.c3);
  for (const x of [8.5, 47.5]) iconRect(g, x - 3.6, 37, 7.2, 3.4, '#c9ced4', ICO_LINE, 1);
};

// Royal Regalia: royal-blue coat, ermine collar, gold braid, sash and medal
ITEM_ART.cos_cbody_royal = (g, c, t, it) => {
  const k = it.cos,
    body = iconVert(g, 10, 52, iconShade(k.c1, 0.28), iconShade(k.c1, -0.35));
  icoCoat(g, body, iconSteel(g, 4, 14, k.c1), true);
  iconPoly(g, [22, 10, 34, 10, 33, 52, 23, 52], '#f4efe2', ICO_LINE, 0.8);
  iconLine(g, [22.4, 10, 23.4, 52], k.c2, 1.5);
  iconLine(g, [33.6, 10, 32.6, 52], k.c2, 1.5);
  for (const y of [20, 26, 32]) iconBall(g, 28, y, 1.5, k.c2);
  iconPoly(g, [14, 17, 19, 15, 42, 44, 37, 46], '#c0283e', ICO_LINE, 0.8);
  iconLine(g, [16, 16.5, 39.5, 45], k.c2, 0.9);
  iconCircle(g, 20, 30, 3.2, k.c2, ICO_LINE, 0.8);
  iconPoly(g, [18.6, 32.5, 21.4, 32.5, 21.6, 37, 18.4, 37], '#c0283e', ICO_LINE, 0.6);
  iconLine(g, [14, 51, 42, 51], k.c2, 1.6);
  for (const s of [-1, 1]) {
    iconRect(g, 28 + s * 15 - 4.6, 11.4, 9.2, 3.4, k.c2, ICO_LINE, 1);
    for (let i = 0; i < 4; i++) iconLine(g, [28 + s * 15 - 3.4 + i * 2.3, 14.8, 28 + s * 15 - 3.4 + i * 2.3, 17.4], k.c2, 0.9);
  }
  iconPath(g, (p) => p.ellipse(28, 10.4, 11.4, 4.2, 0, 0, 6.2832), k.c3, ICO_LINE, 1);
  g.fillStyle = '#2a2a33';
  for (const x of [-7, -3.4, 0.4, 4, 7.4]) g.fillRect(28 + x - 0.6, 9.6, 1.2, 2.6);
};

/* ================= BACKS ================= */

// Hero Cape: flowing red cape with a gold clasp
ITEM_ART.cos_cback_cape = (g, c, t, it) => {
  const k = it.cos;
  iconPath(g, (p) => { p.moveTo(14, 11); p.lineTo(42, 11); p.quadraticCurveTo(48, 32, 53, 51); p.quadraticCurveTo(46, 47, 40, 52); p.quadraticCurveTo(34, 47, 28, 52); p.quadraticCurveTo(22, 47, 16, 52); p.quadraticCurveTo(10, 47, 3, 51); p.quadraticCurveTo(8, 32, 14, 11); }, iconSteel(g, 3, 53, k.c2), ICO_LINE, 1.2);
  iconPath(g, (p) => { p.moveTo(17, 13); p.lineTo(39, 13); p.quadraticCurveTo(44, 32, 47, 47); p.quadraticCurveTo(40, 44, 36, 48); p.quadraticCurveTo(28, 44, 20, 48); p.quadraticCurveTo(16, 44, 9, 47); p.quadraticCurveTo(12, 32, 17, 13); }, iconSteel(g, 9, 47, k.c1));
  for (const x of [22, 28, 34]) iconPath(g, (p) => { p.moveTo(x, 15); p.quadraticCurveTo(x + (x - 28) * 0.5, 32, x + (x - 28) * 0.9, 46); }, null, 'rgba(0,0,0,.18)', 1);
  iconPath(g, (p) => { p.moveTo(14, 11); p.quadraticCurveTo(28, 17, 42, 11); }, null, ICO_LINE, 1.3);
  iconLine(g, [17, 11.4, 39, 11.4], k.c3, 1.6);
  iconBall(g, 16, 12, 3, k.c3);
  iconBall(g, 40, 12, 3, k.c3);
  iconPath(g, (p) => { p.moveTo(16, 12); p.quadraticCurveTo(28, 19, 40, 12); }, null, k.c3, 1);
};

// Fairy Wings: two pairs of glassy wings with veins and glitter
ITEM_ART.cos_cback_fairy = (g, c, t, it) => {
  const k = it.cos;
  for (const s of [-1, 1]) {
    for (const [dx, dy, rx, ry, rot] of [[14, -8, 7.6, 18, 0.68], [10, 12, 5.6, 12.4, 0.34]]) {
      g.save();
      g.translate(28 + s * dx, 30 + dy);
      g.rotate(s * rot);
      iconPath(g, (p) => p.ellipse(0, 0, rx, ry, 0, 0, 6.2832), iconVert(g, -ry, ry, iconAlpha('#ffffff', 0.7), iconAlpha(k.c1, 0.6)), iconShade(k.c1, -0.35), 1);
      iconLine(g, [0, -ry + 1.5, 0, ry - 1.5], iconAlpha(k.c2, 0.8), 0.8);
      iconLine(g, [0, -ry * 0.25, rx * 0.8, -ry * 0.6], iconAlpha(k.c2, 0.8), 0.7);
      iconLine(g, [0, ry * 0.15, -rx * 0.8, -ry * 0.2], iconAlpha(k.c2, 0.8), 0.7);
      g.restore();
    }
  }
  iconPath(g, (p) => p.ellipse(28, 31, 2.4, 8, 0, 0, 6.2832), iconShade(k.c1, -0.3), ICO_LINE, 0.8);
  for (const [x, y, r] of [[10, 12, 2.2], [47, 20, 1.8], [8, 40, 1.5], [49, 44, 2]]) {
    iconStar(g, x, y, r * 1.6, r * 0.5, 4, k.c3);
    iconGlow(g, x, y, r * 3, k.c3, 0.4);
  }
};

// Angel Wings: layered white feathers and a gold halo
ITEM_ART.cos_cback_angel = (g, c, t, it) => {
  const k = it.cos;
  for (const s of [-1, 1]) {
    for (let row = 2; row >= 0; row--) {
      const L = 17 + row * 4.5,
        ox = 28 + s * 3,
        oy = 38 - row * 1.5;
      iconPath(g, (p) => {
        p.moveTo(ox, oy);
        p.quadraticCurveTo(ox + s * L * 0.5, oy - 22 + row * 2, ox + s * L * 0.92, oy - 16 - row * 3);
        for (let j = 1; j <= 4; j++) {
          const f = 1 - j / 4;
          p.quadraticCurveTo(ox + s * L * (f * 0.92 + 0.2), oy - 6 + j * 3.6 + row * 1.6, ox + s * L * 0.92 * f, oy - 9 + j * 3.2 + row * 2.2);
        }
        p.closePath();
      }, row === 2 ? iconVert(g, 8, 44, '#ffffff', '#e9edff') : row === 1 ? iconVert(g, 8, 44, '#f1f4ff', '#d4daf6') : iconVert(g, 8, 44, '#dfe5fb', '#b8c2ec'), 'rgba(70,86,150,.55)', 0.9);
    }
  }
  iconPath(g, (p) => p.ellipse(28, 10, 8.5, 3, 0, 0, 6.2832), null, ICO_LINE, 3.6);
  iconPath(g, (p) => p.ellipse(28, 10, 8.5, 3, 0, 0, 6.2832), null, k.c3, 2.4);
  iconGlow(g, 28, 10, 12, k.c3, 0.45);
};

// Dragon Wings: crimson leathery membranes on bone spars with claws
ITEM_ART.cos_cback_dragonwing = (g, c, t, it) => {
  const k = it.cos;
  for (const s of [-1, 1]) {
    const X = (v) => 28 + s * v,
      W = [X(19), 8],
      T1 = [X(27), 21],
      T2 = [X(24), 35],
      T3 = [X(16), 46];
    iconPath(g, (p) => {
      p.moveTo(X(3), 33);
      p.lineTo(W[0], W[1]);
      p.lineTo(T1[0], T1[1]);
      p.quadraticCurveTo(X(23), 25, T2[0], T2[1]);
      p.quadraticCurveTo(X(19), 38, T3[0], T3[1]);
      p.quadraticCurveTo(X(9), 40, X(3), 42);
      p.closePath();
    }, iconSteel(g, 2, 28, k.c1), ICO_LINE, 1.1);
    for (const T of [T1, T2, T3]) iconLine(g, [X(3), 36, T[0], T[1]], k.c2, 1.5);
    iconLine(g, [X(3), 33, W[0], W[1]], k.c2, 2.4);
    iconLine(g, [W[0], W[1], T1[0], T1[1]], k.c2, 1.6);
    iconLine(g, [X(3.6), 33, X(8), 26], 'rgba(255,255,255,.14)', 1);
    iconPoly(g, [W[0] - s * 1, W[1] - 1, W[0] + s * 3, W[1] - 6, W[0] + s * 2.4, W[1] + 2], k.c3, ICO_LINE, 0.7);
    iconBall(g, W[0], W[1] + 1, 1.7, k.c3);
  }
  iconPath(g, (p) => p.ellipse(28, 36, 3, 9, 0, 0, 6.2832), iconShade(k.c1, -0.45), ICO_LINE, 0.8);
};
