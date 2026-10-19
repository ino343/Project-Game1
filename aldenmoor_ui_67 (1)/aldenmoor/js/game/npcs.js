/**
 * Village service NPCs (their buildings are in data/maps.js):
 *   guide  Lumi            building directory
 *   guild  Brenna          found / join / donate / leave a guild
 *   quest  Captain Roderic repeatable hunting quests
 *   bank   Odette          vault for gold, spare equipment and materials
 *   trader Brokk           sells materials in bulk for a bonus
 *   warp   Zephyr          travel to maps you have already discovered
 *   sage   Sage Orin       reset attribute / skill points for gold
 * talk() in dialogs.js hands every NPC id found in NPC_UI to these functions.
 */
const NPC_UI = {};
const money = (n) => Math.round(n).toLocaleString() + 'g';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const onBtn = (sel, fn) =>
  dlgc.querySelectorAll(sel).forEach((b) => {
    b.onclick = () => {
      const sc = (dlgc.querySelector('.dbody') || {}).scrollTop;
      fn(b.dataset);
      const nb = dlgc.querySelector('.dbody');
      if (nb && sc) nb.scrollTop = sc;
    };
  });
const row = (title, meta, act, col) =>
  '<div class="sk"><div><b' + (col ? ' style="color:' + col + '"' : '') + '>' + title + '</b><small>' + meta + '</small></div><span class="act">' + act + '</span></div>';
