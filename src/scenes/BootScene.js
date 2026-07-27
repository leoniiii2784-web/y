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

    // Cajón de madera — obstáculo sólido que hay que saltar, no una
    // plataforma elevada de una sola vía.
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const CW = 64, CH = 64;
    g.fillStyle(0x5a3a1e, 1);
    g.fillRect(0, 0, CW, CH);
    g.fillStyle(0x6b4a28, 1);
    g.fillRect(3, 3, CW - 6, CH - 6);
    g.lineStyle(4, 0x3a2410, 0.85);
    g.beginPath(); g.moveTo(5, 5); g.lineTo(CW - 5, CH - 5); g.strokePath();
    g.beginPath(); g.moveTo(CW - 5, 5); g.lineTo(5, CH - 5); g.strokePath();
    g.lineStyle(3, 0x3a2410, 1);
    g.strokeRect(1, 1, CW - 2, CH - 2);
    g.fillStyle(0xffffff, 0.1);
    g.fillRect(3, 3, CW - 6, 7);
    g.generateTexture('tex_crate', CW, CH);
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
