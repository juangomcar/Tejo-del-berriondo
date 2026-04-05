import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import GameScene from './scenes/GameScene.js';
import SlotScene from './scenes/SlotScene.js';
import OfertaScene from './scenes/OfertaScene.js';
import PersonajeScene from './scenes/PersonajeScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/game.config.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
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