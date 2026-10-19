/**
 * Game lifecycle: start a session from a stored character, save it, and leave.
 */
const Run = { user: null, charId: null };

function startGame(sv) {
  newPlayer(sv.name, sv.job);
  P.look = APPEARANCE.sanitize(sv.look);
  const isNew = !!sv.fresh;
  let wepRefund = 0,
    capOver = 0; // levels above the job's cap in an older save

  if (!isNew) {
    const attr = {};
    let overCap = 0; // points above STAT_MAX in older saves are refunded
    for (const a of ATTR) {
      const v = Math.max(0, Math.floor(+(sv.attr && sv.attr[a.k]) || 0));
      attr[a.k] = Math.min(v, STAT_MAX);
      overCap += v - attr[a.k];
    }
    Object.assign(P, {
      lvl: sv.lvl,
      exp: sv.exp,
      mlvl: JOBS[sv.job] && JOBS[sv.job].tier === 2 ? Math.min(MLV_MAX, Math.max(0, Math.floor(+sv.mlvl || 0))) : 0,
      mexp: JOBS[sv.job] && JOBS[sv.job].tier === 2 ? Math.max(0, Math.floor(+sv.mexp || 0)) : 0,
      gold: sv.gold,
      hpP: sv.hpP,
      mpP: sv.mpP,
      attr,
      ap: (sv.ap === undefined ? AP_PER_LV * (sv.lvl || 0) : Math.max(0, Math.floor(+sv.ap || 0))) + overCap,
    });
    // A 1st job stops at JOB2LV: older saves above it are cut back (the unspent points of those levels go too)
    capOver = Math.max(0, (P.lvl || 0) - lvCapFor(P.job));
    if (capOver) {
      P.lvl -= capOver;
      P.exp = 0;
      P.ap = Math.max(0, P.ap - AP_PER_LV * capOver);
    }
    // Equipment and pets (invalid / wrong-class items are dropped)
    P.own = {};
    for (const id of Array.isArray(sv.own) ? sv.own : []) if (ITEMS[id]) P.own[id] = 1;
    for (const s of SLOTS.concat(COS_SLOTS)) {
      const id = sv.equip && sv.equip[s];
      if (id && P.own[id] && ITEMS[id].slot === s && usableBy(ITEMS[id], P.job)) P.equip[s] = id;
    }
    P.mats = {};
    if (sv.mats) for (const id in sv.mats) if (MATS[id] && sv.mats[id] > 0) P.mats[id] = Math.floor(+sv.mats[id]);
    P.pets = {};
    for (const id of Array.isArray(sv.pets) ? sv.pets : []) if (PETS[id]) P.pets[id] = 1;
    P.pet = sv.pet && P.pets[sv.pet] ? sv.pet : null;
    // bank vault, discovered maps, quest and guild
    const vs = sv.vault || {};
    P.vault = { gold: Math.max(0, Math.floor(+vs.gold) || 0), items: {}, mats: {} };
    for (const id in vs.items || {}) if (ITEMS[id] && !P.own[id]) P.vault.items[id] = 1;
    for (const id in vs.mats || {}) if (MATS[id] && vs.mats[id] > 0) P.vault.mats[id] = Math.floor(+vs.mats[id]);
    for (const id of Array.isArray(sv.visited) ? sv.visited : []) if (MAPDEF[id] && !MAPDEF[id].interior) P.visited[id] = 1;
    const q = sv.quest;
    if (q && MOBS[q.mob] && !MOBS[q.mob].dummy && q.need > 0) P.quest = { mob: q.mob, need: Math.floor(q.need), have: Math.min(Math.floor(q.need), Math.max(0, Math.floor(+q.have) || 0)), xp: Math.max(0, Math.floor(+q.xp) || 0), gold: Math.max(0, Math.floor(+q.gold) || 0), pots: Math.max(0, Math.floor(+q.pots) || 0) };
    P.qdone = Math.max(0, Math.floor(+sv.qdone) || 0);
    P.guild = typeof sv.guild === 'string' ? sv.guild : null;
    // The old blacksmith weapon upgrades (+1..+10) are gone: refund what was paid for them.
    for (let i = 1; i <= Math.min(10, Math.max(0, Math.floor(+sv.wep) || 0)); i++)
      wepRefund += Math.round(60 * Math.pow(i, 1.6));
    P.gold += wepRefund;
    // Skills are never learned automatically: the player spends skill points (no level
    // requirement). Skills that were removed from the game are dropped and their point refunded.
    P.learned = {};
    let refund = 0,
      spent = 0;
    const lvOf = (v, id) => clamp(Math.floor(+v) || 1, 1, SKILL_MAX);
    if (sv.skillLv && typeof sv.skillLv === 'object') {
      for (const id in sv.skillLv) {
        const raw = lvOf(sv.skillLv[id]);
        if (SK[id]) {
          const n = Math.min(raw, skillMax(id)); // e.g. an old Rage Lv 15 becomes Lv 5, the extra points come back
          P.learned[id] = n;
          spent += n;
          refund += raw - n;
        } else refund += raw;
      }
    } else if (Array.isArray(sv.learned)) {
      for (const id of sv.learned) {
        if (SK[id]) {
          P.learned[id] = 1;
          spent++;
        } else refund++;
      }
    }
    P.hotbar = sv.hotbarV === 2 && Array.isArray(sv.hotbar) ? sv.hotbar.slice(0, 18) : null; // older saves had an auto-filled bar: start empty
    P.hotbarJob = sv.hotbarJob;
    P.sp =
      sv.sp === undefined
        ? Math.max(0, SP_PER_LV * (P.lvl || 0) - spent)
        : Math.max(0, Math.floor(+sv.sp || 0)) + refund;
    if (capOver) P.sp = Math.max(0, P.sp - SP_PER_LV * capOver);
    // Lv 0 earns no points: any unspent ones on an older Lv 0 save were the old free starter points
    if (!P.lvl) {
      P.ap = 0;
      P.sp = 0;
    }
    calcStats();
    P.hp = P.st.max;
    P.mp = P.st.maxMp;
  }

  if (isNew) {
    P.ap = START_AP;
    P.sp = START_SP;
  }

  const mid = MAPDEF[sv.map] ? sv.map : 'village';
  MAPS[mid] = buildMap(mid);
  M = MAPS[mid];
  if (!isNew && mid !== 'village' && Number.isFinite(sv.x) && Number.isFinite(sv.y)) {
    P.x = sv.x;
    P.y = sv.y;
  } else {
    P.x = M.spawn.x;
    P.y = M.spawn.y;
  }

  if (!MAPDEF[mid].interior) P.visited[mid] = 1;
  syncGuild();
  updateQuestHud();
  $('#mapname').innerHTML = M.name + '<small>' + M.sub + '</small>';
  for (const s of ['#stat', '#info', '#bar']) $(s).hidden = false;
  syncWarp();
  buildBar();
  running = true;
  Mu.want = M.music || mid;
  musicSync();
  cam.x = clamp(P.x - VWw / 2, 0, Math.max(0, M.w - VWw));
  cam.y = clamp(P.y - VHw / 2, 0, Math.max(0, M.h - VHw));

  log('Welcome to Aldenmoor, ' + P.name + '!', '#f2b84b');
  if (isNew) {
    log('Talk to NPCs with E or by clicking them.', '#cfd8de');
    log('Walk into a glowing door to enter a building. The east gate leads to Sunny Meadow.', '#cfd8de');
    log('Visit the Guild Hall to join or found a guild, and the Quest Hall for hunting quests.', '#cfd8de');
    log('Reach Lv ' + JOB2LV + ' and see Master Kael for your 2nd job.', '#c9a0ff');
    log('Level up to earn attribute and skill points (' + AP_PER_LV + ' + ' + SP_PER_LV + ' per level). Press C to spend them.', '#ffd27a');
  } else if (P.ap > 0) {
    log('You have ' + P.ap + ' unspent attribute points. Press C.', '#ffd27a');
  }
  if (wepRefund) {
    log('Weapon upgrades were replaced by equipment shops. Refunded ' + wepRefund + 'g.', '#f2b84b');
    save(true);
  }
  if (P.pet) petSummon(P.pet, true);
  sfxWelcome();
}

