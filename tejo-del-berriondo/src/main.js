import Phaser from 'phaser';
import casinoBg from './assets/casino-bg.mp3';

const W = 480;
const H = 854;
const PUNTOS_JACKPOT = 3000;

const NIVELES = {
  1: {
    aciertosParaSiguiente: 3,
    dianas: [{ x: W/2, y: 200, tipo: 'buena' }],
    viento: false,
    obstaculo: false
  },
  2: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: W/3, y: 180, tipo: 'buena' },
      { x: (W/3)*2, y: 250, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.003,
    obstaculo: false
  },
  3: {
    aciertosParaSiguiente: null,
    dianas: [
      { x: W/3, y: 180, tipo: 'buena' },
      { x: (W/3)*2, y: 250, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.004,
    obstaculo: true
  }
};

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.tejoX = W / 2;
    this.tejoY = H - 100;
    this.lanzado = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.puntos = 0;
    this.puntosJackpot = 0;
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
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(53, 53, 25);
    g.fillStyle(0x999999, 1);
    g.fillCircle(50, 50, 25);
    g.fillStyle(0xcccccc, 0.6);
    g.fillCircle(42, 42, 8);
    g.generateTexture('tejo', 100, 100);
    g.destroy();

    const d = this.make.graphics({ x: 0, y: 0, add: false });
    d.fillStyle(0xe94560, 1);
    d.fillCircle(50, 50, 35);
    d.fillStyle(0xffffff, 1);
    d.fillCircle(50, 50, 20);
    d.fillStyle(0xe94560, 1);
    d.fillCircle(50, 50, 8);
    d.generateTexture('diana-buena', 100, 100);
    d.destroy();

    const dt = this.make.graphics({ x: 0, y: 0, add: false });
    dt.fillStyle(0x4488ff, 1);
    dt.fillCircle(50, 50, 35);
    dt.fillStyle(0xffffff, 1);
    dt.fillCircle(50, 50, 20);
    dt.fillStyle(0x4488ff, 1);
    dt.fillRect(35, 45, 30, 10);
    dt.generateTexture('diana-trampa', 100, 100);
    dt.destroy();

    const o = this.make.graphics({ x: 0, y: 0, add: false });
    o.fillStyle(0x666666, 1);
    o.fillRect(0, 0, 120, 25);
    o.generateTexture('obstaculo', 120, 25);
    o.destroy();

    this.load.audio('casino-bg', casinoBg);
  }

  create() {
    this.add.rectangle(W/2, H/2, W, H, 0x1a1a2e);

    this.matter.add.rectangle(W/2, H-10, W, 20, { isStatic: true, label: 'suelo', restitution: 0.4 });
    this.matter.add.rectangle(10, H/2, 20, H, { isStatic: true });
    this.matter.add.rectangle(W-10, H/2, 20, H, { isStatic: true });
    this.matter.add.rectangle(W/2, 10, W, 20, { isStatic: true });

    this.tejo = this.matter.add.image(this.tejoX, this.tejoY, 'tejo');
    this.tejo.setCircle(25);
    this.tejo.setStatic(true);
    this.tejo.setFriction(0.01);
    this.tejo.setFrictionAir(0.01);
    this.tejo.setBounce(0.4);
    this.tejo.body.label = 'tejo';

    this.lineaResortera = this.add.graphics();

    this.textoPuntos = this.add.text(20, 30, 'Puntos: 0', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial'
    }).setDepth(10);

    this.textoNivel = this.add.text(W-20, 30, 'Nivel 1', {
      fontSize: '22px', color: '#FFD700', fontFamily: 'Arial'
    }).setOrigin(1, 0).setDepth(10);

    this.textoProgreso = this.add.text(W/2, 30, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5, 0).setDepth(10);

    this.barraProgreso = this.add.rectangle(20, H-50, 0, 20, 0xFFD700)
      .setOrigin(0, 0.5).setDepth(10).setVisible(false);
    this.textoJackpot = this.add.text(W/2, H-75, '🎰 JACKPOT', {
      fontSize: '16px', color: '#FFD700', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(10).setVisible(false);

    this.textoViento = this.add.text(W/2, 70, '', {
      fontSize: '16px', color: '#88ccff', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(10);

    this.textoInstruccion = this.add.text(W/2, H-170, 'Arrastra y suelta para lanzar', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(10);

    this.cargarNivel(1);

    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const labels = [bodyA.label, bodyB.label];
        if (labels.includes('tejo') && (labels.includes('diana-buena') || labels.includes('diana-trampa'))) {
          const tipoDiana = labels.includes('diana-buena') ? 'buena' : 'trampa';
          this.golpearDiana(tipoDiana);
        }
      });
    });

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

    this.input.once('pointerdown', () => this.iniciarMusica());
  }

  cargarNivel(numero) {
    const config = NIVELES[numero];
    this.nivelActual = numero;
    this.aciertosNivel = 0;
    this.textoNivel.setText('Nivel ' + numero);

    this.dianas.forEach(d => { if (d.imagen) d.imagen.destroy(); });
    this.dianas = [];

    if (this.obstaculoObj) { this.obstaculoObj.destroy(); this.obstaculoObj = null; }

    config.dianas.forEach(pos => {
      const texturaKey = pos.tipo === 'buena' ? 'diana-buena' : 'diana-trampa';
      const imagen = this.matter.add.image(pos.x, pos.y, texturaKey);
      imagen.setCircle(35);
      imagen.setStatic(true);
      imagen.setSensor(true);
      imagen.body.label = texturaKey;
      this.dianas.push({ imagen, tipo: pos.tipo });
    });

    this.vientoFuerza = config.viento ? config.fuerzaViento : 0;
    if (config.viento) {
      this.vientoDireccion = Math.random() > 0.5 ? 1 : -1;
      this.textoViento.setText(this.vientoDireccion > 0 ? '💨 →' : '← 💨');
    } else {
      this.textoViento.setText('');
    }

    if (config.obstaculo) {
      this.obstaculoObj = this.matter.add.image(W/2, 400, 'obstaculo');
      this.obstaculoObj.setStatic(true);
      this.obstaculoObj.body.label = 'obstaculo';
      this.obstaculoDireccion = 1;
    }

    const textoEntrada = this.add.text(W/2, H/2, '¡NIVEL ' + numero + '!', {
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

      if (Math.random() < 0.45) {
        this.puntosJackpot += 500;
        this.actualizarVelocidadMusica();
        if (this.puntosJackpot >= PUNTOS_JACKPOT) {
          this.time.delayedCall(300, () => this.jackpot());
          return;
        }
      }

      this.aciertosNivel++;
      this.actualizarProgreso();
      this.golpesConsecutivos++;
      if (this.golpesConsecutivos >= 3) {
        this.golpesConsecutivos = 0;
        this.time.delayedCall(300, () => this.sonidoAcordeon());
      }

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

    } else {
      this.puntos = Math.max(0, this.puntos - 500);
      this.textoPuntos.setText('Puntos: ' + this.puntos);
      this.aciertosNivel = 0;
      this.golpesConsecutivos = 0;
      this.actualizarProgreso();

      const textoMal = this.add.text(W/2, H/2 - 50, '-500 😱', {
        fontSize: '36px', color: '#4488ff', fontFamily: 'Arial', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(21);
      this.time.delayedCall(800, () => textoMal.destroy());
    }

    this.time.delayedCall(300, () => this.resetearTejo());
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
    const flash = this.add.rectangle(W/2, H/2, W, H, 0xffffff, 0.8).setDepth(20);
    this.time.delayedCall(100, () => flash.destroy());
    const textoWin = this.add.text(W/2, H/2, '🎰 JACKPOT! 🎰', {
      fontSize: '42px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);
    const textoBonus = this.add.text(W/2, H/2 + 70, '+1000 puntos bonus! 🎁', {
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
        this.resetearTejo();
      }
    });
  }

  update() {
    if (this.lanzado && this.vientoFuerza > 0 && this.tejo.body) {
      this.tejo.applyForce({ x: this.vientoFuerza * this.vientoDireccion, y: 0 });
    }

    if (this.obstaculoObj && this.nivelActual === 3) {
      const x = this.obstaculoObj.x;
      if (x > W - 80) this.obstaculoDireccion = -1;
      if (x < 80) this.obstaculoDireccion = 1;
      this.obstaculoObj.x += 2.5 * this.obstaculoDireccion;
      this.matter.body.setPosition(this.obstaculoObj.body, {
        x: this.obstaculoObj.x, y: this.obstaculoObj.y
      });
    }

    // Reset solo cuando toca el suelo — Y cerca del fondo
    if (this.lanzado && this.tejo.y > H - 50) {
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

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#1a1a2e',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'matter', matter: { gravity: { y: 1 }, debug: false } },
  scene: [GameScene]
});