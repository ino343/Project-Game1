/**
 * Web Audio context, sound effects and persisted audio settings.
 */
let AC = null,
  muted = false,
  musicOn = true,
  sfxVol = 1, // 0..1 (Settings)
  musVol = 1; // 0..1 (Settings)
function getAC() {
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === 'suspended') AC.resume().catch(() => {});
  return AC;
}
// Legacy tone helper: now a soft, clean tone through the shared bus (no harsh square/saw beeps).
function sfx(f, d = 0.06, type = 'square', v = 0.035) {
  sfxSafe(() => {
    _wet = 0.18;
    snTone(f, f, Math.max(d, 0.08), type === 'square' || type === 'sawtooth' ? 'triangle' : type, v * 2.4);
    _wet = 0;
  });
}
/* ---------------- modern sound design ----------------
 * Everything is synthesized (no audio files). Every sound uses the same modern recipe:
 * sub punch (weight) + crisp high transient (click) + tonal sweep (the "game" sheen) +
 * filtered air + a short reverb tail. Old inharmonic metal rings / wood thunks / raw beeps are gone.
 * Voices go through one compressor so big AoE hits don't clip. */
let _sfxBus = null,
  _verb = null,
  _wet = 0,
  _noiseBuf = null,
  _hitG = 0,
  _hitN = 0;
