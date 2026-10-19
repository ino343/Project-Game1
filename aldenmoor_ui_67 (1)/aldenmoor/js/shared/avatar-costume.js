/**
 * Costume looks for drawAvatar (cosmetic gear, see data/costumes.js). o.cos = { head, body, back } where each part is
 * { style, c1, c2, c3, pants?, shoe?, sole? } or missing. A worn costume replaces the look of the class outfit /
 * stat headgear; it never changes stats.
 *
 *   avatarCosBack(ctx, b, front)   cape / wings. front=false: behind the body, front=true: back view, drawn over the body
 *   avatarCosBody(ctx, b)          outfit details over the torso (+ long skirts / coat tails)
 *   avatarCosSleeves(ctx, b)       sleeves for the outfit
 *   avatarCosHead(g, x, fy, h, facingUp, t, face)   hats, ears, horns
 *   avatarCosHood(g, x, fy, b)     extra head part of an outfit (bear hood ears) when no costume hat is worn
 * ctx = { g, x, fy, bw, female, o, t, facingUp, side, seated, arm, hold }
 */

/* ---------- hats ---------- */
// Side view (sideDir = +1 facing right / -1 left): the paired parts (ears, horns, bunny ears) pull together so the
// near and far one overlap, the witch hat tip trails behind, the bicorn turns narrow and the mask turns in profile.
function avatarCosHead(g, x, fy, h, facingUp, t, face, sideDir = 0) {
  if (!sideDir || facingUp) return avatarCosHeadFront(g, x, fy, h, facingUp, t, face, 0);
  const K = { catears: 0.5, bunny: 0.5, pirate: 0.55, horns: 0.45 };
  g.save();
  if (h.style === 'witch') {
    if (sideDir > 0) {
      g.translate(x, 0);
      g.scale(-1, 1);
      g.translate(-x, 0);
    }
  } else if (K[h.style]) {
    g.translate(x + sideDir * 1.2, 0);
    g.scale(K[h.style], 1);
    g.translate(-x, 0);
  }
  avatarCosHeadFront(g, x, fy, h, facingUp, t, face, sideDir);
  g.restore();
}
function avatarCosHeadFront(g, x, fy, h, facingUp, t, face, sideDir) {
  const { c1, c2, c3 } = h,
    PI = Math.PI;
  const poly = (pts, fill) => avatarPoly(g, pts, fill);
  switch (h.style) {
    case 'catears':
      for (const s of [-1, 1]) {
        poly([x + s * 8.8, fy - 40, x + s * 10, fy - 53, x + s * 2.4, fy - 45.5], c1);
        poly([x + s * 7.8, fy - 42.6, x + s * 8.8, fy - 49.6, x + s * 4.2, fy - 45.4], c2);
      }
      g.strokeStyle = c3;
      g.lineWidth = 1.7;
      g.beginPath();
      g.arc(x, fy - 35, 9.6, PI * 1.1, PI * 1.9);
      g.stroke();
      break;
    case 'bunny':
      for (const s of [-1, 1]) {
        g.save();
        g.translate(x + s * 4.6, fy - 43);
        g.rotate(s * 0.2 + Math.sin(t * 2 + s) * 0.03);
        g.fillStyle = c1;
        g.beginPath();
        g.ellipse(0, -9.5, 3.4, 10.5, 0, 0, 6.28);
        g.fill();
        g.fillStyle = c2;
        g.beginPath();
        g.ellipse(0, -9, 1.7, 8, 0, 0, 6.28);
        g.fill();
        g.restore();
      }
      poly([x + 5, fy - 43.5, x + 12, fy - 47, x + 12, fy - 40], c3); // bow
      poly([x + 5, fy - 43.5, x - 2, fy - 47, x - 2, fy - 40], c3);
      g.fillStyle = avatarShade(c3, -0.3);
      g.beginPath();
      g.arc(x + 5, fy - 43.5, 1.6, 0, 6.28);
      g.fill();
      break;
    case 'flower': {
      const cols = [c1, '#ffffff', '#c9a0ff', '#ffd27a', c1, '#ffffff', '#c9a0ff'];
      for (let i = 0; i < 7; i++) {
        const a = PI * (1.07 + i * 0.145),
          px = x + Math.cos(a) * 10,
          py = fy - 35.5 + Math.sin(a) * 9.6;
        g.fillStyle = c2; // leaf tucked between blossoms
        g.beginPath();
        g.ellipse(x + Math.cos(a + 0.07) * 10.4, fy - 35.5 + Math.sin(a + 0.07) * 10, 2.8, 1.3, a + 1.2, 0, 6.28);
        g.fill();
        g.fillStyle = cols[i];
        for (let k = 0; k < 5; k++) {
          g.beginPath();
          g.arc(px + Math.cos(k * 1.2566) * 2, py + Math.sin(k * 1.2566) * 2, 1.5, 0, 6.28);
          g.fill();
        }
        g.fillStyle = c3;
        g.beginPath();
        g.arc(px, py, 1.2, 0, 6.28);
        g.fill();
      }
      break;
    }
    case 'witch':
      g.fillStyle = c1;
      g.beginPath();
      g.ellipse(x, fy - 41.5, 15.5, 3.6, 0, 0, 6.28);
      g.fill();
      g.fillStyle = avatarShade(c1, 0.12);
      g.beginPath();
      g.moveTo(x - 8.6, fy - 41.5);
      g.quadraticCurveTo(x - 6.5, fy - 52, x + 1, fy - 58);
      g.quadraticCurveTo(x + 4, fy - 63, x + 9, fy - 59); // bent tip
      g.quadraticCurveTo(x + 6.5, fy - 52, x + 8.6, fy - 41.5);
      g.closePath();
      g.fill();
      poly([x - 8, fy - 46, x + 8, fy - 46, x + 8.5, fy - 42, x - 8.5, fy - 42], c2);
      g.fillStyle = c3;
      g.fillRect(x - 2.4, fy - 46.4, 4.8, 5);
      g.fillStyle = avatarShade(c1, -0.2);
      g.fillRect(x - 1.1, fy - 45, 2.2, 2.4);
      break;
    case 'pirate':
      g.fillStyle = c1;
      g.beginPath();
      g.arc(x, fy - 41, 9.6, PI, 6.28);
      g.fill();
      poly([x - 18, fy - 38.8, x - 12, fy - 46, x - 6, fy - 43.5, x + 6, fy - 43.5, x + 12, fy - 46, x + 18, fy - 38.8, x + 9, fy - 38, x - 9, fy - 38], avatarShade(c1, 0.1));
      g.fillStyle = c3;
      g.fillRect(x - 17, fy - 39.2, 8, 1.1);
      g.fillRect(x + 9, fy - 39.2, 8, 1.1);
      g.fillRect(x - 9, fy - 38.3, 18, 0.9);
      if (!facingUp && !sideDir) {
        g.fillStyle = c2;
        g.beginPath();
        g.arc(x, fy - 45.6, 2.5, 0, 6.28);
        g.fill();
        g.fillRect(x - 1.4, fy - 44, 2.8, 2);
        g.fillStyle = c1;
        g.fillRect(x - 1.5, fy - 46.2, 1, 1);
        g.fillRect(x + 0.5, fy - 46.2, 1, 1);
      }
      break;
    case 'jester': {
      // modern crimson full-face mask: split red / deep-red shell, angular eye slits, thin grin, sleek horn blades
      const ex = sideDir ? sideDir * 3.9 : face === undefined ? 0 : Math.cos(face) * 2.2, // the face features turn with the head
        m = x + ex * 0.35,
        fx = x + ex;
      if (!facingUp) {
        if (sideDir) {
          g.save(); // mask in profile: narrower, features near the facing edge
          g.translate(fx, 0);
          g.scale(0.62, 1);
          g.translate(-fx, 0);
        }
        const shell = () => {
          g.beginPath();
          g.moveTo(m - 9.3, fy - 37.5);
          g.quadraticCurveTo(m, fy - 41.5, m + 9.3, fy - 37.5);
          g.lineTo(m + 8.8, fy - 31);
          g.quadraticCurveTo(m + 6, fy - 26.2, m, fy - 25.2);
          g.quadraticCurveTo(m - 6, fy - 26.2, m - 8.8, fy - 31);
          g.closePath();
        };
        g.save();
        shell();
        g.clip();
        g.fillStyle = c3; // white porcelain shell, lit left half
        g.fillRect(m - 10, fy - 43, 10 + (fx - m), 20);
        g.fillStyle = avatarShade(c3, -0.13);
        g.fillRect(fx, fy - 43, 12, 20);
        g.restore();
        shell();
        g.strokeStyle = 'rgba(0,0,0,.55)';
        g.lineWidth = 0.7;
        g.stroke();
        g.strokeStyle = 'rgba(0,0,0,.4)'; // centre seam
        g.lineWidth = 0.6;
        g.beginPath();
        g.moveTo(fx, fy - 41);
        g.lineTo(fx, fy - 25.6);
        g.stroke();
        for (const s of [-1, 1]) {
          // angular eye slits (the eyes sit inside, so they read as looking out of the mask)
          poly([fx + s * 6.5, fy - 37, fx + s * 0.8, fy - 35.6, fx + s * 1.2, fy - 31, fx + s * 6, fy - 32.4], '#150509');
          g.strokeStyle = c1; // red rim along the top of each slit
          g.lineWidth = 0.8;
          g.beginPath();
          g.moveTo(fx + s * 6.7, fy - 37.4);
          g.lineTo(fx + s * 0.7, fy - 35.9);
          g.stroke();
          poly([fx + s * 7.2, fy - 32.2, fx + s * 8.3, fy - 30.6, fx + s * 7.2, fy - 29, fx + s * 6.1, fy - 30.6], c1); // red cheek diamond
        }
        poly([fx, fy - 33.6, fx + 1.1, fy - 32.2, fx, fy - 30.8, fx - 1.1, fy - 32.2], c2); // little red nose diamond
        g.strokeStyle = c1; // wide red smile with dimple ticks
        g.lineWidth = 1.1;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(fx - 4.8, fy - 30.2);
        g.quadraticCurveTo(fx, fy - 25.6, fx + 4.8, fy - 30.2);
        g.moveTo(fx - 4.8, fy - 30.2);
        g.lineTo(fx - 5.3, fy - 31.5);
        g.moveTo(fx + 4.8, fy - 30.2);
        g.lineTo(fx + 5.3, fy - 31.5);
        g.stroke();
        g.lineCap = 'butt';
        if (sideDir) g.restore();
      } else {
        g.fillStyle = c3; // back view: white mask strap around the head
        g.fillRect(x - 9.3, fy - 37, 18.6, 2.6);
        g.fillStyle = c1;
        g.fillRect(x - 9.3, fy - 36.2, 18.6, 0.8);
      }
      if (sideDir) {
        g.save(); // the two horn blades overlap in profile
        g.translate(x + sideDir * 1.2, 0);
        g.scale(0.5, 1);
        g.translate(-x, 0);
      }
      // cap: split dome, thin silver band, two swept horn blades with glowing tips
      for (const s of [-1, 1]) {
        const col = s < 0 ? c2 : c1,
          sw = Math.sin(t * 2.4 + s) * 0.9;
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x, fy - 40.5);
        g.ellipse(x, fy - 40.5, 10, 6.5, 0, s < 0 ? PI : PI * 1.5, s < 0 ? PI * 1.5 : PI * 2);
        g.closePath();
        g.fill();
        g.fillStyle = col; // centre blade (third horn)
        g.beginPath();
        g.moveTo(x, fy - 59 + sw * 0.5);
        g.lineTo(x + s * 3.6, fy - 44.5);
        g.lineTo(x, fy - 43);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,.5)';
        g.lineWidth = 0.6;
        g.stroke();
        const bx = [3, 8, 14, 23.5, 13, 8.5],
          by = [-45, -54, -49, -46 + sw, -42.5, -41.5];
        g.fillStyle = col;
        g.beginPath();
        for (let i = 0; i < 6; i++) g[i ? 'lineTo' : 'moveTo'](x + s * bx[i], fy + by[i]);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,.5)';
        g.lineWidth = 0.6;
        g.stroke();
        g.globalAlpha = 0.3; // glowing tip orb
        g.fillStyle = c3;
        g.beginPath();
        g.arc(x + s * 23.5, fy - 46 + sw, 3.6, 0, 6.28);
        g.fill();
        g.globalAlpha = 1;
        g.beginPath();
        g.arc(x + s * 23.5, fy - 46 + sw, 1.7, 0, 6.28);
        g.fill();
      }
      g.fillStyle = c3; // centre tip orb
      g.globalAlpha = 0.3;
      g.beginPath();
      g.arc(x, fy - 59 + Math.sin(t * 2.4) * 0.45, 3.6, 0, 6.28);
      g.fill();
      g.globalAlpha = 1;
      g.beginPath();
      g.arc(x, fy - 59 + Math.sin(t * 2.4) * 0.45, 1.7, 0, 6.28);
      g.fill();
      g.fillStyle = c3;
      g.fillRect(x - 10, fy - 41.2, 20, 1.1);
      if (sideDir) g.restore();
      if (!facingUp) poly([x + ex * 0.5, fy - 46.8, x + ex * 0.5 + 1.8, fy - 44.4, x + ex * 0.5, fy - 42.2, x + ex * 0.5 - 1.8, fy - 44.4], c3);
      break;
    }
    case 'horns':
      for (const s of [-1, 1]) {
        g.fillStyle = c1;
        g.beginPath();
        g.moveTo(x + s * 4.6, fy - 42);
        g.quadraticCurveTo(x + s * 6.5, fy - 53, x + s * 14, fy - 55.5);
        g.quadraticCurveTo(x + s * 9.5, fy - 48.5, x + s * 9.4, fy - 41);
        g.closePath();
        g.fill();
        g.strokeStyle = c2;
        g.lineWidth = 0.9;
        g.beginPath();
        g.moveTo(x + s * 6, fy - 44);
        g.quadraticCurveTo(x + s * 7.4, fy - 51, x + s * 12, fy - 54);
        g.stroke();
        g.fillStyle = c3;
        g.beginPath();
        g.arc(x + s * 13.6, fy - 55.2, 1.1, 0, 6.28);
        g.fill();
      }
      break;
  }
}

