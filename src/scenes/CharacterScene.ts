import Phaser from 'phaser';
import { createButton } from '../components/Button';
import { getGameState, setPlayerProfile, setCurrentWorld } from '../state/GameState';

/**
 * Stores references for each avatar card: the visual Container (background +
 * text), and a separate Zone used exclusively for hit detection.
 */
interface AvatarCardEntry {
  avatarId: string;
  container: Phaser.GameObjects.Container;
  cardBg: Phaser.GameObjects.Graphics;
  hitZone: Phaser.GameObjects.Zone;
}

export class CharacterScene extends Phaser.Scene {
  private selectedAvatar: string = 'avatar_1';
  private avatarCards: AvatarCardEntry[] = [];
  private nameInputEl: HTMLInputElement | null = null;

  constructor() {
    super({ key: 'CharacterScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    setCurrentWorld('character');

    const currentState = getGameState();
    this.selectedAvatar = currentState.player.avatar || 'avatar_1';

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0f1d, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative grid
    bg.lineStyle(1, 0x1e293b, 0.4);
    for (let x = 0; x < width; x += 64) {
      bg.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 64) {
      bg.lineBetween(0, y, width, y);
    }

    // Panel card
    const card = this.add.graphics();
    card.fillStyle(0x111827, 0.9);
    card.lineStyle(1.5, 0x38bdf8, 0.7);
    card.fillRoundedRect(width / 2 - 320, 40, 640, height - 80, 20);
    card.strokeRoundedRect(width / 2 - 320, 40, 640, height - 80, 20);

    // Title
    this.add.text(width / 2, 80, 'CREATE YOUR CHARACTER', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#f8fafc'
    }).setOrigin(0.5);

    this.add.text(width / 2, 115, 'Choose your identity for your SkillVerse journey', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '15px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Name label
    this.add.text(width / 2, 170, 'PLAYER NAME', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    // Mount HTML Input Element
    this.mountNameInput(currentState.player.name || 'Alex');

    // Avatar Selection Label
    this.add.text(width / 2, 280, 'SELECT AN AVATAR', {
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    // Avatars
    const avatars = [
      { id: 'avatar_1', icon: '👤', label: 'Explorer Alex', role: 'Curious & Resourceful' },
      { id: 'avatar_2', icon: '🧑‍🔬', label: 'Innovator Sam', role: 'Analytical & Mindful' },
      { id: 'avatar_3', icon: '🧑‍🚀', label: 'Builder Jordan', role: 'Practical & Resilient' }
    ];

    const cardWidth = 170;
    const cardHeight = 170;
    const spacing = 190;
    const startX = width / 2 - spacing;
    const cardY = 390;

    this.avatarCards = avatars.map((av, index) => {
      const cardX = startX + index * spacing;

      // Visual container — NOT interactive (visuals only)
      const container = this.add.container(cardX, cardY);

      const cardBg = this.add.graphics();
      container.add(cardBg);

      const iconText = this.add.text(0, -32, av.icon, {
        fontSize: '44px'
      }).setOrigin(0.5);
      container.add(iconText);

      const label = this.add.text(0, 22, av.label, {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#f8fafc'
      }).setOrigin(0.5);
      container.add(label);

      const role = this.add.text(0, 44, av.role, {
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        fontSize: '11px',
        color: '#94a3b8'
      }).setOrigin(0.5);
      container.add(role);

      // Zone for hit detection — world-space, never scaled, always accurate
      const hitZone = this.add.zone(cardX, cardY, cardWidth, cardHeight);
      hitZone.setInteractive({ useHandCursor: true });
      hitZone.setDepth(container.depth + 1);

      hitZone.on('pointerdown', () => {
        this.selectedAvatar = av.id;
        this.refreshAvatarSelection();
      });

      return { avatarId: av.id, container, cardBg, hitZone };
    });

    this.refreshAvatarSelection();

    // Navigation buttons
    createButton(this, width / 2 - 130, height - 90, '← Back to Menu', () => {
      this.cleanupDOM();
      this.scene.start('MenuScene');
    }, { width: 180, height: 46, primaryColor: 0x374151, hoverColor: 0x4b5563, fontSize: '15px' });

    createButton(this, width / 2 + 130, height - 90, 'Continue to Home →', () => {
      const playerName = this.nameInputEl ? this.nameInputEl.value.trim() : 'Explorer';
      setPlayerProfile(playerName || 'Explorer', this.selectedAvatar);
      setCurrentWorld('home');
      this.cleanupDOM();
      this.scene.start('HomeScene');
    }, { width: 200, height: 46, primaryColor: 0x4f46e5, hoverColor: 0x6366f1, fontSize: '16px' });

    // Clean up on shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupDOM();
    });
  }

  private mountNameInput(initialValue: string): void {
    this.cleanupDOM();

    const input = document.createElement('input');
    input.id = 'player-name-input';
    input.type = 'text';
    input.value = initialValue;
    input.placeholder = 'Enter explorer name...';
    input.maxLength = 18;
    input.className = 'character-name-input';

    const parent = document.getElementById('game-container') || document.body;
    parent.appendChild(input);
    this.nameInputEl = input;
    input.focus();
  }

  private cleanupDOM(): void {
    if (this.nameInputEl) {
      this.nameInputEl.remove();
      this.nameInputEl = null;
    }
  }

  private refreshAvatarSelection(): void {
    const cardWidth = 170;
    const cardHeight = 170;

    this.avatarCards.forEach(({ avatarId, cardBg }) => {
      const isSelected = avatarId === this.selectedAvatar;

      cardBg.clear();
      if (isSelected) {
        cardBg.fillStyle(0x1e3a8a, 0.9);
        cardBg.lineStyle(2.5, 0x38bdf8, 1);
      } else {
        cardBg.fillStyle(0x1f2937, 0.75);
        cardBg.lineStyle(1.5, 0x374151, 0.8);
      }
      cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14);
      cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14);
    });
  }
}
