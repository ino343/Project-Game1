/**
 * Static map definitions (MAPDEF) and village NPCs.
 */
const MAPDEF = {
  village: {
    name: 'Aldenmoor Village',
    sub: 'Safe zone',
    w: 2200,
    h: 1500,
    theme: 'town',
    safe: 1,
    seed: 11,
    spawn: { x: 1100, y: 1090 },
    // buildings (with their door portals) and roads are added in world.js from BUILDINGS
    portals: [{ x: 2150, y: 800, to: 'meadow', tx: 170, ty: 750, label: 'Sunny Meadow (Lv 1-8)' }],
  },
  meadow: {
    name: 'Sunny Meadow',
    sub: 'Recommended Lv 1-8',
    w: 2400,
    h: 1500,
    theme: 'grass',
    seed: 21,
    trees: 50,
    portals: [
      { x: 50, y: 750, to: 'village', tx: 2040, ty: 800, label: 'Aldenmoor Village' },
      { x: 2350, y: 750, to: 'forest', tx: 170, ty: 800, label: 'Whisperwood (Lv 7-15)' },
    ],
    spawns: [
      ['slime', 14, 0.06, 0.5],
      ['mushroom', 10, 0.3, 0.72],
      ['boar', 8, 0.55, 0.95],
      ['kingslime', 1, 0, 0, { x: 2000, y: 330 }],
    ],
  },
  // Whisperwood: enter from the west, exit south
  forest: {
    name: 'Whisperwood',
    sub: 'Recommended Lv 7-15',
    w: 2600,
    h: 1600,
    theme: 'forest',
    seed: 31,
    trees: 130,
    portals: [
      { x: 50, y: 800, to: 'meadow', tx: 2250, ty: 750, label: 'Sunny Meadow' },
      { x: 1300, y: 1550, to: 'ruins', tx: 1300, ty: 170, label: 'Sunken Ruins (Lv 14-25)' },
    ],
    spawns: [
      ['wolf', 12, 0.06, 0.45],
      ['goblin', 12, 0.3, 0.7],
      ['spider', 9, 0.55, 0.95],
      ['treant', 1, 0, 0, { x: 2200, y: 300 }],
    ],
  },
  // Sunken Ruins: enter from the north, exit west
  ruins: {
    name: 'Sunken Ruins',
    sub: 'Recommended Lv 14-25',
    w: 2600,
    h: 1600,
    theme: 'ruins',
    seed: 41,
    trees: 70,
    portals: [
      { x: 1300, y: 50, to: 'forest', tx: 1300, ty: 1430, label: 'Whisperwood' },
      { x: 50, y: 800, to: 'swamp', tx: 2630, ty: 850, label: 'Murk Swamp (Lv 24-35)' },
    ],
    spawns: [
      ['skeleton', 14, 0.15, 0.5, null, 'y'],
      ['wraith', 10, 0.4, 0.75, null, 'y'],
      ['golem', 7, 0.65, 0.95, null, 'y'],
      ['lich', 1, 0, 0, { x: 2250, y: 1300 }],
    ],
  },
  // Murk Swamp: enter from the east, exit south
  swamp: {
    name: 'Murk Swamp',
    sub: 'Recommended Lv 24-35',
    w: 2800,
    h: 1700,
    theme: 'swamp',
    seed: 51,
    trees: 120,
    portals: [
      { x: 2750, y: 850, to: 'ruins', tx: 170, ty: 800, label: 'Sunken Ruins' },
      { x: 1400, y: 1650, to: 'desert', tx: 1400, ty: 170, label: 'Scorched Dunes (Lv 34-45)' },
    ],
    spawns: [
      ['toxslime', 15, 0.55, 0.95],
      ['mireGoblin', 12, 0.3, 0.65],
      ['bogspider', 10, 0.06, 0.4],
      ['rotent', 1, 0, 0, { x: 450, y: 350 }],
    ],
  },
  // Scorched Dunes: enter from the north, exit east
  desert: {
    name: 'Scorched Dunes',
    sub: 'Recommended Lv 34-45',
    w: 2800,
    h: 1700,
    theme: 'desert',
    seed: 61,
    trees: 90,
    portals: [
      { x: 1400, y: 50, to: 'swamp', tx: 1400, ty: 1530, label: 'Murk Swamp' },
      { x: 2750, y: 850, to: 'frost', tx: 170, ty: 850, label: 'Frostpeak (Lv 44-55)' },
    ],
    spawns: [
      ['scorpion', 14, 0.15, 0.5, null, 'y'],
      ['dunewolf', 12, 0.4, 0.75, null, 'y'],
      ['sandgolem', 8, 0.65, 0.95, null, 'y'],
      ['pharaoh', 1, 0, 0, { x: 450, y: 1400 }],
    ],
  },
  // Frostpeak: enter from the west, exit east
  frost: {
    name: 'Frostpeak',
    sub: 'Recommended Lv 44-55',
    w: 2800,
    h: 1700,
    theme: 'frozen',
    seed: 71,
    trees: 100,
    portals: [
      { x: 50, y: 850, to: 'desert', tx: 2630, ty: 850, label: 'Scorched Dunes' },
      { x: 2750, y: 850, to: 'volcano', tx: 170, ty: 850, label: 'Emberfall (Lv 54-63)' },
    ],
    spawns: [
      ['frostwolf', 14, 0.06, 0.45],
      ['icewraith', 12, 0.3, 0.7],
      ['frostgolem', 8, 0.55, 0.95],
      ['froslich', 1, 0, 0, { x: 2350, y: 330 }],
    ],
  },
  // Emberfall: enter from the west, exit north
  volcano: {
    name: 'Emberfall',
    sub: 'Recommended Lv 54-63',
    w: 2800,
    h: 1700,
    theme: 'volcano',
    seed: 81,
    trees: 100,
    portals: [
      { x: 50, y: 850, to: 'frost', tx: 2630, ty: 850, label: 'Frostpeak' },
      { x: 1400, y: 50, to: 'abyss', tx: 1500, ty: 1630, label: 'Void Abyss (Lv 62-70)' },
    ],
    spawns: [
      ['magmaslime', 14, 0.06, 0.45],
      ['lavaboar', 12, 0.3, 0.7],
      ['cinderskel', 9, 0.55, 0.95],
      ['colossus', 1, 0, 0, { x: 2350, y: 1300 }],
    ],
  },
  // Void Abyss: enter from the south (bottom), strongest mobs at the top
  abyss: {
    name: 'Void Abyss',
    sub: 'Recommended Lv 62-70',
    w: 3000,
    h: 1800,
    theme: 'abyss',
    seed: 91,
    trees: 110,
    portals: [{ x: 1500, y: 1750, to: 'volcano', tx: 1400, ty: 170, label: 'Emberfall' }],
    spawns: [
      ['voidwraith', 15, 0.62, 0.9, null, 'y'],
      ['voidspider', 12, 0.38, 0.68, null, 'y'],
      ['abyssgolem', 9, 0.1, 0.42, null, 'y'],
      ['voidlord', 1, 0, 0, { x: 1500, y: 300 }],
    ],
  },
};

