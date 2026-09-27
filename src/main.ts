import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { DevPanel } from './components/DevPanel';
import './styles/global.css';

// Initialize Phaser Game instance
const game = new Phaser.Game(gameConfig);

// Initialize Developer & Test controls
const devPanel = new DevPanel(game);

// Expose helpful developer diagnostics in development
if (import.meta.env.DEV) {
  (window as any).__SKILLVERSE_GAME__ = game;
  (window as any).__DEV_PANEL__ = devPanel;
}

console.log('[SkillVerse] Game engine initialized successfully. Stage 1 ready.');
