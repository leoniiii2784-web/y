// ════════════════════════════════════════════════════════════════
// SYNTH AUDIO — efectos de sonido generados por código (Web Audio API).
// ════════════════════════════════════════════════════════════════
// Mientras no exista un banco de audio real (ver assets/audio/README.md),
// generamos los efectos por código para que el juego no quede mudo.
// SoundManager usa esto como respaldo: si más adelante se sueltan
// archivos reales con las claves de audioManifest.js, esos archivos
// tienen prioridad automáticamente y este synth deja de sonar para esa
// clave — no hay que tocar código en ningún caso.
let ctx = null;
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(ac, { freq = 440, endFreq = null, type = 'sine', start = 0, duration = 0.15, gain = 0.18, gainEnd = 0.0001 }) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ac.currentTime + start + duration);
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gainEnd, ac.currentTime + start + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

function noiseBurst(ac, { start = 0, duration = 0.12, gain = 0.15, filterFreq = 1200 }) {
  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(ac.currentTime + start);
}

const SYNTH = {
  jump: (ac) => tone(ac, { freq: 260, endFreq: 620, type: 'triangle', duration: 0.14, gain: 0.16 }),
  move: (ac) => tone(ac, { freq: 140, endFreq: 90, type: 'square', duration: 0.05, gain: 0.06 }),
  stomp: (ac) => { tone(ac, { freq: 180, endFreq: 60, type: 'sine', duration: 0.16, gain: 0.22 }); noiseBurst(ac, { duration: 0.08, gain: 0.12, filterFreq: 800 }); },
  hit: (ac) => { noiseBurst(ac, { duration: 0.18, gain: 0.22, filterFreq: 500 }); tone(ac, { freq: 140, endFreq: 70, type: 'sawtooth', duration: 0.2, gain: 0.14 }); },
  cloud: (ac) => tone(ac, { freq: 700, endFreq: 1100, type: 'sine', duration: 0.1, gain: 0.1 }),
  answer: (ac) => { tone(ac, { freq: 520, type: 'sine', duration: 0.12, gain: 0.14 }); tone(ac, { freq: 780, type: 'sine', duration: 0.16, gain: 0.12, start: 0.09 }); },
  uiSelect: (ac) => tone(ac, { freq: 440, endFreq: 660, type: 'triangle', duration: 0.08, gain: 0.1 }),
};

export function playSynth(key) {
  const fn = SYNTH[key];
  if (!fn) return;
  try { fn(getCtx()); } catch { /* audio no disponible en este navegador/contexto */ }
}
