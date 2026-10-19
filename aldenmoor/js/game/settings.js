/**
 * Settings: everything the player can adjust in-game (menu button "Settings" / O key).
 * Sound and music on/off + volume live in sfx.js (key `aldenmoor_audio`); the rest is saved here
 * under `aldenmoor_settings`. To add an option: add a default in SET_DEFAULTS, apply it in
 * applySettings() (or read SET.<key> where it is used) and add a row in settingsWindow().
 */
const SET_DEFAULTS = {
  dmgNum: 'normal', // floating damage numbers: off | small | normal | large
  lootText: true, // floating +EXP / +gold / drop text
  zoom: 1, // camera zoom: 0.85 | 1 | 1.2
  minimap: true,
  chatLog: true,
  keyHints: true, // key letters on the hotbar
  autosave: true, // save every 15 seconds
};
const SET = Object.assign({}, SET_DEFAULTS);
(function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('aldenmoor_settings'));
    if (s && typeof s === 'object')
      for (const k in SET_DEFAULTS) if (typeof s[k] === typeof SET_DEFAULTS[k]) SET[k] = s[k];
  } catch (e) {}
  if (!['off', 'small', 'normal', 'large'].includes(SET.dmgNum)) SET.dmgNum = 'normal';
  if (![0.85, 1, 1.2].includes(SET.zoom)) SET.zoom = 1;
})();
function saveSettings() {
  try {
    localStorage.setItem('aldenmoor_settings', JSON.stringify(SET));
  } catch (e) {}
}
function applySettings() {
  document.body.classList.toggle('no-log', !SET.chatLog);
  document.body.classList.toggle('no-keys', !SET.keyHints);
  if (typeof resize === 'function' && cv) resize(); // camera zoom
}
applySettings();

/* ---------------- Settings window ---------------- */
const SET_ZOOM = [
  [0.85, 'Far'],
  [1, 'Normal'],
  [1.2, 'Close'],
];
function setRow(label, desc, ctl) {
  return (
    '<div class="set"><div class="sl"><b>' + label + '</b>' + (desc ? '<small>' + desc + '</small>' : '') + '</div><div class="sc">' + ctl + '</div></div>'
  );
}
const setSwitch = (key, on) =>
  '<button type="button" class="sw' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-sw="' + key + '"><i></i><span>' + (on ? 'On' : 'Off') + '</span></button>';
const setSeg = (key, opts, cur) =>
  '<div class="seg" role="group" data-seg="' +
  key +
  '">' +
  opts.map((o) => '<button type="button" data-v="' + o[0] + '" class="' + (String(o[0]) === String(cur) ? 'on' : '') + '">' + o[1] + '</button>').join('') +
  '</div>';
const setSlider = (key, v) =>
  '<input type="range" min="0" max="100" step="5" value="' + Math.round(v * 100) + '" data-vol="' + key + '" aria-label="' + key + ' volume" /><span class="pc">' + Math.round(v * 100) + '%</span>';

