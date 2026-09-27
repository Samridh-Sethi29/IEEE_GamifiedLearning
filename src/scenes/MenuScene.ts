import Phaser from 'phaser';
import { createButton } from '../components/Button';
import { getGameState, setCurrentWorld } from '../state/GameState';
import { hasSavedGame, loadGame, deleteSave } from '../state/SaveManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('menu');

    // Backdrop
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0f1d, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative grid/tech lines
    bg.lineStyle(1, 0x1e293b, 0.4);
    for (let x = 0; x < width; x += 64) {
      bg.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 64) {
      bg.lineBetween(0, y, width, y);
    }

    // Glow circle behind title
    const glow = this.add.graphics();
    glow.fillStyle(0x38bdf8, 0.08);
    glow.fillCircle(width / 2, height / 2 - 120, 220);

    // Title
    this.add.text(width / 2, height / 2 - 180, 'SKILLVERSE', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#f8fafc',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 120, 'Educational Life-Simulation & Sustainable Skills', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '20px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 85, 'Stage 1 Core Architecture Prototype', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '14px',
      color: '#64748b'
    }).setOrigin(0.5);

    // Button y positions
    const btnStartY = height / 2 + 10;
    const spacing = 62;

    // Start / New Game Button
    createButton(this, width / 2, btnStartY, '✨ Start New Game', () => {
      this.scene.start('CharacterScene');
    }, { width: 240, height: 50, primaryColor: 0x4f46e5, hoverColor: 0x6366f1 });

    // Continue Game Button (active if save exists)
    const canContinue = hasSavedGame();
    const continueBtn = createButton(
      this,
      width / 2,
      btnStartY + spacing,
      '▶ Continue Game',
      () => {
        loadGame();
        const saved = getGameState();
        const targetScene = saved.currentWorld === 'menu' || saved.currentWorld === 'character'
          ? 'HomeScene'
          : `${saved.currentWorld.charAt(0).toUpperCase() + saved.currentWorld.slice(1)}Scene`;

        if (this.scene.get(targetScene)) {
          this.scene.start(targetScene);
        } else {
          this.scene.start('HomeScene');
        }
      },
      {
        width: 240,
        height: 50,
        enabled: canContinue,
        primaryColor: 0x059669,
        hoverColor: 0x10b981
      }
    );

    // Reset Progress Button
    createButton(
      this,
      width / 2,
      btnStartY + spacing * 2,
      '🔄 Reset Progress',
      () => {
        deleteSave(true);
        continueBtn.setEnabled(false);
        infoText.setText('Progress reset. Ready for a fresh start.');
      },
      {
        width: 240,
        height: 44,
        fontSize: '15px',
        primaryColor: 0x374151,
        hoverColor: 0x4b5563
      }
    );

    // Info text
    const currentState = getGameState();
    const infoText = this.add.text(
      width / 2,
      height - 40,
      canContinue
        ? `Saved player: "${currentState.player.name}" | XP: ${currentState.xp} | Coins: ${currentState.coins}`
        : 'Welcome to SkillVerse! Click "Start New Game" to begin.',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#94a3b8'
      }
    ).setOrigin(0.5);
  }
}
