/**
 * Rendering: scene composition, floating text and minimap.
 */
function render() {
  ctx.setTransform(Z, 0, 0, Z, 0, 0);
  drawGround();
  // portals
  for (const p of M.portals) {
    const x = p.x - cam.x,
      y = p.y - cam.y;
    if (x < -120 || x > VWw + 120 || y < -120 || y > VHw + 120) continue;
    if (p.door) {
      // building doors glow on the building itself; only show a prompt when you are close
      if (Math.hypot(p.x - P.x, p.y - P.y) < 150) plate(x, y + (p.exit ? -36 : 34), p.exit ? 'Exit' : 'Enter', p.exit ? '' : p.label, '#e2d4ff');
      continue;
    }
    const g = ctx.createRadialGradient(x, y, 4, x, y, 50);
    g.addColorStop(0, 'rgba(200,170,255,.95)');
    g.addColorStop(1, 'rgba(110,80,220,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, 52, 40, 0, 0, 6.28);
    ctx.fill();
    ctx.strokeStyle = '#d9c8ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + Math.sin(time * 3) * 3, 22, 0, 0, 6.28);
    ctx.stroke();
    // labels sit below portals on the north edge so they don't get cut off
    plate(x, p.y < 100 ? y + 64 : y - 48, p.label, '', '#e2d4ff');
  }
  const list = [];
  for (const o of M.obs) {
    const sy = (o.w ? o.y + o.h : o.y) - cam.y,
      sx = (o.w ? o.x + o.w / 2 : o.x) - cam.x;
    if (sx < -200 || sx > VWw + 200 || sy < -120 || sy > VHw + 200) continue;
    list.push({ y: sy + cam.y, f: () => drawObs(o, o.x - cam.x, o.y - cam.y) });
  }
  for (const n of M.npcs)
    list.push({
      y: n.y,
      f: () => {
        drawPerson(n.x - cam.x, n.y - cam.y, Math.PI / 2, {
          col: n.col,
          hair: n.hair,
          tier: 0,
          job: 'npc',
          moving: 0,
          walk: 0,
          swing: 0,
          gear: n.fam ? gearLook({ head: n.fam + '_head_4' }) : null,
          cos: n.cos ? cosLook(n.cos) : null,
        });
        plate(n.x - cam.x, n.y - cam.y - 62, n.n, n.title, '#9ef0c0');
        const mk = typeof npcMark === 'function' ? npcMark(n) : '';
        if (mk) {
          ctx.fillStyle = mk === '?' ? '#7fe3ff' : '#ffd24a';
          ctx.font = '800 22px "Pixelify Sans",monospace';
          ctx.textAlign = 'center';
          ctx.fillText(mk, n.x - cam.x, n.y - cam.y - 92 + Math.sin(time * 5) * 3);
        } else if (n.id === 'job' && P.lvl >= JOB2LV && J().tier === 1) {
          ctx.fillStyle = '#ffd24a';
          ctx.font = '800 22px "Pixelify Sans",monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', n.x - cam.x, n.y - cam.y - 92 + Math.sin(time * 5) * 3);
        }
      },
    });
  for (const m of M.mobs)
    if (!m.dead)
      list.push({
        y: m.y,
        f: () => {
          if (P.target === m) {
            ctx.strokeStyle = '#ff6b61';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(m.x - cam.x, m.y - cam.y + 3, m.r + 6, (m.r + 6) * 0.45, 0, 0, 6.28);
            ctx.stroke();
          }
          drawMob(m);
        },
      });
  if (P.pet && P.petS) list.push({ y: P.petS.y, f: drawPet });
  list.push({
    y: P.y,
    f: () => {
      const j = J();
      drawPerson(P.x - cam.x, P.y - cam.y, P.face, {
        look: P.look,
        col: j.col,
        hair: j.hair,
        tier: j.tier,
        job: P.job,
        weapon: j.weapon,
        moving: P.moving,
        mv: P.mv,
        sq: P.sq,
        walk: P.walk,
        swing: P.swing,
        swingDur: P.swingDur,
        swingArm: P.arm || 0,
        flash: P.flash,
        wield: P.wield || 0,
        sit: P.sitT || 0,
        gear: gearLook(P.equip),
        cos: cosLook(P.equip),
      });
      // white name for 1st job, blue for 2nd job
      // guild name (if any) on top, player name below; the level label is hidden
      plate(P.x - cam.x, P.y - cam.y + (P.guildName ? 44 : 33), P.name, '', j.tier === 2 ? '#4aa8ff' : '#ffffff', P.guildName || '');
      // thin bars under the hero: HP (red), MP (blue) and the attack bar (green).
      // The green bar fills while the weapon recharges; when it is full the next attack can fire.
      const w = 36,
        bx = P.x - cam.x - w / 2,
        by = P.y - cam.y + 8,
        ready = P.atkCd <= 0,
        fill = ready ? 1 : clamp(1 - P.atkCd / (P.atkCdMax || 0.5), 0, 1);
      ctx.fillStyle = '#000';
      ctx.fillRect(bx - 1, by - 1, w + 2, 12);
      ctx.fillStyle = '#3a1816';
      ctx.fillRect(bx, by, w, 3);
      ctx.fillStyle = '#e5524d';
      ctx.fillRect(bx, by, w * clamp(P.hp / P.st.max, 0, 1), 3);
      ctx.fillStyle = '#16233d';
      ctx.fillRect(bx, by + 4, w, 3);
      ctx.fillStyle = '#4b8df2';
      ctx.fillRect(bx, by + 4, w * clamp(P.mp / P.st.maxMp, 0, 1), 3);
      ctx.fillStyle = '#17301d';
      ctx.fillRect(bx, by + 8, w, 2);
      ctx.fillStyle = ready ? '#b6ffb0' : '#4fd66a';
      ctx.fillRect(bx, by + 8, w * fill, 2);
    },
  });
  list.sort((a, b) => a.y - b.y);
  for (const l of list) l.f();
  drawFx();
  // floating text
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  for (const f of floats) {
    const sx = f.x - cam.x,
      sy = f.y - cam.y;
    // modern style: clean geometric font, no outline. Quick "pop" in, then drifts up while fading.
    const e = Math.min(1, f.t / 0.16),
      pop = e < 1 ? 0.6 + 0.4 * (1 + 2.2 * Math.pow(e - 1, 3) + 1.2 * Math.pow(e - 1, 2)) : 1, // ease-out-back
      sz = Math.round(f.size * pop * (f.crit ? 1.1 : 1)),
      FONT = '"Outfit","Nunito Sans",system-ui,sans-serif';
    ctx.globalAlpha = Math.max(0, Math.min(1, (1 - f.t) * 1.7, f.t * 14 + 0.3));
    ctx.font = '700 ' + sz + 'px ' + FONT;
    if (f.crit) {
      const w = ctx.measureText(f.txt).width,
        g = ctx.createLinearGradient(0, sy - sz * 0.8, 0, sy);
      g.addColorStop(0, '#fff3b0');
      g.addColorStop(1, '#ffa928');
      // glassy "CRIT" pill above the number
      const ls = Math.max(8, Math.round(sz * 0.36)),
        pw = ls * 2.9,
        ph = ls * 1.45,
        py = sy - sz * 0.98 - ph / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(255,150,0,.55)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = g;
      ctx.fillText(f.txt, sx, sy);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = 'rgba(255,120,20,.92)';
      ctx.beginPath();
      ctx.roundRect(sx - pw / 2, py - ph / 2, pw, ph, ph / 2);
      ctx.fill();
      ctx.font = '700 ' + ls + 'px ' + FONT;
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText('CRIT', sx, py + 0.5);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1.5;
      ctx.fillStyle = f.col;
      ctx.fillText(f.txt, sx, sy);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  // minimap
  const mw = Math.min(150, VWw * 0.28),
    mh = (mw * M.h) / M.w,
    mx0 = VWw - mw - 14 / Z,
    my0 = infoBottom / Z + 6;
  miniBottom = (my0 + mh + 3) * Z;
  if (!SET.minimap) miniBottom = infoBottom;
  else {
    ctx.fillStyle = 'rgba(14,9,4,.88)';
    ctx.fillRect(mx0 - 3, my0 - 3, mw + 6, mh + 6);
    ctx.fillStyle = THEMES[M.theme].a;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(mx0, my0, mw, mh);
    ctx.globalAlpha = 1;
    const sx = mw / M.w;
    for (const p of M.portals) {
      ctx.fillStyle = '#c9a0ff';
      ctx.fillRect(mx0 + p.x * sx - 3, my0 + p.y * sx - 3, 6, 6);
    }
    for (const n of M.npcs) {
      ctx.fillStyle = '#9ef0c0';
      ctx.fillRect(mx0 + n.x * sx - 1.5, my0 + n.y * sx - 1.5, 3, 3);
    }
    for (const m of M.mobs)
      if (!m.dead && !m.t.dummy) {
        ctx.fillStyle = m.t.boss ? '#ff9a6a' : '#ff5a50';
        const s = m.t.boss ? 4 : 2;
        ctx.fillRect(mx0 + m.x * sx - s / 2, my0 + m.y * sx - s / 2, s, s);
      }
    ctx.fillStyle = '#7fe3ff';
    ctx.fillRect(mx0 + P.x * sx - 2.5, my0 + P.y * sx - 2.5, 5, 5);
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx0 + cam.x * sx, my0 + cam.y * sx, Math.min(mw, VWw * sx), Math.min(mh, VHw * sx));
    // classic frame: black outline, gold rim, bronze inner line, corner studs
    ctx.strokeStyle = '#0b0704';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(mx0 - 4, my0 - 4, mw + 8, mh + 8);
    ctx.strokeStyle = '#c99a3e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx0 - 3, my0 - 3, mw + 6, mh + 6);
    ctx.strokeStyle = '#4a3515';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx0 - 1.25, my0 - 1.25, mw + 2.5, mh + 2.5);
    ctx.fillStyle = '#ffd987';
    for (const [cx, cy] of [[mx0 - 3, my0 - 3], [mx0 + mw + 3, my0 - 3], [mx0 - 3, my0 + mh + 3], [mx0 + mw + 3, my0 + mh + 3]]) ctx.fillRect(cx - 2, cy - 2, 4, 4);
  }
}
