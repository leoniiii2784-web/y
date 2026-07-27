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
  // Aplastar a la competencia: golpe grave y corto ("splat") + un
  // chillido agudo descendente justo después, tipo caricatura de algo
  // siendo aplastado — no solo un "thump" genérico.
  stomp: (ac) => {
    tone(ac, { freq: 150, endFreq: 35, type: 'sine', duration: 0.11, gain: 0.28 });
    noiseBurst(ac, { duration: 0.14, gain: 0.22, filterFreq: 350 });
    tone(ac, { freq: 950, endFreq: 220, type: 'sawtooth', duration: 0.09, gain: 0.05, start: 0.03 });
  },
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

// ── Música ambiental (pad continuo, no melodía) ──
// Un acorde sostenido con filtro modulado lentamente — tono profesional
// de fondo, no una melodía que se vuelva repetitiva/molesta. Distinta
// nota raíz por escenario para variar un poco mientras no haya pistas
// reales por escenario.
const THEME_ROOT = { warehouse: 110, factory: 98, retail: 123, menu: 110 };
let musicNodes = null;

function startPad(ac, rootFreq) {
  const master = ac.createGain();
  master.gain.setValueAtTime(0, ac.currentTime);
  master.gain.linearRampToValueAtTime(0.05, ac.currentTime + 2.5);
  master.connect(ac.destination);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  filter.Q.value = 0.7;
  filter.connect(master);

  const oscs = [1, 1.5, 2].map((ratio, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.value = rootFreq * ratio;
    osc.detune.value = (Math.random() - 0.5) * 6;
    const g = ac.createGain();
    g.gain.value = i === 0 ? 0.55 : 0.3;
    osc.connect(g).connect(filter);
    osc.start();
    return osc;
  });

  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 260;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  return { master, filter, oscs, lfo };
}

function stopPad(ac, nodes) {
  if (!nodes) return;
  const now = ac.currentTime;
  nodes.master.gain.cancelScheduledValues(now);
  nodes.master.gain.setValueAtTime(nodes.master.gain.value, now);
  nodes.master.gain.linearRampToValueAtTime(0, now + 1);
  setTimeout(() => {
    nodes.oscs.forEach(o => { try { o.stop(); } catch { /* ya detenido */ } });
    try { nodes.lfo.stop(); } catch { /* ya detenido */ }
  }, 1100);
}

export function playMusicSynth(theme) {
  try {
    const ac = getCtx();
    stopPad(ac, musicNodes);
    musicNodes = startPad(ac, THEME_ROOT[theme] || 110);
  } catch { /* audio no disponible en este navegador/contexto */ }
}

export function stopMusicSynth() {
  if (!ctx || !musicNodes) return;
  stopPad(ctx, musicNodes);
  musicNodes = null;
}
