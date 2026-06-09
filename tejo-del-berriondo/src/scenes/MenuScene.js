import Phaser from 'phaser';
import logo from '../assets/logo.png';
import { GAME_WIDTH, GAME_HEIGHT, FONT, RESTAURANTE } from '../config/game.config.js';

export default class MenuScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    this.load.image('logo', logo);
  }

  create() {
    this.crearFondo();
    this.crearEstrellas();
    this.crearMontanas();
    this.crearLogoConGlow();
    this.crearBoton();
    this.crearConfeti();
    this.crearEtiquetaRestaurante();
  }

  crearFondo() {
    // Gradiente principal: azul-negro arriba → púrpura profundo abajo
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x020208, 0x020208, 0x0f0520, 0x0f0520, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Halo cálido en el centro — como luz de antorcha del restaurante
    const halo = this.add.graphics();
    halo.fillStyle(0x6b1a00, 0.18);
    halo.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT * 0.62, 300);
    halo.fillStyle(0x3d0e00, 0.25);
    halo.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT * 0.62, 200);

    // Resplandor sutil en la parte superior
    const topGlow = this.add.graphics();
    topGlow.fillStyle(0x0a0530, 0.6);
    topGlow.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.4);
  }

  crearEstrellas() {
    for (let i = 0; i < 90; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT * 0.6);
      const size = Phaser.Math.FloatBetween(0.6, 2.2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);

      // 25% de estrellas tienen halo suave
      if (Math.random() < 0.25) {
        const halo = this.add.circle(x, y, size * 4, 0xffffff, 0.04);
        this.tweens.add({
          targets: halo,
          alpha: 0,
          duration: Phaser.Math.Between(1500, 3500),
          yoyo: true,
          repeat: -1,
          delay: Phaser.Math.Between(0, 3000)
        });
      }

      const estrella = this.add.circle(x, y, size, 0xffffff, alpha);
      this.tweens.add({
        targets: estrella,
        alpha: 0.05,
        duration: Phaser.Math.Between(800, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2500)
      });
    }
  }

  crearMontanas() {
    // Capa 3 — montañas muy al fondo (más claras, difuminadas)
    const m3 = this.add.graphics();
    m3.fillStyle(0x0d0820, 1);
    m3.fillTriangle(60, GAME_HEIGHT * 0.55, 220, GAME_HEIGHT * 0.3, 360, GAME_HEIGHT * 0.55);
    m3.fillTriangle(200, GAME_HEIGHT * 0.55, 380, GAME_HEIGHT * 0.35, GAME_WIDTH + 20, GAME_HEIGHT * 0.55);

    // Capa 2 — montañas medias
    const m2 = this.add.graphics();
    m2.fillStyle(0x0a0518, 1);
    m2.fillTriangle(-10, GAME_HEIGHT * 0.58, 160, GAME_HEIGHT * 0.28, 310, GAME_HEIGHT * 0.58);
    m2.fillTriangle(170, GAME_HEIGHT * 0.58, 360, GAME_HEIGHT * 0.22, GAME_WIDTH + 10, GAME_HEIGHT * 0.58);

    // Capa 1 — montañas más cercanas (más oscuras)
    const m1 = this.add.graphics();
    m1.fillStyle(0x060310, 1);
    m1.fillTriangle(-20, GAME_HEIGHT * 0.62, 130, GAME_HEIGHT * 0.4, 260, GAME_HEIGHT * 0.62);
    m1.fillTriangle(220, GAME_HEIGHT * 0.62, 380, GAME_HEIGHT * 0.44, GAME_WIDTH + 20, GAME_HEIGHT * 0.62);

    // Suelo / horizonte
    const suelo = this.add.graphics();
    suelo.fillStyle(0x040210, 1);
    suelo.fillRect(0, GAME_HEIGHT * 0.62, GAME_WIDTH, GAME_HEIGHT * 0.38);
  }

  crearLogoConGlow() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 75;

    // Anillos de glow concéntricos — cada uno a su propio ritmo
    const ring1 = this.add.circle(cx, cy, 185, 0xFFD700, 0.04);
    const ring2 = this.add.circle(cx, cy, 160, 0xff8800, 0.07);
    const ring3 = this.add.circle(cx, cy, 135, 0xFFD700, 0.1);

    this.tweens.add({ targets: ring1, scaleX: 1.15, scaleY: 1.15, alpha: 0.01, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: ring2, scaleX: 1.12, scaleY: 1.12, alpha: 0.03, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 300 });
    this.tweens.add({ targets: ring3, scaleX: 1.08, scaleY: 1.08, alpha: 0.05, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 600 });

    // Logo
    const logoImg = this.add.image(cx, cy, 'logo');
    logoImg.setDisplaySize(330, 330);

    // Float suave
    this.tweens.add({
      targets: logoImg,
      y: cy - 12,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtítulo
    this.add.text(cx, cy + 170, 'El juego del tejo más berriondo', {
      fontSize: '16px',
      color: '#c47a4a',
      fontFamily: FONT,
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  crearBoton() {
    const cx = GAME_WIDTH / 2;
    const by = GAME_HEIGHT / 2 + 195;

    // Glow exterior difuminado del botón
    const glow1 = this.add.graphics();
    glow1.fillStyle(0x8B2500, 0.15);
    glow1.fillRoundedRect(cx - 150, by - 45, 300, 90, 20);

    // Fondo del botón
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x6b1a00, 1);
    btnGfx.fillRoundedRect(cx - 135, by - 33, 270, 66, 14);

    // Highlight superior (efecto 3D)
    const highlight = this.add.graphics();
    highlight.fillStyle(0xffffff, 0.06);
    highlight.fillRoundedRect(cx - 130, by - 30, 260, 28, { tl: 12, tr: 12, bl: 0, br: 0 });

    // Borde dorado animado
    const border = this.add.graphics();
    border.lineStyle(2.5, 0xFFD700, 0.9);
    border.strokeRoundedRect(cx - 135, by - 33, 270, 66, 14);

    // Texto
    const botonTexto = this.add.text(cx, by, '¡ JUGAR !', {
      fontSize: '34px',
      color: '#FFD700',
      fontFamily: FONT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Zona interactiva
    const zona = this.add.rectangle(cx, by, 270, 66, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Pulse
    this.tweens.add({
      targets: [btnGfx, botonTexto, border, highlight],
      scaleX: 1.04, scaleY: 1.04,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Brillo del borde pulsante
    this.tweens.add({
      targets: border,
      alpha: 0.4,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    zona.on('pointerdown', () => this.iniciarJuego());
    zona.on('pointerover', () => {
      btnGfx.clear();
      btnGfx.fillStyle(0x9b2500, 1);
      btnGfx.fillRoundedRect(cx - 135, by - 33, 270, 66, 14);
      botonTexto.setStyle({ color: '#ffffff' });
    });
    zona.on('pointerout', () => {
      btnGfx.clear();
      btnGfx.fillStyle(0x6b1a00, 1);
      btnGfx.fillRoundedRect(cx - 135, by - 33, 270, 66, 14);
      botonTexto.setStyle({ color: '#FFD700' });
    });

    // Instrucción pequeña
    this.add.text(cx, by + 55, 'Arrastra y lanza el tejo', {
      fontSize: '14px',
      color: '#665555',
      fontFamily: FONT
    }).setOrigin(0.5);
  }

  crearConfeti() {
    const colores = [0xFFD700, 0xe94560, 0x4488ff, 0x00ff88, 0xff8800, 0xff44cc];
    for (let i = 0; i < 28; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(-60, GAME_HEIGHT * 0.5);
      const color = Phaser.Utils.Array.GetRandom(colores);
      const tipo = Phaser.Math.Between(0, 2);

      let particula;
      if (tipo === 0) {
        particula = this.add.rectangle(x, y, Phaser.Math.Between(5, 9), Phaser.Math.Between(4, 7), color, 0.75);
      } else if (tipo === 1) {
        particula = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.7);
      } else {
        particula = this.add.triangle(x, y, 0, 8, 8, 8, 4, 0, color, 0.7);
      }

      this.tweens.add({
        targets: particula,
        y: GAME_HEIGHT + 30,
        x: x + Phaser.Math.Between(-50, 50),
        rotation: Phaser.Math.FloatBetween(0, Math.PI * 6),
        alpha: 0.1,
        duration: Phaser.Math.Between(4000, 9000),
        delay: Phaser.Math.Between(0, 5000),
        repeat: -1,
        onRepeat: () => {
          particula.x = Phaser.Math.Between(0, GAME_WIDTH);
          particula.y = -15;
          particula.alpha = 0.75;
        }
      });
    }
  }

  crearEtiquetaRestaurante() {
    // Fondo de la etiqueta
    const gfx = this.add.graphics();
    gfx.fillStyle(0x000000, 0.4);
    gfx.fillRoundedRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT - 52, 240, 36, 10);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 34, RESTAURANTE.nombre, {
      fontSize: '14px',
      color: '#c47a4a',
      fontFamily: FONT
    }).setOrigin(0.5);
  }

  iniciarJuego() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TutorialScene');
    });
  }
}