const tabBar = (tabs, cur, attr) =>
  '<div class="tabs" role="tablist">' +
  tabs.map((t) => '<button type="button" role="tab" data-' + attr + '="' + t[0] + '" aria-selected="' + (cur === t[0]) + '" class="' + (cur === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') +
  '</div>';
const closeBtn = { t: 'Close', fn: () => closeDlg() };

/* ======================================================================================
 * Town guide
 * ==================================================================================== */
NPC_UI.guide = (n) => {
  const rows = BUILDINGS.map((b) => {
    const who = NPCS.filter((x) => x.map === 'in_' + b.id).map((x) => x.n + ' (' + x.title + ')');
    return row(b.n, who.join(', '), '', b.accent);
  }).join('');
  openDlg(
    n.n,
    n.title,
    '<p>Welcome to Aldenmoor! Every building has a glowing door: walk into it to go inside. Merchants and trainers wait behind their counters. Click them or press <b>E</b> to talk. The east gate leads out of the village.</p><div class="sks">' +
      rows +
      '</div><p class="hint">Tip: the Waystation can take you back to places you have already discovered.</p>',
    [closeBtn],
  );
};

/* ======================================================================================
 * Guild
 * ==================================================================================== */
const guildKey = () => Run.user + ':' + Run.charId;
const guildLevelFor = (funds) => Math.max(1, GUILD_LV_FUNDS.filter((f) => funds >= f).length);
let guildTab = null;
// Refresh the cached guild fields on P (name plate, EXP bonus) and our own member row.
function syncGuild() {
  let g = P.guild ? Store.Guilds.get(P.guild) : null;
  if (g && !g.members.some((m) => m.k === guildKey())) g = null; // kicked / disbanded
  if (!g) P.guild = null;
  P.guildName = g ? g.name : '';
  P.guildLv = g ? g.level : 0;
  if (g) {
    const me = g.members.find((m) => m.k === guildKey());
    if (me.n !== P.name || me.lvl !== P.lvl || me.job !== J().name)
      Store.Guilds.update(g.id, (x) => {
        const m = x.members.find((q) => q.k === guildKey());
        m.n = P.name;
        m.lvl = P.lvl;
        m.job = J().name;
      });
  }
  return g;
}
const guildTag = () => (P.guildName ? '[' + P.guildName + '] ' : '');
const guildBonus = () => (P.guildLv ? guildPerk(P.guildLv) : 0);
const memberRow = () => ({ k: guildKey(), n: P.name, lvl: P.lvl, job: J().name });

NPC_UI.guild = (n) => {
  const g = syncGuild();
  const tabs = g ? [['info', 'Guild'], ['members', 'Members'], ['donate', 'Donate']] : [['join', 'Join a guild'], ['found', 'Found a guild']];
  if (!tabs.some((t) => t[0] === guildTab)) guildTab = tabs[0][0];
  const show = (tab) => {
    guildTab = tab;
    NPC_UI.guild(n);
  };
  let body = '',
    foot = [closeBtn];
  if (g) {
    const cap = guildCap(g.level),
      next = GUILD_LV_FUNDS[g.level],
      master = g.members.find((m) => m.k === g.master),
      isMaster = g.master === guildKey();
    if (guildTab === 'info')
      body =
        '<div class="stats"><div><span>Guild</span><b>' + esc(g.name) + '</b></div><div><span>Level</span><b>' + g.level + (g.level >= GUILD_LV_FUNDS.length ? ' (max)' : '') + '</b></div>' +
        '<div><span>Members</span><b>' + g.members.length + ' / ' + cap + '</b></div><div><span>Guild master</span><b>' + esc(master ? master.n : '?') + '</b></div>' +
        '<div><span>Member perk</span><b>+' + Math.round(guildPerk(g.level) * 100) + '% EXP</b></div><div><span>Total donated</span><b>' + money(g.funds) + '</b></div></div>' +
        '<p class="hint">' +
        (next ? 'Donate <b>' + money(next - g.funds) + '</b> more to reach guild level ' + (g.level + 1) + ' (+' + Math.round(guildPerk(g.level + 1) * 100) + '% EXP, room for ' + guildCap(g.level + 1) + ' members).' : 'Your guild is at the highest level.') +
        '</p><p class="hint">Every guild member gets the EXP perk from every monster they defeat. Your guild name shows under your name.</p>';
    else if (guildTab === 'members')
      body =
        '<div class="sks">' +
        g.members
          .slice()
          .sort((a, b) => (b.role === 'master') - (a.role === 'master') || b.lvl - a.lvl)
          .map((m) => row(esc(m.n) + (m.k === guildKey() ? ' <em>(you)</em>' : ''), esc(m.job || '') + ' · Lv ' + m.lvl, m.role === 'master' ? '<span class="got">Master</span>' : ''))
          .join('') +
        '</div>';
    else
      body =
        '<p>Donate gold to level up the guild. You have <b>' + money(P.gold) + '</b>.</p><div class="row" style="margin:6px 0">' +
        [100, 1000, 10000, 100000].map((a) => '<button type="button" class="ghost" data-don="' + a + '"' + (P.gold < a ? ' disabled' : '') + '>' + money(a) + '</button>').join('') +
        '<button type="button" class="ghost" data-don="all"' + (P.gold < 1 ? ' disabled' : '') + '>All</button></div>' +
        '<p class="hint">Donations cannot be taken back. Total donated: <b>' + money(g.funds) + '</b></p>';
    foot = [closeBtn, { t: isMaster ? 'Disband guild' : 'Leave guild', fn: () => leaveConfirm(n, g, isMaster) }];
  } else if (guildTab === 'join') {
    const list = Store.Guilds.list().slice().sort((a, b) => b.level - a.level || b.members.length - a.members.length);
    body =
      '<p>Pick a guild to join. Guild members earn bonus EXP and share a home.</p><div class="sks">' +
      list
        .map((x) => {
          const full = x.members.length >= guildCap(x.level),
            low = P.lvl < x.minLv,
            mm = x.members.find((m) => m.k === x.master);
          return row(
            esc(x.name) + ' <em>Lv ' + x.level + '</em>',
            x.members.length + ' / ' + guildCap(x.level) + ' members · Master ' + esc(mm ? mm.n : '?') + ' · +' + Math.round(guildPerk(x.level) * 100) + '% EXP' + (x.minLv > 1 ? ' · Requires Lv ' + x.minLv : ''),
            '<button type="button" data-join="' + x.id + '"' + (full || low ? ' disabled' : '') + '>' + (full ? 'Full' : low ? 'Lv ' + x.minLv + '+' : 'Join') + '</button>',
          );
        })
        .join('') +
      '</div>';
  } else {
    const ok = P.lvl >= GUILD_MIN_LV && P.gold >= GUILD_COST;
    body =
      '<p>Found your own guild and invite others to it. You become the guild master.</p><ul class="hint" style="margin:6px 0 10px 18px">' +
      '<li' + (P.lvl >= GUILD_MIN_LV ? '' : ' style="color:var(--danger)"') + '>Level ' + GUILD_MIN_LV + ' or higher (you are Lv ' + P.lvl + ')</li>' +
      '<li' + (P.gold >= GUILD_COST ? '' : ' style="color:var(--danger)"') + '>' + money(GUILD_COST) + ' founding fee (you have ' + money(P.gold) + ')</li></ul>' +
      '<div class="field"><label for="gName">Guild name</label><input id="gName" type="text" maxlength="' + GUILD_NAME_MAX + '" placeholder="' + GUILD_NAME_MIN + '-' + GUILD_NAME_MAX + ' letters, numbers or spaces" autocomplete="off" spellcheck="false"></div>' +
      '<div id="gErr" class="hint" style="color:var(--danger);min-height:18px"></div>';
    foot = [{ t: 'Found guild · ' + money(GUILD_COST), primary: 1, fn: () => foundGuild(n), dis: !ok }, closeBtn];
  }
  openDlg('Brenna — Guild Hall', g ? esc(g.name) + ' · Guild level ' + g.level : n.title, tabBar(tabs, guildTab, 'gtab') + body, foot);
  dlgc.classList.add('box');
  onBtn('button[data-gtab]', (d) => show(d.gtab));
  onBtn('button[data-join]', (d) => joinGuild(n, d.join));
  onBtn('button[data-don]', (d) => donate(n, d.don));
  const inp = dlgc.querySelector('#gName');
  if (inp) {
    inp.focus();
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        foundGuild(n);
      }
    });
  }
};
function foundGuild(n) {
  const inp = dlgc.querySelector('#gName'),
    err = (t) => {
      const e = dlgc.querySelector('#gErr');
      if (e) e.textContent = t;
      sfxDeny();
    };
  if (!inp) return;
  const name = inp.value.trim().replace(/\s+/g, ' ');
  if (P.lvl < GUILD_MIN_LV) return err('You need to be level ' + GUILD_MIN_LV + '.');
  if (P.gold < GUILD_COST) return err('Not enough gold.');
  if (!/^[A-Za-z0-9 ]+$/.test(name) || name.length < GUILD_NAME_MIN || name.length > GUILD_NAME_MAX)
    return err('Use ' + GUILD_NAME_MIN + '-' + GUILD_NAME_MAX + ' letters, numbers or spaces.');
  const r = Store.Guilds.create(name, memberRow());
  if (!r.ok) return err(r.error);
  P.gold -= GUILD_COST;
  P.guild = r.guild.id;
  syncGuild();
  guildTab = 'info';
  sfxLevelUp();
  toast('Guild founded: ' + name);
  log('You founded the guild ' + name + '. You are the guild master.', '#ffd27a');
  save(true);
  NPC_UI.guild(n);
}
function joinGuild(n, id) {
  const g = Store.Guilds.get(id);
  if (!g || g.members.length >= guildCap(g.level) || P.lvl < g.minLv) return;
  Store.Guilds.update(id, (x) => x.members.push({ ...memberRow(), role: 'member' }));
  P.guild = id;
  syncGuild();
  guildTab = 'info';
  sfxBuy();
  toast('Joined ' + g.name);
  log('You joined the guild ' + g.name + '. +' + Math.round(guildPerk(g.level) * 100) + '% EXP from kills.', '#ffd27a');
  save(true);
  NPC_UI.guild(n);
}
function donate(n, a) {
  const g = Store.Guilds.get(P.guild);
  if (!g) return;
  const amt = a === 'all' ? P.gold : Math.min(+a, P.gold);
  if (amt < 1) return;
  const before = g.level;
  let after = before;
  Store.Guilds.update(g.id, (x) => {
    x.funds += amt;
    x.level = Math.max(x.level, guildLevelFor(x.funds));
    after = x.level;
  });
  P.gold -= amt;
  sfxBuy();
  log('You donated ' + money(amt) + ' to ' + g.name + '.', '#f2b84b');
  if (after > before) {
    toast('Guild level ' + after + '!');
    log(g.name + ' reached level ' + after + '! Member perk: +' + Math.round(guildPerk(after) * 100) + '% EXP.', '#ffd27a');
    sfxLevelUp();
  }
  syncGuild();
  save(true);
  NPC_UI.guild(n);
}
function leaveConfirm(n, g, isMaster) {
  openDlg(
    isMaster ? 'Disband ' + g.name + '?' : 'Leave ' + g.name + '?',
    'Brenna — Guild Hall',
    isMaster
      ? '<p>You are the guild master. Disbanding <b>' + esc(g.name) + '</b> removes the guild for all <b>' + g.members.length + '</b> member(s). This cannot be undone.</p>'
      : '<p>Leave <b>' + esc(g.name) + '</b>? You lose its EXP perk. You can join another guild any time.</p>',
    [
      {
        t: isMaster ? 'Yes, disband' : 'Yes, leave',
        primary: 1,
        fn: () => {
          if (isMaster) Store.Guilds.remove(g.id);
          else Store.Guilds.update(g.id, (x) => (x.members = x.members.filter((m) => m.k !== guildKey())));
          P.guild = null;
          syncGuild();
          guildTab = 'join';
          log(isMaster ? 'You disbanded ' + g.name + '.' : 'You left ' + g.name + '.', '#cfd8de');
          save(true);
          NPC_UI.guild(n);
        },
      },
      { t: 'No, stay', fn: () => NPC_UI.guild(n) },
    ],
  );
}