// Outfit extras on the head (only when no costume hat is worn): the bear hood's ears.
function avatarCosHood(g, x, fy, b) {
  if (b.style !== 'bear') return;
  for (const s of [-1, 1]) {
    g.fillStyle = b.c1;
    g.beginPath();
    g.arc(x + s * 7.4, fy - 42, 3.6, 0, 6.28);
    g.fill();
    g.fillStyle = b.c2;
    g.beginPath();
    g.arc(x + s * 7.4, fy - 41.8, 1.9, 0, 6.28);
    g.fill();
  }
}

/* ---------- outfits ---------- */
function avatarCosBody(ctx, b) {
  const { g, x, fy, bw, female, seated } = ctx,
    l = x - bw / 2,
    r = x + bw / 2,
    { c1, c2, c3 } = b,
    dk = (k) => avatarShade(c1, k),
    P = (pts, fill) => avatarPoly(g, pts, fill),
    long = !seated;
  switch (b.style) {
    case 'uniform': {
      P([x - 4.4, fy - 27, x + 4.4, fy - 27, x, fy - 15.5], c2); // white shirt
      P([l + 0.6, fy - 27, x - 4.4, fy - 27, x - 0.4, fy - 14.5, x - 3, fy - 9.5, l + 0.6, fy - 9.5], dk(-0.22)); // lapels
      P([r - 0.6, fy - 27, x + 4.4, fy - 27, x + 0.4, fy - 14.5, x + 3, fy - 9.5, r - 0.6, fy - 9.5], dk(-0.22));
      P([x - 1.1, fy - 25.5, x + 1.1, fy - 25.5, x + 1.7, fy - 18, x, fy - 15, x - 1.7, fy - 18], c3); // tie
      g.fillStyle = c2; // blazer crest + buttons
      g.fillRect(l + 2, fy - 21.5, 3, 3.4);
      g.fillStyle = c3;
      g.fillRect(l + 2.8, fy - 20.6, 1.4, 1.5);
      g.fillStyle = '#e8c35a';
      g.fillRect(x + 3.2, fy - 13, 1.3, 1.3);
      g.fillStyle = dk(-0.3);
      g.fillRect(l, fy - 11, bw, 2.2);
      if (female && long) {
        P([x - 8.5, fy - 12, x + 8.5, fy - 12, x + 12.5, fy - 3.2, x - 12.5, fy - 3.2], '#3a4278'); // pleated plaid skirt
        g.fillStyle = 'rgba(255,255,255,.18)';
        for (let i = -3; i <= 3; i++) g.fillRect(x + i * 3.2 - 0.4, fy - 12, 0.8, 8.6);
        g.fillStyle = c3;
        g.fillRect(x - 12, fy - 6.2, 24, 0.9);
      }
      break;
    }
    case 'yukata': {
      if (long) P([l - 0.5, fy - 12, r + 0.5, fy - 12, r + 2.5, fy - 2.4, x, fy - 0.8, l - 2.5, fy - 2.4], c1); // long hem
      g.fillStyle = c2; // floral pattern
      for (const [px, py] of [[-6, -23], [4, -25], [-2, -20], [6, -17.5], [-7, -16], [-4, -9.5], [5, -8], [8, -5], [-9, -5], [0, -4], [-8.5, -2.5], [9, -2.5]]) {
        if ((py > -12 && !long) || (py > -10 && py < -3 && false)) continue;
        g.beginPath();
        g.arc(x + px, fy + py, 1, 0, 6.28);
        g.fill();
        g.globalAlpha = 0.6;
        g.beginPath();
        g.arc(x + px + 1.2, fy + py - 0.6, 0.6, 0, 6.28);
        g.fill();
        g.globalAlpha = 1;
      }
      P([x - 5.6, fy - 27, x - 2.6, fy - 27, x + 3.4, fy - 17.5, x + 0.6, fy - 17.5], '#fff8ff'); // crossed collar
      P([x + 5.6, fy - 27, x + 2.6, fy - 27, x - 3.4, fy - 17.5, x - 0.6, fy - 17.5], dk(-0.3));
      g.fillStyle = c3; // obi
      g.fillRect(l - 0.6, fy - 18, bw + 1.2, 5.6);
      g.fillStyle = 'rgba(255,255,255,.3)';
      g.fillRect(l - 0.6, fy - 18, bw + 1.2, 1);
      g.fillStyle = 'rgba(0,0,0,.2)';
      g.fillRect(l - 0.6, fy - 13.4, bw + 1.2, 1);
      P([r + 0.6, fy - 17, r + 7, fy - 21.5, r + 7, fy - 10.5, r + 0.6, fy - 14], avatarShade(c3, -0.1)); // obi bow
      P([l - 0.6, fy - 17, l - 7, fy - 21.5, l - 7, fy - 10.5, l - 0.6, fy - 14], avatarShade(c3, -0.1));
      g.fillStyle = avatarShade(c3, 0.35);
      g.fillRect(x - 1.5, fy - 17, 3, 4);
      if (long) {
        g.fillStyle = c2;
        g.globalAlpha = 0.55;
        g.fillRect(l - 2.2, fy - 3.6, bw + 4.4, 1.2); // hem trim
        g.globalAlpha = 1;
      }
      break;
    }
    case 'royal': {
      if (long) P([l, fy - 12, r, fy - 12, r + 1.2, fy - 2, x + 3, fy - 5, x, fy - 2, x - 3, fy - 5, l - 1.2, fy - 2], c1); // coat tails
      P([x - 3.4, fy - 27, x + 3.4, fy - 27, x + 3.8, fy - 9, x - 3.8, fy - 9], '#f4efe2'); // waistcoat
      g.fillStyle = c2;
      g.fillRect(x - 4.6, fy - 27, 1.1, 18);
      g.fillRect(x + 3.5, fy - 27, 1.1, 18);
      for (let i = 0; i < 3; i++) g.fillRect(x - 0.6, fy - 23.5 + i * 4.2, 1.2, 1.2);
      P([l, fy - 26, l + 4.2, fy - 26, r, fy - 11.5, r - 4.2, fy - 11.5], '#c0283e'); // sash
      g.fillStyle = c2;
      g.beginPath();
      g.arc(l + 4, fy - 20, 1.9, 0, 6.28); // medal
      g.fill();
      g.fillStyle = '#c0283e';
      g.fillRect(l + 3.2, fy - 18.4, 1.6, 2.6);
      g.fillStyle = c2; // hem + belt
      g.fillRect(l, fy - 11.5, bw, 1.1);
      for (const sx of [l - 1.8, r - 3.2]) {
        g.fillStyle = c2; // epaulettes
        g.fillRect(sx, fy - 28.8, 5, 2.2);
        g.fillStyle = avatarShade(c2, -0.25);
        for (let k = 0; k < 4; k++) g.fillRect(sx + 0.4 + k * 1.2, fy - 26.6, 0.7, 1.8);
      }
      g.fillStyle = c3; // ermine collar
      g.beginPath();
      g.ellipse(x, fy - 27.6, 8.6, 3, 0, 0, 6.28);
      g.fill();
      g.fillStyle = '#2a2a33';
      for (const px of [-5.5, -2, 2, 5.5]) g.fillRect(x + px - 0.5, fy - 27.4, 1, 1.8);
      break;
    }
    case 'bear': {
      g.fillStyle = dk(-0.2);
      g.beginPath();
      g.ellipse(x, fy - 27, 8.8, 3.4, 0, 0, 6.28); // hood behind the neck
      g.fill();
      g.fillStyle = c2; // belly patch
      g.beginPath();
      g.ellipse(x, fy - 16.5, 5.6, 6.6, 0, 0, 6.28);
      g.fill();
      g.fillStyle = dk(-0.3);
      g.fillRect(x - 0.4, fy - 26, 0.8, 8); // zip
      g.fillRect(x - 1.2, fy - 26, 2.4, 1.2);
      g.fillStyle = dk(-0.15);
      g.fillRect(l, fy - 11, bw, 2.6);
      if (ctx.facingUp) {
        g.fillStyle = c2;
        g.beginPath();
        g.arc(x, fy - 11, 3, 0, 6.28); // fluffy tail
        g.fill();
      }
      break;
    }
    case 'piratecoat': {
      P([x - 4.2, fy - 27, x + 4.2, fy - 27, x + 3.4, fy - 11, x - 3.4, fy - 11], '#f4f0e4'); // shirt
      P([x - 3.6, fy - 25, x + 3.6, fy - 25, x + 2.4, fy - 20, x + 0, fy - 17.5, x - 2.4, fy - 20], '#ffffff'); // jabot frill
      g.strokeStyle = 'rgba(0,0,0,.25)';
      g.lineWidth = 0.6;
      g.beginPath();
      g.moveTo(x - 2.2, fy - 24);
      g.lineTo(x, fy - 18.5);
      g.lineTo(x + 2.2, fy - 24);
      g.stroke();
      P([l, fy - 27, x - 4.4, fy - 27, x - 3.4, fy - 9, l, fy - 9], c1); // open coat
      P([r, fy - 27, x + 4.4, fy - 27, x + 3.4, fy - 9, r, fy - 9], c1);
      g.fillStyle = c2; // gold edging + buttons
      g.fillRect(x - 5.2, fy - 27, 1, 18);
      g.fillRect(x + 4.2, fy - 27, 1, 18);
      for (let i = 0; i < 3; i++) {
        g.fillRect(l + 2, fy - 23 + i * 4, 1.4, 1.4);
        g.fillRect(r - 3.4, fy - 23 + i * 4, 1.4, 1.4);
      }
      g.fillStyle = c3; // belt
      g.fillRect(l, fy - 14.2, bw, 2.4);
      g.fillStyle = c2;
      g.fillRect(x - 1.9, fy - 14.6, 3.8, 3.2);
      g.fillStyle = c3;
      g.fillRect(x - 0.8, fy - 13.6, 1.6, 1.2);
      if (long) {
        P([l - 0.5, fy - 9, r + 0.5, fy - 9, r + 2.4, fy - 1.6, x + 3, fy - 4.4, x, fy - 1.6, x - 3, fy - 4.4, l - 2.4, fy - 1.6], c1); // tails
        g.fillStyle = c2;
        g.fillRect(l - 0.5, fy - 9.6, bw + 1, 0.9);
      }
      for (const sx of [l - 1.4, r - 3]) {
        g.fillStyle = c2; // epaulettes
        g.fillRect(sx, fy - 28.4, 4.4, 1.8);
      }
      break;
    }
    case 'astro': {
      g.fillStyle = 'rgba(0,0,0,.1)';
      g.fillRect(x + bw / 2 - 5, fy - 27, 5, 19);
      g.fillStyle = c2; // orange stripes
      g.fillRect(l, fy - 12.4, bw, 2.1);
      g.fillRect(l, fy - 26.4, 3.2, 0.1);
      P([l, fy - 27, l + 3.6, fy - 27, l + 3.6, fy - 22.5, l, fy - 22.5], c2); // shoulder patches
      P([r, fy - 27, r - 3.6, fy - 27, r - 3.6, fy - 22.5, r, fy - 22.5], c2);
      g.fillStyle = c3; // chest control panel
      avatarRound(g, x - 5.2, fy - 24, 10.4, 7.6, 1.6);
      g.fill();
      for (const [px, col] of [[-3, '#ff5a50'], [0, '#6fe08a'], [3, '#6fa8ff']]) {
        g.fillStyle = col;
        g.beginPath();
        g.arc(x + px, fy - 21.5, 1, 0, 6.28);
        g.fill();
      }
      g.fillStyle = '#9aa3b4';
      g.fillRect(x - 3.8, fy - 19.3, 7.6, 0.9);
      g.fillStyle = '#c9ced4'; // neck ring
      g.beginPath();
      g.ellipse(x, fy - 27.4, 7.4, 2.7, 0, 0, 6.28);
      g.fill();
      g.strokeStyle = c3;
      g.lineWidth = 0.8;
      g.stroke();
      g.fillStyle = c3; // belt
      g.fillRect(l, fy - 14.5, bw, 1.8);
      g.fillStyle = '#d93a4a'; // flag patch
      g.fillRect(l + 1, fy - 16.8, 3, 1.6);
      break;
    }
  }
}

