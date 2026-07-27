import { SFX_MANIFEST, MUSIC_MANIFEST } from './audioManifest.js';
import { playSynth } from './synthAudio.js';

// ════════════════════════════════════════════════════════════════
// SOUND MANAGER
// ════════════════════════════════════════════════════════════════
// Envuelve Phaser.Sound. Ningún archivo de audio real está incluido
// todavía (ver audioManifest.js) — el loader intenta cargarlos y
// Phaser emite 'loaderror' por cada uno que no exista, sin frenar el
// resto de la carga. Mientras no haya archivos reales, los efectos
// (no la música) se generan por código vía Web Audio (synthAudio.js)
// para que el juego no quede mudo. En cuanto se suelte un archivo
// real con la clave correspondiente, este toma prioridad automática
// y el synth deja de sonar para esa clave — no hay que tocar código.
export class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMusic = null;
    this.muted = false;
    this._lastMove = 0;
  }

  static preload(scene) {
    Object.entries(SFX_MANIFEST).forEach(([key, url]) => scene.load.audio(key, url));
    Object.entries(MUSIC_MANIFEST).forEach(([key, url]) => scene.load.audio('music_' + key, url));
    scene.load.on('loaderror', (file) => {
      // Esperado mientras no haya assets de audio reales — no es un error de juego.
      console.info(`[audio] pendiente: ${file.key} (${file.src})`);
    });
  }

  has(key) {
    return this.scene.cache.audio.exists(key);
  }

  play(key, config) {
    if (this.muted) return;
    if (this.has(key)) { this.scene.sound.play(key, config); return; }
    playSynth(key); // respaldo mientras no haya archivo real para esta clave
  }

  playMove() {
    // Throttle: no saturar el efecto de pasos mientras se mantiene la tecla.
    const now = this.scene.time.now;
    if (now - this._lastMove < 260) return;
    this._lastMove = now;
    this.play('move', { volume: 0.5 });
  }

  playMusic(theme) {
    const key = 'music_' + theme;
    if (this.muted || !this.has(key)) return;
    if (this.currentMusic) this.currentMusic.stop();
    this.currentMusic = this.scene.sound.add(key, { loop: true, volume: 0.35 });
    this.currentMusic.play();
  }

  stopMusic() {
    if (this.currentMusic) { this.currentMusic.stop(); this.currentMusic = null; }
  }

  setMuted(m) {
    this.muted = m;
    this.scene.sound.mute = m;
  }
}
