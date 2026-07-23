import { SoundManager } from '../soundManager.js';
import { BACKGROUNDS } from '../data.js';
import { bus } from '../bus.js';

const SPRITE_KEYS = [
  'vendedor_idle', 'vendedor_moviendose', 'vendedor_salto', 'vendedor_golpeado',
  'cliente_neutral', 'cliente_esperando', 'cliente_hablando',
  'competencia_idle', 'competencia_moviendose', 'competencia_salto', 'competencia_golpeado',
];

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    SPRITE_KEYS.forEach(key => this.load.image(key, `assets/sprites/${key}.png`));

    const bgFiles = new Set(Object.values(BACKGROUNDS));
    bgFiles.forEach(name => this.load.image('bg_' + name, `assets/backgrounds/${name}.png`));

    SoundManager.preload(this);

    // Plancha de plataforma generada por código (paleta neutra, se tiñe por escena)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x3a2808, 1);
    g.fillRect(0, 0, 110, 14);
    g.fillStyle(0xffffff, 0.08);
    for (let x = 10; x < 110; x += 14) g.fillRect(x, 0, 1, 14);
    g.generateTexture('tex_platform', 110, 14);
    g.destroy();

    // Nube decorativa/interactiva
    const gc = this.make.graphics({ x: 0, y: 0, add: false });
    gc.fillStyle(0xffffff, 0.9);
    gc.fillEllipse(35, 18, 70, 26);
    gc.fillEllipse(14, 20, 40, 18);
    gc.fillEllipse(58, 20, 40, 18);
    gc.generateTexture('tex_cloud', 72, 32);
    gc.destroy();

    // Partícula (burst al eliminar competencia)
    const gp = this.make.graphics({ x: 0, y: 0, add: false });
    gp.fillStyle(0xffffff, 1);
    gp.fillRect(0, 0, 5, 5);
    gp.generateTexture('tex_particle', 5, 5);
    gp.destroy();
  }

  create() {
    bus.emit('assets-ready');
    this.scene.start('PlayScene');
  }
}
