/**
 * Input: mouse/touch, keyboard and HUD button wiring.
 */
function pointerPos(e) {
  const r = cv.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
  mouse.wx = cam.x + mouse.x / Z;
  mouse.wy = cam.y + mouse.y / Z;
}
cv.addEventListener('contextmenu', (e) => e.preventDefault());
cv.addEventListener('pointermove', (e) => {
  mouse.touch = e.pointerType === 'touch';
  pointerPos(e);
});
cv.addEventListener('pointerdown', (e) => {
  if (!running || uiOpen || transition) return;
  mouse.touch = e.pointerType === 'touch';
  pointerPos(e);
  if (e.button === 2) return; // attacking is Space only (or the on-screen Attack button on touch devices)
  const w = { x: mouse.wx, y: mouse.wy };
  // NPC
  for (const n of M.npcs) {
    if (Math.hypot(n.x - w.x, n.y - 30 - w.y) < 34 || Math.hypot(n.x - w.x, n.y - w.y) < 26) {
      if (dist(P, n) < 110) talk(n);
      else {
        P.dest = { x: n.x, y: n.y + 40 };
        P.target = null;
        log('Move closer to talk to ' + n.n + '.', '#cfd8de');
      }
      return;
    }
  }
  // mob
  let best = null,
    bd = 1e9;
  for (const m of M.mobs) {
    if (m.dead) continue;
    const d = Math.hypot(m.x - w.x, m.y - 12 - w.y);
    if (d < m.r + 16 && d < bd) {
      bd = d;
      best = m;
    }
  }
  if (best) {
    // clicking an enemy only selects it: its name / level / HP label shows, nothing attacks until Space is pressed
    P.sit = false;
    P.target = best;
    P.dest = null;
    return;
  }
  P.sit = false;
  P.auto = false; // clicking the ground cancels auto attack
  P.target = null;
  P.dest = { x: w.x, y: w.y };
  clicks.push({ x: w.x, y: w.y, t: 0 });
});
addEventListener('keydown', (e) => {
  if (!running || chatOpen) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') {
    closeDlg();
    return;
  }
  if (uiOpen) {
    return;
  }
  if (k === 'enter' || k === '/') {
    e.preventDefault();
    openChat(k === '/' ? '/' : '');
    return;
  }
  keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k === ' ') {
    toggleAutoAttack(); // one tap: walk to the enemy and keep attacking
    return;
  }
  // Hotbar keys: 1-9 and Q R T Y U fire whatever skill / potion the player put in that slot (W E I O keep their game functions)
  const hk = HB_KEYS.indexOf(k.toUpperCase());
  if (k.length === 1 && hk >= 0 && !HB_RESERVED.includes(k)) hotbarUse(hk);
  else if (k === 'e') {
    const n = M.npcs.find((n) => dist(P, n) < 110);
    if (n) talk(n);
    else log('No one nearby to talk to.', '#cfd8de');
  } else if (k === 'x') toggleSit();
  else if (k === 'c') charPanel();
  else if (k === 'g') gearWindow();
  else if (k === 'i') itemsWindow();
  else if (k === 'o') settingsWindow();
  else if (k === 'n') mapWindow();
  else if (k === 'f') friendsWindow();
  else if (k === 'm') {
    musicOn = !musicOn;
    saveAudio();
    syncAudioUi();
    musicSync();
  }
});
addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});
addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  holdAtk = false;
  if (typeof P !== 'undefined' && P) P.auto = false;
});
$('#bChar').onclick = () => (uiOpen ? closeDlg() : charPanel());
$('#bGear').onclick = () => (uiOpen ? closeDlg() : gearWindow());
$('#bItems').onclick = () => (uiOpen ? closeDlg() : itemsWindow());
$('#warp').onclick = () => (uiOpen ? closeDlg() : warpDialog());
$('#bSet').onclick = () => (uiOpen ? closeDlg() : settingsWindow());
$('#bMap').onclick = () => (uiOpen ? closeDlg() : mapWindow());
$('#bFriends').onclick = () => (uiOpen ? closeDlg() : friendsWindow());
function syncAudioUi() {
  for (const [id, on, name] of [
    ['#bSnd', !muted, 'Sound effects'],
    ['#bMus', musicOn, 'Music (M)'],
  ]) {
    const b = $(id);
    if (!b) continue; // the top toolbar was moved into Settings
    b.classList.toggle('off', !on);
    b.setAttribute('aria-pressed', String(on));
    b.title = name + ': ' + (on ? 'on' : 'off');
  }
}
dlg.addEventListener('pointerdown', (e) => {
  if (e.target === dlg) closeDlg();
});


// Browsers keep audio suspended until the first user gesture.
const unlockAudio = () => {
  try {
    getAC();
    musicSync();
  } catch (e) {}
};
addEventListener('pointerdown', unlockAudio, { once: true });
addEventListener('keydown', unlockAudio, { once: true });

// Touch devices have no Space key: a hold-to-attack button (hidden on mouse + keyboard devices, see classic.css)
{
  const ab = document.createElement('button');
  ab.type = 'button';
  ab.id = 'atkBtn';
  ab.textContent = 'Attack';
  ab.setAttribute('aria-label', 'Auto attack (tap)');
  ab.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (running && !uiOpen && !transition) toggleAutoAttack();
  });
  ab.addEventListener('contextmenu', (e) => e.preventDefault());
  document.body.appendChild(ab);
}
