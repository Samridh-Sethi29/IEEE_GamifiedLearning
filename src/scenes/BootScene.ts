import Phaser from 'phaser';
import { loadGame } from '../state/SaveManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // Generate simple placeholder graphic assets if needed
    // (Phaser can draw graphics dynamically without requiring external image files)
  }

  public create(): void {
    const { width, height } = this.scale;

    // Load any existing saved game state safely
    loadGame();

    // Background gradient/card
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Boot text
    const title = this.add.text(width / 2, height / 2 - 20, 'SKILLVERSE', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    const sub = this.add.text(width / 2, height / 2 + 30, 'Initializing game engine...', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '16px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: [title, sub],
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Short boot delay for clean transition
    this.time.delayedCall(450, () => {
      this.scene.start('MenuScene');
    });
  }
}
