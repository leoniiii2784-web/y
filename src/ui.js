import { SKINS, PROFILES, CLIENTS } from './data.js';
import {
  gs, applyInd, onIndicatorChange, resetGame, indicatorsCritical,
  beginClientLog, logExchange, closeClientLog, currentProfile, currentClient,
} from './state.js';
import { bus } from './bus.js';
import { downloadReport } from './report.js';
import { touch } from './touchInput.js';

let playScene = null;

function $(id) { return document.getElementById(id); }

// ════════════════════════════════════════════
// HUD
// ════════════════════════════════════════════
function updateHud(ind) {
  $('fRent').style.width = ind.rent + '%';
  $('fRel').style.width = ind.rel + '%';
  $('fRep').style.width = ind.rep + '%';
  $('nRent').textContent = Math.round(ind.rent);
  $('nRel').textContent = Math.round(ind.rel);
  $('nRep').textContent = Math.round(ind.rep);
}
function updateClientDots() {
  const el = $('cdots'); el.innerHTML = '';
  for (let i = 0; i < CLIENTS.length; i++) {
    const d = document.createElement('div');
    d.className = 'cdot' + (gs.clientsDone.includes(i) ? ' done' : i === gs.clientIdx ? ' active' : '');
    el.appendChild(d);
  }
}
onIndicatorChange(updateHud);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $(id).classList.add('on');
}
function hideScreen(id) { $(id).classList.remove('on'); }

// ════════════════════════════════════════════
// CUSTOMIZE
// ════════════════════════════════════════════
function buildCustomize() {
  const sr = $('skinRow'); sr.innerHTML = '';
  SKINS.forEach((sk, i) => {
    const d = document.createElement('div');
    d.className = 'skin-card' + (i === 0 ? ' sel' : '');
    d.innerHTML = `<img class="skin-preview" src="assets/sprites/${sk.sprites.idle}.png" alt="${sk.name}"><div class="skin-name">${sk.name}</div>`;
    d.onclick = () => {
      gs.skinIdx = i;
      document.querySelectorAll('.skin-card').forEach((el, j) => el.classList.toggle('sel', j === i));
    };
    sr.appendChild(d);
  });
  if (SKINS.length === 1) {
    const note = document.createElement('div');
    note.className = 'section-note';
    note.textContent = 'Más estilos de personaje próximamente.';
    sr.after(note);
  }

  const pr = $('profileRow'); pr.innerHTML = '';
  const barColors = ['#b8823f', '#5a7a8f', '#d9a869'];
  PROFILES.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'profile-card' + (i === 0 ? ' sel' : '');
    d.innerHTML = `
      <div class="profile-ico">${p.ico}</div>
      <div class="profile-name">${p.name}</div>
      <div class="profile-desc">${p.desc}</div>
      <div class="profile-bars">
        ${[['📈', p.bars[0]], ['🤝', p.bars[1]], ['🏷️', p.bars[2]]].map(([ico, v], bi) => `
        <div class="pb-row">
          <span class="pb-ico">${ico}</span>
          <div class="pb-track"><div class="pb-fill" style="width:${v}%;background:${barColors[bi]}"></div></div>
        </div>`).join('')}
      </div>`;
    d.onclick = () => {
      gs.profileIdx = i;
      document.querySelectorAll('.profile-card').forEach((el, j) => el.classList.toggle('sel', j === i));
    };
    pr.appendChild(d);
  });
}

function goPlay() {
  const n = $('nameIn').value.trim();
  gs.name = n || 'Comercial';
  gs.skinIdx = [...document.querySelectorAll('.skin-card')].findIndex(el => el.classList.contains('sel'));
  gs.profileIdx = [...document.querySelectorAll('.profile-card')].findIndex(el => el.classList.contains('sel'));
  if (gs.skinIdx < 0) gs.skinIdx = 0;
  if (gs.profileIdx < 0) gs.profileIdx = 0;

  const prof = currentProfile();
  gs.ind = { rent: prof.rent, rel: prof.rel, rep: prof.rep };

  $('hName').textContent = gs.name.split(' ')[0].toUpperCase();
  $('hProfile').textContent = prof.ico + ' ' + prof.name;
  hideScreen('sCust');
  showScreen('sWarn');
}

