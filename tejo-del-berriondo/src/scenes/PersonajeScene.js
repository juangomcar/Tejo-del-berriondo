import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/game.config.js';

export default class PersonajeScene extends Phaser.Scene {

  constructor() {
    super({ key: 'PersonajeScene' });
    this.personajes = [
      { key: 'campesino', nombre: 'El Campesino', colorTejo: 0x999999, emoji: '👨‍🌾', desc: 'Veterano del tejo' },
      { key: 'abuela',    nombre: 'La Abuela',    colorTejo: 0x9b59b6, emoji: '👵',    desc: 'Tiro certero' },
      { key: 'minero',    nombre: 'El Minero',    colorTejo: 0x1a1a1a, emoji: '⛏️',   desc: 'Fuerza bruta' },
    ];
    this.seleccionado = 0;
    this.tarjetasGfx = [];
    this.tejoPreviews = [];
  }

  create() {
    this.crearFondo();

    // Título
    const titleGfx = this.add.graphics();
    titleGfx.fillStyle(0x000000, 0.4);
    titleGfx.fillRoundedRect(GAME_WIDTH / 2 - 190, 50, 380, 60, 14);

    this.add.text(GAME_WIDTH / 2, 80, '¿Quién va a lanzar?', {
      fontSize: '30px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 8, fill: true }
    }).setOrigin(0.5);

    this.tarjetas = [];
    this.tarjetasGfx = [];
    this.tejoPreviews = [];

    this.personajes.forEach((p, i) => {
      this.crearTarjeta(p, i);
    });

    this.crearBotonJugar();
    this.elegir(0);
  }

  crearFondo() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050512, 0x050512, 0x0a0f20, 0x0a0f20, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decoración de fondo: anillos sutiles
    for (let i = 0; i < 3; i++) {
      const ring = this.add.graphics();
      ring.lineStyle(1, 0xFFD700, 0.04 - i * 0.01);
      ring.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 180 + i * 60);
    }
  }

  crearTarjeta(p, i) {
    const cx = GAME_WIDTH / 2;
    const y = 200 + i * 185;
    const w = 340;
    const h = 155;

    // Gráfico de la tarjeta (fondo + borde, lo redibujamos al seleccionar)
    const gfx = this.add.graphics();
    this.tarjetasGfx.push(gfx);
    this.dibujarTarjeta(gfx, cx, y, w, h, false);

    // Emoji del personaje con fondo circular
    const emojiCircle = this.add.circle(cx - 120, y, 46, 0x111122, 0.8);
    this.add.text(cx - 120, y, p.emoji, { fontSize: '44px' }).setOrigin(0.5);

    // Textos
    this.add.text(cx + 10, y - 36, p.nombre, {
      fontSize: '22px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
    }).setOrigin(0.5);

    this.add.text(cx + 10, y - 8, p.desc, {
      fontSize: '14px', color: '#8899aa', fontFamily: FONT
    }).setOrigin(0.5);

    // Separador
    const sepGfx = this.add.graphics();
    sepGfx.lineStyle(1, 0x2a3a4a, 0.8);
    sepGfx.lineBetween(cx - 35, y + 14, cx + 140, y + 14);

    // Preview del tejo
    this.add.text(cx - 18, y + 36, 'Tejo:', {
      fontSize: '13px', color: '#667788', fontFamily: FONT
    }).setOrigin(0, 0.5);

    // Glow del tejo preview
    const tejoGlow = this.add.circle(cx + 80, y + 36, 22, p.colorTejo, 0.15);
    const tejoCircle = this.add.circle(cx + 80, y + 36, 16, p.colorTejo, 1);
    const tejoHighlight = this.add.circle(cx + 74, y + 30, 5, 0xffffff, 0.5);
    this.tejoPreviews.push({ glow: tejoGlow, circle: tejoCircle });

    // Zona interactiva
    const zona = this.add.rectangle(cx, y, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    this.tarjetas.push(zona);

    zona.on('pointerover', () => {
      if (this.seleccionado !== i) {
        this.dibujarTarjeta(gfx, cx, y, w, h, false, true);
      }
    });
    zona.on('pointerout', () => {
      if (this.seleccionado !== i) {
        this.dibujarTarjeta(gfx, cx, y, w, h, false);
      }
    });
    zona.on('pointerdown', () => this.elegir(i));
  }

  dibujarTarjeta(gfx, cx, y, w, h, seleccionada, hover = false) {
    gfx.clear();
    const bgAlpha = seleccionada ? 0.18 : (hover ? 0.12 : 0.07);
    const bgColor = seleccionada ? 0xFFD700 : 0xffffff;
    gfx.fillStyle(bgColor, bgAlpha);
    gfx.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 14);

    if (seleccionada) {
      // Borde dorado brillante
      gfx.lineStyle(2.5, 0xFFD700, 1);
      gfx.strokeRoundedRect(cx - w / 2, y - h / 2, w, h, 14);
      gfx.lineStyle(1, 0xffffff, 0.2);
      gfx.strokeRoundedRect(cx - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, 11);
    } else {
      gfx.lineStyle(1.5, 0x2a3a5a, hover ? 0.7 : 0.5);
      gfx.strokeRoundedRect(cx - w / 2, y - h / 2, w, h, 14);
    }
  }

  elegir(i) {
    this.seleccionado = i;
    const cx = GAME_WIDTH / 2;

    this.tarjetasGfx.forEach((gfx, idx) => {
      const y = 200 + idx * 185;
      const seleccionada = idx === i;
      this.dibujarTarjeta(gfx, cx, y, 340, 155, seleccionada);

      // Pulse en la tarjeta seleccionada
      if (seleccionada) {
        this.tweens.add({ targets: gfx, scaleX: 1.02, scaleY: 1.02, duration: 100, yoyo: true });
      }

      // Glow del tejo preview
      this.tejoPreviews[idx].glow.setAlpha(seleccionada ? 0.35 : 0.12);
    });

    this.registry.set('personaje', this.personajes[i].key);
    this.registry.set('colorTejo', this.personajes[i].colorTejo);
  }

  crearBotonJugar() {
    const cx = GAME_WIDTH / 2;
    const by = GAME_HEIGHT - 75;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x6b1a00, 1);
    gfx.fillRoundedRect(cx - 130, by - 30, 260, 60, 14);
    gfx.lineStyle(2, 0xFFD700, 0.85);
    gfx.strokeRoundedRect(cx - 130, by - 30, 260, 60, 14);

    this.add.text(cx, by, '¡A jugar! 🎯', {
      fontSize: '26px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5);

    const zona = this.add.rectangle(cx, by, 260, 60, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    zona.on('pointerover', () => {
      gfx.clear();
      gfx.fillStyle(0x9b2500, 1);
      gfx.fillRoundedRect(cx - 130, by - 30, 260, 60, 14);
      gfx.lineStyle(2, 0xFFD700, 1);
      gfx.strokeRoundedRect(cx - 130, by - 30, 260, 60, 14);
    });
    zona.on('pointerout', () => {
      gfx.clear();
      gfx.fillStyle(0x6b1a00, 1);
      gfx.fillRoundedRect(cx - 130, by - 30, 260, 60, 14);
      gfx.lineStyle(2, 0xFFD700, 0.85);
      gfx.strokeRoundedRect(cx - 130, by - 30, 260, 60, 14);
    });
    zona.on('pointerdown', () => this.iniciarJuego());
  }

  iniciarJuego() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
}
