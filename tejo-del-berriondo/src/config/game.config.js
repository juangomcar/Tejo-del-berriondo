// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL RESTAURANTE — cambia esto para adaptar el juego
// ═══════════════════════════════════════════════════════════════════
export const RESTAURANTE = {
  nombre: 'Restaurante de Julián',
  tagline: 'Juega, come y gana',
  nombreJuego: 'Tejo del Berriondo',
};

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
      { x: GAME_WIDTH / 3, y: 180, tipo: 'buena' },
      { x: (GAME_WIDTH / 3) * 2, y: 255, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0003,
    obstaculo: false
  },
  3: {
    aciertosParaSiguiente: 3,
    dianas: [
      { x: GAME_WIDTH / 3, y: 180, tipo: 'buena' },
      { x: (GAME_WIDTH / 3) * 2, y: 250, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0005,
    obstaculo: true
  },

  // ── Dos dianas buenas: el jugador elige su objetivo ─────────────
  4: {
    aciertosParaSiguiente: 4,
    dianas: [
      { x: 130, y: 180, tipo: 'buena' },
      { x: 350, y: 200, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 310, tipo: 'trampa' }
    ],
    viento: false,
    obstaculo: false
  },
  5: {
    aciertosParaSiguiente: 4,
    dianas: [
      { x: 160, y: 170, tipo: 'buena' },
      { x: 320, y: 235, tipo: 'buena' },
      { x: 160, y: 320, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0004,
    obstaculo: false
  },
  6: {
    aciertosParaSiguiente: 4,
    dianas: [
      { x: 130, y: 175, tipo: 'buena' },
      { x: 350, y: 190, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 175, tipo: 'trampa' },
      { x: GAME_WIDTH / 2, y: 320, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0005,
    obstaculo: true
  },

  // ── Tres dianas buenas: tablero lleno, máxima tensión ───────────
  7: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: 100, y: 180, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 160, tipo: 'buena' },
      { x: 380, y: 195, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 315, tipo: 'trampa' }
    ],
    viento: false,
    obstaculo: false
  },
  8: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: 110, y: 165, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 190, tipo: 'buena' },
      { x: 370, y: 165, tipo: 'buena' },
      { x: 175, y: 310, tipo: 'trampa' },
      { x: 305, y: 310, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.0006,
    obstaculo: false
  },
  9: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: 120, y: 165, tipo: 'buena' },
      { x: GAME_WIDTH / 2, y: 190, tipo: 'buena' },
      { x: 360, y: 165, tipo: 'buena' },
      { x: 180, y: 315, tipo: 'trampa' },
      { x: 300, y: 315, tipo: 'trampa' }
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
