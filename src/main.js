import { BootScene } from './scenes/BootScene.js';
import { PlayScene } from './scenes/PlayScene.js';
import { bus } from './bus.js';
import { initUI } from './ui.js';

const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: 1280,
  height: 720,
  pixelArt: true,
  backgroundColor: '#1a0500',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1700 },
      debug: false,
    },
  },
  scene: [BootScene, PlayScene],
};

new Phaser.Game(config);

window.__prima = { bus };
bus.on('scene-ready', (scene) => { window.__prima.scene = scene; initUI(scene); });
