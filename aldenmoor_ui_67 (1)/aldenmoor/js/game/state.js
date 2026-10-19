/**
 * Canvas handle and the mutable runtime state shared across the game.
 */
const cv = $('#cv'),
  ctx = cv.getContext('2d');
let VW = 800,
  VH = 600,
  Z = 1,
  VWw = 800,
  VHw = 600;
let M = null,
  running = false,
  P = null,
  fx = [],
  floats = [],
  projs = [],
  zones = [],
  clicks = [];
const cam = { x: 0, y: 0 };
const mouse = { x: 0, y: 0, wx: 0, wy: 0, touch: false };
const keys = {};
let uiOpen = false,
  holdAtk = false,
  portalCd = 0,
  saveT = 0,
  time = 0,
  transition = false;