function avatarCosSleeves(ctx, b) {
  const { g, x, fy, bw, arm, hold } = ctx,
    arms = [x - bw / 2 - 3, x + bw / 2],
    { c1, c2, c3 } = b;
  for (let i = 0; i < 2; i++) {
    if (hold && hold[i]) continue;
    const ax = arms[i] + arm[2 + i],
      y0 = fy + arm[i],
      sl = (c, h = 8, w = 3.4, dx = -0.2) => {
        g.fillStyle = c;
        g.fillRect(ax + dx, y0 - 25.5, w, h);
      },
      cuff = (c, y = 18.2, h = 2, w = 4, dx = -0.5) => {
        g.fillStyle = c;
        g.fillRect(ax + dx, y0 - y, w, h);
      };
    switch (b.style) {
      case 'uniform':
        sl(c1);
        cuff(c2, 18.2, 1.3);
        break;
      case 'yukata': // wide hanging sleeves
        sl(c1, 11, 5.6, -1.3);
        cuff(c2, 15, 0.9, 5.6, -1.3);
        g.fillStyle = 'rgba(0,0,0,.15)';
        g.fillRect(ax - 1.3, y0 - 16.2, 5.6, 1.2);
        break;
      case 'royal':
        sl(c1);
        cuff(c2, 19.4, 1.1);
        cuff(c3, 18.3, 1.6);
        break;
      case 'bear':
        sl(c1, 10);
        g.fillStyle = c2;
        g.beginPath();
        g.arc(ax + 1.5, y0 - 15.5, 2.6, 0, 6.28); // paw
        g.fill();
        break;
      case 'piratecoat':
        sl(c1);
        cuff('#f4f0e4', 19.4, 3, 5, -1);
        cuff(c2, 21, 0.9, 4, -0.5);
        break;
      case 'astro':
        sl(c1);
        cuff(c3, 19.2, 1.2);
        cuff('#c9ced4', 18, 2.4, 4.2, -0.6);
        break;
      default:
        sl(c1, 4);
    }
  }
}

