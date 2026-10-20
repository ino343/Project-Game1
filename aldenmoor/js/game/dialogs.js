/**
 * Dialogs: NPC conversations, shop, blacksmith and character panel.
 */
/* ---------------- dialogs & NPCs ---------------- */
const dlg = $('#dlg'),
  dlgc = $('#dlgcard');
function openDlg(title, sub, body, btns) {
  // Re-rendering the same window (tab switch, buy, upgrade) keeps its scroll position.
  const prev = dlgc.querySelector('.dbody'),
    keep = prev && !dlg.hidden && dlgc.dataset.title === title ? prev.scrollTop : 0;
  dlgc.dataset.title = title;
  dlg.classList.remove('hbblur');
  uiOpen = true;
  dlg.hidden = false;
  dlgc.innerHTML = '';
  dlgc.className = 'card dlg';
  const h = document.createElement('header');
  h.className = 'dhead';
  h.innerHTML = '<div><h2></h2><p></p></div><button type="button" class="x" aria-label="Close">\u2715</button>';
  h.querySelector('h2').textContent = title;
  const sp = h.querySelector('p');
  sp.textContent = sub || '';
  sp.hidden = !sub;
  h.querySelector('.x').onclick = () => closeDlg();
  dlgc.appendChild(h);
  const b = document.createElement('div');
  b.className = 'dbody';
  if (body) b.innerHTML = body;
  dlgc.appendChild(b);
  const r = document.createElement('footer');
  r.className = 'dfoot row';
  for (const bt of btns) {
    const e = document.createElement('button');
    e.type = 'button';
    e.className = bt.primary ? 'primary' : 'ghost';
    e.textContent = bt.t;
    e.disabled = !!bt.dis;
    e.onclick = () => bt.fn();
    r.appendChild(e);
  }
  dlgc.appendChild(r);
  b.scrollTop = keep;
  const f = r.querySelector('button:not(:disabled)');
  if (f) f.focus({ preventScroll: true });
}
function closeDlg() {
  dlg.hidden = true;
  dlg.classList.remove('hbblur');
  uiOpen = false;
}
/* Skill type label: Active (attack skill), Buff (temporary boost) or Passive (always on). */
const skillType = (id) => (SK[id].kind === 'buff' ? 'buff' : SK[id].kind === 'passive' ? 'passive' : 'active');
const skillTag = (id) => {
  const t = skillType(id);
  return '<i class="stag ' + t + '">' + (t === 'buff' ? 'Buff' : t === 'passive' ? 'Passive' : 'Active') + '</i>';
};
function skillList(job, from = 0) {
  return (
    '<div class="skl">' +
    JOBS[job].skills
      .map(
        (id) =>
          '<div><b>' +
          SK[id].n +
          ' ' +
          skillTag(id) +
          '</b><span>' +
          SK[id].d +
          ' <em>' +
          skillLine(SK[id]) +
          '</em></span></div>',
      )
      .join('') +
    '</div>'
  );
}
function talk(n) {
  sfxClick();
  const close = { t: 'Close', fn: closeDlg };
  if (NPC_UI[n.id]) return NPC_UI[n.id](n);
  if (n.id === 'job') {
    const j = J();
    if (j.tier === 2)
      return openDlg(
        n.n,
        n.title,
        '<p>You walk the path of the ' + j.name + '. Keep growing stronger, adventurer.</p>',
        [close],
      );
    const nx = JOBS[j.next];
    if (P.lvl < JOB2LV)
      return openDlg(
        n.n,
        n.title,
        '<p>You are a ' +
          j.name +
          ' now. Return when you reach <b style="color:var(--accent)">level ' +
          JOB2LV +
          '</b> and I will teach you the way of the <b>' +
          nx.name +
          '</b>.</p><p style="margin-top:8px">Your next job unlocks:</p>' +
          skillList(j.next),
        [close],
      );
    return openDlg(
      n.n,
      n.title,
      '<p>You have grown strong. Do you wish to become a <b style="color:var(--accent)">' +
        nx.name +
        '</b>? Your skills change, and you gain more HP, MP, attack and defense.</p>' +
        '<p style="margin-top:8px;color:var(--danger)"><b>Warning:</b> your level returns to <b>' + JOB2_RESET_LV + '</b> (EXP resets) and all attribute and skill points are reset. You get back every point you earned as a ' + j.name + ', so you can spend them again.</p>' +
        skillList(j.next),
      [
        {
          t: 'Advance to ' + nx.name,
          primary: 1,
          fn: () => {
            // 2nd job: back to JOB2_RESET_LV, attributes and skills reset, every point earned so far is refunded
            const attrBack = Object.values(P.attr).reduce((s, v) => s + v, 0),
              skillBack = Object.values(P.learned).reduce((s, v) => s + v, 0);
            P.ap += attrBack;
            P.sp += skillBack;
            for (const k in P.attr) P.attr[k] = 0;
            P.learned = {};
            P.lvl = JOB2_RESET_LV;
            P.exp = 0;
            P.mlvl = 0;
            P.mexp = 0;
            P.job = j.next;
            P.cds = {};
            P.buffs = {};
            calcStats();
            P.hp = P.st.max;
            P.mp = P.st.maxMp;
            buildBar();
            closeDlg();
            toast('2nd Job: ' + nx.name + '!');
            log('Level reset to ' + JOB2_RESET_LV + '. You have ' + P.ap + ' attribute and ' + P.sp + ' skill points to spend.', '#ffd27a');
            log('Open Attributes (C) > Skills to learn your new skills.', '#c9a0ff');
            log('You advanced to ' + nx.name + '!', '#c9a0ff');
            fx.push({ k: 'ring', x: P.x, y: P.y, r: 120, t: 0, dur: 1, col: '#c9a0ff', fill: 1 });
            sfxJobAdvance();
            save(true);
          },
        },
        { t: 'Not yet', fn: closeDlg },
      ],
    );
  }
  if (n.id === 'shop') {
    const buy = (t, c, q) => () => {
      const cost = c * q;
      if (P.gold < cost) {
        log('Not enough gold.', '#ff8a80');
        sfxDeny();
        return;
      }
      P.gold -= cost;
      if (t === 'hp') P.hpP += q;
      else P.mpP += q;
      sfxBuy();
      talk(n);
    };
    return openDlg(
      n.n,
      n.title,
      '<p>Potions restore 40% of your HP or MP. You have <b>' +
        P.gold +
        'g</b>, <b>' +
        P.hpP +
        '</b> HP and <b>' +
        P.mpP +
        '</b> MP potions.</p>',
      [
        { t: 'HP ×1 (20g)', fn: buy('hp', 20, 1), dis: P.gold < 20 },
        { t: 'HP ×10 (200g)', fn: buy('hp', 20, 10), dis: P.gold < 200 },
        { t: 'MP ×1 (25g)', fn: buy('mp', 25, 1), dis: P.gold < 25 },
        { t: 'MP ×10 (250g)', fn: buy('mp', 25, 10), dis: P.gold < 250 },
        close,
      ],
    );
  }
  if (n.id === 'gear') return gearShop(n);
  if (n.id === 'pets') return petShop(n);
  if (n.id === 'costume') {
    cosTry = {};
    return costumeShop(n);
  }
  if (n.id === 'heal')
    return openDlg(n.n, n.title, '<p>The light restores all who need it. Free of charge.</p>', [
      {
        t: 'Restore HP & MP',
        primary: 1,
        fn: () => {
          P.hp = P.st.max;
          P.mp = P.st.maxMp;
          fx.push({ k: 'ring', x: P.x, y: P.y, r: 70, t: 0, dur: 0.7, col: '#6fe08a', fill: 1 });
          log('Fully restored.', '#6fe08a');
          sfxHeal();
          closeDlg();
        },
      },
      close,
    ]);
}
function alloc(k, n) {
  n = Math.min(n, P.ap, STAT_MAX - P.attr[k]);
  if (n < 1) return;
  P.attr[k] += n;
  P.ap -= n;
  const maxBefore = P.st.max;
  calcStats();
  if (k === 'vit') P.hp = Math.min(P.st.max, P.hp + (P.st.max - maxBefore));
  sfxPoint();
  save(true);
  const sc = dlg.scrollTop;
  charPanel();
  dlg.scrollTop = sc;
}
let panelTab = 'stats';
// Skills of the current job the player could learn right now (needs 1 SP; no level requirement).
function learnableSkills() {
  if (P.sp < 1) return 0;
  return J().skills.concat(passivesOf(P.job)).filter((id) => (P.learned[id] || 0) < skillMax(id)).length;
}
// Learn a skill (Lv 1) or raise it by one level (max skillMax(id)). Costs 1 SP each time.
function learnSkill(id) {
  const lv = P.learned[id] || 0;
  if (!(J().skills.includes(id) || passivesOf(P.job).includes(id)) || lv >= skillMax(id) || P.sp < 1) return;
  P.learned[id] = lv + 1;
  P.sp -= 1;
  sfxPoint();
  calcStats(); // passives change your stats right away
  P.hp = Math.min(P.hp, P.st.max);
  log(lv ? SK[id].n + ' is now level ' + (lv + 1) + '!' : 'You learned ' + SK[id].n + '!', '#ffd27a');
  save(true);
  const sc = dlg.scrollTop;
  charPanel();
  dlg.scrollTop = sc;
}
function skillRow(id, slot) {
  const lv = P.learned[id] || 0,
    cur = skillDef(id, lv || 1),
    nxt = lv && lv < skillMax(id) ? skillDef(id, lv + 1) : null,
    pas = SK[id].kind === 'passive';
  const act =
    lv >= skillMax(id)
      ? '<span class="got">MAX</span>'
      : '<button type="button" data-learn="' +
        id +
        '"' +
        (P.sp >= 1 ? '' : ' disabled') +
        '>' +
        (lv ? 'Upgrade' : 'Learn') +
        ' · 1 SP</button>';
  return (
    '<div class="sk' +
    (lv ? ' known' : '') +
    '"><div><b>' +
    SK[id].n +
    '</b> ' +
    skillTag(id) +
    ' <em>Lv ' +
    lv +
    '/' +
    skillMax(id) +
    '</em><small>' +
    SK[id].d +
    ' <em>' +
    (pas ? (lv ? 'Now: ' : 'Lv 1: ') + skillLine(cur) : skillLine(cur)) +
    '</em>' +
    (nxt ? ' <em>Next: ' + skillLine(nxt) + '</em>' : '') +
    '</small>' +
    (lv && !pas ? hotkeyStrip(id) : '') +
    '</div>' +
    act +
    '</div>'
  );
}
// Under every learned active / buff skill: where it sits on the hotbar. Tap another key to move it there
// (a skill already in that slot swaps places with it); tap the × to take it off the bar.
function hotkeyStrip(id) {
  const at = P.hotbar ? P.hotbar.indexOf(id) : -1;
  const cells = HB_KEYS.split('')
    .map((k, i) => {
      const o = P.hotbar && P.hotbar[i];
      const tip = o && o !== id ? 'Swap with ' + (o === 'hp' ? 'HP Potion' : o === 'mp' ? 'MP Potion' : SK[o].n) : o === id ? 'Current slot' : 'Put on ' + k;
      return '<button type="button" class="hkc' + (i === at ? ' on' : o ? ' used' : '') + '" data-hk="' + id + '" data-i="' + i + '" title="' + tip + '">' + k + '</button>';
    })
    .join('');
  return (
    '<div class="hks"><span>Hotkey: <b>' + (at >= 0 ? HB_KEYS[at] : 'none') + '</b></span><div class="hkr">' + cells + '</div>' +
    (at >= 0 ? '<button type="button" class="hkx" data-hk="' + id + '" data-i="-1" title="Remove from hotbar">\u2715</button>' : '') +
    '</div>'
  );
}
function skillsTab() {
  const all = J().skills,
    rows = all.map((id, i) => (skillType(id) === 'active' ? skillRow(id, i) : '')).join(''),
    buffs = all.map((id, i) => (skillType(id) === 'buff' ? skillRow(id, i) : '')).join(''),
    pas = passivesOf(P.job).map((id) => skillRow(id, 0)).join('');
  return (
    '<div class="ap"><span>Skill points to spend</span><b>' +
    P.sp +
    '</b></div><div class="sks"><h4 class="skh">Active skills <small>attacks, used from the hotbar</small></h4>' +
    rows +
    (buffs ? '<h4 class="skh">Buff skills <small>temporary boosts</small></h4>' + buffs : '') +
    '<h4 class="skh">Passive skills <small>always on once learned</small></h4>' +
    pas +
    '</div>'
  );
}
/* ---------------- equipment & pets: shops and inventory ---------------- */
let shopTab = 'weapon';
const keepScroll = (fn) => {
  const sc = dlg.scrollTop;
  fn();
  dlg.scrollTop = sc;
};
function equipItem(id, quiet) {
  const it = ITEMS[id];
  if (!it || !P.own[id] || !usableBy(it, P.job) || P.lvl < it.lv) return;
  P.equip[it.slot] = id;
  calcStats();
  P.hp = Math.min(P.hp, P.st.max);
  P.mp = Math.min(P.mp, P.st.maxMp);
  if (!quiet) {
    sfxEquip();
    log('Equipped ' + it.n + '.', '#9ec9ff');
  }
  save(true);
}
function unequipSlot(slot) {
  if (!P.equip[slot]) return;
  log('Removed ' + ITEMS[P.equip[slot]].n + '.', '#cfd8de');
  P.equip[slot] = null;
  calcStats();
  P.hp = Math.min(P.hp, P.st.max);
  P.mp = Math.min(P.mp, P.st.maxMp);
  sfxClick();
  save(true);
}
function buyItem(id) {
  const it = ITEMS[id];
  if (!it || P.own[id] || P.lvl < it.lv || !usableBy(it, P.job)) return;
  if (P.gold < it.price) {
    log('Not enough gold.', '#ff8a80');
    sfxDeny();
    return;
  }
  P.gold -= it.price;
  P.own[id] = 1;
  sfxBuy();
  log('Bought ' + it.n + ' for ' + it.price + 'g.', '#f2b84b');
  // equip right away if the slot was empty or this is better than what you wear
  const cur = ITEMS[P.equip[it.slot]];
  if (it.cosm) {
    delete cosTry[it.slot];
    if (!cur) equipItem(id); // a costume never replaces the one you already wear
  } else if (!cur || cur.tier < it.tier) equipItem(id);
  save(true);
}
function sellItem(id) {
  const it = ITEMS[id];
  if (!it || !P.own[id]) return;
  if (P.equip[it.slot] === id) {
    P.equip[it.slot] = null;
    calcStats();
  }
  delete P.own[id];
  P.gold += sellPrice(it);
  sfxSell();
  log('Sold ' + it.n + ' for ' + sellPrice(it) + 'g.', '#f2b84b');
  save(true);
}
function buyPet(id) {
  const p = PETS[id];
  if (!p || P.pets[id] || P.lvl < p.lv) return;
  if (P.gold < p.price) {
    log('Not enough gold.', '#ff8a80');
    sfxDeny();
    return;
  }
  P.gold -= p.price;
  P.pets[id] = 1;
  sfxBuy();
  log('You adopted ' + p.n + '!', '#ffd27a');
  if (!P.pet) petSummon(id);
  save(true);
}
// Stat chips of an item; costumes show a "no stats" chip instead.
const itemStatChips = (it) =>
  it.cosm ? '' : itemStats(it).map((s) => '<span class="st ' + s.k + '">' + s.t + '</span>').join('');
