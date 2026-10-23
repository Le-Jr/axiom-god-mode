// Procedural placeholders: the game is never silent, even with no audio files (AUDIO.md).
// A recipe schedules one-shot nodes starting at `t` into `out` and returns its duration (s).

export type SfxRecipe = (ac: AudioContext, out: AudioNode, t: number, pitch: number) => number;

export interface LoopHandle {
  setPitch(mult: number): void;
  stop(fade: number): void;
}

export type LoopRecipe = (ac: AudioContext, out: AudioNode) => LoopHandle;

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(ac: AudioContext): AudioBuffer {
  let buf = noiseBuffers.get(ac);
  if (!buf) {
    buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ac, buf);
  }
  return buf;
}

function envGain(ac: AudioContext, out: AudioNode, t: number, peak: number, attack: number, release: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  g.connect(out);
  return g;
}

function noise(ac: AudioContext, t: number, duration: number): AudioBufferSourceNode {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  src.loop = true;
  src.start(t, Math.random() * 0.5);
  src.stop(t + duration);
  return src;
}

export const auraPulse: SfxRecipe = (ac, out, t, pitch) => {
  const thump = ac.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(120 * pitch, t);
  thump.frequency.exponentialRampToValueAtTime(55 * pitch, t + 0.25);
  thump.connect(envGain(ac, out, t, 0.5, 0.01, 0.3));
  thump.start(t);
  thump.stop(t + 0.35);

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400 * pitch;
  bp.Q.value = 4;
  bp.connect(envGain(ac, out, t, 0.12, 0.005, 0.12));
  noise(ac, t, 0.15).connect(bp);
  return 0.36;
};

export const beamCharge: SfxRecipe = (ac, out, t, pitch) => {
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220 * pitch, t);
  osc.frequency.exponentialRampToValueAtTime(880 * pitch, t + 0.2);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.18);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  g.connect(out);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.32);
  return 0.32;
};

export const beamTail: SfxRecipe = (ac, out, t, pitch) => {
  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(520 * pitch, t);
  osc.frequency.exponentialRampToValueAtTime(70 * pitch, t + 0.28);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3000, t);
  lp.frequency.exponentialRampToValueAtTime(300, t + 0.28);
  lp.connect(envGain(ac, out, t, 0.25, 0.005, 0.3));
  osc.connect(lp);
  osc.start(t);
  osc.stop(t + 0.32);
  return 0.32;
};

export const beamEmpty: SfxRecipe = (ac, out, t, pitch) => {
  for (let i = 0; i < 2; i++) {
    const s = t + i * 0.09;
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime((i === 0 ? 440 : 294) * pitch, s);
    osc.connect(envGain(ac, out, s, 0.12, 0.004, 0.07));
    osc.start(s);
    osc.stop(s + 0.09);
  }
  return 0.2;
};

/** Reality tear: a reversed noise swell that snaps into a collapsing sweep. */
export const eraseTear: SfxRecipe = (ac, out, t, pitch) => {
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(1200 * pitch, t);
  hp.frequency.exponentialRampToValueAtTime(5000 * pitch, t + 0.14);
  const swell = ac.createGain();
  swell.gain.setValueAtTime(0.0001, t);
  swell.gain.exponentialRampToValueAtTime(0.35, t + 0.14);
  swell.gain.setValueAtTime(0.0001, t + 0.145);
  hp.connect(swell).connect(out);
  noise(ac, t, 0.16).connect(hp);

  const s = t + 0.14;
  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1600 * pitch, s);
  osc.frequency.exponentialRampToValueAtTime(50 * pitch, s + 0.35);
  osc.connect(envGain(ac, out, s, 0.3, 0.005, 0.38));
  osc.start(s);
  osc.stop(s + 0.4);
  return 0.56;
};

export const explosionSmall: SfxRecipe = (ac, out, t, pitch) => {
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800 * pitch, t);
  lp.frequency.exponentialRampToValueAtTime(200, t + 0.4);
  lp.connect(envGain(ac, out, t, 0.45, 0.004, 0.45));
  noise(ac, t, 0.5).connect(lp);

  const thump = ac.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(90 * pitch, t);
  thump.frequency.exponentialRampToValueAtTime(40, t + 0.3);
  thump.connect(envGain(ac, out, t, 0.5, 0.004, 0.32));
  thump.start(t);
  thump.stop(t + 0.36);
  return 0.5;
};

/** Continuous aura hum: detuned sines + soft triangle, slow tremolo. */
export const auraHum: LoopRecipe = (ac, out) => {
  const base = 55;
  const g = ac.createGain();
  g.gain.value = 0.0001;
  g.gain.setTargetAtTime(0.22, ac.currentTime, 0.5);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  lp.connect(g).connect(out);

  const oscs = [ac.createOscillator(), ac.createOscillator(), ac.createOscillator()];
  const ratios = [1, 1.007, 2];
  oscs[2].type = 'triangle';
  for (let i = 0; i < oscs.length; i++) {
    oscs[i].frequency.value = base * ratios[i];
    oscs[i].connect(lp);
    oscs[i].start();
  }
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 0.5;
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain).connect(g.gain);
  lfo.start();

  return {
    setPitch(mult) {
      for (let i = 0; i < oscs.length; i++) oscs[i].frequency.setTargetAtTime(base * ratios[i] * mult, ac.currentTime, 0.3);
    },
    stop(fade) {
      const end = ac.currentTime + fade;
      g.gain.setTargetAtTime(0.0001, ac.currentTime, fade / 4);
      for (const o of oscs) o.stop(end + 0.05);
      lfo.stop(end + 0.05);
    },
  };
};

/** Beam channel loop: buzzing detuned saws through a wobbling filter, plus a hiss. */
export const beamLoop: LoopRecipe = (ac, out) => {
  const g = ac.createGain();
  g.gain.value = 0.0001;
  g.gain.setTargetAtTime(0.18, ac.currentTime, 0.04);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1500;
  lp.Q.value = 6;
  lp.connect(g).connect(out);

  const oscs = [ac.createOscillator(), ac.createOscillator()];
  const ratios = [1, 1.006];
  for (let i = 0; i < oscs.length; i++) {
    oscs[i].type = 'sawtooth';
    oscs[i].frequency.value = 110 * ratios[i];
    oscs[i].connect(lp);
    oscs[i].start();
  }
  const wobble = ac.createOscillator();
  const wobbleGain = ac.createGain();
  wobble.frequency.value = 7;
  wobbleGain.gain.value = 500;
  wobble.connect(wobbleGain).connect(lp.frequency);
  wobble.start();

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3200;
  bp.Q.value = 1.5;
  const hissGain = ac.createGain();
  hissGain.gain.value = 0.25;
  bp.connect(hissGain).connect(g);
  const hiss = ac.createBufferSource();
  hiss.buffer = noiseBuffer(ac);
  hiss.loop = true;
  hiss.connect(bp);
  hiss.start();

  return {
    setPitch(mult) {
      for (let i = 0; i < oscs.length; i++) oscs[i].frequency.setTargetAtTime(110 * ratios[i] * mult, ac.currentTime, 0.05);
    },
    stop(fade) {
      const end = ac.currentTime + fade;
      g.gain.setTargetAtTime(0.0001, ac.currentTime, fade / 4);
      for (const o of oscs) o.stop(end + 0.05);
      wobble.stop(end + 0.05);
      hiss.stop(end + 0.05);
    },
  };
};
