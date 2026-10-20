/**
 * Rendering: name plates, players, NPCs and monsters.
 */
// Modern MMORPG-style name plate: clean semi-bold sans (Rajdhani), dark outline + soft shadow,
// a subtle top-to-bottom tint, and a small letter-spaced guild line.
// above (optional): guild name, drawn above the name. sub (optional): small line below the name.
const PLATE_FONT = '"Rajdhani","Nunito Sans",system-ui,sans-serif';
try {
  if (document.fonts && document.fonts.load) {
    document.fonts.load('700 13px "Rajdhani"');
    document.fonts.load('600 11px "Rajdhani"');
  }
} catch (e) {}
function plateText(txt, x, y, size, weight, col, spacing, tint) {
  ctx.font = weight + ' ' + size + 'px ' + PLATE_FONT;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  try {
    ctx.letterSpacing = spacing + 'px';
  } catch (e) {}
  ctx.shadowColor = 'rgba(0,0,0,.55)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(8,10,18,.92)';
  ctx.strokeText(txt, x, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.15);
  g.addColorStop(0, tint || col);
  g.addColorStop(1, col);
  ctx.fillStyle = g;
  ctx.fillText(txt, x, y);
  try {
    ctx.letterSpacing = '0px';
  } catch (e) {}
}
function plate(x, y, name, sub, col, above) {
  if (above) plateText(above.toUpperCase(), x, y - 12, 10.5, 600, '#f2c14e', 1.4, '#fff0b8');
  if (sub) plateText(sub, x, y + 12, 10.5, 600, '#ffe28a', 0.4);
  plateText(name, x, y, 13.5, 700, col, 0.5, '#ffffff');
}
function drawPerson(x, y, face, o) {
  drawAvatar(ctx, x, y, face, o, time);
}
function drawMob(m) {
  const T = m.t,
    r = T.r,
    x = m.x - cam.x,
    y = m.y - cam.y,
    bob = Math.sin(time * 5 + m.ph),
    f = Math.cos(m.face) >= 0 ? 1 : -1;
  shadow(x, y + 3, r * 1.1, r * 0.45);
  ctx.save();
  ctx.translate(x, y);
  const eye = (ex, ey, s = 2) => {
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex, ey, s, 0, 6.28);
    ctx.fill();
  };
  switch (T.shape) {
    case 'dummy': {
      // wooden training dummy: post, crossbar, straw body with a bullseye; wobbles when hit
      ctx.rotate(m.flash > 0 ? Math.sin(time * 70) * 0.06 : 0);
      ctx.fillStyle = '#5a4026';
      ctx.fillRect(-9, -3, 18, 5);
      ctx.fillStyle = T.col;
      ctx.fillRect(-3, -42, 6, 40);
      ctx.fillRect(-18, -36, 36, 5);
      ctx.fillStyle = T.col2;
      ctx.beginPath();
      ctx.ellipse(0, -24, 11, 15, 0, 0, 6.28);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -46, 8, 0, 6.28);
      ctx.fill();
      ctx.strokeStyle = '#9a7a4a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, -46);
      ctx.lineTo(6, -46);
      ctx.moveTo(0, -50);
      ctx.lineTo(0, -42);
      ctx.stroke();
      [
        ['#c9402f', 8],
        ['#f2ead6', 5.5],
        ['#c9402f', 3],
      ].forEach(([c, rr]) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, -24, rr, 0, 6.28);
        ctx.fill();
      });
      ctx.fillStyle = T.col2;
      ctx.beginPath();
      ctx.arc(-18, -33.5, 3.5, 0, 6.28);
      ctx.arc(18, -33.5, 3.5, 0, 6.28);
      ctx.fill();
      break;
    }
    case 'slime': {
      const sq = 1 + bob * 0.08;
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.75, r * 1.1 * sq, (r * 0.85) / sq, 0, Math.PI, 0);
      ctx.lineTo(r * 1.1 * sq, -r * 0.1);
      ctx.quadraticCurveTo(0, r * 0.25, -r * 1.1 * sq, -r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.4, -r * 1.1, r * 0.25, r * 0.14, -0.5, 0, 6.28);
      ctx.fill();
      eye(-r * 0.35, -r * 0.5, r * 0.11 + 1);
      eye(r * 0.35, -r * 0.5, r * 0.11 + 1);
      if (T.boss) {
        ctx.fillStyle = '#ffd24a';
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 1.5);
        ctx.lineTo(-r * 0.5, -r * 1.9);
        ctx.lineTo(-r * 0.2, -r * 1.65);
        ctx.lineTo(0, -r * 2);
        ctx.lineTo(r * 0.2, -r * 1.65);
        ctx.lineTo(r * 0.5, -r * 1.9);
        ctx.lineTo(r * 0.5, -r * 1.5);
        ctx.fill();
      }
      break;
    }
    case 'mush': {
      ctx.fillStyle = T.col2;
      ctx.fillRect(-6, -16 + bob, 12, 16);
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.ellipse(0, -18 + bob, r + 4, r - 1, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-r - 4, -18 + bob, (r + 4) * 2, 3);
      ctx.fillStyle = '#fff';
      for (const [a, b] of [
        [-6, -24],
        [5, -26],
        [0, -20],
      ]) {
        ctx.beginPath();
        ctx.arc(a, b + bob, 2.6, 0, 6.28);
        ctx.fill();
      }
      eye(-3, -9 + bob);
      eye(3, -9 + bob);
      break;
    }
    case 'boar': {
      ctx.scale(f, 1);
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.ellipse(0, -14, r + 2, r * 0.75, 0, 0, 6.28);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(r, -12, 9, 8, 0, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = T.col2;
      ctx.beginPath();
      ctx.moveTo(r + 5, -8);
      ctx.lineTo(r + 12, -14);
      ctx.lineTo(r + 8, -6);
      ctx.fill();
      ctx.fillStyle = '#2b1a10';
      ctx.fillRect(-8, -6, 4, 6 + bob);
      ctx.fillRect(6, -6, 4, 6 - bob);
      eye(r + 2, -16);
      break;
    }
    case 'wolf': {
      ctx.scale(f, 1);
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.ellipse(0, -14, r + 4, r * 0.65, 0, 0, 6.28);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r, -24);
      ctx.lineTo(r + 14, -14);
      ctx.lineTo(r + 2, -6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r + 2, -24);
      ctx.lineTo(r + 4, -32);
      ctx.lineTo(r + 8, -23);
      ctx.fill();
      ctx.strokeStyle = T.col;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-r - 2, -14);
      ctx.quadraticCurveTo(-r - 12, -20, -r - 10, -8 + bob * 3);
      ctx.stroke();
      ctx.fillStyle = '#4a4f58';
      ctx.fillRect(-9, -6, 4, 6 + bob);
      ctx.fillRect(7, -6, 4, 6 - bob);
      eye(r + 6, -16);
      break;
    }
    case 'goblin': {
      ctx.fillStyle = T.col2;
      ctx.fillRect(-7, -16, 14, 12);
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.arc(0, -24 + bob, 10, 0, 6.28);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9, -26);
      ctx.lineTo(-18, -30);
      ctx.lineTo(-9, -21);
      ctx.moveTo(9, -26);
      ctx.lineTo(18, -30);
      ctx.lineTo(9, -21);
      ctx.fill();
      eye(-3.5, -25 + bob);
      eye(3.5, -25 + bob);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(10 * f, -26, 4, 22);
      ctx.fillRect(8 * f, -30, 8, 8);
      break;
    }
    case 'spider': {
      ctx.strokeStyle = T.col;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const o = (i - 1.5) * 5,
          w = Math.sin(time * 9 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(o, -8);
        ctx.lineTo(o - 14, -14 + w);
        ctx.lineTo(o - 18, 2);
        ctx.moveTo(o, -8);
        ctx.lineTo(o + 14, -14 - w);
        ctx.lineTo(o + 18, 2);
        ctx.stroke();
      }
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.ellipse(0, -10, 11, 9, 0, 0, 6.28);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -18, 6, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = T.col2;
      ctx.fillRect(-4, -20, 2, 2);
      ctx.fillRect(2, -20, 2, 2);
      ctx.fillRect(-1, -14, 2, 3);
      break;
    }
    case 'treant': {
      ctx.fillStyle = T.col;
      ctx.fillRect(-14, -52, 28, 52);
      ctx.fillRect(-30, -44 + bob * 2, 16, 6);
      ctx.fillRect(14, -44 - bob * 2, 16, 6);
      ctx.fillStyle = T.col2;
      for (const [a, b, c] of [
        [-18, -62, 24],
        [16, -62, 24],
        [0, -78, 28],
        [-4, -60, 22],
      ]) {
        ctx.beginPath();
        ctx.arc(a, b, c, 0, 6.28);
        ctx.fill();
      }
      ctx.fillStyle = '#ffb347';
      ctx.fillRect(-9, -40, 6, 5);
      ctx.fillRect(4, -40, 6, 5);
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(-6, -28, 12, 4);
      break;
    }
    case 'skel': {
      ctx.strokeStyle = T.col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(0, -10);
      ctx.moveTo(-7, -22);
      ctx.lineTo(7, -22);
      ctx.moveTo(-6, -17);
      ctx.lineTo(6, -17);
      ctx.moveTo(-5, -10);
      ctx.lineTo(-6 + bob, 0);
      ctx.moveTo(5, -10);
      ctx.lineTo(6 - bob, 0);
      ctx.moveTo(8, -24);
      ctx.lineTo(16, -12);
      ctx.stroke();
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.arc(0, -33, 8, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.fillRect(-5, -35, 3.5, 4);
      ctx.fillRect(1.5, -35, 3.5, 4);
      ctx.fillStyle = '#bbb';
      ctx.fillRect(15, -30, 3, 22);
      break;
    }
    case 'wraith': {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.moveTo(-13, 0 + bob * 2);
      for (let i = 0; i <= 4; i++) ctx.lineTo(-13 + i * 6.5, (i % 2 ? -4 : 2) + Math.sin(time * 6 + i) * 2);
      ctx.lineTo(13, -20);
      ctx.quadraticCurveTo(0, -52, -13, -20);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#10142a';
      ctx.beginPath();
      ctx.ellipse(0, -26, 6, 7, 0, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = T.col2;
      ctx.fillRect(-4, -28, 2.5, 3);
      ctx.fillRect(1.5, -28, 2.5, 3);
      break;
    }
    case 'golem': {
      ctx.fillStyle = T.col;
      ctx.fillRect(-14, -34, 28, 28);
      ctx.fillRect(-9, -46, 18, 14);
      ctx.fillRect(-26, -32 + bob, 12, 22);
      ctx.fillRect(14, -32 - bob, 12, 22);
      ctx.fillRect(-11, -8, 9, 8);
      ctx.fillRect(3, -8, 9, 8);
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.fillRect(-14, -14, 28, 8);
      ctx.fillStyle = T.col2;
      ctx.fillRect(-6, -42, 4, 4);
      ctx.fillRect(2, -42, 4, 4);
      ctx.fillRect(-3, -24, 6, 6);
      break;
    }
    case 'lich': {
      ctx.fillStyle = T.col;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-12, -48);
      ctx.lineTo(12, -48);
      ctx.lineTo(22, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e6e2d3';
      ctx.beginPath();
      ctx.arc(0, -56, 11, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.fillRect(-6, -58, 4, 5);
      ctx.fillRect(2, -58, 4, 5);
      ctx.fillStyle = '#ffd24a';
      ctx.beginPath();
      ctx.moveTo(-11, -64);
      ctx.lineTo(-11, -74);
      ctx.lineTo(-5, -68);
      ctx.lineTo(0, -77);
      ctx.lineTo(5, -68);
      ctx.lineTo(11, -74);
      ctx.lineTo(11, -64);
      ctx.fill();
      ctx.strokeStyle = '#6b4a2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(26, -4);
      ctx.lineTo(26, -60);
      ctx.stroke();
      ctx.fillStyle = T.col2;
      ctx.beginPath();
      ctx.arc(26, -64 + bob * 2, 7, 0, 6.28);
      ctx.fill();
      break;
    }
  }
  if (m.flash > 0) {
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.8, r * 1.1, 0, 6.28);
    ctx.fill();
  }
  if (m.stun > 0) {
    ctx.fillStyle = '#ffe066';
    for (let i = 0; i < 3; i++) {
      const a = time * 6 + i * 2.1;
      ctx.fillRect(Math.cos(a) * r * 0.7 - 2, -r * 2.2 + Math.sin(a) * 4, 4, 4);
    }
  }
  if (m.pois) {
    ctx.fillStyle = '#8be36a';
    ctx.beginPath();
    ctx.arc(r * 0.5, -r * 2 + Math.sin(time * 8) * 3, 3, 0, 6.28);
    ctx.fill();
  }
  ctx.restore();
  const top = -(T.shape === 'treant'
    ? 96
    : T.shape === 'lich'
      ? 90
      : T.shape === 'slime'
        ? r * 2 + (T.boss ? 14 : 2)
        : T.shape === 'golem'
          ? 58
          : 44);
  if (T.dummy) {
    plate(x, y + 24, T.n, m.last ? 'Last hit: ' + m.last.toLocaleString() : 'Hit me!', '#ffd27a');
    return;
  }
  if (m.hp < m.max || P.target === m || m.agg) {
    const w = Math.max(28, r * 2),
      by = y + 8 + Math.round(r * 0.3); // under the feet, like the player's plate
    ctx.fillStyle = '#000';
    ctx.fillRect(x - w / 2 - 1, by - 1, w + 2, 7);
    ctx.fillStyle = '#531f1f';
    ctx.fillRect(x - w / 2, by, w, 5);
    ctx.fillStyle = '#e5524d';
    ctx.fillRect(x - w / 2, by, w * Math.max(0, m.hp / m.max), 5);
    plate(
      x,
      by + 18,
      T.n,
      'Lv.' + T.lv,
      T.boss ? '#ff9a6a' : P.lvl - T.lv >= 5 ? '#9aa5ad' : T.lv - P.lvl >= 4 ? '#ff6b61' : '#ffffff',
    );
  }
}