/* ------------------------------------------------------------------------------------------------
 * VILLAGE BUILDINGS
 * Every building has a glowing door (a portal) that leads to its own interior map `in_<id>`.
 * x,y,w,h = footprint of the front wall (the door sits at the bottom centre). The NPCs live inside.
 * To add a building: add a row here, an INTERIORS entry below, and NPCS with map:'in_<id>'.
 * ---------------------------------------------------------------------------------------------- */
const BUILDINGS = [
  // north avenue (style: 'gable' = steep tiled gable, 'hip' = wide hip roof, 'thatch' = thatched cottage; mat: 'stone' = stone walls, else timber frame)
  { id: 'academy', n: "Adventurer's Academy", x: 330, y: 270, w: 250, h: 150, wall: '#e8dfc8', roof: '#3f5aa8', accent: '#7a5cff', icon: 'scroll', style: 'hip' },
  { id: 'potion', n: 'Alchemy & Potions', x: 650, y: 300, w: 190, h: 120, wall: '#e0e6c8', roof: '#4c8a55', accent: '#2fbf94', icon: 'potion', style: 'gable' },
  { id: 'guild', n: 'Guild Hall', x: 930, y: 220, w: 340, h: 200, wall: '#e6d8bc', roof: '#962f2a', accent: '#e0553f', icon: 'shield', style: 'gable' },
  { id: 'trader', n: 'Material Exchange', x: 1370, y: 300, w: 190, h: 120, wall: '#e8d8b2', roof: '#c4a050', accent: '#d99a3a', icon: 'crate', style: 'thatch' },
  { id: 'quest', n: 'Quest Hall', x: 1620, y: 270, w: 250, h: 150, wall: '#ded5c2', roof: '#4a5878', accent: '#f2b84b', icon: 'board', style: 'hip' },
  // west / east of the plaza
  { id: 'armory', n: 'Armory Hall', x: 240, y: 600, w: 300, h: 160, wall: '#b9b4aa', roof: '#4b4f58', accent: '#e0604d', icon: 'sword', style: 'hip', mat: 'stone' },
  { id: 'sage', n: "Sage's Tower", x: 660, y: 610, w: 170, h: 130, wall: '#c9c1d8', roof: '#6b46b8', accent: '#b07aff', icon: 'orb', style: 'gable', mat: 'stone' },
  { id: 'pets', n: 'Pet Emporium', x: 1370, y: 610, w: 190, h: 130, wall: '#f0dcc8', roof: '#c8a45a', accent: '#ff7aa8', icon: 'paw', style: 'thatch' },
  // south avenue
  { id: 'fashion', n: 'Fashion Street', x: 330, y: 1010, w: 290, h: 140, wall: '#efd9d2', roof: '#9a4a6a', accent: '#ff8bd0', icon: 'hanger', style: 'hip' },
  { id: 'bank', n: 'Aldenmoor Bank', x: 800, y: 1030, w: 200, h: 120, wall: '#bfc3b6', roof: '#35564a', accent: '#f2c14b', icon: 'coin', style: 'hip', mat: 'stone' },
  { id: 'warp', n: 'Waystation', x: 1200, y: 1030, w: 200, h: 120, wall: '#c3c9d6', roof: '#2b4b7a', accent: '#4fc3ff', icon: 'ring', style: 'hip', mat: 'stone' },
];
// main roads of the village: [from, to] segments (door stubs are added from BUILDINGS in world.js)
const VILLAGE_MAIN_ROADS = [
  [[140, 800], [2160, 800]], // east-west main road (to the east gate)
  [[330, 470], [1900, 470]], // north avenue
  [[1100, 470], [1100, 1200]], // spine from the Guild Hall to the south
  [[360, 1200], [1540, 1200]], // south avenue (leads into the training yard)
];
const VILLAGE_PLAZA = { x: 1100, y: 800, rx: 250, ry: 185 };
const VILLAGE_YARD = { x: 1560, y: 1000, w: 400, h: 260 }; // training dummies

