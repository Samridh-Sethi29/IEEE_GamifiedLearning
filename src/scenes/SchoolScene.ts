import Phaser from 'phaser';
import { HUD } from '../components/HUD';
import { createButton } from '../components/Button';
import { DialogueBox } from '../components/DialogueBox';
import { SkillBar } from '../components/SkillBar';
import { setCurrentWorld, completeWorld, addXP, updateSkill, getGameState } from '../state/GameState';
import { saveGame } from '../state/SaveManager';

export class SchoolScene extends Phaser.Scene {
  private dialogueBox?: DialogueBox;

  constructor() {
    super({ key: 'SchoolScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('school');

    // Mount top HUD
    new HUD(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Ambient glow for School (Indigo/Violet)
    const glow = this.add.graphics();
    glow.fillStyle(0x6366f1, 0.06);
    glow.fillCircle(width / 2, height / 2, 280);

    // Central card container
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.85);
    card.lineStyle(1.5, 0x818cf8, 0.6);
    card.fillRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);
    card.strokeRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);

    // Scene Header
    this.add.text(width / 2, 130, 'SCHOOL WORLD', {
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
      'Focus: Digital literacy, human skills (collaboration, peer teamwork), academic challenges.',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#818cf8'
      }
    ).setOrigin(0.5);

    // SkillBar demo
    const currentState = getGameState();
    const digitalBar = new SkillBar(this, width / 2 - 120, 260, 'Digital Skill', currentState.skills.digital, 100, {
      width: 240,
      height: 14,
      barColor: 0x818cf8
    });

    // Test State Interaction button
    createButton(
      this,
      width / 2,
      325,
      '🧪 Attend Digital Lab (+20 XP, +10 Digital, +5 Human)',
      () => {
        addXP(20);
        updateSkill('digital', 10);
        updateSkill('human', 5);
        digitalBar.updateValue(getGameState().skills.digital);
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Instructor Patel',
            'Excellent presentation! Your teamwork and coding demo boosted your Digital and Human skill metrics.'
          );
        }
      },
      {
        width: 440,
        height: 42,
        fontSize: '14px',
        primaryColor: 0x4338ca,
        hoverColor: 0x4f46e5
      }
    );

    // Dialogue trigger demo
    createButton(
      this,
      width / 2,
      380,
      '💬 Talk to Classmate',
      () => {
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Classmate Maya',
            'Hey! Are we going to help out at the community Farm this afternoon? I heard they need help with smart irrigation.'
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

    createButton(this, 160, navY, '← Back: Home', () => {
      this.scene.start('HomeScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x374151, hoverColor: 0x4b5563 });

    createButton(this, width / 2, navY, '💾 Save Progress', () => {
      saveGame();
      if (this.dialogueBox) {
        this.dialogueBox.showDialogue('System', 'Game progress has been saved to your browser storage.');
      }
    }, { width: 170, height: 42, fontSize: '14px', primaryColor: 0x059669, hoverColor: 0x10b981 });

    createButton(this, width - 160, navY, 'Next: Farm →', () => {
      completeWorld('school');
      this.scene.start('FarmScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x4f46e5, hoverColor: 0x6366f1 });

    // Mount DialogueBox
    this.dialogueBox = new DialogueBox(this, width / 2, height - 120);
    this.dialogueBox.setDepth(200);
  }
}
