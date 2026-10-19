/**
 * Combat: attacks, skills, damage, EXP/leveling, potions and fainting.
 */
/* ---------------- combat ---------------- */
function nearestMob(range, from) {
  from = from || P;
  let b = null,
    bd = range;
  for (const m of M.mobs) {
    if (m.dead) continue;
    const d = dist(from, m) - m.r;
    if (d < bd) {
      bd = d;
      b = m;
    }
  }
  return b;
}
// Archer / Ranger: arrows lock onto an enemy automatically.
// Priority: clicked target > enemy nearest the cursor > nearest enemy in bow range.
function isBowUser() {
  return P.job === 'archer' || P.job === 'ranger';
}
// No attacking while walking (all classes, 1st and 2nd job): you must stand still to attack or cast a skill.
function isWalking() {
  return !!(P.moving || keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowdown || keys.arrowleft || keys.arrowright);
}
function standStillMsg() {
  if (time - (P.runMsgT || 0) > 1) {
    P.runMsgT = time;
    ft(P.x, P.y - 40, 'Stand still to attack', '#ffd27a', 13);
  }
}
function autoAimTarget() {
  if (!isBowUser()) return null;
  if (P.target && !P.target.dead) return P.target;
  const rg = basicReach();
  if (!mouse.touch) {
    let b = null,
      bd = 120; // cursor snap radius (world px)
    for (const m of M.mobs) {
      if (m.dead || dist(P, m) - m.r > rg) continue;
      const d = Math.hypot(m.x - mouse.wx, m.y - mouse.wy) - m.r;
      if (d < bd) {
        bd = d;
        b = m;
      }
    }
    if (b) return b;
  }
  return nearestMob(rg);
}
function aimAngle() {
  const at = autoAimTarget();
  if (at) return Math.atan2(at.y - P.y, at.x - P.x);
  if (P.target && !P.target.dead) return Math.atan2(P.target.y - P.y, P.target.x - P.x);
  if (mouse.touch) {
    const m = nearestMob(420);
    if (m) return Math.atan2(m.y - P.y, m.x - P.x);
    return P.face;
  }
  return Math.atan2(mouse.wy - P.y, mouse.wx - P.x);
}
// Literal single target: with an enemy selected (clicked) ONLY that enemy can ever be hurt: by basic attacks, skills,
// arrows, dashes, arrow rain and the pet. Nothing else in the way / around it is touched; if the selected enemy is out
// of reach the attack hits nothing. With nothing selected, an attack hits just the closest enemy in reach.
const lockedTarget = () => (P.target && !P.target.dead ? P.target : null);
function pickOne(list, ref) {
  const t = lockedTarget();
  if (t) return list.includes(t) ? t : null;
  ref = ref || P;
  let b = null,
    bd = Infinity;
  for (const m of list) {
    const d = dist(ref, m);
    if (d < bd) {
      bd = d;
      b = m;
    }
  }
  return b;
}
function hitMob(m, mult, o = {}) {
  if (m.dead) return false;
  if (!m.t.dummy && Math.random() < 0.04) {
    ft(m.x, m.y - m.r - 18, 'MISS', '#c9d3dc', 13);
    return false;
  }
  const crit = Math.random() < P.st.crit,
    melee = o.kind === 'arc' || o.kind === 'nova' || o.kind === 'dash';
  let dmg = Math.max(
    1,
    Math.round(
      (P.st.atk + (melee ? P.st.strBonus : J().basic.kind === 'proj' ? P.st.dexBonus : 0)) *
        mult *
        (1 + P.st.rage * clamp(1 - P.hp / P.st.max, 0, 1)) * // Rage: more damage at low HP
        rnd(0.9, 1.1) *
        (crit ? P.st.critMul : 1),
    ),
  );
  m.hp -= dmg;
  m.flash = 0.12;
  m.agg = 1;
  m.ret = 0;
  P.combat = 4;
  if (crit) {
    ft(m.x, m.y - m.r - 18, dmg, '#ffd23a', 26, -52, true);
    for (let i = 0; i < 7; i++)
      fx.push({
        k: 'puff',
        x: m.x,
        y: m.y - m.r,
        a: rnd(6.28),
        sp: rnd(24, 56),
        t: 0,
        dur: 0.45,
        col: '#ffd23a',
      });
  } else ft(m.x, m.y - m.r - 18, dmg, '#ffffff', 16, -46);
  if (m.t.dummy) {
    m.hp = m.max;
    dummyHit(m, dmg, crit ? 'crit' : 'hit');
  }
  if (o.stun) m.stun = Math.max(m.stun, o.stun);
  if (o.kb) {
    const a = Math.atan2(m.y - P.y, m.x - P.x),
      k = o.kb * (m.t.boss ? 0.25 : m.t.dummy ? 0 : 1);
    m.x += Math.cos(a) * k;
    m.y += Math.sin(a) * k;
    resolve(m, m.r);
  }
  if (o.poison) m.pois = { t: o.poison.t, dmg: Math.max(1, Math.round(P.st.atk * o.poison.m * P.st.poisonMul)), tick: 1 };
  sfxHit(J().weapon, { crit, poison: !!o.poison, stun: !!o.stun });
  if (m.hp <= 0) mobDie(m);
  return true;
}
function mobDie(m) {
  m.dead = 1;
  m.resp = m.t.boss ? 90 : 12;
  m.hp = 0;
  if (P.target === m) P.target = null;
  const T = m.t,
    diff = P.lvl - T.lv,
    f = clamp(1 - diff * 0.12, 0.1, 1.3),
    xp = Math.max(1, Math.round(T.xp * f * (1 + guildBonus()))),
    g = ri(T.gold[0], T.gold[1]);
  P.gold += g;
  ft(m.x, m.y - m.r - 6, '+' + xp + ' EXP', '#8ad35e', 13, -52, false, 'loot');
  ft(m.x + 14, m.y - m.r + 8, '+' + g + 'g', '#f2b84b', 12, -40, false, 'loot');
  log(`${T.n} defeated  +${xp} EXP  +${g}g`, '#b9e8a0');
  if (Math.random() < (T.boss ? 1 : 0.1)) {
    const hp = Math.random() < 0.6;
    if (hp) P.hpP++;
    else P.mpP++;
    log('Dropped ' + (hp ? 'HP' : 'MP') + ' Potion', '#9ec9ff');
  }
  rollMats(T.id, !!T.boss).forEach((d, i) => {
    const mt = MATS[d.id];
    P.mats[d.id] = (P.mats[d.id] || 0) + d.qty;
    log('Dropped ' + mt.n + (d.qty > 1 ? ' x' + d.qty : '') + ' (' + RARITY_NAME[mt.rarity] + ')', mt.col);
    ft(m.x - 14, m.y - m.r - 22 - i * 14, mt.n + (d.qty > 1 ? ' x' + d.qty : ''), mt.col, 12, -34, false, 'loot');
    if (mt.rarity === 'legendary' || mt.rarity === 'epic') toast(RARITY_NAME[mt.rarity] + ' drop: ' + mt.n + '!');
  });
  for (let i = 0; i < 10; i++)
    fx.push({ k: 'puff', x: m.x, y: m.y - 6, a: rnd(6.28), sp: rnd(30, 90), t: 0, dur: 0.5, col: T.col });
  questKill(T);
  gainExp(xp);
  sfxMobDie(!!T.boss);
}
function gainExp(x) {
  P.exp += x;
  const cap = lvCapFor(P.job);
  while (P.lvl < cap && P.exp >= need(P.lvl)) {
    P.exp -= need(P.lvl);
    P.lvl++;
    P.ap += AP_PER_LV;
    const spGain = J().tier === 1 ? SP_PER_LV : SP_PER_LV_2ND;
    P.sp += spGain;
    calcStats();
    P.hp = P.st.max;
    P.mp = P.st.maxMp;
    toast('LEVEL UP!  Lv ' + P.lvl);
    log('You reached level ' + P.lvl + '!', '#f2b84b');
    log(
      '+' + AP_PER_LV + ' attribute points, +' + spGain + ' skill point' + (spGain > 1 ? 's' : '') + '. Press C to spend them.',
      '#ffd27a',
    );
    sfxLevelUp();
    fx.push({ k: 'ring', x: P.x, y: P.y, r: 90, t: 0, dur: 0.8, col: '#f2b84b' });
    if (P.lvl === JOB2LV && J().tier === 1)
      log('Max level for a 1st job reached! Advance to your 2nd job to keep growing: visit Master Kael in the village.', '#c9a0ff');
  }
  if (P.lvl >= cap) P.exp = 0;
  gainMastery(x);
}
// Mastery level (2nd job only): same EXP as the base level but each Mlvl costs MLV_EXP_MULT x more; +MLV_AP attribute points each.
function gainMastery(x) {
  if (J().tier !== 2 || P.mlvl >= MLV_MAX) return;
  P.mexp += x;
  while (P.mlvl < MLV_MAX && P.mexp >= mneed(P.mlvl)) {
    P.mexp -= mneed(P.mlvl);
    P.mlvl++;
    P.ap += MLV_AP;
    toast('MASTERY UP!  Mlvl ' + P.mlvl);
    log('Mastery level ' + P.mlvl + '!  +' + MLV_AP + ' attribute points. Press C to spend them.', '#c9a0ff');
    sfxLevelUp();
    fx.push({ k: 'ring', x: P.x, y: P.y, r: 130, t: 0, dur: 1, col: '#c9a0ff' });
  }
  if (P.mlvl >= MLV_MAX) P.mexp = 0;
}
function hurtPlayer(m) {
  if (typeof GODMODE !== 'undefined' && GODMODE) return;
  if (Math.random() < P.st.dodge) {
    ft(P.x, P.y - 40, 'DODGE', '#7fe3ff', 15);
    fx.push({ k: 'ghost', x: P.x + rnd(-14, 14), y: P.y, t: 0, dur: 0.3, col: '#7fe3ff' });
    sfxDodge();
    return;
  }
  let d = Math.round(Math.max(1, m.t.atk * rnd(0.85, 1.15) * defReduction(P.st.def, m.t.lv)) * (1 - P.st.dr));
  P.hp -= d;
  P.sit = false; // getting hit makes you stand up
  P.flash = 0.15;
  P.combat = 4;
  ft(P.x, P.y - 40, '-' + d.toLocaleString(), '#ff6a60', 18, -40);
  sfxHurt(!!m.t.boss);
  if (P.hp <= 0) faint();
}
function faint() {
  if (transition) return;
  const lost = Math.min(P.exp, Math.floor(need(P.lvl) * 0.1));
  P.exp -= lost;
  log('You were knocked out and lost ' + lost + ' EXP. Returning to the village. Talk to the healer at the fountain to recover.', '#ff8a80');
  toast('Knocked out');
  changeMap('village', MAPDEF.village.spawn.x, MAPDEF.village.spawn.y, () => {
    // no free recovery: stay at 1 HP until the healer at the fountain restores you
    P.hp = 1;
    P.mp = Math.min(P.mp, P.st.maxMp);
  });
}
// generic attack executor (basic attack and skills)
function perform(def, dir, mult) {
  dummySwing();
  const col = def.col || '#fff',
    power = def === J().basic ? 0 : 1; // skills sound bigger than basic attacks
  if (def.kind === 'arc') {
    const rg = def.range;
    P.swing = P.swingDur = 0.28;
    fx.push({ k: 'arc', x: P.x, y: P.y, a: dir, r: rg, arc: def.arc, t: 0, dur: 0.22, col });
    let hit = 0;
    const inArc = [];
    for (const m of M.mobs) {
      if (m.dead) continue;
      const d = Math.hypot(m.x - P.x, m.y - P.y);
      if (d > rg + m.r) continue;
      if (Math.abs(angDiff(Math.atan2(m.y - P.y, m.x - P.x), dir)) > def.arc / 2 && d > m.r + 8) continue;
      inArc.push(m);
    }
    const tg = pickOne(inArc);
    if (tg && hitMob(tg, mult, def)) hit++;
    if (def.heal && hit) {
      const h = Math.round(P.st.max * def.heal);
      P.hp = Math.min(P.st.max, P.hp + h);
      ft(P.x, P.y - 40, '+' + h, '#6fe08a', 15);
    }
    sfxSwing(J().weapon, 'arc', power);
  } else if (def.kind === 'nova') {
    fx.push({ k: 'ring', x: P.x, y: P.y, r: def.radius, t: 0, dur: 0.35, col, fill: 1 });
    const tg = pickOne(M.mobs.filter((m) => !m.dead && Math.hypot(m.x - P.x, m.y - P.y) < def.radius + m.r));
    if (tg) hitMob(tg, mult, def);
    P.swing = P.swingDur = 0.3;
    sfxSwing(J().weapon, 'nova', power);
  } else if (def.kind === 'dash') {
    P.dash = {
      dx: Math.cos(dir),
      dy: Math.sin(dir),
      t: 0,
      dur: 0.18,
      sp: def.dist / 0.18,
      hit: new Set(),
      tgt: lockedTarget(),
      mult,
      def,
    };
    P.dest = null;
    P.target = null;
    sfxSwing(J().weapon, 'dash', power);
  } else if (def.kind === 'proj') {
    const n = def.count || 1,
      sp = def.spread || 0,
      bow = isBowUser() && !def.melee,
      home = bow ? autoAimTarget() : null; // arrows follow the locked enemy while it moves
    const grp = { m: lockedTarget() }; // all arrows of one cast share a single victim (the selected enemy, if any)
    for (let i = 0; i < n; i++) {
      const off = n > 1 ? (i / (n - 1) - 0.5) * sp : 0,
        a = dir + off;
      // bow users: the arrow leaves the bow grip (same spot the avatar draws the bow: ~15px out from the body,
      // at shoulder height) in every direction. y is kept on the hit line (-8) and `lift` raises only the drawing.
      projs.push({
        home,
        off,
        lift: bow ? 14 : 0,
        x: bow ? P.x + Math.cos(dir) * 15 : P.x,
        y: bow ? P.y - 8 + Math.sin(dir) * 13 : P.y - 8,
        vx: Math.cos(a) * def.speed,
        vy: Math.sin(a) * def.speed,
        a,
        d: 0,
        max: def.range * (def === J().basic ? basicRangeMul() : P.st.rangeMul),
        mult,
        pierce: 0, // single target: arrows never pass through an enemy
        grp,
        hit: new Set(),
        splash: def.splash || 0,
        col,
        stun: def.stun,
        poison: def.poison,
        melee: def.melee,
      });
    }
    P.swing = P.swingDur = 0.28;
    sfxSwing(J().weapon, 'proj', power, def.count || 1);
  } else if (def.kind === 'rain') {
    const rgR = def.range * P.st.rangeMul,
      at = autoAimTarget(),
      tx = at ? at.x : mouse.touch ? (nearestMob(rgR) || { x: P.x + Math.cos(dir) * 200 }).x : mouse.wx,
      ty = at ? at.y : mouse.touch ? (nearestMob(rgR) || { y: P.y + Math.sin(dir) * 200 }).y : mouse.wy;
    let dx = tx - P.x,
      dy = ty - P.y;
    const d = Math.hypot(dx, dy);
    if (d > rgR) {
      dx *= rgR / d;
      dy *= rgR / d;
    }
    const lk = lockedTarget();
    zones.push({ x: P.x + dx, y: P.y + dy, r: def.r, t: 0.5, left: def.ticks, mult, col, tgt: lk, lock: !!lk });
    P.swing = P.swingDur = 0.2;
    sfxSwing(J().weapon, 'rain', power);
  }
}
/* ---- Auto attack (Space) ----
 * One tap of Space toggles auto attack: the hero walks up to the CLICKED enemy only, stops in reach and
 * keeps swinging until it dies, then stops. Click another enemy and press Space again. It also switches off when Space is
 * pressed again or when the player moves / clicks the ground. Space never swings at empty air. */
