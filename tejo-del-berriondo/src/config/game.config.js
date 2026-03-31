// Dimensiones base — móvil vertical
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

// Física del tejo
export const PHYSICS = {
  friction: 0.01,
  restitution: 0.4,
  frictionAir: 0.01
};

// Colores del juego
export const COLORS = {
  background: 0x1a1a2e,
  tejo: 0x999999,
  dianabuena: 0xe94560,
  dianatrampa: 0x4488ff,
  obstaculo: 0x666666
};

// Puntos necesarios para el jackpot
export const PUNTOS_JACKPOT = 3000;

// Configuración de cada nivel
export const NIVELES = {
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
      { x: (GAME_WIDTH / 3) * 2, y: 250, tipo: 'trampa' }
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
export const PUNTOS_OFERTA = 3000;