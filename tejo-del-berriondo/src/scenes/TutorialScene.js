import Phaser from 'phaser';
import npc from '../assets/donkey_clean.png';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config.js';

// TutorialScene — NPC que explica el juego antes de arrancar
export default class TutorialScene extends Phaser.Scene {

  constructor() {
    super({ key: 'TutorialScene' });
    this.mensajeActual = 0;
    this.mensajes = [
      '¡Bienvenido al Tejo del Berriondo! \nYo soy Burrito, tu guía.',
      'Para jugar, arrastra el tejo hacia abajo\ncomo una resortera y suéltalo\npara lanzarlo hacia arriba.',
      'La diana ROJA te da puntos. 🔴\nLa diana AZUL te los quita. 🔵\n¡Ojo con cuál le pegas!',
      'Acumula aciertos seguidos\npara subir de nivel.\nCada nivel es más difícil.',
      'Si tienes suerte, el JACKPOT\nexplota y puedes ganar\npremios del restaurante. 🎰',
      '¡Listo! Ya sabes todo.\n¡A lanzar ese tejo\nberriondo!'
    ];
  }

  preload() {
    this.load.image('npc', npc);
  } 

  create() {
    // Fondo
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    // NPC — el burro
    this.npcImg = this.add.image(GAME_WIDTH/2 - 12, GAME_HEIGHT/2 - 160, 'npc');
    this.npcImg.setDisplaySize(420, 420);
    this.npcImg.setOrigin(0.5); 

    // Animación suave del NPC
    this.tweens.add({
      targets: this.npcImg,
      y: GAME_HEIGHT/2 - 130,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Caja de diálogo
    this.cajaDial = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2 + 110, 380, 180, 0xffffff, 0.95);
    this.cajaDial.setStrokeStyle(3, 0x8B2500);

    // Texto del diálogo
    this.textoDial = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 110, '', {
      fontSize: '18px',
      color: '#1a1a2e',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 340 }
    }).setOrigin(0.5);

    // Botón siguiente
    this.botonSig = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2 + 230, 220, 55, 0x8B2500)
      .setInteractive({ useHandCursor: true });

    this.textoBoton = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 230, 'Siguiente →', {
      fontSize: '22px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Indicador de progreso
    this.textoProgreso = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 285, '', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.botonSig.on('pointerdown', () => this.siguiente());
    this.botonSig.on('pointerover', () => this.botonSig.setFillStyle(0xaa3300));
    this.botonSig.on('pointerout', () => this.botonSig.setFillStyle(0x8B2500));

    // Mostramos el primer mensaje
    this.mostrarMensaje();
  }

  mostrarMensaje() {
    this.textoDial.setText(this.mensajes[this.mensajeActual]);
    this.textoProgreso.setText((this.mensajeActual + 1) + ' / ' + this.mensajes.length);

    // Último mensaje — cambiamos el botón
    if (this.mensajeActual === this.mensajes.length - 1) {
      this.textoBoton.setText('¡A jugar! 🎯');
    }
  }

  siguiente() {
    this.mensajeActual++;
    if (this.mensajeActual >= this.mensajes.length) {
      // Arrancamos el juego
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    } else {
      this.mostrarMensaje();
    }
  }
}