function closeWarn() {
  hideScreen('sWarn');
  startGame();
}

// ════════════════════════════════════════════
// GAME FLOW
// ════════════════════════════════════════════
function startGame() {
  gs.phase = 'playing'; gs.clientIdx = 0; gs.exchIdx = 0; gs.clientsDone = [];
  gs.elapsed = 0; gs.startedAt = Date.now();
  clearInterval(gs.timerInt);
  gs.timerInt = setInterval(() => { gs.elapsed++; $('hTime').textContent = gs.elapsed + 's'; }, 1000);
  applyInd(0, 0, 0);
  updateClientDots();
  playScene.startLevel(0);
}

bus.on('reached-client', () => { gs.phase = 'card'; showCard(); });
bus.on('game-over', ({ win }) => endGame(win));
bus.on('player-hit', () => {
  $('dmg').classList.add('on');
  setTimeout(() => $('dmg').classList.remove('on'), 200);
});

// ════════════════════════════════════════════
// CARD
// ════════════════════════════════════════════
function showCard() {
  if (gs.exchIdx === 0) beginClientLog();
  const cl = currentClient();
  const acc = cl.accentColor;
  $('cardWrap').innerHTML = `
    <div class="card-banner" style="background:linear-gradient(135deg,${acc}22,transparent)">
      <div class="card-badge" style="border-color:${acc}66">${cl.icon}</div>
      <div class="card-titles">
        <div class="card-tname">${cl.name}</div>
        <div class="card-ttype" style="color:${acc}">${cl.type}</div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-desc">${cl.cardDesc}</div>
      <div class="card-intel">
        ${cl.hints.map(h => `<div class="intel-item"><span class="intel-ico">${h.ico}</span><span class="intel-text">${h.t}</span></div>`).join('')}
      </div>
    </div>
    <div class="card-footer">
      <div class="card-tip">Lee el contexto antes de responder — cada decisión mueve tus indicadores</div>
      <button class="btn-negociar" id="btnNegociar" style="background:${acc};box-shadow:3px 3px 0 ${darken(acc, 40)}">NEGOCIAR ▶</button>
    </div>`;
  $('btnNegociar').onclick = startDial;
  updateClientDots();
  showScreen('sCard');
}
function startDial() { hideScreen('sCard'); gs.phase = 'dialogue'; openDial(); }

// ════════════════════════════════════════════
// DIALOGUE
// ════════════════════════════════════════════
function openDial() {
  const cl = currentClient(); const ex = cl.exchanges[gs.exchIdx];
  showScreen('sDial');
  $('dialWho').textContent = '🗣 ' + cl.name;
  $('dialStep').textContent = `RONDA ${gs.exchIdx + 1} / ${cl.exchanges.length}`;

  const dp = $('dialProgress'); dp.innerHTML = '';
  cl.exchanges.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dp-dot' + (i < gs.exchIdx ? ' done' : i === gs.exchIdx ? ' active' : '');
    dp.appendChild(d);
  });

  $('dialText').textContent = ex.text;
  const shuffled = [...ex.opts].sort(() => Math.random() - 0.5);
  const oel = $('dialOpts'); oel.innerHTML = '';
  shuffled.forEach((opt, i) => {
    const b = document.createElement('button'); b.className = 'opt';
    b.innerHTML = `<span class="opt-n">${i + 1}</span><span>${opt.t}</span>`;
    b.onclick = () => pickOpt(opt, b, ex.text);
    oel.appendChild(b);
  });
}

function pickOpt(opt, btn, situationText) {
  if (gs.phase !== 'dialogue') return;
  document.querySelectorAll('.opt').forEach(b => b.style.pointerEvents = 'none');
  const bad = opt.rent < 0 || opt.rel < 0 || opt.rep < 0;
  btn.classList.add(bad ? 'bad' : 'ok');
  logExchange(situationText, opt);
  applyInd(opt.rent, opt.rel, opt.rep);
  setTimeout(() => { hideScreen('sDial'); showFb(opt, !bad); }, 350);
}