/* ======================================================================================
 * Quest Master: repeatable hunting quests (P.quest = { mob, need, have, xp, gold, pots })
 * ==================================================================================== */
let qOffers = null,
  qOffersLv = -1;
function questFor(id, tier) {
  const T = MOBS[id],
    need = T.boss ? 1 : [12, 20, 30][tier % 3],
    avg = (T.gold[0] + T.gold[1]) / 2;
  return {
    mob: id,
    need,
    have: 0,
    xp: Math.round(T.xp * need * (T.boss ? 2 : 1.5)),
    gold: Math.round(avg * need * (T.boss ? 3 : 2.5)),
    pots: T.boss ? 5 : Math.floor(need / 10),
  };
}
function questOffers() {
  if (qOffers && qOffersLv === P.lvl) return qOffers;
  const all = Object.values(MOBS).filter((m) => !m.dummy);
  let norm = all.filter((m) => !m.boss && m.lv <= P.lvl + 3 && m.lv >= P.lvl - 12);
  if (!norm.length) norm = all.filter((m) => !m.boss).sort((a, b) => a.lv - b.lv).slice(0, 3);
  const bosses = all.filter((m) => m.boss && m.lv <= P.lvl + 5 && m.lv >= P.lvl - 12);
  const pick = norm.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  const out = pick.map((m, i) => questFor(m.id, i));
  if (bosses.length) out.push(questFor(bosses[Math.floor(Math.random() * bosses.length)].id, 0));
  qOffers = out;
  qOffersLv = P.lvl;
  return out;
}
const questDone = (q) => q && q.have >= q.need;
function updateQuestHud() {
  const e = $('#qtrack');
  if (!e) return;
  const q = P.quest;
  e.hidden = !q;
  if (!q) return;
  const T = MOBS[q.mob],
    txt = (questDone(q) ? 'Quest complete: return to Captain Roderic' : 'Hunt ' + T.n + ' ' + q.have + '/' + q.need);
  if (e.dataset.t !== txt) {
    e.dataset.t = txt;
    e.innerHTML = '<small>Quest</small>' + esc(txt);
    e.classList.toggle('done', questDone(q));
  }
}
function questKill(T) {
  const q = P.quest;
  if (!q || q.mob !== T.id || questDone(q)) return;
  q.have++;
  if (questDone(q)) {
    toast('Quest complete! Return to Captain Roderic.');
    log('Quest complete: ' + T.n + ' hunt. Return to Captain Roderic in the Quest Hall.', '#7fe3ff');
  } else if (q.have % 5 === 0) log('Quest: ' + T.n + ' ' + q.have + '/' + q.need, '#9ec9ff');
  updateQuestHud();
}
const questRewardLine = (q) => '<em>+' + q.xp.toLocaleString() + ' EXP · ' + money(q.gold) + (q.pots ? ' · ' + q.pots + ' HP potions' : '') + '</em>';
NPC_UI.quest = (n) => {
  const q = P.quest;
  if (q) {
    const T = MOBS[q.mob],
      done = questDone(q);
    return openDlg(
      n.n,
      n.title + ' · Quests done: ' + (P.qdone || 0),
      '<p>' + (done ? 'Well done! The ' + T.n + ' hunt is finished. Here is your reward.' : 'You are on a hunt. Come back when it is done.') + '</p>' +
        '<div class="sks">' + row('Hunt ' + T.n + (T.boss ? ' (boss)' : ''), 'Lv ' + T.lv + ' · Progress <b>' + q.have + ' / ' + q.need + '</b><br>' + questRewardLine(q), done ? '<span class="got">Done</span>' : '') + '</div>',
      [
        done
          ? {
              t: 'Turn in',
              primary: 1,
              fn: () => {
                P.gold += q.gold;
                P.hpP += q.pots;
                P.qdone = (P.qdone || 0) + 1;
                P.quest = null;
                qOffers = null;
                sfxBuy();
                toast('Quest reward: ' + q.xp.toLocaleString() + ' EXP');
                log('Quest reward: +' + q.xp.toLocaleString() + ' EXP, ' + money(q.gold) + (q.pots ? ', ' + q.pots + ' HP potions' : '') + '.', '#ffd27a');
                gainExp(q.xp);
                updateQuestHud();
                save(true);
                NPC_UI.quest(n);
              },
            }
          : { t: 'Abandon quest', fn: () => { P.quest = null; updateQuestHud(); log('Quest abandoned.', '#cfd8de'); NPC_UI.quest(n); } },
        closeBtn,
      ],
    );
  }
  const offers = questOffers();
  openDlg(
    n.n,
    n.title + ' · Quests done: ' + (P.qdone || 0),
    '<p>The villagers need help. Pick a hunt, defeat the monsters anywhere in the world, then report back to me for your reward. One quest at a time.</p><div class="sks">' +
      offers
        .map((o, i) => {
          const T = MOBS[o.mob];
          return row('Hunt ' + o.need + ' × ' + T.n + (T.boss ? ' (boss)' : ''), 'Monster Lv ' + T.lv + '<br>' + questRewardLine(o), '<button type="button" data-q="' + i + '">Accept</button>');
        })
        .join('') +
      '</div>',
    [{ t: 'New quests', fn: () => { qOffers = null; NPC_UI.quest(n); } }, closeBtn],
  );
  onBtn('button[data-q]', (d) => {
    P.quest = { ...offers[+d.q] };
    updateQuestHud();
    sfxClick();
    log('Quest accepted: hunt ' + P.quest.need + ' ' + MOBS[P.quest.mob].n + '.', '#7fe3ff');
    NPC_UI.quest(n);
  });
};