function sfxBus() {
  const ac = getAC();
  if (!_sfxBus || _sfxBus.ac !== ac) {
    const g = ac.createGain(),
      c = ac.createDynamicsCompressor();
    g.gain.value = 2.2;
    c.threshold.value = -16;
    c.knee.value = 12;
    c.ratio.value = 6;
    c.attack.value = 0.002;
    c.release.value = 0.12;
    g.connect(c);
    c.connect(ac.destination);
    // small room reverb used by "modern" sounds (_wet > 0)
    const cv = ac.createConvolver(),
      n = Math.floor(ac.sampleRate * 0.45),
      ir = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
    }
    cv.buffer = ir;
    cv.connect(c);
    _verb = cv;
    _sfxBus = g;
    _sfxBus.ac = ac;
    _noiseBuf = null;
  }
  _sfxBus.gain.value = 2.2 * sfxVol;
  return _sfxBus;
}
function sendVerb(node) {
  if (!_wet || !_verb) return;
  const w = AC.createGain();
  w.gain.value = _wet;
  node.connect(w);
  w.connect(_verb);
}
function snTone(f0, f1, dur, type = 'sine', vol = 0.1, delay = 0) {
  const ac = AC,
    t = ac.currentTime + delay,
    o = ac.createOscillator(),
    g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(_sfxBus);
  sendVerb(g);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function snNoise(dur, filt, f0, f1, q, vol, delay = 0) {
  const ac = AC,
    t = ac.currentTime + delay;
  if (!_noiseBuf) {
    const n = Math.floor(ac.sampleRate * 1.2),
      b = ac.createBuffer(1, n, ac.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    _noiseBuf = b;
  }
  const src = ac.createBufferSource(),
    f = ac.createBiquadFilter(),
    g = ac.createGain();
  src.buffer = _noiseBuf;
  f.type = filt;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(_sfxBus);
  sendVerb(g);
  src.start(t, Math.random() * 0.2);
  src.stop(t + dur + 0.02);
}
function sfxSafe(fn) {
  if (muted) return;
  try {
    getAC();
    sfxBus();
    fn();
  } catch (e) {}
}
/* Plucked string (Karplus-Strong): a real bowstring "twang". Buffers are cached per pitch. */
const _pluckBufs = {};
function pluckBuf(f) {
  f = Math.round(f / 8) * 8;
  if (_pluckBufs[f]) return _pluckBufs[f];
  const sr = AC.sampleRate,
    N = Math.floor(sr * 0.5),
    L = Math.max(2, Math.round(sr / f)),
    ringb = new Float32Array(L),
    buf = AC.createBuffer(1, N, sr),
    d = buf.getChannelData(0);
  for (let i = 0; i < L; i++) ringb[i] = (Math.random() * 2 - 1) * (1 - i / L) * 0.7 + (Math.random() * 2 - 1) * 0.3;
  for (let i = 0, p = 0; i < N; i++) {
    const n = (p + 1) % L;
    d[i] = ringb[p] * Math.min(1, (N - i) / (sr * 0.03));
    ringb[p] = (ringb[p] + ringb[n]) * 0.4985;
    p = n;
  }
  return (_pluckBufs[f] = buf);
}
function snPluck(f, vol, delay = 0, cutoff = 3500, dur = 0.5) {
  const t = AC.currentTime + delay,
    src = AC.createBufferSource(),
    lp = AC.createBiquadFilter(),
    g = AC.createGain();
  src.buffer = pluckBuf(f);
  lp.type = 'lowpass';
  lp.frequency.value = cutoff;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(lp);
  lp.connect(g);
  g.connect(_sfxBus);
  src.start(t);
  src.stop(t + dur + 0.02);
}
// Inharmonic partials of struck metal: a blade "ting" / "shing".
function snRing(base, ratios, dur, vol, delay = 0) {
  ratios.forEach((m, i) => snTone(base * m, base * m * 0.995, dur / (1 + i * 0.6), 'sine', vol / (1 + i * 0.7), delay));
}
// Run a sound with a given amount of reverb send.
function wet(w, fn) {
  const prev = _wet;
  _wet = w;
  try {
    fn();
  } finally {
    _wet = prev;
  }
}
// Clean harmonic shimmer (octave / fifth stack). Replaces the old inharmonic "metal ring".
function snShimmer(base, dur, vol, delay = 0) {
  [1, 1.5, 2, 3].forEach((m, i) => snTone(base * m, base * m * 0.99, dur / (1 + i * 0.5), 'sine', vol / (1 + i * 0.8), delay));
}
// Rising/falling note run (chimes, level-up, coins).
function snNotes(freqs, step, dur, vol, type = 'triangle', delay = 0) {
  freqs.forEach((f, i) => snTone(f, f * 1.004, dur, type, vol, delay + i * step));
}
// One blade slice (hit alone, twice for a knife crit).
function knifeCut(r, k, delay = 0) {
  snNoise(0.012, 'highpass', 7000, 10000, 0.5, 0.2 * k, delay); // crisp transient
  snNoise(0.05, 'bandpass', 3200 * r, 1800, 1.3, 0.2 * k, delay); // slice
  snTone(2600 * r, 700, 0.07, 'triangle', 0.07 * k, delay + 0.003); // sleek sweep
  snTone(150, 70, 0.07, 'sine', 0.12 * k, delay); // light sub
}
/* Knife sounds (Waif + Assassin). Pick a style with KNIFE_STYLE:
 * '0' = original, 'A' Combat Knife, 'B' Switchblade Shing, 'C' Butterfly Flick, 'D' Cinematic Slash, 'E' Stealth Stab,
 * 'F' Razor Slice, 'G' Steel Scrape, 'H' Gritty Stab, 'I' Shadow Blink, 'J' Dual Fang (set 2, more realistic).
 * swing(r, v) plays when you attack; hit(r, k, dl) when the blade lands; crit(r, k, dl) on a critical.
 * r = random pitch, v/k = loudness, dl = small delay so the hit lands just after the swing starts. */
let KNIFE_STYLE = 'I';
const KNIFE_FX = {
  // A · Combat Knife: Realistic: hangin "shff" + steel scrape, tapos "thk" na saksak at tick ng bakal.
  A: {
    swing: (r, v) => {
      wet(0.14, () => {
        snNoise(0.01, 'highpass', 6500, 9500, 0.5, 0.09 * v);
        snNoise(0.095, 'bandpass', 2200 * r, 6600, 1.3, 0.24 * v);
        snNoise(0.075, 'bandpass', 1000 * r, 380, 0.8, 0.1 * v, 0.015);
        snNoise(0.045, 'bandpass', 8200, 5600, 10, 0.06 * v, 0.02);
        snTone(1900 * r, 3200, 0.06, 'triangle', 0.025 * v);
      });
    },
    hit: (r, k, dl) => {
      wet(0.16, () => {
        snTone(150 * r, 52, 0.1, 'sine', 0.28 * k, dl);
        snNoise(0.016, 'highpass', 5000, 9000, 0.5, 0.16 * k, dl);
        snNoise(0.07, 'lowpass', 1800, 300, 0.8, 0.24 * k, dl);
        snNoise(0.06, 'bandpass', 3000 * r, 1500, 1.4, 0.15 * k, dl + 0.006);
        snRing(3600 * r, [1, 2.76, 5.4], 0.11, 0.03 * k, dl + 0.004);
      });
    },
    crit: (r, k, dl) => {
      wet(0.18, () => {
        snTone(150 * r, 52, 0.1, 'sine', 0.28 * k, dl);
        snNoise(0.016, 'highpass', 5000, 9000, 0.5, 0.16 * k, dl);
        snNoise(0.07, 'lowpass', 1800, 300, 0.8, 0.24 * k, dl);
        snNoise(0.06, 'bandpass', 3000 * r, 1500, 1.4, 0.15 * k, dl + 0.006);
        snRing(3600 * r, [1, 2.76, 5.4], 0.11, 0.03 * k, dl + 0.004);
        snNoise(0.012, 'highpass', 6000, 9500, 0.5, 0.18 * k, dl + 0.05);
        snNoise(0.06, 'bandpass', 3600 * r, 1800, 1.4, 0.2 * k, dl + 0.05);
        snNoise(0.07, 'lowpass', 1800, 300, 0.8, 0.2 * k, dl + 0.05);
        snRing(3000 * r, [1, 2.76, 5.4, 8.93], 0.5, 0.05 * k, dl + 0.05);
        snTone(80, 32, 0.25, 'sine', 0.3 * k, dl);
      });
    },
  },
  // B · Switchblade Shing: Malinaw na metallic "shing" ng lumalabas na kutsilyo bago ang hiwa. Pinaka-"movie".
  B: {
    swing: (r, v) => {
      wet(0.2, () => {
        snNoise(0.16, 'bandpass', 3500, 11000, 14, 0.15 * v);
        snRing(2400 * r, [1, 2.76, 5.4, 8.93], 0.28, 0.045 * v, 0.01);
        snNoise(0.012, 'highpass', 7000, 10000, 0.5, 0.1 * v);
        snNoise(0.08, 'bandpass', 2800 * r, 7500, 1.4, 0.2 * v, 0.04);
        snTone(1500 * r, 3000, 0.06, 'triangle', 0.02 * v, 0.04);
      });
    },
    hit: (r, k, dl) => {
      wet(0.2, () => {
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.05, 'bandpass', 3400 * r, 1800, 1.2, 0.26 * k, dl);
        snTone(160 * r, 60, 0.07, 'sine', 0.14 * k, dl);
        snRing(3000 * r, [1, 2.76, 5.4], 0.35, 0.04 * k, dl + 0.003);
        snNoise(0.14, 'bandpass', 9000, 5000, 12, 0.06 * k, dl + 0.01);
      });
    },
    crit: (r, k, dl) => {
      wet(0.22, () => {
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.05, 'bandpass', 3400 * r, 1800, 1.2, 0.26 * k, dl);
        snTone(160 * r, 60, 0.07, 'sine', 0.14 * k, dl);
        snRing(3000 * r, [1, 2.76, 5.4], 0.35, 0.04 * k, dl + 0.003);
        snNoise(0.14, 'bandpass', 9000, 5000, 12, 0.06 * k, dl + 0.01);
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl + 0.05);
        snNoise(0.05, 'bandpass', 3800 * r, 1900, 1.2, 0.26 * k, dl + 0.05);
        snRing(2600 * r, [1, 2.76, 5.4, 8.93], 0.7, 0.055 * k, dl + 0.05);
        snNoise(0.22, 'bandpass', 4000, 11000, 6, 0.14 * k, dl + 0.02);
        snTone(140, 50, 0.16, 'sine', 0.22 * k, dl + 0.04);
      });
    },
  },
  // C · Butterfly Flick: Mabilis na dobleng "tik-tk" flick, magaan at matulis. Bagay sa Waif.
  C: {
    swing: (r, v) => {
      wet(0.12, () => {
        snNoise(0.012, 'highpass', 7000, 10000, 0.5, 0.07 * v);
        snNoise(0.055, 'bandpass', 3000 * r, 6800, 1.6, 0.14 * v);
        snTone(1400 * r, 2800, 0.04, 'triangle', 0.03 * v, 0.003);
        snNoise(0.012, 'highpass', 7000, 10000, 0.5, 0.07 * v, 0.045);
        snNoise(0.055, 'bandpass', 3700 * r, 7700, 1.6, 0.14 * v, 0.045);
        snTone(1900 * r, 2800, 0.04, 'triangle', 0.03 * v, 0.048);
        snRing(4200, [1, 2.4], 0.04, 0.04 * v, 0.03);
      });
    },
    hit: (r, k, dl) => {
      wet(0.12, () => {
        snNoise(0.01, 'highpass', 7000, 10000, 0.5, 0.18 * k, dl);
        snNoise(0.05, 'bandpass', 3600 * r, 2000, 1.3, 0.22 * k, dl);
        snTone(170 * r, 70, 0.05, 'sine', 0.12 * k, dl);
        snNoise(0.04, 'bandpass', 2200 * r, 1200, 1.5, 0.12 * k, dl + 0.045);
        snRing(4500, [1, 2.3], 0.06, 0.03 * k, dl + 0.04);
      });
    },
    crit: (r, k, dl) => {
      wet(0.16, () => {
        snNoise(0.01, 'highpass', 7000, 10000, 0.5, 0.15 * k, dl);
        snNoise(0.05, 'bandpass', 3400 * r, 1900, 1.3, 0.2 * k, dl);
        snTone(170 * r, 70, 0.05, 'sine', 0.1 * k, dl);
        snNoise(0.01, 'highpass', 7000, 10000, 0.5, 0.15 * k, dl + 0.04);
        snNoise(0.05, 'bandpass', 4000 * r, 1900, 1.3, 0.2 * k, dl + 0.04);
        snTone(190 * r, 70, 0.05, 'sine', 0.1 * k, dl + 0.04);
        snNoise(0.01, 'highpass', 7000, 10000, 0.5, 0.15 * k, dl + 0.08);
        snNoise(0.05, 'bandpass', 4600 * r, 1900, 1.3, 0.2 * k, dl + 0.08);
        snTone(210 * r, 70, 0.05, 'sine', 0.1 * k, dl + 0.08);
        snRing(3400 * r, [1, 2.76, 5.4, 8.93], 0.45, 0.05 * k, dl + 0.08);
        snTone(90, 35, 0.2, 'sine', 0.26 * k, dl + 0.08);
      });
    },
  },
  // D · Cinematic Slash: Mabigat at pelikula: sub-bass na bigat, malawak na hangin, may reverb na buntot.
  D: {
    swing: (r, v) => {
      wet(0.3, () => {
        snTone(100, 48, 0.18, 'sine', 0.14 * v);
        snNoise(0.22, 'bandpass', 500 * r, 4200, 1.1, 0.22 * v);
        snNoise(0.18, 'bandpass', 4200, 900, 1, 0.13 * v, 0.07);
        snNoise(0.012, 'highpass', 6000, 9500, 0.5, 0.1 * v);
        snTone(700 * r, 2600, 0.14, 'triangle', 0.035 * v);
        snNoise(0.12, 'bandpass', 8000, 4000, 8, 0.05 * v, 0.04);
      });
    },
    hit: (r, k, dl) => {
      wet(0.3, () => {
        snTone(120 * r, 40, 0.22, 'sine', 0.38 * k, dl);
        snNoise(0.012, 'highpass', 5000, 9000, 0.5, 0.25 * k, dl);
        snNoise(0.09, 'bandpass', 2200 * r, 700, 1, 0.26 * k, dl);
        snNoise(0.18, 'lowpass', 1500, 200, 0.8, 0.22 * k, dl + 0.005);
        snRing(2800 * r, [1, 2.76, 5.4], 0.5, 0.035 * k, dl + 0.01);
        snShimmer(1760, 0.3, 0.015 * k, dl + 0.01);
      });
    },
    crit: (r, k, dl) => {
      wet(0.35, () => {
        snTone(120 * r, 40, 0.22, 'sine', 0.38 * k, dl);
        snNoise(0.012, 'highpass', 5000, 9000, 0.5, 0.25 * k, dl);
        snNoise(0.09, 'bandpass', 2200 * r, 700, 1, 0.26 * k, dl);
        snNoise(0.18, 'lowpass', 1500, 200, 0.8, 0.22 * k, dl + 0.005);
        snRing(2800 * r, [1, 2.76, 5.4], 0.5, 0.035 * k, dl + 0.01);
        snShimmer(1760, 0.3, 0.015 * k, dl + 0.01);
        snTone(70, 28, 0.4, 'sine', 0.45 * k, dl);
        snNoise(0.3, 'bandpass', 1800, 9500, 5, 0.2 * k, dl);
        snRing(2200 * r, [1, 2.76, 5.4, 8.93], 0.9, 0.05 * k, dl + 0.02);
        snShimmer(1976, 0.7, 0.04 * k, dl + 0.03);
      });
    },
  },
  // E · Stealth Stab: Tuyo, malapit, tahimik: mabilis na hiwa at tuyong "thk" na saksak. Pang-assassin.
  E: {
    swing: (r, v) => {
      wet(0.05, () => {
        snNoise(0.008, 'highpass', 6000, 9000, 0.5, 0.06 * v);
        snNoise(0.05, 'bandpass', 2600 * r, 5200, 1.4, 0.17 * v);
        snNoise(0.04, 'bandpass', 900 * r, 500, 1, 0.07 * v, 0.01);
      });
    },
    hit: (r, k, dl) => {
      wet(0.05, () => {
        snTone(110 * r, 45, 0.08, 'sine', 0.3 * k, dl);
        snNoise(0.01, 'highpass', 4500, 8000, 0.5, 0.12 * k, dl);
        snNoise(0.05, 'lowpass', 1300, 250, 0.9, 0.28 * k, dl);
        snNoise(0.03, 'bandpass', 700, 350, 1.8, 0.2 * k, dl + 0.01);
        snRing(3200 * r, [1, 2.76], 0.06, 0.02 * k, dl + 0.002);
      });
    },
    crit: (r, k, dl) => {
      wet(0.08, () => {
        snTone(110 * r, 45, 0.08, 'sine', 0.3 * k, dl);
        snNoise(0.01, 'highpass', 4500, 8000, 0.5, 0.12 * k, dl);
        snNoise(0.05, 'lowpass', 1300, 250, 0.9, 0.28 * k, dl);
        snNoise(0.03, 'bandpass', 700, 350, 1.8, 0.2 * k, dl + 0.01);
        snRing(3200 * r, [1, 2.76], 0.06, 0.02 * k, dl + 0.002);
        snTone(120 * r, 45, 0.09, 'sine', 0.36 * k, dl + 0.06);
        snNoise(0.012, 'highpass', 5000, 9000, 0.5, 0.2 * k, dl + 0.06);
        snNoise(0.06, 'lowpass', 1500, 250, 0.9, 0.32 * k, dl + 0.06);
        snRing(3400 * r, [1, 2.76, 5.4], 0.3, 0.045 * k, dl + 0.06);
      });
    },
  },
  // F · Razor Slice: Manipis, matalim na hiwa na may natural na "ting" ng bakal. Malinis at modern.
  F: {
    swing: (r, v) => {
        wet(0.12, () => {
        snNoise(0.008, 'highpass', 7000, 10000, 0.5, 0.08 * v);
        snNoise(0.11, 'bandpass', 1800 * r, 7200, 1, 0.26 * v);
        snNoise(0.09, 'bandpass', 5200, 9800, 2.5, 0.12 * v, 0.01);
        snNoise(0.06, 'lowpass', 2500, 500, 0.7, 0.06 * v);
        snNoise(0.22, 'bandpass', 6300, 6237, 45, 0.55 * v, 0.02);
        snNoise(0.18, 'bandpass', 9400, 9306, 45, 0.4 * v, 0.025);
        });
    },
    hit: (r, k, dl) => {
        wet(0.14, () => {
        snNoise(0.014, 'highpass', 6000, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.07, 'bandpass', 6500 * r, 1600, 1.1, 0.32 * k, dl);
        snNoise(0.05, 'lowpass', 900, 220, 0.8, 0.2 * k, dl + 0.004);
        snTone(120 * r, 50, 0.09, 'sine', 0.22 * k, dl);
        snNoise(0.3, 'bandpass', 4100, 4059, 45, 0.5 * k, dl + 0.004);
        });
    },
    crit: (r, k, dl) => {
        wet(0.18, () => {
        snNoise(0.014, 'highpass', 6000, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.07, 'bandpass', 6500 * r, 1600, 1.1, 0.32 * k, dl);
        snNoise(0.05, 'lowpass', 900, 220, 0.8, 0.2 * k, dl + 0.004);
        snTone(120 * r, 50, 0.09, 'sine', 0.22 * k, dl);
        snNoise(0.3, 'bandpass', 4100, 4059, 45, 0.5 * k, dl + 0.004);
        snNoise(0.012, 'highpass', 6000, 10000, 0.5, 0.2 * k, dl + 0.05);
        snNoise(0.07, 'bandpass', 7000 * r, 1700, 1.1, 0.32 * k, dl + 0.05);
        snNoise(0.5, 'bandpass', 3100, 3069, 45, 0.7 * k, dl + 0.05);
        snNoise(0.4, 'bandpass', 7400, 7326, 45, 0.5 * k, dl + 0.05);
        snTone(70, 28, 0.3, 'sine', 0.34 * k, dl);
        snNoise(0.2, 'bandpass', 3000, 11000, 5, 0.14 * k, dl + 0.02);
        });
    },
  },
  // G · Steel Scrape: Mabigat na "shiiink" ng bakal na kinakaladkad, tapos hiwa na may maraming metal na ring.
  G: {
    swing: (r, v) => {
        wet(0.18, () => {
        snNoise(0.2, 'bandpass', 2600, 9500, 6, 0.22 * v);
        snNoise(0.3, 'bandpass', 3300, 3267, 45, 0.6 * v, 0.03);
        snNoise(0.3, 'bandpass', 5900, 5841, 45, 0.5 * v, 0.03);
        snNoise(0.25, 'bandpass', 8800, 8712, 45, 0.4 * v, 0.035);
        snNoise(0.012, 'highpass', 7000, 10000, 0.5, 0.09 * v);
        snNoise(0.085, 'bandpass', 2600 * r, 6500, 1.3, 0.2 * v, 0.06);
        });
    },
    hit: (r, k, dl) => {
        wet(0.18, () => {
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.05, 'bandpass', 3600 * r, 1700, 1.2, 0.28 * k, dl);
        snTone(150, 55, 0.08, 'sine', 0.18 * k, dl);
        snNoise(0.4, 'bandpass', 3300, 3267, 45, 0.55 * k, dl + 0.003);
        snNoise(0.35, 'bandpass', 5900, 5841, 45, 0.45 * k, dl + 0.003);
        snNoise(0.3, 'bandpass', 8800, 8712, 45, 0.35 * k, dl + 0.003);
        });
    },
    crit: (r, k, dl) => {
        wet(0.22, () => {
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.05, 'bandpass', 3600 * r, 1700, 1.2, 0.28 * k, dl);
        snTone(150, 55, 0.08, 'sine', 0.18 * k, dl);
        snNoise(0.4, 'bandpass', 3300, 3267, 45, 0.55 * k, dl + 0.003);
        snNoise(0.35, 'bandpass', 5900, 5841, 45, 0.45 * k, dl + 0.003);
        snNoise(0.3, 'bandpass', 8800, 8712, 45, 0.35 * k, dl + 0.003);
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl + 0.05);
        snNoise(0.05, 'bandpass', 3900 * r, 1800, 1.2, 0.28 * k, dl + 0.05);
        snNoise(0.8, 'bandpass', 2700, 2673, 45, 0.7 * k, dl + 0.05);
        snNoise(0.7, 'bandpass', 6100, 6039, 45, 0.5 * k, dl + 0.05);
        snTone(75, 30, 0.35, 'sine', 0.34 * k, dl);
        });
    },
  },
  // H · Gritty Stab: Mabigat at tuyong saksak na may bigat ng laman, parang tunay na pagsaksak.
  H: {
    swing: (r, v) => {
        wet(0.06, () => {
        snNoise(0.007, 'highpass', 6500, 9500, 0.5, 0.06 * v);
        snNoise(0.06, 'bandpass', 2200 * r, 4800, 1.2, 0.2 * v);
        snNoise(0.05, 'bandpass', 700 * r, 420, 0.9, 0.1 * v, 0.01);
        snNoise(0.03, 'bandpass', 4800, 6000, 6, 0.05 * v, 0.01);
        });
    },
    hit: (r, k, dl) => {
        wet(0.08, () => {
        snTone(95 * r, 42, 0.12, 'sine', 0.38 * k, dl);
        snNoise(0.012, 'highpass', 4500, 8000, 0.5, 0.12 * k, dl);
        snNoise(0.07, 'lowpass', 1100, 200, 0.9, 0.34 * k, dl);
        snNoise(0.045, 'bandpass', 500, 260, 2, 0.3 * k, dl + 0.012);
        snNoise(0.05, 'bandpass', 2400 * r, 1200, 1.4, 0.14 * k, dl);
        snNoise(0.2, 'bandpass', 3300, 3267, 45, 0.25 * k, dl + 0.004);
        });
    },
    crit: (r, k, dl) => {
        wet(0.1, () => {
        snTone(95 * r, 42, 0.12, 'sine', 0.38 * k, dl);
        snNoise(0.012, 'highpass', 4500, 8000, 0.5, 0.12 * k, dl);
        snNoise(0.07, 'lowpass', 1100, 200, 0.9, 0.34 * k, dl);
        snNoise(0.045, 'bandpass', 500, 260, 2, 0.3 * k, dl + 0.012);
        snNoise(0.05, 'bandpass', 2400 * r, 1200, 1.4, 0.14 * k, dl);
        snNoise(0.2, 'bandpass', 3300, 3267, 45, 0.25 * k, dl + 0.004);
        snTone(80 * r, 36, 0.14, 'sine', 0.44 * k, dl + 0.07);
        snNoise(0.012, 'highpass', 4500, 8000, 0.5, 0.16 * k, dl + 0.07);
        snNoise(0.35, 'lowpass', 900, 120, 0.8, 0.3 * k, dl + 0.07);
        snNoise(0.05, 'bandpass', 2600 * r, 1200, 1.4, 0.2 * k, dl + 0.07);
        snNoise(0.5, 'bandpass', 3000, 2970, 45, 0.5 * k, dl + 0.07);
        snTone(60, 26, 0.35, 'sine', 0.4 * k, dl + 0.07);
        });
    },
  },
  // I · Shadow Blink: Parang lumilipad na anino: malawak na whoosh, may reverb, at kumikinang na ting. Pang-high-level.
  I: {
    swing: (r, v) => {
        wet(0.26, () => {
        snTone(90, 45, 0.25, 'sine', 0.12 * v);
        snNoise(0.28, 'bandpass', 400 * r, 5200, 1, 0.22 * v);
        snNoise(0.2, 'bandpass', 6800, 2200, 1.6, 0.14 * v, 0.1);
        snNoise(0.01, 'highpass', 7000, 10000, 0.5, 0.08 * v);
        snNoise(0.3, 'bandpass', 7000, 6930, 45, 0.35 * v, 0.06);
        snTone(500 * r, 2400, 0.2, 'triangle', 0.02 * v);
        });
    },
    hit: (r, k, dl) => {
        wet(0.24, () => {
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.06, 'bandpass', 3000 * r, 1200, 1.1, 0.28 * k, dl);
        snTone(130 * r, 45, 0.14, 'sine', 0.3 * k, dl);
        snNoise(0.12, 'lowpass', 1400, 200, 0.8, 0.2 * k, dl);
        snNoise(0.5, 'bandpass', 4600, 4554, 45, 0.5 * k, dl + 0.004);
        snShimmer(2093, 0.4, 0.02 * k, dl + 0.01);
        });
    },
    crit: (r, k, dl) => {
        wet(0.3, () => {
        snNoise(0.012, 'highpass', 6500, 10000, 0.5, 0.2 * k, dl);
        snNoise(0.06, 'bandpass', 3000 * r, 1200, 1.1, 0.28 * k, dl);
        snTone(130 * r, 45, 0.14, 'sine', 0.3 * k, dl);
        snNoise(0.12, 'lowpass', 1400, 200, 0.8, 0.2 * k, dl);
        snNoise(0.5, 'bandpass', 4600, 4554, 45, 0.5 * k, dl + 0.004);
        snShimmer(2093, 0.4, 0.02 * k, dl + 0.01);
        snNoise(0.35, 'bandpass', 1500, 10000, 5, 0.2 * k, dl);
        snTone(65, 28, 0.45, 'sine', 0.4 * k, dl);
        snNoise(0.9, 'bandpass', 3500, 3465, 45, 0.7 * k, dl + 0.03);
        snShimmer(2637, 0.7, 0.04 * k, dl + 0.04);
        });
    },
  },
  // J · Dual Fang: Dalawang talim na magkasunod ang tama (28 ms). Perfect sa Assassin na dalawa ang dagger.
  J: {
    swing: (r, v) => {
        wet(0.1, () => {
        snNoise(0.008, 'highpass', 7000, 10000, 0.5, 0.07 * v);
        snNoise(0.07, 'bandpass', 2400 * r, 6800, 1.3, 0.18 * v);
        snNoise(0.12, 'bandpass', 5600, 5544, 45, 0.35 * v, 0.01);
        snNoise(0.008, 'highpass', 7000, 10000, 0.5, 0.07 * v, 0.03);
        snNoise(0.07, 'bandpass', 2900 * r, 6800, 1.3, 0.18 * v, 0.03);
        snNoise(0.12, 'bandpass', 6500, 6435, 45, 0.35 * v, 0.04);
        });
    },
    hit: (r, k, dl) => {
        wet(0.12, () => {
        snNoise(0.01, 'highpass', 6500, 10000, 0.5, 0.15 * k, dl);
        snNoise(0.05, 'bandpass', 3500 * r, 1700, 1.2, 0.22 * k, dl);
        snTone(150 * r, 55, 0.06, 'sine', 0.15 * k, dl);
        snNoise(0.2, 'bandpass', 4200, 4158, 45, 0.4 * k, dl + 0.003);
        snNoise(0.01, 'highpass', 6500, 10000, 0.5, 0.15 * k, dl + 0.028);
        snNoise(0.05, 'bandpass', 3200 * r, 1700, 1.2, 0.22 * k, dl + 0.028);
        snTone(130 * r, 55, 0.06, 'sine', 0.15 * k, dl + 0.028);
        snNoise(0.2, 'bandpass', 4900, 4851, 45, 0.4 * k, dl + 0.031);
        });
    },
    crit: (r, k, dl) => {
        wet(0.18, () => {
        snNoise(0.01, 'highpass', 6500, 10000, 0.5, 0.16 * k, dl);
        snNoise(0.05, 'bandpass', 3800 * r, 1700, 1.2, 0.24 * k, dl);
        snTone(150 * r, 55, 0.07, 'sine', 0.16 * k, dl);
        snNoise(0.01, 'highpass', 6500, 10000, 0.5, 0.16 * k, dl + 0.03);
        snNoise(0.05, 'bandpass', 3500 * r, 1700, 1.2, 0.24 * k, dl + 0.03);
        snTone(130 * r, 55, 0.07, 'sine', 0.16 * k, dl + 0.03);
        snNoise(0.01, 'highpass', 6500, 10000, 0.5, 0.16 * k, dl + 0.06);
        snNoise(0.05, 'bandpass', 3200 * r, 1700, 1.2, 0.24 * k, dl + 0.06);
        snTone(110 * r, 55, 0.07, 'sine', 0.16 * k, dl + 0.06);
        snNoise(0.7, 'bandpass', 3200, 3168, 45, 0.7 * k, dl + 0.04);
        snNoise(0.5, 'bandpass', 6800, 6732, 45, 0.5 * k, dl + 0.04);
        snTone(70, 28, 0.3, 'sine', 0.36 * k, dl + 0.06);
        });
    },
  },
};
function knifeFx(kind, r, vol, dl = 0) {
  const st = KNIFE_FX[KNIFE_STYLE];
  if (!st) return false;
  st[kind](r, vol, dl);
  return true;
}
// Bow shot sound. Styles: 'D' modern punchy shot (default), 'A' crisp hunting-bow, 'B' heavy war-bow, 'C' light fast.
const BOW_STYLE = 'D';
function bowShot(style, r, v, power, count) {
  if (style === 'D') {
    // modern: sub punch + clean crack + sleek tonal whip + resonant air sweep, all with a short reverb tail
    _wet = 0.22;
    snTone(95 * r, 42, 0.16, 'sine', 0.3 * v); // sub punch
    snNoise(0.012, 'highpass', 6000, 9000, 0.5, 0.16 * v); // crisp transient
    snNoise(0.045, 'bandpass', 2200 * r, 1400, 1.2, 0.26 * v); // snap
    snTone(2200 * r, 380, 0.1, 'triangle', 0.07 * v); // sleek "whip" sweep
    snTone(880 * r, 440, 0.07, 'sine', 0.05 * v, 0.004);
    snNoise(0.34, 'bandpass', 7500 * r, 1100, 5, 0.1 * v, 0.01); // resonant air sweep
    snNoise(0.22, 'lowpass', 1800, 300, 0.7, 0.07 * v, 0.03); // body of the whoosh
    if (power) {
      snTone(60, 35, 0.22, 'sine', 0.2 * v);
      snNoise(0.18, 'highpass', 5000, 9000, 0.6, 0.06 * v, 0.04);
    }
    _wet = 0;
  } else if (style === 'B') {
    snTone(110 * r, 55, 0.12, 'sine', 0.3 * v);
    snNoise(0.05, 'bandpass', 1100 * r, 500, 0.8, 0.3 * v);
    snPluck(240 * r, 0.3 * v, 0, 2500, 0.3);
    snTone(300 * r, 190, 0.18, 'triangle', 0.05 * v, 0.005);
    snNoise(0.3, 'bandpass', 4200 * r, 800, 2.5, 0.09 * v, 0.03);
  } else if (style === 'C') {
    snNoise(0.02, 'highpass', 4000, 7000, 0.5, 0.2 * v);
    snPluck(700 * r, 0.2 * v, 0, 5000, 0.12);
    snNoise(0.12, 'bandpass', 6000 * r, 2500, 3, 0.08 * v, 0.01);
  } else {
    snNoise(0.035, 'bandpass', 2800 * r, 1800, 1, 0.34 * v);
    snNoise(0.015, 'highpass', 5000, 8500, 0.5, 0.13 * v);
    snTone(260 * r, 140, 0.05, 'triangle', 0.13 * v);
    snPluck(520 * r, 0.26 * v, 0.002, 4500, 0.16);
    snNoise(0.17, 'bandpass', 4300 * r, 1800, 3, 0.09 * v, 0.015);
    if (power) snTone(150, 70, 0.1, 'sine', 0.12 * v);
  }
  // extra arrows (Double/Triple Shot, Volley...) whoosh one after another
  for (let i = 1; i < Math.min(count, 4); i++)
    snNoise(0.18, 'bandpass', (4800 - i * 300) * r, 1500, 3, 0.05 * v, 0.02 + i * 0.015);
}
// Swing / shot sound when you attack. kind = arc | nova | dash | proj | rain, power 0 (basic) .. 1 (skill).
function sfxSwing(weapon, kind, power = 0, count = 1) {
  sfxSafe(() => {
    const r = 0.95 + Math.random() * 0.1,
      v = 1.5 + 0.6 * power;
    if (kind === 'proj' && weapon === 'bow') return bowShot(BOW_STYLE, r, v, power, count);
    if (kind === 'arc' && weapon === 'knife' && knifeFx('swing', r, v)) return;
    wet(0.16, () => {
      if (kind === 'proj') {
        if (weapon === 'knife') {
          // thrown blade: sleek tonal whirr
          snNoise(0.012, 'highpass', 6500, 9000, 0.5, 0.12 * v);
          snNoise(0.14, 'bandpass', 2600 * r, 7600, 2, 0.12 * v);
          snTone(1800 * r, 3400, 0.12, 'triangle', 0.04 * v);
        } else {
          // energy wave: sub pulse + rising sheen + air
          snTone(120 * r, 55, 0.14, 'sine', 0.2 * v);
          snNoise(0.016, 'highpass', 5500, 9000, 0.5, 0.12 * v);
          snNoise(0.22, 'bandpass', 700 * r, 5200, 2.2, 0.13 * v);
          snTone(500 * r, 1900, 0.2, 'triangle', 0.05 * v);
          snShimmer(1760 * r, 0.22, 0.012 * v, 0.03);
        }
      } else if (kind === 'rain') {
        snNoise(0.5, 'bandpass', 7000, 1500, 4, 0.07 * v); // downward air sweep
        snTone(2800 * r, 700, 0.45, 'sine', 0.025 * v);
        snTone(80, 45, 0.3, 'sine', 0.12 * v, 0.05);
      } else if (kind === 'dash') {
        snTone(130, 55, 0.2, 'sine', 0.2 * v);
        snNoise(0.26, 'bandpass', 300 * r, 4600, 1.6, 0.19 * v);
        snTone(400 * r, 1700, 0.2, 'triangle', 0.045 * v);
        if (weapon === 'knife') snNoise(0.12, 'highpass', 5000, 9500, 0.6, 0.07 * v, 0.05);
      } else if (kind === 'nova') {
        if (weapon === 'knife') {
          // a flurry of crisp swishes with rising pitch
          for (let i = 0; i < 4; i++) {
            snNoise(0.012, 'highpass', 7000, 10000, 0.5, 0.07 * v, i * 0.05);
            snNoise(0.07, 'bandpass', (2800 + i * 500) * r, 7000, 1.5, 0.1 * v, i * 0.05);
          }
        } else {
          snTone(100 * r, 40, 0.3, 'sine', 0.26 * v); // sub boom
          snNoise(0.28, 'bandpass', 500 * r, 4200, 1.4, 0.17 * v);
          snNoise(0.22, 'bandpass', 4200, 800, 1.2, 0.1 * v, 0.1);
          snTone(300 * r, 1400, 0.25, 'triangle', 0.05 * v);
          snShimmer(1568 * r, 0.3, 0.014 * v, 0.06);
        }
      } else if (weapon === 'knife') {
        // quick modern "shff"
        snNoise(0.012, 'highpass', 6500, 9500, 0.5, 0.1 * v);
        snNoise(0.085, 'bandpass', 3000 * r, 7600, 1.5, (0.22 + 0.04 * power) * v);
        snTone(1800 * r, 3000, 0.07, 'triangle', 0.03 * v);
      } else if (weapon === 'sword') {
        // modern whoosh: soft sub push, rising then falling air, tonal sheen
        snTone(110 * r, 60, 0.12, 'sine', 0.12 * v);
        snNoise(0.12, 'bandpass', 500 * r, 3400, 1.2, 0.17 * v);
        snNoise(0.16, 'bandpass', 3400, 900, 1.1, 0.1 * v, 0.06);
        snTone(700 * r, 2200, 0.1, 'triangle', 0.03 * v * (1 + power));
      } else {
        snNoise(0.1, 'bandpass', 900 * r, 2400, 1.3, 0.08 * v);
      }
    });
  });
}
// Sound of a hit landing on an enemy, by weapon. o = { crit, poison, stun }.
function sfxHit(weapon, o = {}) {
  if (muted) return;
  // many enemies hit in the same instant (AoE): only the first few get a sound
  // (counted from the FIRST hit of the burst, so a fast Assassin combo never silences itself; crits always play)
  const now = performance.now();
  if (now - _hitG < 40) _hitN++;
  else {
    _hitG = now;
    _hitN = 0;
  }
  if (_hitN >= 3 && !o.crit) return;
  sfxSafe(() => {
    const k = _hitN && !o.crit ? 0.6 : 1,
      r = 0.94 + Math.random() * 0.12;
    wet(0.2, () => {
      if (o.crit && knifeFx('crit', r, k, 0.03)) {
        // every class (knife, sword, bow) shares the same new crit sound (KNIFE_FX[KNIFE_STYLE].crit)
      } else if (weapon === 'knife' && knifeFx('hit', r, k, 0.03)) {
        // new knife hit sound (see KNIFE_FX)
      } else if (weapon === 'knife') {
        knifeCut(r, k);
        if (o.crit) {
          // double slice + bright rising zap + sparkle
          knifeCut(r * 1.1, k, 0.045);
          snNoise(0.22, 'bandpass', 4000, 11000, 6, 0.15 * k, 0.02);
          snTone(1200, 3600, 0.16, 'sine', 0.06 * k, 0.03);
          snShimmer(2637 * r, 0.4, 0.03 * k, 0.04);
          snTone(160, 55, 0.14, 'sine', 0.2 * k);
        }
      } else if (weapon === 'sword') {
        // modern slash: crack + sub punch + tonal slash sweep + clean shimmer
        snNoise(0.012, 'highpass', 5000, 9000, 0.5, 0.22 * k);
        snNoise(0.07, 'bandpass', 1800 * r, 700, 1, 0.24 * k);
        snTone(130 * r, 48, 0.12, 'sine', 0.3 * k);
        snTone(2800 * r, 600, 0.09, 'triangle', 0.07 * k);
        snShimmer(1320 * r, 0.22, 0.02 * k, 0.01);
        if (o.crit) {
          // heavy cinematic impact: big sub, riser zap, long shimmer tail
          snTone(70, 28, 0.35, 'sine', 0.38 * k);
          snNoise(0.04, 'highpass', 3500, 8000, 0.6, 0.3 * k, 0.02);
          snNoise(0.32, 'bandpass', 1800, 9500, 5, 0.2 * k);
          snTone(900, 3800, 0.22, 'sawtooth', 0.025 * k, 0.01);
          snNoise(0.2, 'lowpass', 1200, 150, 0.8, 0.2 * k);
          snShimmer(1976 * r, 0.7, 0.045 * k, 0.03);
        }
      } else {
        // arrow impact: tight sub thump + dry click + short tonal "pop"
        snTone(150 * r, 55, 0.1, 'sine', 0.3 * k);
        snNoise(0.015, 'highpass', 4500, 8000, 0.5, 0.15 * k);
        snNoise(0.05, 'bandpass', 1500, 600, 1, 0.16 * k);
        snTone(1000 * r, 380, 0.07, 'sine', 0.06 * k, 0.004);
        if (o.crit) {
          snTone(75, 30, 0.3, 'sine', 0.32 * k);
          snNoise(0.12, 'lowpass', 1500, 200, 0.8, 0.18 * k);
          snTone(1400, 3200, 0.14, 'sine', 0.05 * k, 0.02);
          snShimmer(2093 * r, 0.45, 0.035 * k, 0.02);
        }
      }
      if (o.poison) {
        // toxic bubbly blips
        snTone(380, 880, 0.09, 'sine', 0.06 * k, 0.03);
        snTone(520, 1200, 0.08, 'sine', 0.05 * k, 0.09);
        snNoise(0.12, 'bandpass', 1200, 3000, 4, 0.04 * k, 0.04);
      }
      if (o.stun) {
        // electric zap
        snTone(1800, 140, 0.16, 'sawtooth', 0.04 * k);
        snNoise(0.12, 'bandpass', 3500, 900, 3, 0.1 * k);
        snTone(90, 45, 0.18, 'sine', 0.16 * k);
      }
    });
  });
}
/* ---- Player takes damage / dodges ---- boss = heavier hit */
function sfxHurt(boss) {
  sfxSafe(() => {
    const r = 0.94 + Math.random() * 0.12,
      k = boss ? 1.5 : 1;
    wet(0.18, () => {
      snTone(115 * r, 42, 0.18, 'sine', 0.34 * k); // body thump
      snNoise(0.014, 'highpass', 3500, 7000, 0.5, 0.18 * k); // impact click
      snNoise(0.1, 'lowpass', 1800, 250, 0.9, 0.2 * k); // flesh/armor crunch
      snTone(420 * r, 150, 0.1, 'triangle', 0.07 * k, 0.005); // pained pitch drop
      if (boss) {
        snTone(60, 28, 0.35, 'sine', 0.3);
        snNoise(0.25, 'lowpass', 900, 120, 0.8, 0.2, 0.02);
      }
    });
  });
}
function sfxDodge() {
  sfxSafe(() => {
    wet(0.2, () => {
      snNoise(0.16, 'bandpass', 1200, 6000, 2, 0.1);
      snTone(1100, 2200, 0.1, 'sine', 0.05);
      snTone(1650, 3000, 0.08, 'sine', 0.025, 0.04);
    });
  });
}
/* ---- Monster defeated: boss gets a bigger, longer one ---- */
function sfxMobDie(boss) {
  sfxSafe(() => {
    const r = 0.95 + Math.random() * 0.1,
      k = boss ? 1.6 : 1;
    wet(boss ? 0.35 : 0.22, () => {
      snTone(520 * r, 90, 0.26 * k, 'sine', 0.1 * k); // descending "pwoom"
      snTone(110, 36, 0.3 * k, 'sine', 0.3 * k); // sub drop
      snNoise(0.3 * k, 'lowpass', 3000, 250, 0.8, 0.16 * k); // dissolve
      snNoise(0.014, 'highpass', 5000, 9000, 0.5, 0.12 * k);
      snNotes([1568 * r, 2093 * r, 2637 * r], 0.045, 0.2, 0.025 * k, 'sine', 0.08); // sparkle
      if (boss) {
        snTone(55, 26, 0.7, 'sine', 0.3);
        snShimmer(880, 0.9, 0.04, 0.12);
      }
    });
  });
}
/* ---- Progression / items ---- */
function sfxLevelUp() {
  sfxSafe(() => {
    wet(0.3, () => {
      snNotes([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.07, 0.45, 0.06, 'triangle');
      snNotes([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.07, 0.45, 0.025, 'sine', 0.012);
      snTone(110, 55, 0.4, 'sine', 0.22);
      snNoise(0.7, 'bandpass', 1500, 9000, 3, 0.05, 0.05); // riser
      snShimmer(2093, 0.9, 0.03, 0.3);
    });
  });
}
function sfxJobAdvance() {
  sfxSafe(() => {
    wet(0.4, () => {
      snTone(65, 33, 0.9, 'sine', 0.3);
      snNotes([392, 523.25, 659.25, 783.99, 1046.5, 1568], 0.09, 0.8, 0.055, 'triangle');
      [523.25, 659.25, 783.99].forEach((f) => snTone(f, f, 1.3, 'sine', 0.03, 0.5)); // sustained chord
      snNoise(1, 'bandpass', 800, 10000, 2.5, 0.06);
      snShimmer(2093, 1.3, 0.04, 0.5);
    });
  });
}
function sfxBuff() {
  sfxSafe(() => {
    wet(0.26, () => {
      snTone(300, 1400, 0.25, 'triangle', 0.05); // rising sweep
      snNotes([659.25, 880, 1318.5], 0.06, 0.34, 0.05, 'sine', 0.04);
      snNoise(0.3, 'highpass', 5000, 9500, 0.5, 0.035, 0.06);
      snTone(90, 60, 0.2, 'sine', 0.12);
    });
  });
}
function sfxPotion() {
  sfxSafe(() => {
    wet(0.15, () => {
      snTone(280, 640, 0.08, 'sine', 0.08); // gulp
      snTone(330, 760, 0.08, 'sine', 0.07, 0.09);
      snNotes([1318.5, 1760], 0.06, 0.25, 0.03, 'sine', 0.18);
    });
  });
}
function sfxHeal() {
  sfxSafe(() => {
    wet(0.3, () => {
      snNotes([523.25, 659.25, 783.99, 1046.5], 0.08, 0.5, 0.045, 'sine');
      snShimmer(1568, 0.7, 0.02, 0.2);
      snNoise(0.5, 'highpass', 5000, 9000, 0.5, 0.025, 0.05);
    });
  });
}
function sfxBoom() {
  sfxSafe(() => {
    wet(0.3, () => {
      snTone(80, 28, 0.5, 'sine', 0.42); // deep sub
      snNoise(0.012, 'highpass', 4000, 8000, 0.5, 0.2);
      snNoise(0.45, 'lowpass', 2200, 120, 0.8, 0.3);
      snTone(600, 120, 0.2, 'triangle', 0.06);
      snNoise(0.3, 'bandpass', 5000, 900, 2, 0.06, 0.04);
    });
  });
}
function sfxArrowLand() {
  sfxSafe(() => {
    wet(0.15, () => {
      snTone(130 * (0.9 + Math.random() * 0.2), 50, 0.1, 'sine', 0.16);
      snNoise(0.015, 'highpass', 4000, 7000, 0.5, 0.07);
      snNoise(0.05, 'bandpass', 1400, 500, 1, 0.07);
    });
  });
}
/* ---- UI: dialogs, shop, upgrades ---- */
function sfxClick() {
  sfxSafe(() => {
    wet(0.12, () => {
      snTone(1400, 900, 0.04, 'sine', 0.07);
      snNoise(0.01, 'highpass', 6000, 9000, 0.5, 0.05);
    });
  });
}
function sfxBuy() {
  sfxSafe(() => {
    wet(0.2, () => {
      snNotes([1568, 2093], 0.06, 0.22, 0.05, 'sine');
      snNoise(0.12, 'highpass', 6000, 10000, 0.5, 0.03, 0.04);
    });
  });
}
function sfxDeny() {
  sfxSafe(() => {
    wet(0.12, () => {
      snTone(300, 220, 0.09, 'triangle', 0.08);
      snTone(240, 170, 0.12, 'triangle', 0.08, 0.09);
    });
  });
}
function sfxUpgrade() {
  sfxSafe(() => {
    wet(0.25, () => {
      snTone(90, 45, 0.25, 'sine', 0.3);
      snNoise(0.012, 'highpass', 4500, 8000, 0.5, 0.15);
      snTone(500, 1800, 0.25, 'triangle', 0.05, 0.03);
      snShimmer(1568, 0.5, 0.035, 0.1);
    });
  });
}
function sfxPoint() {
  sfxSafe(() => {
    wet(0.15, () => snNotes([880, 1320], 0.05, 0.16, 0.05, 'sine'));
  });
}
function sfxWelcome() {
  sfxSafe(() => {
    wet(0.3, () => {
      snNotes([659.25, 987.77], 0.1, 0.5, 0.045, 'sine');
      snShimmer(1318.5, 0.6, 0.02, 0.1);
    });
  });
}
/* ---- Equipment / pets ---- */
function sfxEquip() {
  sfxSafe(() => {
    wet(0.2, () => {
      snTone(180, 80, 0.1, 'sine', 0.22); // clunk
      snNoise(0.012, 'highpass', 5000, 9000, 0.5, 0.12);
      snNoise(0.05, 'bandpass', 2400, 1200, 1.5, 0.1);
      snShimmer(1760, 0.3, 0.025, 0.04);
    });
  });
}
function sfxSell() {
  sfxSafe(() => {
    wet(0.15, () => {
      snNotes([2093, 1568], 0.06, 0.2, 0.04, 'sine');
      snNoise(0.1, 'highpass', 6000, 10000, 0.5, 0.025, 0.03);
    });
  });
}
function sfxSummon() {
  sfxSafe(() => {
    wet(0.3, () => {
      snTone(300, 1500, 0.22, 'triangle', 0.05);
      snNotes([880, 1174.7, 1568], 0.06, 0.3, 0.04, 'sine', 0.05);
      snTone(110, 55, 0.2, 'sine', 0.18);
      snNoise(0.25, 'highpass', 5500, 9500, 0.5, 0.03, 0.05);
    });
  });
}
function sfxPetBite() {
  sfxSafe(() => {
    wet(0.12, () => {
      snNoise(0.01, 'highpass', 6000, 9000, 0.5, 0.1);
      snNoise(0.04, 'bandpass', 2600, 1400, 1.4, 0.12);
      snTone(900, 420, 0.05, 'triangle', 0.05);
      snTone(120, 60, 0.06, 'sine', 0.1);
    });
  });
}
document.addEventListener('visibilitychange', () => {
  if (!AC) return;
  try {
    if (document.hidden) AC.suspend();
    else AC.resume();
  } catch (e) {}
});
/* ---- footsteps ----
 * Synthesized like everything else: one recipe per ground (grass, stone, wood, tile, sand, snow, mud, rock),
 * shaped per class (the Knight stomps and clinks, the Assassin is nearly silent, the light classes tap), with a
 * little random pitch / volume every step and a slightly different pitch for the left and right foot.
 * STEP_VOL is the loudness of footsteps relative to the other effects (0 = off). */
let STEP_VOL = 0.8,
  _stepT = 0;
const STEP_CLASS = {
  waif: { v: 0.8, p: 1.12 },
  assassin: { v: 0.42, p: 1.0 },
  swordsman: { v: 1, p: 1 },
  knight: { v: 1.35, p: 0.82, clink: 1 },
  archer: { v: 0.8, p: 1.08 },
  ranger: { v: 0.65, p: 0.98 },
};
function sfxStep(surface = 'grass', job = 'swordsman', foot = 0, vol = 1) {
  if (!STEP_VOL) return;
  sfxSafe(() => {
    const now = AC.currentTime;
    if (now - _stepT < 0.05) return; // never stack two footsteps
    _stepT = now;
    const C = STEP_CLASS[job] || STEP_CLASS.swordsman,
      pv = C.p * (foot ? 1.06 : 0.94) * (0.93 + Math.random() * 0.14),
      k = vol * C.v * STEP_VOL * (0.85 + Math.random() * 0.3);
    wet(surface === 'stone' || surface === 'tile' ? 0.1 : 0.03, () => {
      if (surface === 'stone') {
        snTone(150 * pv, 70, 0.07, 'sine', 0.13 * k);
        snNoise(0.035, 'bandpass', 2200 * pv, 1200, 1.2, 0.09 * k);
        snNoise(0.012, 'highpass', 5000, 7000, 0.5, 0.03 * k);
      } else if (surface === 'tile') {
        snTone(190 * pv, 90, 0.06, 'sine', 0.11 * k);
        snNoise(0.03, 'bandpass', 3000 * pv, 1800, 2.5, 0.1 * k);
        snTone(1400 * pv, 1100 * pv, 0.05, 'sine', 0.018 * k);
      } else if (surface === 'wood') {
        snTone(120 * pv, 60, 0.09, 'sine', 0.15 * k);
        snNoise(0.06, 'bandpass', 900 * pv, 500, 1, 0.09 * k);
      } else if (surface === 'sand') {
        snNoise(0.12, 'lowpass', 2200 * pv, 1200, 0.7, 0.06 * k);
        snNoise(0.09, 'bandpass', 1500 * pv, 1000, 0.4, 0.05 * k);
      } else if (surface === 'snow') {
        snNoise(0.05, 'bandpass', 3200 * pv, 1800, 2.2, 0.07 * k);
        snNoise(0.045, 'bandpass', 4600 * pv, 2800, 2.5, 0.055 * k, 0.035);
        snTone(100 * pv, 60, 0.05, 'sine', 0.05 * k);
      } else if (surface === 'mud') {
        snTone(110 * pv, 170 * pv, 0.1, 'sine', 0.09 * k);
        snNoise(0.1, 'bandpass', 450 * pv, 900, 2, 0.09 * k);
      } else if (surface === 'rock') {
        snTone(110 * pv, 60, 0.1, 'sine', 0.13 * k);
        snNoise(0.06, 'bandpass', 1500 * pv, 700, 1.5, 0.08 * k);
        snNoise(0.02, 'highpass', 4500, 6500, 0.5, 0.03 * k);
      } else {
        // grass: soft brush + muffled thud
        snNoise(0.09, 'bandpass', 3800 * pv, 2500, 0.5, 0.06 * k);
        snNoise(0.06, 'lowpass', 500 * pv, 300, 0.7, 0.05 * k);
        snTone(90 * pv, 55, 0.06, 'sine', 0.05 * k);
      }
      if (C.clink) {
        // armored boots: a short metallic "clink" on top
        snTone(2300 * pv, 1700 * pv, 0.05, 'sine', 0.018 * k);
        snNoise(0.02, 'highpass', 6000, 8000, 0.5, 0.025 * k);
      }
    });
  });
}
function saveAudio() {
  try {
    localStorage.setItem('aldenmoor_audio', JSON.stringify({ muted, musicOn, sfxVol, musVol }));
  } catch (e) {}
}
function loadAudio() {
  try {
    const a = JSON.parse(localStorage.getItem('aldenmoor_audio'));
    if (a) {
      muted = !!a.muted;
      musicOn = a.musicOn !== false;
      if (Number.isFinite(+a.sfxVol)) sfxVol = Math.min(1, Math.max(0, +a.sfxVol));
      if (Number.isFinite(+a.musVol)) musVol = Math.min(1, Math.max(0, +a.musVol));
    }
  } catch (e) {}
}
