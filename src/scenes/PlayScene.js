import { CLIENTS, SKINS, BACKGROUNDS } from '../data.js';
import { gs, applyInd, indicatorsCritical } from '../state.js';
import { SPRITE_MANIFEST, bboxHeightPx, anchorSprite } from '../spriteManifest.js';
import { SoundManager } from '../soundManager.js';
import { bus } from '../bus.js';
import { touch } from '../touchInput.js';

const CANVAS_W = 1280;
const CANVAS_H = 720;
const GROUND_Y = 620;
const LEVEL_WIDTH = 3400;
const CLIENT_MARGIN = 260;

const PLAYER_SPEED = 260;
const JUMP_VELOCITY = -720;

const PLAYER_HEIGHT = 122;
const ENEMY_HEIGHT = 104;
const CLIENT_HEIGHT = 140;

const ENEMY_SPEED = 110;

const PLAYER_BOX = { w: 60, h: PLAYER_HEIGHT };
const ENEMY_BOX = { w: 56, h: ENEMY_HEIGHT };

function hexToNum(hex) { return parseInt(hex.replace('#', ''), 16); }

export class PlayScene extends Phaser.Scene {
  constructor() { super('PlayScene'); }

  create() {
    this.soundManager = new SoundManager(this);
    this.playing = false;
    this.playerHitCooldown = false;
    this.playerHitUntil = 0;
    this.facing = 1;

    this.playerScale = PLAYER_HEIGHT / bboxHeightPx('vendedor_idle');
    this.enemyScale = ENEMY_HEIGHT / bboxHeightPx('competencia_idle');
    this.clientScale = CLIENT_HEIGHT / bboxHeightPx('cliente_neutral');

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, CANVAS_H);

    // ── Player (caja lógica invisible + sprite visual anclado por bbox) ──
    this.playerBody = this.add.zone(80, GROUND_Y - PLAYER_BOX.h, PLAYER_BOX.w, PLAYER_BOX.h).setOrigin(0, 0);
    this.physics.add.existing(this.playerBody, false);
    this.playerBody.body.setCollideWorldBounds(true);
    this.playerSprite = this.add.image(0, 0, 'vendedor_idle');

    // ── Enemigos (competencia) ──
    this.enemyGroup = this.physics.add.group();
    this.enemies = [];