/* ---------- cape & wings ---------- */
function avatarCosBack(ctx, b, front) {
  const { g, x, fy, bw, o, t, facingUp, side } = ctx,
    { c1, c2, c3 } = b,
    moving = o.moving ? 1 : 0,
    flap = moving ? Math.sin(t * 9) * 3 : Math.sin(t * 2.2) * 1.6,
    P = (pts, fill) => avatarPoly(g, pts, fill);
  if (front && !facingUp) {
    if (b.style === 'cape') {
      // clasp chain and collar ties at the shoulders
      g.fillStyle = c3;
      g.beginPath();
      g.arc(x - 6.6, fy - 27.4, 1.6, 0, 6.28);
      g.arc(x + 6.6, fy - 27.4, 1.6, 0, 6.28);
      g.fill();
      g.strokeStyle = c3;
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(x - 6.6, fy - 27);
      g.quadraticCurveTo(x, fy - 23.6, x + 6.6, fy - 27);
      g.stroke();
    }
    return;
  }
  if ((front && !facingUp) || (!front && facingUp)) return;
  const wing = (s) => {
    const ox = x + s * 5,
      oy = fy - 23;
    g.lineJoin = 'round';
    if (b.style === 'angel') {
      const len = 25,
        fl = flap * s;
      for (let row = 2; row >= 0; row--) {
        const L = len * (0.62 + row * 0.19),
          lift = 7 - row * 4;
        g.fillStyle = row === 2 ? c1 : row === 1 ? avatarShade(c1, -0.07) : c2;
        g.beginPath();
        g.moveTo(ox, oy - row * 1.4);
        g.quadraticCurveTo(ox + s * L * 0.55, oy - 17 - lift * 0.5 + flap, ox + s * L, oy - 10 - lift + flap);
        for (let k = 1; k <= 4; k++) {
          const f = 1 - k / 4;
          g.quadraticCurveTo(ox + s * L * (f + 0.17), oy - 3 + k * 2.6 + flap * f - row * 0.5, ox + s * L * f, oy - 5 + k * 2.2 + row * 1.2 + flap * f * 0.5 + 2);
        }
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(80,100,160,.28)';
        g.lineWidth = 0.7;
        g.stroke();
      }
      void fl;
    } else if (b.style === 'fairy') {
      g.lineWidth = 0.9;
      const parts = [
        [10, -13, 6.4, 14, 0.62, 1],
        [8, 1.5, 4.8, 9.5, 0.3, 0.8],
      ];
      for (const [dx, dy, rx, ry, rot, sc] of parts) {
        g.save();
        g.translate(ox + s * dx * sc * 1.1, oy + dy * sc + flap * 0.6);
        g.rotate(s * (rot + flap * 0.02));
        g.globalAlpha = 0.5;
        g.fillStyle = c1;
        g.beginPath();
        g.ellipse(0, 0, rx, ry, 0, 0, 6.28);
        g.fill();
        g.globalAlpha = 0.95;
        g.strokeStyle = c2;
        g.stroke();
        g.globalAlpha = 0.5;
        g.beginPath();
        g.moveTo(0, -ry + 1);
        g.lineTo(0, ry - 1);
        g.moveTo(0, -ry * 0.2);
        g.lineTo(rx * 0.8, -ry * 0.55);
        g.stroke();
        g.globalAlpha = 1;
        g.restore();
      }
      g.fillStyle = c3; // glitter
      for (let k = 0; k < 3; k++) {
        const ph = (t * 1.3 + k * 0.33 + (s > 0 ? 0.15 : 0)) % 1;
        g.globalAlpha = Math.sin(ph * Math.PI);
        g.fillRect(ox + s * (8 + k * 4) - 0.6, oy - 16 + k * 5 - 0.6, 1.2, 1.2);
      }
      g.globalAlpha = 1;
    } else if (b.style === 'dragonwing') {
      const W = [ox + s * 14, oy - 17 + flap],
        T1 = [ox + s * 28, oy - 13 + flap],
        T2 = [ox + s * 25, oy - 2 + flap * 0.6],
        T3 = [ox + s * 17, oy + 6 + flap * 0.3];
      g.fillStyle = c1;
      g.beginPath();
      g.moveTo(ox, oy - 2);
      g.lineTo(W[0], W[1]);
      g.lineTo(T1[0], T1[1]);
      g.quadraticCurveTo(ox + s * 24, oy - 8 + flap * 0.8, T2[0], T2[1]);
      g.quadraticCurveTo(ox + s * 20, oy + 0.5 + flap * 0.5, T3[0], T3[1]);
      g.quadraticCurveTo(ox + s * 9, oy + 1, ox, oy + 4);
      g.closePath();
      g.fill();
      g.strokeStyle = c2;
      g.lineWidth = 1.3;
      for (const T of [T1, T2, T3]) {
        g.beginPath();
        g.moveTo(W[0], W[1]);
        g.lineTo(T[0], T[1]);
        g.stroke();
      }
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(ox, oy - 2);
      g.lineTo(W[0], W[1]);
      g.stroke();
      g.fillStyle = c3;
      g.beginPath();
      g.arc(W[0], W[1], 1.5, 0, 6.28);
      g.fill();
    }
  };
  if (b.style === 'cape') {
    const sway = moving ? Math.sin(o.walk || 0) * 2 : Math.sin(t * 1.6) * 0.8,
      hem = fy - 3,
      tr = (front ? 0 : side * 4) + sway;
    P([x - bw / 2 - 1, fy - 27, x + bw / 2 + 1, fy - 27, x + bw / 2 + 5 + tr, hem, x - bw / 2 - 5 + tr, hem], c2);
    P([x - bw / 2 + 1, fy - 27, x + bw / 2 - 1, fy - 27, x + bw / 2 + 2.5 + tr, hem - 1, x - bw / 2 - 2.5 + tr, hem - 1], c1);
    g.fillStyle = 'rgba(255,255,255,.14)';
    g.fillRect(x - 2 + tr * 0.3, fy - 26, 1.2, 21);
    g.fillStyle = c3;
    g.fillRect(x - bw / 2 - 5 + tr, hem - 1.2, bw + 10, 1.2);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(x + 3 + tr * 0.6, fy - 26, 1.4, 22);
    return;
  }
  wing(-1);
  wing(1);
  if (b.style === 'angel') {
    g.strokeStyle = c3; // halo
    g.lineWidth = 1.8;
    g.beginPath();
    g.ellipse(x, fy - 52.5 + Math.sin(t * 2) * 0.6, 7, 2.2, 0, 0, 6.28);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.7)';
    g.lineWidth = 0.6;
    g.stroke();
  }
}
