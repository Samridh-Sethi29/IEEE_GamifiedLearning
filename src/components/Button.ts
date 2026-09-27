import Phaser from 'phaser';

export interface ButtonOptions {
  width?: number;
  height?: number;
  fontSize?: string;
  primaryColor?: number;
  hoverColor?: number;
  pressedColor?: number;
  disabledColor?: number;
  textColor?: string;
  disabledTextColor?: string;
  borderRadius?: number;
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<ButtonOptions> = {
  width: 200,
  height: 48,
  fontSize: '18px',
  primaryColor: 0x4f46e5, // Indigo 600
  hoverColor: 0x6366f1,   // Indigo 500
  pressedColor: 0x4338ca, // Indigo 700
  disabledColor: 0x374151,// Gray 700
  textColor: '#ffffff',
  disabledTextColor: '#9ca3af',
  borderRadius: 10,
  enabled: true
};

/**
 * Button uses a Container (visuals-only) + a separate Zone (hit-area only).
 *
 * Why: Container.setInteractive() with a Geom.Rectangle doesn't correctly
 * map pointer coordinates when the canvas is CSS-scaled via Phaser.Scale.FIT.
 * A Zone is a world-space game object whose hit-test IS correctly transformed,
 * so clicks/hovers always land accurately.
 *
 * The Zone is never scaled — it stays at the button's world position as a
 * stable hit surface. Only the Container is tweened for animations.
 */
export class Button {
  private scene: Phaser.Scene;
  /** Visual container (background + label). Animations target this. */
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  /** Invisible hit surface at world position. Never scaled. */
  private hitZone: Phaser.GameObjects.Zone;
  private options: Required<ButtonOptions>;
  private isEnabled: boolean;
  private isHovered: boolean = false;
  private onClickCallback: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options: ButtonOptions = {}
  ) {
    this.scene = scene;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.isEnabled = this.options.enabled;
    this.onClickCallback = onClick;

    // Visual container — NOT interactive
    this.container = scene.add.container(x, y);

    // Background graphics (child of container, drawn at local origin)
    this.background = scene.add.graphics();
    this.container.add(this.background);

    // Text label (child of container, centred at local origin)
    this.labelText = scene.add.text(0, 0, text, {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: this.options.fontSize,
      fontStyle: 'bold',
      color: this.isEnabled ? this.options.textColor : this.options.disabledTextColor,
      align: 'center',
      resolution: window.devicePixelRatio || 1
    }).setOrigin(0.5);
    this.container.add(this.labelText);

    // Hit zone — world-space rectangle, always at scale 1
    this.hitZone = scene.add.zone(x, y, this.options.width, this.options.height);
    if (this.isEnabled) {
      this.hitZone.setInteractive({ useHandCursor: true });
    }
    this.hitZone.setDepth(this.container.depth + 1);

    this.setupEvents();
    this.redraw();
  }

  private setupEvents(): void {
    this.hitZone.on('pointerover', () => {
      if (!this.isEnabled) return;
      this.isHovered = true;
      this.scene.input.setDefaultCursor('pointer');
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 120,
        ease: 'Quad.easeOut'
      });
      this.redraw();
    });

    this.hitZone.on('pointerout', () => {
      if (!this.isEnabled) return;
      this.isHovered = false;
      this.scene.input.setDefaultCursor('default');
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.easeOut'
      });
      this.redraw();
    });

    this.hitZone.on('pointerdown', () => {
      if (!this.isEnabled) return;
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 60,
        ease: 'Quad.easeOut'
      });
      this.redraw(this.options.pressedColor);
    });

    this.hitZone.on('pointerup', () => {
      if (!this.isEnabled) return;
      this.scene.tweens.add({
        targets: this.container,
        scaleX: this.isHovered ? 1.04 : 1,
        scaleY: this.isHovered ? 1.04 : 1,
        duration: 100,
        ease: 'Back.easeOut'
      });
      this.redraw();
      this.onClickCallback();
    });
  }

  private redraw(overrideColor?: number): void {
    const { width, height, borderRadius, primaryColor, hoverColor, disabledColor } = this.options;
    const halfW = width / 2;
    const halfH = height / 2;

    this.background.clear();

    let bgColor = primaryColor;
    if (!this.isEnabled) {
      bgColor = disabledColor;
    } else if (overrideColor !== undefined) {
      bgColor = overrideColor;
    } else if (this.isHovered) {
      bgColor = hoverColor;
    }

    // Outer glow if hovered
    if (this.isEnabled && this.isHovered) {
      this.background.lineStyle(2, 0xa5b4fc, 0.8);
    } else if (this.isEnabled) {
      this.background.lineStyle(1, 0x818cf8, 0.4);
    } else {
      this.background.lineStyle(1, 0x4b5563, 0.3);
    }

    this.background.fillStyle(bgColor, 1);
    this.background.fillRoundedRect(-halfW, -halfH, width, height, borderRadius);
    this.background.strokeRoundedRect(-halfW, -halfH, width, height, borderRadius);
  }

  public setEnabled(enabled: boolean): this {
    this.isEnabled = enabled;
    if (!enabled) {
      this.labelText.setColor(this.options.disabledTextColor);
      this.hitZone.disableInteractive();
    } else {
      this.labelText.setColor(this.options.textColor);
      this.hitZone.setInteractive({ useHandCursor: true });
    }
    this.redraw();
    return this;
  }

  public setText(text: string): this {
    this.labelText.setText(text);
    return this;
  }

  public destroy(): void {
    this.container.destroy();
    this.hitZone.destroy();
  }
}

/**
 * Helper function for quickly creating a button
 */
export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
  options?: ButtonOptions
): Button {
  return new Button(scene, x, y, text, onClick, options);
}