// ════════════════════════════════════════════
// FEEDBACK
// ════════════════════════════════════════════
function showFb(opt, ok) {
  gs.phase = 'feedback';
  playScene.soundManager.play('answer');
  const box = $('fbBox'); box.className = 'fb-box' + (ok ? ' ok' : '');
  $('fbEmoji').textContent = ok ? '💡' : '💸';
  $('fbTitle').textContent = ok ? 'BUENA DECISIÓN' : 'CONSECUENCIAS';
  $('fbTitle').className = 'fb-title ' + (ok ? 'ok' : 'bad');

  const dd = $('fbDeltas'); dd.innerHTML = '';
  [['📈', 'Rentabilidad', opt.rent], ['🤝', 'Relación', opt.rel], ['🏷️', 'Reputación', opt.rep]].forEach(([ico, name, v]) => {
    const cls = v > 0 ? 'pos' : v < 0 ? 'neg' : 'neu';
    const sign = v > 0 ? '+' : '';
    dd.innerHTML += `<div class="fb-delta"><div class="fb-delta-ico">${ico}</div><div class="fb-delta-val ${cls}">${sign}${v}</div><div class="fb-delta-name">${name}</div></div>`;
  });

  $('fbSarcasm').textContent = ok ? '' : (opt.s || '');
  $('fbLesson').textContent = opt.l || '';
  $('fbBtn').className = 'fb-btn ' + (ok ? 'ok' : 'bad');
  showScreen('sFb');
}

function closeFb() {
  hideScreen('sFb');
  if (indicatorsCritical()) { endGame(false); return; }
  gs.exchIdx++;
  if (gs.exchIdx >= currentClient().exchanges.length) { showResult(); }
  else { gs.phase = 'dialogue'; openDial(); }
}

// ════════════════════════════════════════════
// CLIENT RESULT
// ════════════════════════════════════════════
function showResult() {
  gs.phase = 'result';
  closeClientLog();
  const cl = currentClient();
  const deltas = [{ k: 'Rentabilidad', v: gs.cRent }, { k: 'Relación', v: gs.cRel }, { k: 'Reputación de precio', v: gs.cRep }];
  const worst = [...deltas].sort((a, b) => a.v - b.v)[0];
  let diag = worst.v < -8
    ? `Cerraste la negociación, pero sacrificaste <strong>${worst.k}</strong>. Ese costo se acumula en el portafolio.`
    : deltas.every(d => d.v >= 0)
      ? `Negociación impecable con ${cl.name}. Protegiste todos los indicadores.`
      : `Resultado mixto. Hubo trade-offs — lo importante es ser consciente de lo que cediste y por qué.`;

  $('resultWrap').innerHTML = `
    <div class="result-badge">${cl.icon}</div>
    <div class="result-title">CLIENTE CERRADO</div>
    <div class="result-client">${cl.name} · ${cl.type}</div>
    <div class="result-inds">
      <div class="r-ind"><div class="r-ind-ico">📈</div><div class="r-ind-val">${Math.round(gs.ind.rent)}</div><div class="r-ind-name">Rentabilidad</div></div>
      <div class="r-ind"><div class="r-ind-ico">🤝</div><div class="r-ind-val">${Math.round(gs.ind.rel)}</div><div class="r-ind-name">Relación</div></div>
      <div class="r-ind"><div class="r-ind-ico">🏷️</div><div class="r-ind-val">${Math.round(gs.ind.rep)}</div><div class="r-ind-name">Reputación</div></div>
    </div>
    <div class="result-diag">${diag}</div>
    <button class="btn-next" id="btnNext">SIGUIENTE ▶</button>`;
  $('btnNext').onclick = nextClient;
  showScreen('sResult');
}

function nextClient() {
  hideScreen('sResult');
  gs.clientsDone.push(gs.clientIdx); gs.clientIdx++; gs.exchIdx = 0;
  gs.cRent = 0; gs.cRel = 0; gs.cRep = 0;
  updateClientDots();
  if (gs.clientIdx >= CLIENTS.length) { endGame(true); return; }
  gs.phase = 'playing';
  playScene.startLevel(gs.clientIdx);
}