// One row of an item list. mode: 'shop' (buy / equip) or 'inv' (equip / sell).
function itemRow(it, mode) {
  const owned = !!P.own[it.id],
    worn = P.equip[it.slot] === it.id,
    wrong = !usableBy(it, P.job),
    low = P.lvl < it.lv;
  let act;
  if (mode === 'shop' && !owned)
    act =
      (it.cosm ? '<button type="button" data-try="' + it.id + '"' + (cosTry[it.slot] === it.id ? ' disabled' : '') + '>' + (cosTry[it.slot] === it.id ? 'Trying' : 'Try on') + '</button>' : '') +
      '<button type="button" data-buy="' + it.id + '"' + (P.gold >= it.price && !low ? '' : ' disabled') + '>Buy · ' + it.price.toLocaleString() + 'g</button>';
  else if (worn) act = '<span class="got">Equipped</span>';
  else
    act =
      '<button type="button" data-equip="' + it.id + '"' + (low || wrong ? ' disabled' : '') + '>Equip</button>' +
      (mode === 'inv' ? '<button type="button" data-sell="' + it.id + '">Sell ' + sellPrice(it).toLocaleString() + 'g</button>' : '');
  const gr = gradeOf(it),
    stats = itemStatChips(it);
  return (
    '<div class="sk item' + (worn ? ' known' : '') + '" style="--c:' + it.col + '">' + itemIconImg(it) +
    '<div><b style="color:' + it.col + '">' + it.n + '</b>' +
    '<div class="meta"><i class="grade" style="--c:' + gr.c + '">' + gr.n + '</i><span>' + (it.cosm ? 'Cosmetic' : SLOT_NAME[it.slot] + ' · Lv ' + it.lv) + '</span></div>' +
    (stats ? '<div class="stats-row">' + stats + '</div>' : '') +
    (it.cosm ? '<small>' + it.d + '</small>' : '') +
    (low || wrong ? '<small>' + (low ? '<em>Requires Lv ' + it.lv + '</em> ' : '') + (wrong ? '<em>' + reqLine(it, P.job) + '</em>' : '') + '</small>' : '') +
    '</div><span class="act">' + act + '</span></div>'
  );
}
function wireGear(rerender) {
  const on = (sel, key, fn) =>
    dlgc.querySelectorAll(sel).forEach((b) => {
      b.onclick = () => keepScroll(() => { fn(b.dataset[key]); rerender(); });
    });
  on('button[data-buy]', 'buy', buyItem);
  on('button[data-try]', 'try', (id) => (cosTry[ITEMS[id].slot] = id));
  on('button[data-equip]', 'equip', (id) => equipItem(id));
  on('button[data-unequip]', 'unequip', unequipSlot);
  on('button[data-sell]', 'sell', sellItem);
  on('button[data-pbuy]', 'pbuy', buyPet);
  on('button[data-psum]', 'psum', (id) => petSummon(id));
  on('button[data-pdis]', 'pdis', () => petDismiss());
  on('button[data-use]', 'use', (k) => usePotion(k));
  on('button[data-msell]', 'msell', (id) => sellMat(id, 1));
  on('button[data-mall]', 'mall', (id) => sellMat(id, P.mats[id] || 0));
  on('button[data-mrar]', 'mrar', (r) => sellMatRarity(r));
}
function gearShop(n) {
  const close = { t: 'Close', fn: closeDlg },
    fam = famOf(P.job);
  if (n.fam !== fam)
    return openDlg(
      n.n,
      n.title,
      '<p>Sorry, I only sell gear for <b>' + FAM_NAME[n.fam] + '</b>. As ' + (/^[AEIOU]/i.test(J().name) ? 'an ' : 'a ') + J().name + ', look for the <b>' + FAM_NAME[fam] + '</b> merchant in the village.</p>',
      [close],
    );
  const tabs =
    '<div class="tabs" role="tablist">' +
    SLOTS.map(
      (s) =>
        '<button type="button" role="tab" data-stab="' + s + '" aria-selected="' + (shopTab === s) + '" class="' + (shopTab === s ? 'on' : '') + '">' + SLOT_NAME[s] + 's</button>',
    ).join('') +
    '</div>';
  openDlg(
    n.n,
    n.title + ' · You have ' + P.gold.toLocaleString() + 'g',
    tabs + '<div class="sks">' + itemsFor(fam, shopTab).map((it) => itemRow(it, 'shop')).join('') + '</div>' +
      '<p style="margin-top:8px;font-size:12px;opacity:.75">Sell or swap gear in Items (I). Items sell for 40% of their price.</p>',
    [close],
  );
  wireGear(() => gearShop(n));
  dlgc.querySelectorAll('button[data-stab]').forEach((b) => {
    b.onclick = () => {
      shopTab = b.dataset.stab;
      gearShop(n);
    };
  });
}
/* ---------------- costume shops (cosmetic gear only) and the look preview ---------------- */
let cosTab = 'chead';
let cosTry = {}; // slot -> costume id being tried on in a shop (preview only, nothing is bought or worn)
// Preview canvas: your character wearing what you wear now, plus anything in `over` (slot -> item id).
function previewHTML() {
  return '<canvas class="avprev" width="270" height="300" aria-label="Preview of your character"></canvas>';
}
function paintPreview(over) {
  const c = dlgc.querySelector('canvas.avprev');
  if (!c) return;
  const g = c.getContext('2d'),
    j = J(),
    eq = Object.assign({}, P.equip, over || {});
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, c.width, c.height);
  g.setTransform(3, 0, 0, 3, 0, 0);
  drawAvatar(g, 45, 90, Math.PI / 2, {
    look: P.look, col: j.col, hair: j.hair, tier: j.tier, job: P.job, moving: 0, walk: 0, swing: 0, swingDur: 0.2, flash: 0,
    gear: gearLook(eq), cos: cosLook(eq),
  }, 0.4);
}
function costumeShop(n) {
  const close = { t: 'Close', fn: closeDlg };
  if (!COS_SLOTS.includes(cosTab)) cosTab = 'chead';
  const tabs =
    '<div class="tabs" role="tablist">' +
    COS_SLOTS.map((s) => '<button type="button" role="tab" data-ctab="' + s + '" aria-selected="' + (cosTab === s) + '" class="' + (cosTab === s ? 'on' : '') + '">' + COS_TAB_NAME[s] + '</button>').join('') +
    '</div>';
  const tried = Object.keys(cosTry).length;
  openDlg(
    n.n,
    n.title + ' · You have ' + P.gold.toLocaleString() + 'g',
    '<p class="hint">Look only, no stats. Any class. Press <b>Try on</b> to preview, then wear it from <b>Gear (G)</b>.</p>' +
      '<div class="cosbox">' + previewHTML() + '<div class="cosside">' + tabs + '<div class="sks">' + costumesFor(n.shop, cosTab).map((it) => itemRow(it, 'shop')).join('') + '</div></div></div>',
    tried ? [{ t: 'Reset preview', fn: () => { cosTry = {}; costumeShop(n); } }, close] : [close],
  );
  dlgc.classList.add('wide');
  paintPreview(cosTry);
  wireGear(() => costumeShop(n));
  dlgc.querySelectorAll('button[data-ctab]').forEach((b) => {
    b.onclick = () => {
      cosTab = b.dataset.ctab;
      costumeShop(n);
    };
  });
}
function petShop(n) {
  const close = { t: 'Close', fn: closeDlg },
    rows = Object.values(PETS)
      .map((p) => {
        const owned = !!P.pets[p.id],
          low = P.lvl < p.lv,
          act = owned
            ? P.pet === p.id
              ? '<span class="got">Following</span>'
              : '<button type="button" data-psum="' + p.id + '">Summon</button>'
            : '<button type="button" data-pbuy="' + p.id + '"' + (P.gold >= p.price && !low ? '' : ' disabled') + '>Adopt · ' + p.price.toLocaleString() + 'g</button>';
        return (
          '<div class="sk' + (owned ? ' known' : '') + '"><div><b style="color:' + p.col + '">' + p.n + '</b> <em>Lv ' + p.lv + '+</em><small>' + p.d + ' <em>' + petLine(p) + '</em>' + (low ? ' <em>Requires Lv ' + p.lv + '</em>' : '') + '</small></div><span class="act">' + act + '</span></div>'
        );
      })
      .join('');
  openDlg(
    n.n,
    n.title + ' · You have ' + P.gold.toLocaleString() + 'g',
    '<p>Every pet follows you and gives you a stat perk (pets do not attack). One pet can follow you at a time.</p><div class="sks">' + rows + '</div>',
    P.pet ? [{ t: 'Send ' + PETS[P.pet].n + ' home', fn: () => { petDismiss(); petShop(n); } }, close] : [close],
  );
  wireGear(() => petShop(n));
}
function charPanel(tab) {
  if (tab) panelTab = tab;
  const j = J(),
    st = P.st,
    A = P.attr;
  const nx = j.tier === 1 ? ' → ' + JOBS[j.next].name + ' at Lv ' + JOB2LV : '';
  const pct = (v) => Math.round(v * 100) + '%';
  const ranged = j.basic.kind === 'proj';
  const now = {
    str: ranged ? 'No effect on bow attacks.' : 'Now +' + Math.round(st.strBonus) + ' damage.',
    dex: ranged ? 'Now +' + Math.round(st.dexBonus) + ' damage.' : 'No effect on melee attacks.',
    spd: 'Now +' + A.spd + '% attack speed.',
    luk: 'Now +' + (A.luk * LUK_CRIT * 100).toFixed(1) + '% crit chance, +' + Math.round(A.luk * LUK_CRITDMG * 100) + '% crit damage.',
    dod: 'Now +' + (A.dod * 0.6).toFixed(1) + '% evade.',
    vit: 'Now +' + A.vit * VIT_HP + ' max HP.',
  };
  const rows = ATTR.map(
    (a) =>
      '<div class="attr"><div><b>' +
      a.n +
      '</b><small>' +
      a.d +
      ' <em>' +
      now[a.k] +
      '</em></small></div><span class="v">' +
      A[a.k] +
      '<small>/' +
      STAT_MAX +
      '</small></span><span class="add">' +
      '<button type="button" data-a="' +
      a.k +
      '" data-n="1" aria-label="Add 1 point to ' +
      a.n +
      '"' +
      (P.ap < 1 || A[a.k] >= STAT_MAX ? ' disabled' : '') +
      '>+1</button>' +
      '<button type="button" data-a="' +
      a.k +
      '" data-n="5" aria-label="Add 5 points to ' +
      a.n +
      '"' +
      (P.ap < 5 || A[a.k] + 5 > STAT_MAX ? ' disabled' : '') +
      '>+5</button></span></div>',
  ).join('');
  const statsTab =
    '<div class="stats"><div><span>HP</span><b>' +
    st.max.toLocaleString() +
    '</b></div><div><span>MP</span><b>' +
    st.maxMp +
    '</b></div><div><span>Attack</span><b>' +
    Math.round(st.atk) +
    '</b></div><div><span>Defense</span><b>' +
    Math.round(st.def) +
    '</b></div>' +
    '<div><span>Crit chance</span><b>' +
    pct(st.crit) +
    '</b></div><div><span>Crit damage</span><b>×' +
    st.critMul.toFixed(2) +
    '</b></div><div><span>Attack speed</span><b>×' +
    st.aspd.toFixed(2) +
    '</b></div><div><span>Dodge</span><b>' +
    pct(st.dodge) +
    '</b></div>' +
    '<div><span>' +
    (ranged ? 'Ranged bonus' : 'Melee bonus') +
    '</span><b>+' +
    Math.round(ranged ? st.dexBonus : st.strBonus) +
    '</b></div><div><span>' +
    (ranged ? 'Bow range' : 'Damage taken') +
    '</span><b>' +
    (ranged ? '×' + basicRangeMul().toFixed(2) : '-' + pct(st.dr)) +
    '</b></div><div><span>Move speed</span><b>' +
    Math.round(st.spd) +
    '</b></div><div><span>Weapon</span><b>' +
    (P.equip.weapon ? ITEMS[P.equip.weapon].n : 'Bare ' + j.weapon) +
    '</b></div></div>';
  const rookieNote =
    ROOKIE_ATK_MIN < 1 || ROOKIE_SPD_MIN < 1
      ? P.lvl < ROOKIE_LV
        ? '<p class="hint">Rookie: damage ' + Math.round(rookieAtk(P.lvl) * 100) + '% and attack speed ' + Math.round(rookieSpd(P.lvl) * 100) + '% until Lv ' + ROOKIE_LV + '.</p>'
        : ''
      : '<p class="hint">Level-ups only raise Max HP. Attack comes from your weapon, Str / Dex points and skills; crit from Luk and gear.</p>';
  const attrTab =
    '<div class="ap"><span>Attribute points to spend</span><b>' +
    P.ap +
    '</b></div><div class="attrs">' +
    rows +
    '</div>';
  const learnable = learnableSkills();
  const tabs =
    '<div class="tabs" role="tablist">' +
    [
      ['stats', 'Stats'],
      ['attrs', 'Attributes' + (P.ap ? ' · ' + P.ap : '')],
      ['skills', 'Skills' + (learnable ? ' · ' + learnable : '')],
    ]
      .map(
        (t) =>
          '<button type="button" role="tab" data-tab="' +
          t[0] +
          '" aria-selected="' +
          (panelTab === t[0]) +
          '" class="' +
          (panelTab === t[0] ? 'on' : '') +
          '">' +
          t[1] +
          '</button>',
      )
      .join('') +
    '</div>';
  openDlg(
    P.name,
    j.name + ' · Lv ' + P.lvl + nx,
    tabs + (panelTab === 'skills' ? skillsTab() : panelTab === 'attrs' ? attrTab : rookieNote + statsTab),
    [{ t: 'Close', primary: 1, fn: closeDlg }],
  );
  dlgc.classList.add('box');
  dlgc.querySelectorAll('button[data-a]').forEach((b) => {
    b.onclick = () => alloc(b.dataset.a, +b.dataset.n);
  });
  dlgc.querySelectorAll('button[data-learn]').forEach((b) => {
    b.onclick = () => learnSkill(b.dataset.learn);
  });
  dlgc.querySelectorAll('button[data-hk]').forEach((b) => {
    b.onclick = () => {
      sfxClick();
      const i = +b.dataset.i;
      if (i < 0) hotbarSet(P.hotbar.indexOf(b.dataset.hk), null);
      else hotbarSet(i, b.dataset.hk);
      keepScroll(() => charPanel());
    };
  });
  wireGear(() => charPanel());
  dlgc.querySelectorAll('button[data-tab]').forEach((b) => {
    b.onclick = () => charPanel(b.dataset.tab);
  });
}

