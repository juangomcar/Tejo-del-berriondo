import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PREMIOS_SLOT, SIMBOLOS_POOL, FONT } from '../config/game.config.js';

export default class SlotScene extends Phaser.Scene {

  constructor() {
    super({ key: 'SlotScene' });
  }

  preload() {
    // Textura de partícula si no existe
    if (!this.textures.exists('particula')) {
      const p = this.make.graphics({ x: 0, y: 0, add: false });
      p.fillStyle(0xffffff, 1);
      p.fillCircle(6, 6, 6);
      p.generateTexture('particula', 12, 12);
      p.destroy();
    }
  }

  create() {
    this.ruletas = [];
    this.girando = false;
    this.premioGanado = null;

    // Fondo oscuro animado
    const fondoOscuro = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
    this.tweens.add({ targets: fondoOscuro, alpha: 0.88, duration: 300 });

    this.crearMaquinaSlot();
  }

  crearMaquinaSlot() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const panelW = 370;
    const panelH = 430;

    // Panel principal — entra desde abajo
    const panel = this.add.container(cx, cy + panelH).setAlpha(0);

    // Fondo del panel
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x0d0d20, 1);
    panelGfx.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    // Borde exterior dorado
    panelGfx.lineStyle(3, 0xFFD700, 0.9);
    panelGfx.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    // Borde interior sutil
    panelGfx.lineStyle(1, 0xffffff, 0.1);
    panelGfx.strokeRoundedRect(-panelW / 2 + 5, -panelH / 2 + 5, panelW - 10, panelH - 10, 16);
    // Shine superior
    panelGfx.fillStyle(0xffffff, 0.04);
    panelGfx.fillRoundedRect(-panelW / 2 + 5, -panelH / 2 + 5, panelW - 10, 55, { tl: 15, tr: 15, bl: 0, br: 0 });

    // Título
    const titulo = this.add.text(0, -panelH / 2 + 35, '🎰 SLOT DEL JACKPOT', {
      fontSize: '22px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    const subtitulo = this.add.text(0, -panelH / 2 + 62, '¡Tira y gana un premio!', {
      fontSize: '14px', color: '#8899aa', fontFamily: FONT
    }).setOrigin(0.5);

    // Ruletas
    const posX = [-110, 0, 110];
    const textoRuletas = [];
    const reelGfxList = [];

    posX.forEach((rx, i) => {
      const ry = -30;

      // Sombra del carril
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.5);
      shadow.fillRoundedRect(rx - 45, ry - 47, 90, 94, 12);

      // Fondo del carril
      const reelGfx = this.add.graphics();
      reelGfx.fillStyle(0x060612, 1);
      reelGfx.fillRoundedRect(rx - 43, ry - 45, 86, 90, 10);
      reelGfx.lineStyle(2, 0x2a3a5a, 0.8);
      reelGfx.strokeRoundedRect(rx - 43, ry - 45, 86, 90, 10);
      // Shine del carril
      reelGfx.fillStyle(0xffffff, 0.05);
      reelGfx.fillRoundedRect(rx - 40, ry - 42, 40, 38, { tl: 8, tr: 0, bl: 0, br: 0 });
      reelGfxList.push(reelGfx);

      const rText = this.add.text(rx, ry, '🎰', { fontSize: '44px' }).setOrigin(0.5);
      textoRuletas.push(rText);
    });

    // Línea de pago central
    const lineaPago = this.add.graphics();
    lineaPago.lineStyle(2, 0xFFD700, 0.5);
    lineaPago.lineBetween(-panelW / 2 + 20, -30, panelW / 2 - 20, -30);

    // Botón TIRAR
    const btnY = 100;
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0xFFD700, 1);
    btnGfx.fillRoundedRect(-130, btnY - 30, 260, 60, 14);
    btnGfx.lineStyle(2, 0xcc9900, 0.8);
    btnGfx.strokeRoundedRect(-130, btnY - 30, 260, 60, 14);
    // Shine del botón
    btnGfx.fillStyle(0xffffff, 0.25);
    btnGfx.fillRoundedRect(-126, btnY - 27, 252, 24, { tl: 12, tr: 12, bl: 0, br: 0 });

    const btnTexto = this.add.text(0, btnY, '¡ TIRAR !', {
      fontSize: '30px', color: '#1a0a00', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5);

    const btnZona = this.add.rectangle(0, btnY, 260, 60, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Resultado
    this.textoResultado = this.add.text(0, 148, '', {
      fontSize: '19px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      align: 'center', wordWrap: { width: 300 },
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.textoDescripcion = this.add.text(0, 183, '', {
      fontSize: '13px', color: '#8899aa', fontFamily: FONT, align: 'center'
    }).setOrigin(0.5);

    this.botonCerrar = this.add.text(0, 207, 'Seguir jugando →', {
      fontSize: '18px', color: '#8899aa', fontFamily: FONT
    }).setOrigin(0.5).setVisible(false).setInteractive({ useHandCursor: true });

    panel.add([
      panelGfx, titulo, subtitulo,
      ...reelGfxList,
      lineaPago, btnGfx, btnTexto, btnZona,
      this.textoResultado, this.textoDescripcion, this.botonCerrar,
      ...textoRuletas
    ]);

    // Referencias para tirar
    this.ruletas = textoRuletas;
    this.botonTirarRef = btnZona;
    this.btnGfxRef = btnGfx;
    this.btnTextoRef = btnTexto;
    this.panelRef = panel;

    btnZona.on('pointerdown', () => this.tirar());
    btnZona.on('pointerover', () => { btnGfx.setAlpha(0.85); });
    btnZona.on('pointerout', () => { btnGfx.setAlpha(1); });

    this.botonCerrar.on('pointerdown', () => {
      this.tweens.add({
        targets: panel,
        y: cy + panelH, alpha: 0,
        duration: 300, ease: 'Power2.easeIn',
        onComplete: () => {
          this.scene.stop('SlotScene');
          this.scene.resume('GameScene');
        }
      });
    });
    this.botonCerrar.on('pointerover', () => this.botonCerrar.setStyle({ color: '#ffffff' }));
    this.botonCerrar.on('pointerout', () => this.botonCerrar.setStyle({ color: '#8899aa' }));

    // Animación de entrada
    this.tweens.add({
      targets: panel,
      y: cy, alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  tirar() {
    if (this.girando) return;
    this.girando = true;
    this.botonTirarRef.disableInteractive();
    this.btnGfxRef.setAlpha(0.4);
    this.btnTextoRef.setAlpha(0.4);
    this.textoResultado.setText('');
    this.textoDescripcion.setText('');
    this.botonCerrar.setVisible(false);

    const simbolosFinales = this.decidirResultado();

    this.ruletas.forEach((ruleta, i) => {
      const intervalo = this.time.addEvent({
        delay: 60,
        callback: () => ruleta.setText(Phaser.Utils.Array.GetRandom(SIMBOLOS_POOL)),
        repeat: -1
      });

      this.time.delayedCall(900 + i * 700, () => {
        intervalo.remove();
        ruleta.setText(simbolosFinales[i]);
        // Pequeño flash en el carril al parar
        this.tweens.add({ targets: ruleta, scaleX: 1.3, scaleY: 1.3, duration: 120, yoyo: true });

        if (i === 2) {
          this.time.delayedCall(350, () => this.mostrarResultado(simbolosFinales));
        }
      });
    });
  }

  decidirResultado() {
    const gana = Math.random() < 0.4;
    if (!gana) {
      let simbolos;
      do {
        simbolos = [
          Phaser.Utils.Array.GetRandom(SIMBOLOS_POOL),
          Phaser.Utils.Array.GetRandom(SIMBOLOS_POOL),
          Phaser.Utils.Array.GetRandom(SIMBOLOS_POOL),
        ];
      } while (simbolos[0] === simbolos[1] && simbolos[1] === simbolos[2]);
      this.premioGanado = null;
      return simbolos;
    }

    const rand = Math.random();
    let acumulado = 0;
    for (const premio of PREMIOS_SLOT) {
      acumulado += premio.probabilidad;
      if (rand < acumulado) {
        this.premioGanado = premio;
        return [...premio.simbolos];
      }
    }
    this.premioGanado = PREMIOS_SLOT[0];
    return [...PREMIOS_SLOT[0].simbolos];
  }

  mostrarResultado() {
    this.girando = false;

    if (this.premioGanado) {
      // Flash dorado + partículas de victoria
      this.cameras.main.flash(500, 255, 215, 0, false);

      if (this.textures.exists('particula')) {
        const emitter = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'particula', {
          speed: { min: 120, max: 350 },
          angle: { min: 0, max: 360 },
          scale: { start: 1.3, end: 0 },
          lifespan: 900,
          tint: [0xFFD700, 0xff8800, 0xff4400, 0xffffff],
          emitting: false
        }).setDepth(30);
        emitter.explode(40);
        this.time.delayedCall(1100, () => emitter.destroy());
      }

      this.textoResultado.setText(this.premioGanado.texto)
        .setStyle({ color: this.premioGanado.color, fontSize: '19px' });
      this.textoDescripcion.setText(this.premioGanado.descripcion);
      this.tweens.add({
        targets: this.textoResultado,
        scaleX: 1.25, scaleY: 1.25,
        duration: 200, yoyo: true, repeat: 2
      });
    } else {
      this.textoResultado.setText('Sin premio esta vez... 😤')
        .setStyle({ color: '#777788', fontSize: '17px' });
    }

    this.botonTirarRef.disableInteractive();
    this.btnGfxRef.setAlpha(0);
    this.btnTextoRef.setAlpha(0);
    this.botonCerrar.setVisible(true);
  }
}