/* ------------------------------------------------------------------------------------------------
 * INTERIORS  (map id = 'in_' + building id)
 * w,h = room size; the back wall takes the top 118px. floor = [plank/tile colours], wall = wall colour,
 * rugs: {k:'r',x,y,w,h,col} | {k:'c',x,y,r,col}; banners: [[x, colour]]; furn = collidable furniture
 * (rects use x,y = top-left; circles use x,y = centre / feet).
 * ---------------------------------------------------------------------------------------------- */
const FU = {
  counter: (x, y, w, col) => ({ x, y, w, h: 46, type: 'furn', kind: 'counter', col: col || '#8a5a34' }),
  shelf: (x, w, sk) => ({ x, y: 40, w, h: 78, type: 'furn', kind: 'shelf', sk }),
  table: (x, y, w = 130, h = 56, sk) => ({ x, y, w, h, type: 'furn', kind: 'table', sk }),
  bench: (x, y, w = 190) => ({ x, y, w, h: 34, type: 'furn', kind: 'bench' }),
  altar: (x, y, w = 170) => ({ x, y, w, h: 52, type: 'furn', kind: 'altar' }),
  plant: (x, y) => ({ x, y, r: 14, type: 'furn', kind: 'plant' }),
  crate: (x, y) => ({ x, y, r: 17, type: 'furn', kind: 'crate' }),
  barrel: (x, y) => ({ x, y, r: 15, type: 'furn', kind: 'barrel' }),
  doll: (x, y, col) => ({ x, y, r: 13, type: 'furn', kind: 'doll', col }),
  crystal: (x, y, col) => ({ x, y, r: 14, type: 'furn', kind: 'crystal', col }),
  cage: (x, y) => ({ x, y, r: 16, type: 'furn', kind: 'cage' }),
  globe: (x, y) => ({ x, y, r: 15, type: 'furn', kind: 'globe' }),
};
const INTERIORS = {
  academy: {
    w: 780, h: 540, floor: ['#b98b5e', '#ad7f53'], wall: '#d9d2c4', trim: '#5b4632', banners: [[130, '#4a5ab8'], [650, '#4a5ab8']],
    rugs: [{ k: 'r', x: 230, y: 320, w: 320, h: 170, col: '#3b4a8f' }],
    furn: [FU.shelf(40, 170, 'book'), FU.shelf(570, 170, 'book'), FU.table(300, 262, 180, 50), FU.plant(50, 470), FU.plant(730, 470), FU.globe(150, 300)],
  },
  guild: {
    w: 900, h: 600, floor: ['#a9784a', '#9d6d41'], wall: '#d8cbb8', trim: '#4a3322', banners: [[110, '#e0553f'], [330, '#e0553f'], [570, '#e0553f'], [790, '#e0553f']],
    rugs: [{ k: 'r', x: 290, y: 330, w: 320, h: 230, col: '#7a2a2a' }],
    furn: [FU.shelf(60, 170, 'trophy'), FU.shelf(670, 170, 'trophy'), FU.counter(350, 262, 200, '#6b3f26'), FU.table(100, 400, 190, 58), FU.table(610, 400, 190, 58), FU.plant(50, 550), FU.plant(850, 550), FU.barrel(790, 300), FU.barrel(112, 300)],
  },
  potion: {
    w: 760, h: 520, floor: ['#9fb8a6', '#93ae9b'], wall: '#d6e6dc', trim: '#2f6f58', banners: [],
    rugs: [{ k: 'r', x: 250, y: 330, w: 260, h: 140, col: '#2f9d7f' }],
    furn: [FU.shelf(40, 180, 'potion'), FU.shelf(290, 180, 'potion'), FU.shelf(540, 180, 'potion'), FU.counter(290, 262, 180, '#2f7a63'), FU.crate(80, 440), FU.crate(112, 462), FU.barrel(690, 450), FU.plant(700, 300)],
  },
  trader: {
    w: 760, h: 520, floor: ['#a8875b', '#9c7b50'], wall: '#e0d3bb', trim: '#6b4a24', banners: [],
    rugs: [{ k: 'r', x: 270, y: 330, w: 220, h: 130, col: '#8a5a2a' }],
    furn: [FU.shelf(40, 160, 'crate'), FU.shelf(560, 160, 'crate'), FU.counter(285, 262, 190, '#7a5428'), FU.crate(80, 400), FU.crate(116, 420), FU.crate(80, 450), FU.barrel(680, 400), FU.barrel(712, 430), FU.table(560, 330, 120, 50)],
  },
  quest: {
    w: 820, h: 560, floor: ['#9a8a74', '#8f7f6a'], wall: '#d2cfdc', trim: '#3d4d6e', banners: [[90, '#f2b84b'], [730, '#f2b84b']],
    rugs: [{ k: 'r', x: 300, y: 340, w: 220, h: 150, col: '#3d4d6e' }],
    furn: [FU.shelf(270, 280, 'board'), FU.counter(320, 262, 180, '#4a3a2a'), FU.table(110, 330, 190, 90, 'map'), FU.barrel(720, 300), FU.plant(60, 500), FU.plant(760, 500), FU.bench(560, 420, 170)],
  },
  armory: {
    w: 980, h: 580, floor: ['#8a8f98', '#7f848d'], wall: '#cfd4da', trim: '#3a424d', banners: [[70, '#e0604d'], [910, '#e0604d']], tile: 1,
    rugs: [{ k: 'r', x: 150, y: 330, w: 680, h: 90, col: '#4b5563' }],
    furn: [FU.shelf(140, 190, 'weapon'), FU.shelf(400, 190, 'armor'), FU.shelf(660, 190, 'bow'), FU.counter(140, 262, 190, '#4b5563'), FU.counter(400, 262, 190, '#4b5563'), FU.counter(660, 262, 190, '#4b5563'), FU.doll(70, 470, '#8a8f98'), FU.doll(910, 470, '#8a8f98'), FU.crate(130, 520), FU.barrel(860, 520)],
  },
  sage: {
    w: 700, h: 520, floor: ['#5d4a85', '#54427a'], wall: '#cfc5e6', trim: '#3c2a6b', banners: [],
    rugs: [{ k: 'c', x: 350, y: 380, r: 90, col: '#b07aff' }],
    furn: [FU.shelf(30, 190, 'book'), FU.shelf(480, 190, 'book'), FU.table(260, 262, 180, 46), FU.globe(100, 300), FU.crystal(610, 300, '#b07aff'), FU.plant(50, 470), FU.plant(650, 470)],
  },
  pets: {
    w: 780, h: 520, floor: ['#e8c9d3', '#e0bfca'], wall: '#f5dde6', trim: '#b4446f', banners: [], tile: 1,
    rugs: [{ k: 'r', x: 250, y: 330, w: 280, h: 150, col: '#ff7aa8' }],
    furn: [FU.shelf(40, 170, 'cage'), FU.shelf(570, 170, 'cage'), FU.counter(290, 262, 200, '#c0507c'), FU.cage(90, 420), FU.cage(130, 440), FU.cage(690, 420), FU.cage(650, 440), FU.plant(60, 300), FU.plant(720, 300)],
  },
  fashion: {
    w: 940, h: 560, floor: ['#d9b6cc', '#cfa9c1'], wall: '#f1dcec', trim: '#8f3d82', banners: [[470, '#ff8bd0']], tile: 1,
    rugs: [{ k: 'r', x: 130, y: 320, w: 680, h: 150, col: '#a44a94' }],
    furn: [FU.shelf(40, 160, 'cloth'), FU.shelf(360, 220, 'cloth'), FU.shelf(740, 160, 'cloth'), FU.counter(160, 262, 190, '#8f3d82'), FU.counter(590, 262, 190, '#8f3d82'), FU.doll(470, 330, '#ff8bd0'), FU.doll(420, 450, '#9ad0ff'), FU.doll(520, 450, '#ffd96a'), FU.plant(60, 500), FU.plant(880, 500)],
  },
  bank: {
    w: 720, h: 520, floor: ['#9db0a4', '#92a699'], wall: '#d5e0d8', trim: '#35564a', banners: [], tile: 1,
    rugs: [{ k: 'r', x: 250, y: 330, w: 220, h: 130, col: '#35564a' }],
    furn: [FU.shelf(60, 170, 'vault'), FU.shelf(490, 170, 'vault'), FU.counter(260, 262, 200, '#2f4a40'), FU.crate(90, 400), FU.crate(122, 420), FU.plant(640, 440), FU.plant(80, 300)],
  },
  warp: {
    w: 740, h: 520, floor: ['#3d4f6e', '#364764'], wall: '#c9d6ea', trim: '#243a5e', banners: [], tile: 1,
    rugs: [{ k: 'c', x: 370, y: 370, r: 110, col: '#4fc3ff' }],
    furn: [FU.table(285, 262, 170, 46), FU.crystal(80, 300, '#4fc3ff'), FU.crystal(660, 300, '#4fc3ff'), FU.crystal(110, 440, '#4fc3ff'), FU.crystal(630, 440, '#4fc3ff'), FU.plant(50, 500), FU.plant(690, 500)],
  },
};
// derive the interior map definitions + village door portals data (portals are added in world.js)
for (const b of BUILDINGS) {
  const I = INTERIORS[b.id];
  MAPDEF['in_' + b.id] = {
    name: b.n,
    sub: 'Aldenmoor Village',
    w: I.w,
    h: I.h,
    theme: 'interior',
    interior: I,
    building: b,
    safe: 1,
    seed: b.x,
    music: 'village',
    spawn: { x: I.w / 2, y: I.h - 110 },
    portals: [{ x: I.w / 2, y: I.h - 22, to: 'village', tx: b.x + b.w / 2, ty: b.y + b.h + 74, door: 1, exit: 1, label: 'Exit to village' }],
  };
}

