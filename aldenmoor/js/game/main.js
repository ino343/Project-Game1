/**
 * Entry point: canvas sizing, main loop and boot.
 */
function resize() {
  const r = cv.getBoundingClientRect();
  VW = cv.width = Math.max(300, Math.round(r.width));
  VH = cv.height = Math.max(260, Math.round(r.height));
  Z = clamp((Math.min(VW, VH) / 640) * (typeof SET !== 'undefined' ? SET.zoom : 1), 0.6, 1.6);
  VWw = VW / Z;
  VHw = VH / Z;
}
addEventListener('resize', resize);
let last = performance.now(),
  fc = 0,
  infoBottom = 0,
  miniBottom = 0;
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  if (running) {
    if (!uiOpen) update(dt);
    if ((fc++ & 15) === 0) {
      infoBottom = $('#info').getBoundingClientRect().bottom;
      // Wide screens: the menu bar sits at the top right, above the map name. Narrow screens (<= 820px): it becomes
      // a full-width row under the player frame and minimap; the Damage Test panel moves down to make room.
      const narrow = innerWidth <= 820,
        stB = $('#stat').getBoundingClientRect().bottom,
        top = narrow ? Math.max(stB, miniBottom) + 8 : 10,
        root = document.documentElement.style;
      root.setProperty('--dock-top', Math.round(top) + 'px');
      root.setProperty('--dock-push', narrow ? Math.max(0, Math.round(top + $('#dock').offsetHeight - stB)) + 'px' : '0px');
    }
    render();
    updateHud();
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#16301c';
    ctx.fillRect(0, 0, VW, VH);
  }
  requestAnimationFrame(frame);
}

function boot() {
  const user = Store.Session.getUser();
  const id = Store.Session.getActive();
  const character = user && id ? Store.Characters.get(user, id) : null;
  if (!character) {
    location.replace(user ? 'characters.html' : 'login.html');
    return;
  }
  Run.user = user;
  Run.charId = id;
  resize();
  loadAudio();
  syncAudioUi();
  startGame(character);
  // Debug hook for the browser console.
  window.__game = {
    get P() {
      return P;
    },
    get M() {
      return M;
    },
    keys,
    MAPS,
    changeMap,
    useSkill,
    talk,
    gainExp,
    alloc,
    Mu,
    musicSync,
  };
  requestAnimationFrame(frame);
}
boot();
