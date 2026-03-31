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
    aciertosParaSiguiente: 3,
    dianas: [{ x: GAME_WIDTH / 2, y: 200, tipo: 'buena' }],
    viento: false,
    obstaculo: false
  },
  2: {
    aciertosParaSiguiente: 5,
    dianas: [
      { x: GAME_WIDTH / 3, y: 180, tipo: 'buena' },
      { x: (GAME_WIDTH / 3) * 2, y: 250, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.003,
    obstaculo: false
  },
  3: {
    aciertosParaSiguiente: null,
    dianas: [
      { x: GAME_WIDTH / 3, y: 180, tipo: 'buena' },
      { x: (GAME_WIDTH / 3) * 2, y: 250, tipo: 'trampa' }
    ],
    viento: true,
    fuerzaViento: 0.004,
    obstaculo: true
  }
};

// Premios de la slot machine — de más probable a menos probable
// El restaurante los configura — por ahora son mock del Restaurante de Julián
export const PREMIOS_SLOT = [
  {
    simbolos: ['🍟', '🍟', '🍟'],
    texto: '¡50% en tus próximas papas! 🍟',
    descripcion: 'Muéstrale esto al mesero',
    color: '#FFD700',
    probabilidad: 0.30  // 30% — el más probable
  },
  {
    simbolos: ['🥤', '🥤', '🥤'],
    texto: '¡20% en la Sopa del Día! 🍲',
    descripcion: 'Muéstrale esto al mesero',
    color: '#00ccff',
    probabilidad: 0.25  // 25%
  },
  {
    simbolos: ['🍰', '🍰', '🍰'],
    texto: '¡10% en el Postre de la Casa! 🍰',
    descripcion: 'Muéstrale esto al mesero',
    color: '#ff88cc',
    probabilidad: 0.20  // 20%
  },
  {
    simbolos: ['🍔', '🍔', '🍔'],
    texto: '¡2x1 en Hamburguesa! 🍔',
    descripcion: 'Muéstrale esto al mesero',
    color: '#ff8800',
    probabilidad: 0.15  // 15%
  },
  {
    simbolos: ['⭐', '⭐', '⭐'],
    texto: '¡Bebida gratis con tu almuerzo! ⭐',
    descripcion: 'Muéstrale esto al mesero',
    color: '#00ff88',
    probabilidad: 0.07  // 7%
  },
  {
    simbolos: ['👑', '👑', '👑'],
    texto: '¡Almuerzo completamente GRATIS! 👑',
    descripcion: 'Muéstrale esto al mesero — ¡lo lograste!',
    color: '#ff4444',
    probabilidad: 0.03  // 3% — casi imposible
  }
];

// Símbolos que aparecen girando — no todos son premios
export const SIMBOLOS_POOL = ['🍟', '🥤', '🍔', '⭐', '🌶️', '🧀', '🥗', '🍰', '👑', '🫙'];