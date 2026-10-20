/**
 * Per-frame simulation: player, monsters, projectiles, zones and camera.
 */
/* ---------------- update ---------------- */
function update(dt) {
  time += dt;
  if (!(P.mv >= 0)) P.vx = P.vy = P.mv = P.sq = P.stepIdx = P.stepCd = 0; // older saves / heroes made before the smooth-movement update
  calcStats();
  const st = P.st;
  // timers
  if (P.echo && !P.dash && !transition) {
    P.echo.t -= dt;
    if (P.echo.t <= 0) {
      const b = J().basic;
      if (!P.echo.auto) ft(P.x, P.y - 52, 'DOUBLE!', '#e0d0ff', 13);
      perform(b, P.echo.dir, b.mult);
      P.echo = null;
    }
  } else if (P.echo) P.echo = null;
  P.atkCd -= dt;
  P.potCd -= dt;
  P.flash -= dt;
  P.swing -= dt;
  // weapon stays in hand (idle sway) for a while after an attack, then is put away
  // while walking the weapon is put away (fades out in ~0.12s); it comes back out as soon as you attack / dash
  if (P.swing > 0 || P.dash) P.wield = WIELD_HOLD;
  else if (P.moving) P.wield = Math.max(0, Math.min(P.wield || 0, 0.12) - dt);
  else P.wield = Math.max(0, (P.wield || 0) - dt);
  P.combat -= dt;
  portalCd -= dt;
  for (const k in P.cds) if (P.cds[k] > 0) P.cds[k] -= dt;
  for (const k in P.buffs) {
    P.buffs[k].t -= dt;
    if (P.buffs[k].t <= 0) {
      delete P.buffs[k];
    }
  }
  // regen (sitting adds a faster rate once the character has fully sat down)
  const safe = M.safe;
  const seated = P.sit && P.sitT >= 1;
  // no free regen in the village / interiors: heal at the fountain healer (or sit)
  const hpRate = Math.max(safe ? 0 : 0.006, seated ? SIT_REGEN.hp : 0);
  const mpRate = Math.max(safe ? 0 : 0.02, seated ? SIT_REGEN.mp : 0);
  const hp0 = P.hp,
    mp0 = P.mp;
  P.hp = Math.min(st.max, P.hp + st.max * hpRate * dt);
  P.mp = Math.min(st.maxMp, P.mp + st.maxMp * mpRate * dt);
  if (seated) {
    // show what sitting restores, once per second
    P.sitAcc.hp += P.hp - hp0;
    P.sitAcc.mp += P.mp - mp0;
    P.sitAcc.t += dt;
    if (P.sitAcc.t >= 1) {
      if (P.sitAcc.hp >= 1) ft(P.x - 14, P.y - 82, '+' + Math.round(P.sitAcc.hp), '#6fe08a', 12, -26);
      if (P.sitAcc.mp >= 1) ft(P.x + 14, P.y - 82, '+' + Math.round(P.sitAcc.mp), '#6fa8ff', 12, -26);
      P.sitAcc.hp = P.sitAcc.mp = P.sitAcc.t = 0;
    }
  } else P.sitAcc.hp = P.sitAcc.mp = P.sitAcc.t = 0;
  // aim from mouse
  mouse.wx = cam.x + mouse.x / Z;
  mouse.wy = cam.y + mouse.y / Z;
  // movement
  let mx = 0,
    my = 0;
  if (keys.w || keys.arrowup) my--;
  if (keys.s || keys.arrowdown) my++;
  if (keys.a || keys.arrowleft) mx--;
  if (keys.d || keys.arrowright) mx++;
  // any movement input, queued click-move or auto-attack stands the character up
  if (mx || my) P.auto = false; // moving by hand cancels auto attack
  // while seated the direction keys only turn the hero (the sit pose has its own front / side / back view);
  // pressing X again stands up. A click-move, a selected enemy, auto attack, a hit or a skill still stand you up.
  if (P.sit && (mx || my)) P.face = Math.atan2(my, mx);
  if (P.sit && (P.dest || P.target || P.auto)) P.sit = false;
  P.sq *= Math.exp(-dt * 13); // squash / stretch settles quickly
  P.stepCd -= dt;
  P.sitT += Math.max(-dt * 5, Math.min(dt * 5, (P.sit ? 1 : 0) - P.sitT));
  P.moving = 0;
  if (P.dash) {
    const d = P.dash;
    d.t += dt;
    P.x += d.dx * d.sp * dt;
    P.y += d.dy * d.sp * dt;
    resolve(P, P.r);
    P.face = Math.atan2(d.dy, d.dx);
    fx.push({ k: 'ghost', x: P.x, y: P.y, t: 0, dur: 0.25, col: d.def.col });
    for (const m of M.mobs)
      if (!m.dead && !d.hit.size && (!d.tgt || m === d.tgt) && dist(m, P) < m.r + P.r + 14) { // single target: only the selected enemy (else the first one touched) is hit
        d.hit.add(m);
        hitMob(m, d.mult, d.def);
      }
    if (d.t >= d.dur) {
      P.dash = null;
      P.vx = P.vy = 0;
    }
    P.moving = 1;
    P.mv += (1 - P.mv) * Math.min(1, dt * 16);
    P.walk += (d.sp * dt) / ((MOVE_FEEL[P.job] || MOVE_FEEL.swordsman).px * 1.6); // long strides while dashing
  } else if (P.sit) {
    P.vx = P.vy = 0;
    P.mv += (0 - P.mv) * Math.min(1, dt * 16);
  } else {
    let vx = 0,
      vy = 0;
    const au = P.auto && !mx && !my ? autoAttackStep() : null;
    if (mx || my) {
      const l = Math.hypot(mx, my);
      vx = mx / l;
      vy = my / l;
      P.dest = null;
      P.face = Math.atan2(vy, vx);
    } else if (au) {
      vx = au.x;
      vy = au.y;
    } else if (P.auto) {
      // standing in reach: autoAttackStep already swung
    } else if (P.dest) {
      const dx = P.dest.x - P.x,
        dy = P.dest.y - P.y,
        d = Math.hypot(dx, dy);
      if (d < 6) P.dest = null;
      else {
        vx = dx / d;
        vy = dy / d;
        P.face = Math.atan2(vy, vx);
      }
    }
    // --- smooth movement: velocity eases toward the wanted velocity instead of jumping (feel per class: MOVE_FEEL) ---
    const F = MOVE_FEEL[P.job] || MOVE_FEEL.swordsman,
      want = vx || vy;
    let sp = st.spd;
    if (!mx && !my && !au && P.dest) sp *= clamp(Math.hypot(P.dest.x - P.x, P.dest.y - P.y) / 36, 0.3, 1); // ease in to a click-move target
    const tvx = vx * sp,
      tvy = vy * sp,
      dvx = tvx - P.vx,
      dvy = tvy - P.vy,
      dl = Math.hypot(dvx, dvy),
      s0 = Math.hypot(P.vx, P.vy),
      wasMoving = s0 > 20;
    let rate = want ? F.accel : F.decel;
    if (want && wasMoving && (P.vx * tvx + P.vy * tvy) / (s0 * Math.hypot(tvx, tvy)) < 0.5) rate *= F.turn; // sharp turn / reversal: more grip
    const stp = rate * dt;
    if (dl <= stp) {
      P.vx = tvx;
      P.vy = tvy;
    } else {
      P.vx += (dvx / dl) * stp;
      P.vy += (dvy / dl) * stp;
    }
    const ox = P.x,
      oy = P.y;
    P.x += P.vx * dt;
    P.y += P.vy * dt;
    resolve(P, P.r);
    const moved = Math.hypot(P.x - ox, P.y - oy),
      speed = moved / Math.max(dt, 1e-4);
    if (moved < Math.hypot(P.vx, P.vy) * dt * 0.4) {
      P.vx *= 0.6; // pushing straight into a wall: do not keep building up speed
      P.vy *= 0.6;
    }
    // walk cycle follows the distance actually walked, so the feet never skate
    P.moving = speed > 14 ? 1 : 0;
    P.mv += (clamp(speed / (st.spd * 0.9), 0, 1) - P.mv) * Math.min(1, dt * 14);
    if (P.moving) P.walk += moved / F.px;
    // footfalls: sound + a little squash + dust. Feet land every half cycle (offset by a quarter in side view, see drawAvatar)
    const sideF = Math.abs(Math.cos(P.face)) >= 0.62 && Math.sin(P.face) >= -0.5,
      idx = Math.floor((P.walk - (sideF ? Math.PI / 2 : 0)) / Math.PI),
      k = clamp(speed / st.spd, 0, 1.2),
      sf = groundSurface();
    if (P.moving && idx !== P.stepIdx && P.stepCd <= 0 && k > 0.25) {
      P.stepCd = 0.11;
      sfxStep(sf, P.job, idx & 1, 0.5 + 0.5 * Math.min(1, k));
      P.sq = Math.max(P.sq, 0.28 + 0.34 * F.heavy * k);
      if (k > 0.7) stepDust(sf, F.heavy, 1);
    }
    P.stepIdx = idx;
    if (P.moving) P.topK = Math.max(P.topK || 0, k); // fastest the hero got during this run (a tap of a key does not count)
    if (P.moving && !P.wasMoving) {
      P.sq = -0.45; // first step: a small stretch as the hero pushes off
      stepDust(sf, F.heavy, 2);
    }
    if (!P.moving && P.wasMoving) {
      if (P.topK > 0.7) {
        P.sq = 0.35 + 0.45 * F.heavy; // stopping from a run: settle down into the ground
        sfxStep(sf, P.job, 0, 0.4);
        stepDust(sf, F.heavy, 3);
      }
      P.topK = 0;
    }
    P.wasMoving = P.moving;
  }
  // portals
  if (portalCd <= 0 && !transition)
    for (const p of M.portals) {
      if (Math.hypot(p.x - P.x, p.y - P.y) < 44) {
        changeMap(p.to, p.tx, p.ty);
        break;
      }
    }
  updatePet(dt);
  // mobs
  for (const m of M.mobs) updateMob(m, dt);
  // projectiles
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i];
    // homing: steer toward the locked enemy until it is hit (keeps fan offset for multi-arrow skills)
    if (p.home && !p.home.dead && !p.hit.has(p.home)) {
      const want = Math.atan2(p.home.y - 8 - p.y, p.home.x - p.x) + (p.off || 0) * Math.max(0, 1 - p.d / 160),
        turn = clamp(angDiff(want, p.a), -12 * dt, 12 * dt),
        sp = Math.hypot(p.vx, p.vy);
      p.a += turn;
      p.vx = Math.cos(p.a) * sp;
      p.vy = Math.sin(p.a) * sp;
    }
    const sx = p.vx * dt,
      sy = p.vy * dt;
    p.x += sx;
    p.y += sy;
    p.d += Math.hypot(sx, sy);
    let dead = p.d >= p.max || pointBlocked(p.x, p.y) || p.x < 0 || p.y < 0 || p.x > M.w || p.y > M.h;
    if (!dead)
      for (const m of M.mobs) {
        if (m.dead || p.hit.has(m) || (p.grp && p.grp.m && p.grp.m !== m)) continue;
        if (Math.hypot(m.x - p.x, m.y - (p.y + 8)) < m.r + 6) {
          p.hit.add(m);
          if (p.grp) p.grp.m = m;
          if (p.splash) {
            explode(p, m);
          } else hitMob(m, p.mult, { stun: p.stun, poison: p.poison, kind: p.melee ? 'arc' : undefined });
          if (p.hit.size > p.pierce || p.splash) {
            dead = true;
          }
          break;
        }
      }
    if (dead) projs.splice(i, 1);
  }
  // zones (arrow rain)
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    z.t -= dt;
    if (z.t <= 0) {
      for (let k = 0; k < 8; k++)
        fx.push({
          k: 'arrow',
          x: z.x + rnd(-z.r, z.r) * 0.8,
          y: z.y + rnd(-z.r, z.r) * 0.8,
          t: 0,
          dur: 0.25,
          col: z.col,
        });
      {
        const inZ = M.mobs.filter((m) => !m.dead && Math.hypot(m.x - z.x, m.y - z.y) < z.r + m.r);
        const tg = z.lock ? (inZ.includes(z.tgt) ? z.tgt : null) : z.tgt && inZ.includes(z.tgt) ? z.tgt : pickOne(inZ, z); // single target: one enemy per volley
        z.tgt = tg;
        if (tg) hitMob(tg, z.mult);
      }
      fx.push({ k: 'ring', x: z.x, y: z.y, r: z.r, t: 0, dur: 0.3, col: z.col });
      sfxArrowLand();
      z.left--;
      z.t = 0.4;
      if (z.left <= 0) zones.splice(i, 1);
    }
  }
  // fx & floats
  for (let i = fx.length - 1; i >= 0; i--) {
    fx[i].t += dt;
    if (fx[i].t >= fx[i].dur) fx.splice(i, 1);
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i];
    f.t += dt * 0.85; // ~1.2s on screen so numbers can be read
    f.y += f.vy * dt;
    if (f.t > 1) floats.splice(i, 1);
  }
  for (let i = clicks.length - 1; i >= 0; i--) {
    clicks[i].t += dt;
    if (clicks[i].t > 0.5) clicks.splice(i, 1);
  }
  // camera
  const tx = clamp(P.x - VWw / 2, 0, Math.max(0, M.w - VWw)),
    ty = clamp(P.y - VHw / 2, 0, Math.max(0, M.h - VHw));
  if (M.w < VWw) cam.x = (M.w - VWw) / 2;
  else cam.x += (tx - cam.x) * Math.min(1, dt * 9);
  if (M.h < VHw) cam.y = (M.h - VHw) / 2;
  else cam.y += (ty - cam.y) * Math.min(1, dt * 9);
  saveT += dt;
  if (saveT > 15) {
    saveT = 0;
    if (SET.autosave) save(true);
  }
}
function explode(p, m) {
  fx.push({ k: 'ring', x: p.x, y: p.y, r: p.splash, t: 0, dur: 0.35, col: p.col, fill: 1 });
  if (m && !m.dead) hitMob(m, p.mult); // blast visual only: the struck enemy alone takes the damage
  sfxBoom();
}
function updateMob(m, dt) {
  if (m.dead) {
    m.resp -= dt;
    if (m.resp <= 0) {
      m.dead = 0;
      m.hp = m.max;
      m.x = m.hx;
      m.y = m.hy;
      m.agg = 0;
      m.ret = 0;
      m.pois = null;
      m.stun = 0;
    }
    return;
  }
  if (m.t.dummy) {
    // training dummy: stays put, can't be killed; poison still ticks so it shows up in the test
    m.flash -= dt;
    if (m.pois) {
      m.pois.t -= dt;
      m.pois.tick -= dt;
      if (m.pois.tick <= 0) {
        m.pois.tick = 1;
        ft(m.x, m.y - m.r - 14, m.pois.dmg, '#8be36a', 13, -34);
        dummyHit(m, m.pois.dmg, 'poison');
      }
      if (m.pois.t <= 0) m.pois = null;
    }
    m.stun = 0;
    m.x = m.hx;
    m.y = m.hy;
    m.hp = m.max;
    return;
  }
  m.flash -= dt;
  m.atkCd -= dt;
  if (m.pois) {
    m.pois.t -= dt;
    m.pois.tick -= dt;
    if (m.pois.tick <= 0) {
      m.pois.tick = 1;
      m.hp -= m.pois.dmg;
      ft(m.x, m.y - m.r - 14, m.pois.dmg, '#8be36a', 13, -34);
      if (m.hp <= 0) {
        mobDie(m);
        return;
      }
    }
    if (m.pois.t <= 0) m.pois = null;
  }
  if (m.stun > 0) {
    m.stun -= dt;
    return;
  }
  const T = m.t,
    d = dist(m, P);
  let vx = 0,
    vy = 0,
    sp = T.spd;
  if (!m.agg && !m.ret && d < T.aggro && !M.safe && P.hp > 0) m.agg = 1;
  if (m.agg) {
    if (Math.hypot(m.x - m.hx, m.y - m.hy) > 520 || P.hp <= 0 || transition) {
      m.agg = 0;
      m.ret = 1;
    } else {
      const a = Math.atan2(P.y - m.y, P.x - m.x);
      m.face = a;
      if (d > m.r + P.r + 4) {
        vx = Math.cos(a);
        vy = Math.sin(a);
      } else if (m.atkCd <= 0) {
        m.atkCd = T.cd;
        hurtPlayer(m);
        fx.push({ k: 'hit', x: P.x, y: P.y - 12, t: 0, dur: 0.2 });
      }
    }
  } else if (m.ret) {
    const dx = m.hx - m.x,
      dy = m.hy - m.y,
      dd = Math.hypot(dx, dy);
    if (dd < 10) {
      m.ret = 0;
    } else {
      vx = dx / dd;
      vy = dy / dd;
      sp = T.spd * 1.6;
    }
    m.hp = Math.min(m.max, m.hp + m.max * 0.2 * dt);
  } else {
    m.wt -= dt;
    if (m.wt <= 0) {
      m.wt = rnd(1.5, 4);
      const a = rnd(6.28),
        r = rnd(30, 130);
      m.tx = m.hx + Math.cos(a) * r;
      m.ty = m.hy + Math.sin(a) * r;
    }
    const dx = m.tx - m.x,
      dy = m.ty - m.y,
      dd = Math.hypot(dx, dy);
    if (dd > 6) {
      vx = dx / dd;
      vy = dy / dd;
      sp = T.spd * 0.4;
      m.face = Math.atan2(vy, vx);
    }
  }
  if (vx || vy) {
    m.x += vx * sp * dt;
    m.y += vy * sp * dt;
    resolve(m, m.r);
  }
}

// Little puffs at the hero's feet (footsteps, push-off and stopping). Not on indoor floors.
const DUST_COL = { grass: '#b9c79a', stone: '#cfc8b8', sand: '#ead7a4', snow: '#f4f9ff', mud: '#76603f', rock: '#9a8f88' };
function stepDust(surface, heavy, n) {
  const col = DUST_COL[surface];
  if (!col) return;
  const back = P.face + Math.PI;
  for (let i = 0; i < n; i++)
    fx.push({ k: 'dust', x: P.x + rnd(-4, 4), y: P.y + 2, a: back + rnd(-0.9, 0.9), sp: rnd(6, 14) * (0.8 + heavy * 0.3), s: rnd(2.2, 3.6) * (0.8 + heavy * 0.25), t: 0, dur: rnd(0.3, 0.45), col });
}