/* ======================================================================================
 * Bank: gold, spare equipment and materials
 * ==================================================================================== */
let bankTab = 'gold';
NPC_UI.bank = (n) => {
  const V = P.vault,
    tabs = [['gold', 'Gold'], ['items', 'Equipment'], ['mats', 'Materials']];
  let body = '';
  if (bankTab === 'gold') {
    const amts = [1000, 10000, 100000];
    body =
      '<div class="stats"><div><span>In your wallet</span><b>' + money(P.gold) + '</b></div><div><span>In the vault</span><b>' + money(V.gold) + '</b></div></div>' +
      '<h4 class="skh">Deposit</h4><div class="row">' +
      amts.map((a) => '<button type="button" class="ghost" data-dep="' + a + '"' + (P.gold < a ? ' disabled' : '') + '>' + money(a) + '</button>').join('') +
      '<button type="button" class="ghost" data-dep="all"' + (P.gold < 1 ? ' disabled' : '') + '>All</button></div>' +
      '<h4 class="skh">Withdraw</h4><div class="row">' +
      amts.map((a) => '<button type="button" class="ghost" data-wd="' + a + '"' + (V.gold < a ? ' disabled' : '') + '>' + money(a) + '</button>').join('') +
      '<button type="button" class="ghost" data-wd="all"' + (V.gold < 1 ? ' disabled' : '') + '>All</button></div>' +
      '<p class="hint">The vault is shared by all gold, items and materials you store here. Nothing in the vault is lost when you are knocked out.</p>';
  } else if (bankTab === 'items') {
    const bag = Object.keys(P.own).filter((id) => ITEMS[id] && P.equip[ITEMS[id].slot] !== id),
      stored = Object.keys(V.items).filter((id) => ITEMS[id]),
      line = (id, act) => {
        const it = ITEMS[id];
        return '<div class="sk item" style="--c:' + it.col + '">' + itemIconImg(it) + '<div><b style="color:' + it.col + '">' + it.n + '</b><div class="meta"><span>' + (it.cosm ? 'Cosmetic' : SLOT_NAME[it.slot] + ' · Lv ' + it.lv) + '</span></div></div><span class="act">' + act + '</span></div>';
      };
    body =
      '<h4 class="skh">In your bag <small>worn gear stays on you</small></h4>' +
      (bag.map((id) => line(id, '<button type="button" data-st="' + id + '">Store</button>')).join('') || '<p class="hint">No spare equipment.</p>') +
      '<h4 class="skh">In the vault</h4>' +
      (stored.map((id) => line(id, '<button type="button" data-tk="' + id + '">Take</button>')).join('') || '<p class="hint">Nothing stored.</p>');
  } else {
    const bag = MAT_ORDER.filter((k) => P.mats[k] > 0),
      stored = MAT_ORDER.filter((k) => V.mats[k] > 0),
      line = (k, q, att, lbl) => row(MATS[k].n + ' <em>x' + q + '</em>', RARITY_NAME[MATS[k].rarity] + ' · ' + MATS[k].mapName, '<button type="button" data-' + att + '="' + k + '">' + lbl + '</button>', MATS[k].col);
    body =
      '<h4 class="skh">In your bag</h4>' +
      (bag.length ? '<div class="row" style="margin-bottom:6px"><button type="button" class="ghost" data-stall>Store all</button></div>' : '') +
      (bag.map((k) => line(k, P.mats[k], 'sm', 'Store all')).join('') || '<p class="hint">No materials.</p>') +
      '<h4 class="skh">In the vault</h4>' +
      (stored.length ? '<div class="row" style="margin-bottom:6px"><button type="button" class="ghost" data-tkall>Take all</button></div>' : '') +
      (stored.map((k) => line(k, V.mats[k], 'tm', 'Take all')).join('') || '<p class="hint">Nothing stored.</p>');
  }
  openDlg('Odette — Aldenmoor Bank', n.title, tabBar(tabs, bankTab, 'btab') + body, [closeBtn]);
  dlgc.classList.add('box');
  const again = () => { sfxClick(); save(true); NPC_UI.bank(n); };
  onBtn('button[data-btab]', (d) => { bankTab = d.btab; NPC_UI.bank(n); });
  onBtn('button[data-dep]', (d) => { const a = d.dep === 'all' ? P.gold : Math.min(+d.dep, P.gold); P.gold -= a; V.gold += a; again(); });
  onBtn('button[data-wd]', (d) => { const a = d.wd === 'all' ? V.gold : Math.min(+d.wd, V.gold); V.gold -= a; P.gold += a; again(); });
  onBtn('button[data-st]', (d) => { delete P.own[d.st]; V.items[d.st] = 1; again(); });
  onBtn('button[data-tk]', (d) => { delete V.items[d.tk]; P.own[d.tk] = 1; again(); });
  onBtn('button[data-sm]', (d) => { V.mats[d.sm] = (V.mats[d.sm] || 0) + P.mats[d.sm]; delete P.mats[d.sm]; again(); });
  onBtn('button[data-tm]', (d) => { P.mats[d.tm] = (P.mats[d.tm] || 0) + V.mats[d.tm]; delete V.mats[d.tm]; again(); });
  onBtn('button[data-stall]', () => { for (const k of Object.keys(P.mats)) { V.mats[k] = (V.mats[k] || 0) + P.mats[k]; delete P.mats[k]; } again(); });
  onBtn('button[data-tkall]', () => { for (const k of Object.keys(V.mats)) { P.mats[k] = (P.mats[k] || 0) + V.mats[k]; delete V.mats[k]; } again(); });
};

