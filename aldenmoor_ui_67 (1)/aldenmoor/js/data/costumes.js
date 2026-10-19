/**
 * Costumes (cosmetic gear). They only change how your character looks: NO stats, any class, no level requirement.
 * Three cosmetic slots, separate from the stat gear (weapon / armor / headgear / necklace):
 *   chead = Costume Hat, cbody = Costume Outfit, cback = Costume Back (cape / wings)
 * A worn costume replaces the look of the matching stat gear / class outfit but never its stats.
 * They are sold only by the two costume shops in the village: Luna (Moonlight Boutique) and Rowan (Costume Corner).
 *
 * To add a costume: add a row to COSTUMES (+ an ITEM_ART icon in icons-costume.js and a `style` in avatar-costume.js).
 *   cos = { style, c1, c2, c3, pants?, shoe?, sole? }  (the colours the avatar and the icon are drawn with)
 */
const COS_SLOTS = ['chead', 'cbody', 'cback'];
SLOT_NAME.chead = 'Costume Hat';
SLOT_NAME.cbody = 'Costume Outfit';
SLOT_NAME.cback = 'Costume Back';
const COS_TAB_NAME = { chead: 'Hats', cbody: 'Outfits', cback: 'Backs' };

// [slot, key, name, tier (rarity 1-6), price, shop, description, cos look]
const COSTUMES = [
  /* ---- Moonlight Boutique (Luna): fashion ---- */
  ['chead', 'bunny', 'Bunny Ears', 1, 1500, 'boutique', 'Tall fluffy ears with a pink bow.', { style: 'bunny', c1: '#fdf6f0', c2: '#ffb0c8', c3: '#ff6fa0' }],
  ['chead', 'flower', 'Flower Crown', 2, 4000, 'boutique', 'A wreath of fresh blossoms.', { style: 'flower', c1: '#ff8fb8', c2: '#4fbf6a', c3: '#ffe27a' }],
  ['chead', 'witch', 'Starlit Witch Hat', 3, 9000, 'boutique', 'A pointed hat with a golden buckle.', { style: 'witch', c1: '#3b2a66', c2: '#8a4cd8', c3: '#ffd24a' }],
  ['cbody', 'uniform', 'School Uniform', 1, 3000, 'boutique', 'Navy blazer, red tie and a neat collar.', { style: 'uniform', c1: '#27386b', c2: '#f4f4f4', c3: '#d93a4a', pants: '#20284a' }],
  ['cbody', 'yukata', 'Summer Yukata', 3, 12000, 'boutique', 'Indigo festival robe with a pink obi sash.', { style: 'yukata', c1: '#2f4a8f', c2: '#f4e9ff', c3: '#e6558a', pants: '#26396f', shoe: '#7a5230', sole: '#4a3018' }],
  ['cbody', 'royal', 'Royal Regalia', 5, 45000, 'boutique', 'A crown prince\'s coat with fur collar and sash.', { style: 'royal', c1: '#2a2f7a', c2: '#f0c850', c3: '#f4f1ec', pants: '#14163a', shoe: '#2a1a10', sole: '#f0c850' }],
  ['cback', 'fairy', 'Fairy Wings', 3, 15000, 'boutique', 'Glassy wings that glitter as you walk.', { style: 'fairy', c1: '#9ff0ff', c2: '#ffffff', c3: '#ffe27a' }],
  ['cback', 'angel', 'Angel Wings', 4, 30000, 'boutique', 'Soft white wings and a little halo.', { style: 'angel', c1: '#ffffff', c2: '#cfd8ff', c3: '#ffe27a' }],

  /* ---- Rowan's Costume Corner: fantasy & festival ---- */
  ['chead', 'cat', 'Cat Ears', 1, 1200, 'corner', 'Tabby ears on a thin headband.', { style: 'catears', c1: '#f2a65a', c2: '#ffb6c8', c3: '#8a5a2a' }],
  ['chead', 'pirate', 'Pirate Tricorn', 2, 5000, 'corner', 'A captain\'s hat with a skull badge.', { style: 'pirate', c1: '#22222c', c2: '#f1ede0', c3: '#e8c35a' }],
  ['chead', 'jester', 'Crimson Jester Mask', 4, 20000, 'corner', 'A sleek white full-face smiling mask with red markings with swept horn blades and glowing tips.', { style: 'jester', c1: '#e0202f', c2: '#6b0a18', c3: '#f4f4f6' }],
  ['chead', 'horns', 'Dragon Horns', 4, 18000, 'corner', 'Curled horns, shed by a very friendly dragon.', { style: 'horns', c1: '#c8b89a', c2: '#f2e6c8', c3: '#e0483a' }],
  ['cbody', 'bear', 'Bear Onesie', 2, 6000, 'corner', 'Warm, fluffy and a little bit silly.', { style: 'bear', c1: '#9a6a3f', c2: '#e0c298', c3: '#6b4526', pants: '#9a6a3f', shoe: '#6b4526', sole: '#4a2e18' }],
  ['cbody', 'piratecoat', 'Captain\'s Coat', 3, 14000, 'corner', 'Burgundy coat with gold buttons and a frilly shirt.', { style: 'piratecoat', c1: '#7a1f2b', c2: '#e8c35a', c3: '#3a2412', pants: '#2a2230', shoe: '#2a1a10', sole: '#14100a' }],
  ['cbody', 'astro', 'Astronaut Suit', 4, 25000, 'corner', 'Pressurised and ready for the moon.', { style: 'astro', c1: '#eef1f5', c2: '#ff7a2a', c3: '#3a4458', pants: '#eef1f5', shoe: '#c9ced4', sole: '#3a4458' }],
  ['cback', 'cape', 'Hero Cape', 2, 5000, 'corner', 'A red cape that flutters behind you.', { style: 'cape', c1: '#d92c3a', c2: '#8f1522', c3: '#ffd24a' }],
  ['cback', 'dragonwing', 'Dragon Wings', 5, 55000, 'corner', 'Leathery crimson wings with bone spars.', { style: 'dragonwing', c1: '#7a1a2a', c2: '#3a0f18', c3: '#ff7a4a' }],
];
for (const [slot, key, n, tier, price, shop, d, cos] of COSTUMES) {
  const id = 'cos_' + slot + '_' + key;
  ITEMS[id] = { id, n, slot, fam: 'all', tier, lv: 1, col: GRADES[tier - 1].c, price, cosm: 1, shop, d, cos };
}
const costumesFor = (shop, slot) => Object.values(ITEMS).filter((i) => i.cosm && i.shop === shop && i.slot === slot).sort((a, b) => a.tier - b.tier || a.price - b.price);
const ALL_SLOTS = SLOTS.concat(COS_SLOTS);