// ════════════════════════════════════════════
// END GAME
// ════════════════════════════════════════════
function endGame(win) {
  clearInterval(gs.timerInt);
  gs.phase = 'over';
  playScene.stopLevel();
  playScene.soundManager.stopMusic();
  const { rent, rel, rep } = gs.ind;
  const low = Math.min(rent, rel, rep);

  $('endTitle').textContent = win ? '🏆 PORTAFOLIO CERRADO' : '⚠️ INDICADOR EN ROJO';
  $('endTitle').className = 'end-title ' + (win ? 'win' : 'lose');

  $('endInds').innerHTML = [
    ['📈', 'Rentabilidad', rent, '#a85c42,#b8823f,#6b8f5a'],
    ['🤝', 'Relación', rel, '#8a4a35,#5a7a8f,#7a6a8a'],
    ['🏷️', 'Reputación', rep, '#4a2e22,#b8823f,#d9a869'],
  ].map(([ico, name, v, grad]) => `
    <div class="e-ind">
      <div class="e-ind-ico">${ico}</div>
      <div class="e-ind-val">${Math.round(v)}</div>
      <div class="e-ind-bar"><div class="e-ind-fill" style="width:${v}%;background:linear-gradient(90deg,${grad})"></div></div>
      <div class="e-ind-name">${name}</div>
    </div>`).join('');

  const prof = currentProfile();
  let diag = '';
  if (rent < 50 && rel > 70) diag = 'Tus clientes te quieren, pero el margen te está pasando la cuenta. Las relaciones importan — la rentabilidad también.';
  else if (rep < 50) diag = 'Tu reputación de precio está dañada. El mercado aprendió que con presión bajas. Ese costo invisible se paga en cada negociación futura.';
  else if (low > 70) diag = 'Negociación equilibrada. Cerraste sin sacrificar ningún indicador de forma crítica. Eso es lo que hace un comercial profesional.';
  else if (rent > 80 && rel < 60) diag = 'Protegiste el margen, pero dejaste relaciones débiles. Un cliente que no se siente valorado busca alternativas.';
  else diag = 'Resultado con trade-offs. El aprendizaje está en reconocer qué cediste y por qué — no todas las decisiones tienen respuesta perfecta.';

  $('endDiag').textContent = diag;
  const rank = low > 72 ? '⭐⭐⭐ COMERCIAL ÉLITE' : low > 50 ? '⭐⭐ COMERCIAL SÓLIDO' : '⭐ COMERCIAL EN DESARROLLO';
  $('endRank').textContent = `${rank} · ${gs.name} · ${prof.ico} ${prof.name}`;
  showScreen('sEnd');
}

function restartGame() {
  hideScreen('sEnd');
  resetGame();
  showScreen('sCust');
  buildCustomize();
}

// ════════════════════════════════════════════
// INPUT (teclado + botones móviles)
// ════════════════════════════════════════════
function wireInput() {
  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '3' && gs.phase === 'dialogue') {
      document.querySelectorAll('.opt')[+e.key - 1]?.click();
    }
    if ([' ', 'Enter'].includes(e.key) && gs.phase === 'feedback') closeFb();
    if (e.key === ' ') e.preventDefault();
  });

  const bindHold = (id, onDown, onUp) => {
    const el = $(id);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); onDown(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, onUp));
  };
  bindHold('btnLeft', () => { touch.left = true; }, () => { touch.left = false; });
  bindHold('btnRight', () => { touch.right = true; }, () => { touch.right = false; });
  $('btnJump').addEventListener('pointerdown', (e) => { e.preventDefault(); touch.jumpPressed = true; });

  $('btnPlay').addEventListener('click', goPlay);
  $('btnCloseWarn').addEventListener('click', closeWarn);
  $('fbBtn').addEventListener('click', closeFb);
  $('btnRestart').addEventListener('click', restartGame);
  $('btnReport').addEventListener('click', downloadReport);
  $('muteBtn').addEventListener('click', () => {
    const muted = !playScene.soundManager.muted;
    playScene.soundManager.setMuted(muted);
    $('muteBtn').textContent = muted ? '🔇' : '🔊';
  });
}

function darken(hex, amt) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    return `#${[n >> 16, (n >> 8) & 255, n & 255].map(c => Math.max(0, c - amt).toString(16).padStart(2, '0')).join('')}`;
  } catch { return hex; }
}

export function initUI(scene) {
  playScene = scene;
  buildCustomize();
  wireInput();
}