/* ======================================================================================
 * Material Trader: sells everything in bulk for +15% over the normal price
 * ==================================================================================== */
const TRADER_BONUS = 0.15;
NPC_UI.trader = (n) => {
  const ids = MAT_ORDER.filter((k) => P.mats[k] > 0),
    val = (k) => Math.round(matSellPrice(k) * (1 + TRADER_BONUS)) * P.mats[k],
    total = ids.reduce((s, k) => s + val(k), 0);
  const byR = RARITY.map((r) => [r, ids.filter((k) => MATS[k].rarity === r)]).filter((x) => x[1].length);
  openDlg(
    n.n,
    n.title,
    '<p>I pay <b style="color:var(--accent)">+' + Math.round(TRADER_BONUS * 100) + '%</b> over the usual price for materials. Everything in your bag is worth <b>' + money(total) + '</b> to me.</p>' +
      (byR.length
        ? '<div class="sks">' +
          byR.map(([r, list]) => row(RARITY_NAME[r] + ' materials', list.reduce((s, k) => s + P.mats[k], 0) + ' items · ' + list.length + ' kinds', '<button type="button" data-tr="' + r + '">Sell · ' + money(list.reduce((s, k) => s + val(k), 0)) + '</button>', RARITY_COL[r])).join('') +
          '</div>'
        : '<p class="hint">You have no materials. Monsters out in the wild drop them.</p>'),
    [{ t: 'Sell everything · ' + money(total), primary: 1, dis: !total, fn: () => sellMats(n, null) }, closeBtn],
  );
  onBtn('button[data-tr]', (d) => sellMats(n, d.tr));
};
function sellMats(n, rarity) {
  let g = 0;
  for (const k of Object.keys(P.mats)) {
    if (rarity && MATS[k].rarity !== rarity) continue;
    g += Math.round(matSellPrice(k) * (1 + TRADER_BONUS)) * P.mats[k];
    delete P.mats[k];
  }
  if (!g) return;
  P.gold += g;
  sfxSell();
  log('Sold materials for ' + money(g) + ' (+' + Math.round(TRADER_BONUS * 100) + '% bonus).', '#f2b84b');
  save(true);
  NPC_UI.trader(n);
}

