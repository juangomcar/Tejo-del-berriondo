import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, OFERTAS } from '../config/game.config.js';

// OfertaScene — popup que aparece cada 8500 puntos
// Le ofrece al jugador un descuento a cambio de un tejo especial
export default class OfertaScene extends Phaser.Scene {

  constructor() {
    super({ key: 'OfertaScene' });
    this.oferta = null;
  }

  create() {
    // Elegimos una oferta aleatoria
    this.oferta = Phaser.Utils.Array.GetRandom(OFERTAS);

    // Fondo oscuro semitransparente
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Caja principal
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, 360, 420, 0x1a1a2e);
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, 360, 420, 0xFFD700, 0)
      .setStrokeStyle(3, 0xFFD700);

    // Título
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 180, '🎁 OFERTA ESPECIAL', {
      fontSize: '22px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Producto y descuento
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 130, this.oferta.producto, {
      fontSize: '36px', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 90, this.oferta.descuento, {
      fontSize: '28px', color: '#00ff88', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Separador
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2 - 60, 300, 2, 0x444444);

    // Recompensa
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 30, 'Y te damos gratis:', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 10, this.oferta.recompensa, {
      fontSize: '32px', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 50, this.oferta.detalleRecompensa, {
      fontSize: '14px', color: this.oferta.color, fontFamily: 'Arial', fontStyle: 'italic'
    }).setOrigin(0.5);

    // Botón aceptar
    const botonSi = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2 + 120, 280, 55, this.oferta.colorBoton)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 120, '¡Lo pido! 🙌', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Botón rechazar
    const botonNo = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 180, 'Ahora no →', {
      fontSize: '16px', color: '#666666', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Animación del botón
    this.tweens.add({
      targets: botonSi,
      scaleX: 1.05, scaleY: 1.05,
      duration: 600, yoyo: true, repeat: -1
    });

    botonSi.on('pointerdown', () => this.aceptarOferta());
    botonNo.on('pointerdown', () => this.rechazarOferta());
    botonNo.on('pointerover', () => botonNo.setStyle({ color: '#ffffff' }));
    botonNo.on('pointerout', () => botonNo.setStyle({ color: '#666666' }));
  }

  aceptarOferta() {
    // Le avisamos a GameScene qué tejo especial activar
    this.scene.resume('GameScene', {
      tejoEspecial: this.oferta.id,
      descuento: this.oferta.descuento,
      producto: this.oferta.producto
    });
    this.scene.stop('OfertaScene');
  }

  rechazarOferta() {
    this.scene.resume('GameScene', { tejoEspecial: null });
    this.scene.stop('OfertaScene');
  }
}