// Bow basic attacks start short and grow mostly through the Eagle Eye passive (x3 of its bonus; same max reach as before).
const basicRangeMul = () => 1 + (P.st.rangeMul - 1) * (J().basic.eagle || 3);
function basicReach() {
  const b = J().basic;
  return b.kind === 'proj' ? b.range * basicRangeMul() : b.range;
}
function autoStop() {
  P.auto = false;
}
function toggleAutoAttack() {
  if (P.auto) {
    P.auto = false;
    return;
  }
  if (!lockedTarget()) return; // nothing clicked: Space does nothing
  P.auto = true;
  P.sit = false;
  P.dest = null;
}
// Drives the hero while auto attack is on: returns the walking direction (or null when standing / attacking).
function autoAttackStep() {
  const t = lockedTarget();
  if (!t) {
    P.auto = false; // the clicked enemy is dead: stop, click the next one and press Space again
    return null;
  }
  const d = dist(P, t) - t.r,
    rg = basicReach();
  // melee (sword / dagger / staff arcs) walk right up to the enemy; bows keep most of their distance
  const bs = J().basic,
    stop = bs.stopF != null ? rg * bs.stopF : bs.kind === 'proj' ? rg * 0.75 : Math.min(rg * 0.75, 3);
  if (d > stop) {
    const dx = t.x - P.x,
      dy = t.y - P.y,
      l = Math.hypot(dx, dy) || 1;
    P.face = Math.atan2(dy, dx);
    return { x: dx / l, y: dy / l };
  }
  P.face = Math.atan2(t.y - P.y, t.x - P.x);
  basicAttack();
  return null;
}
function basicAttack() {
  if (P.atkCd > 0 || P.dash) return;
  if (isWalking()) return; // every class: no attacking while walking
  // never swing at empty air: needs the selected enemy (or any enemy) within reach
  const lk = lockedTarget();
  if (lk ? dist(P, lk) - lk.r > basicReach() : !nearestMob(basicReach())) return;
  P.sit = false;
  const b = J().basic;
  P.face = aimAngle();
  P.atkCdMax = P.atkCd = Math.max(0.07, b.cd / P.st.aspd); // atkCdMax feeds the green attack bar under the hero
  // Assassin wields two daggers: each normal attack uses the other arm, and every arm's hit
  // always carries Double Edge (100%), so it strikes twice with that same dagger.
  if (P.job === 'assassin') P.arm = P.arm ? 0 : 1;
  perform(b, P.face, b.mult);
  // Double Edge: sometimes the normal attack strikes again a moment later
  if (P.job === 'assassin' || (P.st.double && Math.random() < P.st.double))
    // the 2nd hit lands halfway through the attack bar (max 0.13s), so at high attack speed it still fires
    // before the next swing instead of being overwritten: every full green bar = 2 damage numbers
    P.echo = { t: Math.min(0.13, P.atkCd * 0.5), dir: P.face, auto: P.job === 'assassin' };
}
// Sit / stand (X). Sitting regenerates HP and MP faster; moving, attacking or taking a hit stands you up.
const SIT_REGEN = { hp: 0.03, mp: 0.05 }; // fraction of max per second while seated
function toggleSit() {
  if (P.dash || transition) return;
  if (P.sit) {
    P.sit = false;
    return;
  }
  if (P.combat > 0) {
    if (time - (P.sitMsgT || 0) > 1.5) {
      P.sitMsgT = time;
      log("You can't sit while in combat.", '#ff8a80');
    }
    return;
  }
  P.sit = true;
  P.auto = false;
  P.dest = null;
  P.target = null;
}
function useSkill(i) {
  const j = J(),
    id = j.skills[i];
  if (!id || P.dash) return;
  const def = skillDef(id, P.learned[id] || 1);
  if (!P.learned[id]) {
    if (time - (P.lockT || 0) > 1.5) {
      P.lockT = time;
      log(
        P.sp >= 1
          ? 'Learn ' + def.n + ' in Attributes (C) > Skills (1 SP).'
          : def.n + ' is not learned yet. Earn a skill point (1 per level) to learn it.',
        '#ff8a80',
      );
    }
    return;
  }
  if ((P.cds[id] || 0) > 0) return;
  if (P.mp < def.mp) {
    ft(P.x, P.y - 40, 'No MP', '#6fa8ff', 13);
    return;
  }
  P.sit = false;
  P.mp -= def.mp;
  P.cds[id] = def.cd;
  P.combat = 4;
  if (def.kind === 'buff') {
    P.buffs[def.n] = {
      t: def.t,
      atk: def.atk,
      aspd: def.aspd,
      spd: def.spd,
      crit: def.crit,
      dodge: def.dodge,
      dr: def.dr,
    };
    calcStats();
    fx.push({ k: 'ring', x: P.x, y: P.y, r: 50, t: 0, dur: 0.5, col: def.col });
    ft(P.x, P.y - 44, def.n, def.col, 14);
    sfxBuff();
    return;
  }
  if (isWalking()) {
    // can't attack while walking: refund and ask the player to stand still
    P.mp += def.mp;
    P.cds[id] = 0;
    standStillMsg();
    return;
  }
  P.face = aimAngle();
  perform(def, P.face, def.mult);
}
function usePotion(t) {
  if (P.potCd > 0) return;
  if (t === 'hp') {
    if (P.hpP < 1) {
      log('No HP potions. Buy more from Mina.', '#ff8a80');
      return;
    }
    if (P.hp >= P.st.max) return;
    P.hpP--;
    const h = Math.round(P.st.max * 0.4);
    P.hp = Math.min(P.st.max, P.hp + h);
    ft(P.x, P.y - 40, '+' + h, '#6fe08a', 16);
  } else {
    if (P.mpP < 1) {
      log('No MP potions. Buy more from Mina.', '#ff8a80');
      return;
    }
    if (P.mp >= P.st.maxMp) return;
    P.mpP--;
    const h = Math.round(P.st.maxMp * 0.4);
    P.mp = Math.min(P.st.maxMp, P.mp + h);
    ft(P.x, P.y - 40, '+' + h, '#6fa8ff', 16);
  }
  P.potCd = 1;
  sfxPotion();
}