/* ------------------------------------------------------------------------------------------------
 * NPCS  (map = the map they stand in; interiors are 'in_<building id>')
 * ---------------------------------------------------------------------------------------------- */
const NPCS = [
  { id: 'guide', map: 'village', n: 'Lumi', title: 'Town Guide', x: 1040, y: 1090, col: '#4fb0ff', hair: '#2a2a3a' },
  { id: 'job', map: 'in_academy', n: 'Master Kael', title: 'Job Master', x: 390, y: 232, col: '#7a5cff', hair: '#ddd' },
  { id: 'shop', map: 'in_potion', n: 'Mina', title: 'Potion Seller', x: 380, y: 232, col: '#3fae8f', hair: '#c0432a' },
  // Equipment merchants: one per class family (weapons, armors, headgears)
  { id: 'gear', map: 'in_armory', fam: 'swordsman', n: 'Garon', title: 'Swordsman Armory', x: 235, y: 232, col: '#8a6a4a', hair: '#222' },
  { id: 'gear', map: 'in_armory', fam: 'waif', n: 'Veyra', title: 'Waif Outfitter', x: 495, y: 232, col: '#5b3f8f', hair: '#14102a' },
  { id: 'gear', map: 'in_armory', fam: 'archer', n: 'Sylas', title: 'Archer Outfitter', x: 755, y: 232, col: '#3f7a4a', hair: '#8a5a2a' },
  { id: 'pets', map: 'in_pets', n: 'Pippa', title: 'Pet Dealer', x: 390, y: 232, col: '#e07aa8', hair: '#f0c46a' },
  // Costume shops (cosmetic gear only, no stats): see data/costumes.js. `cos` = what the shopkeeper wears.
  { id: 'costume', map: 'in_fashion', shop: 'boutique', n: 'Luna', title: 'Moonlight Boutique', x: 255, y: 232, col: '#e88bd0', hair: '#f4e1ff', cos: { chead: 'cos_chead_bunny', cbody: 'cos_cbody_yukata' } },
  { id: 'costume', map: 'in_fashion', shop: 'corner', n: 'Rowan', title: 'Costume Corner', x: 685, y: 232, col: '#3b8f9a', hair: '#5a3418', cos: { chead: 'cos_chead_pirate', cback: 'cos_cback_cape' } },
  { id: 'heal', map: 'village', n: 'Sister Lia', title: 'Fountain Healer', x: 1100, y: 872, col: '#f0f0f5', hair: '#e8c46a' },
  // new service NPCs (logic in js/game/npcs.js)
  { id: 'guild', map: 'in_guild', n: 'Brenna', title: 'Guildmaster', x: 450, y: 232, col: '#c0392b', hair: '#e8d090' },
  { id: 'quest', map: 'in_quest', n: 'Captain Roderic', title: 'Quest Master', x: 410, y: 232, col: '#3d5a8f', hair: '#6a4a2a' },
  { id: 'bank', map: 'in_bank', n: 'Odette', title: 'Banker', x: 360, y: 232, col: '#2f6a5a', hair: '#1c1c28' },
  { id: 'trader', map: 'in_trader', n: 'Brokk', title: 'Material Trader', x: 380, y: 232, col: '#b8803a', hair: '#7a3a1a' },
  { id: 'warp', map: 'in_warp', n: 'Zephyr', title: 'Warp Master', x: 370, y: 232, col: '#3f9ad8', hair: '#cfe8ff' },
  { id: 'sage', map: 'in_sage', n: 'Sage Orin', title: 'Attribute Sage', x: 350, y: 232, col: '#8a5ad8', hair: '#f0f0f0' },
];
