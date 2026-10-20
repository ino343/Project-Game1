/**
 * Chat box: press Enter to type (Esc cancels, Enter sends, Up/Down recalls earlier lines).
 * Lines starting with "/" are commands, for example  /level 60  or  /gold 50000  (type /help).
 */
let chatOpen = false;
const chatEl = $('#chat'),
  chatIn = $('#chatIn'),
  chatHist = [];
let chatHi = 0;
const GOLD_MAX = 999999999;
let GODMODE = false; // /god: monsters cannot hurt you

function openChat(prefill) {
  if (chatOpen || uiOpen || transition || !running) return;
  chatOpen = true;
  for (const k in keys) keys[k] = false; // stop walking while typing
  holdAtk = false;
  P.auto = false;
  chatEl.hidden = false;
  chatIn.value = prefill || '';
  chatHi = chatHist.length;
  chatIn.focus();
}
function closeChat() {
  chatOpen = false;
  chatEl.hidden = true;
  chatIn.value = '';
  chatIn.blur();
}
chatIn.addEventListener('keydown', (e) => {
  e.stopPropagation(); // keep typing from triggering game hotkeys
  if (e.key === 'Enter') {
    e.preventDefault();
    const t = chatIn.value.trim();
    closeChat();
    if (t) {
      chatHist.push(t);
      if (chatHist.length > 30) chatHist.shift();
      runChat(t);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeChat();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    chatHi = clamp(chatHi + (e.key === 'ArrowUp' ? -1 : 1), 0, chatHist.length);
    chatIn.value = chatHist[chatHi] || '';
  }
});
chatIn.addEventListener('blur', () => {
  if (chatOpen) closeChat();
});

/* ---------------- command list ----------------
 * Each command is one entry here. /help lists every entry with on: true, so the list always matches
 * what exists. To remove a command, delete its entry (or set on: false to just switch it off).
 * run(args, say) gets the words after the command name; use bad('message') to report a mistake.
 */
const bad = (m) => log(m, '#ff8a80');
const COMMANDS = [
  {
    name: 'level',
    alias: ['lv', 'setlevel'],
    usage: '/level <1-' + MAXLV + '>',
    desc: 'Set your level. EXP resets, HP/MP refill, attribute and skill points follow the level.',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (!Number.isFinite(n) || n < 1 || n > MAXLV) return bad('Usage: /level <1-' + MAXLV + '>');
      if (n > lvCapFor(P.job)) return bad('A 1st job tops out at level ' + JOB2LV + '. Advance to your 2nd job to go higher.');
      setLevelCmd(n);
    },
  },
  {
    name: 'gold',
    alias: ['coins', 'coin', 'money'],
    usage: '/gold <amount>   /gold set <amount>',
    desc: 'Add gold (a negative amount takes it away), or set it exactly. Max ' + GOLD_MAX.toLocaleString() + '.',
    on: true,
    run(args) {
      const set = (args[0] || '').toLowerCase() === 'set',
        n = Math.floor(+(set ? args[1] : args[0]));
      if (!Number.isFinite(n)) return bad('Usage: /gold <amount>   or   /gold set <amount>');
      const before = P.gold;
      P.gold = clamp(set ? n : P.gold + n, 0, GOLD_MAX);
      const d = P.gold - before;
      sfxBuy();
      log((set ? 'Gold set to ' : d >= 0 ? 'Added ' : 'Removed ') + (set ? P.gold.toLocaleString() : Math.abs(d).toLocaleString()) + 'g. You now have ' + P.gold.toLocaleString() + 'g.', '#f2b84b');
      ft(P.x, P.y - 52, (d >= 0 ? '+' : '') + d.toLocaleString() + 'g', '#f2b84b', 15, -38, false, 'loot');
      save(true);
    },
  },
  {
    name: 'damage',
    alias: ['dmg', 'hurt'],
    usage: '/damage <me|player name> <amount>',
    desc: 'Deal damage to a player (yourself with "me" or your own name; "/damage <amount>" also hits you). Ignores dodge and God mode, and knocks you out if HP reaches 0.',
    on: true,
    run(args) {
      const usage = 'Usage: /damage <me|player name> <amount>',
        n = Math.floor(+String(args[args.length - 1]).replace(/,/g, ''));
      if (!args.length || !Number.isFinite(n) || n < 1) return bad(usage);
      const who = args.slice(0, -1).join(' ').toLowerCase();
      if (who && who !== 'me' && who !== 'self' && who !== P.name.toLowerCase()) return bad('Player "' + args.slice(0, -1).join(' ') + '" is not here. You can only target yourself ("me" or ' + P.name + ').');
      if (transition) return;
      P.hp -= n;
      P.sit = false;
      P.flash = 0.15;
      ft(P.x, P.y - 40, '-' + n.toLocaleString(), '#ff6a60', 18, -40);
      sfxHurt(n >= P.st.max * 0.3);
      log(P.name + ' took ' + n.toLocaleString() + ' damage.' + (P.hp > 0 ? ' HP ' + Math.ceil(P.hp).toLocaleString() + ' / ' + P.st.max.toLocaleString() : ''), '#ff8a80');
      if (P.hp <= 0) {
        P.hp = 0;
        faint();
      }
    },
  },
  {
    name: 'heal',
    alias: ['hp', 'full', 'restore'],
    usage: '/heal',
    desc: 'Refill your HP and MP.',
    on: true,
    run() {
      P.hp = P.st.max;
      P.mp = P.st.maxMp;
      P.potCd = 0;
      sfxHeal();
      log('HP and MP fully restored.', '#6fe08a');
      fx.push({ k: 'ring', x: P.x, y: P.y, r: 70, t: 0, dur: 0.6, col: '#6fe08a' });
    },
  },
  {
    name: 'exp',
    alias: ['xp'],
    usage: '/exp <amount>',
    desc: 'Gain EXP (level-ups, points and the 1st-job level cap all work as normal).',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (!Number.isFinite(n) || n < 1) return bad('Usage: /exp <amount>');
      if (P.lvl >= lvCapFor(P.job)) return bad(J().tier === 1 ? 'Max level for a 1st job. Advance to your 2nd job first.' : 'You are already at max level.');
      gainExp(n);
      log('Gained ' + n.toLocaleString() + ' EXP.', '#8ad35e');
      save(true);
    },
  },
  {
    name: 'ap',
    alias: ['attr', 'statpoints'],
    usage: '/ap <amount>',
    desc: 'Add attribute points (a negative amount takes unspent ones away).',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (!Number.isFinite(n) || n === 0) return bad('Usage: /ap <amount>');
      P.ap = Math.max(0, P.ap + n);
      sfxPoint();
      log('You now have ' + P.ap + ' unspent attribute points. Press C.', '#ffd27a');
      save(true);
    },
  },
  {
    name: 'mlvl',
    alias: ['mastery'],
    usage: '/mlvl <0-' + MLV_MAX + '>',
    desc: 'Set your mastery level (2nd job only). Attribute points follow (' + MLV_AP + ' per Mlvl).',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (J().tier !== 2) return bad('Mastery unlocks when you advance to a 2nd job.');
      if (!Number.isFinite(n) || n < 0 || n > MLV_MAX) return bad('Usage: /mlvl <0-' + MLV_MAX + '>');
      P.ap = Math.max(0, P.ap + MLV_AP * (n - P.mlvl));
      P.mlvl = n;
      P.mexp = 0;
      log('Mastery level set to ' + n + '. You have ' + P.ap + ' unspent attribute points.', '#c9a0ff');
      save(true);
    },
  },
  {
    name: 'sp',
    alias: ['skillpoints'],
    usage: '/sp <amount>',
    desc: 'Add skill points (a negative amount takes unspent ones away).',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (!Number.isFinite(n) || n === 0) return bad('Usage: /sp <amount>');
      P.sp = Math.max(0, P.sp + n);
      sfxPoint();
      log('You now have ' + P.sp + ' unspent skill points. Press C.', '#ffd27a');
      save(true);
    },
  },
  {
    name: 'respec',
    alias: ['reset', 'resetpoints'],
    usage: '/respec',
    desc: 'Reset all attributes and skills and refund every point so you can spend them again.',
    on: true,
    run() {
      const a = Object.values(P.attr).reduce((s, v) => s + v, 0),
        s = Object.values(P.learned).reduce((t, v) => t + v, 0);
      for (const k in P.attr) P.attr[k] = 0;
      P.learned = {};
      P.ap += a;
      P.sp += s;
      P.cds = {};
      P.buffs = {};
      calcStats();
      P.hp = Math.min(P.hp, P.st.max);
      P.mp = Math.min(P.mp, P.st.maxMp);
      buildBar();
      sfxPoint();
      log('Points refunded: you have ' + P.ap + ' attribute and ' + P.sp + ' skill points. Press C.', '#ffd27a');
      save(true);
    },
  },
  {
    name: 'job',
    alias: ['class', 'setjob'],
    usage: '/job <' + Object.keys(JOBS).join('|') + '>',
    desc: 'Switch to another class for testing. Skills and attributes are refunded, wrong-class gear is taken off, and your level is cut to that job\'s cap.',
    on: true,
    run(args) {
      const id = (args[0] || '').toLowerCase();
      if (!JOBS[id]) return bad('Usage: /job <' + Object.keys(JOBS).join('|') + '>');
      if (id === P.job) return bad('You already are a ' + JOBS[id].name + '.');
      P.ap += Object.values(P.attr).reduce((s, v) => s + v, 0);
      P.sp += Object.values(P.learned).reduce((s, v) => s + v, 0);
      for (const k in P.attr) P.attr[k] = 0;
      P.learned = {};
      if (JOBS[id].tier === 1 && P.mlvl) {
        P.ap = Math.max(0, P.ap - MLV_AP * P.mlvl);
        P.mlvl = 0;
        P.mexp = 0;
      }
      P.job = id;
      for (const s of Object.keys(P.equip)) if (P.equip[s] && !usableBy(ITEMS[P.equip[s]], id)) P.equip[s] = null;
      const cap = lvCapFor(id);
      if (P.lvl > cap) {
        P.ap = Math.max(0, P.ap - AP_PER_LV * (P.lvl - cap));
        P.sp = Math.max(0, P.sp - SP_PER_LV * (P.lvl - cap));
        P.lvl = cap;
        P.exp = 0;
      }
      P.cds = {};
      P.buffs = {};
      calcStats();
      P.hp = P.st.max;
      P.mp = P.st.maxMp;
      buildBar();
      toast('Class: ' + JOBS[id].name);
      log('You are now a ' + JOBS[id].name + ' (Lv ' + P.lvl + '). You have ' + P.ap + ' attribute and ' + P.sp + ' skill points.', '#c9a0ff');
      sfxJobAdvance();
      save(true);
    },
  },
  {
    name: 'warp',
    alias: ['tp', 'goto', 'map'],
    usage: '/warp <' + WARP_ORDER.join('|') + '>',
    desc: 'Teleport to any field map for free (it also counts as discovered for the Warp Master).',
    on: true,
    run(args) {
      const id = (args[0] || '').toLowerCase(),
        i = WARP_ORDER.indexOf(id);
      if (i < 0) return bad('Maps: ' + WARP_ORDER.join(', '));
      if (transition) return;
      const s = i ? warpSpot(i) : MAPDEF.village.spawn;
      P.visited[id] = 1;
      log('Warping to ' + MAPDEF[id].name + '...', '#c9a0ff');
      changeMap(id, s.x, s.y);
    },
  },
  {
    name: 'give',
    alias: ['item', 'gear'],
    usage: '/give <itemId|all>',
    desc: 'Get one piece of equipment by id (e.g. waif_weapon_9), or "all" for every item your class can use.',
    on: true,
    run(args) {
      const id = args[0] || '';
      if (id.toLowerCase() === 'all') {
        let n = 0;
        for (const k in ITEMS)
          if (usableBy(ITEMS[k], P.job) && !P.own[k]) {
            P.own[k] = 1;
            n++;
          }
        sfxBuy();
        log('Added ' + n + ' items usable by a ' + J().name + '. Open Items (I) to equip them.', '#9ec9ff');
        return save(true);
      }
      if (!ITEMS[id]) return bad('Unknown item "' + id + '". Try /give all, or an id like ' + (J().tier === 1 ? J().name.toLowerCase() : JOBS[J().from].name.toLowerCase()) + '_weapon_1.');
      if (P.own[id]) return bad('You already own ' + ITEMS[id].n + '.');
      P.own[id] = 1;
      sfxBuy();
      log('Got ' + ITEMS[id].n + '.' + (usableBy(ITEMS[id], P.job) ? '' : ' (your class cannot use it)'), '#9ec9ff');
      save(true);
    },
  },
  {
    name: 'pet',
    alias: ['pets'],
    usage: '/pet <petId|all>',
    desc: 'Adopt a pet by id, or "all" for every pet.',
    on: true,
    run(args) {
      const id = (args[0] || '').toLowerCase();
      if (id === 'all') {
        for (const k in PETS) P.pets[k] = 1;
        if (!P.pet) petSummon(Object.keys(PETS)[0]);
        sfxSummon();
        log('You adopted every pet. Open Items (I) to choose one.', '#ffd27a');
        return save(true);
      }
      if (!PETS[id]) return bad('Pets: ' + Object.keys(PETS).join(', ') + ' (or all)');
      P.pets[id] = 1;
      petSummon(id);
      log('You adopted ' + PETS[id].n + '!', '#ffd27a');
      save(true);
    },
  },
  {
    name: 'potion',
    alias: ['pots', 'potions'],
    usage: '/potion <amount>',
    desc: 'Add HP and MP potions (that amount of each).',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (!Number.isFinite(n) || n < 1) return bad('Usage: /potion <amount>');
      P.hpP = Math.min(9999, P.hpP + n);
      P.mpP = Math.min(9999, P.mpP + n);
      sfxPotion();
      log('You now have ' + P.hpP + ' HP and ' + P.mpP + ' MP potions.', '#9ec9ff');
      save(true);
    },
  },
  {
    name: 'mats',
    alias: ['materials'],
    usage: '/mats <amount>',
    desc: 'Add that many of every material.',
    on: true,
    run(args) {
      const n = Math.floor(+args[0]);
      if (!Number.isFinite(n) || n < 1) return bad('Usage: /mats <amount>');
      for (const id of MAT_ORDER) P.mats[id] = (P.mats[id] || 0) + n;
      sfxBuy();
      log('Added ' + n + ' of every material.', '#f2b84b');
      save(true);
    },
  },
  {
    name: 'killall',
    alias: ['kill', 'clear'],
    usage: '/killall',
    desc: 'Defeat every monster on this map (you still get their EXP, gold and drops).',
    on: true,
    run() {
      let n = 0;
      for (const m of M.mobs)
        if (!m.dead && !m.t.dummy) {
          mobDie(m);
          n++;
        }
      if (!n) return bad('No monsters here.');
      log('Defeated ' + n + ' monsters.', '#b9e8a0');
    },
  },
  {
    name: 'god',
    alias: ['godmode', 'invincible'],
    usage: '/god',
    desc: 'Toggle invincibility (monsters cannot hurt you). Resets when you leave the game.',
    on: true,
    run() {
      GODMODE = !GODMODE;
      log('God mode ' + (GODMODE ? 'ON: you cannot be hurt.' : 'OFF.'), GODMODE ? '#ffd27a' : '#cfd8de');
    },
  },
  {
    name: 'save',
    alias: [],
    usage: '/save',
    desc: 'Save your hero right now.',
    on: true,
    run() {
      save(false);
    },
  },
  {
    name: 'help',
    alias: ['?', 'commands'],
    usage: '/help',
    desc: 'Show every available command.',
    on: true,
    run() {
      showCommands();
    },
  },
];
const activeCommands = () => COMMANDS.filter((c) => c.on);
const findCommand = (word) => activeCommands().find((c) => c.name === word || (c.alias || []).includes(word));

