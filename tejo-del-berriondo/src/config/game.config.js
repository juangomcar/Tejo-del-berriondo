// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL RESTAURANTE — cambia esto para adaptar el juego
// ═══════════════════════════════════════════════════════════════════
export const RESTAURANTE = {
  nombre: 'Restaurante de Julián',
  tagline: 'Juega, come y gana',
  nombreJuego: 'Tejo del Berriondo',
};

// ═══════════════════════════════════════════════════════════════════
// TENANT CONFIG — objeto único por tenant para polimorfismo completo
// Para un tenant nuevo: copia este bloque, cambia los valores y
// pásalo al juego. Sin tocar el código base.
// ═══════════════════════════════════════════════════════════════════
export const TENANT_CONFIG = {
  id: 'la-tierrita',

  restaurante: {
    nombre:      'La Tierrita del Berriondo',
    tagline:     'Juega, come y gana',
    nombreJuego: 'Tejo del Berriondo',
  },

  fuente: "'Baloo 2', Arial, sans-serif",

  colores: {
    // Cancha
    pisoOscuro:  0x4A2810,   // clay base
    pisoMedio:   0x6B3D1A,   // clay mid
    pisoClaro:   0x8A5228,   // clay highlight (far end)
    paredes:     0x2E1608,   // side boards / walls
    bocin:       0xFFD700,   // target circle
    canaleta:    0x3D2208,   // edge trim
    // Gameplay
    dianabuena:  0xe94560,
    dianatrampa: 0x4488ff,
    // UI
    primario:    0xFFD700,
    tejo:        0x888888,
  },

  // Geometría de la cancha — define la perspectiva 3-D
  // topY/botY: límites verticales del área jugable
  // topHW/botHW: semi-ancho de la cancha en ese extremo
  cancha: {
    topY:  150,   // deja banda visible (100-150) para el rancho bajo el HUD
    botY:  782,   // GAME_HEIGHT - 72
    topHW: 72,
    botHW: 220,
  },

  personajes: [
    { key: 'campesino', nombre: 'El Campesino', colorTejo: 0x999999, emoji: '👨‍🌾', desc: 'Veterano del tejo' },
    { key: 'abuela',    nombre: 'La Abuela',    colorTejo: 0x9b59b6, emoji: '👵',    desc: 'Tiro certero' },
    { key: 'minero',    nombre: 'El Minero',    colorTejo: 0x1a1a1a, emoji: '⛏️',   desc: 'Fuerza bruta' },
  ],

  textos: {
    instruccionLanzar: 'Desliza ↑ hacia la diana para lanzar',
    npcNombre: 'Burrito',
    tutorialMensajes: [
      '¡Bienvenid@ al Tejo del Berriondo!\nYo soy Burrito, tu guía.\n¿Cómo te llamas?',
      'Bienvenid@ {nombre},\nDesliza el dedo hacia arriba\npara lanzar el tejo.\nEl ángulo controla la dirección.',
      '¡Pégale a la MECHA ROSADA\npara que explote! 💥\nLa mecha azul está mojada\ny te quita puntos. 🔵',
      'Acumula aciertos seguidos\npara subir de nivel.\nCada nivel es más difícil.',
      'Si tienes suerte, el JACKPOT\nexplota y puedes ganar\npremios del restaurante. 🎰',
      '¡Listo! Ya sabes todo.\n¡A lanzar ese tejo\nberriondo!',
    ],
  },
};

// Helper de perspectiva — escala un objeto según su posición Y en la cancha
// 1.0 en la base del jugador → 0.35 al fondo (diana)
export function perspectiveScale(y, cancha) {
  const c = cancha || TENANT_CONFIG.cancha;
  const t = (y - c.topY) / (c.botY - c.topY);
  return 0.35 + 0.65 * Math.max(0, Math.min(1, t));
}

// Dimensiones base — móvil vertical
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

// Física del tejo
export const PHYSICS = {
  friction: 0.01,
  restitution: 0.4,
  frictionAir: 0.01
};

// Paleta de colores
export const COLORS = {
  background: 0x080818,
  bgTop: 0x050512,
  bgBottom: 0x0d1525,
  tejo: 0x999999,
  dianabuena: 0xe94560,
  dianatrampa: 0x4488ff,
  obstaculo: 0x445566,
  gold: 0xFFD700,
  hudBg: 0x000000,
};

// Fuente del juego — se carga desde Google Fonts en index.html
export const FONT = "'Baloo 2', Arial, sans-serif";

// Puntos necesarios para el jackpot
export const PUNTOS_JACKPOT = 3000;

// Total de niveles por ciclo — incrementar aquí si se añaden más
export const TOTAL_NIVELES = 9;

