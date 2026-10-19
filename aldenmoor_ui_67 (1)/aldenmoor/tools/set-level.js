/**
 * Dev helper: set one of your Archer / Ranger characters to a level (default 100).
 * Saves live in this browser's localStorage, so run this in the DevTools console
 * on the Aldenmoor page (characters.html), then reload the page.
 *
 * If you have several archers, set NAME to the hero's name.
 */
(() => {
  const LEVEL = 100; // Archer is a 1st job (cap 50); Ranger (2nd job) can reach 100
  const NAME = ''; // e.g. 'Legolas'; leave empty if you only have one archer
  const AP_PER_LV = 3; // keep in sync with js/data/config.js

  const hits = [];
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('aldenmoor:characters:')) continue;
    let list;
    try {
      list = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      continue;
    }
    if (!Array.isArray(list)) continue;
    for (const c of list) {
      const isArcher = c.job === 'archer' || c.job === 'ranger';
      if (isArcher && (!NAME || String(c.name).toLowerCase() === NAME.toLowerCase()))
        hits.push({ key, list, c });
    }
  }
  if (hits.length !== 1) {
    console.warn(
      `Found ${hits.length} matching archers: ` +
        hits.map((h) => h.c.name).join(', ') +
        '. Set NAME and run again.',
    );
    return;
  }
  const { key, list, c } = hits[0];
  const attr = { str: 0, dex: 0, spd: 0, luk: 0, dod: 0, vit: 0, ...(c.attr || {}) };
  const spent = Object.values(attr).reduce((a, b) => a + b, 0);
  Object.assign(c, {
    lvl: LEVEL,
    exp: 0,
    gold: c.gold ?? 60,
    hpP: c.hpP ?? 5,
    mpP: c.mpP ?? 5,
    wep: c.wep ?? 0,
    attr,
    ap: Math.max(0, AP_PER_LV * LEVEL - spent), // unspent points = everything earned minus what is spent
    sp: Array.isArray(c.learned)
      ? Math.max(0, LEVEL - (c.skillLv ? Object.values(c.skillLv).reduce((a, b) => a + b, 0) : c.learned.length))
      : undefined, // old saves get this worked out on load
    fresh: false,
    updatedAt: Date.now(),
  });
  localStorage.setItem(key, JSON.stringify(list));
  console.log(`${c.name} (${c.job}) is now level ${LEVEL} with ${c.ap} unspent points. Reload the page.`);
})();
