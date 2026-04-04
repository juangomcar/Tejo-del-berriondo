import Phaser from 'phaser';
import logo from '../assets/logo.png';
import casinoBg from '../assets/casino-bg.mp3';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config.js';

// MenuScene — pantalla de inicio del juego
// Diseño inspirado en el logo: cálido, colombiano, con personalidad
export default class MenuScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {   
    this.load.image('logo', logo);
    this.load.audio('casino-bg', casinoBg);
  }

  create() {
    // Fondo degradado — café oscuro arriba, café cálido abajo
    const fondo = this.add.graphics();
    fondo.fillGradientStyle(0x1a0a00, 0x1a0a00, 0x3d1c00, 0x3d1c00, 1);
    fondo.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Estrellas de fondo — ambiente nocturno de pueblo
    this.crearEstrellas();

    // Montañas de fondo — silueta simple
    this.crearMontanas();

    // Logo del juego — centrado arriba
    const logoImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'logo');
    logoImg.setDisplaySize(340, 340);

    // Animación suave del logo — sube y baja
    this.tweens.add({
      targets: logoImg,
      y: GAME_HEIGHT / 2 - 90,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtítulo
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 'El juego del tejo más berriondo', {
      fontSize: '16px',
      color: '#d4956a',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Botón JUGAR — pulsa solo para llamar la atención
    const botonFondo = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 185, 260, 65, 0x8B2500)
      .setStrokeStyle(3, 0xFFD700);

    const botonTexto = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 185, '¡JUGAR!', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animación de pulso en el botón
    this.tweens.add({
      targets: [botonFondo, botonTexto],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Hacemos el botón interactivo
    botonFondo.setInteractive({ useHandCursor: true });
    botonFondo.on('pointerdown', () => this.iniciarJuego());
    botonFondo.on('pointerover', () => {
      botonFondo.setFillStyle(0xaa3300);
      botonTexto.setStyle({ color: '#ffffff' });
    });
    botonFondo.on('pointerout', () => {
      botonFondo.setFillStyle(0x8B2500);
      botonTexto.setStyle({ color: '#FFD700' });
    });

    // Texto de instrucción pequeño
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 240, 'Arrastra y lanza el tejo', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Nombre del restaurante abajo — se configura por tenant después
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Restaurante de Julián', {
      fontSize: '14px',
      color: '#d4956a',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Partículas de confeti cayendo — dan sensación de celebración
    this.crearConfeti();
  }

  crearEstrellas() {
    // 80 estrellitas blancas parpadeando de fondo
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT / 2);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const estrella = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));

      // Cada estrella parpadea a su propio ritmo
      this.tweens.add({
        targets: estrella,
        alpha: 0.1,
        duration: Phaser.Math.Between(800, 2500),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  crearMontanas() {
    // Silueta de montañas — referencia al logo
    const montanas = this.add.graphics();
    montanas.fillStyle(0x2a1000, 1);

    // Montaña izquierda
    montanas.fillTriangle(0, GAME_HEIGHT / 2 + 60, 180, GAME_HEIGHT / 2 - 80, 320, GAME_HEIGHT / 2 + 60);
    // Montaña derecha
    montanas.fillTriangle(160, GAME_HEIGHT / 2 + 60, 360, GAME_HEIGHT / 2 - 60, GAME_WIDTH, GAME_HEIGHT / 2 + 60);
    // Montaña centro más alta
    montanas.fillTriangle(120, GAME_HEIGHT / 2 + 60, 280, GAME_HEIGHT / 2 - 120, 420, GAME_HEIGHT / 2 + 60);
  }

  crearConfeti() {
    // Partículas de colores cayendo — festivo
    const colores = [0xFFD700, 0xe94560, 0x4488ff, 0x00ff88, 0xff8800];
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(-50, GAME_HEIGHT);
      const color = Phaser.Utils.Array.GetRandom(colores);
      const particula = this.add.rectangle(x, y, 6, 6, color, 0.7);

      // Cada partícula cae a diferente velocidad
      this.tweens.add({
        targets: particula,
        y: GAME_HEIGHT + 20,
        x: x + Phaser.Math.Between(-30, 30),
        rotation: Phaser.Math.FloatBetween(0, Math.PI * 4),
        duration: Phaser.Math.Between(3000, 7000),
        delay: Phaser.Math.Between(0, 4000),
        repeat: -1,
        onRepeat: () => {
          particula.x = Phaser.Math.Between(0, GAME_WIDTH);
          particula.y = -10;
        }
      });
    }
  }

  iniciarJuego() {
    // Transición suave al juego
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TutorialScene');
    });
  }
}