import Phaser from 'phaser';

export interface SkillBarOptions {
  width?: number;
  height?: number;
  barColor?: number;
  trackColor?: number;
  textColor?: string;
  fontSize?: string;
  borderRadius?: number;
}

const DEFAULT_OPTIONS: Required<SkillBarOptions> = {
  width: 140,
  height: 12,
  barColor: 0x38bdf8,   // Sky 400
  trackColor: 0x1e293b, // Slate 800
  textColor: '#cbd5e1', // Slate 300
  fontSize: '11px',
  borderRadius: 6
};

export class SkillBar extends Phaser.GameObjects.Container {
  private skillName: string;
  private value: number;
  private maxValue: number;
  private options: Required<SkillBarOptions>;

  private labelText: Phaser.GameObjects.Text;
  private valueText: Phaser.GameObjects.Text;
  private trackGraphics: Phaser.GameObjects.Graphics;
  private fillGraphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    skillName: string,
    value: number,
    maxValue: number = 100,
    options: SkillBarOptions = {}
  ) {
    super(scene, x, y);
    this.skillName = skillName;
    this.value = Math.max(0, value);
    this.maxValue = Math.max(1, maxValue);
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Skill name label
    this.labelText = scene.add.text(0, 0, this.skillName.toUpperCase(), {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: this.options.fontSize,
      fontStyle: 'bold',
      color: this.options.textColor
    });
    this.add(this.labelText);

    // Value text (right-aligned)
    this.valueText = scene.add.text(this.options.width, 0, `${this.value}/${this.maxValue}`, {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: this.options.fontSize,
      color: '#94a3b8'
    }).setOrigin(1, 0);
    this.add(this.valueText);

    // Bar graphics
    this.trackGraphics = scene.add.graphics();
    this.add(this.trackGraphics);

    this.fillGraphics = scene.add.graphics();
    this.add(this.fillGraphics);

    this.drawBar();
    scene.add.existing(this);
  }

  public updateValue(newValue: number, newMaxValue?: number): void {
    this.value = Math.max(0, newValue);
    if (newMaxValue !== undefined) {
      this.maxValue = Math.max(1, newMaxValue);
    }
    this.valueText.setText(`${this.value}/${this.maxValue}`);
    this.drawBar();
  }

  private drawBar(): void {
    const { width, height, barColor, trackColor, borderRadius } = this.options;
    const barY = 16;

    // Track
    this.trackGraphics.clear();
    this.trackGraphics.fillStyle(trackColor, 0.9);
    this.trackGraphics.lineStyle(1, 0x334155, 0.8);
    this.trackGraphics.fillRoundedRect(0, barY, width, height, borderRadius);
    this.trackGraphics.strokeRoundedRect(0, barY, width, height, borderRadius);

    // Fill
    this.fillGraphics.clear();
    const ratio = Math.min(1, Math.max(0, this.value / this.maxValue));
    const fillWidth = Math.max(0, width * ratio);

    if (fillWidth > 0) {
      this.fillGraphics.fillStyle(barColor, 1);
      this.fillGraphics.fillRoundedRect(0, barY, fillWidth, height, borderRadius);
    }
  }
}
