// ════════════════════════════════════════════════════════════════
// STATE — estado de partida + manejo de indicadores comerciales.
// Lógica heredada de v4 (gs.ind, applyInd, clientsDone, etc.), ahora
// desacoplada del DOM directo para que la UI (ui.js) y las escenas
// de Phaser puedan leerla/observarla sin duplicar cálculos.
// ════════════════════════════════════════════════════════════════
import { PROFILES, CLIENTS } from './data.js';

export const gs = {
  phase: 'customize', // customize | warn | playing | card | dialogue | feedback | result | over
  ind: { rent: 100, rel: 100, rep: 100 },
  clientIdx: 0,
  exchIdx: 0,
  clientsDone: [],
  elapsed: 0,
  timerInt: null,
  name: 'Comercial',
  skinIdx: 0,
  profileIdx: 0,
  // Deltas acumulados del cliente actual (para la pantalla de resultado)
  cRent: 0, cRel: 0, cRep: 0,
  // Historial completo para el reporte descargable
  startedAt: null,
  clientLog: [], // [{clientId, name, exchanges:[{text, choice, rent, rel, rep}], finalDeltas}]
};

const listeners = new Set();
export function onIndicatorChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach(fn => fn(gs.ind)); }

export function applyInd(dr, drl, dp) {
  gs.ind.rent = Math.max(0, Math.min(100, gs.ind.rent + dr));
  gs.ind.rel = Math.max(0, Math.min(100, gs.ind.rel + drl));
  gs.ind.rep = Math.max(0, Math.min(100, gs.ind.rep + dp));
  gs.cRent += dr; gs.cRel += drl; gs.cRep += dp;
  notify();
}

export function indicatorsCritical() {
  return gs.ind.rent <= 0 || gs.ind.rel <= 0 || gs.ind.rep <= 0;
}

export function resetGame() {
  gs.phase = 'customize';
  gs.ind = { rent: 100, rel: 100, rep: 100 };
  gs.clientIdx = 0;
  gs.exchIdx = 0;
  gs.clientsDone = [];
  gs.elapsed = 0;
  gs.cRent = 0; gs.cRel = 0; gs.cRep = 0;
  gs.clientLog = [];
  gs.startedAt = null;
}

export function beginClientLog() {
  gs.clientLog.push({
    clientId: gs.clientIdx,
    name: CLIENTS[gs.clientIdx].name,
    type: CLIENTS[gs.clientIdx].type,
    exchanges: [],
    finalDeltas: null,
  });
}

export function logExchange(text, opt) {
  const entry = gs.clientLog[gs.clientLog.length - 1];
  entry.exchanges.push({
    text,
    choice: opt.t,
    rent: opt.rent, rel: opt.rel, rep: opt.rep,
  });
}

export function closeClientLog() {
  const entry = gs.clientLog[gs.clientLog.length - 1];
  entry.finalDeltas = { rent: gs.cRent, rel: gs.cRel, rep: gs.cRep };
}

export function currentProfile() {
  return PROFILES[gs.profileIdx];
}

export function currentClient() {
  return CLIENTS[gs.clientIdx];
}
