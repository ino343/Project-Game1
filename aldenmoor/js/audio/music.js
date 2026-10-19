/**
 * Procedural background music (generated live, no audio files).
 */
const MUSVOL = 0.5;
const Mu = { g: null, id: null, want: null, timer: null, step: 0, next: 0 };
const mf = (n) => 440 * Math.pow(2, (n - 69) / 12);
let noiseBuf = null;
function noiseB() {
  if (!noiseBuf) {
    const n = AC.sampleRate >> 1,
      b = AC.createBuffer(1, n, AC.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = b;
  }
  return noiseBuf;
}
// one note: n = MIDI note, d = seconds, o = {type,vol,a,lp,vib,sus,mul}
function mTone(t, n, d, o) {
  const out = Mu.g;
  if (!out) return;
  o = o || {};
  const osc = AC.createOscillator(),
    g = AC.createGain(),
    fl = AC.createBiquadFilter(),
    a = o.a || 0.008,
    v = o.vol || 0.08;
  osc.type = o.type || 'triangle';
  osc.frequency.setValueAtTime(mf(n) * (o.mul || 1), t);
  fl.type = 'lowpass';
  fl.frequency.value = o.lp || 2600;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  if (o.sus) g.gain.setValueAtTime(v, t + d * o.sus);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(d, a + 0.03));
  osc.connect(fl);
  fl.connect(g);
  g.connect(out);
  if (o.vib) {
    const l = AC.createOscillator(),
      lg = AC.createGain();
    l.frequency.value = 5.2;
    lg.gain.value = o.vib;
    l.connect(lg);
    lg.connect(osc.detune);
    l.start(t);
    l.stop(t + d + 0.1);
  }
  osc.start(t);
  osc.stop(t + d + 0.1);
}
function mPad(t, n, d, vol, lp) {
  const out = Mu.g;
  if (!out) return;
  const g = AC.createGain(),
    fl = AC.createBiquadFilter();
  fl.type = 'lowpass';
  fl.frequency.value = lp || 900;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + d * 0.35);
  g.gain.linearRampToValueAtTime(0.0001, t + d);
  fl.connect(g);
  g.connect(out);
  for (const det of [-7, 7]) {
    const o = AC.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(mf(n), t);
    o.detune.value = det;
    o.connect(fl);
    o.start(t);
    o.stop(t + d + 0.05);
  }
}
function mHat(t, vol, hp) {
  const out = Mu.g;
  if (!out) return;
  const s = AC.createBufferSource(),
    f = AC.createBiquadFilter(),
    g = AC.createGain();
  s.buffer = noiseB();
  f.type = 'highpass';
  f.frequency.value = hp || 6500;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (hp && hp < 3000 ? 0.12 : 0.04));
  s.connect(f);
  f.connect(g);
  g.connect(out);
  s.start(t);
  s.stop(t + 0.15);
}
function mKick(t, vol) {
  const out = Mu.g;
  if (!out) return;
  const o = AC.createOscillator(),
    g = AC.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + 0.25);
}
// chord = [bass note, [three chord tones]]
const CH = {
  C: [48, [60, 64, 67]],
  Am: [45, [57, 60, 64]],
  F: [41, [57, 60, 65]],
  G: [43, [59, 62, 67]],
  Em: [40, [59, 64, 67]],
  D: [50, [57, 62, 66]],
  Dm: [38, [57, 62, 65]],
  Bb: [46, [58, 62, 65]],
  A: [45, [57, 61, 64]],
  Gm: [43, [58, 62, 67]],
};
const ARP = [0, 1, 2, 1, 0, 1, 2, 1];
function eachNote(mel, bar, s, fn) {
  for (const n of mel[bar]) if (n[0] === s) fn(n[1], n[2]);
}
// 8 bars per loop, 8 eighth-note steps per bar. mel entries: [step, MIDI note, length in steps].
// On every second pass of the loop `alt` is 1 and each track adds a little extra texture.
const TR = {
  // Aldenmoor Village: warm lute arpeggios in C major
  village: {
    bpm: 96,
    prog: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'],
    mel: [
      [
        [0, 76, 2],
        [2, 79, 2],
        [4, 76, 1],
        [5, 74, 1],
        [6, 72, 2],
      ],
      [
        [0, 72, 2],
        [2, 76, 2],
        [4, 81, 2],
        [6, 79, 2],
      ],
      [
        [0, 77, 2],
        [2, 76, 1],
        [3, 74, 1],
        [4, 72, 2],
        [6, 69, 2],
      ],
      [
        [0, 71, 2],
        [2, 74, 2],
        [4, 79, 3],
      ],
      [
        [0, 76, 2],
        [2, 79, 2],
        [4, 84, 2],
        [6, 81, 2],
      ],
      [
        [0, 79, 2],
        [2, 76, 1],
        [3, 79, 1],
        [4, 83, 2],
        [6, 79, 2],
      ],
      [
        [0, 77, 2],
        [2, 81, 2],
        [4, 77, 2],
        [6, 74, 2],
      ],
      [
        [0, 74, 2],
        [2, 71, 2],
        [4, 67, 3],
      ],
    ],
    play(bar, s, t, sd, alt) {
      const [b, tn] = CH[this.prog[bar]];
      if (s === 0 || s === 4) mTone(t, b, sd * 3.2, { type: 'triangle', vol: 0.14, lp: 700, a: 0.01 });
      mTone(t, tn[ARP[s]], sd * 1.6, { type: 'triangle', vol: 0.05, lp: 2200, a: 0.004 });
      if (s % 2 === 1) mHat(t, 0.022, 7000);
      if (alt && (s === 2 || s === 6)) mHat(t, 0.03, 2500);
      eachNote(this.mel, bar, s, (n, len) => {
        mTone(t, n, len * sd * 1.05, { type: 'triangle', vol: 0.1, lp: 3200, a: 0.012 });
        mTone(t, n, len * sd * 0.8, { type: 'square', vol: 0.022, lp: 1800, a: 0.01 });
        if (alt) mTone(t, n + 12, len * sd * 0.9, { type: 'sine', vol: 0.035 });
      });
    },
  },
  // Sunny Meadow: bouncy oom-pah march in G major
  meadow: {
    bpm: 126,
    prog: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'],
    mel: [
      [
        [0, 79, 1],
        [1, 83, 1],
        [2, 86, 2],
        [4, 83, 1],
        [5, 79, 1],
        [6, 83, 2],
      ],
      [
        [0, 81, 1],
        [1, 78, 1],
        [2, 81, 2],
        [4, 78, 1],
        [5, 74, 1],
        [6, 78, 2],
      ],
      [
        [0, 76, 1],
        [1, 79, 1],
        [2, 83, 2],
        [4, 79, 1],
        [5, 76, 1],
        [6, 79, 2],
      ],
      [
        [0, 84, 2],
        [2, 79, 2],
        [4, 76, 2],
        [6, 79, 2],
      ],
      [
        [0, 83, 1],
        [1, 86, 1],
        [2, 83, 2],
        [4, 79, 2],
        [6, 74, 2],
      ],
      [
        [0, 78, 2],
        [2, 81, 2],
        [4, 86, 2],
        [6, 81, 2],
      ],
      [
        [0, 84, 1],
        [1, 83, 1],
        [2, 81, 2],
        [4, 79, 2],
        [6, 76, 2],
      ],
      [
        [0, 74, 2],
        [2, 78, 2],
        [4, 81, 2],
        [6, 78, 1],
        [7, 74, 1],
      ],
    ],
    play(bar, s, t, sd, alt) {
      const [b, tn] = CH[this.prog[bar]];
      if (s % 2 === 0)
        mTone(t, b + (s % 4 === 2 ? 7 : 0), sd * 1.7, { type: 'triangle', vol: 0.15, lp: 800, a: 0.006 });
      if (s % 2 === 1)
        for (const n of tn) mTone(t, n, sd * 0.9, { type: 'square', vol: 0.02, lp: 1500, a: 0.004 });
      if (s === 0 || s === 4) mKick(t, 0.2);
      if (s === 2 || s === 6) mHat(t, 0.05, 2200);
      if (s % 2 === 1) mHat(t, 0.026, 7000);
      eachNote(this.mel, bar, s, (n, len) => {
        mTone(t, n, len * sd * 0.95, { type: 'square', vol: 0.04, lp: 2600, a: 0.006 });
        mTone(t, n, len * sd, { type: 'triangle', vol: 0.08, lp: 3400, a: 0.006 });
        if (alt) mTone(t, n + 12, len * sd * 0.7, { type: 'sine', vol: 0.03 });
      });
    },
  },
  // Whisperwood: slow pads, harp arpeggio and a breathy flute in A minor
  forest: {
    bpm: 78,
    prog: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'Em'],
    mel: [
      [
        [0, 76, 4],
        [4, 72, 2],
        [6, 74, 2],
      ],
      [
        [0, 77, 4],
        [4, 76, 2],
        [6, 72, 2],
      ],
      [
        [0, 79, 3],
        [3, 76, 1],
        [4, 72, 2],
        [6, 76, 2],
      ],
      [
        [0, 74, 4],
        [4, 71, 2],
        [6, 67, 2],
      ],
      [
        [0, 69, 2],
        [2, 72, 2],
        [4, 76, 4],
      ],
      [
        [0, 77, 3],
        [3, 76, 1],
        [4, 74, 2],
        [6, 72, 2],
      ],
      [
        [0, 71, 2],
        [2, 74, 2],
        [4, 79, 4],
      ],
      [
        [0, 76, 4],
        [4, 71, 4],
      ],
    ],
    play(bar, s, t, sd, alt) {
      const [b, tn] = CH[this.prog[bar]];
      if (s === 0) {
        for (const n of tn) mPad(t, n, sd * 8.8, 0.03, 1100);
        mTone(t, b, sd * 7, { type: 'sine', vol: 0.13, lp: 500, a: 0.06, sus: 0.85 });
      }
      if (alt || s % 2 === 0)
        mTone(t, tn[ARP[s]] + 12, sd * 3, { type: 'triangle', vol: 0.05, lp: 3200, a: 0.004 });
      eachNote(this.mel, bar, s, (n, len) =>
        mTone(t, n, len * sd * 0.98, { type: 'sine', vol: 0.1, lp: 3000, a: 0.07, vib: 9, sus: 0.7 }),
      );
    },
  },
  // Sunken Ruins: cold drones, a slow heartbeat and distant bells in D minor
  ruins: {
    bpm: 64,
    prog: ['Dm', 'Dm', 'Bb', 'A', 'Dm', 'Gm', 'Bb', 'A'],
    mel: [
      [
        [0, 74, 2],
        [3, 77, 1],
        [5, 81, 2],
      ],
      [
        [2, 76, 2],
        [6, 74, 2],
      ],
      [
        [0, 74, 2],
        [3, 70, 1],
        [5, 77, 2],
      ],
      [
        [0, 73, 2],
        [4, 76, 2],
        [6, 81, 2],
      ],
      [
        [0, 77, 2],
        [3, 74, 1],
        [5, 69, 3],
      ],
      [
        [0, 74, 2],
        [2, 70, 2],
        [5, 79, 3],
      ],
      [
        [0, 77, 2],
        [4, 74, 2],
        [6, 70, 2],
      ],
      [
        [0, 73, 3],
        [4, 69, 2],
        [6, 73, 2],
      ],
    ],
    play(bar, s, t, sd, alt) {
      const [b, tn] = CH[this.prog[bar]];
      if (s === 0) {
        for (const n of tn) mPad(t, n, sd * 8.8, 0.026, 650);
        mPad(t, b, sd * 8.8, 0.04, 400);
        if (alt) for (const n of tn) mPad(t, n + 12, sd * 8.8, 0.012, 900);
      }
      if (s === 0) mKick(t, 0.16);
      if (s === 1) mKick(t, 0.1);
      eachNote(this.mel, bar, s, (n, len) => {
        mTone(t, n, len * sd + 2.4, { type: 'sine', vol: 0.075, lp: 4000, a: 0.004 });
        mTone(t, n, len * sd + 1.2, { type: 'sine', vol: 0.02, mul: 2.756, lp: 6000, a: 0.004 });
      });
    },
  },
};
function musicTick() {
  const T = TR[Mu.id];
  if (!T || !AC || !Mu.g) return;
  const sd = 60 / T.bpm / 2,
    len = T.prog.length;
  if (Mu.next < AC.currentTime - 0.2) Mu.next = AC.currentTime + 0.05;
  let guard = 0;
  while (Mu.next < AC.currentTime + 1.2 && guard++ < 48) {
    const i = Mu.step++,
      bar = Math.floor(i / 8) % len,
      alt = Math.floor(i / (8 * len)) % 2;
    try {
      T.play(bar, i % 8, Mu.next, sd, alt);
    } catch (e) {}
    Mu.next += sd;
  }
}
function stopMusic() {
  if (Mu.timer) {
    clearInterval(Mu.timer);
    Mu.timer = null;
  }
  const g = Mu.g;
  Mu.g = null;
  Mu.id = null;
  if (g && AC) {
    try {
      const n = AC.currentTime;
      g.gain.cancelScheduledValues(n);
      g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), n);
      g.gain.linearRampToValueAtTime(0.0001, n + 0.7);
      setTimeout(() => {
        try {
          g.disconnect();
        } catch (e) {}
      }, 1600);
    } catch (e) {}
  }
}
// Call after the map, the Music button or the Sound button changes.
function musicSync() {
  const should = musicOn && !muted && Mu.want && TR[Mu.want];
  if (!should) {
    stopMusic();
    return;
  }
  if (Mu.id === Mu.want && Mu.g) return;
  stopMusic();
  try {
    getAC();
    Mu.g = AC.createGain();
    const n = AC.currentTime;
    Mu.g.gain.setValueAtTime(0.0001, n);
    Mu.g.gain.linearRampToValueAtTime(Math.max(0.0001, MUSVOL * musVol), n + 1.6);
    Mu.g.connect(AC.destination);
    Mu.id = Mu.want;
    Mu.step = 0;
    Mu.next = n + 0.15;
    musicTick();
    Mu.timer = setInterval(musicTick, 250);
  } catch (e) {
    Mu.g = null;
    Mu.id = null;
  }
}
// Music for the later maps: reuse existing themes at a different tempo (no new score needed).
const trVariant = (base, bpm) => Object.assign(Object.create(TR[base]), { bpm });
TR.swamp = trVariant('forest', 100);
TR.desert = trVariant('ruins', 88);
TR.frost = trVariant('meadow', 84);
TR.volcano = trVariant('ruins', 112);
TR.abyss = trVariant('ruins', 72);