/* ---------------- Gear window (button / G key): everything you wear + your pet ---------------- */
const PET_ICON = { slime: '🟢', wolf: '🐺', cat: '🐱', owl: '🦉', bear: '🐻', dragon: '🐲' };
const SLOT_ICON = { weapon: '⚔', armor: '🛡', head: '⛑', neck: '📿', chead: '🎩', cbody: '👗', cback: '🦋' };
let gearTab = 'equip';
function gearWindow() {
  const fam = famOf(P.job),
    slotTile = (s) => {
      const it = ITEMS[P.equip[s]],
        hint = COS_SLOTS.includes(s) ? 'Nothing worn. Sold by Luna and Rowan.' : s === 'neck' ? 'Sold by every gear merchant.' : 'Sold by the ' + FAM_NAME[fam] + ' merchant.';
      return (
        '<div class="gslot' + (it ? ' on' : '') + '" style="' + (it ? '--c:' + it.col : '') + '">' +
        '<div class="gi">' + (it ? itemIconImg(it, 'big') : '<span>' + SLOT_ICON[s] + '</span>') + '</div>' +
        '<div class="gt"><small>' + SLOT_NAME[s] + (it ? ' <i class="gtier" style="color:' + gradeOf(it).c + '">' + gradeOf(it).n + '</i>' : '') + '</small>' +
        '<b' + (it ? ' style="color:' + it.col + '"' : '') + '>' + (it ? it.n : 'Empty') + '</b>' +
        '<span>' + (it ? itemStatChips(it) || it.d || '' : hint) + '</span></div>' +
        (it ? '<button type="button" class="rm" data-unequip="' + s + '" title="Take off" aria-label="Take off ' + it.n + '">✕</button>' : '') +
        '</div>'
      );
    },
    pet = P.pet && PETS[P.pet],
    petTile = pet
      ? '<div class="gslot on" style="--c:' + pet.col + '"><div class="gi">' + (PET_ICON[pet.shape] || '🐾') + '</div>' +
        '<div class="gt"><small>Pet</small><b style="color:' + pet.col + '">' + pet.n + '</b><span>' + petLine(pet) + '</span></div>' +
        '<button type="button" class="rm txt" data-pdis="' + pet.id + '">Send home</button></div>'
      : '<div class="gslot"><div class="gi">🐾</div><div class="gt"><small>Pet</small><b>None</b><span>' +
        (Object.keys(P.pets).length ? 'Pick one below to summon' : 'Visit Pippa, the Pet Dealer') + '</span></div></div>',
    others = Object.keys(P.pets)
      .filter((id) => id !== P.pet)
      .map((id) => '<button type="button" data-psum="' + id + '" style="border-color:' + PETS[id].col + '">Summon ' + PETS[id].n + '</button>')
      .join(''),
    pc = (v) => Math.round(v * 1000) / 10 + '%',
    st = P.st;
  const tabs = [['equip', 'Equipment'], ['cos', 'Cosmetic'], ['pet', 'Pet']],
    body = {
      equip:
        '<div class="gwin">' + SLOTS.map(slotTile).join('') + '</div>' +
        '<div class="stats" style="margin-top:10px"><div><span>Attack</span><b>' + Math.round(st.atk) + '</b></div><div><span>Defense</span><b>' + Math.round(st.def) + '</b></div>' +
        '<div><span>HP</span><b>' + st.max.toLocaleString() + '</b></div><div><span>MP</span><b>' + st.maxMp.toLocaleString() + '</b></div>' +
        '<div><span>Crit chance</span><b>' + pc(st.crit) + '</b></div><div><span>Dodge</span><b>' + pc(st.dodge) + '</b></div></div>',
      cos:
        '<p class="hint">Costumes only change your look. They give no stats.</p>' +
        '<div class="cosbox">' + previewHTML() + '<div class="gwin cosslots">' + COS_SLOTS.map(slotTile).join('') + '</div></div>',
      pet: '<div class="gwin" style="grid-template-columns:1fr">' + petTile + '</div>' + (others ? '<div class="row" style="margin-top:8px">' + others + '</div>' : ''),
    };
  if (!body[gearTab]) gearTab = 'equip';
  openDlg(
    P.name + ' — Gear',
    J().name + ' · Lv ' + P.lvl,
    '<div class="tabs" role="tablist">' +
      tabs.map((t) => '<button type="button" role="tab" data-gtab="' + t[0] + '" aria-selected="' + (gearTab === t[0]) + '" class="' + (gearTab === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') +
      '</div>' + body[gearTab],
    [{ t: 'Close', primary: 1, fn: closeDlg }, { t: 'Items (I)', fn: () => itemsWindow() }],
  );
  dlgc.classList.add('box');
  dlgc.querySelectorAll('button[data-gtab]').forEach((b) => {
    b.onclick = () => {
      gearTab = b.dataset.gtab;
      gearWindow();
    };
  });
  paintPreview();
  wireGear(() => gearWindow());
}

/* ---------------- Items window (button / I key): equipment bag, consumables, materials, pets ---------------- */
let itemTab = 'equip';
function itemsWindow(tab) {
  if (tab) itemTab = tab;
  const bagItems = Object.keys(P.own)
      .map((id) => ITEMS[id])
      .filter((it) => it && P.equip[it.slot] !== it.id)
      .sort((a, b) => ALL_SLOTS.indexOf(a.slot) - ALL_SLOTS.indexOf(b.slot) || a.tier - b.tier),
    gearBag = bagItems.filter((it) => !it.cosm),
    cosBag = bagItems.filter((it) => it.cosm),
    petIds = Object.keys(P.pets),
    mats = MAT_ORDER.filter((k) => P.mats[k] > 0),
    empty = (t) => '<p style="opacity:.7;font-size:13px;padding:8px 0">' + t + '</p>',
    potRow = (k, name, n, d) =>
      '<div class="sk"><div><b>' + name + '</b> <em>x' + n + '</em><small>' + d + '</small></div><span class="act"><button type="button" data-use="' + k + '"' + (n > 0 ? '' : ' disabled') + '>Use</button></span></div>',
    petRow = (id) => {
      const p = PETS[id];
      return (
        '<div class="sk' + (P.pet === id ? ' known' : '') + '"><div><b style="color:' + p.col + '">' + p.n + '</b><small>' + petLine(p) + '</small></div>' +
        (P.pet === id ? '<button type="button" data-pdis="' + id + '">Send home</button>' : '<button type="button" data-psum="' + id + '">Summon</button>') + '</div>'
      );
    },
    body = {
      equip: gearBag.map((it) => itemRow(it, 'inv')).join('') || empty('No spare equipment. Worn items are in Gear (G).'),
      cos: cosBag.map((it) => itemRow(it, 'inv')).join('') || empty('No spare costumes. Luna and Rowan sell them in the village.'),
      cons:
        potRow('hp', 'HP Potion', P.hpP, 'Restores 40% HP (Q)') + potRow('mp', 'MP Potion', P.mpP, 'Restores 40% MP (R)'),
      mats: mats.length ? matsBody(mats) : empty('No materials yet. Monsters on each map drop their own materials.'),
      pets: petIds.map(petRow).join('') || empty('No pets yet. Visit Pippa, the Pet Dealer.'),
    },
    tabs = [
      ['equip', 'Equipment' + (gearBag.length ? ' · ' + gearBag.length : '')],
      ['cos', 'Costumes' + (cosBag.length ? ' · ' + cosBag.length : '')],
      ['cons', 'Potions'],
      ['mats', 'Materials' + (mats.length ? ' · ' + mats.length : '')],
      ['pets', 'Pets' + (petIds.length ? ' · ' + petIds.length : '')],
    ];
  openDlg(
    P.name + ' — Items',
    '',
    '<div class="ap gold"><span>Gold</span><b>' + P.gold.toLocaleString() + 'g</b></div><div class="tabs" role="tablist">' +
      tabs.map((t) => '<button type="button" role="tab" data-itab="' + t[0] + '" aria-selected="' + (itemTab === t[0]) + '" class="' + (itemTab === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') +
      '</div><div class="sks">' + body[itemTab] + '</div>',
    [{ t: 'Close', primary: 1, fn: closeDlg }, { t: 'Gear (G)', fn: () => gearWindow() }],
  );
  dlgc.classList.add('box');
  wireGear(() => itemsWindow());
  dlgc.querySelectorAll('button[data-itab]').forEach((b) => {
    b.onclick = () => itemsWindow(b.dataset.itab);
  });
}

function sellMat(id, n) {
  const have = P.mats[id] || 0;
  n = Math.min(n, have);
  if (n < 1) return;
  const g = matSellPrice(id) * n;
  P.mats[id] = have - n;
  if (!P.mats[id]) delete P.mats[id];
  P.gold += g;
  sfxSell();
  log('Sold ' + MATS[id].n + (n > 1 ? ' x' + n : '') + ' for ' + g.toLocaleString() + 'g.', '#f2b84b');
  save(true);
}
// Sell every material of one rarity at once.
function sellMatRarity(r) {
  let g = 0;
  for (const id of Object.keys(P.mats)) {
    if (MATS[id] && MATS[id].rarity === r) {
      g += matSellPrice(id) * P.mats[id];
      delete P.mats[id];
    }
  }
  if (!g) return;
  P.gold += g;
  sfxSell();
  log('Sold all ' + RARITY_NAME[r] + ' materials for ' + g.toLocaleString() + 'g.', '#f2b84b');
  save(true);
}
function matsBody(ids) {
  const total = ids.reduce((s, id) => s + matSellPrice(id) * P.mats[id], 0),
    bulk = RARITY.filter((r) => ids.some((id) => MATS[id].rarity === r))
      .slice(0, 3)
      .map((r) => '<button type="button" data-mrar="' + r + '" style="color:' + RARITY_COL[r] + '">Sell all ' + RARITY_NAME[r] + '</button>')
      .join(''),
    rows = ids
      .map((id) => {
        const m = MATS[id],
          n = P.mats[id];
        return (
          '<div class="sk"><div><b style="color:' + m.col + '">' + m.n + '</b> <em>' + RARITY_NAME[m.rarity] + ' · x' + n + '</em>' +
          '<small>' + m.mapName + ' · ' + m.price.toLocaleString() + 'g each</small></div><span class="act">' +
          '<button type="button" data-msell="' + id + '">Sell 1</button>' +
          (n > 1 ? '<button type="button" data-mall="' + id + '">All · ' + (m.price * n).toLocaleString() + 'g</button>' : '') +
          '</span></div>'
        );
      })
      .join('');
  return '<p style="font-size:12.5px;margin:2px 0 6px">Total value: <b style="color:var(--accent)">' + total.toLocaleString() + 'g</b></p><div class="row" style="margin-bottom:4px">' + bulk + '</div>' + rows;
}

/* ---------------- warp button: return to the village (with confirmation) ---------------- */
// The warp button is hidden while you are already in the village.
function syncWarp() {
  const w = $('#warp');
  if (w) w.hidden = !M || M.id === 'village';
}
function warpDialog() {
  if (transition || !M || M.id === 'village') return;
  sfxClick();
  openDlg(
    'Return to the village?',
    'Warp to Aldenmoor Village',
    '<p>Are you sure you want to leave <b>' + M.name + '</b> and warp back to the village?' +
      (P.combat > 0 ? ' <b style="color:var(--danger)">You are in combat right now.</b>' : '') +
      '</p>',
    [
      {
        t: 'Yes, warp',
        primary: 1,
        fn: () => {
          closeDlg();
          const v = MAPS.village || MAPDEF.village;
          changeMap('village', v.spawn.x, v.spawn.y);
          log('You warped back to the village.', '#c9a0ff');
        },
      },
      { t: 'No, stay', fn: closeDlg },
    ],
  );
}

/* ---------------- Map window: the world as a grid of places you have discovered ---------------- */
// [map id, column, row] following the world map in the README (portals link neighbouring cells).
const WORLD_GRID = [
  ['village', 0, 0],
  ['meadow', 1, 0],
  ['forest', 2, 0],
  ['ruins', 2, 1],
  ['swamp', 1, 1],
  ['desert', 1, 2],
  ['frost', 2, 2],
  ['volcano', 3, 2],
  ['abyss', 3, 3],
];
function mapWindow() {
  if (!M) return;
  const here = M.interior ? 'village' : M.id;
  const cells = WORLD_GRID.map(([id, c, r]) => {
    const D = MAPDEF[id],
      seen = !!P.visited[id],
      cls = 'wm' + (id === here ? ' here' : '') + (seen ? '' : ' unk');
    return (
      '<div class="' + cls + '" style="grid-column:' + (c + 1) + ';grid-row:' + (r + 1) + '"><b>' +
      (seen ? D.name : '???') + '</b><small>' +
      (id === here ? 'You are here' : seen ? D.sub.replace('Recommended ', '') : 'Not discovered') +
      '</small></div>'
    );
  }).join('');
  openDlg(
    'World Map',
    M.interior ? 'Inside ' + M.name : M.name + ' · ' + M.sub,
    '<p class="hint">Walk through a map\'s portals to discover the next place. The Warp Master in the Waystation can send you to places you have found.</p><div class="wmap">' + cells + '</div>',
    [{ t: 'Close', primary: 1, fn: closeDlg }],
  );
}

/* ---------------- Friends window ---------------- */
function friendsWindow() {
  openDlg(
    'Friends',
    'Your friend list',
    '<p class="note">No friends yet.</p><p class="hint">Friends need online play. Right now accounts and heroes are saved only in this browser, so there is nobody to add. Guild members (Guild Hall, Brenna) are the closest thing for now.</p>',
    [{ t: 'Close', primary: 1, fn: closeDlg }],
  );
}
