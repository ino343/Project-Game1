/**
 * Storage layer: accounts, session, characters and guilds, stored in SUPABASE.
 *
 * The rest of the game still calls Store.Accounts / Session / Characters / Guilds the same way as
 * before (synchronously). To keep that working, everything is loaded into memory once at start-up
 * (await Store.ready) and every change is written to the cloud in the background:
 *
 *   page start  -> Store.ready loads my heroes + the guild list from Supabase
 *   game reads  -> served from memory (instant)
 *   game saves  -> memory is updated at once, then sent to Supabase (batched, only what changed)
 *
 * Needs: the supabase-js script + js/shared/supabase-config.js loaded BEFORE this file, and the
 * tables from supabase-schema.sql. Passwords are handled by Supabase Auth, never stored by us.
 *
 * Public API:  Store.ready, Store.configured, Store.Accounts, Store.Session, Store.Characters, Store.Guilds
 */
const Store = (() => {
  const MAX_SLOTS = 3;
  const DEBOUNCE_MS = 800;
  const cfg = window.ALDENMOOR_SUPABASE || {};
  const configured = !!(cfg.url && cfg.anonKey && !/YOUR-/i.test(cfg.url + cfg.anonKey) && window.supabase);
  const NOT_SET = 'Supabase is not set up yet. Open js/shared/supabase-config.js and paste your Project URL and anon key.';

  // While the tab is closing / hidden, "keepalive" lets small saves finish after the page is gone.
  let closing = false;
  const keepaliveFetch = (input, init = {}) =>
    fetch(input, closing && (!init.body || String(init.body).length < 30000) ? { ...init, keepalive: true } : init);
  const sb = configured
    ? window.supabase.createClient(cfg.url, cfg.anonKey, { global: { fetch: keepaliveFetch } })
    : null;

  const hooks = { onError: () => {} };
  const fail = (error) => ({ ok: false, error });
  const errMsg = (e) => (e && (e.message || e.details)) || String(e);
  const report = (e, what) => {
    console.error('[Store]', e);
    try {
      hooks.onError((what ? what + ': ' : '') + errMsg(e));
    } catch (_) {}
  };
  const toInt = (v, lo, hi) => {
    v = Math.floor(+v);
    if (!Number.isFinite(v)) v = lo;
    return Math.min(hi, Math.max(lo, v));
  };
  const BIG = 9e15;

  /* ---------- in-memory cache ---------- */
  let userId = null;
  let username = '';
  let chars = []; // hero objects in the same shape the game always used ("save" objects)
  let guilds = [];
  let loadError = '';
  const snaps = {}; // heroId -> JSON of what Supabase already has (so we only send changes)

  /* ---------- serial write queue ---------- */
  let chain = Promise.resolve();
  const enqueue = (fn) => (chain = chain.then(fn).catch((e) => report(e, 'Cloud save failed')));
  const dirty = new Set();
  let timer = 0;
  const schedule = (id) => {
    dirty.add(id);
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  };
  function flush() {
    clearTimeout(timer);
    timer = 0;
    const ids = [...dirty];
    dirty.clear();
    return enqueue(async () => {
      for (const id of ids) {
        try {
          await flushChar(id);
        } catch (e) {
          report(e, 'Cloud save failed');
        }
      }
    });
  }

  /* ---------- database rows <-> game objects ---------- */
  const must = async (q) => {
    const r = await q;
    if (r.error) throw r.error;
    return r.data || [];
  };
  const CHILD_TABLES = [
    'character_skills', 'character_hotbar', 'character_items', 'character_equipment', 'character_materials',
    'character_pets', 'vault_items', 'vault_materials', 'character_visited_maps', 'character_active_quest',
  ];

  function fromRow(row, by) {
    const id = String(row.id);
    const of = (t) => (by[t] && by[t][row.id]) || [];
    const skillLv = {};
    for (const r of of('character_skills')) skillLv[r.skill_id] = r.level;
    const hotbar = new Array(18).fill(null);
    for (const r of of('character_hotbar')) hotbar[r.slot_no] = r.action;
    const equip = {};
    for (const r of of('character_equipment')) equip[r.slot] = r.item_id;
    const mats = {};
    for (const r of of('character_materials')) mats[r.material_id] = r.qty;
    const vault = { gold: Number(row.vault_gold) || 0, items: {}, mats: {} };
    for (const r of of('vault_items')) vault.items[r.item_id] = 1;
    for (const r of of('vault_materials')) vault.mats[r.material_id] = r.qty;
    const q = of('character_active_quest')[0];
    return {
      id,
      slot: row.slot_no,
      name: row.name,
      job: row.job_id,
      look: { gender: row.gender, hairStyle: row.hair_style, hairColor: row.hair_color, skinColor: row.skin_color, outfitColor: row.outfit_color || '' },
      lvl: row.level,
      exp: Number(row.exp),
      mlvl: row.mastery_level,
      mexp: Number(row.mastery_exp),
      gold: Number(row.gold),
      hpP: row.hp_potions,
      mpP: row.mp_potions,
      wep: 0, // legacy field
      own: of('character_items').map((r) => r.item_id),
      equip,
      mats,
      pets: of('character_pets').map((r) => r.pet_id),
      pet: row.active_pet_id || null,
      vault,
      visited: of('character_visited_maps').map((r) => r.map_id),
      quest: q ? { mob: q.monster_id, need: q.need, have: q.have, xp: q.reward_xp, gold: q.reward_gold, pots: q.reward_potions } : null,
      qdone: row.quests_done,
      guild: null, // filled in by loadGuilds()
      attr: { str: row.attr_str, dex: row.attr_dex, spd: row.attr_spd, luk: row.attr_luk, dod: row.attr_dod, vit: row.attr_vit },
      ap: row.ap,
      sp: row.sp,
      learned: Object.keys(skillLv),
      skillLv,
      hotbar,
      hotbarJob: row.hotbar_job_id || undefined,
      hotbarV: 2,
      map: row.map_id,
      x: row.pos_x === null ? undefined : row.pos_x,
      y: row.pos_y === null ? undefined : row.pos_y,
      fresh: !!row.is_fresh,
      createdAt: Date.parse(row.created_at) || Date.now(),
      updatedAt: Date.parse(row.updated_at) || Date.now(),
    };
  }

  // Game object -> the rows that should exist in the database.
  const byKey = (k) => (a, b) => (String(a[k]) < String(b[k]) ? -1 : String(a[k]) > String(b[k]) ? 1 : 0);
  function toParts(c) {
    const own = new Set(c.own || []);
    const a = c.attr || {};
    const v = c.vault || {};
    const qd = c.quest && c.quest.mob && c.quest.need > 0 ? c.quest : null;
    const qty = (m) => Object.entries(m || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n: Math.floor(n) }));
    const finite = (n) => (Number.isFinite(+n) && n !== null && n !== undefined ? +n : null);
    return {
      main: {
        job_id: c.job,
        level: toInt(c.lvl, 0, 100),
        exp: toInt(c.exp, 0, BIG),
        mastery_level: toInt(c.mlvl, 0, 100),
        mastery_exp: toInt(c.mexp, 0, BIG),
        ap: toInt(c.ap, 0, BIG),
        sp: toInt(c.sp, 0, BIG),
        attr_str: toInt(a.str, 0, 100), attr_dex: toInt(a.dex, 0, 100), attr_spd: toInt(a.spd, 0, 100),
        attr_luk: toInt(a.luk, 0, 100), attr_dod: toInt(a.dod, 0, 100), attr_vit: toInt(a.vit, 0, 100),
        gold: toInt(c.gold, 0, BIG),
        hp_potions: toInt(c.hpP, 0, BIG),
        mp_potions: toInt(c.mpP, 0, BIG),
        vault_gold: toInt(v.gold, 0, BIG),
        map_id: c.map || 'village',
        pos_x: finite(c.x),
        pos_y: finite(c.y),
        active_pet_id: c.pet || null,
        quests_done: toInt(c.qdone, 0, BIG),
        hotbar_job_id: c.hotbarJob || null,
        is_fresh: !!c.fresh,
      },
      skills: Object.entries(c.skillLv || {}).filter(([, l]) => l >= 1).map(([id, l]) => ({ skill_id: id, level: toInt(l, 1, 15) })).sort(byKey('skill_id')),
      hotbar: (c.hotbar || []).slice(0, 18).map((x, i) => (x ? { slot_no: i, action: x } : null)).filter(Boolean),
      items: [...own].map((id) => ({ item_id: id })).sort(byKey('item_id')),
      equip: Object.entries(c.equip || {}).filter(([, id]) => id && own.has(id)).map(([slot, id]) => ({ slot, item_id: id })).sort(byKey('slot')),
      mats: qty(c.mats).map((m) => ({ material_id: m.id, qty: m.n })).sort(byKey('material_id')),
      pets: (c.pets || []).map((id) => ({ pet_id: id })).sort(byKey('pet_id')),
      vitems: Object.keys(v.items || {}).map((id) => ({ item_id: id })).sort(byKey('item_id')),
      vmats: qty(v.mats).map((m) => ({ material_id: m.id, qty: m.n })).sort(byKey('material_id')),
      visited: (c.visited || []).map((id) => ({ map_id: id })).sort(byKey('map_id')),
      quest: qd ? [{ monster_id: qd.mob, need: Math.floor(qd.need), have: toInt(qd.have, 0, Math.floor(qd.need)), reward_xp: toInt(qd.xp, 0, BIG), reward_gold: toInt(qd.gold, 0, BIG), reward_potions: toInt(qd.pots, 0, BIG) }] : [],
    };
  }

  // Send only what changed since the last successful save.
  async function flushChar(id) {
    const c = chars.find((x) => x.id === id);
    if (!c) return;
    const parts = toParts(c);
    const snap = snaps[id] || (snaps[id] = {});
    const cid = Number(id);
    const js = JSON.stringify;
    const del = async (t) => {
      const r = await sb.from(t).delete().eq('character_id', cid);
      if (r.error) throw r.error;
    };
    const ins = async (t, rows) => {
      if (!rows.length) return;
      const r = await sb.from(t).insert(rows.map((x) => ({ character_id: cid, ...x })));
      if (r.error) throw r.error;
    };
    const changed = (k) => js(parts[k]) !== snap[k];
    const simple = async (k, table) => {
      if (!changed(k)) return;
      await del(table);
      await ins(table, parts[k]);
      snap[k] = js(parts[k]);
    };

    if (changed('main')) {
      const r = await sb.from('characters').update(parts.main).eq('id', cid);
      if (r.error) throw r.error;
      snap.main = js(parts.main);
    }
    await simple('skills', 'character_skills');
    await simple('hotbar', 'character_hotbar');
    if (changed('items') || changed('equip')) {
      await del('character_equipment');
      if (changed('items')) {
        await del('character_items');
        await ins('character_items', parts.items);
        snap.items = js(parts.items);
      }
      await ins('character_equipment', parts.equip);
      snap.equip = js(parts.equip);
    }
    await simple('mats', 'character_materials');
    await simple('pets', 'character_pets');
    await simple('vitems', 'vault_items');
    await simple('vmats', 'vault_materials');
    await simple('visited', 'character_visited_maps');
    await simple('quest', 'character_active_quest');
  }

  /* ---------- load everything after login ---------- */
  async function loadCharacters() {
    const [rows, ...rest] = await Promise.all([
      must(sb.from('characters').select('*').order('slot_no')),
      ...CHILD_TABLES.map((t) => must(sb.from(t).select('*'))),
    ]);
    const by = {};
    CHILD_TABLES.forEach((t, i) => {
      by[t] = {};
      for (const r of rest[i]) (by[t][r.character_id] = by[t][r.character_id] || []).push(r);
    });
    chars = rows.map((r) => fromRow(r, by));
    for (const c of chars) snaps[c.id] = snapOf(toParts(c));
  }
  // what the database now holds for a hero, as JSON per part (compared on the next save)
  const snapOf = (parts) => {
    const o = {};
    for (const k in parts) o[k] = JSON.stringify(parts[k]);
    return o;
  };

  async function loadGuilds() {
    const [g, m] = await Promise.all([must(sb.from('guilds').select('*')), must(sb.from('guild_members').select('*'))]);
    const ids = m.map((x) => x.character_id);
    const pub = ids.length ? await must(sb.from('public_characters').select('id,name,job,level').in('id', ids)) : [];
    const info = {};
    for (const p of pub) info[p.id] = p;
    const mine = new Set(chars.map((c) => c.id));
    const keyFor = (cid) => (mine.has(String(cid)) ? userId + ':' + cid : 'c:' + cid);
    guilds = g.map((x) => {
      const members = m
        .filter((y) => y.guild_id === x.id)
        .map((y) => {
          const p = info[y.character_id] || {};
          return { k: keyFor(y.character_id), n: p.name || '?', lvl: p.level || 0, job: p.job || '', role: y.role };
        });
      const master = members.find((y) => y.role === 'master');
      return { id: String(x.id), name: x.name, level: x.level, funds: Number(x.funds), minLv: x.min_level, created: Date.parse(x.created_at) || 0, master: master ? master.k : null, members };
    });
    for (const c of chars) {
      const mem = m.find((y) => String(y.character_id) === c.id);
      c.guild = mem ? String(mem.guild_id) : null;
    }
  }

  async function loadAll(user) {
    userId = user.id;
    const prof = await must(sb.from('profiles').select('username').eq('id', user.id));
    username = (prof[0] && prof[0].username) || (user.user_metadata && user.user_metadata.username) || '';
    await loadCharacters();
    await loadGuilds();
  }
  const clearCache = () => {
    userId = null;
    username = '';
    chars = [];
    guilds = [];
    for (const k in snaps) delete snaps[k];
  };

  /* ---------- start-up ---------- */
  const ready = (async () => {
    if (!sb) return;
    try {
      const { data } = await sb.auth.getSession();
      if (data && data.session) await loadAll(data.session.user);
    } catch (e) {
      clearCache();
      loadError = 'Could not load your data from Supabase: ' + errMsg(e);
      console.error('[Store]', e);
    }
  })();

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const cleanEmail = (v) => String(v).trim().toLowerCase();

  /* ---------- accounts ---------- */
  const Accounts = {
    // Real e-mail: Supabase sends a confirmation link. Turn ON "Confirm email" in Authentication > Providers > Email.
    async register(name, email, password) {
      if (!sb) return fail(NOT_SET);
      name = String(name).trim();
      email = cleanEmail(email);
      if (!/^[A-Za-z0-9_]{3,32}$/.test(name)) return fail('Username must be 3-32 letters, numbers or underscores.');
      if (!isEmail(email)) return fail('Please enter a valid email address.');
      if (String(password).length < 6) return fail('Password must be at least 6 characters.');
      const opts = { data: { username: name } };
      if (/^https?:$/.test(location.protocol)) opts.emailRedirectTo = location.origin + location.pathname;
      const { data, error } = await sb.auth.signUp({ email, password, options: opts });
      if (error) {
        const m = errMsg(error);
        if (/rate limit/i.test(m)) return fail('Too many emails were sent. Please wait a while and try again.');
        if (/already|database error/i.test(m)) return fail('That username or email is already taken.');
        return fail(m);
      }
      // Supabase hides existing e-mails: a fake user with no identities comes back instead of an error.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
        return fail('That email is already registered. Try logging in.');
      if (!data.session)
        return { ok: false, info: true, email, error: 'Account created! We sent a confirmation link to ' + email + '. Click it, then log in here.' };
      try {
        loadError = '';
        await loadAll(data.session.user);
      } catch (e) {
        clearCache();
        return fail('Account created, but loading data failed: ' + errMsg(e));
      }
      return { ok: true, user: userId };
    },

    async login(email, password) {
      if (!sb) return fail(NOT_SET);
      email = cleanEmail(email);
      if (!isEmail(email)) return fail('Please enter the email you signed up with.');
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        const m = errMsg(error);
        if (/confirm/i.test(m)) return fail('Please confirm your email first. Check your inbox (and spam) for the link.');
        if (/rate limit/i.test(m)) return fail('Too many attempts. Please wait a while and try again.');
        return fail('Wrong email or password.');
      }
      try {
        loadError = '';
        await loadAll(data.session.user);
      } catch (e) {
        clearCache();
        return fail('Logged in, but loading data failed: ' + errMsg(e));
      }
      return { ok: true, user: userId };
    },
  };

  /* ---------- session ---------- */
  const KEY_ACTIVE = 'aldenmoor:active-character';
  const Session = {
    getUser: () => userId,
    getDisplayName: () => username,
    async logout() {
      Session.clearActive();
      try {
        await flush();
        if (sb) await sb.auth.signOut({ scope: 'local' });
      } catch (e) {}
      clearCache();
    },
    // The active character is per-tab, so two tabs cannot overwrite each other.
    setActive(charId) {
      try {
        sessionStorage.setItem(KEY_ACTIVE, charId);
      } catch (e) {}
    },
    getActive() {
      try {
        return sessionStorage.getItem(KEY_ACTIVE);
      } catch (e) {
        return null;
      }
    },
    clearActive() {
      try {
        sessionStorage.removeItem(KEY_ACTIVE);
      } catch (e) {}
    },
  };

  /* ---------- characters ---------- */
  const Characters = {
    MAX_SLOTS,
    list: () => chars.slice().sort((a, b) => a.slot - b.slot),
    get: (user, id) => chars.find((c) => c.id === id) || null,
    // Async: we need the id the database gives the new hero.
    async create(user, { name, job, look }) {
      if (!sb || !userId) return fail(NOT_SET);
      if (chars.length >= MAX_SLOTS) return fail('All character slots are in use.');
      const used = new Set(chars.map((c) => c.slot));
      let slot = 1;
      while (used.has(slot)) slot++;
      const l = look || {};
      const { data, error } = await sb
        .from('characters')
        .insert({
          account_id: userId, slot_no: slot, name, job_id: job,
          gender: l.gender, hair_style: l.hairStyle, hair_color: l.hairColor, skin_color: l.skinColor, outfit_color: l.outfitColor || null,
        })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') return fail('That hero name is already taken.');
        return fail(errMsg(error));
      }
      const character = fromRow(data, {});
      chars.push(character);
      snaps[character.id] = snapOf(toParts(character));
      return { ok: true, character };
    },
    update(user, id, patch) {
      const c = chars.find((x) => x.id === id);
      if (!c) return false;
      Object.assign(c, patch, { updatedAt: Date.now() });
      schedule(id);
      return true;
    },
    remove(user, id) {
      chars = chars.filter((c) => c.id !== id);
      delete snaps[id];
      dirty.delete(id);
      enqueue(async () => {
        const r = await sb.from('characters').delete().eq('id', Number(id));
        if (r.error) throw r.error;
      });
      return true;
    },
  };

  /* ---------- guilds ----------
   * Cache shape (unchanged for the game): { id, name, master (member key), level, funds, minLv, created,
   *   members: [{ k, n, lvl, job, role }] }. A member key is "userId:heroId" for my own heroes, "c:heroId" for others.
   * Name / level / job of a member always come from the heroes table, so only joining and leaving are written. */
  const heroIdOf = (k) => Number(String(k).split(':')[1]);
  const Guilds = {
    list: () => guilds,
    get: (id) => (id ? guilds.find((g) => g.id === String(id)) || null : null),
    async refresh() {
      if (!sb || !userId) return;
      try {
        await chain;
        await loadGuilds();
      } catch (e) {
        report(e, 'Could not refresh guilds');
      }
    },
    // Apply fn(guild) to one guild; funds / level / min level and joins / leaves are saved in the background.
    update(id, fn) {
      const g = guilds.find((x) => x.id === String(id));
      if (!g) return null;
      const before = { funds: g.funds, level: g.level, minLv: g.minLv, ks: g.members.map((m) => m.k) };
      fn(g);
      const m = g.members.find((x) => x.role === 'master');
      g.master = m ? m.k : null;
      const gid = Number(g.id);
      const joined = g.members.filter((x) => !before.ks.includes(x.k));
      const left = before.ks.filter((k) => !g.members.some((x) => x.k === k));
      enqueue(async () => {
        if (g.funds !== before.funds || g.level !== before.level || g.minLv !== before.minLv) {
          const r = await sb.from('guilds').update({ funds: g.funds, level: g.level, min_level: g.minLv }).eq('id', gid);
          if (r.error) throw r.error;
        }
        for (const x of joined) {
          const r = await sb.from('guild_members').insert({ guild_id: gid, character_id: heroIdOf(x.k), role: x.role || 'member' });
          if (r.error) throw r.error;
        }
        for (const k of left) {
          const r = await sb.from('guild_members').delete().eq('guild_id', gid).eq('character_id', heroIdOf(k));
          if (r.error) throw r.error;
        }
      });
      return g;
    },
    // Async: the guild id comes from the database.
    async create(name, member) {
      if (!sb || !userId) return fail(NOT_SET);
      const { data, error } = await sb.from('guilds').insert({ name }).select().single();
      if (error) return fail(error.code === '23505' ? 'That guild name is already taken.' : errMsg(error));
      const r = await sb.from('guild_members').insert({ guild_id: data.id, character_id: heroIdOf(member.k), role: 'master' });
      if (r.error) {
        await sb.from('guilds').delete().eq('id', data.id);
        return fail(errMsg(r.error));
      }
      const g = { id: String(data.id), name: data.name, level: data.level, funds: Number(data.funds), minLv: data.min_level, created: Date.parse(data.created_at) || Date.now(), master: member.k, members: [{ ...member, role: 'master' }] };
      guilds.push(g);
      return { ok: true, guild: g };
    },
    remove(id) {
      guilds = guilds.filter((g) => g.id !== String(id));
      enqueue(async () => {
        const r = await sb.from('guilds').delete().eq('id', Number(id));
        if (r.error) throw r.error;
      });
      return true;
    },
  };

  // Best effort: push pending saves as soon as the tab is hidden or closed.
  if (typeof addEventListener === 'function') {
    addEventListener('pagehide', () => {
      closing = true;
      if (dirty.size) flush();
    });
    addEventListener('visibilitychange', () => {
      closing = document.visibilityState === 'hidden';
      if (closing && dirty.size) flush();
    });
  }

  return {
    ready,
    configured,
    flush,
    Accounts,
    Session,
    Characters,
    Guilds,
    get loadError() {
      return loadError;
    },
    get onError() {
      return hooks.onError;
    },
    set onError(fn) {
      hooks.onError = fn;
    },
  };
})();