/* ======================================================================================
 * Warp Master: travel to maps you have been to (fee grows with distance)
 * ==================================================================================== */
const WARP_ORDER = ['village', 'meadow', 'forest', 'ruins', 'swamp', 'desert', 'frost', 'volcano', 'abyss'];
const warpFee = (i) => i * i * 20;
function warpSpot(i) {
  const p = MAPDEF[WARP_ORDER[i - 1]].portals.find((q) => q.to === WARP_ORDER[i]);
  return { x: p.tx, y: p.ty };
}
NPC_UI.warp = (n) => {
  openDlg(
    n.n,
    n.title + ' · You have ' + money(P.gold),
    '<p>I can send you to any place you have already discovered, for a small fee. Walk through a map\'s portals to discover the next one.</p><div class="sks">' +
      WARP_ORDER.slice(1)
        .map((id, k) => {
          const i = k + 1,
            D = MAPDEF[id],
            seen = !!P.visited[id],
            fee = warpFee(i);
          return row(
            seen ? D.name : '???',
            seen ? D.sub + ' · ' + money(fee) : 'Not discovered yet',
            '<button type="button" data-w="' + id + '"' + (seen && P.gold >= fee ? '' : ' disabled') + '>' + (seen ? 'Warp' : 'Locked') + '</button>',
          );
        })
        .join('') +
      '</div>',
    [closeBtn],
  );
  onBtn('button[data-w]', (d) => {
    const i = WARP_ORDER.indexOf(d.w),
      fee = warpFee(i);
    if (!P.visited[d.w] || P.gold < fee) return;
    P.gold -= fee;
    closeDlg();
    const s = warpSpot(i);
    log('Zephyr sends you to ' + MAPDEF[d.w].name + ' (' + money(fee) + ').', '#c9a0ff');
    changeMap(d.w, s.x, s.y);
  });
};