    // ── Cliente (objetivo del nivel) ──
    this.clientSprite = this.add.image(0, 0, 'cliente_esperando').setVisible(false);
    this.clientLabel = this.add.text(0, 0, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '15px', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#00000055', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setVisible(false);
    this.clientBubble = this.add.text(0, 0, '💬', { fontSize: '22px' }).setOrigin(0.5, 1).setVisible(false);

    this.platformsGroup = this.physics.add.staticGroup();
    this.platformAccents = [];

    this.groundBody = this.add.zone(0, GROUND_Y, LEVEL_WIDTH, CANVAS_H - GROUND_Y).setOrigin(0, 0);
    this.physics.add.existing(this.groundBody, true);
    this.physics.add.collider(this.playerBody, this.groundBody, () => { this.onGround = true; });
    // Plataformas de una sola vía (jump-through): cada body de plataforma
    // solo tiene activa la cara de arriba (checkCollision.up), así que
    // solo detiene al jugador cayendo sobre ella. Se puede caminar debajo
    // y saltar a través de abajo sin chocar. Es la técnica estándar de
    // Arcade Physics para este tipo de plataforma — más confiable que un
    // callback manual basado en la posición del frame anterior.
    this.physics.add.collider(this.playerBody, this.platformsGroup, () => { this.onGround = true; });

    this.physics.add.overlap(this.playerBody, this.enemyGroup, this.onPlayerEnemyOverlap, undefined, this);

    this.floorGfx = this.add.graphics();
    this.bgLayer = null;
    this.clouds = [];

    this.arrowHint = this.add.text(0, 0, '▶▶', { fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#b8823f' })
      .setScrollFactor(0).setOrigin(1, 0.5).setVisible(false);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,SPACE,Z');

    bus.emit('scene-ready', this);
  }

  // ════════════════════════════════════════════
  // NIVEL
  // ════════════════════════════════════════════
  startLevel(clientIdx) {
    const client = CLIENTS[clientIdx];
    const accent = hexToNum(client.accentColor);
    this.clientX = LEVEL_WIDTH - CLIENT_MARGIN;

    // Fondo — hoy todos los temas reutilizan el fondo de fábrica aprobado
    // (ver data.js BACKGROUNDS). Cuando lleguen bodega/retail, esto se
    // actualiza solo sin tocar el resto de la escena.
    const bgKey = 'bg_' + BACKGROUNDS[client.bgTheme];
    if (this.bgLayer) this.bgLayer.destroy();
    this.bgLayer = this.add.tileSprite(0, 0, LEVEL_WIDTH, CANVAS_H, bgKey).setOrigin(0, 0).setScrollFactor(0.25);
    this.bgLayer.setDepth(-20);

    // Piso
    this.floorGfx.clear();
    this.floorGfx.fillGradientStyle(accent, accent, 0x0a0400, 0x0a0400, 0.55, 0.55, 1, 1);
    this.floorGfx.fillRect(0, GROUND_Y, LEVEL_WIDTH, CANVAS_H - GROUND_Y);
    this.floorGfx.lineStyle(2, 0xffffff, 0.15);
    this.floorGfx.lineBetween(0, GROUND_Y, LEVEL_WIDTH, GROUND_Y);
    this.floorGfx.setDepth(-10);

    // Plataformas
    this.platformsGroup.clear(true, true);
    this.platformAccents.forEach(r => r.destroy());
    this.platformAccents = [];
    const platformDefs = [
      { xf: 0.14, yOff: 95, w: 110 }, { xf: 0.25, yOff: 135, w: 90 },
      { xf: 0.36, yOff: 85, w: 110 }, { xf: 0.47, yOff: 125, w: 90 },
      { xf: 0.58, yOff: 88, w: 110 }, { xf: 0.68, yOff: 115, w: 90 },
      { xf: 0.78, yOff: 80, w: 110 }, { xf: 0.88, yOff: 110, w: 90 },
    ];
    platformDefs.forEach(pd => {
      const x = LEVEL_WIDTH * pd.xf, y = GROUND_Y - pd.yOff;
      const p = this.platformsGroup.create(x, y, 'tex_platform').setOrigin(0, 0).setDisplaySize(pd.w, 14);
      p.refreshBody();
      p.body.checkCollision.down = false;
      p.body.checkCollision.left = false;
      p.body.checkCollision.right = false;
      const stripe = this.add.rectangle(x, y, pd.w, 3, accent).setOrigin(0, 0).setAlpha(0.8);
      this.platformAccents.push(stripe);
    });

    // Competencia — vienen derecho hacia el jugador (izquierda constante),
    // sin patrullaje: el jugador los esquiva o los salta encima, nada más.
    this.enemies.forEach(e => { e.sprite.destroy(); this.enemyGroup.remove(e.zone, true, true); });
    this.enemies = [];
    const spawnFracs = [0.18, 0.34, 0.50, 0.66, 0.82];
    spawnFracs.forEach(f => {
      const x = LEVEL_WIDTH * f;
      const zone = this.add.zone(x, GROUND_Y - ENEMY_BOX.h, ENEMY_BOX.w, ENEMY_BOX.h).setOrigin(0, 0);
      this.physics.add.existing(zone, false);
      // Group.add() re-habilita el body con sus valores por defecto
      // (gravedad on, velocidad 0) — hay que configurar el body DESPUÉS
      // de agregarlo al grupo, no antes, o esta config se pierde.
      this.enemyGroup.add(zone);
      zone.body.setAllowGravity(false);
      zone.body.setCollideWorldBounds(true);
      zone.body.setVelocityX(-ENEMY_SPEED);
      const sprite = this.add.image(0, 0, 'competencia_moviendose');
      anchorSprite(sprite, 'competencia_moviendose');
      this.enemies.push({ zone, sprite, alive: true });
    });

    // Nubes decorativas / interactivas
    this.clouds.forEach(c => c.destroy());
    this.clouds = [];
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * LEVEL_WIDTH;
      const y = 60 + Math.random() * 180;
      const c = this.add.image(x, y, 'tex_cloud').setScrollFactor(0.15).setAlpha(0.85);
      c.setScale(0.8 + Math.random() * 0.8);
      c.setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => {
        this.soundManager.play('cloud');
        this.tweens.add({ targets: c, scaleX: c.scaleX * 1.25, scaleY: c.scaleY * 1.25, duration: 120, yoyo: true });
      });
      this.clouds.push(c);
    }

    // Cliente — el sprite mira a la derecha por defecto; lo volteamos
    // para que quede de frente al jugador, que llega desde la izquierda.
    this.clientSprite.setTexture('cliente_esperando');
    anchorSprite(this.clientSprite, 'cliente_esperando');
    this.clientSprite.setScale(this.clientScale).setFlipX(true).setVisible(true);
    this.clientSprite.setPosition(this.clientX, GROUND_Y);
    this.clientLabel.setText(client.name).setPosition(this.clientX, GROUND_Y - CLIENT_HEIGHT - 30).setVisible(true);
    this.clientBubble.setPosition(this.clientX, GROUND_Y - CLIENT_HEIGHT - 34).setVisible(true);

    // Jugador
    this.playerBody.setPosition(80, GROUND_Y - PLAYER_BOX.h);
    this.playerBody.body.setVelocity(0, 0);
    this.facing = 1;
    this.playerHitUntil = 0;

    // Cámara
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, CANVAS_H);
    this.cameras.main.startFollow(this.playerBody, true, 0.1, 0.1);
    this.cameras.main.setFollowOffset(-260, -CANVAS_H / 2 + GROUND_Y - 40);

