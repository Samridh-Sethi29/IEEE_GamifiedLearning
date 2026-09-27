import Phaser from 'phaser';
import { GameState } from '../types/gameTypes';
import { subscribeToState } from '../state/GameState';

export class HUD extends Phaser.GameObjects.Container {
  private unsubscribe?: () => void;
  private background: Phaser.GameObjects.Graphics;
  private playerText: Phaser.GameObjects.Text;
  private xpText: Phaser.GameObjects.Text;
  private coinsText: Phaser.GameObjects.Text;
  private sustainText: Phaser.GameObjects.Text;
  private waterText: Phaser.GameObjects.Text;
  private skillsText: Phaser.GameObjects.Text;
  private worldText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    const width = scene.scale.width;
    const height = 64;

    this.background = scene.add.graphics();
    this.add(this.background);

    // Glassmorphic top bar
    this.background.fillStyle(0x090d16, 0.92);
    this.background.fillRoundedRect(16, 8, width - 32, height, 12);
    this.background.lineStyle(1, 0x334155, 0.8);
    this.background.strokeRoundedRect(16, 8, width - 32, height, 12);

    // Current World tag
    this.worldText = scene.add.text(32, 20, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });
    this.add(this.worldText);

    // Player name & avatar
    this.playerText = scene.add.text(32, 38, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f8fafc'
    });
    this.add(this.playerText);

    // Core stats (XP, Coins, Sustainability, Water)
    const statStartY = 20;

    this.xpText = scene.add.text(260, statStartY, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '13px',
      color: '#fbbf24' // Amber
    });
    this.add(this.xpText);

    this.coinsText = scene.add.text(260, statStartY + 20, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '13px',
      color: '#34d399' // Emerald
    });
    this.add(this.coinsText);

    this.sustainText = scene.add.text(420, statStartY, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '13px',
      color: '#2dd4bf' // Teal
    });
    this.add(this.sustainText);

    this.waterText = scene.add.text(420, statStartY + 20, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '13px',
      color: '#60a5fa' // Blue
    });
    this.add(this.waterText);

    // Skills overview summary
    this.skillsText = scene.add.text(620, statStartY + 8, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '12px',
      color: '#cbd5e1'
    });
    this.add(this.skillsText);

    // Subscribe to state changes
    this.unsubscribe = subscribeToState((state) => this.renderState(state));

    // Handle scene cleanup
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroy();
    });

    scene.add.existing(this);
    this.setDepth(100); // Keep HUD above world elements
  }

  private renderState(state: Readonly<GameState>): void {
    const avatarIcon = state.player.avatar === 'avatar_1' ? '👤' : state.player.avatar === 'avatar_2' ? '🧑‍🔬' : '🧑‍🚀';
    this.worldText.setText(`LOCATION: ${state.currentWorld.toUpperCase()}`);
    this.playerText.setText(`${avatarIcon} ${state.player.name}`);

    this.xpText.setText(`⚡ XP: ${state.xp}`);
    this.coinsText.setText(`🪙 Coins: ${state.coins}`);
    this.sustainText.setText(`🌱 Sustainability: ${state.sustainability}%`);
    this.waterText.setText(`💧 Water: ${state.water}L`);

    const sk = state.skills;
    this.skillsText.setText(
      `SKILLS: Life: ${sk.life} | Human: ${sk.human} | Digital: ${sk.digital} | Voc: ${sk.vocational} | Ent: ${sk.entrepreneurial}`
    );
  }

  public override destroy(fromScene?: boolean): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    super.destroy(fromScene);
  }
}