/* ======================================================================================
 * Sage Orin: reset attribute points or skills
 * ==================================================================================== */
NPC_UI.sage = (n) => {
  const attrSpent = Object.values(P.attr).reduce((s, v) => s + v, 0),
    skillSpent = Object.values(P.learned).reduce((s, v) => s + v, 0),
    costA = Math.max(100, P.lvl * 150),
    costS = Math.max(150, P.lvl * 250);
  openDlg(
    n.n,
    n.title + ' · You have ' + money(P.gold),
    '<p>Made a mistake with your points? I can unravel them, and every point comes back to you to spend again.</p><div class="sks">' +
      row('Reset attributes', attrSpent + ' points spent · refunds <b>' + attrSpent + '</b> attribute points', '<button type="button" data-rs="attr"' + (attrSpent && P.gold >= costA ? '' : ' disabled') + '>' + money(costA) + '</button>') +
      row('Reset skills', skillSpent + ' skill levels learned · refunds <b>' + skillSpent + '</b> skill points', '<button type="button" data-rs="skill"' + (skillSpent && P.gold >= costS ? '' : ' disabled') + '>' + money(costS) + '</button>') +
      '</div>',
    [closeBtn],
  );
  onBtn('button[data-rs]', (d) => {
    const attr = d.rs === 'attr',
      cost = attr ? costA : costS;
    openDlg(
      'Reset ' + (attr ? 'attributes' : 'skills') + '?',
      n.n,
      '<p>This costs <b>' + money(cost) + '</b>. ' + (attr ? 'All your attribute points return to you unspent.' : 'All learned skills reset and your skill points return to you. Your skill bar cooldowns and buffs reset too.') + '</p>',
      [
        {
          t: 'Yes, reset',
          primary: 1,
          fn: () => {
            if (P.gold < cost) return;
            P.gold -= cost;
            if (attr) {
              P.ap += attrSpent;
              for (const k in P.attr) P.attr[k] = 0;
            } else {
              P.sp += skillSpent;
              P.learned = {};
              P.cds = {};
              P.buffs = {};
            }
            calcStats();
            P.hp = Math.min(P.hp, P.st.max);
            P.mp = Math.min(P.mp, P.st.maxMp);
            buildBar();
            sfxPoint();
            log((attr ? 'Attributes' : 'Skills') + ' reset. Press C to spend your points.', '#ffd27a');
            save(true);
            NPC_UI.sage(n);
          },
        },
        { t: 'No', fn: () => NPC_UI.sage(n) },
      ],
    );
  });
};

/* ---------------- "!" / "?" markers above NPCs ---------------- */
function npcMark(n) {
  if (n.id === 'quest') return P.quest ? (questDone(P.quest) ? '?' : '') : '!';
  if (n.id === 'guild') return !P.guildName && P.lvl >= GUILD_MIN_LV ? '!' : '';
  return '';
}
