import Phaser from 'phaser';
import npc from '../assets/donkey_clean.png';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config.js';

export default class TutorialScene extends Phaser.Scene {

  constructor() {
    super({ key: 'TutorialScene' });
    this.mensajeActual = 0;
    this.nombreJugador = '';
    this.inputEl = null;
    this.mensajes = [
      '¡Bienvenid@ al Tejo del Berriondo!\nYo soy Burrito, tu guía.\n¿Cómo te llamas?',
      'Bienvenid@ {nombre},\nArrastra el tejo hacia abajo\ncomo una resortera y suéltalo\npara lanzarlo hacia arriba.',
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

    // NPC
    this.npcImg = this.add.image(GAME_WIDTH/2 - 12, GAME_HEIGHT/2 - 160, 'npc');
    this.npcImg.setDisplaySize(420, 420);
    this.npcImg.setOrigin(0.5);

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

    // Texto del diálogo — en el mensaje 0 lo subimos para dar espacio al input
    this.textoDial = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 75, '', {
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

    this.textoProgreso = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 285, '', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Input HTML — posicionado con coordenadas reales del canvas
    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.placeholder = 'Tu nombre...';
    this.inputEl.maxLength = 15;
    this.inputEl.style.cssText = `
      position: fixed;
      font-size: 18px;
      padding: 8px 14px;
      border-radius: 8px;
      border: 2px solid #8B2500;
      text-align: center;
      font-family: Arial;
      color: #1a1a2e;
      background: white;
      display: none;
      z-index: 1000;
    `;
    document.body.appendChild(this.inputEl);
    this.inputEl.addEventListener('click', (e) => e.stopPropagation());
    this.inputEl.addEventListener('pointerdown', (e) => e.stopPropagation());

    this.botonSig.on('pointerdown', () => this.siguiente());
    this.botonSig.on('pointerover', () => this.botonSig.setFillStyle(0xaa3300));
    this.botonSig.on('pointerout', () => this.botonSig.setFillStyle(0x8B2500));

    this.mostrarMensaje();
  }

  posicionarInput() {
    const rect = this.game.canvas.getBoundingClientRect();
    const scaleY = rect.height / GAME_HEIGHT;
    const scaleX = rect.width / GAME_WIDTH;

    // El input va debajo del texto y arriba del botón
    const gameY = GAME_HEIGHT / 2 + 120;
    const pixelY = rect.top + gameY * scaleY;
    const pixelX = rect.left + (GAME_WIDTH / 2) * scaleX;
    const inputWidth = Math.round(220 * scaleX);

    this.inputEl.style.top = pixelY + 'px';
    this.inputEl.style.left = (pixelX - inputWidth / 2 - 16) + 'px';
    this.inputEl.style.width = inputWidth + 'px';
    this.inputEl.style.fontSize = Math.round(18 * scaleY) + 'px';
  }

  mostrarMensaje() {
    const texto = this.mensajes[this.mensajeActual].replace('{nombre}', this.nombreJugador || '');

    if (this.mensajeActual === 0) {
      // Subimos el texto para dar espacio al input abajo
      this.textoDial.setY(GAME_HEIGHT / 2 + 75);
      this.inputEl.style.display = 'block';
      this.posicionarInput();
    } else {
      // Texto centrado normal en los demás mensajes
      this.textoDial.setY(GAME_HEIGHT / 2 + 110);
      this.inputEl.style.display = 'none';
    }

    this.textoDial.setText(texto);
    this.textoProgreso.setText((this.mensajeActual + 1) + ' / ' + this.mensajes.length);

    if (this.mensajeActual === this.mensajes.length - 1) {
      this.textoBoton.setText('¡A jugar! 🎯');
    }
  }

  siguiente() {
    if (this.mensajeActual === 0) {
      const nombre = this.inputEl.value.trim();
      this.nombreJugador = nombre || 'Jugador';
      this.registry.set('nombreJugador', this.nombreJugador);
    }

    this.mensajeActual++;
    if (this.mensajeActual >= this.mensajes.length) {
      this.inputEl.remove();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('PersonajeScene');
      });
    } else {
      this.mostrarMensaje();
    }
  }
}