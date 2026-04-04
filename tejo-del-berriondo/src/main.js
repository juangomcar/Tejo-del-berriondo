import MenuScene from './scenes/MenuScene.js';
import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import SlotScene from './scenes/SlotScene.js';
import OfertaScene from './scenes/OfertaScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/game.config.js';

// Punto de entrada — solo inicializa el juego y registra las escenas
new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
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
  scene: [GameScene, SlotScene], 
  scene: [MenuScene, GameScene, SlotScene],
  scene: [MenuScene, GameScene, SlotScene, OfertaScene],
  scene: [MenuScene, TutorialScene, GameScene, SlotScene, OfertaScene]


});