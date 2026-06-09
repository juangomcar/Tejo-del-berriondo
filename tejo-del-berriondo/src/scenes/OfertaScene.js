import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, OFERTAS, FONT } from '../config/game.config.js';

export default class OfertaScene extends Phaser.Scene {

  constructor() {
    super({ key: 'OfertaScene' });
    this.oferta = null;
  }

  create() {
    this.oferta = Phaser.Utils.Array.GetRandom(OFERTAS);

    // Fondo oscuro — fade in
    const fondoOscuro = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
    this.tweens.add({ targets: fondoOscuro, alpha: 0.88, duration: 300 });

    this.crearPanel();
  }

  crearPanel() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const panelW = 360;
    const panelH = 460;

    // El panel entra desde abajo
    const panel = this.add.container(cx, GAME_HEIGHT + panelH / 2).setAlpha(0);

    // Fondo del panel
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x0d0d20, 1);
    panelGfx.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    panelGfx.lineStyle(3, 0xFFD700, 0.9);
    panelGfx.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    panelGfx.lineStyle(1, 0xffffff, 0.08);
    panelGfx.strokeRoundedRect(-panelW / 2 + 5, -panelH / 2 + 5, panelW - 10, panelH - 10, 16);

    // Título
    const titulo = this.add.text(0, -panelH / 2 + 38, '🎁 OFERTA ESPECIAL', {
      fontSize: '22px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Separador decorativo
    const sep1Gfx = this.add.graphics();
    sep1Gfx.lineStyle(1, 0x2a3a5a, 0.8);
    sep1Gfx.lineBetween(-panelW / 2 + 25, -panelH / 2 + 60, panelW / 2 - 25, -panelH / 2 + 60);

    // Emoji del producto (grande)
    const producto = this.add.text(0, -panelH / 2 + 110, this.oferta.producto.split(' ')[0], {
      fontSize: '60px'
    }).setOrigin(0.5);

    // Nombre del producto
    const nombreProducto = this.add.text(0, -panelH / 2 + 165, this.oferta.producto.slice(this.oferta.producto.indexOf(' ') + 1), {
      fontSize: '20px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5);

    // Etiqueta de descuento (prominente)
    const descGfx = this.add.graphics();
    descGfx.fillStyle(0x00aa55, 0.2);
    descGfx.fillRoundedRect(-90, -panelH / 2 + 186, 180, 40, 10);
    descGfx.lineStyle(1.5, 0x00ff88, 0.6);
    descGfx.strokeRoundedRect(-90, -panelH / 2 + 186, 180, 40, 10);

    const descuentoTexto = this.add.text(0, -panelH / 2 + 206, this.oferta.descuento, {
      fontSize: '24px', color: '#00ff88', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Separador
    const sep2Gfx = this.add.graphics();
    sep2Gfx.lineStyle(1, 0x2a3a5a, 0.5);
    sep2Gfx.lineBetween(-panelW / 2 + 25, -panelH / 2 + 238, panelW / 2 - 25, -panelH / 2 + 238);

    // Recompensa
    const recompensaLabel = this.add.text(0, -panelH / 2 + 255, 'Y te damos gratis:', {
      fontSize: '13px', color: '#8899aa', fontFamily: FONT
    }).setOrigin(0.5);

    const recompensaTexto = this.add.text(0, -panelH / 2 + 282, this.oferta.recompensa, {
      fontSize: '30px', fontFamily: FONT, color: this.oferta.color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    const detalleTexto = this.add.text(0, -panelH / 2 + 312, this.oferta.detalleRecompensa, {
      fontSize: '13px', color: this.oferta.color, fontFamily: FONT, fontStyle: 'italic'
    }).setOrigin(0.5);

    // Botón ACEPTAR
    const btnY = panelH / 2 - 95;
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(this.oferta.colorBoton, 1);
    btnGfx.fillRoundedRect(-130, btnY - 28, 260, 56, 14);
    btnGfx.lineStyle(2, 0xffffff, 0.25);
    btnGfx.strokeRoundedRect(-130, btnY - 28, 260, 56, 14);
    btnGfx.fillStyle(0xffffff, 0.12);
    btnGfx.fillRoundedRect(-126, btnY - 25, 252, 22, { tl: 11, tr: 11, bl: 0, br: 0 });

    const btnTexto = this.add.text(0, btnY, '¡Lo pido! 🙌', {
      fontSize: '24px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    const btnZona = this.add.rectangle(0, btnY, 260, 56, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Pulse en el botón aceptar
    this.tweens.add({
      targets: [btnGfx, btnTexto],
      scaleX: 1.04, scaleY: 1.04,
      duration: 650, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Botón RECHAZAR
    const rechazarTexto = this.add.text(0, panelH / 2 - 40, 'Ahora no →', {
      fontSize: '16px', color: '#445566', fontFamily: FONT
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    panel.add([
      panelGfx, titulo, sep1Gfx,
      producto, nombreProducto, descGfx, descuentoTexto,
      sep2Gfx, recompensaLabel, recompensaTexto, detalleTexto,
      btnGfx, btnTexto, btnZona, rechazarTexto
    ]);

    // Animación de entrada
    this.tweens.add({
      targets: panel,
      y: cy, alpha: 1,
      duration: 380,
      ease: 'Back.easeOut'
    });

    const cerrar = (aceptar) => {
      this.tweens.add({
        targets: panel,
        y: GAME_HEIGHT + panelH / 2, alpha: 0,
        duration: 280, ease: 'Power2.easeIn',
        onComplete: () => {
          if (aceptar) {
            this.scene.resume('GameScene', { tejoEspecial: this.oferta.id, descuento: this.oferta.descuento, producto: this.oferta.producto });
          } else {
            this.scene.resume('GameScene', { tejoEspecial: null });
          }
          this.scene.stop('OfertaScene');
        }
      });
    };

    btnZona.on('pointerdown', () => cerrar(true));
    btnZona.on('pointerover', () => btnGfx.setAlpha(0.85));
    btnZona.on('pointerout', () => btnGfx.setAlpha(1));
    rechazarTexto.on('pointerdown', () => cerrar(false));
    rechazarTexto.on('pointerover', () => rechazarTexto.setStyle({ color: '#8899aa' }));
    rechazarTexto.on('pointerout', () => rechazarTexto.setStyle({ color: '#445566' }));
  }
}
