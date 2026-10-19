/**
 * Background music for the login and character-select pages.
 * Adds a "menu" track to the procedural music engine (music.js) and wires a
 * Music on/off button (#musicToggle). Browsers only allow sound after a user
 * gesture, so playback is also unlocked on the first click/tap/key press.
 */
TR.menu = {
  // Dreamy C-major theme: soft pad, harp arpeggio and a gentle lead.
  bpm: 88,
  prog: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G'],
  mel: [
    [
      [0, 76, 3],
      [3, 79, 1],
      [4, 84, 4],
    ],
    [
      [0, 83, 2],
      [2, 79, 2],
      [4, 74, 4],
    ],
    [
      [0, 81, 3],
      [3, 79, 1],
      [4, 76, 2],
      [6, 72, 2],
    ],
    [
      [0, 76, 2],
      [2, 79, 2],
      [4, 83, 4],
    ],
    [
      [0, 77, 3],
      [3, 76, 1],
      [4, 72, 2],
      [6, 77, 2],
    ],
    [
      [0, 76, 2],
      [2, 72, 2],
      [4, 79, 4],
    ],
    [
      [0, 81, 2],
      [2, 77, 2],
      [4, 72, 2],
      [6, 74, 2],
    ],
    [
      [0, 74, 2],
      [2, 79, 2],
      [4, 83, 4],
    ],
  ],
  play(bar, s, t, sd, alt) {
    const [b, tn] = CH[this.prog[bar]];
    if (s === 0) {
      for (const n of tn) mPad(t, n, sd * 8.8, 0.024, 1000);
      mTone(t, b, sd * 7, { type: 'sine', vol: 0.12, lp: 520, a: 0.05, sus: 0.8 });
    }
    if (s % 2 === 0)
      mTone(t, tn[ARP[s]] + 12, sd * 2.4, { type: 'triangle', vol: 0.045, lp: 3000, a: 0.004 });
    eachNote(this.mel, bar, s, (n, len) => {
      mTone(t, n, len * sd * 0.98, { type: 'sine', vol: 0.09, lp: 3200, a: 0.05, vib: 7, sus: 0.75 });
      if (alt) mTone(t, n + 12, len * sd * 0.8, { type: 'sine', vol: 0.025 });
    });
  },
};

const MenuMusic = {
  start() {
    loadAudio();
    Mu.want = 'menu';
    try {
      musicSync();
    } catch (e) {}

    const unlock = () => {
      try {
        getAC();
        musicSync();
      } catch (e) {}
    };
    addEventListener('pointerdown', unlock, { once: true });
    addEventListener('keydown', unlock, { once: true });

    const btn = $('#musicToggle');
    if (!btn) return;
    const label = () => {
      const on = musicOn && !muted;
      btn.textContent = 'Music: ' + (on ? 'on' : 'off');
      btn.classList.toggle('off', !on);
      btn.setAttribute('aria-pressed', String(on));
    };
    btn.addEventListener('click', () => {
      musicOn = !musicOn;
      saveAudio();
      label();
      musicSync();
    });
    label();
  },
};
