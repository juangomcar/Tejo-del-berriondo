import Phaser from 'phaser';
import npc from '../assets/donkey_clean.png';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/game.config.js';

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
    this.crearFondo();

    // NPC Burrito
    this.npcImg = this.add.image(GAME_WIDTH / 2 - 12, GAME_HEIGHT / 2 - 155, 'npc');
    this.npcImg.setDisplaySize(400, 400);
    this.npcImg.setOrigin(0.5);

    this.tweens.add({
      targets: this.npcImg,
      y: GAME_HEIGHT / 2 - 125,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.crearDialogo();
    this.crearBoton();

    // Input HTML
    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.placeholder = 'Tu nombre...';
    this.inputEl.maxLength = 15;
    this.inputEl.style.cssText = `
      position: fixed;
      font-size: 18px;
      font-family: 'Baloo 2', Arial, sans-serif;
      padding: 10px 16px;
      border-radius: 10px;
      border: 2px solid #FFD700;
      text-align: center;
      color: #1a1a2e;
      background: white;
      display: none;
      z-index: 1000;
      outline: none;
      box-shadow: 0 0 12px rgba(255,215,0,0.4);
    `;
    document.body.appendChild(this.inputEl);
    this.inputEl.addEventListener('click', (e) => e.stopPropagation());
    this.inputEl.addEventListener('pointerdown', (e) => e.stopPropagation());

    this.botonSig.on('pointerdown', () => this.siguiente());

    this.mostrarMensaje();
  }

  crearFondo() {
    // Gradiente de fondo
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050512, 0x050512, 0x0a0f20, 0x0a0f20, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Partículas flotantes de ambiente
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(10, GAME_WIDTH - 10);
      const y = Phaser.Math.Between(10, GAME_HEIGHT - 10);
      const r = Phaser.Math.FloatBetween(1, 3);
      const dot = this.add.circle(x, y, r, 0xFFD700, Phaser.Math.FloatBetween(0.03, 0.12));
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(20, 60),
        alpha: 0,
        duration: Phaser.Math.Between(2500, 5000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => { dot.y = y; dot.alpha = Phaser.Math.FloatBetween(0.03, 0.12); }
      });
    }
  }

  crearDialogo() {
    const cx = GAME_WIDTH / 2;
    const cajaY = GAME_HEIGHT / 2 + 115;

    // Sombra de la caja
    const sombra = this.add.graphics();
    sombra.fillStyle(0x000000, 0.4);
    sombra.fillRoundedRect(cx - 188, cajaY - 92, 380, 188, 18);

    // Caja de diálogo con borde dorado
    this.cajaGfx = this.add.graphics();
    this.cajaGfx.fillStyle(0xf5f0e8, 1);
    this.cajaGfx.fillRoundedRect(cx - 185, cajaY - 90, 370, 182, 16);
    this.cajaGfx.lineStyle(3, 0x8B2500, 0.9);
    this.cajaGfx.strokeRoundedRect(cx - 185, cajaY - 90, 370, 182, 16);
    // Borde interior dorado
    this.cajaGfx.lineStyle(1.5, 0xFFD700, 0.4);
    this.cajaGfx.strokeRoundedRect(cx - 181, cajaY - 86, 362, 174, 13);

    // Texto del diálogo
    this.textoDial = this.add.text(cx, cajaY - 10, '', {
      fontSize: '18px',
      color: '#1a0a00',
      fontFamily: FONT,
      align: 'center',
      wordWrap: { width: 340 },
      lineSpacing: 4
    }).setOrigin(0.5);

    // Indicador de progreso (dots)
    this.dotsContainer = this.add.container(cx, cajaY + 78);
    this.puntosDots = [];
    for (let i = 0; i < this.mensajes.length; i++) {
      const dot = this.add.circle((i - (this.mensajes.length - 1) / 2) * 18, 0, 5, 0x8B2500, 0.3);
      this.dotsContainer.add(dot);
      this.puntosDots.push(dot);
    }
  }

  crearBoton() {
    const cx = GAME_WIDTH / 2;
    const by = GAME_HEIGHT / 2 + 240;

    // Fondo del botón
    this.botonGfx = this.add.graphics();
    this.botonGfx.fillStyle(0x6b1a00, 1);
    this.botonGfx.fillRoundedRect(cx - 120, by - 28, 240, 56, 12);
    this.botonGfx.lineStyle(2, 0xFFD700, 0.8);
    this.botonGfx.strokeRoundedRect(cx - 120, by - 28, 240, 56, 12);

    this.textoBoton = this.add.text(cx, by, 'Siguiente →', {
      fontSize: '22px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5);

    // Zona interactiva
    this.botonSig = this.add.rectangle(cx, by, 240, 56, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    this.botonSig.on('pointerover', () => {
      this.botonGfx.clear();
      this.botonGfx.fillStyle(0x9b2500, 1);
      this.botonGfx.fillRoundedRect(cx - 120, by - 28, 240, 56, 12);
      this.botonGfx.lineStyle(2, 0xFFD700, 1);
      this.botonGfx.strokeRoundedRect(cx - 120, by - 28, 240, 56, 12);
    });
    this.botonSig.on('pointerout', () => {
      this.botonGfx.clear();
      this.botonGfx.fillStyle(0x6b1a00, 1);
      this.botonGfx.fillRoundedRect(cx - 120, by - 28, 240, 56, 12);
      this.botonGfx.lineStyle(2, 0xFFD700, 0.8);
      this.botonGfx.strokeRoundedRect(cx - 120, by - 28, 240, 56, 12);
    });
  }

  posicionarInput() {
    const rect = this.game.canvas.getBoundingClientRect();
    const scaleY = rect.height / GAME_HEIGHT;
    const scaleX = rect.width / GAME_WIDTH;
    const gameY = GAME_HEIGHT / 2 + 125;
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
      this.textoDial.setY(GAME_HEIGHT / 2 + 75);
      this.inputEl.style.display = 'block';
      this.posicionarInput();
    } else {
      this.textoDial.setY(GAME_HEIGHT / 2 + 110);
      this.inputEl.style.display = 'none';
    }

    this.textoDial.setText(texto);

    // Actualizar dots de progreso
    this.puntosDots.forEach((dot, i) => {
      dot.setFillStyle(0x8B2500, i === this.mensajeActual ? 1 : 0.25);
      if (i === this.mensajeActual) {
        this.tweens.add({ targets: dot, scaleX: 1.4, scaleY: 1.4, duration: 200, yoyo: true });
      } else {
        dot.setScale(1);
      }
    });

    if (this.mensajeActual === this.mensajes.length - 1) {
      this.textoBoton.setText('¡A jugar! 🎯');
    } else {
      this.textoBoton.setText('Siguiente →');
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
      // Animación de transición del texto
      this.tweens.add({
        targets: this.textoDial,
        alpha: 0, x: GAME_WIDTH / 2 - 20,
        duration: 150,
        onComplete: () => {
          this.mostrarMensaje();
          this.textoDial.setX(GAME_WIDTH / 2 + 20);
          this.tweens.add({
            targets: this.textoDial,
            alpha: 1, x: GAME_WIDTH / 2,
            duration: 200
          });
        }
      });
    }
  }
}