function showCommands() {
  const list = activeCommands(),
    rows = list
      .map(
        (c) =>
          '<div class="sk"><div><b>' + c.usage.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</b><small>' + c.desc +
          ((c.alias || []).length ? ' <em>Also: ' + c.alias.map((a) => '/' + a).join(' ') + '</em>' : '') + '</small></div></div>',
      )
      .join('');
  openDlg(
    'Commands',
    list.length + ' available · press Enter to chat, type / before a command',
    '<div class="sks">' + (rows || '<p style="opacity:.7">No commands are enabled.</p>') + '</div>' +
      '<p style="margin-top:8px;font-size:12px;opacity:.75">Anything you type without a / is just chat.</p>',
    [{ t: 'Close', primary: 1, fn: closeDlg }],
  );
}

function runChat(text) {
  if (text[0] !== '/') {
    log(P.name + ': ' + text, '#ffffff');
    return;
  }
  const [word, ...args] = text.slice(1).trim().split(/\s+/),
    cmd = findCommand((word || '').toLowerCase());
  if (!cmd) return bad('Unknown command "/' + (word || '') + '". Type /help to see the list.');
  cmd.run(args);
}

// Set the level directly. Attribute / skill points follow the change (3 AP + 1 SP per level).
// If you lower the level so far that you have spent more than you now own, attributes and skills are reset and refunded first.
function setLevelCmd(n) {
  const old = P.lvl;
  const fix = (key, per, spentObj, reset) => {
    P[key] += per * (n - old);
    if (P[key] < 0) {
      P[key] += Object.values(spentObj).reduce((s, v) => s + v, 0);
      reset();
      P[key] = Math.max(0, P[key]);
    }
  };
  fix('ap', AP_PER_LV, P.attr, () => { for (const k in P.attr) P.attr[k] = 0; });
  fix('sp', SP_PER_LV, P.learned, () => { P.learned = {}; });
  P.lvl = n;
  P.exp = 0;
  P.cds = {};
  calcStats();
  P.hp = P.st.max;
  P.mp = P.st.maxMp;
  toast('Level ' + n);
  log('Level set to ' + n + '. You have ' + P.ap + ' attribute and ' + P.sp + ' skill points.', '#ffd27a');
  fx.push({ k: 'ring', x: P.x, y: P.y, r: 90, t: 0, dur: 0.8, col: '#f2b84b' });
  sfxLevelUp();
  save(true);
}
