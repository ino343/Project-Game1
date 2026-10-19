/**
 * Crafting / selling materials dropped by monsters. Every leveling map has its own set (7 each):
 *   3 common materials (one per regular mob), then an uncommon, rare and epic one that any mob on the
 *   map can drop, and a legendary one that only the map boss drops.
 * Rarer = better quality = sells for more. Price = map base price x rarity multiplier.
 * MATS[id] = { id, n, rarity, price, map, mapName, col }
 */
const RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_NAME = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
const RARITY_COL = { common: '#b9c2cc', uncommon: '#6fe08a', rare: '#7fc0ff', epic: '#c9a0ff', legendary: '#ffc94d' };
const RARITY_MUL = { common: 1, uncommon: 3, rare: 8, epic: 25, legendary: 80 };
// drop chance per kill for regular mobs / for the boss
const DROP_CHANCE = {
  mob: { common: 0.35, uncommon: 0.09, rare: 0.03, epic: 0.006, legendary: 0 },
  boss: { common: 1, uncommon: 1, rare: 1, epic: 0.4, legendary: 0.35 },
};
const MAP_MATS = {
  meadow: {
    name: 'Sunny Meadow', base: 4,
    mob: { slime: 'Slime Goo', mushroom: 'Cap Spore', boar: 'Boar Tusk' },
    pool: ['Four-leaf Clover', 'Sunpetal', 'Dewdrop Crystal'], boss: ['kingslime', 'Royal Slime Core'],
  },
  forest: {
    name: 'Whisperwood', base: 10,
    mob: { wolf: 'Wolf Pelt', goblin: 'Goblin Ear', spider: 'Spider Silk' },
    pool: ['Mossy Bark', 'Moonleaf', 'Heartwood Shard'], boss: ['treant', 'Elder Treant Core'],
  },
  ruins: {
    name: 'Sunken Ruins', base: 22,
    mob: { skeleton: 'Bone Fragment', wraith: 'Spectral Dust', golem: 'Ruin Stone' },
    pool: ['Cracked Rune', 'Soul Shard', 'Ancient Sigil'], boss: ['lich', 'Lich Phylactery'],
  },
  swamp: {
    name: 'Murk Swamp', base: 40,
    mob: { toxslime: 'Toxic Ooze', mireGoblin: 'Bog Rag', bogspider: 'Venom Sac' },
    pool: ['Swamp Moss', 'Rot Pearl', 'Miasma Crystal'], boss: ['rotent', 'Heart of the Ent'],
  },
  desert: {
    name: 'Scorched Dunes', base: 70,
    mob: { scorpion: 'Scorpion Stinger', dunewolf: 'Dune Fur', sandgolem: 'Sandstone Chunk' },
    pool: ['Desert Glass', 'Sun Amber', "Pharaoh's Scarab"], boss: ['pharaoh', 'Golden Death Mask'],
  },
  frost: {
    name: 'Frostpeak', base: 110,
    mob: { frostwolf: 'Frost Fang', icewraith: 'Ice Essence', frostgolem: 'Permafrost Chunk' },
    pool: ['Snowflake Crystal', 'Glacier Gem', 'Frostheart Shard'], boss: ['froslich', "Lich's Frozen Crown"],
  },
  volcano: {
    name: 'Emberfall', base: 170,
    mob: { magmaslime: 'Magma Glob', lavaboar: 'Charred Hide', cinderskel: 'Cinder Bone' },
    pool: ['Ember Ash', 'Fire Opal', 'Volcanic Core'], boss: ['colossus', 'Colossus Heart'],
  },
  abyss: {
    name: 'Void Abyss', base: 260,
    mob: { voidwraith: 'Void Wisp', voidspider: 'Void Silk', abyssgolem: 'Abyssal Shard' },
    pool: ['Dark Matter', 'Nether Pearl', 'Eclipse Fragment'], boss: ['voidlord', "Voidlord's Eye"],
  },
};
for (const k in MOBS) MOBS[k].id = k;
const MATS = {};
const MAT_DROPS = {}; // mob id -> [{ id, rarity }]
const MAT_ORDER = []; // all material ids in map / rarity order
for (const mapId in MAP_MATS) {
  const D = MAP_MATS[mapId];
  const add = (key, n, rarity) => {
    const id = mapId + '_' + key;
    MATS[id] = { id, n, rarity, price: Math.round(D.base * RARITY_MUL[rarity]), map: mapId, mapName: D.name, col: RARITY_COL[rarity] };
    MAT_ORDER.push(id);
    return id;
  };
  const common = {};
  for (const mob in D.mob) common[mob] = add(mob, D.mob[mob], 'common');
  const pool = ['uncommon', 'rare', 'epic'].map((r, i) => ({ id: add(r, D.pool[i], r), rarity: r }));
  const legend = { id: add('legendary', D.boss[1], 'legendary'), rarity: 'legendary' };
  for (const mob in D.mob) MAT_DROPS[mob] = [{ id: common[mob], rarity: 'common' }, ...pool];
  MAT_DROPS[D.boss[0]] = [...Object.values(common).map((id) => ({ id, rarity: 'common' })), ...pool, legend];
}
const matSellPrice = (id) => MATS[id].price;
// Roll the materials a monster drops. Returns [{ id, qty }].
function rollMats(mobId, isBoss) {
  const out = [];
  const ch = isBoss ? DROP_CHANCE.boss : DROP_CHANCE.mob;
  const seenCommon = {};
  for (const d of MAT_DROPS[mobId] || []) {
    if (Math.random() >= ch[d.rarity]) continue;
    // a boss only drops one stack of its common materials, not all three at full quantity
    const qty = d.rarity === 'common' ? (isBoss ? 1 + Math.floor(Math.random() * 3) : 1 + (Math.random() < 0.25 ? 1 : 0)) : 1;
    out.push({ id: d.id, qty });
  }
  return out;
}
