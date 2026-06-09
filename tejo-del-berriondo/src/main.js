import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import GameScene from './scenes/GameScene.js';
import SlotScene from './scenes/SlotScene.js';
import OfertaScene from './scenes/OfertaScene.js';
import PersonajeScene from './scenes/PersonajeScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/game.config.js';

function crearJuego() {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#050512',
    dom: {
      createContainer: true
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { y: 2 },
        debug: false
      }
    },
    scene: [MenuScene, TutorialScene, PersonajeScene, GameScene, SlotScene, OfertaScene]
  });
}

// Esperamos a que la fuente Baloo 2 cargue antes de iniciar Phaser
// para evitar que el texto aparezca en Arial y luego cambie
document.fonts.ready.then(crearJuego);
