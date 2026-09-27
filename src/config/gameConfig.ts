import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { CharacterScene } from '../scenes/CharacterScene';
import { HomeScene } from '../scenes/HomeScene';
import { SchoolScene } from '../scenes/SchoolScene';
import { FarmScene } from '../scenes/FarmScene';
import { MarketScene } from '../scenes/MarketScene';
import { NightScene } from '../scenes/NightScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0f1d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    CharacterScene,
    HomeScene,
    SchoolScene,
    FarmScene,
    MarketScene,
    NightScene
  ]
};