function settingsWindow() {
  sfxClick();
  const body =
    '<h4 class="sech">Sound</h4>' +
    setRow('Sound effects', 'Hits, skills, buying, menus.', setSwitch('sfx', !muted)) +
    setRow('Sound volume', '', setSlider('sfx', sfxVol)) +
    setRow('Music', 'Background music (M).', setSwitch('mus', musicOn)) +
    setRow('Music volume', '', setSlider('mus', musVol)) +
    '<h4 class="sech">Display</h4>' +
    setRow('Damage numbers', 'The numbers that pop up on every hit.', setSeg('dmgNum', [['off', 'Off'], ['small', 'Small'], ['normal', 'Normal'], ['large', 'Large']], SET.dmgNum)) +
    setRow('EXP / gold / drop text', 'Floating +EXP, +gold and item drops.', setSwitch('lootText', SET.lootText)) +
    setRow('Camera zoom', 'Far shows more of the map.', setSeg('zoom', SET_ZOOM, SET.zoom)) +
    setRow('Minimap', '', setSwitch('minimap', SET.minimap)) +
    setRow('Chat log', 'Messages at the bottom-left.', setSwitch('chatLog', SET.chatLog)) +
    setRow('Hotbar key labels', 'Small key letters on skill slots.', setSwitch('keyHints', SET.keyHints)) +
    '<h4 class="sech">Game</h4>' +
    setRow('Auto-save', 'Saves your hero every 15 seconds.', setSwitch('autosave', SET.autosave)) +
    '<h4 class="sech">Controls</h4>' +
    '<div class="keys">' +
    [
      ['Move', 'W A S D / arrows / click ground'],
      ['Auto attack', 'Click a monster, then Space once: walks to it and attacks until it dies'],
      ['Skills', '1 - 9, 0'],
      ['HP / MP potion', 'Q / R'],
      ['Talk to NPC', 'E or click'],
      ['Abilities / Gears / Items', 'C / G / I'],
      ['Map / Friends', 'N / F'],
      ['Rest (sit)', 'X'],
      ['Option / Music', 'O / M'],
      ['Chat', 'Enter or /'],
    ]
      .map((r) => '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>')
      .join('') +
    '</div>' +
    '<div class="row" style="margin-top:12px"><button type="button" data-reset>Reset all settings</button></div>';

  openDlg('Settings', 'Changes are saved automatically', body, [
    { t: 'Close', primary: 1, fn: closeDlg },
    { t: 'Save game', fn: () => save() },
    {
      t: 'Rest (X)',
      fn: () => {
        closeDlg();
        toggleSit();
      },
    },
    { t: 'Character select', fn: exitToMenu },
  ]);
  dlgc.classList.add('box');

  // switches
  dlgc.querySelectorAll('button[data-sw]').forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.sw;
      let on;
      if (k === 'sfx') {
        muted = !muted;
        on = !muted;
      } else if (k === 'mus') {
        musicOn = !musicOn;
        on = musicOn;
      } else {
        SET[k] = !SET[k];
        on = SET[k];
      }
      if (k === 'sfx' || k === 'mus') {
        saveAudio();
        syncAudioUi();
        musicSync();
      } else {
        saveSettings();
        applySettings();
      }
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
      b.lastElementChild.textContent = on ? 'On' : 'Off';
      sfxClick();
    };
  });
  // segmented choices
  dlgc.querySelectorAll('.seg').forEach((g) => {
    g.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        const k = g.dataset.seg;
        SET[k] = k === 'zoom' ? +b.dataset.v : b.dataset.v;
        saveSettings();
        applySettings();
        g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        sfxClick();
        // preview: show a sample number at the player
        if (k === 'dmgNum') ft(P.x, P.y - 50, 1234, '#ffffff', 16, -46);
      };
    });
  });
  // volume sliders (updated in place so dragging is never interrupted)
  dlgc.querySelectorAll('input[data-vol]').forEach((r) => {
    const pc = r.nextElementSibling;
    r.oninput = () => {
      const v = r.value / 100;
      pc.textContent = r.value + '%';
      if (r.dataset.vol === 'sfx') sfxVol = v;
      else {
        musVol = v;
        if (Mu.g)
          try {
            Mu.g.gain.cancelScheduledValues(AC.currentTime);
            Mu.g.gain.setValueAtTime(Math.max(0.0001, MUSVOL * musVol), AC.currentTime);
          } catch (e) {}
      }
      saveAudio();
    };
    r.onchange = () => {
      if (r.dataset.vol === 'sfx') sfxClick();
    };
  });
  dlgc.querySelector('button[data-reset]').onclick = () => {
    Object.assign(SET, SET_DEFAULTS);
    sfxVol = 1;
    musVol = 1;
    muted = false;
    musicOn = true;
    saveSettings();
    saveAudio();
    applySettings();
    syncAudioUi();
    musicSync();
    settingsWindow();
  };
}
