import Phaser from 'phaser';
import { HUD } from '../components/HUD';
import { createButton } from '../components/Button';
import { DialogueBox } from '../components/DialogueBox';
import { SkillBar } from '../components/SkillBar';
import { setCurrentWorld, completeWorld, addXP, addCoins, updateSkill, getGameState } from '../state/GameState';
import { saveGame } from '../state/SaveManager';

export class HomeScene extends Phaser.Scene {
  private dialogueBox?: DialogueBox;

  constructor() {
    super({ key: 'HomeScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('home');

    // Mount top HUD
    new HUD(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Warm ambient tint for Home
    const glow = this.add.graphics();
    glow.fillStyle(0xf59e0b, 0.05);
    glow.fillCircle(width / 2, height / 2, 280);

    // Central card container
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.85);
    card.lineStyle(1.5, 0x38bdf8, 0.6);
    card.fillRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);
    card.strokeRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);

    // Scene Header
    this.add.text(width / 2, 130, 'HOME WORLD', {
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

    // World Description & Developer Guide
    this.add.text(
      width / 2,
      220,
      'Focus: Life skills, morning routine, resource awareness (water & energy conservation).',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#38bdf8'
      }
    ).setOrigin(0.5);

    // SkillBar component demo
    const currentState = getGameState();
    const skillBar = new SkillBar(this, width / 2 - 120, 260, 'Life Skill', currentState.skills.life, 100, {
      width: 240,
      height: 14,
      barColor: 0x38bdf8
    });

    // Test State Interaction button inside the scene
    createButton(
      this,
      width / 2,
      325,
      '🧪 Complete Morning Task (+15 XP, +5 Life)',
      () => {
        addXP(15);
        updateSkill('life', 5);
        addCoins(10);
        skillBar.updateValue(getGameState().skills.life);
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Room Assistant',
            'Great job completing your morning routine! You turned off running taps (+Life Skill) and earned +15 XP.'
          );
        }
      },
      {
        width: 380,
        height: 42,
        fontSize: '14px',
        primaryColor: 0x1e3a8a,
        hoverColor: 0x2563eb
      }
    );

    // Dialogue trigger demo
    createButton(
      this,
      width / 2,
      380,
      '💬 Talk to Family / NPC',
      () => {
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Parent / Guide',
            'Good morning! Make sure your backpack is packed with books for School, and don’t forget to conserve water.'
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

    createButton(this, 160, navY, '← Back: Character', () => {
      this.scene.start('CharacterScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x374151, hoverColor: 0x4b5563 });

    createButton(this, width / 2, navY, '💾 Save Progress', () => {
      saveGame();
      if (this.dialogueBox) {
        this.dialogueBox.showDialogue('System', 'Game progress has been saved to your browser storage.');
      }
    }, { width: 170, height: 42, fontSize: '14px', primaryColor: 0x059669, hoverColor: 0x10b981 });

    createButton(this, width - 160, navY, 'Next: School →', () => {
      completeWorld('home');
      this.scene.start('SchoolScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x4f46e5, hoverColor: 0x6366f1 });

    // Mount DialogueBox
    this.dialogueBox = new DialogueBox(this, width / 2, height - 120);
    this.dialogueBox.setDepth(200);
  }
}