function save(quiet) {
  if (!P || !M || !Run.charId) return;
  const ok = Store.Characters.update(Run.user, Run.charId, {
    name: P.name,
    job: P.job,
    lvl: P.lvl,
    exp: P.exp,
    mlvl: P.mlvl,
    mexp: P.mexp,
    gold: P.gold,
    hpP: P.hpP,
    mpP: P.mpP,
    wep: 0, // legacy field (weapon upgrades were replaced by equipment)
    own: Object.keys(P.own),
    equip: P.equip,
    mats: P.mats,
    pets: Object.keys(P.pets),
    pet: P.pet,
    vault: P.vault,
    visited: Object.keys(P.visited),
    quest: P.quest,
    qdone: P.qdone,
    guild: P.guild,
    attr: P.attr,
    ap: P.ap,
    sp: P.sp,
    learned: Object.keys(P.learned),
    skillLv: P.learned,
    hotbar: P.hotbar,
    hotbarJob: P.hotbarJob,
    hotbarV: 2,
    map: M.id,
    x: P.x,
    y: P.y,
    fresh: false,
  });
  if (!quiet) log(ok ? 'Game saved.' : 'Saving is not available here.', ok ? '#9ec9ff' : '#ff8a80');
}

function exitToMenu() {
  save(true);
  Store.Session.clearActive();
  location.href = 'characters.html';
}

addEventListener('pagehide', () => save(true));
