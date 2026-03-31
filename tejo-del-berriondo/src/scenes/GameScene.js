import Phaser from 'phaser';
import casinoBg from '../assets/casino-bg.mp3';
import {
  GAME_WIDTH, GAME_HEIGHT,
  PHYSICS, COLORS,
  PUNTOS_JACKPOT, NIVELES
} from '../config/game.config.js';

// GameScene — escena principal del juego
// Maneja el tejo, las dianas, los niveles y toda la lógica del juego
export default class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameScene' });
    this.tejoX = GAME_WIDTH / 2;
    this.tejoY = GAME_HEIGHT - 100;
    this.lanzado = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.puntos = 0;
    this.puntosJackpot = 0;      // barra jackpot — independiente de los puntos del juego
    this.yaGolpeo = false;
    this.timerQuieto = null;
    this.lineaResortera = null;
    this.golpesConsecutivos = 0;
    this.aciertosNivel = 0;
    this.nivelActual = 1;
    this.audioCtx = null;
    this.musica = null;
    this.vientoFuerza = 0;
    this.vientoDireccion = 1;
    this.obstaculoObj = null;
    this.obstaculoDireccion = 1;
    this.dianas = [];
  }

  preload() {
    // Textura del tejo — círculo metálico con brillo
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(53, 53, 25);
    g.fillStyle(0x999999, 1);
    g.fillCircle(50, 50, 25);
    g.fillStyle(0xcccccc, 0.6);
    g.fillCircle(42, 42, 8);
    g.generateTexture('tejo', 100, 100);
    g.destroy();

    // Diana buena — roja, suma puntos
    const d = this.make.graphics({ x: 0, y: 0, add: false });
    d.fillStyle(COLORS.dianabuena, 1);
    d.fillCircle(50, 50, 35);
    d.fillStyle(0xffffff, 1);
    d.fillCircle(50, 50, 20);
    d.fillStyle(COLORS.dianabuena, 1);
    d.fillCircle(50, 50, 8);
    d.generateTexture('diana-buena', 100, 100);
    d.destroy();

    // Diana trampa — azul, quita puntos y resetea aciertos
    const dt = this.make.graphics({ x: 0, y: 0, add: false });
    dt.fillStyle(COLORS.dianatrampa, 1);
    dt.fillCircle(50, 50, 35);
    dt.fillStyle(0xffffff, 1);
    dt.fillCircle(50, 50, 20);
    dt.fillStyle(COLORS.dianatrampa, 1);
    dt.fillRect(35, 45, 30, 10);
    dt.generateTexture('diana-trampa', 100, 100);
    dt.destroy();

    // Obstáculo — rectángulo gris que se mueve en nivel 3
    const o = this.make.graphics({ x: 0, y: 0, add: false });
    o.fillStyle(COLORS.obstaculo, 1);
    o.fillRect(0, 0, 120, 25);
    o.generateTexture('obstaculo', 120, 25);
    o.destroy();

    this.load.audio('casino-bg', casinoBg);
  }

  create() {
    // Fondo
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, COLORS.background);

    // Paredes del mundo — el tejo no se escapa
    this.matter.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT-10, GAME_WIDTH, 20, { isStatic: true, label: 'suelo', restitution: 0.4 });
    this.matter.add.rectangle(10, GAME_HEIGHT/2, 20, GAME_HEIGHT, { isStatic: true });
    this.matter.add.rectangle(GAME_WIDTH-10, GAME_HEIGHT/2, 20, GAME_HEIGHT, { isStatic: true });
    this.matter.add.rectangle(GAME_WIDTH/2, 10, GAME_WIDTH, 20, { isStatic: true });

    // Tejo
    this.tejo = this.matter.add.image(this.tejoX, this.tejoY, 'tejo');
    this.tejo.setCircle(25);
    this.tejo.setStatic(true);
    this.tejo.setFriction(PHYSICS.friction);
    this.tejo.setFrictionAir(PHYSICS.frictionAir);
    this.tejo.setBounce(PHYSICS.restitution);
    this.tejo.body.label = 'tejo';

    // Línea de la resortera
    this.lineaResortera = this.add.graphics();

    // UI — puntos
    this.textoPuntos = this.add.text(20, 30, 'Puntos: 0', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial'
    }).setDepth(10);

    // UI — nivel
    this.textoNivel = this.add.text(GAME_WIDTH-20, 30, 'Nivel 1', {
      fontSize: '22px', color: '#FFD700', fontFamily: 'Arial'
    }).setOrigin(1, 0).setDepth(10);

    // UI — progreso de nivel (estrellas)
    this.textoProgreso = this.add.text(GAME_WIDTH/2, 30, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5, 0).setDepth(10);

    // UI — indicador de viento
    this.textoViento = this.add.text(GAME_WIDTH/2, 70, '', {
      fontSize: '16px', color: '#88ccff', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(10);

    // UI — instrucción
    this.textoInstruccion = this.add.text(GAME_WIDTH/2, GAME_HEIGHT-170, 'Arrastra y suelta para lanzar', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(10);

    // Cargamos el primer nivel
    this.cargarNivel(1);

    // Colisiones
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('tejo') && labels.includes('diana-buena')) {
          this.golpearDiana('buena');
        } else if (labels.includes('tejo') && labels.includes('diana-trampa')) {
          this.golpearDiana('trampa');
        }
      });
    });

    // Input — resortera
    this.input.on('pointerdown', (p) => {
      if (this.lanzado) return;
      this.isDragging = true;
      this.startX = p.worldX;
      this.startY = p.worldY;
    });

    this.input.on('pointermove', (p) => {
      if (!this.isDragging || this.lanzado) return;
      const dx = p.worldX - this.tejoX;
      const dy = p.worldY - this.tejoY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist > 200 ? 200 / dist : 1;
      const nx = this.tejoX + dx * factor;
      const ny = this.tejoY + dy * factor;
      this.tejo.setPosition(nx, ny);
      this.lineaResortera.clear();
      this.lineaResortera.lineStyle(3, 0xffaa00, 0.8);
      this.lineaResortera.beginPath();
      this.lineaResortera.moveTo(this.tejoX, this.tejoY);
      this.lineaResortera.lineTo(nx, ny);
      this.lineaResortera.strokePath();
    });

    this.input.on('pointerup', (p) => {
      if (!this.isDragging || this.lanzado) return;
      this.isDragging = false;
      this.lineaResortera.clear();
      const dx = this.tejoX - this.tejo.x;
      const dy = this.tejoY - this.tejo.y;
      if (Math.sqrt(dx*dx + dy*dy) < 20) {
        this.tejo.setPosition(this.tejoX, this.tejoY);
        return;
      }
      this.lanzado = true;
      this.textoInstruccion.setVisible(false);
      this.sonidoLanzar();
      const vx = Phaser.Math.Clamp(dx * 0.5, -35, 35);
      const vy = Phaser.Math.Clamp(dy * 0.5, -35, 35);
      this.tejo.setStatic(false);
      this.tejo.setVelocity(vx, vy);
    });

    // La música arranca con el primer toque del usuario
    this.input.once('pointerdown', () => this.iniciarMusica());
  }

  cargarNivel(numero) {
    const config = NIVELES[numero];
    this.nivelActual = numero;
    this.aciertosNivel = 0;
    this.textoNivel.setText('Nivel ' + numero);

    // Limpiamos dianas anteriores
    this.dianas.forEach(d => { if (d.imagen) d.imagen.destroy(); });
    this.dianas = [];

    // Limpiamos obstáculo anterior
    if (this.obstaculoObj) { this.obstaculoObj.destroy(); this.obstaculoObj = null; }

    // Creamos las dianas del nivel
    config.dianas.forEach(pos => {
      const texturaKey = pos.tipo === 'buena' ? 'diana-buena' : 'diana-trampa';
      const imagen = this.matter.add.image(pos.x, pos.y, texturaKey);
      imagen.setCircle(35);
      imagen.setStatic(true);
      imagen.setSensor(true);
      imagen.body.label = texturaKey;
      this.dianas.push({ imagen, tipo: pos.tipo });
    });

    // Viento
    this.vientoFuerza = config.viento ? config.fuerzaViento : 0;
    if (config.viento) {
      this.vientoDireccion = Math.random() > 0.5 ? 1 : -1;
      this.textoViento.setText(this.vientoDireccion > 0 ? '💨 →' : '← 💨');
    } else {
      this.textoViento.setText('');
    }

    // Obstáculo nivel 3
    if (config.obstaculo) {
      this.obstaculoObj = this.matter.add.image(GAME_WIDTH/2, 400, 'obstaculo');
      this.obstaculoObj.setStatic(true);
      this.obstaculoObj.body.label = 'obstaculo';
      this.obstaculoDireccion = 1;
    }

    // Animación de entrada de nivel
    const textoEntrada = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, '¡NIVEL ' + numero + '!', {
      fontSize: '52px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    this.tweens.add({
      targets: textoEntrada,
      alpha: 1, scaleX: 1.2, scaleY: 1.2,
      duration: 400, yoyo: true, hold: 600,
      onComplete: () => textoEntrada.destroy()
    });

    this.actualizarProgreso();
  }

  actualizarProgreso() {
    const config = NIVELES[this.nivelActual];
    if (!config.aciertosParaSiguiente) {
      this.textoProgreso.setText('🏆 Nivel final');
      return;
    }
    let estrellas = '';
    for (let i = 0; i < config.aciertosParaSiguiente; i++) {
      estrellas += i < this.aciertosNivel ? '⭐' : '☆';
    }
    this.textoProgreso.setText(estrellas);
  }

  golpearDiana(tipo) {
    if (this.yaGolpeo) return;
    this.yaGolpeo = true;
    this.sonidoImpacto();

    if (tipo === 'buena') {
      this.puntos += 500;
      this.textoPuntos.setText('Puntos: ' + this.puntos);
      this.sonidoMonedas();

      // 35% de probabilidad de sumar al jackpot
      if (Math.random() < 0.35) {
        this.puntosJackpot += 500;
        this.actualizarVelocidadMusica();
        if (this.puntosJackpot >= PUNTOS_JACKPOT) {
          this.time.delayedCall(300, () => this.jackpot());
          return;
        }
      }

      // Suma acierto para subir de nivel
      this.aciertosNivel++;
      this.actualizarProgreso();
      this.golpesConsecutivos++;
      if (this.golpesConsecutivos >= 3) {
        this.golpesConsecutivos = 0;
        this.time.delayedCall(300, () => this.sonidoAcordeon());
      }

      // Verificamos si sube de nivel
      const config = NIVELES[this.nivelActual];
      if (config.aciertosParaSiguiente && this.aciertosNivel >= config.aciertosParaSiguiente) {
        const siguiente = this.nivelActual + 1;
        if (siguiente <= 3) {
          this.time.delayedCall(800, () => {
            this.sonidoAcordeon();
            this.cargarNivel(siguiente);
            this.resetearTejo();
          });
          return;
        }
      }

      // Si no pasó nada especial, resetea normal
      this.resetearTejo();

    } else {
      // Diana trampa — quita puntos y resetea aciertos
      this.puntos = Math.max(0, this.puntos - 500);
      this.textoPuntos.setText('Puntos: ' + this.puntos);
      this.aciertosNivel = 0;
      this.golpesConsecutivos = 0;
      this.actualizarProgreso();

      const textoMal = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 50, '-500 😱', {
        fontSize: '36px', color: '#4488ff', fontFamily: 'Arial', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(21);
      this.time.delayedCall(800, () => textoMal.destroy());
      this.time.delayedCall(300, () => this.resetearTejo());
    }
  }

  actualizarVelocidadMusica() {
    if (!this.musica) return;
    const progreso = this.puntosJackpot / PUNTOS_JACKPOT;
    if (progreso > 0.75) {
      this.musica.setRate(1.6);
    } else if (progreso > 0.5) {
      this.musica.setRate(1.3);
    } else if (progreso > 0.25) {
      this.musica.setRate(1.1);
    } else {
      this.musica.setRate(1.0);
    }
  }

  jackpot() {
    this.sonidoAcordeon();
    this.sonidoMonedas();

    const flash = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0.8).setDepth(20);
    this.time.delayedCall(100, () => flash.destroy());

    const textoWin = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, '🎰 JACKPOT! 🎰', {
      fontSize: '42px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    const textoBonus = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 70, '+1000 puntos bonus! 🎁', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(21);

    this.tweens.add({
      targets: [textoWin, textoBonus],
      scaleX: 1.3, scaleY: 1.3,
      duration: 300, yoyo: true, repeat: 3,
      onComplete: () => {
        textoWin.destroy();
        textoBonus.destroy();
        this.puntos += 1000;
        this.puntosJackpot = 0;
        this.textoPuntos.setText('Puntos: ' + this.puntos);
        if (this.musica) this.musica.setRate(1.0);
        // Pausamos GameScene y lanzamos la slot machine
        this.scene.pause();
        this.scene.launch('SlotScene');
      }
    });
  }

  update() {
    if (this.lanzado && this.vientoFuerza > 0 && this.tejo.body) {
      this.tejo.applyForce({ x: this.vientoFuerza * this.vientoDireccion, y: 0 });
    }

    if (this.obstaculoObj && this.nivelActual === 3) {
      const x = this.obstaculoObj.x;
      if (x > GAME_WIDTH - 80) this.obstaculoDireccion = -1;
      if (x < 80) this.obstaculoDireccion = 1;
      this.obstaculoObj.x += 2.5 * this.obstaculoDireccion;
      this.matter.body.setPosition(this.obstaculoObj.body, {
        x: this.obstaculoObj.x, y: this.obstaculoObj.y
      });
    }

    // Reset solo cuando toca el suelo
    if (this.lanzado && this.tejo.y > GAME_HEIGHT - 50) {
      this.resetearTejo();
    }
  }

  resetearTejo() {
    this.timerQuieto = null;
    this.lanzado = false;
    this.yaGolpeo = false;
    this.tejo.setStatic(true);
    this.tejo.setVelocity(0, 0);
    this.tejo.setAngularVelocity(0);
    this.tejo.setPosition(this.tejoX, this.tejoY);
    this.textoInstruccion.setVisible(true);
  }

  iniciarMusica() {
    this.musica = this.sound.add('casino-bg', { loop: true, volume: 0.3 });
    this.musica.play();
  }

  sonidoLanzar() {
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  }

  sonidoImpacto() {
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  }

  sonidoMonedas() {
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    [0, 0.05, 0.1, 0.15, 0.2].forEach((delay, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600 + i * 80, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.1);
    });
  }

  sonidoAcordeon() {
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    [261, 293, 329, 392, 440, 392, 329, 261].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.15);
    });
  }
}