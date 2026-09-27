import Phaser from 'phaser';
import { HUD } from '../components/HUD';
import { createButton } from '../components/Button';
import { DialogueBox } from '../components/DialogueBox';
import { setCurrentWorld, completeWorld, getGameState } from '../state/GameState';
import { saveGame } from '../state/SaveManager';

export class NightScene extends Phaser.Scene {
  private dialogueBox?: DialogueBox;

  constructor() {
    super({ key: 'NightScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('night');

    // Mount top HUD
    new HUD(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x050814, 1);
    bg.fillRect(0, 0, width, height);

    // Stars / subtle night dots
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 40; i++) {
      const rx = (i * 37) % width;
      const ry = (i * 23) % height;
      stars.fillCircle(rx, ry, (i % 2) + 1);
    }

    // Deep purple / indigo ambient glow for Night
    const glow = this.add.graphics();
    glow.fillStyle(0x4338ca, 0.08);
    glow.fillCircle(width / 2, height / 2, 300);

    // Central card container
    const card = this.add.graphics();
    card.fillStyle(0x0f172a, 0.9);
    card.lineStyle(1.5, 0x6366f1, 0.6);
    card.fillRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);
    card.strokeRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);

    // Scene Header
    this.add.text(width / 2, 130, 'NIGHT WORLD', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f8fafc',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 175, 'Prototype scene. Gameplay will be implemented in Stage 3.', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '16px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Description
    this.add.text(
      width / 2,
      215,
      'Focus: Daily reflection, skill recap, decisions review, resting for the next cycle.',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#a5b4fc'
      }
    ).setOrigin(0.5);

    // Day recap preview
    const state = getGameState();
    const recapBox = this.add.graphics();
    recapBox.fillStyle(0x1e293b, 0.7);
    recapBox.fillRoundedRect(width / 2 - 280, 245, 560, 140, 12);
    recapBox.lineStyle(1, 0x334155, 0.8);
    recapBox.strokeRoundedRect(width / 2 - 280, 245, 560, 140, 12);

    this.add.text(width / 2, 265, 'DAILY JOURNEY RECAP', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.add.text(
      width / 2,
      305,
      `Completed Worlds: ${state.completedWorlds.length > 0 ? state.completedWorlds.join(', ') : 'None yet'}\n` +
      `Total XP: ${state.xp}  |  Coins: ${state.coins}  |  Water: ${state.water}L  |  Sustainability: ${state.sustainability}%\n` +
      `Decisions: Water Saved (${state.decisions.waterSaved ? '✓' : '✗'}), Negotiation (${state.decisions.negotiationSuccess ? '✓' : '✗'})`,
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '13px',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 6
      }
    ).setOrigin(0.5);

    // Save and Finish Day button
    createButton(
      this,
      width / 2,
      415,
      '🌙 Rest & Save Day (Full Save)',
      () => {
        completeWorld('night');
        saveGame();
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Reflection Journal',
            'You rested soundly. All skills and stats have been securely saved to localStorage!'
          );
        }
      },
      {
        width: 320,
        height: 44,
        fontSize: '15px',
        primaryColor: 0x4f46e5,
        hoverColor: 0x6366f1
      }
    );

    // Navigation bar at the bottom
    const navY = height - 50;

    createButton(this, 160, navY, '← Back: Market', () => {
      this.scene.start('MarketScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x374151, hoverColor: 0x4b5563 });

    createButton(this, width / 2, navY, '🏠 Return to Home', () => {
      this.scene.start('HomeScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x059669, hoverColor: 0x10b981 });

    createButton(this, width - 160, navY, 'Main Menu ⌂', () => {
      this.scene.start('MenuScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x374151, hoverColor: 0x4b5563 });

    // Mount DialogueBox
    this.dialogueBox = new DialogueBox(this, width / 2, height - 120);
    this.dialogueBox.setDepth(200);
  }
}
