/**
 * Storage layer: accounts, session and characters.
 *
 * Everything lives in this browser's localStorage, so accounts are local to
 * this device/browser (no server). Passwords are salted + hashed, never stored
 * in plain text, but this is NOT a substitute for real server-side auth.
 *
 * Public API:  Store.Accounts, Store.Session, Store.Characters
 */
const Store = (() => {
  const MAX_SLOTS = 3;
  const KEYS = {
    accounts: 'aldenmoor:accounts',
    session: 'aldenmoor:session',
    active: 'aldenmoor:active-character',
    guilds: 'aldenmoor:guilds',
    chars: (user) => `aldenmoor:characters:${user}`,
  };

  /* ---------- low-level helpers ---------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
  const fail = (error) => ({ ok: false, error });
  const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  const randomHex = (n) => {
    const a = new Uint8Array(n);
    (
      window.crypto || { getRandomValues: (x) => x.forEach((_, i) => (x[i] = Math.random() * 256)) }
    ).getRandomValues(a);
    return hex(a);
  };
  const uid = () => Date.now().toString(36) + randomHex(3);

  /* ---------- password hashing ---------- */
  const hasSubtle = () => !!(window.crypto && crypto.subtle);

  // Fallback (cyrb53) for browsers without SubtleCrypto, e.g. plain-http pages.
  function weakHash(str) {
    let h1 = 0xdeadbeef,
      h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
  async function hashPassword(password, salt, algo) {
    const input = `${salt}:${password}`;
    if (algo === 'sha256') {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return hex(new Uint8Array(digest));
    }
    return weakHash(input);
  }

  /* ---------- accounts ---------- */
  const Accounts = {
    async register(username, password) {
      const name = String(username).trim();
      if (!/^[A-Za-z0-9_]{3,16}$/.test(name))
        return fail('Username must be 3-16 letters, numbers or underscores.');
      if (String(password).length < 6) return fail('Password must be at least 6 characters.');
      const accounts = read(KEYS.accounts, {});
      const id = name.toLowerCase();
      if (accounts[id]) return fail('That username is already taken.');
      const salt = randomHex(16);
      const algo = hasSubtle() ? 'sha256' : 'weak';
      accounts[id] = {
        username: name,
        salt,
        algo,
        hash: await hashPassword(password, salt, algo),
        createdAt: Date.now(),
      };
      if (!write(KEYS.accounts, accounts))
        return fail('Could not save your account: browser storage is unavailable.');
      Session.start(id);
      return { ok: true, user: id };
    },

    async login(username, password) {
      const id = String(username).trim().toLowerCase();
      const acc = read(KEYS.accounts, {})[id];
      const wrong = fail('Wrong username or password.');
      if (!acc) return wrong;
      if (acc.algo === 'sha256' && !hasSubtle())
        return fail('This browser cannot verify your password here. Open the game over https or localhost.');
      const hash = await hashPassword(password, acc.salt, acc.algo);
      if (hash !== acc.hash) return wrong;
      Session.start(id);
      return { ok: true, user: id };
    },
  };

  /* ---------- session ---------- */
  const Session = {
    getUser() {
      const id = read(KEYS.session, null);
      return id && read(KEYS.accounts, {})[id] ? id : null;
    },
    getDisplayName() {
      const id = Session.getUser();
      return id ? read(KEYS.accounts, {})[id].username : '';
    },
    start(id) {
      write(KEYS.session, id);
    },
    logout() {
      remove(KEYS.session);
      Session.clearActive();
    },
    // The active character is per-tab, so two tabs cannot overwrite each other.
    setActive(charId) {
      try {
        sessionStorage.setItem(KEYS.active, charId);
      } catch (e) {}
    },
    getActive() {
      try {
        return sessionStorage.getItem(KEYS.active);
      } catch (e) {
        return null;
      }
    },
    clearActive() {
      try {
        sessionStorage.removeItem(KEYS.active);
      } catch (e) {}
    },
  };

  /* ---------- characters ---------- */
  const Characters = {
    MAX_SLOTS,
    list(user) {
      const list = read(KEYS.chars(user), []);
      return Array.isArray(list) ? list : [];
    },
    get(user, id) {
      return Characters.list(user).find((c) => c.id === id) || null;
    },
    // A new character is stored minimally; the game fills in the rest on first save.
    create(user, { name, job, look }) {
      const list = Characters.list(user);
      if (list.length >= MAX_SLOTS) return fail('All character slots are in use.');
      const character = {
        id: uid(),
        name,
        job,
        look,
        lvl: 0, // new heroes start at Lv 0
        map: 'village',
        fresh: true,
        createdAt: Date.now(),
      };
      list.push(character);
      return write(KEYS.chars(user), list)
        ? { ok: true, character }
        : fail('Could not save: browser storage is unavailable.');
    },
    update(user, id, patch) {
      const list = Characters.list(user);
      const i = list.findIndex((c) => c.id === id);
      if (i < 0) return false;
      list[i] = { ...list[i], ...patch, updatedAt: Date.now() };
      return write(KEYS.chars(user), list);
    },
    remove(user, id) {
      return write(
        KEYS.chars(user),
        Characters.list(user).filter((c) => c.id !== id),
      );
    },
  };

  /* ---------- guilds ----------
   * Guilds are shared by every account in this browser (no server). A guild is
   * { id, name, master (member key), level, funds (total donated), minLv, created, members: [{k, n, lvl, job, role}] }.
   * A member key is "user:charId" for real heroes, or "npc:<name>" for the starter guilds below. */
  const SEED_GUILDS = [
    { id: 'seed-wolves', name: 'Silver Wolves', level: 4, funds: 62000, minLv: 10, m: [['Fenrir', 62, 'Knight'], ['Sable', 55, 'Assassin'], ['Wren', 48, 'Ranger'], ['Bram', 41, 'Knight'], ['Isolde', 37, 'Ranger'], ['Kip', 24, 'Archer']] },
    { id: 'seed-dawn', name: 'Dawn Vanguard', level: 2, funds: 9000, minLv: 1, m: [['Aurelia', 33, 'Swordsman'], ['Tobin', 21, 'Waif'], ['Mira', 18, 'Archer'], ['Joss', 12, 'Swordsman']] },
    { id: 'seed-moon', name: 'Moonlit Order', level: 1, funds: 1200, minLv: 1, m: [['Selene', 15, 'Waif'], ['Ash', 9, 'Archer'], ['Pip', 4, 'Swordsman']] },
  ];
  const seedGuilds = () =>
    SEED_GUILDS.map((g) => ({
      id: g.id,
      name: g.name,
      level: g.level,
      funds: g.funds,
      minLv: g.minLv,
      created: Date.now() - 864e5 * 30,
      master: 'npc:' + g.m[0][0],
      members: g.m.map(([n, lvl, job], i) => ({ k: 'npc:' + n, n, lvl, job, role: i ? 'member' : 'master' })),
    }));
  const Guilds = {
    list() {
      let l = read(KEYS.guilds, null);
      if (!Array.isArray(l)) {
        l = seedGuilds();
        write(KEYS.guilds, l);
      }
      return l;
    },
    get(id) {
      return id ? Guilds.list().find((g) => g.id === id) || null : null;
    },
    save(list) {
      return write(KEYS.guilds, list);
    },
    // Apply fn(guild) to one guild and store it. Returns the updated guild (or null).
    update(id, fn) {
      const l = Guilds.list(),
        g = l.find((x) => x.id === id);
      if (!g) return null;
      fn(g);
      return write(KEYS.guilds, l) ? g : null;
    },
    create(name, member) {
      const l = Guilds.list();
      if (l.some((g) => g.name.toLowerCase() === name.toLowerCase())) return fail('That guild name is already taken.');
      const g = { id: 'g' + uid(), name, level: 1, funds: 0, minLv: 1, created: Date.now(), master: member.k, members: [{ ...member, role: 'master' }] };
      l.push(g);
      return write(KEYS.guilds, l) ? { ok: true, guild: g } : fail('Could not save: browser storage is unavailable.');
    },
    remove(id) {
      return write(KEYS.guilds, Guilds.list().filter((g) => g.id !== id));
    },
  };

  return { Accounts, Session, Characters, Guilds };
})();
