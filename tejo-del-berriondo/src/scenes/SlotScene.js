import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PREMIOS_SLOT, SIMBOLOS_POOL } from '../config/game.config.js';

// SlotScene — mini slot machine que aparece después del jackpot
// Los premios son del restaurante — por ahora mock del Restaurante de Julián
export default class SlotScene extends Phaser.Scene {

  constructor() {
    super({ key: 'SlotScene' });
    this.ruletas = [];
    this.girando = false;
    this.premioGanado = null;
  }

  create() {
    // Fondo oscuro semitransparente encima del juego
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Caja principal de la slot
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, 360, 380, 0x1a1a2e);
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, 360, 380, 0xFFD700, 0)
      .setStrokeStyle(4, 0xFFD700);

    // Título
    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 160, '🎰 SLOT DEL JACKPOT', {
      fontSize: '22px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 130, '¡Tira y gana un premio del restaurante!', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Las 3 ruletas
    const posiciones = [GAME_WIDTH/2 - 105, GAME_WIDTH/2, GAME_WIDTH/2 + 105];
    posiciones.forEach((x) => {
      // Fondo de cada ruleta
      this.add.rectangle(x, GAME_HEIGHT/2 - 30, 85, 85, 0x0d0d1a);
      this.add.rectangle(x, GAME_HEIGHT/2 - 30, 85, 85, 0x333333, 0)
        .setStrokeStyle(2, 0x555555);

      // Emoji inicial
      const texto = this.add.text(x, GAME_HEIGHT/2 - 30, '🎰', {
        fontSize: '42px'
      }).setOrigin(0.5);

      this.ruletas.push(texto);
    });

    // Botón tirar
    this.botonTirar = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 60, '¡ TIRAR !', {
      fontSize: '30px', color: '#000000', fontFamily: 'Arial', fontStyle: 'bold',
      backgroundColor: '#FFD700', padding: { x: 35, y: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.botonTirar.on('pointerdown', () => this.tirar());
    this.botonTirar.on('pointerover', () => this.botonTirar.setAlpha(0.8));
    this.botonTirar.on('pointerout', () => this.botonTirar.setAlpha(1));

    // Texto de resultado
    this.textoResultado = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 130, '', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      align: 'center', wordWrap: { width: 320 }
    }).setOrigin(0.5);

    // Descripción del premio
    this.textoDescripcion = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 165, '', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    // Botón cerrar — aparece después del resultado
    this.botonCerrar = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 200, 'Seguir jugando →', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false).setInteractive({ useHandCursor: true });

    this.botonCerrar.on('pointerdown', () => {
      this.scene.stop('SlotScene');
      this.scene.resume('GameScene');
    });
    this.botonCerrar.on('pointerover', () => this.botonCerrar.setStyle({ color: '#ffffff' }));
    this.botonCerrar.on('pointerout', () => this.botonCerrar.setStyle({ color: '#aaaaaa' }));
  }

  tirar() {
    if (this.girando) return;
    this.girando = true;
    this.botonTirar.setVisible(false);
    this.textoResultado.setText('');
    this.textoDescripcion.setText('');

    // Decidimos el resultado con probabilidades ponderadas
    const simbolosFinales = this.decidirResultado();

    // Animamos las ruletas — se detienen una por una
    this.ruletas.forEach((ruleta, i) => {
      const intervalo = this.time.addEvent({
        delay: 80,
        callback: () => {
          ruleta.setText(Phaser.Utils.Array.GetRandom(SIMBOLOS_POOL));
        },
        repeat: -1
      });

      // Se detienen escalonadas — 1s, 1.8s, 2.6s
      this.time.delayedCall(1000 + i * 800, () => {
        intervalo.remove();
        ruleta.setText(simbolosFinales[i]);

        // Cuando para la última mostramos el resultado
        if (i === 2) {
          this.time.delayedCall(400, () => this.mostrarResultado(simbolosFinales));
        }
      });
    });
  }

  decidirResultado() {
    // Probabilidad total de ganar algo — 40%
    const gana = Math.random() < 0.4;

    if (!gana) {
      // Combinación perdedora — nos aseguramos que no coincidan los 3
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

    // Seleccionamos el premio con probabilidades ponderadas
    // Los premios más valiosos tienen menos probabilidad
    const rand = Math.random();
    let acumulado = 0;

    for (const premio of PREMIOS_SLOT) {
      acumulado += premio.probabilidad;
      if (rand < acumulado) {
        this.premioGanado = premio;
        return [...premio.simbolos];
      }
    }

    // Fallback al primer premio si algo falla
    this.premioGanado = PREMIOS_SLOT[0];
    return [...PREMIOS_SLOT[0].simbolos];
  }

  mostrarResultado(simbolosFinales) {
    this.girando = false;

    if (this.premioGanado) {
      // Flash de pantalla
      const flash = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0.4);
      this.time.delayedCall(150, () => flash.destroy());

      this.textoResultado
        .setText(this.premioGanado.texto)
        .setStyle({ color: this.premioGanado.color, fontSize: '20px' });

      this.textoDescripcion.setText(this.premioGanado.descripcion);

      // Animación del texto ganador
      this.tweens.add({
        targets: this.textoResultado,
        scaleX: 1.2, scaleY: 1.2,
        duration: 200, yoyo: true, repeat: 2
      });

    } else {
      this.textoResultado
        .setText('Sin premio esta vez... 😤')
        .setStyle({ color: '#888888', fontSize: '18px' });
    }

    this.botonCerrar.setVisible(true);
  }
}