    this.soundManager.playMusic(client.bgTheme);
    this.playing = true;
  }

  stopLevel() {
    this.playing = false;
    this.playerBody.body.setVelocity(0, 0);
  }

  // ════════════════════════════════════════════
  // COLISIONES
  // ════════════════════════════════════════════
  onPlayerEnemyOverlap(playerZone, enemyZone) {
    const enemy = this.enemies.find(e => e.zone === enemyZone);
    if (!enemy || !enemy.alive) return;
    const pBody = this.playerBody.body;
    const stomp = pBody.velocity.y > 0 && (pBody.y + pBody.height) < (enemyZone.body.y + enemyZone.body.height * 0.6);

    if (stomp) {
      enemy.alive = false;
      pBody.setVelocityY(JUMP_VELOCITY * 0.7);
      this.soundManager.play('stomp');
      this.emitBurst(enemyZone.x, enemyZone.y, 0xa85c42);
      enemy.sprite.setTexture('competencia_golpeado');
      anchorSprite(enemy.sprite, 'competencia_golpeado');
      this.tweens.add({
        targets: enemy.sprite, alpha: 0, y: enemy.sprite.y - 20, duration: 300,
        onComplete: () => enemy.sprite.destroy(),
      });
      this.enemyGroup.remove(enemyZone, true, true);
    } else {
      if (this.playerHitCooldown) return;
      this.playerHitCooldown = true;
      this.time.delayedCall(600, () => { this.playerHitCooldown = false; });
      this.soundManager.play('hit');
      pBody.setVelocityX(-260 * this.facing);
      pBody.setVelocityY(-350);
      this.playerHitUntil = this.time.now + 300;
      applyInd(-2, -2, -2);
      bus.emit('player-hit');
      if (indicatorsCritical()) {
        this.playing = false;
        bus.emit('game-over', { win: false });
      }
    }
  }

  emitBurst(x, y, color) {
    const particles = this.add.particles(x, y, 'tex_particle', {
      speed: { min: 80, max: 220 },
      angle: { min: 220, max: 320 },
      gravityY: 500,
      lifespan: 420,
      scale: { start: 1.4, end: 0 },
      tint: color,
      quantity: 10,
      emitting: false,
    });
    particles.explode(10);
    this.time.delayedCall(450, () => particles.destroy());
  }

  // ════════════════════════════════════════════
  // UPDATE
  // ════════════════════════════════════════════
  update(time, delta) {
    if (!this.bgLayer) return;
    this.bgLayer.tilePositionX = this.cameras.main.scrollX * 0.25;

    if (this.clouds.length) {
      // sutil deriva propia además del parallax de cámara
      this.clouds.forEach((c, i) => { c.x -= 0.05 + (i % 3) * 0.02; if (c.x < -80) c.x = LEVEL_WIDTH + 80; });
    }

    if (!this.playing) return;

    // ── Input horizontal ──
    const left = this.cursors.left.isDown || this.wasd.A.isDown || touch.left;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || touch.right;
    let vx = 0;
    if (left) { vx = -PLAYER_SPEED; this.facing = -1; }
    else if (right) { vx = PLAYER_SPEED; this.facing = 1; }
    this.playerBody.body.setVelocityX(vx);

    if (vx !== 0) this.soundManager.playMove();

    // ── Salto ──
    this.onGround = this.playerBody.body.blocked.down || this.playerBody.body.touching.down;
    const jumpKey = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.W) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.Z) ||
      touch.jumpPressed;
    if (jumpKey && this.onGround) {
      this.playerBody.body.setVelocityY(JUMP_VELOCITY);
      this.soundManager.play('jump');
    }
    touch.jumpPressed = false;

    // ── Sprite del jugador (pose + anclaje real por bbox) ──
    let pose = 'vendedor_idle';
    if (time < this.playerHitUntil) pose = 'vendedor_golpeado';
    else if (!this.onGround) pose = 'vendedor_salto';
    else if (vx !== 0) pose = 'vendedor_moviendose';
    const skin = SKINS[gs.skinIdx] || SKINS[0];
    const texKey = skin.sprites[{
      vendedor_idle: 'idle', vendedor_moviendose: 'moviendose', vendedor_salto: 'salto', vendedor_golpeado: 'golpeado',
    }[pose]];
    if (this.playerSprite.texture.key !== texKey) {
      this.playerSprite.setTexture(texKey);
      anchorSprite(this.playerSprite, texKey);
    }
    const footX = this.playerBody.x + this.playerBody.width / 2;
    const footY = this.playerBody.y + this.playerBody.height;
    this.playerSprite.setPosition(footX, footY).setScale(this.playerScale).setFlipX(this.facing < 0);

    // ── Enemigos ── (van derecho hacia el jugador, sin patrullaje)
    this.enemies.forEach(e => {
      if (!e.alive) return;
      const eFacing = e.zone.body.velocity.x < 0 ? -1 : 1;
      const eFootX = e.zone.x + e.zone.width / 2;
      const eFootY = e.zone.y + e.zone.height;
      e.sprite.setPosition(eFootX, eFootY).setScale(this.enemyScale).setFlipX(eFacing < 0);
    });

    // ── Indicador de dirección hacia el cliente ──
    const clientScreenX = this.clientX - this.cameras.main.scrollX;
    if (clientScreenX > CANVAS_W - 10) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.005);
      this.arrowHint.setAlpha(pulse).setPosition(CANVAS_W - 20, GROUND_Y - 60).setVisible(true);
    } else {
      this.arrowHint.setVisible(false);
    }

    // ── Llegada al cliente ──
    if (Math.abs(footX - this.clientX) < 60) {
      this.playing = false;
      this.playerBody.body.setVelocity(0, 0);
      bus.emit('reached-client');
    }
  }
}
