import Phaser from 'phaser';

export interface DialogueBoxOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  borderColor?: number;
  textColor?: string;
  nameColor?: string;
}

const DEFAULT_OPTIONS: Required<DialogueBoxOptions> = {
  width: 960,
  height: 150,
  backgroundColor: 0x0f172a, // Slate 900
  borderColor: 0x38bdf8,     // Sky 400
  textColor: '#f1f5f9',      // Slate 100
  nameColor: '#38bdf8'       // Sky 400
};

export class DialogueBox extends Phaser.GameObjects.Container {
  private bgGraphics: Phaser.GameObjects.Graphics;
  private nameBadgeGraphics: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private options: Required<DialogueBoxOptions>;
  private onDismissCallback?: () => void;
  /** World-space Zone for reliable click detection under Scale.FIT */
  private hitZone: Phaser.GameObjects.Zone;
  private worldY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: DialogueBoxOptions = {}
  ) {
    super(scene, x, y);
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.worldY = y;

    this.bgGraphics = scene.add.graphics();
    this.add(this.bgGraphics);

    this.nameBadgeGraphics = scene.add.graphics();
    this.add(this.nameBadgeGraphics);

    const dpr = window.devicePixelRatio || 1;

    this.nameText = scene.add.text(-this.options.width / 2 + 24, -this.options.height / 2 - 14, '', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: this.options.nameColor,
      resolution: dpr
    });
    this.add(this.nameText);

    this.bodyText = scene.add.text(
      -this.options.width / 2 + 28,
      -this.options.height / 2 + 24,
      '',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '16px',
        color: this.options.textColor,
        wordWrap: { width: this.options.width - 56 },
        lineSpacing: 6,
        resolution: dpr
      }
    );
    this.add(this.bodyText);

    this.promptText = scene.add.text(
      this.options.width / 2 - 28,
      this.options.height / 2 - 24,
      '[Click to continue ▾]',
      {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '13px',
        color: '#94a3b8',
        resolution: dpr
      }
    ).setOrigin(1, 1);
    this.add(this.promptText);

    // Zone for click detection — sits at the same world position, never scaled
    this.hitZone = scene.add.zone(x, y, this.options.width, this.options.height);
    this.hitZone.setInteractive({ useHandCursor: true });
    this.hitZone.setDepth(201); // Above the container

    this.hitZone.on('pointerdown', () => {
      // Always dismiss the dialogue on click
      this.hideDialogue();
      // Run the optional callback if one was provided
      if (this.onDismissCallback) {
        this.onDismissCallback();
      }
    });

    // Start hidden
    this.hitZone.setVisible(false);
    this.hitZone.disableInteractive();

    this.drawBackground();
    this.setVisible(false);
    scene.add.existing(this);
  }

  private drawBackground(): void {
    const { width, height, backgroundColor, borderColor } = this.options;
    const halfW = width / 2;
    const halfH = height / 2;

    this.bgGraphics.clear();
    // Glassmorphic translucent slate backdrop
    this.bgGraphics.fillStyle(backgroundColor, 0.95);
    this.bgGraphics.lineStyle(2, borderColor, 0.85);
    this.bgGraphics.fillRoundedRect(-halfW, -halfH, width, height, 16);
    this.bgGraphics.strokeRoundedRect(-halfW, -halfH, width, height, 16);

    // Accent header line
    this.bgGraphics.lineStyle(1, 0x1e293b, 0.8);
    this.bgGraphics.lineBetween(-halfW + 16, -halfH + 46, halfW - 16, -halfH + 46);
  }

  public showDialogue(speaker: string, message: string, onDismiss?: () => void): this {
    this.nameText.setText(speaker);
    this.bodyText.setText(message);
    this.onDismissCallback = onDismiss;

    // Draw name badge
    const textWidth = this.nameText.width;
    this.nameBadgeGraphics.clear();
    this.nameBadgeGraphics.fillStyle(0x1e293b, 1);
    this.nameBadgeGraphics.lineStyle(1.5, this.options.borderColor, 0.9);
    this.nameBadgeGraphics.fillRoundedRect(
      -this.options.width / 2 + 16,
      -this.options.height / 2 - 20,
      textWidth + 24,
      30,
      8
    );
    this.nameBadgeGraphics.strokeRoundedRect(
      -this.options.width / 2 + 16,
      -this.options.height / 2 - 20,
      textWidth + 24,
      30,
      8
    );

    // Show container visuals
    this.setVisible(true);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      y: this.worldY,
      duration: 180,
      ease: 'Quad.easeOut'
    });

    // Enable the hit zone
    this.hitZone.setVisible(true);
    this.hitZone.setInteractive({ useHandCursor: true });

    return this;
  }

  public hideDialogue(): this {
    // Disable the hit zone immediately
    this.hitZone.setVisible(false);
    this.hitZone.disableInteractive();

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
    return this;
  }
}