// Configuración de cada nivel.
// Los niveles se agrupan en ciclos de TOTAL_NIVELES. Al completar el último
// nivel, el juego vuelve al nivel 1 pero con this.ciclo++ (más viento).
//
// Progresión de dificultad:
//   Niveles 1-3 → 1 diana buena (aprendizaje)
//   Niveles 4-6 → 2 dianas buenas (velocidad)
//   Niveles 7-9 → 3 dianas buenas (maestría)
// NOTA: la cancha es un trapecio en perspectiva. Ancho jugable según y:
//   y=160 → x 166..314 · y=200 → x 156..324 · y=250 → x 145..335 · y=320 → x 128..352
// Toda diana debe caer dentro de esos límites o el tejo no podrá alcanzarla.
export const NIVELES = {
  // ── Ciclo base: una diana buena ─────────────────────────────────
  1: {
    aciertosParaSiguiente: 2,
    dianas: [{ x: GAME_WIDTH / 2, y: 200, tipo: 'buena' }],
    viento: false,
    obstaculo: false
  },
  2: {
    aciertosParaSiguiente: 3,
    dianas: [
      { x: 185, y: 180, tipo: 'buena' },
      { x: 295, y: 250, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0003,
    obstaculo: false
  },
  3: {
    aciertosParaSiguiente: 3,
    dianas: [
      { x: 190, y: 180, tipo: 'buena' },
      { x: 290, y: 245, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0005,
    obstaculo: true
  },

  // ── Dos dianas buenas: el jugador elige su objetivo ─────────────
  4: {
    aciertosParaSiguiente: 4,
    dianas: [
      { x: 175, y: 185, tipo: 'buena' },
      { x: 305, y: 195, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 300, tipo: 'trampa' }
    ],
    viento: false,
    obstaculo: false
  },
  5: {
    aciertosParaSiguiente: 4,
    dianas: [
      { x: 185, y: 175, tipo: 'buena' },
      { x: 300, y: 240, tipo: 'buena' },
      { x: 185, y: 320, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0004,
    obstaculo: true
  },
  6: {
    aciertosParaSiguiente: 4,
    dianas: [
      { x: 175, y: 180, tipo: 'buena' },
      { x: 305, y: 190, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 168, tipo: 'trampa' },
      { x: GAME_WIDTH / 2, y: 310, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0005,
    obstaculo: true
  },

  // ── Tres dianas buenas: tablero lleno, máxima tensión ───────────
  7: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: 172, y: 178, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 162, tipo: 'buena' },
      { x: 308, y: 185, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 305, tipo: 'trampa' }
    ],
    viento: false,
    obstaculo: true
  },
  8: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: 176, y: 168, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 195, tipo: 'buena' },
      { x: 304, y: 168, tipo: 'buena' },
      { x: 190, y: 300, tipo: 'trampa' },
      { x: 290, y: 300, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0006,
    obstaculo: true
  },
  9: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: 180, y: 168, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 195, tipo: 'buena' },
      { x: 300, y: 168, tipo: 'buena' },
      { x: 192, y: 312, tipo: 'trampa' },
      { x: 288, y: 312, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0008,
    obstaculo: true
  }
};

// Premios de la slot machine
export const PREMIOS_SLOT = [
  {
    simbolos: ['🍟', '🍟', '🍟'],
    texto: '¡50% en tus próximas papas! 🍟',
    descripcion: 'Muéstrale esto al mesero',
    color: '#FFD700',
    probabilidad: 0.30
  },
  {
    simbolos: ['🍲', '🍲', '🍲'],
    texto: '¡20% en la Sopa del Día! 🍲',
    descripcion: 'Muéstrale esto al mesero',
    color: '#00ccff',
    probabilidad: 0.25
  },
  {
    simbolos: ['🍰', '🍰', '🍰'],
    texto: '¡10% en el Postre de la Casa! 🍰',
    descripcion: 'Muéstrale esto al mesero',
    color: '#ff88cc',
    probabilidad: 0.20
  },
  {
    simbolos: ['🍔', '🍔', '🍔'],
    texto: '¡2x1 en Hamburguesa! 🍔',
    descripcion: 'Muéstrale esto al mesero',
    color: '#ff8800',
    probabilidad: 0.15
  },
  {
    simbolos: ['🥤', '🥤', '🥤'],
    texto: '¡Bebida gratis con tu almuerzo! 🥤',
    descripcion: 'Muéstrale esto al mesero',
    color: '#00ff88',
    probabilidad: 0.099
  },
  {
    simbolos: ['👑', '👑', '👑'],
    texto: '¡Almuerzo completamente GRATIS! 👑',
    descripcion: 'Muéstrale esto al mesero — ¡lo lograste!',
    color: '#ff4444',
    probabilidad: 0.00003
  }
];

// Símbolos que aparecen girando en la slot
export const SIMBOLOS_POOL = ['🍟', '🥤', '🍔', '⭐', '🌶️', '🧀', '🥗', '🍰', '👑', '🫙'];

// Ofertas que aparecen cada 3000 puntos
export const OFERTAS = [
  {
    id: 'fuego',
    producto: '🍟 Papas fritas',
    descuento: '50% de descuento',
    descripcion: 'Pide las papas con 50% off y te damos...',
    recompensa: '🔥 Tejo de Fuego',
    detalleRecompensa: 'Más velocidad y deja rastro de fuego',
    color: '#ff4400',
    colorBoton: 0xff4400
  },
  {
    id: 'hielo',
    producto: '🥤 Jugo natural',
    descuento: '20% de descuento',
    descripcion: 'Pide un jugo con 20% off y te damos...',
    recompensa: '❄️ Tejo de Hielo',
    detalleRecompensa: 'Más pesado, el viento no lo afecta',
    color: '#00ccff',
    colorBoton: 0x0088cc
  },
  {
    id: 'explosivo',
    producto: '🍔 Hamburguesa',
    descuento: '2x1',
    descripcion: 'Pide una hamburguesa 2x1 y te damos...',
    recompensa: '💥 Tejo Explosivo',
    detalleRecompensa: 'Doble puntos al impactar la diana',
    color: '#ffaa00',
    colorBoton: 0xcc7700
  }
];

// Puntos para activar una oferta
export const PUNTOS_OFERTA = 9000;
