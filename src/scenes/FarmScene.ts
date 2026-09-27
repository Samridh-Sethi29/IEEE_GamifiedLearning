import Phaser from 'phaser';
import { HUD } from '../components/HUD';
import { createButton } from '../components/Button';
import { DialogueBox } from '../components/DialogueBox';
import { SkillBar } from '../components/SkillBar';
import {
  setCurrentWorld,
  completeWorld,
  addXP,
  updateSkill,
  updateSustainability,
  updateWater,
  setDecision,
  getGameState
} from '../state/GameState';
import { saveGame } from '../state/SaveManager';

export class FarmScene extends Phaser.Scene {
  private dialogueBox?: DialogueBox;

  constructor() {
    super({ key: 'FarmScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('farm');

    // Mount top HUD
    new HUD(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Green ambient glow for Farm
    const glow = this.add.graphics();
    glow.fillStyle(0x10b981, 0.05);
    glow.fillCircle(width / 2, height / 2, 280);

    // Central card container
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.85);
    card.lineStyle(1.5, 0x10b981, 0.6);
    card.fillRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);
    card.strokeRoundedRect(width / 2 - 380, 90, 760, height - 170, 16);

    // Scene Header
    this.add.text(width / 2, 130, 'FARM WORLD', {
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
      'Focus: Vocational skills, agriculture, smart water preservation, eco-sustainability.',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '14px',
        color: '#34d399'
      }
    ).setOrigin(0.5);

    // SkillBar demo
    const currentState = getGameState();
    const vocBar = new SkillBar(this, width / 2 - 120, 260, 'Vocational Skill', currentState.skills.vocational, 100, {
      width: 240,
      height: 14,
      barColor: 0x34d399
    });

    // Test State Interaction button
    createButton(
      this,
      width / 2,
      325,
      '🧪 Fix Irrigation Leak (+25 XP, +10 Voc, +15 Sustain)',
      () => {
        addXP(25);
        updateSkill('vocational', 10);
        updateSustainability(15);
        updateWater(-5);
        setDecision('waterSaved', true);
        vocBar.updateValue(getGameState().skills.vocational);
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Farmer Green',
            'You repaired the drip irrigation system! You saved 500 liters of water today and boosted sustainability.'
          );
        }
      },
      {
        width: 440,
        height: 42,
        fontSize: '14px',
        primaryColor: 0x065f46,
        hoverColor: 0x059669
      }
    );

    // Dialogue trigger demo
    createButton(
      this,
      width / 2,
      380,
      '💬 Consult Farm Manager',
      () => {
        if (this.dialogueBox) {
          this.dialogueBox.showDialogue(
            'Farmer Green',
            'We harvested high-yield organic crops thanks to smart farming! Take the produce to the Market World to sell.'
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

    createButton(this, 160, navY, '← Back: School', () => {
      this.scene.start('SchoolScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x374151, hoverColor: 0x4b5563 });

    createButton(this, width / 2, navY, '💾 Save Progress', () => {
      saveGame();
      if (this.dialogueBox) {
        this.dialogueBox.showDialogue('System', 'Game progress has been saved to your browser storage.');
      }
    }, { width: 170, height: 42, fontSize: '14px', primaryColor: 0x059669, hoverColor: 0x10b981 });

    createButton(this, width - 160, navY, 'Next: Market →', () => {
      completeWorld('farm');
      this.scene.start('MarketScene');
    }, { width: 180, height: 42, fontSize: '14px', primaryColor: 0x4f46e5, hoverColor: 0x6366f1 });

    // Mount DialogueBox
    this.dialogueBox = new DialogueBox(this, width / 2, height - 120);
    this.dialogueBox.setDepth(200);
  }
}
