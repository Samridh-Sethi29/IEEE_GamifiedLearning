import Phaser from 'phaser';
import { HUD } from '../components/HUD';
import { createButton } from '../components/Button';
import { DialogueBox } from '../components/DialogueBox';
import { SkillBar } from '../components/SkillBar';
import {
  setCurrentWorld,
  completeWorld,
  addXP,
  addCoins,
  updateSkill,
  setDecision,
  getGameState
} from '../state/GameState';
import { saveGame } from '../state/SaveManager';

export class MarketScene extends Phaser.Scene {
  private dialogueBox?: DialogueBox;

  constructor() {
    super({ key: 'MarketScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('market');

    // Mount top HUD
    new HUD(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Amber ambient glow for Market
    const glow = this.add.graphics();
    glow.fillStyle(0xf59e0b, 0.05);
    glow.fillCircle(width / 2, height / 2, 280);

    // Central card container
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.85);
    card.lineStyle(1.5, 0xf59e0b, 0.6);
    card.fillRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);
    card.strokeRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);

    // Scene Header
    this.add.text(width / 2, 130, 'MARKET WORLD', {
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
      220,
      'Focus: Entrepreneurial mindset, trade, negotiation, budgeting, financial literacy.',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#fbbf24'
      }
    ).setOrigin(0.5);

    // SkillBar demo
    const currentState = getGameState();
    const entBar = new SkillBar(this, width / 2 - 120, 260, 'Entrepreneurial', currentState.skills.entrepreneurial, 100, {
      width: 240,
      height: 14,
      barColor: 0xf59e0b
    });

    // Test State Interaction button
    createButton(
      this,
      width / 2,
      325,
      '🧪 Negotiate Fair Trade (+30 XP, +15 Ent, +50 Coins)',
      () => {
        addXP(30);
        updateSkill('entrepreneurial', 15);
        addCoins(50);
        setDecision('negotiationSuccess', true);
        entBar.updateValue(getGameState().skills.entrepreneurial);
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Vendor Marcus',
            'Deal! You negotiated an ethical and profitable price for the farm harvest. +50 coins earned!'
          );
        }
      },
      {
        width: 440,
        height: 42,
        fontSize: '14px',
        primaryColor: 0xb45309,
        hoverColor: 0xd97706
      }
    );

    // Dialogue trigger demo
    createButton(
      this,
      width / 2,
      380,
      '💬 Talk to Merchant',
      () => {
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Vendor Marcus',
            'Welcome to the marketplace! We prioritize fair trade and sustainable goods. Evening is approaching soon!'
          );
        }
      },
      {
        width: 260,
        height: 40,
        fontSize: '14px',
        primaryColor: 0x334155,
        hoverColor: 0x475569
      }
    );

    // Navigation bar at the bottom
    const navY = height - 50;

    createButton(this, 160, navY, '← Back: Farm', () => {
      this.scene.start('FarmScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x374151, hoverColor: 0x4b5563 });

    createButton(this, width / 2, navY, '💾 Save Progress', () => {
      saveGame();
      if (this.dialogueBox) {
        this.dialogueBox.showDialogue('System', 'Game progress has been saved to your browser storage.');
      }
    }, { width: 170, height: 42, fontSize: '14px', primaryColor: 0x059669, hoverColor: 0x10b981 });

    createButton(this, width - 160, navY, 'Next: Night →', () => {
      completeWorld('market');
      this.scene.start('NightScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x4f46e5, hoverColor: 0x6366f1 });

    // Mount DialogueBox
    this.dialogueBox = new DialogueBox(this, width / 2, height - 120);
    this.dialogueBox.setDepth(200);
  }
}
