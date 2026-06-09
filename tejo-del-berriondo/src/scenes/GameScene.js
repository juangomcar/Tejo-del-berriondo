import Phaser from 'phaser';
import casinoBg from '../assets/casino-bg.mp3';
import {
  GAME_WIDTH, GAME_HEIGHT,
  PHYSICS, COLORS, FONT,
  PUNTOS_JACKPOT, NIVELES, TOTAL_NIVELES,
  PUNTOS_OFERTA
} from '../config/game.config.js';

export default class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameScene' });
    this.tejoX = GAME_WIDTH / 2;
    this.tejoY = GAME_HEIGHT - 150;
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
    this.tejoEspecial = null;
    this.lanzamientosEspeciales = 0;
    this.puntosUltimaOferta = 0;
    this.ciclo = 1;
    this.nivelGlobal = 1;
    this.dianas = [];
    this.trail = [];
    this.trailGraphics = null;
    // Combo
    this.comboMultiplier = 1;
    this.comboPanel = null;
    // Near-miss
    this.casiMostrado = false;
    this.textoCasi = null;
    // Wind particles
    this.windParticles = [];
    // Wind direction arrows in the play field
    this.flechasViento = [];
    // Jackpot warning border
    this.jackpotBorder = null;
    this.jackpotBorderTween = null;
    // Racha caliente (hot streak)
    this.rachaCalienteBorder = null;
    this.rachaCalienteTween = null;
    // Power dots HUD
    this.powerDots = [];
    this.powerBadge = null;
  }

  preload() {
    const colorTejo = this.registry.get('colorTejo') ?? 0x999999;

    // Tejo base
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.35); g.fillCircle(54, 54, 26);
    g.fillStyle(colorTejo, 1);   g.fillCircle(50, 50, 26);
    g.lineStyle(2, 0xffffff, 0.2); g.strokeCircle(50, 50, 25);
    g.fillStyle(0xffffff, 0.55); g.fillCircle(41, 41, 9);
    g.fillStyle(0xffffff, 0.2);  g.fillCircle(44, 44, 5);
    g.generateTexture('tejo', 100, 100); g.destroy();

    // Diana buena
    const d = this.make.graphics({ x: 0, y: 0, add: false });
    d.fillStyle(COLORS.dianabuena, 1); d.fillCircle(50, 50, 36);
    d.fillStyle(0xffffff, 1); d.fillCircle(50, 50, 22);
    d.fillStyle(COLORS.dianabuena, 1); d.fillCircle(50, 50, 10);
    d.fillStyle(0xffffff, 1); d.fillCircle(50, 50, 4);
    d.generateTexture('diana-buena', 100, 100); d.destroy();

    // Diana trampa
    const dt = this.make.graphics({ x: 0, y: 0, add: false });
    dt.fillStyle(COLORS.dianatrampa, 1); dt.fillCircle(50, 50, 36);
    dt.fillStyle(0xffffff, 1); dt.fillCircle(50, 50, 22);
    dt.fillStyle(COLORS.dianatrampa, 1); dt.fillCircle(50, 50, 10);
    dt.fillStyle(0xffffff, 1); dt.fillRect(34, 46, 32, 8);
    dt.generateTexture('diana-trampa', 100, 100); dt.destroy();

    // Obstáculo
    const o = this.make.graphics({ x: 0, y: 0, add: false });
    o.fillStyle(0x223344, 1); o.fillRect(0, 0, 120, 25);
    o.lineStyle(2, 0x4488aa, 0.5); o.strokeRect(0, 0, 120, 25);
    o.generateTexture('obstaculo', 120, 25); o.destroy();

    // Partícula base
    const p = this.make.graphics({ x: 0, y: 0, add: false });
    p.fillStyle(0xffffff, 1); p.fillCircle(6, 6, 6);
    p.generateTexture('particula', 12, 12); p.destroy();

    // Partícula chispa (estrellita)
    const sp = this.make.graphics({ x: 0, y: 0, add: false });
    sp.fillStyle(0xffffff, 1);
    sp.fillTriangle(5, 0, 7, 4, 10, 5); sp.fillTriangle(10, 5, 6, 7, 5, 10);
    sp.fillTriangle(5, 10, 3, 6, 0, 5); sp.fillTriangle(0, 5, 4, 3, 5, 0);
    sp.generateTexture('chispa', 10, 10); sp.destroy();

    this.load.audio('casino-bg', casinoBg);
  }

  create() {
    this.crearFondo();

    // Paredes físicas
    this.matter.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT-10, GAME_WIDTH, 20, { isStatic: true, label: 'suelo', restitution: 0.3, friction: 0.8 });
    this.matter.add.rectangle(25, GAME_HEIGHT/2, 50, GAME_HEIGHT, { isStatic: true, restitution: 0.2, friction: 0.8 });
    this.matter.add.rectangle(GAME_WIDTH-25, GAME_HEIGHT/2, 50, GAME_HEIGHT, { isStatic: true, restitution: 0.2, friction: 0.8 });
    this.matter.add.rectangle(GAME_WIDTH/2, 10, GAME_WIDTH, 20, { isStatic: true, restitution: 0, friction: 1 });

    this.trailGraphics = this.add.graphics().setDepth(5);

    // Tejo físico
    this.tejo = this.matter.add.image(this.tejoX, this.tejoY, 'tejo');
    this.tejo.setCircle(26); this.tejo.setStatic(true);
    this.tejo.setFriction(PHYSICS.friction); this.tejo.setFrictionAir(PHYSICS.frictionAir);
    this.tejo.setBounce(PHYSICS.restitution);
    this.tejo.body.label = 'tejo'; this.tejo.body.inertia = Infinity; this.tejo.body.inverseInertia = 0;
    this.tejo.setDepth(6);

    // Aura del tejo en reposo
    this.tejoAura = this.add.circle(this.tejoX, this.tejoY, 36, 0xFFD700, 0.08).setDepth(5);
    this.tweens.add({ targets: this.tejoAura, scaleX: 1.35, scaleY: 1.35, alpha: 0, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Aura de poder especial (encima del aura normal)
    this.auraEspecial = this.add.circle(this.tejoX, this.tejoY, 42, 0xffffff, 0).setDepth(5);

    // Resortera
    this.lineaResortera = this.add.graphics().setDepth(7);

    // Tejo visual al arrastrar
    const colorTejo = this.registry.get('colorTejo') ?? 0x999999;
    this.tejoVisual = this.add.circle(this.tejoX, this.tejoY, 26, colorTejo).setDepth(7);
    this.tejoVisual.setVisible(false);

    this.crearHUD();
    this.crearParticulasAmbiente();
    this.cargarNivel(1);

    // Colisiones
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const labels = [bodyA.label, bodyB.label];
        const dianaBody = bodyA.label && bodyA.label.startsWith('diana') ? bodyA : bodyB;
        if (labels.includes('tejo') && labels.includes('diana-buena')) {
          this.golpearDiana('buena', dianaBody.position);
        } else if (labels.includes('tejo') && labels.includes('diana-trampa')) {
          this.golpearDiana('trampa', dianaBody.position);
        }
      });
    });

    // Inputs
    this.input.on('pointerdown', (p) => {
      if (this.lanzado) return;
      this.isDragging = true;
      this.startX = p.worldX; this.startY = p.worldY;
      this.tejo.setVisible(false);
      this.tejoAura.setVisible(false);
      this.tejoVisual.setVisible(true);
      this.tejoVisual.setPosition(this.tejoX, this.tejoY);
    });

    this.input.on('pointermove', (p) => {
      if (!this.isDragging || this.lanzado) return;
      const dx = p.worldX - this.tejoX;
      const dy = p.worldY - this.tejoY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const factor = dist > 200 ? 200/dist : 1;
      const nx = this.tejoX + dx * factor;
      const ny = this.tejoY + dy * factor;

      this.tejoVisual.setPosition(nx, ny);

      const power = Math.min(dist / 180, 1);
      // Color según potencia Y tipo de tejo especial
      let lineColor;
      if (this.tejoEspecial === 'fuego') lineColor = 0xff4400;
      else if (this.tejoEspecial === 'hielo') lineColor = 0x00ccff;
      else if (this.tejoEspecial === 'explosivo') lineColor = 0xffcc00;
      else {
        const g2 = Math.floor(215 * (1 - power * 0.7));
        lineColor = Phaser.Display.Color.GetColor(255, g2, 0);
      }

      this.lineaResortera.clear();
      this.lineaResortera.lineStyle(4, lineColor, 0.9);
      this.lineaResortera.lineBetween(this.tejoX - 14, this.tejoY + 10, nx, ny);
      this.lineaResortera.lineBetween(this.tejoX + 14, this.tejoY + 10, nx, ny);
      this.lineaResortera.lineStyle(5, 0x8B4513, 1);
      this.lineaResortera.lineBetween(this.tejoX - 14, this.tejoY + 30, this.tejoX - 14, this.tejoY + 10);
      this.lineaResortera.lineBetween(this.tejoX + 14, this.tejoY + 30, this.tejoX + 14, this.tejoY + 10);
      this.lineaResortera.lineBetween(this.tejoX - 14, this.tejoY + 30, this.tejoX + 14, this.tejoY + 30);
      const glowSize = 4 + power * 12;
      this.lineaResortera.fillStyle(lineColor, 0.4);
      this.lineaResortera.fillCircle(nx, ny, glowSize);
    });

    this.input.on('pointerup', (p) => {
      if (!this.isDragging || this.lanzado) return;
      this.isDragging = false;
      this.lineaResortera.clear();
      this.tejoVisual.setVisible(false);
      this.tejo.setVisible(true);

      const dx = this.startX - p.worldX;
      const dy = this.startY - p.worldY;
      const distancia = Math.sqrt(dx*dx + dy*dy);
      if (distancia < 20) { this.tejoAura.setVisible(true); return; }

      this.lanzado = true;
      this.timerQuieto = null;
      this.casiMostrado = false;
      this.textoInstruccion.setVisible(false);
      this.trail = [];
      this.sonidoLanzar();
      if (this.tejoEspecial === 'fuego') this.sonidoFuego();

      // Velocidad según poder
      const speedMult = this.tejoEspecial === 'fuego' ? 1.45 :
                        this.tejoEspecial === 'explosivo' ? 1.25 : 1.0;
      const clampMax = this.tejoEspecial === 'fuego' ? 58 :
                       this.tejoEspecial === 'explosivo' ? 50 : 40;

      this.matter.body.setPosition(this.tejo.body, { x: this.tejoX, y: this.tejoY });
      this.tejo.setStatic(false);
      this.tejo.setVelocity(
        Phaser.Math.Clamp(dx * 0.35 * speedMult, -clampMax, clampMax),
        Phaser.Math.Clamp(dy * 0.35 * speedMult, -clampMax, clampMax)
      );
    });

    this.input.once('pointerdown', () => this.iniciarMusica());

    // Recibir tejo especial cuando OfertaScene reanuda este juego
    this.events.on('resume', (sys, data) => {
      if (data && data.tejoEspecial) {
        this.activarTejoEspecial(data.tejoEspecial);
      }
    });
  }

  // ─── FONDO ────────────────────────────────────────────────────────────────

  crearFondo() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050512, 0x050512, 0x0a1420, 0x0a1420, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Spotlight zona dianas
    const spotlight = this.add.graphics().setDepth(1).setAlpha(0.1);
    spotlight.fillStyle(0xffffff, 1);
    spotlight.fillCircle(GAME_WIDTH/2, 210, 160);

    // Halo dorado zona de lanzamiento
    const launchGlow = this.add.graphics().setDepth(1).setAlpha(0.05);
    launchGlow.fillStyle(0xFFD700, 1);
    launchGlow.fillCircle(this.tejoX, this.tejoY, 140);

    // Borde de alerta jackpot (oculto hasta 80%)
    this.jackpotBorder = this.add.graphics().setDepth(30).setAlpha(0);
    this.jackpotBorder.lineStyle(4, 0xFFD700, 1);
    this.jackpotBorder.strokeRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4);

    // Borde de racha caliente (oculto hasta ≥8 golpes seguidos)
    this.rachaCalienteBorder = this.add.graphics().setDepth(29).setAlpha(0);
    this.rachaCalienteBorder.lineStyle(5, 0xff3300, 1);
    this.rachaCalienteBorder.strokeRect(6, 6, GAME_WIDTH - 12, GAME_HEIGHT - 12);
    this.rachaCalienteBorder.lineStyle(2, 0xff8800, 0.6);
    this.rachaCalienteBorder.strokeRect(10, 10, GAME_WIDTH - 20, GAME_HEIGHT - 20);

    // Decoración arena
    const arena = this.add.graphics().setDepth(1).setAlpha(0.35);
    arena.lineStyle(1, 0x1a3040, 0.6);
    arena.lineBetween(50, GAME_HEIGHT/2, GAME_WIDTH - 50, GAME_HEIGHT/2);
    arena.lineStyle(1.5, 0x1a3a4a, 0.5);
    arena.strokeCircle(55, 118, 18);
    arena.strokeCircle(GAME_WIDTH - 55, 118, 18);

    // Suelo
    const suelo = this.add.graphics().setDepth(1);
    suelo.fillStyle(0x050d15, 0.7);
    suelo.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
    suelo.lineStyle(1, 0x1a3040, 0.5);
    suelo.lineBetween(0, GAME_HEIGHT - 40, GAME_WIDTH, GAME_HEIGHT - 40);
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────

  crearHUD() {
    const hudGfx = this.add.graphics().setDepth(9);
    hudGfx.fillStyle(0x000000, 0.7);
    hudGfx.fillRect(0, 0, GAME_WIDTH, 100);
    hudGfx.lineStyle(1, 0x1a3040, 0.8);
    hudGfx.lineBetween(0, 100, GAME_WIDTH, 100);

    const nombre = this.registry.get('nombreJugador') || 'Jugador';
    this.textoPuntos = this.add.text(18, 20, nombre + ': 0', {
      fontSize: '22px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 4, fill: true }
    }).setDepth(10);

    this.textoNivel = this.add.text(GAME_WIDTH - 18, 20, 'Nivel 1', {
      fontSize: '20px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 4, fill: true }
    }).setOrigin(1, 0).setDepth(10);

    // Barra jackpot
    const barY = 54; const barM = 18; const barW = GAME_WIDTH - barM * 2;
    const barFondoGfx = this.add.graphics().setDepth(10);
    barFondoGfx.fillStyle(0x111122, 1);
    barFondoGfx.fillRoundedRect(barM, barY - 7, barW, 14, 7);
    barFondoGfx.lineStyle(1, 0x2a3a5a, 0.8);
    barFondoGfx.strokeRoundedRect(barM, barY - 7, barW, 14, 7);

    this.barraJackpot = this.add.graphics().setDepth(11);
    this.textoJackpotLabel = this.add.text(GAME_WIDTH - barM, barY - 14, '🎰 JACKPOT', {
      fontSize: '10px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(12);
    this.textoJackpotPct = this.add.text(barM, barY - 14, '0%', {
      fontSize: '10px', color: '#555566', fontFamily: FONT
    }).setOrigin(0, 0).setDepth(12);

    this.textoProgreso = this.add.text(GAME_WIDTH/2, 77, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: FONT
    }).setOrigin(0.5, 0).setDepth(10);

    this.textoViento = this.add.text(GAME_WIDTH - 18, 69, '', {
      fontSize: '20px', color: '#88ccff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(1, 0).setDepth(10);

    // Panel de poder especial (oculto por defecto)
    this.panelPoderGfx = this.add.graphics().setDepth(9).setAlpha(0);
    this.textoPoder = this.add.text(GAME_WIDTH/2, 120, '', {
      fontSize: '16px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    // Dots de lanzamientos restantes
    this.powerDots = [];
    for (let i = 0; i < 3; i++) {
      const dot = this.add.circle(GAME_WIDTH/2 - 18 + i * 18, 138, 5, 0xffffff, 0.2).setDepth(10);
      this.powerDots.push(dot);
    }

    // Panel inferior
    const bottomGfx = this.add.graphics().setDepth(9);
    bottomGfx.fillStyle(0x000000, 0.6);
    bottomGfx.fillRect(0, GAME_HEIGHT - 72, GAME_WIDTH, 72);
    bottomGfx.lineStyle(1, 0x1a3040, 0.6);
    bottomGfx.lineBetween(0, GAME_HEIGHT - 72, GAME_WIDTH, GAME_HEIGHT - 72);

    this.textoInstruccion = this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 50, 'Arrastra y suelta para lanzar', {
      fontSize: '17px', color: '#8899aa', fontFamily: FONT
    }).setOrigin(0.5).setDepth(10);

    this.textoOferta = this.add.text(GAME_WIDTH/2, GAME_HEIGHT - 18, '🎁 ¡Acumula puntos para una oferta!', {
      fontSize: '12px', color: '#FFD700', fontFamily: FONT
    }).setOrigin(0.5).setDepth(10);

    this._barM = barM; this._barW = barW; this._barY = barY;
    this.actualizarBarraJackpot();
  }

  actualizarBarraJackpot() {
    const pct = Math.min(this.puntosJackpot / PUNTOS_JACKPOT, 1);
    const { _barM: m, _barW: w, _barY: barY } = this;
    const fillW = Math.max(6, w * pct);

    this.barraJackpot.clear();
    if (pct > 0.05) { this.barraJackpot.fillStyle(0xff8800, 0.2); this.barraJackpot.fillRoundedRect(m, barY - 9, fillW, 18, 9); }
    const col = pct < 0.5 ? 0x886600 : pct < 0.75 ? 0xcc8800 : 0xFFD700;
    this.barraJackpot.fillStyle(col, 1);
    this.barraJackpot.fillRoundedRect(m, barY - 7, fillW, 14, 7);
    this.barraJackpot.fillStyle(0xffffff, 0.2);
    this.barraJackpot.fillRoundedRect(m + 2, barY - 6, Math.max(4, fillW - 4), 5, { tl: 5, tr: 5, bl: 0, br: 0 });
    if (this.textoJackpotPct) {
      this.textoJackpotPct.setText(Math.floor(pct * 100) + '%');
      this.textoJackpotPct.setStyle({ color: pct > 0.6 ? '#FFD700' : '#555566' });
    }

    // Alerta jackpot casi lleno (≥80%)
    if (pct >= 0.8 && !this.jackpotBorderTween) {
      this.jackpotBorderTween = this.tweens.add({ targets: this.jackpotBorder, alpha: 0.7, duration: 400, yoyo: true, repeat: -1 });
    } else if (pct < 0.8 && this.jackpotBorderTween) {
      this.jackpotBorderTween.stop();
      this.jackpotBorderTween = null;
      this.jackpotBorder.setAlpha(0);
    }
  }

  // ─── AMBIENTE ─────────────────────────────────────────────────────────────

  crearParticulasAmbiente() {
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const y = Phaser.Math.Between(120, GAME_HEIGHT - 80);
      const r = Phaser.Math.FloatBetween(1, 2.5);
      const dot = this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.03, 0.1)).setDepth(2);
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(60, 160),
        x: x + Phaser.Math.Between(-25, 25),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 9000),
        delay: Phaser.Math.Between(0, 6000),
        repeat: -1,
        onRepeat: () => {
          dot.x = Phaser.Math.Between(50, GAME_WIDTH - 50);
          dot.y = Phaser.Math.Between(GAME_HEIGHT/2, GAME_HEIGHT - 80);
          dot.setAlpha(Phaser.Math.FloatBetween(0.03, 0.1));
        }
      });
    }
  }

  crearParticulasViento() {
    // Limpia anteriores
    this.windParticles.forEach(p => p.destroy());
    this.windParticles = [];
    if (!this.vientoFuerza) return;

    for (let i = 0; i < 12; i++) {
      const startX = this.vientoDireccion > 0 ? -8 : GAME_WIDTH + 8;
      const endX   = this.vientoDireccion > 0 ? GAME_WIDTH + 8 : -8;
      const y = Phaser.Math.Between(115, GAME_HEIGHT - 100);
      const dur = Phaser.Math.Between(1200, 3000);
      const dot = this.add.circle(startX, y, Phaser.Math.FloatBetween(1.5, 3), 0x88ccff, Phaser.Math.FloatBetween(0.3, 0.7)).setDepth(2);
      this.tweens.add({
        targets: dot, x: endX, duration: dur,
        delay: Phaser.Math.Between(0, 3000), repeat: -1,
        onRepeat: () => {
          dot.x = startX;
          dot.y = Phaser.Math.Between(115, GAME_HEIGHT - 100);
        }
      });
      this.windParticles.push(dot);
    }
  }

  crearFlechasViento() {
    if (!this.vientoFuerza) return;
    const dir = this.vientoDireccion;
    const simbolo = dir > 0 ? '→' : '←';
    const posiciones = [
      { x: 52,              y: 370 },
      { x: 52,              y: 530 },
      { x: GAME_WIDTH - 52, y: 430 },
      { x: GAME_WIDTH - 52, y: 590 },
    ];
    posiciones.forEach((pos, i) => {
      const obj = this.add.text(pos.x, pos.y, simbolo, {
        fontSize: '30px', color: '#88ccff', fontFamily: FONT
      }).setOrigin(0.5).setDepth(3).setAlpha(0);
      const tween = this.tweens.add({
        targets: obj,
        alpha: { from: 0.06, to: 0.30 },
        x: pos.x + dir * 12,
        duration: 900 + i * 180,
        delay: i * 220,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.flechasViento.push({ obj, tween });
    });
  }

  // ─── NIVELES ──────────────────────────────────────────────────────────────

  cargarNivel(numero) {
    const config = NIVELES[numero];
    this.nivelActual = numero;
    this.aciertosNivel = 0;
    this.textoNivel.setText('Nivel ' + this.nivelGlobal);

    this.dianas.forEach(d => {
      if (d.imagen) d.imagen.destroy();
      if (d.anilloExt) d.anilloExt.destroy();
      if (d.anilloMed) d.anilloMed.destroy();
    });
    this.dianas = [];
    if (this.obstaculoObj) { this.obstaculoObj.destroy(); this.obstaculoObj = null; }
    this.flechasViento.forEach(f => { f.tween.stop(); f.obj.destroy(); });
    this.flechasViento = [];

    config.dianas.forEach(pos => {
      const esBuena = pos.tipo === 'buena';
      const texturaKey = esBuena ? 'diana-buena' : 'diana-trampa';
      const dianaColor = esBuena ? COLORS.dianabuena : COLORS.dianatrampa;

      const anilloExt = this.add.circle(pos.x, pos.y, 58, dianaColor, 0.1).setDepth(3);
      const anilloMed = this.add.circle(pos.x, pos.y, 46, dianaColor, 0.18).setDepth(3);
      this.tweens.add({ targets: anilloExt, scaleX: 1.4, scaleY: 1.4, alpha: 0, duration: 1500, repeat: -1, ease: 'Power2.easeOut' });
      this.tweens.add({ targets: anilloMed, scaleX: 1.2, scaleY: 1.2, alpha: 0, duration: 1100, repeat: -1, delay: 300, ease: 'Power2.easeOut' });

      const imagen = this.matter.add.image(pos.x, pos.y, texturaKey);
      imagen.setCircle(36); imagen.setStatic(true); imagen.setSensor(true);
      imagen.body.label = texturaKey; imagen.setDepth(4);
      this.dianas.push({ imagen, tipo: pos.tipo, anilloExt, anilloMed });
    });

    // Viento
    this.vientoFuerza = config.viento ? config.fuerzaViento * this.ciclo : 0;
    if (config.viento) {
      this.vientoDireccion = Math.random() > 0.5 ? 1 : -1;
      const flecha = this.vientoDireccion > 0 ? '→' : '←';
      const intensidad = config.fuerzaViento <= 0.0003 ? flecha : config.fuerzaViento <= 0.0005 ? flecha + flecha : flecha + flecha + flecha;
      this.textoViento.setText(this.vientoDireccion > 0 ? `💨 ${intensidad}` : `${intensidad} 💨`);
    } else {
      this.textoViento.setText('');
    }
    this.crearParticulasViento();
    this.crearFlechasViento();

    if (config.obstaculo) {
      this.obstaculoObj = this.matter.add.image(GAME_WIDTH/2, 400, 'obstaculo');
      this.obstaculoObj.setStatic(true);
      this.obstaculoObj.body.label = 'obstaculo';
      this.obstaculoDireccion = 1;
    }

    // Animación entrada nivel
    const panelGfx = this.add.graphics().setDepth(26).setAlpha(0);
    panelGfx.fillStyle(0x000000, 0.75);
    panelGfx.fillRoundedRect(GAME_WIDTH/2 - 165, GAME_HEIGHT/2 - 55, 330, 110, 18);
    panelGfx.lineStyle(2.5, 0xFFD700, 0.9);
    panelGfx.strokeRoundedRect(GAME_WIDTH/2 - 165, GAME_HEIGHT/2 - 55, 330, 110, 18);

    const textoEntrada = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, '¡NIVEL ' + this.nivelGlobal + '!', {
      fontSize: '52px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#ff8800', blur: 10, fill: true }
    }).setOrigin(0.5).setDepth(27).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: [panelGfx, textoEntrada], alpha: 1, scaleX: 1, scaleY: 1,
      duration: 350, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(700, () => {
          this.tweens.add({
            targets: [panelGfx, textoEntrada], alpha: 0, duration: 300,
            onComplete: () => { panelGfx.destroy(); textoEntrada.destroy(); }
          });
        });
      }
    });

    this.actualizarProgreso();
  }

  actualizarProgreso() {
    const config = NIVELES[this.nivelActual];
    let estrellas = '';
    for (let i = 0; i < config.aciertosParaSiguiente; i++) {
      estrellas += i < this.aciertosNivel ? '⭐' : '☆';
    }
    this.textoProgreso.setText(estrellas);
  }

  actualizarIndicadorOferta() {
    const faltan = this.puntosUltimaOferta + PUNTOS_OFERTA - this.puntos;
    if (faltan <= 0) return;
    this.textoOferta.setText('¡Faltan ' + faltan + ' pts para tu próxima oferta!');
  }

  // ─── PODERES ESPECIALES ───────────────────────────────────────────────────

  activarTejoEspecial(tipo) {
    this.tejoEspecial = tipo;
    this.lanzamientosEspeciales = 3;

    const coloresTint = { fuego: 0xff5500, hielo: 0x00ccff, explosivo: 0xffee00 };
    const coloresAura = { fuego: 0xff4400, hielo: 0x00aaff, explosivo: 0xffcc00 };
    const textos = { fuego: '🔥 TEJO DE FUEGO', hielo: '❄️ TEJO DE HIELO', explosivo: '💥 TEJO EXPLOSIVO' };
    const descrips = { fuego: '+45% velocidad · rastro de llamas', hielo: 'Inmune al viento · rastro de hielo', explosivo: 'x2 puntos · explosión masiva' };
    const hexColores = { fuego: '#ff5500', hielo: '#00ccff', explosivo: '#ffee00' };

    this.tejo.setTint(coloresTint[tipo]);

    // Aura de poder pulsante alrededor del tejo
    this.auraEspecial.setFillStyle(coloresAura[tipo], 0.3);
    if (this.auraEspecialTween) this.auraEspecialTween.stop();
    this.auraEspecialTween = this.tweens.add({
      targets: this.auraEspecial, scaleX: 1.6, scaleY: 1.6, alpha: 0,
      duration: 700, repeat: -1, ease: 'Power2.easeOut'
    });

    // Flash de pantalla del color del poder
    const flashColors = { fuego: [200, 80, 0], hielo: [0, 100, 200], explosivo: [200, 180, 0] };
    const [r, g, b] = flashColors[tipo];
    this.cameras.main.flash(500, r, g, b, false);

    // Panel de poder especial activo
    this.panelPoderGfx.clear();
    this.panelPoderGfx.fillStyle(0x000000, 0.7);
    this.panelPoderGfx.fillRoundedRect(GAME_WIDTH/2 - 175, 102, 350, 50, 10);
    const borderColor = coloresAura[tipo];
    this.panelPoderGfx.lineStyle(2, borderColor, 0.9);
    this.panelPoderGfx.strokeRoundedRect(GAME_WIDTH/2 - 175, 102, 350, 50, 10);
    this.panelPoderGfx.setAlpha(1);

    this.textoPoder.setText(textos[tipo]);
    this.textoPoder.setStyle({ color: hexColores[tipo] });
    this.textoPoder.setPosition(GAME_WIDTH/2, 127);
    this.textoPoder.setAlpha(1);

    // Dots de lanzamientos (3 puntos coloreados)
    this.actualizarPowerDots();

    // Badge central de activación
    const badge = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, textos[tipo] + ' ACTIVADO!', {
      fontSize: '30px', color: hexColores[tipo], fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: coloresAura[tipo], blur: 15, fill: true }
    }).setOrigin(0.5).setDepth(28).setScale(0.3).setAlpha(0);

    this.tweens.add({
      targets: badge, alpha: 1, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(900, () => {
          this.tweens.add({ targets: badge, alpha: 0, y: GAME_HEIGHT/2 - 60, duration: 400, onComplete: () => badge.destroy() });
        });
      }
    });
  }

  actualizarPowerDots() {
    const coloresDot = { fuego: 0xff5500, hielo: 0x00ccff, explosivo: 0xffee00 };
    const color = this.tejoEspecial ? coloresDot[this.tejoEspecial] : 0xffffff;
    this.powerDots.forEach((dot, i) => {
      const activo = i < this.lanzamientosEspeciales;
      dot.setFillStyle(color, activo ? 0.9 : 0.15);
      dot.setScale(activo ? 1 : 0.7);
    });
  }

  desactivarTejoEspecial() {
    this.tejoEspecial = null;
    this.lanzamientosEspeciales = 0;
    this.tejo.clearTint();

    if (this.auraEspecialTween) { this.auraEspecialTween.stop(); this.auraEspecialTween = null; }
    this.auraEspecial.setAlpha(0);

    this.panelPoderGfx.setAlpha(0);
    this.textoPoder.setAlpha(0);
    this.powerDots.forEach(dot => { dot.setFillStyle(0xffffff, 0.2); dot.setScale(1); });
  }

  // ─── GOLPE A DIANA ────────────────────────────────────────────────────────

  golpearDiana(tipo, pos = { x: GAME_WIDTH/2, y: 300 }) {
    if (this.yaGolpeo) return;
    this.yaGolpeo = true;
    this.limpiarCasi();
    this.sonidoImpacto();

    if (tipo === 'buena') {
      // Calcular puntos con combo y poder
      let puntosBase = 500;
      if (this.tejoEspecial === 'explosivo') puntosBase = 1000;
      const puntosGanados = puntosBase * this.comboMultiplier;

      this.puntos += puntosGanados;
      this.verificarOferta();
      this.actualizarIndicadorOferta();

      // Punch animado en el score
      this.tweens.add({
        targets: this.textoPuntos, scaleX: 1.3, scaleY: 1.3, duration: 120, yoyo: true,
        onStart: () => this.textoPuntos.setText((this.registry.get('nombreJugador') || 'Jugador') + ': ' + this.puntos)
      });

      // Efectos visuales según poder
      if (this.tejoEspecial === 'fuego') {
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(250, 200, 80, 0, false);
        this.emitirParticulasEspeciales(pos.x, pos.y, 'fuego');
        this.mostrarPuntosFlotantes(pos.x, pos.y, '+' + puntosGanados, '#ff8800');
      } else if (this.tejoEspecial === 'hielo') {
        this.cameras.main.shake(150, 0.008);
        this.cameras.main.flash(300, 0, 80, 180, false);
        this.emitirParticulasEspeciales(pos.x, pos.y, 'hielo');
        // "Congelar" dianas brevemente — las escalamos y detenemos
        this.dianas.forEach(d => {
          this.tweens.add({ targets: d.imagen, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true });
        });
        this.mostrarPuntosFlotantes(pos.x, pos.y, '+' + puntosGanados, '#00ccff');
      } else if (this.tejoEspecial === 'explosivo') {
        this.cameras.main.shake(400, 0.022);
        this.cameras.main.flash(400, 200, 150, 0, false);
        this.emitirParticulasExplosivas(pos.x, pos.y);
        this.mostrarPuntosFlotantes(pos.x, pos.y, '+' + puntosGanados + '!!', '#ffee00');
      } else {
        this.cameras.main.shake(180, 0.009);
        this.emitirParticulas(pos.x, pos.y, 'buena');
        this.mostrarPuntosFlotantes(pos.x, pos.y, '+' + puntosGanados, '#00ff88');
      }

      this.sonidoMonedas();

      // Jackpot progress
      if (Math.random() < 0.35) {
        const jackpotBonus = this.tejoEspecial === 'explosivo' ? 750 : 500;
        this.puntosJackpot += jackpotBonus;
        this.actualizarBarraJackpot();
        this.actualizarVelocidadMusica();
        this.tweens.add({ targets: this.barraJackpot, scaleY: 1.4, duration: 100, yoyo: true });

        if (this.puntosJackpot >= PUNTOS_JACKPOT) {
          this.time.delayedCall(300, () => this.jackpot());
          return;
        }
      }

      // Combo
      this.golpesConsecutivos++;
      this.actualizarProgreso();
      this.aciertosNivel++;
      this.actualizarCombo();

      // Subir de nivel
      const config = NIVELES[this.nivelActual];
      if (config.aciertosParaSiguiente && this.aciertosNivel >= config.aciertosParaSiguiente) {
        const siguiente = this.nivelActual + 1;
        const nivelSig = siguiente <= TOTAL_NIVELES ? siguiente : 1;
        if (siguiente > TOTAL_NIVELES) this.ciclo++;
        this.nivelGlobal++;
        this.golpesConsecutivos = 0;
        this.comboMultiplier = 1;
        this.apagarRachaCaliente();
        this.time.delayedCall(800, () => {
          this.sonidoAcordeon();
          this.cargarNivel(nivelSig);
          this.resetearTejo();
        });
        return;
      }

      this.resetearTejo();

    } else {
      // Diana trampa — penaliza la barra del jackpot
      const penalidad = 750;
      this.puntosJackpot = Math.max(0, this.puntosJackpot - penalidad);
      this.actualizarBarraJackpot();
      this.actualizarVelocidadMusica();

      this.aciertosNivel = 0;
      this.golpesConsecutivos = 0;
      this.comboMultiplier = 1;
      if (this.comboPanel) { this.comboPanel.destroy(); this.comboPanel = null; }
      this.apagarRachaCaliente();

      // Jackpot bar: flash rojo + sacudida
      this.tweens.add({ targets: this.barraJackpot, scaleY: 0.3, duration: 120, yoyo: true, repeat: 2 });
      const barFlash = this.add.graphics().setDepth(12);
      const { _barM: m, _barW: w, _barY: barY } = this;
      barFlash.fillStyle(0x4488ff, 0.55);
      barFlash.fillRoundedRect(m, barY - 7, w, 14, 7);
      this.tweens.add({ targets: barFlash, alpha: 0, duration: 500, onComplete: () => barFlash.destroy() });

      this.cameras.main.shake(300, 0.015);
      this.cameras.main.flash(350, 0, 50, 180, false);
      this.emitirParticulas(pos.x, pos.y, 'trampa');
      this.mostrarPuntosFlotantes(pos.x, pos.y, '🎰 -' + penalidad, '#4488ff');
      this.actualizarProgreso();

      this.time.delayedCall(300, () => this.resetearTejo());
    }
  }

  actualizarCombo() {
    if (this.golpesConsecutivos >= 12) {
      this.comboMultiplier = 5;
    } else if (this.golpesConsecutivos >= 8) {
      this.comboMultiplier = 4;
    } else if (this.golpesConsecutivos >= 5) {
      this.comboMultiplier = 3;
    } else if (this.golpesConsecutivos >= 3) {
      this.comboMultiplier = 2;
    } else {
      this.comboMultiplier = 1;
    }

    if (this.golpesConsecutivos >= 3) {
      this.mostrarBadgeCombo();
      if (this.golpesConsecutivos === 3) this.sonidoAcordeon();
    }

    // Racha caliente: borde pulsante rojo-naranja a partir de 8 golpes seguidos
    if (this.golpesConsecutivos >= 8 && !this.rachaCalienteTween) {
      this.rachaCalienteTween = this.tweens.add({
        targets: this.rachaCalienteBorder, alpha: 0.85, duration: 250, yoyo: true, repeat: -1
      });
    } else if (this.golpesConsecutivos < 8 && this.rachaCalienteTween) {
      this.apagarRachaCaliente();
    }
  }

  apagarRachaCaliente() {
    if (this.rachaCalienteTween) {
      this.rachaCalienteTween.stop();
      this.rachaCalienteTween = null;
    }
    this.rachaCalienteBorder.setAlpha(0);
  }

  mostrarBadgeCombo() {
    if (this.comboPanel) this.comboPanel.destroy();

    const n = this.golpesConsecutivos;
    let colorStr, colorHex, emoji, label;
    if (n >= 12) {
      colorStr = '#00ffff'; colorHex = 0x00ffff; emoji = '👑'; label = 'LEGENDARY';
    } else if (n >= 8) {
      colorStr = '#ff00ff'; colorHex = 0xff00ff; emoji = '💥'; label = 'ULTRA COMBO';
    } else if (n >= 5) {
      colorStr = '#ff4400'; colorHex = 0xff4400; emoji = '⚡'; label = 'MEGA COMBO';
    } else {
      colorStr = '#FFD700'; colorHex = 0xFFD700; emoji = '🔥'; label = 'COMBO';
    }
    const texto = `${emoji} x${this.comboMultiplier} ${label}!`;

    const gfx = this.add.graphics().setDepth(19);
    gfx.fillStyle(0x000000, 0.75);
    gfx.fillRoundedRect(GAME_WIDTH/2 - 130, 154, 260, 44, 12);
    gfx.lineStyle(2, colorHex, 0.9);
    gfx.strokeRoundedRect(GAME_WIDTH/2 - 130, 154, 260, 44, 12);

    const t = this.add.text(GAME_WIDTH/2, 176, texto, {
      fontSize: n >= 5 ? '24px' : '21px', color: colorStr, fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setScale(0.5).setAlpha(0);

    this.comboPanel = this.add.container(0, 0, [gfx, t]).setAlpha(0);

    this.tweens.add({
      targets: [this.comboPanel, t], alpha: 1, duration: 150,
      onStart: () => { this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut' }); }
    });

    this.time.delayedCall(1400, () => {
      if (this.comboPanel) {
        this.tweens.add({
          targets: this.comboPanel, alpha: 0, duration: 300,
          onComplete: () => { if (this.comboPanel) { this.comboPanel.destroy(); this.comboPanel = null; } }
        });
      }
    });
  }

  // ─── PARTÍCULAS ───────────────────────────────────────────────────────────

  emitirParticulas(x, y, tipo) {
    const cols = tipo === 'buena'
      ? [0xe94560, 0xff8800, 0xFFD700, 0xff4488]
      : [0x4488ff, 0x00ccff, 0x8844ff];
    const e = this.add.particles(x, y, 'particula', {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 }, lifespan: 600, quantity: 22,
      tint: cols, emitting: false
    }).setDepth(20);
    e.explode(22);
    this.time.delayedCall(800, () => e.destroy());
  }

  emitirParticulasEspeciales(x, y, tipo) {
    const configs = {
      fuego: { tint: [0xff0000, 0xff4400, 0xff8800, 0xFFD700], count: 30, speed: { min: 100, max: 320 } },
      hielo: { tint: [0x00ccff, 0x88ddff, 0xaaeeff, 0xffffff], count: 25, speed: { min: 80, max: 240 } }
    };
    const cfg = configs[tipo];
    const e = this.add.particles(x, y, tipo === 'fuego' ? 'chispa' : 'particula', {
      speed: cfg.speed, angle: { min: 0, max: 360 },
      scale: { start: 1.8, end: 0 }, lifespan: tipo === 'fuego' ? 800 : 700,
      quantity: cfg.count, tint: cfg.tint, emitting: false,
      rotate: { min: 0, max: 360 }
    }).setDepth(20);
    e.explode(cfg.count);
    this.time.delayedCall(1000, () => e.destroy());
  }

  emitirParticulasExplosivas(x, y) {
    // Onda 1 — grande y rápida
    const e1 = this.add.particles(x, y, 'chispa', {
      speed: { min: 180, max: 460 }, angle: { min: 0, max: 360 },
      scale: { start: 2.2, end: 0 }, lifespan: 900, quantity: 45,
      tint: [0xffee00, 0xff8800, 0xff4400, 0xffffff],
      rotate: { min: 0, max: 360 }, emitting: false
    }).setDepth(22);
    e1.explode(45);

    // Onda 2 — más lenta, brillo
    this.time.delayedCall(120, () => {
      const e2 = this.add.particles(x, y, 'particula', {
        speed: { min: 60, max: 180 }, angle: { min: 0, max: 360 },
        scale: { start: 2, end: 0 }, lifespan: 700, quantity: 25,
        tint: [0xffffff, 0xffeecc, 0xffdd88],
        emitting: false
      }).setDepth(22);
      e2.explode(25);
      this.time.delayedCall(800, () => e2.destroy());
    });

    // Flash de explosión
    const flash = this.add.circle(x, y, 80, 0xffffff, 0.7).setDepth(21);
    this.tweens.add({ targets: flash, scaleX: 3, scaleY: 3, alpha: 0, duration: 350, onComplete: () => flash.destroy() });

    this.time.delayedCall(1100, () => e1.destroy());
  }

  mostrarPuntosFlotantes(x, y, texto, color = '#00ff88') {
    const t = this.add.text(x, y - 20, texto, {
      fontSize: '36px', color, fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 6, fill: true }
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: y - 120, alpha: 0, scaleX: 1.3, scaleY: 1.3, duration: 1100, ease: 'Power2.easeOut', onComplete: () => t.destroy() });
  }

  mostrarCasi(x, y) {
    const t = this.add.text(x, y - 60, '¡Casi!', {
      fontSize: '30px', color: '#ff9900', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);
    this.textoCasi = t;
    this.tweens.add({ targets: t, y: y - 140, alpha: 0, duration: 1100, ease: 'Power2.easeOut', onComplete: () => { t.destroy(); if (this.textoCasi === t) this.textoCasi = null; } });
  }

  limpiarCasi() {
    if (this.textoCasi) {
      this.tweens.killTweensOf(this.textoCasi);
      this.textoCasi.destroy();
      this.textoCasi = null;
    }
    this.casiMostrado = false;
  }

  // ─── JACKPOT ──────────────────────────────────────────────────────────────

  actualizarVelocidadMusica() {
    if (!this.musica) return;
    const p = this.puntosJackpot / PUNTOS_JACKPOT;
    this.musica.setRate(p > 0.75 ? 1.6 : p > 0.5 ? 1.3 : p > 0.25 ? 1.1 : 1.0);
  }

  jackpot() {
    this.sonidoAcordeon(); this.sonidoMonedas();
    this.cameras.main.flash(500, 255, 215, 0, false);
    this.cameras.main.shake(600, 0.018);

    // Lluvia masiva de partículas
    const jp = this.add.particles(GAME_WIDTH/2, GAME_HEIGHT/2, 'chispa', {
      speed: { min: 180, max: 500 }, angle: { min: 0, max: 360 },
      scale: { start: 1.8, end: 0 }, lifespan: 1200,
      tint: [0xFFD700, 0xff8800, 0xff4400, 0xffffff, 0xff44cc],
      rotate: { min: 0, max: 360 }, emitting: false
    }).setDepth(22);
    jp.explode(80);
    this.time.delayedCall(1400, () => jp.destroy());

    // Panel de jackpot
    const bgPanel = this.add.graphics().setDepth(21).setAlpha(0);
    bgPanel.fillStyle(0x000000, 0.88);
    bgPanel.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const textoWin = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 45, '🎰 JACKPOT! 🎰', {
      fontSize: '46px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#ff8800', blur: 15, fill: true }
    }).setOrigin(0.5).setDepth(23).setAlpha(0).setScale(0.4);

    const textoBonus = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 45, '+1000 puntos bonus! 🎁', {
      fontSize: '28px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(23).setAlpha(0);

    this.tweens.add({
      targets: [bgPanel, textoWin, textoBonus], alpha: 1, scaleX: 1, scaleY: 1,
      duration: 400, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [textoWin, textoBonus], scaleX: 1.15, scaleY: 1.15,
          duration: 380, yoyo: true, repeat: 3,
          onComplete: () => {
            bgPanel.destroy(); textoWin.destroy(); textoBonus.destroy();
            this.puntos += 1000;
            this.puntosJackpot = 0;
            this.actualizarBarraJackpot();
            this.textoPuntos.setText((this.registry.get('nombreJugador') || 'Jugador') + ': ' + this.puntos);
            if (this.musica) this.musica.setRate(1.0);
            this.scene.pause();
            this.scene.launch('SlotScene');
          }
        });
      }
    });
  }

  verificarOferta() {
    if (this.puntos >= this.puntosUltimaOferta + PUNTOS_OFERTA) {
      this.puntosUltimaOferta = this.puntos;
      this.scene.pause();
      this.scene.launch('OfertaScene');
    }
  }

  // ─── GAME LOOP ────────────────────────────────────────────────────────────

  update() {
    // Viento — el tejo de hielo es inmune
    if (this.lanzado && this.vientoFuerza > 0 && this.tejo.body && this.tejoEspecial !== 'hielo') {
      this.tejo.applyForce({ x: this.vientoFuerza * this.vientoDireccion, y: 0 });
    }

    // Obstáculo (cualquier nivel con obstaculo: true)
    if (this.obstaculoObj && NIVELES[this.nivelActual]?.obstaculo) {
      const x = this.obstaculoObj.x;
      if (x > GAME_WIDTH - 80) this.obstaculoDireccion = -1;
      if (x < 80) this.obstaculoDireccion = 1;
      this.obstaculoObj.x += 2.5 * this.obstaculoDireccion;
      this.matter.body.setPosition(this.obstaculoObj.body, { x: this.obstaculoObj.x, y: this.obstaculoObj.y });
    }

    // Actualizar posición del aura especial sobre el tejo
    if (this.tejoEspecial) {
      this.auraEspecial.setPosition(this.tejo.x, this.tejo.y);
    }

    // Trail del tejo
    if (this.lanzado && this.tejo.body) {
      this.trail.push({ x: this.tejo.x, y: this.tejo.y });
      if (this.trail.length > 12) this.trail.shift();

      this.trailGraphics.clear();
      const trailPaletas = {
        fuego:    [0xff0000, 0xff4400, 0xff8800, 0xFFD700, 0xff8800, 0xff4400],
        hielo:    [0x00aaff, 0x00ccff, 0x88ddff, 0xffffff, 0xccf0ff],
        explosivo:[0xffee00, 0xff8800, 0xffffff, 0xffcc00, 0xff8800],
      };
      const paleta = trailPaletas[this.tejoEspecial];
      const baseColor = this.registry.get('colorTejo') ?? 0x999999;

      this.trail.forEach((pos, i) => {
        const t = i / this.trail.length;
        const alpha = t * (this.tejoEspecial ? 0.65 : 0.45);
        const radio = 5 + t * (this.tejoEspecial ? 16 : 12);
        const color = paleta ? paleta[i % paleta.length] : baseColor;
        this.trailGraphics.fillStyle(color, alpha);
        this.trailGraphics.fillCircle(pos.x, pos.y, radio);
      });

      // Chispa ocasional para fuego/explosivo
      if (this.tejoEspecial === 'fuego' || this.tejoEspecial === 'explosivo') {
        if (Math.random() < 0.3 && this.tejo.body.speed > 3) {
          const spark = this.add.circle(this.tejo.x + Phaser.Math.Between(-8, 8), this.tejo.y + Phaser.Math.Between(-8, 8),
            Phaser.Math.FloatBetween(2, 5), this.tejoEspecial === 'fuego' ? 0xff8800 : 0xffee00, 0.8).setDepth(7);
          this.tweens.add({ targets: spark, scaleX: 0, scaleY: 0, alpha: 0, duration: Phaser.Math.Between(150, 300), onComplete: () => spark.destroy() });
        }
      }

      // Near-miss detection
      if (!this.yaGolpeo && !this.casiMostrado && this.tejo.body.speed > 2) {
        for (const diana of this.dianas) {
          const dist = Phaser.Math.Distance.Between(this.tejo.x, this.tejo.y, diana.imagen.x, diana.imagen.y);
          if (dist < 72 && dist > 36) {
            this.casiMostrado = true;
            this.mostrarCasi(diana.imagen.x, diana.imagen.y);
            break;
          }
        }
      }
    }

    // Reset si toca el suelo
    if (this.lanzado && this.tejo.y > GAME_HEIGHT - 50) this.resetearTejo();

    // Reset si lleva quieto mucho tiempo
    if (this.lanzado && !this.yaGolpeo && this.tejo.body) {
      const vel = this.tejo.body.speed;
      if (vel < 0.3) {
        if (!this.timerQuieto) {
          this.timerQuieto = this.time.delayedCall(1500, () => { this.timerQuieto = null; this.resetearTejo(); });
        }
      } else {
        if (this.timerQuieto) { this.timerQuieto.remove(); this.timerQuieto = null; }
      }
    }
  }

  resetearTejo() {
    this.timerQuieto = null;
    this.lanzado = false;
    this.yaGolpeo = false;
    this.limpiarCasi();
    this.tejo.setStatic(true);
    this.tejo.setVelocity(0, 0);
    this.matter.body.setVelocity(this.tejo.body, { x: 0, y: 0 });
    this.tejo.setAngularVelocity(0);
    this.tejo.setAngle(0);
    this.matter.body.setPosition(this.tejo.body, { x: this.tejoX, y: this.tejoY });
    this.tejo.setPosition(this.tejoX, this.tejoY);
    this.textoInstruccion.setVisible(true);
    this.tejoAura.setPosition(this.tejoX, this.tejoY);
    this.tejoAura.setVisible(true);

    // Limpiar trail
    this.trail = [];
    this.trailGraphics.clear();

    // Gestionar lanzamientos del tejo especial
    if (this.tejoEspecial && this.lanzamientosEspeciales > 0) {
      this.lanzamientosEspeciales--;
      this.actualizarPowerDots();
      if (this.lanzamientosEspeciales === 0) {
        this.desactivarTejoEspecial();
      }
    }
  }

  // ─── AUDIO ────────────────────────────────────────────────────────────────

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

  sonidoFuego() {
    // Sonido whoosh ardiente
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 600;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.3);
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
