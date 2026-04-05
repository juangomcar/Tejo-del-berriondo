import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config.js';

export default class PersonajeScene extends Phaser.Scene {

  constructor() {
    super({ key: 'PersonajeScene' });
    this.personajes = [
      { key: 'campesino', nombre: 'El Campesino', colorTejo: 0x999999, emoji: '👨‍🌾' },
      { key: 'abuela',    nombre: 'La Abuela',    colorTejo: 0x9b59b6, emoji: '👵' },
      { key: 'minero',    nombre: 'El Minero',    colorTejo: 0x1a1a1a, emoji: '⛏️' },
    ];
    this.seleccionado = 0;
  }

  create() {
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    this.add.text(GAME_WIDTH/2, 80, '¿Quién va a lanzar?', {
      fontSize: '28px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold', resolution: 2
    }).setOrigin(0.5);

    this.tarjetas = [];
    this.personajes.forEach((p, i) => {
      const x = GAME_WIDTH / 2;
      const y = 220 + i * 180;

      const tarjeta = this.add.rectangle(x, y, 320, 150, 0xffffff, 0.08)
        .setStrokeStyle(2, 0x8B2500)
        .setInteractive({ useHandCursor: true });

      // Emoji a la izquierda, centrado verticalmente en la tarjeta
      this.add.text(x - 110, y, p.emoji, {
        fontSize: '52px', resolution: 2
      }).setOrigin(0.5);

      // Nombre arriba a la derecha
      this.add.text(x + 10, y - 30, p.nombre, {
        fontSize: '22px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold', resolution: 2
      }).setOrigin(0.5);

      // Tejo preview abajo a la derecha
      this.add.text(x - 30, y + 25, 'Tejo:', {
        fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial', resolution: 2
      }).setOrigin(0, 0.5);
      this.add.circle(x + 90, y + 25, 18, p.colorTejo);

      tarjeta.on('pointerover', () => tarjeta.setFillStyle(0xffffff, 0.15));
      tarjeta.on('pointerout',  () => tarjeta.setFillStyle(0xffffff, 0.08));
      tarjeta.on('pointerdown', () => this.elegir(i));

      this.tarjetas.push(tarjeta);
    });

    const boton = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT - 80, 240, 60, 0x8B2500)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 80, '¡A jugar! 🎯', {
      fontSize: '24px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold', resolution: 2
    }).setOrigin(0.5);

    boton.on('pointerover', () => boton.setFillStyle(0xaa3300));
    boton.on('pointerout',  () => boton.setFillStyle(0x8B2500));
    boton.on('pointerdown', () => this.iniciarJuego());

    this.elegir(0);
  }

  elegir(i) {
    this.seleccionado = i;
    this.tarjetas.forEach((t, idx) => {
      t.setStrokeStyle(idx === i ? 4 : 2, idx === i ? 0xFFD700 : 0x8B2500);
    });
    this.registry.set('personaje', this.personajes[i].key);
    this.registry.set('colorTejo', this.personajes[i].colorTejo);
  }

  iniciarJuego() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
}