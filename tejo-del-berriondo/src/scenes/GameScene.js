import Phaser from 'phaser';
import casinoBg from '../assets/casino-bg.mp3';
import {
  GAME_WIDTH, GAME_HEIGHT,
  PHYSICS, COLORS, FONT,
  PUNTOS_JACKPOT, NIVELES, TOTAL_NIVELES,
  PUNTOS_OFERTA,
  TENANT_CONFIG, perspectiveScale,
} from '../config/game.config.js';

export default class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameScene' });
    this.tejoX = GAME_WIDTH / 2;
    this.tejoY = GAME_HEIGHT - 150;
    this.lanzado = false;
    this.isDragging = false;
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.puntos = 0;
    this.puntosJackpot = 0;
    this.yaGolpeo = false;
    this.timerQuieto = null;
    this.aimGraphics = null;
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
    this.comboMultiplier = 1;
    this.comboPanel = null;
    this.casiMostrado = false;
    this.textoCasi = null;
    this.windParticles = [];
    this.flechasViento = [];
    this.jackpotBorder = null;
    this.jackpotBorderTween = null;
    this.rachaCalienteBorder = null;
    this.rachaCalienteTween = null;
    this.powerDots = [];
    this.powerBadge = null;
    // Vuelo cinemático 3D
    this.tejoVis = null;
    this.tejoSombra = null;
    this.vuelo = null;        // { x0, y0, xLand, yLand, hMax, t0, dur, eff }
    this.enVuelo = false;
    this.alturaActual = 0;
    this.derivaVel = 0;
    this.derivaOff = 0;
    this.derivaAccel = 0;
    this.gallinaCooldown = 0;
  }

  preload() {
    const colorTejo = this.registry.get('colorTejo') ?? 0x999999;
    const { cancha } = TENANT_CONFIG;

    // ── Tejo: disco metálico plano visto desde arriba ──────────────
    // (la sombra es un objeto aparte — permite la parábola 3D en vuelo)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Cuerpo del disco
    g.fillStyle(colorTejo, 1);   g.fillEllipse(50, 50, 56, 52);
    // Borde oscuro (grosor del disco)
    g.fillStyle(0x000000, 0.22); g.fillEllipse(50, 52, 56, 52);
    // Superficie superior (reflejo)
    g.fillStyle(0xffffff, 0.10); g.fillEllipse(50, 47, 44, 38);
    // Hueco central (tejos reales tienen agujero)
    g.fillStyle(0x000000, 0.80); g.fillCircle(50, 50, 7);
    g.fillStyle(0x222222, 0.50); g.fillCircle(50, 50, 4.5);
    // Destello metálico
    g.fillStyle(0xffffff, 0.40); g.fillEllipse(42, 42, 14, 9);
    g.generateTexture('tejo', 100, 100); g.destroy();

    // ── Diana buena: mecha sobre bocín (como el tejo real) ──────────
    const d = this.make.graphics({ x: 0, y: 0, add: false });
    // Greda alrededor del bocín
    d.fillStyle(0x9A5B2A, 1); d.fillCircle(50, 50, 36);
    d.fillStyle(0x7A4520, 1); d.fillCircle(50, 50, 33);
    // Aro metálico del bocín
    d.lineStyle(6, 0xB8B8C2, 1); d.strokeCircle(50, 50, 26);
    d.lineStyle(1.5, 0xffffff, 0.55); d.strokeCircle(50, 50, 29);
    d.lineStyle(1.5, 0x50505a, 0.8); d.strokeCircle(50, 50, 23);
    // Interior oscuro del bocín
    d.fillStyle(0x261206, 1); d.fillCircle(50, 50, 21);
    // Mecha: paquete triangular rosado de pólvora
    d.fillStyle(0xe94560, 1); d.fillTriangle(50, 33, 65, 61, 35, 61);
    d.fillStyle(0xff8aa5, 0.85); d.fillTriangle(50, 40, 60, 58, 40, 58);
    d.fillStyle(0x3a2a18, 1); d.fillCircle(50, 53, 4.5); // pólvora
    d.fillStyle(0x000000, 0.6); d.fillCircle(50, 53, 2);
    d.generateTexture('diana-buena', 100, 100); d.destroy();

    // ── Diana trampa: mecha mojada (azul — no explota, te penaliza) ──
    const dt = this.make.graphics({ x: 0, y: 0, add: false });
    dt.fillStyle(0x7A6555, 1); dt.fillCircle(50, 50, 36);
    dt.fillStyle(0x5A4A40, 1); dt.fillCircle(50, 50, 33);
    dt.lineStyle(6, 0x8090A8, 1); dt.strokeCircle(50, 50, 26);
    dt.lineStyle(1.5, 0xaaccee, 0.5); dt.strokeCircle(50, 50, 29);
    dt.fillStyle(0x101820, 1); dt.fillCircle(50, 50, 21);
    // Mecha empapada azul
    dt.fillStyle(0x4488ff, 1); dt.fillTriangle(50, 33, 65, 61, 35, 61);
    dt.fillStyle(0x88bbff, 0.7); dt.fillTriangle(50, 40, 60, 58, 40, 58);
    // Gotas de agua
    dt.fillStyle(0xaaddff, 0.9); dt.fillCircle(43, 48, 2.5); dt.fillCircle(57, 52, 2);
    dt.fillStyle(0x224466, 1); dt.fillCircle(50, 53, 4);
    dt.generateTexture('diana-trampa', 100, 100); dt.destroy();

    // ── Gallina: el obstáculo viviente de la cancha 🐔 ───────────────
    const ga = this.make.graphics({ x: 0, y: 0, add: false });
    // Sombra
    ga.fillStyle(0x000000, 0.25); ga.fillEllipse(36, 56, 40, 8);
    // Cola
    ga.fillStyle(0x8B5A2B, 1); ga.fillTriangle(8, 30, 20, 22, 22, 38);
    ga.fillStyle(0x6b4423, 1); ga.fillTriangle(10, 24, 22, 20, 22, 32);
    // Cuerpo
    ga.fillStyle(0xF2E8D8, 1); ga.fillEllipse(36, 36, 36, 26);
    // Ala
    ga.fillStyle(0xD8C8B0, 1); ga.fillEllipse(36, 34, 22, 14);
    // Cuello y cabeza
    ga.fillStyle(0xF2E8D8, 1); ga.fillRect(48, 16, 10, 18); ga.fillCircle(53, 14, 8);
    // Cresta roja
    ga.fillStyle(0xCE1126, 1);
    ga.fillCircle(50, 6, 3.2); ga.fillCircle(54, 5, 3.4); ga.fillCircle(58, 7, 3);
    // Pico
    ga.fillStyle(0xE8A000, 1); ga.fillTriangle(60, 12, 68, 15, 60, 18);
    // Barbilla
    ga.fillStyle(0xCE1126, 1); ga.fillCircle(59, 20, 2.6);
    // Ojo
    ga.fillStyle(0x000000, 1); ga.fillCircle(55, 12, 1.6);
    // Patas
    ga.lineStyle(2.5, 0xE8A000, 1);
    ga.lineBetween(30, 48, 28, 56); ga.lineBetween(28, 56, 24, 56);
    ga.lineBetween(42, 48, 42, 56); ga.lineBetween(42, 56, 38, 56);
    ga.generateTexture('obstaculo', 72, 60); ga.destroy();

    // ── Partículas ──────────────────────────────────────────────────
    const p = this.make.graphics({ x: 0, y: 0, add: false });
    p.fillStyle(0xffffff, 1); p.fillCircle(6, 6, 6);
    p.generateTexture('particula', 12, 12); p.destroy();

    const sp = this.make.graphics({ x: 0, y: 0, add: false });
    sp.fillStyle(0xffffff, 1);
    sp.fillTriangle(5, 0, 7, 4, 10, 5); sp.fillTriangle(10, 5, 6, 7, 5, 10);
    sp.fillTriangle(5, 10, 3, 6, 0, 5); sp.fillTriangle(0, 5, 4, 3, 5, 0);
    sp.generateTexture('chispa', 10, 10); sp.destroy();

    // ── Partícula tierra (impacto en arcilla) ───────────────────────
    const clay = this.make.graphics({ x: 0, y: 0, add: false });
    clay.fillStyle(0x8A5228, 1); clay.fillCircle(5, 5, 5);
    clay.generateTexture('tierra', 10, 10); clay.destroy();

    this.load.audio('casino-bg', casinoBg);
  }

  create() {
    const { cancha } = TENANT_CONFIG;
    const cx = GAME_WIDTH / 2;

    this.crearFondo();

    // ── Física: solo suelo y techo. SIN paredes laterales — si el tejo
    // se sale de la cancha por los lados, es tiro perdido (como en el
    // tejo real). La detección está en update() → tejoFuera().
    this.matter.add.rectangle(cx, GAME_HEIGHT - 10, GAME_WIDTH, 20,
      { isStatic: true, label: 'suelo', restitution: 0.25, friction: 0.9 });
    this.matter.add.rectangle(cx, 10, GAME_WIDTH, 20,
      { isStatic: true, restitution: 0, friction: 1 });

    this.trailGraphics = this.add.graphics().setDepth(5);
    this.aimGraphics   = this.add.graphics().setDepth(7);

    // ── Tejo físico ─────────────────────────────────────────────────
    this.tejo = this.matter.add.image(this.tejoX, this.tejoY, 'tejo');
    this.tejo.setCircle(26); this.tejo.setStatic(true);
    this.tejo.setFriction(PHYSICS.friction);
    this.tejo.setFrictionAir(PHYSICS.frictionAir);
    this.tejo.setBounce(PHYSICS.restitution);
    this.tejo.body.label = 'tejo';
    this.tejo.body.inertia = Infinity;
    this.tejo.body.inverseInertia = 0;
    this.tejo.setIgnoreGravity(true); // se mueve sobre el plano del suelo, no cae
    this.tejo.setDepth(6);

    // El cuerpo físico es invisible: la "verdad" del juego vive en el
    // suelo (donde están las dianas), pero el disco VISUAL vuela en
    // parábola por encima de su sombra → ilusión 3D
    this.tejo.setVisible(false);
    this.tejoSombra = this.add.ellipse(this.tejoX, this.tejoY + 6, 52, 20, 0x000000, 0.35).setDepth(5);
    this.tejoVis = this.add.image(this.tejoX, this.tejoY, 'tejo').setDepth(6);

    // Aura del tejo en reposo
    this.tejoAura = this.add.circle(this.tejoX, this.tejoY, 36, 0xFFD700, 0.08).setDepth(5);
    this.tweens.add({ targets: this.tejoAura, scaleX: 1.35, scaleY: 1.35, alpha: 0, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Aura de poder especial
    this.auraEspecial = this.add.circle(this.tejoX, this.tejoY, 42, 0xffffff, 0).setDepth(5);

    this.crearHUD();
    this.crearParticulasAmbiente();
    this.cargarNivel(1);

    // ── Colisiones ──────────────────────────────────────────────────
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const labels = [bodyA.label, bodyB.label];
        const dianaBody = bodyA.label?.startsWith('diana') ? bodyA : bodyB;
        // En el aire el tejo pasa POR ENCIMA de las dianas — solo cuenta
        // el contacto al aterrizar o deslizar (el check manual en update()
        // cubre el caso de aterrizar exactamente encima)
        if (this.enVuelo && this.alturaActual > 22) return;
        if (labels.includes('tejo') && labels.includes('diana-buena')) {
          this.golpearDiana('buena', dianaBody.position);
        } else if (labels.includes('tejo') && labels.includes('diana-trampa')) {
          this.golpearDiana('trampa', dianaBody.position);
        }
      });
    });

    // ── Mecánica de lanzamiento por deslizamiento ────────────────────
    // Desliza hacia arriba para lanzar — la dirección y velocidad del
    // deslizamiento determinan el ángulo y la potencia del tejo.

    this.input.once('pointerdown', () => this.iniciarMusica());

    this.input.on('pointerdown', (p) => {
      if (this.lanzado) return;
      this.isDragging = true;
      this.swipeStartX = p.worldX;
      this.swipeStartY = p.worldY;
    });

    this.input.on('pointermove', (p) => {
      if (!this.isDragging || this.lanzado) return;
      this.dibujarAim(p.worldX, p.worldY);
    });

    this.input.on('pointerup', (p) => {
      if (!this.isDragging || this.lanzado) return;
      this.isDragging = false;
      this.aimGraphics.clear();

      const dx     = p.worldX - this.swipeStartX;
      const upDist = this.swipeStartY - p.worldY; // positivo = deslizó hacia arriba

      // Requiere un deslizamiento mínimo hacia arriba
      if (upDist < 28) {
        this.tejoAura.setVisible(true);
        return;
      }

      this.lanzado = true;
      this.timerQuieto = null;
      this.casiMostrado = false;
      this.textoInstruccion.setVisible(false);
      this.trail = [];
      this.sonidoLanzar();
      if (this.tejoEspecial === 'fuego') this.sonidoFuego();

      // Punto de aterrizaje (misma matemática que la mira, con asistencia)
      const at = this.calcularAterrizaje(dx, upDist);

      this.vuelo = {
        x0: this.tejoX, y0: this.tejoY,
        xLand: at.xLand, yLand: at.yLand,
        eff:  at.eff,
        hMax: at.hMax,
        t0:   this.time.now,
        dur:  at.dur,
      };
      this.enVuelo = true;
      this.alturaActual = 0;

      // Deriva lateral aleatoria (px/frame²) — sutil al inicio del juego,
      // crece con cada ciclo de niveles completado
      this.derivaVel = 0;
      this.derivaOff = 0;
      this.derivaAccel = Phaser.Math.FloatBetween(0.0015, 0.006)
        * (Math.random() < 0.5 ? -1 : 1)
        * (1 + (this.ciclo - 1) * 0.4);

      this.matter.body.setPosition(this.tejo.body, { x: this.tejoX, y: this.tejoY });
      this.tejo.setStatic(false);
      this.tejo.setSensor(true);   // en el aire vuela POR ENCIMA del obstáculo
      this.tejo.setFrictionAir(0); // la trayectoria la controla el vuelo
      this.tejo.setScale(1);
      this.tejo.setVelocity(0, 0);
    });

    // Recibir tejo especial cuando OfertaScene reanuda este juego
    this.events.on('resume', (sys, data) => {
      // Seguro: si el tejo quedó varado a mitad de vuelo/golpe mientras
      // la escena estaba pausada (jackpot u oferta), restaurarlo
      if (this.lanzado) this.resetearTejo();
      if (data?.tejoEspecial) this.activarTejoEspecial(data.tejoEspecial);
    });
  }

  // ─── TRAYECTORIA: del swipe al punto de aterrizaje ─────────────────────────
  // Usado por la mira Y el lanzamiento — siempre coinciden.

  calcularAterrizaje(dx, upDist) {
    const { cancha } = TENANT_CONFIG;
    const power = Math.min(upDist / 190, 1);
    const speedMult = this.tejoEspecial === 'fuego'     ? 1.45 :
                      this.tejoEspecial === 'explosivo' ? 1.25 : 1.0;

    // Curva de potencia suave (^0.62): el rango medio-alto del swipe
    // cubre toda la zona de mechas, no solo el extremo del gesto
    const eff = Math.min(1, Math.pow(power, 0.62) * (0.25 + 0.75 * speedMult));

    // Sin imán, sin snapping, sin curvas raras: respuesta LINEAL 1:1.
    // El desplazamiento horizontal del dedo mueve el punto de aterrizaje
    // proporcionalmente — libertad total de apuntado.
    const yLand = Phaser.Math.Linear(this.tejoY - 160, cancha.topY + 16, eff);
    const xLand = this.tejoX + Phaser.Math.Clamp(dx * 1.15, -185, 185);

    return { eff, xLand, yLand, hMax: 85 + eff * 130, dur: 620 + eff * 480 };
  }

  // ─── PUNTERO DE MIRA (reemplaza la resortera) ──────────────────────────────

  dibujarAim(ex, ey) {
    this.aimGraphics.clear();

    const dx     = ex - this.swipeStartX;
    const upDist = this.swipeStartY - ey;

    if (upDist < 8) return;

    const power = Math.min(upDist / 190, 1);

    // Color según tipo de tejo
    let aimColor;
    if      (this.tejoEspecial === 'fuego')    aimColor = 0xff4400;
    else if (this.tejoEspecial === 'hielo')    aimColor = 0x00ccff;
    else if (this.tejoEspecial === 'explosivo') aimColor = 0xffcc00;
    else {
      const g2 = Math.floor(215 * (1 - power * 0.7));
      aimColor = Phaser.Display.Color.GetColor(255, g2, 0);
    }

    // Proyección de la trayectoria 3D real (misma matemática del vuelo,
    // incluida la asistencia de puntería — lo que ves es lo que cae)
    const { cancha } = TENANT_CONFIG;
    const { xLand, yLand, hMax } = this.calcularAterrizaje(dx, upDist);

    for (let i = 1; i <= 13; i++) {
      const t  = i / 13;
      const zE = 1 - Math.pow(1 - t, 1.55);
      const gx = Phaser.Math.Linear(this.tejoX, xLand, zE);
      const gy = Phaser.Math.Linear(this.tejoY, yLand, zE);
      const persp = 0.38 + 0.62 * Math.max(0, Math.min(1, (gy - cancha.topY) / (cancha.botY - cancha.topY)));
      const h = hMax * 4 * t * (1 - t) * (0.45 + 0.55 * persp);
      // Los puntos también encogen con la distancia — la mira se ve 3D
      this.aimGraphics.fillStyle(aimColor, (1 - t) * 0.6 + 0.2);
      this.aimGraphics.fillCircle(gx, gy - h, 4.2 * persp + 1);
    }

    // Marca elíptica de aterrizaje en el suelo
    const perspL = 0.38 + 0.62 * Math.max(0, Math.min(1, (yLand - cancha.topY) / (cancha.botY - cancha.topY)));
    this.aimGraphics.lineStyle(2, aimColor, 0.85);
    this.aimGraphics.strokeEllipse(xLand, yLand, 34 * perspL, 14 * perspL);
    this.aimGraphics.fillStyle(aimColor, 0.18);
    this.aimGraphics.fillEllipse(xLand, yLand, 34 * perspL, 14 * perspL);

    // Anillo de potencia alrededor del tejo
    const ringR = 28 + power * 14;
    this.aimGraphics.lineStyle(2, aimColor, 0.45 + power * 0.45);
    this.aimGraphics.strokeCircle(this.tejoX, this.tejoY, ringR);
  }

  // ─── FONDO 3-D — CANCHA DE TEJO ──────────────────────────────────────────

  crearFondo() {
    const { cancha, colores } = TENANT_CONFIG;
    const cx  = GAME_WIDTH / 2;
    const { topY, botY, topHW, botHW } = cancha;

    // ── Fondo superior: rancho de tejo (banda visible 100-topY) ──────
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x1a0800, 0x1a0800, 0x2e1000, 0x2e1000, 1);
    sky.fillRect(0, 0, GAME_WIDTH, topY + 30);

    // Techo de zinc corrugado al fondo de la cancha
    const zincY = 100, zincH = 18;
    sky.fillStyle(0x3a3f44, 1);
    sky.fillRect(0, zincY, GAME_WIDTH, zincH);
    for (let i = 0; i < 24; i++) {
      sky.fillStyle(i % 2 === 0 ? 0x4a5058 : 0x32363c, 1);
      sky.fillRect(i * 20, zincY, 10, zincH);
    }
    sky.fillStyle(0x14161a, 1);
    sky.fillRect(0, zincY + zincH - 2, GAME_WIDTH, 3);

    // Viga de madera que sostiene el techo
    const vigaY = zincY + zincH + 1;
    sky.fillStyle(0x5C3317, 1);
    sky.fillRect(0, vigaY, GAME_WIDTH, 8);
    sky.lineStyle(1, 0x7a4a22, 0.8);
    sky.lineBetween(0, vigaY + 3, GAME_WIDTH, vigaY + 3);

    // Pared trasera de tablas detrás del cajón
    const paredY = vigaY + 8;
    sky.fillStyle(0x33200e, 1);
    sky.fillRect(0, paredY, GAME_WIDTH, topY - paredY + 8);
    sky.lineStyle(1, 0x000000, 0.25);
    for (let i = 1; i < 8; i++) {
      sky.lineBetween(i * (GAME_WIDTH / 8), paredY, i * (GAME_WIDTH / 8), topY + 8);
    }

    // Postes laterales de madera
    sky.fillStyle(0x4a2c14, 1);
    sky.fillRect(14, vigaY, 12, topY - vigaY + 8);
    sky.fillRect(GAME_WIDTH - 26, vigaY, 12, topY - vigaY + 8);

    // Siluetas de espectadores (gente tomando en el rancho)
    sky.fillStyle(0x200a00, 1);
    for (let i = 0; i < 22; i++) {
      const hx = 36 + i * 19;
      const hy = topY + 2;
      const hw = 7 + (i % 3) * 3;
      const hh = 13 + (i % 4) * 6;
      sky.fillRoundedRect(hx - hw / 2, hy - hh, hw, hh, 3);
      sky.fillCircle(hx, hy - hh - 3, hw / 2 + 1);
    }

    // Bombillos colgando de la viga (luz cálida de cancha)
    for (let i = 0; i < 9; i++) {
      const lx = 40 + i * ((GAME_WIDTH - 80) / 8);
      sky.lineStyle(1, 0x14100c, 0.9);
      sky.lineBetween(lx, vigaY + 8, lx, vigaY + 13);
      sky.fillStyle(0xffcc66, 0.13);
      sky.fillCircle(lx, vigaY + 16, 9);
      sky.fillStyle(0xffdd88, 0.95);
      sky.fillCircle(lx, vigaY + 16, 3.5);
    }

    // ── Piso de la cancha (trapecio de arcilla) ──────────────────────
    const floor = this.add.graphics();

    // Capa base — arcilla oscura
    floor.fillStyle(colores.pisoOscuro, 1);
    floor.fillPoints([
      { x: cx - botHW, y: botY },
      { x: cx + botHW, y: botY },
      { x: cx + topHW, y: topY },
      { x: cx - topHW, y: topY },
    ], true);

    // Franjas de perspectiva (variación de color)
    for (let s = 0; s < 5; s++) {
      const t0 = s / 5;
      const t1 = (s + 1) / 5;
      const ya = topY + (botY - topY) * t0;
      const yb = topY + (botY - topY) * t1;
      const hwa = topHW + (botHW - topHW) * t0;
      const hwb = topHW + (botHW - topHW) * t1;
      // alternamos tono oscuro/medio para simular textura
      const col = s % 2 === 0 ? colores.pisoMedio : colores.pisoOscuro;
      floor.fillStyle(col, 0.30);
      floor.fillPoints([
        { x: cx - hwa, y: ya },
        { x: cx + hwa, y: ya },
        { x: cx + hwb, y: yb },
        { x: cx - hwb, y: yb },
      ], true);
    }

    // Iluminación central (spotlight desde arriba)
    floor.fillStyle(0xffffff, 0.03);
    floor.fillPoints([
      { x: cx - topHW * 0.8, y: topY },
      { x: cx + topHW * 0.8, y: topY },
      { x: cx + botHW * 0.5, y: botY },
      { x: cx - botHW * 0.5, y: botY },
    ], true);

    // ── Líneas de perspectiva en el piso ──────────────────────────────
    const lineGfx = this.add.graphics().setDepth(1);
    lineGfx.lineStyle(1, 0xffffff, 0.06);

    // Líneas longitudinales que convergen al fondo
    [-2, -1, 0, 1, 2].forEach(i => {
      lineGfx.lineBetween(
        cx + i * (botHW / 2.4), botY,
        cx + i * (topHW / 1.2), topY,
      );
    });
    // Líneas transversales en perspectiva
    for (let j = 0; j <= 6; j++) {
      const t  = j / 6;
      const yL = topY + (botY - topY) * t;
      const hw = topHW + (botHW - topHW) * t;
      lineGfx.lineBetween(cx - hw, yL, cx + hw, yL);
    }

    // ── Paredes laterales ────────────────────────────────────────────
    const walls = this.add.graphics();
    walls.fillStyle(colores.paredes, 1);
    walls.fillPoints([
      { x: 0,         y: botY },
      { x: cx - botHW, y: botY },
      { x: cx - topHW, y: topY },
      { x: 0,         y: topY },
    ], true);
    walls.fillPoints([
      { x: GAME_WIDTH,  y: botY },
      { x: cx + botHW, y: botY },
      { x: cx + topHW, y: topY },
      { x: GAME_WIDTH,  y: topY },
    ], true);

    // Bordes iluminados de las paredes (canto de madera)
    walls.lineStyle(2, 0x8B5A2B, 0.55);
    walls.lineBetween(cx - botHW, botY, cx - topHW, topY);
    walls.lineBetween(cx + botHW, botY, cx + topHW, topY);

    // Tablas horizontales en las paredes (textura madera)
    walls.lineStyle(1, 0xffffff, 0.04);
    for (let b = 0; b < 8; b++) {
      const ty = topY + (botY - topY) * (b / 7);
      walls.lineBetween(0, ty, cx - topHW - (cx - topHW) * (1 - b / 7), ty);
      walls.lineBetween(GAME_WIDTH, ty, cx + topHW + (cx - topHW) * (1 - b / 7), ty);
    }

    // ── CAJÓN DE GREDA — réplica del tejo colombiano real ────────────
    const target = this.add.graphics().setDepth(2);
    const cajT  = topY - 2;        // borde superior del cajón
    const cajB  = topY + 64;       // borde inferior (más cerca = más ancho)
    const hwT   = topHW + 4;
    const hwB   = topHW + 26;

    // Marco de madera del cajón (tablones gruesos)
    target.fillStyle(0x4a2c14, 1);
    target.fillPoints([
      { x: cx - hwT - 12, y: cajT - 10 },
      { x: cx + hwT + 12, y: cajT - 10 },
      { x: cx + hwB + 12, y: cajB + 8 },
      { x: cx - hwB - 12, y: cajB + 8 },
    ], true);
    // Veta de la madera del marco
    target.lineStyle(1, 0x6b4423, 0.7);
    target.lineBetween(cx - hwT - 12, cajT - 5, cx + hwT + 12, cajT - 5);
    target.lineBetween(cx - hwB - 12, cajB + 4, cx + hwB + 12, cajB + 4);
    target.lineStyle(2, 0x2e1a0a, 0.9);
    target.lineBetween(cx - hwT - 12, cajT - 10, cx + hwT + 12, cajT - 10);

    // Greda (arcilla terracota) inclinada hacia el jugador
    target.fillStyle(0xB06A30, 1);
    target.fillPoints([
      { x: cx - hwT, y: cajT },
      { x: cx + hwT, y: cajT },
      { x: cx + hwB, y: cajB },
      { x: cx - hwB, y: cajB },
    ], true);
    // Mitad superior más oscura (greda húmeda, recién aplanada)
    target.fillStyle(0x8A4E22, 0.55);
    target.fillPoints([
      { x: cx - hwT, y: cajT },
      { x: cx + hwT, y: cajT },
      { x: cx + (hwT + hwB) / 2, y: (cajT + cajB) / 2 },
      { x: cx - (hwT + hwB) / 2, y: (cajT + cajB) / 2 },
    ], true);

    // Huellas de impactos de tejos anteriores en la greda
    const huellas = [
      { x: cx - 42, y: cajT + 18, w: 13, h: 7 },
      { x: cx + 36, y: cajT + 40, w: 15, h: 8 },
      { x: cx - 20, y: cajT + 52, w: 12, h: 6 },
      { x: cx + 52, y: cajT + 14, w: 10, h: 5 },
      { x: cx - 58, y: cajT + 44, w: 11, h: 6 },
    ];
    huellas.forEach(h => {
      target.fillStyle(0x6b3a18, 0.75);
      target.fillEllipse(h.x, h.y, h.w, h.h);
      target.fillStyle(0x542c10, 0.5);
      target.fillEllipse(h.x, h.y + 1, h.w * 0.6, h.h * 0.6);
    });

    // Grano de la greda del cajón (textura de arcilla apisonada)
    for (let i = 0; i < 50; i++) {
      const tQ  = Math.random();
      const yQ  = cajT + (cajB - cajT) * tQ;
      const hwQ = (hwT + (hwB - hwT) * tQ) - 6;
      const xQ  = cx + Phaser.Math.FloatBetween(-hwQ, hwQ);
      target.fillStyle(Math.random() < 0.5 ? 0x6b3a18 : 0xC8854A, Phaser.Math.FloatBetween(0.2, 0.5));
      target.fillCircle(xQ, yQ, Phaser.Math.FloatBetween(0.5, 1.8));
    }
    // Brillo de greda húmeda (reflejo de los bombillos)
    target.fillStyle(0xffcc88, 0.07);
    target.fillEllipse(cx, cajT + 20, hwT * 1.5, 18);

    // Mechas decorativas regadas por la greda (las dianas jugables ya
    // son bocines con mecha — estas son ambiente, en los bordes)
    const mechas = [
      { x: cx - hwT + 14, y: cajT + 12 },
      { x: cx + hwT - 14, y: cajT + 12 },
      { x: cx - hwB + 18, y: cajB - 10 },
      { x: cx + hwB - 18, y: cajB - 10 },
    ];
    mechas.forEach(m => {
      target.fillStyle(0x000000, 0.3);
      target.fillEllipse(m.x, m.y + 5, 10, 3); // sombra
      target.fillStyle(0xe94560, 1);
      target.fillTriangle(m.x, m.y - 8, m.x + 6, m.y + 4, m.x - 6, m.y + 4);
      target.fillStyle(0xff8aa5, 0.85);
      target.fillTriangle(m.x, m.y - 4, m.x + 3.5, m.y + 3, m.x - 3.5, m.y + 3);
      target.fillStyle(0x3a2a18, 1);
      target.fillCircle(m.x, m.y + 1, 1.6);
    });

    // ── Zona del jugador (fondo inferior) ────────────────────────────
    const playerFloor = this.add.graphics().setDepth(1);
    playerFloor.fillStyle(colores.paredes, 0.88);
    playerFloor.fillRect(0, botY, GAME_WIDTH, GAME_HEIGHT - botY);
    playerFloor.lineStyle(1.5, 0x8B5A2B, 0.45);
    playerFloor.lineBetween(0, botY, GAME_WIDTH, botY);

    // ── Textura de greda: gránulos y piedras en el piso ──────────────
    const grava = this.add.graphics().setDepth(1);
    for (let i = 0; i < 90; i++) {
      const tG  = Math.random();
      const yG  = topY + (botY - topY) * tG;
      const hwG = (topHW + (botHW - topHW) * tG) - 8;
      const xG  = cx + Phaser.Math.FloatBetween(-hwG, hwG);
      const rG  = Phaser.Math.FloatBetween(0.6, 2.2) * (0.4 + tG * 0.6);
      const oscuro = Math.random() < 0.5;
      grava.fillStyle(oscuro ? 0x3a2008 : 0x9A6235, Phaser.Math.FloatBetween(0.15, 0.4));
      grava.fillCircle(xG, yG, rG);
    }
    // Marcas de arrastre de tejos en la zona de lanzamiento
    grava.lineStyle(1.5, 0x2e1808, 0.35);
    [-60, -25, 18, 55].forEach(off => {
      grava.lineBetween(cx + off, botY - 18, cx + off * 0.8, botY - 85);
    });

    // ── Banderines tricolor de Colombia sobre las paredes ────────────
    const banderines = this.add.graphics().setDepth(3);
    const coloresBand = [0xFCD116, 0x003893, 0xCE1126]; // amarillo, azul, rojo
    [-1, 1].forEach(lado => {
      // Cuerda siguiendo el borde superior de la pared
      banderines.lineStyle(1.5, 0x1a0e04, 0.9);
      banderines.lineBetween(
        cx + lado * (botHW + 4), botY - 38,
        cx + lado * (topHW + 4), topY + 6,
      );
      for (let i = 0; i < 11; i++) {
        const tB = i / 10;
        const bx = cx + lado * ((botHW + 4) + ((topHW + 4) - (botHW + 4)) * tB);
        const by = (botY - 38) + ((topY + 6) - (botY - 38)) * tB;
        const sz = 11 * (1 - tB * 0.55); // se encogen hacia el fondo
        banderines.fillStyle(coloresBand[i % 3], 0.95);
        banderines.fillTriangle(bx - sz / 2, by, bx + sz / 2, by, bx, by + sz * 1.3);
      }
    });

    // ── Espectadores sentados a los lados (¡muy Colombia!) ───────────
    const ponchoColores = [0xCE1126, 0x008844, 0xFCD116, 0xdddddd, 0x003893, 0xcc6600];
    const filas = [
      { y: 280, lado: -1 }, { y: 290, lado: 1 },
      { y: 420, lado: -1 }, { y: 435, lado: 1 },
      { y: 560, lado: -1 }, { y: 575, lado: 1 },
      { y: 690, lado: -1 }, { y: 700, lado: 1 },
    ];
    filas.forEach((f, idx) => {
      const tE  = (f.y - topY) / (botY - topY);
      const hwE = topHW + (botHW - topHW) * tE;
      const borde = cx + f.lado * hwE;
      // sentados sobre la pared, entre el borde de cancha y el borde de pantalla
      const xE = f.lado < 0 ? borde * 0.5 : borde + (GAME_WIDTH - borde) * 0.5;
      const escala = 0.55 + tE * 0.65;
      const color  = ponchoColores[idx % ponchoColores.length];
      this.crearEspectador(xE, f.y, escala, color, idx % 3 === 0);
    });

    // ── Guacales de cerveza apilados en las esquinas ─────────────────
    [{ x: 42, flip: 1 }, { x: GAME_WIDTH - 42, flip: -1 }].forEach(pos => {
      const gq = this.add.graphics().setDepth(2);
      [0, 1].forEach(nivel => {
        const qy = botY - 16 - nivel * 26;
        const qx = pos.x + nivel * 4 * pos.flip;
        gq.fillStyle(0xD89000, 1);
        gq.fillRect(qx - 26, qy - 12, 52, 24);
        gq.fillStyle(0x9C6800, 1);
        gq.fillRect(qx - 26, qy + 8, 52, 4);
        // Rejilla del guacal
        gq.lineStyle(1.5, 0x7a5200, 0.9);
        for (let c = 1; c < 4; c++) gq.lineBetween(qx - 26 + c * 13, qy - 12, qx - 26 + c * 13, qy + 8);
        gq.lineBetween(qx - 26, qy - 2, qx + 26, qy - 2);
        // Picos de botellas asomando
        if (nivel === 1) {
          gq.fillStyle(0x4a2808, 1);
          [-18, -6, 6, 18].forEach(bx => gq.fillRect(qx + bx - 2.5, qy - 19, 5, 8));
          gq.fillStyle(0xC0A040, 1);
          [-18, -6, 6, 18].forEach(bx => gq.fillRect(qx + bx - 3, qy - 21, 6, 3));
        }
      });
    });

    // ── Bordes de alerta (jackpot / racha caliente) ──────────────────
    this.jackpotBorder = this.add.graphics().setDepth(30).setAlpha(0);
    this.jackpotBorder.lineStyle(4, 0xFFD700, 1);
    this.jackpotBorder.strokeRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4);

    this.rachaCalienteBorder = this.add.graphics().setDepth(29).setAlpha(0);
    this.rachaCalienteBorder.lineStyle(5, 0xff3300, 1);
    this.rachaCalienteBorder.strokeRect(6, 6, GAME_WIDTH - 12, GAME_HEIGHT - 12);
    this.rachaCalienteBorder.lineStyle(2, 0xff8800, 0.6);
    this.rachaCalienteBorder.strokeRect(10, 10, GAME_WIDTH - 20, GAME_HEIGHT - 20);
  }

  // ─── ESPECTADOR (figura sentada con poncho y sombrero vueltiao) ───────────

  crearEspectador(x, y, escala, colorPoncho, animado) {
    const c = this.add.container(x, y).setDepth(2);
    c._baseY = y; // para la celebración
    if (!this.espectadores) this.espectadores = [];
    this.espectadores.push(c);
    const g = this.add.graphics();

    // Banquito de madera
    g.fillStyle(0x4a2c14, 1);
    g.fillRect(-13, 9, 26, 4);
    g.fillRect(-11, 13, 3, 7);
    g.fillRect(8, 13, 3, 7);

    // Piernas sentadas
    g.fillStyle(0x26262e, 1);
    g.fillRect(-10, 2, 8, 9);
    g.fillRect(2, 2, 8, 9);

    // Poncho (cuerpo triangular ancho)
    g.fillStyle(colorPoncho, 1);
    g.fillTriangle(0, -22, 15, 6, -15, 6);
    // Rayas del poncho
    g.lineStyle(1.5, 0xffffff, 0.35);
    g.lineBetween(-9, -4, 9, -4);
    g.lineBetween(-12, 2, 12, 2);
    // Brazos
    g.fillStyle(colorPoncho, 0.9);
    g.fillEllipse(-13, -6, 7, 12);
    g.fillEllipse(13, -6, 7, 12);

    // Cabeza
    g.fillStyle(0xC68642, 1);
    g.fillCircle(0, -27, 7);

    // Sombrero vueltiao (ala + copa con bandas)
    g.fillStyle(0xE8DCC0, 1);
    g.fillEllipse(0, -32, 24, 7);
    g.fillRoundedRect(-7, -41, 14, 9, 3);
    g.lineStyle(1.2, 0x4a3a20, 0.9);
    g.strokeEllipse(0, -32, 24, 7);
    g.lineBetween(-7, -37, 7, -37);
    g.fillStyle(0x4a3a20, 0.8);
    g.fillRect(-7, -36, 14, 2);

    // Botella de cerveza en la mano
    g.fillStyle(0x6b3a10, 1);
    g.fillRect(11, -14, 4, 9);
    g.fillRect(12, -18, 2, 5);

    c.add(g);
    c.setScale(escala);

    if (animado) {
      // Celebra: levanta y baja (bob) constantemente
      this.tweens.add({
        targets: c,
        y: y - 4 * escala,
        duration: Phaser.Math.Between(700, 1100),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 800),
      });
    }
    return c;
  }

  celebrarPublico() {
    // El público brinca cuando explota una mecha (squash & stretch para
    // no chocar con el tween de bob que anima la posición y)
    if (!this.espectadores) return;
    this.espectadores.forEach((c, i) => {
      this.tweens.killTweensOf(c, ['scaleX', 'scaleY']);
      const base = c.scaleX;
      this.tweens.add({
        targets: c,
        scaleY: base * 1.18, scaleX: base * 0.92,
        duration: 130, yoyo: true, repeat: 2,
        delay: i * 35, ease: 'Sine.easeInOut',
        onComplete: () => c.setScale(base),
      });
    });
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────

  crearHUD() {
    const hudGfx = this.add.graphics().setDepth(9);
    hudGfx.fillStyle(0x000000, 0.75);
    hudGfx.fillRect(0, 0, GAME_WIDTH, 100);
    hudGfx.lineStyle(1, 0x3D2208, 0.9);
    hudGfx.lineBetween(0, 100, GAME_WIDTH, 100);

    const nombre = this.registry.get('nombreJugador') || 'Jugador';
    this.textoPuntos = this.add.text(18, 20, nombre + ': 0', {
      fontSize: '22px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 4, fill: true },
    }).setDepth(10);

    this.textoNivel = this.add.text(GAME_WIDTH - 18, 20, 'Nivel 1', {
      fontSize: '20px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 4, fill: true },
    }).setOrigin(1, 0).setDepth(10);

    // Barra jackpot
    const barY = 54, barM = 18, barW = GAME_WIDTH - barM * 2;
    const barFondoGfx = this.add.graphics().setDepth(10);
    barFondoGfx.fillStyle(0x111122, 1);
    barFondoGfx.fillRoundedRect(barM, barY - 7, barW, 14, 7);
    barFondoGfx.lineStyle(1, 0x2a3a5a, 0.8);
    barFondoGfx.strokeRoundedRect(barM, barY - 7, barW, 14, 7);

    this.barraJackpot = this.add.graphics().setDepth(11);
    this.textoJackpotLabel = this.add.text(GAME_WIDTH - barM, barY - 14, '🎰 JACKPOT', {
      fontSize: '10px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(12);
    this.textoJackpotPct = this.add.text(barM, barY - 14, '0%', {
      fontSize: '10px', color: '#555566', fontFamily: FONT,
    }).setOrigin(0, 0).setDepth(12);

    this.textoProgreso = this.add.text(GAME_WIDTH / 2, 77, '', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: FONT,
    }).setOrigin(0.5, 0).setDepth(10);

    this.textoViento = this.add.text(GAME_WIDTH - 18, 69, '', {
      fontSize: '20px', color: '#88ccff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(10);

    // Panel de poder especial
    this.panelPoderGfx = this.add.graphics().setDepth(9).setAlpha(0);
    this.textoPoder = this.add.text(GAME_WIDTH / 2, 120, '', {
      fontSize: '16px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    // Dots de lanzamientos restantes
    this.powerDots = [];
    for (let i = 0; i < 3; i++) {
      const dot = this.add.circle(GAME_WIDTH / 2 - 18 + i * 18, 138, 5, 0xffffff, 0.2).setDepth(10);
      this.powerDots.push(dot);
    }

    // Panel inferior
    const bottomGfx = this.add.graphics().setDepth(9);
    bottomGfx.fillStyle(0x000000, 0.65);
    bottomGfx.fillRect(0, GAME_HEIGHT - 72, GAME_WIDTH, 72);
    bottomGfx.lineStyle(1, 0x3D2208, 0.6);
    bottomGfx.lineBetween(0, GAME_HEIGHT - 72, GAME_WIDTH, GAME_HEIGHT - 72);

    this.textoInstruccion = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT - 50,
      TENANT_CONFIG.textos.instruccionLanzar,
      { fontSize: '17px', color: '#8B6040', fontFamily: FONT },
    ).setOrigin(0.5).setDepth(10);

    this.textoOferta = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT - 18,
      '🎁 ¡Acumula puntos para una oferta!',
      { fontSize: '12px', color: '#FFD700', fontFamily: FONT },
    ).setOrigin(0.5).setDepth(10);

    this._barM = barM; this._barW = barW; this._barY = barY;
    this.actualizarBarraJackpot();
  }

  actualizarBarraJackpot() {
    const pct = Math.min(this.puntosJackpot / PUNTOS_JACKPOT, 1);
    const { _barM: m, _barW: w, _barY: barY } = this;
    const fillW = Math.max(6, w * pct);

    this.barraJackpot.clear();
    if (pct > 0.05) {
      this.barraJackpot.fillStyle(0xff8800, 0.2);
      this.barraJackpot.fillRoundedRect(m, barY - 9, fillW, 18, 9);
    }
    const col = pct < 0.5 ? 0x886600 : pct < 0.75 ? 0xcc8800 : 0xFFD700;
    this.barraJackpot.fillStyle(col, 1);
    this.barraJackpot.fillRoundedRect(m, barY - 7, fillW, 14, 7);
    this.barraJackpot.fillStyle(0xffffff, 0.2);
    this.barraJackpot.fillRoundedRect(m + 2, barY - 6, Math.max(4, fillW - 4), 5, { tl: 5, tr: 5, bl: 0, br: 0 });

    if (this.textoJackpotPct) {
      this.textoJackpotPct.setText(Math.floor(pct * 100) + '%');
      this.textoJackpotPct.setStyle({ color: pct > 0.6 ? '#FFD700' : '#555566' });
    }

    if (pct >= 0.8 && !this.jackpotBorderTween) {
      this.jackpotBorderTween = this.tweens.add({
        targets: this.jackpotBorder, alpha: 0.7, duration: 400, yoyo: true, repeat: -1,
      });
    } else if (pct < 0.8 && this.jackpotBorderTween) {
      this.jackpotBorderTween.stop();
      this.jackpotBorderTween = null;
      this.jackpotBorder.setAlpha(0);
    }
  }

  // ─── AMBIENTE ─────────────────────────────────────────────────────────────

  crearParticulasAmbiente() {
    // Polvo de arcilla flotando en la cancha
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(60, GAME_WIDTH - 60);
      const y = Phaser.Math.Between(130, GAME_HEIGHT - 90);
      const r = Phaser.Math.FloatBetween(1, 2.5);
      const dot = this.add.circle(x, y, r, 0xC4832A, Phaser.Math.FloatBetween(0.04, 0.12)).setDepth(2);
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(50, 130),
        x: x + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 9000),
        delay: Phaser.Math.Between(0, 6000),
        repeat: -1,
        onRepeat: () => {
          dot.x = Phaser.Math.Between(60, GAME_WIDTH - 60);
          dot.y = Phaser.Math.Between(GAME_HEIGHT / 2, GAME_HEIGHT - 90);
          dot.setAlpha(Phaser.Math.FloatBetween(0.04, 0.12));
        },
      });
    }
  }

  crearParticulasViento() {
    this.windParticles.forEach(p => p.destroy());
    this.windParticles = [];
    if (!this.vientoFuerza) return;

    for (let i = 0; i < 10; i++) {
      const startX = this.vientoDireccion > 0 ? -8 : GAME_WIDTH + 8;
      const endX   = this.vientoDireccion > 0 ? GAME_WIDTH + 8 : -8;
      const y      = Phaser.Math.Between(120, GAME_HEIGHT - 100);
      const dur    = Phaser.Math.Between(1000, 2500);
      const dot    = this.add.circle(
        startX, y, Phaser.Math.FloatBetween(1.5, 3), 0xC4A060, Phaser.Math.FloatBetween(0.25, 0.55),
      ).setDepth(2);
      this.tweens.add({
        targets: dot, x: endX, duration: dur, delay: Phaser.Math.Between(0, 2500), repeat: -1,
        onRepeat: () => { dot.x = startX; dot.y = Phaser.Math.Between(120, GAME_HEIGHT - 100); },
      });
      this.windParticles.push(dot);
    }
  }

  crearFlechasViento() {
    if (!this.vientoFuerza) return;
    const dir    = this.vientoDireccion;
    const simbolo = dir > 0 ? '→' : '←';
    const posiciones = [
      { x: 52,              y: 370 },
      { x: 52,              y: 530 },
      { x: GAME_WIDTH - 52, y: 430 },
      { x: GAME_WIDTH - 52, y: 590 },
    ];
    posiciones.forEach((pos, i) => {
      const obj  = this.add.text(pos.x, pos.y, simbolo, {
        fontSize: '30px', color: '#C4A060', fontFamily: FONT,
      }).setOrigin(0.5).setDepth(3).setAlpha(0);
      const tween = this.tweens.add({
        targets: obj,
        alpha: { from: 0.06, to: 0.28 },
        x: pos.x + dir * 12,
        duration: 900 + i * 180,
        delay: i * 220,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.flechasViento.push({ obj, tween });
    });
  }

  // ─── NIVELES ──────────────────────────────────────────────────────────────

  cargarNivel(numero) {
    const config = NIVELES[numero];
    const { cancha } = TENANT_CONFIG;
    this.nivelActual = numero;
    this.aciertosNivel = 0;
    this.textoNivel.setText('Nivel ' + this.nivelGlobal);

    this.dianas.forEach(d => {
      d.imagen?.destroy();
      d.anilloExt?.destroy();
      d.anilloMed?.destroy();
    });
    this.dianas = [];

    if (this.obstaculoObj) {
      this.tweens.killTweensOf(this.obstaculoObj);
      this.obstaculoObj.destroy();
      this.obstaculoObj = null;
    }
    this.flechasViento.forEach(f => { f.tween.stop(); f.obj.destroy(); });
    this.flechasViento = [];

    config.dianas.forEach(pos => {
      const esBuena   = pos.tipo === 'buena';
      const texturaKey = esBuena ? 'diana-buena' : 'diana-trampa';
      const dianaColor = esBuena ? COLORS.dianabuena : COLORS.dianatrampa;

      // Escala de perspectiva para la diana (visual + física)
      const dScale = perspectiveScale(pos.y, cancha) * 0.82 + 0.18; // suavizado: 0.47–1.0

      const anilloExt = this.add.circle(pos.x, pos.y, 58, dianaColor, 0.1).setDepth(3);
      const anilloMed = this.add.circle(pos.x, pos.y, 46, dianaColor, 0.18).setDepth(3);
      anilloExt.setScale(dScale);
      anilloMed.setScale(dScale);

      this.tweens.add({ targets: anilloExt, scaleX: 1.4 * dScale, scaleY: 1.4 * dScale, alpha: 0, duration: 1500, repeat: -1, ease: 'Power2.easeOut' });
      this.tweens.add({ targets: anilloMed, scaleX: 1.2 * dScale, scaleY: 1.2 * dScale, alpha: 0, duration: 1100, repeat: -1, delay: 300, ease: 'Power2.easeOut' });

      const imagen = this.matter.add.image(pos.x, pos.y, texturaKey);
      imagen.setCircle(36); imagen.setStatic(true); imagen.setSensor(true);
      imagen.body.label = texturaKey;
      imagen.setScale(dScale);
      imagen.setDepth(4);

      this.dianas.push({ imagen, tipo: pos.tipo, anilloExt, anilloMed });
    });

    // Viento
    this.vientoFuerza = config.viento ? config.fuerzaViento * this.ciclo : 0;
    if (config.viento) {
      this.vientoDireccion = Math.random() > 0.5 ? 1 : -1;
      const flecha    = this.vientoDireccion > 0 ? '→' : '←';
      const intensidad = config.fuerzaViento <= 0.0003 ? flecha : config.fuerzaViento <= 0.0005 ? flecha + flecha : flecha + flecha + flecha;
      this.textoViento.setText(this.vientoDireccion > 0 ? `💨 ${intensidad}` : `${intensidad} 💨`);
    } else {
      this.textoViento.setText('');
    }
    this.crearParticulasViento();
    this.crearFlechasViento();

    if (config.obstaculo) {
      // La gallina patrulla EN la línea de las mechas buenas: cruza
      // frente a los objetivos y puede atajar el tejo cuando viene
      // bajando — hay que cronometrar el tiro
      const gallinaY = 196;
      this.obstaculoObj = this.matter.add.image(GAME_WIDTH / 2, gallinaY, 'obstaculo');
      this.obstaculoObj.setStatic(true);
      this.obstaculoObj.setSensor(true); // el golpe lo resuelve update() a mano
      this.obstaculoObj.body.label = 'obstaculo';
      const oScale = perspectiveScale(gallinaY, cancha) * 0.9 + 0.1;
      this.obstaculoObj.setScale(oScale);
      this.obstaculoObj.setDepth(4);
      this.obstaculoDireccion = 1;
      this.gallinaCooldown = 0;
    }

    // Aviso de nivel — SOLO texto, sin caja negra que pueda quedarse
    // tapando la cancha. Con autodestrucción garantizada.
    if (this.nivelBadge) {
      this.tweens.killTweensOf(this.nivelBadge);
      this.nivelBadge.destroy();
      this.nivelBadge = null;
    }
    const textoEntrada = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '¡NIVEL ' + this.nivelGlobal + '!', {
      fontSize: '46px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 3, color: '#ff8800', blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(27).setAlpha(0).setScale(0.5);
    this.nivelBadge = textoEntrada;

    this.tweens.add({
      targets: textoEntrada, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: textoEntrada, alpha: 0, y: textoEntrada.y - 50,
          duration: 350, delay: 800,
          onComplete: () => {
            if (this.nivelBadge === textoEntrada) this.nivelBadge = null;
            textoEntrada.destroy();
          },
        });
      },
    });
    // Red de seguridad: pase lo que pase, a los 3s ya no existe
    this.time.delayedCall(3000, () => {
      if (textoEntrada.active) {
        this.tweens.killTweensOf(textoEntrada);
        textoEntrada.destroy();
        if (this.nivelBadge === textoEntrada) this.nivelBadge = null;
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
    const textos      = { fuego: '🔥 TEJO DE FUEGO', hielo: '❄️ TEJO DE HIELO', explosivo: '💥 TEJO EXPLOSIVO' };
    const descrips    = { fuego: '+45% velocidad · rastro de llamas', hielo: 'Inmune al viento · rastro de hielo', explosivo: 'x2 puntos · explosión masiva' };
    const hexColores  = { fuego: '#ff5500', hielo: '#00ccff', explosivo: '#ffee00' };

    this.tejoVis.setTint(coloresTint[tipo]);

    this.auraEspecial.setFillStyle(coloresAura[tipo], 0.3);
    if (this.auraEspecialTween) this.auraEspecialTween.stop();
    this.auraEspecialTween = this.tweens.add({
      targets: this.auraEspecial, scaleX: 1.6, scaleY: 1.6, alpha: 0,
      duration: 700, repeat: -1, ease: 'Power2.easeOut',
    });

    const flashColors = { fuego: [200, 80, 0], hielo: [0, 100, 200], explosivo: [200, 180, 0] };
    const [r, g, b] = flashColors[tipo];
    this.cameras.main.flash(500, r, g, b, false);

    // Sin caja — el texto del poder con borde grueso se lee solo
    this.panelPoderGfx.clear();

    this.textoPoder.setText(textos[tipo]);
    this.textoPoder.setStyle({ color: hexColores[tipo] });
    this.textoPoder.setPosition(GAME_WIDTH / 2, 127);
    this.textoPoder.setAlpha(1);

    this.actualizarPowerDots();

    const badge = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, textos[tipo] + ' ACTIVADO!', {
      fontSize: '30px', color: hexColores[tipo], fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: coloresAura[tipo], blur: 15, fill: true },
    }).setOrigin(0.5).setDepth(28).setScale(0.3).setAlpha(0);

    this.tweens.add({
      targets: badge, alpha: 1, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(900, () => {
          this.tweens.add({
            targets: badge, alpha: 0, y: GAME_HEIGHT / 2 - 60, duration: 400,
            onComplete: () => badge.destroy(),
          });
        });
      },
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
    this.tejoVis.clearTint();

    if (this.auraEspecialTween) { this.auraEspecialTween.stop(); this.auraEspecialTween = null; }
    this.auraEspecial.setAlpha(0);

    this.panelPoderGfx.setAlpha(0);
    this.textoPoder.setAlpha(0);
    this.powerDots.forEach(dot => { dot.setFillStyle(0xffffff, 0.2); dot.setScale(1); });
  }

  // ─── GOLPE A DIANA ────────────────────────────────────────────────────────

  golpearDiana(tipo, pos = { x: GAME_WIDTH / 2, y: 300 }) {
    if (this.yaGolpeo) return;
    this.yaGolpeo = true;
    this.limpiarCasi();
    this.sonidoImpacto();

    // Polvo de arcilla en el impacto
    this.emitirTierra(pos.x, pos.y);

    if (tipo === 'buena') {
      let puntosBase = 500;
      if (this.tejoEspecial === 'explosivo') puntosBase = 1000;
      const puntosGanados = puntosBase * this.comboMultiplier;

      this.puntos += puntosGanados;
      this.verificarOferta();
      this.actualizarIndicadorOferta();

      this.tweens.add({
        targets: this.textoPuntos, scaleX: 1.3, scaleY: 1.3, duration: 120, yoyo: true,
        onStart: () => this.textoPuntos.setText((this.registry.get('nombreJugador') || 'Jugador') + ': ' + this.puntos),
      });

      if (this.tejoEspecial === 'fuego') {
        this.cameras.main.shake(200, 0.010);
        this.cameras.main.flash(250, 200, 80, 0, false);
        this.emitirParticulasEspeciales(pos.x, pos.y, 'fuego');
        this.mostrarPuntosFlotantes(pos.x, pos.y, '+' + puntosGanados, '#ff8800');
      } else if (this.tejoEspecial === 'hielo') {
        this.cameras.main.shake(150, 0.008);
        this.cameras.main.flash(300, 0, 80, 180, false);
        this.emitirParticulasEspeciales(pos.x, pos.y, 'hielo');
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
        // ¡MECHA! — explosión de pólvora como en el tejo real
        this.cameras.main.shake(280, 0.014);
        this.cameras.main.flash(220, 255, 240, 200, false);
        this.emitirExplosionMecha(pos.x, pos.y);
        this.mostrarPuntosFlotantes(pos.x, pos.y, '💥 +' + puntosGanados, '#ffcc44');
      }

      this.sonidoMonedas();
      this.celebrarPublico();

      // Jackpot progress
      if (Math.random() < 0.35) {
        const jackpotBonus = this.tejoEspecial === 'explosivo' ? 750 : 500;
        this.puntosJackpot += jackpotBonus;
        this.actualizarBarraJackpot();
        this.actualizarVelocidadMusica();
        this.tweens.killTweensOf(this.barraJackpot);
        this.barraJackpot.setScale(1);
        this.tweens.add({ targets: this.barraJackpot, scaleY: 1.4, duration: 100, yoyo: true });

        if (this.puntosJackpot >= PUNTOS_JACKPOT) {
          this.time.delayedCall(300, () => this.jackpot());
          return;
        }
      }

      this.golpesConsecutivos++;
      this.actualizarProgreso();
      this.aciertosNivel++;
      this.actualizarCombo();

      const config = NIVELES[this.nivelActual];
      if (config.aciertosParaSiguiente && this.aciertosNivel >= config.aciertosParaSiguiente) {
        const siguiente = this.nivelActual + 1;
        const nivelSig  = siguiente <= TOTAL_NIVELES ? siguiente : 1;
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
      // Diana trampa
      const penalidad = 750;
      this.puntosJackpot = Math.max(0, this.puntosJackpot - penalidad);
      this.actualizarBarraJackpot();
      this.actualizarVelocidadMusica();

      this.aciertosNivel = 0;
      this.golpesConsecutivos = 0;
      this.comboMultiplier = 1;
      if (this.comboPanel) { this.comboPanel.destroy(); this.comboPanel = null; }
      this.apagarRachaCaliente();

      const { _barM: m, _barW: w, _barY: barY } = this;
      const barFlash = this.add.graphics().setDepth(12);
      barFlash.fillStyle(0x4488ff, 0.6);
      barFlash.fillRoundedRect(m, barY - 7, w, 14, 7);
      this.tweens.add({ targets: barFlash, alpha: 0, duration: 600, onComplete: () => barFlash.destroy() });
      this.tweens.killTweensOf(this.textoJackpotPct);
      this.tweens.add({
        targets: this.textoJackpotPct, scaleX: 1.5, scaleY: 1.5, duration: 120,
        yoyo: true, repeat: 2, ease: 'Power2.easeOut',
        onComplete: () => this.textoJackpotPct.setScale(1),
      });

      this.cameras.main.shake(300, 0.015);
      this.cameras.main.flash(350, 0, 50, 180, false);
      this.emitirParticulas(pos.x, pos.y, 'trampa');
      this.mostrarPuntosFlotantes(pos.x, pos.y, '🎰 -' + penalidad, '#4488ff');
      this.actualizarProgreso();

      this.time.delayedCall(300, () => this.resetearTejo());
    }
  }

  actualizarCombo() {
    if      (this.golpesConsecutivos >= 12) this.comboMultiplier = 5;
    else if (this.golpesConsecutivos >= 8)  this.comboMultiplier = 4;
    else if (this.golpesConsecutivos >= 5)  this.comboMultiplier = 3;
    else if (this.golpesConsecutivos >= 3)  this.comboMultiplier = 2;
    else                                    this.comboMultiplier = 1;

    if (this.golpesConsecutivos >= 3) {
      this.mostrarBadgeCombo();
      if (this.golpesConsecutivos === 3) this.sonidoAcordeon();
    }

    if (this.golpesConsecutivos >= 8 && !this.rachaCalienteTween) {
      this.rachaCalienteTween = this.tweens.add({
        targets: this.rachaCalienteBorder, alpha: 0.85, duration: 250, yoyo: true, repeat: -1,
      });
    } else if (this.golpesConsecutivos < 8 && this.rachaCalienteTween) {
      this.apagarRachaCaliente();
    }
  }

  apagarRachaCaliente() {
    if (this.rachaCalienteTween) { this.rachaCalienteTween.stop(); this.rachaCalienteTween = null; }
    this.rachaCalienteBorder.setAlpha(0);
  }

  mostrarBadgeCombo() {
    if (this.comboPanel) this.comboPanel.destroy();

    const n = this.golpesConsecutivos;
    let colorStr, colorHex, emoji, label;
    if      (n >= 12) { colorStr = '#00ffff'; colorHex = 0x00ffff; emoji = '👑'; label = 'LEGENDARY'; }
    else if (n >= 8)  { colorStr = '#ff00ff'; colorHex = 0xff00ff; emoji = '💥'; label = 'ULTRA COMBO'; }
    else if (n >= 5)  { colorStr = '#ff4400'; colorHex = 0xff4400; emoji = '⚡'; label = 'MEGA COMBO'; }
    else              { colorStr = '#FFD700'; colorHex = 0xFFD700; emoji = '🔥'; label = 'COMBO'; }

    // Solo texto flotante — SIN caja que tape la cancha
    const texto = `${emoji} x${this.comboMultiplier} ${label}!`;
    const t = this.add.text(GAME_WIDTH / 2, 365, texto, {
      fontSize: n >= 5 ? '26px' : '22px', color: colorStr, fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20).setScale(0.5).setAlpha(0);

    this.comboPanel = t;
    this.tweens.add({ targets: t, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: t, alpha: 0, y: 320, duration: 300, delay: 1100,
      onComplete: () => { if (this.comboPanel === t) this.comboPanel = null; t.destroy(); },
    });
  }

  // ─── PARTÍCULAS ───────────────────────────────────────────────────────────

  emitirExplosionMecha(x, y) {
    // Fogonazo central
    const flash = this.add.circle(x, y, 30, 0xfff4cc, 0.95).setDepth(21);
    this.tweens.add({ targets: flash, scaleX: 2.4, scaleY: 2.4, alpha: 0, duration: 220, ease: 'Power2.easeOut', onComplete: () => flash.destroy() });

    // Chispas de pólvora
    const sparks = this.add.particles(x, y, 'chispa', {
      speed: { min: 120, max: 380 }, angle: { min: 0, max: 360 },
      scale: { start: 1.6, end: 0 }, lifespan: 650, quantity: 32,
      tint: [0xffee88, 0xffcc44, 0xff8800, 0xffffff],
      rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(20);
    sparks.explode(32);
    this.time.delayedCall(800, () => sparks.destroy());

    // Humo gris que sube (pólvora quemada)
    const smoke = this.add.particles(x, y, 'particula', {
      speedY: { min: -90, max: -30 }, speedX: { min: -25, max: 25 },
      scale: { start: 1.4, end: 2.8 }, alpha: { start: 0.35, end: 0 },
      lifespan: 1100, quantity: 10,
      tint: [0x888888, 0xaaaaaa, 0x666666], emitting: false,
    }).setDepth(19);
    smoke.explode(10);
    this.time.delayedCall(1300, () => smoke.destroy());
  }

  emitirTierra(x, y) {
    // Polvo de arcilla al impactar la diana
    if (!this.textures.exists('tierra')) return;
    const e = this.add.particles(x, y, 'tierra', {
      speed: { min: 40, max: 140 }, angle: { min: 150, max: 210 },
      scale: { start: 1.2, end: 0 }, lifespan: 500, quantity: 12,
      tint: [0x8A5228, 0xC4832A, 0xA06030], emitting: false,
    }).setDepth(18);
    e.explode(12);
    this.time.delayedCall(600, () => e.destroy());
  }

  emitirParticulas(x, y, tipo) {
    const cols = tipo === 'buena'
      ? [0xe94560, 0xff8800, 0xFFD700, 0xff4488]
      : [0x4488ff, 0x00ccff, 0x8844ff];
    const e = this.add.particles(x, y, 'particula', {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 }, lifespan: 600, quantity: 22,
      tint: cols, emitting: false,
    }).setDepth(20);
    e.explode(22);
    this.time.delayedCall(800, () => e.destroy());
  }

  emitirParticulasEspeciales(x, y, tipo) {
    const configs = {
      fuego: { tint: [0xff0000, 0xff4400, 0xff8800, 0xFFD700], count: 30, speed: { min: 100, max: 320 } },
      hielo: { tint: [0x00ccff, 0x88ddff, 0xaaeeff, 0xffffff], count: 25, speed: { min: 80,  max: 240 } },
    };
    const cfg = configs[tipo];
    const e = this.add.particles(x, y, tipo === 'fuego' ? 'chispa' : 'particula', {
      speed: cfg.speed, angle: { min: 0, max: 360 },
      scale: { start: 1.8, end: 0 }, lifespan: tipo === 'fuego' ? 800 : 700,
      quantity: cfg.count, tint: cfg.tint, emitting: false, rotate: { min: 0, max: 360 },
    }).setDepth(20);
    e.explode(cfg.count);
    this.time.delayedCall(1000, () => e.destroy());
  }

  emitirParticulasExplosivas(x, y) {
    const e1 = this.add.particles(x, y, 'chispa', {
      speed: { min: 180, max: 460 }, angle: { min: 0, max: 360 },
      scale: { start: 2.2, end: 0 }, lifespan: 900, quantity: 45,
      tint: [0xffee00, 0xff8800, 0xff4400, 0xffffff],
      rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(22);
    e1.explode(45);

    this.time.delayedCall(120, () => {
      const e2 = this.add.particles(x, y, 'particula', {
        speed: { min: 60, max: 180 }, angle: { min: 0, max: 360 },
        scale: { start: 2, end: 0 }, lifespan: 700, quantity: 25,
        tint: [0xffffff, 0xffeecc, 0xffdd88], emitting: false,
      }).setDepth(22);
      e2.explode(25);
      this.time.delayedCall(800, () => e2.destroy());
    });

    const flash = this.add.circle(x, y, 80, 0xffffff, 0.7).setDepth(21);
    this.tweens.add({ targets: flash, scaleX: 3, scaleY: 3, alpha: 0, duration: 350, onComplete: () => flash.destroy() });

    this.time.delayedCall(1100, () => e1.destroy());
  }

  mostrarPuntosFlotantes(x, y, texto, color = '#00ff88') {
    const t = this.add.text(x, y - 20, texto, {
      fontSize: '36px', color, fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 6, fill: true },
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: t, y: y - 120, alpha: 0, scaleX: 1.3, scaleY: 1.3,
      duration: 1100, ease: 'Power2.easeOut', onComplete: () => t.destroy(),
    });
  }

  mostrarCasi(x, y) {
    const t = this.add.text(x, y - 60, '¡Casi!', {
      fontSize: '30px', color: '#ff9900', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);
    this.textoCasi = t;
    this.tweens.add({
      targets: t, y: y - 140, alpha: 0, duration: 1100, ease: 'Power2.easeOut',
      onComplete: () => { t.destroy(); if (this.textoCasi === t) this.textoCasi = null; },
    });
  }

  limpiarCasi() {
    if (this.textoCasi) { this.tweens.killTweensOf(this.textoCasi); this.textoCasi.destroy(); this.textoCasi = null; }
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

    const jp = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'chispa', {
      speed: { min: 180, max: 500 }, angle: { min: 0, max: 360 },
      scale: { start: 1.8, end: 0 }, lifespan: 1200,
      tint: [0xFFD700, 0xff8800, 0xff4400, 0xffffff, 0xff44cc],
      rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(22);
    jp.explode(80);
    this.time.delayedCall(1400, () => jp.destroy());

    const bgPanel = this.add.graphics().setDepth(21).setAlpha(0);
    bgPanel.fillStyle(0x000000, 0.88);
    bgPanel.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const textoWin = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45, '🎰 JACKPOT! 🎰', {
      fontSize: '46px', color: '#FFD700', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#ff8800', blur: 15, fill: true },
    }).setOrigin(0.5).setDepth(23).setAlpha(0).setScale(0.4);

    const textoBonus = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45, '+1000 puntos bonus! 🎁', {
      fontSize: '28px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(23).setAlpha(0);

    this.tweens.add({
      targets: [bgPanel, textoWin, textoBonus], alpha: 1, scaleX: 1, scaleY: 1,
      duration: 400, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [textoWin, textoBonus], scaleX: 1.15, scaleY: 1.15, duration: 380, yoyo: true, repeat: 3,
          onComplete: () => {
            bgPanel.destroy(); textoWin.destroy(); textoBonus.destroy();
            this.puntos += 1000;
            this.puntosJackpot = 0;
            this.actualizarBarraJackpot();
            this.textoPuntos.setText((this.registry.get('nombreJugador') || 'Jugador') + ': ' + this.puntos);
            if (this.musica) this.musica.setRate(1.0);
            this.resetearTejo(); // sin esto el tejo queda varado tras el jackpot
            this.scene.pause();
            this.scene.launch('SlotScene');
          },
        });
      },
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
    const { cancha } = TENANT_CONFIG;

    // Viento durante el deslizamiento (en el aire lo maneja el vuelo
    // cinemático; el tejo de hielo es inmune siempre)
    if (this.lanzado && !this.enVuelo && this.vientoFuerza > 0 && this.tejo.body && this.tejoEspecial !== 'hielo') {
      this.tejo.applyForce({ x: this.vientoFuerza * this.vientoDireccion, y: 0 });
    }

    // La gallina cruza la cancha de lado a lado 🐔
    if (this.obstaculoObj && NIVELES[this.nivelActual]?.obstaculo) {
      const gy  = this.obstaculoObj.y;
      const tG  = (gy - cancha.topY) / (cancha.botY - cancha.topY);
      const hwG = cancha.topHW + (cancha.botHW - cancha.topHW) * tG - 26;
      const cxG = GAME_WIDTH / 2;
      if (this.obstaculoObj.x > cxG + hwG) this.obstaculoDireccion = -1;
      if (this.obstaculoObj.x < cxG - hwG) this.obstaculoDireccion =  1;
      this.obstaculoObj.x += (1.6 + this.ciclo * 0.5) * this.obstaculoDireccion;
      this.obstaculoObj.setFlipX(this.obstaculoDireccion < 0);
      // Caminadito
      this.obstaculoObj.setAngle(Math.sin(this.time.now / 90) * 4);
      this.matter.body.setPosition(this.obstaculoObj.body, { x: this.obstaculoObj.x, y: this.obstaculoObj.y });
      if (this.gallinaCooldown > 0) this.gallinaCooldown--;
    }

    // Aura especial sigue al disco visual
    if (this.tejoEspecial) {
      this.auraEspecial.setPosition(this.tejoVis.x, this.tejoVis.y);
    }

    // ── VUELO CINEMÁTICO 3D ───────────────────────────────────────────
    // El disco viaja por una trayectoria PROYECTADA: avanza rápido cerca
    // de la cámara y frena al alejarse (como en 3D real). Al aterrizar,
    // Matter retoma el control para el deslizamiento sobre la greda.
    if (this.lanzado && this.enVuelo && this.vuelo) {
      const v  = this.vuelo;
      const t  = Math.min(1, (this.time.now - v.t0) / v.dur);
      const zE = 1 - Math.pow(1 - t, 1.55); // proyección de profundidad

      // Deriva + viento como empuje lateral acumulativo (hielo inmune)
      if (this.tejoEspecial !== 'hielo') {
        this.derivaVel += this.derivaAccel + this.vientoFuerza * 18 * this.vientoDireccion;
        this.derivaOff += this.derivaVel;
      }

      const gx = Phaser.Math.Linear(v.x0, v.xLand, zE) + this.derivaOff;
      const gy = Phaser.Math.Linear(v.y0, v.yLand, zE);
      this.matter.body.setPosition(this.tejo.body, { x: gx, y: gy });
      this.matter.body.setVelocity(this.tejo.body, { x: 0, y: 0 });

      const perspAqui = 0.38 + 0.62 * Math.max(0, Math.min(1, (gy - cancha.topY) / (cancha.botY - cancha.topY)));
      // La altura aparente TAMBIÉN se comprime con la distancia
      this.alturaActual = v.hMax * 4 * t * (1 - t) * (0.45 + 0.55 * perspAqui);

      // La gallina ataja el tejo si viene BAJANDO sobre ella (tramo
      // final de la parábola, ya a menos de 30px de altura aparente)
      if (this.obstaculoObj && this.gallinaCooldown <= 0 && t > 0.55 && this.alturaActual < 30) {
        const dG = Phaser.Math.Distance.Between(gx, gy, this.obstaculoObj.x, this.obstaculoObj.y);
        if (dG < 36 * this.obstaculoObj.scaleX) {
          this.enVuelo = false;
          this.alturaActual = 0;
          this.tejo.setSensor(false);
          this.tejo.setFrictionAir(0.055);
          this.gallinazo();
          return;
        }
      }

      // Aterrizaje → Matter retoma con un deslizamiento corto hacia adelante
      if (t >= 1) {
        this.enVuelo = false;
        this.alturaActual = 0;
        this.tejo.setSensor(false);
        this.tejo.setFrictionAir(0.055);
        const dLen  = Math.hypot(v.xLand - v.x0, v.yLand - v.y0) || 1;
        const slide = 3 + v.eff * 6;
        this.tejo.setVelocity(
          ((v.xLand - v.x0) / dLen) * slide + this.derivaVel * 1.2,
          ((v.yLand - v.y0) / dLen) * slide,
        );
        this.aterrizajeTejo(perspAqui);
      }
    }

    if (this.lanzado && this.tejo.body) {

      // Escala de perspectiva — el disco SOLO encoge con la distancia.
      // Esa reducción constante es la señal 3D más importante.
      const tPersp = (this.tejo.y - cancha.topY) / (cancha.botY - cancha.topY);
      const tScale = 0.38 + 0.62 * Math.max(0, Math.min(1, tPersp));
      this.tejo.setScale(tScale);

      const altura = this.enVuelo ? this.alturaActual : 0;

      this.tejoVis.setPosition(this.tejo.x, this.tejo.y - altura);
      this.tejoVis.setScale(tScale);

      // Giro del disco — rápido en el aire, frenando al deslizar
      const vBody = this.tejo.body.velocity;
      this.tejoVis.setAngle(this.tejoVis.angle + (this.enVuelo ? 9 : vBody.x * 0.6 + vBody.y * 0.4));

      // Sombra pegada al suelo, separada del disco según la altura
      this.tejoSombra.setPosition(this.tejo.x, this.tejo.y + 5 * tScale);
      const hRef  = this.vuelo ? this.vuelo.hMax : 1;
      const hFrac = Math.min(1, altura / hRef);
      this.tejoSombra.setScale(tScale * (1 - hFrac * 0.35));
      this.tejoSombra.setAlpha(0.38 - hFrac * 0.22);

      // Polvo al deslizarse sobre la greda
      if (!this.enVuelo && this.tejo.body.speed > 1.2 && Math.random() < 0.45) {
        const p = this.add.circle(
          this.tejo.x + Phaser.Math.Between(-6, 6),
          this.tejo.y + 8 * tScale,
          Phaser.Math.FloatBetween(1.5, 3.5), 0xC4832A, 0.5,
        ).setDepth(5);
        this.tweens.add({ targets: p, y: p.y - 10, alpha: 0, duration: 350, onComplete: () => p.destroy() });
      }

      // ¡La gallina patea el tejo! (solo en el suelo, con cooldown)
      if (!this.enVuelo && !this.yaGolpeo && this.obstaculoObj && this.gallinaCooldown <= 0) {
        const dG = Phaser.Math.Distance.Between(this.tejo.x, this.tejo.y, this.obstaculoObj.x, this.obstaculoObj.y);
        if (dG < 30 * this.obstaculoObj.scaleX + 12 * tScale) {
          this.gallinazo();
        }
      }

      // Golpe por contacto en el SUELO: aterrizó sobre la diana o
      // deslizó hasta ella (en el aire pasa por encima, como el tejo real)
      if (!this.enVuelo && !this.yaGolpeo) {
        for (const d of this.dianas) {
          const rHit = Math.max(28, 38 * d.imagen.scaleX + 16 * tScale);
          if (Phaser.Math.Distance.Between(this.tejo.x, this.tejo.y, d.imagen.x, d.imagen.y) < rHit) {
            this.golpearDiana(d.tipo, { x: d.imagen.x, y: d.imagen.y });
            break;
          }
        }
      }

      // ── Trail (sigue al disco visual) ───────────────────────────────
      this.trail.push({ x: this.tejo.x, y: this.tejo.y - altura });
      if (this.trail.length > 12) this.trail.shift();

      this.trailGraphics.clear();
      const trailPaletas = {
        fuego:     [0xff0000, 0xff4400, 0xff8800, 0xFFD700, 0xff8800, 0xff4400],
        hielo:     [0x00aaff, 0x00ccff, 0x88ddff, 0xffffff, 0xccf0ff],
        explosivo: [0xffee00, 0xff8800, 0xffffff, 0xffcc00, 0xff8800],
      };
      const paleta    = trailPaletas[this.tejoEspecial];
      const baseColor = this.registry.get('colorTejo') ?? 0x999999;

      this.trail.forEach((pos, i) => {
        const t     = i / this.trail.length;
        const alpha = t * (this.tejoEspecial ? 0.65 : 0.45);
        const radio = 5 + t * (this.tejoEspecial ? 16 : 12);
        const color = paleta ? paleta[i % paleta.length] : baseColor;
        this.trailGraphics.fillStyle(color, alpha);
        this.trailGraphics.fillCircle(pos.x, pos.y, radio * tScale);
      });

      // Chispa ocasional para fuego/explosivo
      if ((this.tejoEspecial === 'fuego' || this.tejoEspecial === 'explosivo') && Math.random() < 0.3 && this.tejo.body.speed > 3) {
        const spark = this.add.circle(
          this.tejoVis.x + Phaser.Math.Between(-8, 8),
          this.tejoVis.y + Phaser.Math.Between(-8, 8),
          Phaser.Math.FloatBetween(2, 5),
          this.tejoEspecial === 'fuego' ? 0xff8800 : 0xffee00, 0.8,
        ).setDepth(7);
        this.tweens.add({ targets: spark, scaleX: 0, scaleY: 0, alpha: 0, duration: Phaser.Math.Between(150, 300), onComplete: () => spark.destroy() });
      }

      // Near-miss
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

    // ── Fuera de la cancha: tiro perdido ──────────────────────────
    // El trapecio se estrecha hacia el fondo — calculamos el semi-ancho
    // de la cancha a la altura actual del tejo
    if (this.lanzado && !this.yaGolpeo && this.tejo.body) {
      const cxC = GAME_WIDTH / 2;
      const tC  = (this.tejo.y - cancha.topY) / (cancha.botY - cancha.topY);
      const hwC = cancha.topHW + (cancha.botHW - cancha.topHW) * Math.max(0, Math.min(1, tC));
      const seSalioLado  = Math.abs(this.tejo.x - cxC) > hwC + 14;
      const pegoParedFondo = this.tejo.y < cancha.topY - 18;
      if (seSalioLado || pegoParedFondo) {
        this.tejoFuera();
        return;
      }
    }

    // Reset si toca el suelo
    if (this.lanzado && this.tejo.y > GAME_HEIGHT - 50) this.resetearTejo();

    // Reset si queda quieto mucho tiempo (solo aplica ya aterrizado)
    if (this.lanzado && !this.enVuelo && !this.yaGolpeo && this.tejo.body) {
      if (this.tejo.body.speed < 0.3) {
        if (!this.timerQuieto) {
          this.timerQuieto = this.time.delayedCall(1500, () => { this.timerQuieto = null; this.resetearTejo(); });
        }
      } else {
        if (this.timerQuieto) { this.timerQuieto.remove(); this.timerQuieto = null; }
      }
    }
  }

  gallinazo() {
    // La gallina se asusta y patea el tejo lejos — tiro arruinado
    this.gallinaCooldown = 45;

    const ang = Phaser.Math.Angle.Between(
      this.obstaculoObj.x, this.obstaculoObj.y, this.tejo.x, this.tejo.y,
    );
    this.tejo.setVelocity(Math.cos(ang) * 7, Math.sin(ang) * 5 + 2);

    // Explosión de plumas
    const e = this.add.particles(this.obstaculoObj.x, this.obstaculoObj.y - 10, 'particula', {
      speed: { min: 60, max: 200 }, angle: { min: 0, max: 360 },
      scale: { start: 1.1, end: 0 }, lifespan: 600, quantity: 16,
      tint: [0xF2E8D8, 0xD8C8B0, 0xffffff], emitting: false,
    }).setDepth(20);
    e.explode(16);
    this.time.delayedCall(700, () => e.destroy());

    // Brinco del susto
    const gObj = this.obstaculoObj;
    this.tweens.add({
      targets: gObj, y: gObj.y - 16,
      duration: 130, yoyo: true, ease: 'Power2.easeOut',
      onComplete: () => {
        if (this.obstaculoObj === gObj && gObj.body) {
          this.matter.body.setPosition(gObj.body, { x: gObj.x, y: gObj.y });
        }
      },
    });

    const t = this.add.text(this.obstaculoObj.x, this.obstaculoObj.y - 44, '¡La gallina! 🐔', {
      fontSize: '24px', color: '#ffaa44', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: t.y - 60, alpha: 0, duration: 1000, onComplete: () => t.destroy() });

    this.cameras.main.shake(120, 0.005);
    this.sonidoGallina();
  }

  sonidoGallina() {
    // Cacareo: ráfaga de cluck-cluck-cluck-cluuuck
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    [0, 0.09, 0.18, 0.30].forEach((d, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      const f = i === 3 ? 380 : 700 - i * 60;
      osc.frequency.setValueAtTime(f, ctx.currentTime + d);
      osc.frequency.exponentialRampToValueAtTime(f * 0.6, ctx.currentTime + d + 0.07);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + d);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + (i === 3 ? 0.16 : 0.08));
      osc.start(ctx.currentTime + d); osc.stop(ctx.currentTime + d + 0.18);
    });
  }

  aterrizajeTejo(tScale = 1) {
    // El disco cae sobre la greda: explosión de polvo + mini shake + thud
    const e = this.add.particles(this.tejo.x, this.tejo.y + 6 * tScale, 'tierra', {
      speed: { min: 30, max: 130 }, angle: { min: 200, max: 340 },
      scale: { start: 1.1 * tScale, end: 0 }, lifespan: 450, quantity: 14,
      tint: [0x8A5228, 0xC4832A, 0xA06030], emitting: false,
    }).setDepth(17);
    e.explode(14);
    this.time.delayedCall(550, () => e.destroy());

    this.cameras.main.shake(90, 0.004);
    this.sonidoAterrizaje();
  }

  sonidoAterrizaje() {
    // Golpe sordo del disco contra la greda
    const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.32, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.14);
  }

  tejoFuera() {
    this.yaGolpeo = true; // evita doble trigger
    this.limpiarCasi();

    // Polvo donde se salió
    const e = this.add.particles(this.tejo.x, this.tejo.y, 'tierra', {
      speed: { min: 30, max: 110 }, angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 }, lifespan: 450, quantity: 10,
      tint: [0x8A5228, 0xC4832A], emitting: false,
    }).setDepth(18);
    e.explode(10);
    this.time.delayedCall(550, () => e.destroy());

    // Texto de tiro perdido
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '¡FUERA! 😬', {
      fontSize: '40px', color: '#ff7744', fontFamily: FONT, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(25).setScale(0.5).setAlpha(0);
    this.tweens.add({
      targets: t, alpha: 1, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({
        targets: t, alpha: 0, y: t.y - 50, duration: 600, delay: 350,
        onComplete: () => t.destroy(),
      }),
    });

    // Pierde el combo — esa es la dificultad de salirse
    this.golpesConsecutivos = 0;
    this.comboMultiplier = 1;
    if (this.comboPanel) { this.comboPanel.destroy(); this.comboPanel = null; }
    this.apagarRachaCaliente();

    this.cameras.main.shake(150, 0.006);
    this.time.delayedCall(350, () => this.resetearTejo());
  }

  resetearTejo() {
    this.timerQuieto = null;
    this.lanzado    = false;
    this.yaGolpeo   = false;
    this.limpiarCasi();
    this.tejo.setStatic(true);
    this.tejo.setVelocity(0, 0);
    this.matter.body.setVelocity(this.tejo.body, { x: 0, y: 0 });
    this.tejo.setAngularVelocity(0);
    this.tejo.setAngle(0);
    this.tejo.setScale(1); // restaurar escala de perspectiva
    this.matter.body.setPosition(this.tejo.body, { x: this.tejoX, y: this.tejoY });
    this.tejo.setPosition(this.tejoX, this.tejoY);

    // Restaurar estado de vuelo, disco visual y sombra
    this.enVuelo = false;
    this.vuelo = null;
    this.alturaActual = 0;
    this.derivaVel = 0;
    this.derivaOff = 0;
    this.tejo.setSensor(false);
    this.tejo.setFrictionAir(PHYSICS.frictionAir);
    this.tejoVis.setPosition(this.tejoX, this.tejoY);
    this.tejoVis.setScale(1);
    this.tejoVis.setAngle(0);
    this.tejoSombra.setPosition(this.tejoX, this.tejoY + 6);
    this.tejoSombra.setScale(1);
    this.tejoSombra.setAlpha(0.35);

    this.textoInstruccion.setVisible(true);
    this.tejoAura.setPosition(this.tejoX, this.tejoY);
    this.tejoAura.setVisible(true);

    this.trail = [];
    this.trailGraphics.clear();
    this.aimGraphics.clear();

    if (this.tejoEspecial && this.lanzamientosEspeciales > 0) {
      this.lanzamientosEspeciales--;
      this.actualizarPowerDots();
      if (this.lanzamientosEspeciales === 0) this.desactivarTejoEspecial();
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
    osc.frequency.setValueAtTime(380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18);
  }

  sonidoFuego() {
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
    // Sonido sordo de disco de metal en arcilla
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
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
