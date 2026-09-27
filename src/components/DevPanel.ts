import {
  addXP,
  addCoins,
  updateSkill,
  updateSustainability,
  updateWater,
  getGameState,
  subscribeToState
} from '../state/GameState';
import { saveGame, loadGame, deleteSave } from '../state/SaveManager';
import Phaser from 'phaser';

export class DevPanel {
  private containerEl: HTMLElement | null = null;
  private toggleBtn: HTMLElement | null = null;
  private isVisible: boolean = false;
  private game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.buildDOM();
    this.setupListeners();
  }

  private buildDOM(): void {
    // Toggle button in top right
    const toggle = document.createElement('button');
    toggle.id = 'dev-panel-toggle';
    toggle.className = 'dev-toggle-btn';
    toggle.innerHTML = '🛠️ Dev Panel';
    document.body.appendChild(toggle);
    this.toggleBtn = toggle;

    // Dev panel container
    const panel = document.createElement('div');
    panel.id = 'dev-panel-container';
    panel.className = 'dev-panel-drawer hidden';

    panel.innerHTML = `
      <div class="dev-panel-header">
        <div class="dev-title">
          <span>🛠️ Developer & Test Controls</span>
          <span class="dev-badge">Stage 1</span>
        </div>
        <button id="dev-close-btn" class="dev-btn-close">✕</button>
      </div>

      <div class="dev-panel-body">
        <div class="dev-section-title">QUICK STAT BOOSTS (+10)</div>
        <div class="dev-grid">
          <button id="dev-add-xp" class="dev-btn">⚡ +10 XP</button>
          <button id="dev-add-coins" class="dev-btn">🪙 +10 Coins</button>
          <button id="dev-add-sustain" class="dev-btn">🌱 +10 Sustainability</button>
          <button id="dev-add-water" class="dev-btn">💧 +10 Water</button>
        </div>

        <div class="dev-section-title">SKILL MODIFIERS (+10)</div>
        <div class="dev-grid">
          <button id="dev-skill-life" class="dev-btn">❤️ Life</button>
          <button id="dev-skill-human" class="dev-btn">🤝 Human</button>
          <button id="dev-skill-digital" class="dev-btn">💻 Digital</button>
          <button id="dev-skill-vocational" class="dev-btn">🔧 Vocational</button>
          <button id="dev-skill-ent" class="dev-btn">🚀 Entrepreneurial</button>
        </div>

        <div class="dev-section-title">STORAGE & PERSISTENCE</div>
        <div class="dev-grid-3">
          <button id="dev-save-btn" class="dev-btn dev-btn-success">💾 Save State</button>
          <button id="dev-load-btn" class="dev-btn dev-btn-info">📂 Load State</button>
          <button id="dev-reset-btn" class="dev-btn dev-btn-danger">🔄 Reset State</button>
        </div>

        <div class="dev-section-title">SCENE NAVIGATION JUMP</div>
        <div class="dev-grid">
          <button data-scene="MenuScene" class="dev-btn dev-scene-jump">Menu</button>
          <button data-scene="CharacterScene" class="dev-btn dev-scene-jump">Character</button>
          <button data-scene="HomeScene" class="dev-btn dev-scene-jump">Home</button>
          <button data-scene="SchoolScene" class="dev-btn dev-scene-jump">School</button>
          <button data-scene="FarmScene" class="dev-btn dev-scene-jump">Farm</button>
          <button data-scene="MarketScene" class="dev-btn dev-scene-jump">Market</button>
          <button data-scene="NightScene" class="dev-btn dev-scene-jump">Night</button>
        </div>

        <div class="dev-section-title">CURRENT GAME STATE (JSON)</div>
        <pre id="dev-state-preview" class="dev-state-box"></pre>
      </div>
    `;

    document.body.appendChild(panel);
    this.containerEl = panel;
  }

  private setupListeners(): void {
    if (!this.containerEl || !this.toggleBtn) return;

    this.toggleBtn.addEventListener('click', () => this.toggle());

    const closeBtn = this.containerEl.querySelector('#dev-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle(false));
    }

    // Keyboard shortcut (key 'D' or '~')
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        this.toggle();
      }
    });

    // Stat buttons
    this.bindClick('#dev-add-xp', () => addXP(10));
    this.bindClick('#dev-add-coins', () => addCoins(10));
    this.bindClick('#dev-add-sustain', () => updateSustainability(10));
    this.bindClick('#dev-add-water', () => updateWater(10));

    // Skill buttons
    this.bindClick('#dev-skill-life', () => updateSkill('life', 10));
    this.bindClick('#dev-skill-human', () => updateSkill('human', 10));
    this.bindClick('#dev-skill-digital', () => updateSkill('digital', 10));
    this.bindClick('#dev-skill-vocational', () => updateSkill('vocational', 10));
    this.bindClick('#dev-skill-ent', () => updateSkill('entrepreneurial', 10));

    // Persistence buttons
    this.bindClick('#dev-save-btn', () => {
      const ok = saveGame();
      this.flashNotification(ok ? 'Game Saved to localStorage!' : 'Save failed');
    });

    this.bindClick('#dev-load-btn', () => {
      const ok = loadGame();
      this.flashNotification(ok ? 'Game Loaded from localStorage!' : 'No save found');
    });

    this.bindClick('#dev-reset-btn', () => {
      deleteSave(true);
      this.flashNotification('Game Reset to Defaults!');
    });

    // Scene jumping
    const jumpButtons = this.containerEl.querySelectorAll<HTMLButtonElement>('.dev-scene-jump');
    jumpButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sceneKey = btn.dataset.scene;
        if (sceneKey) {
          // Find currently active scene and switch
          const activeScenes = this.game.scene.getScenes(true);
          if (activeScenes.length > 0) {
            activeScenes[0].scene.start(sceneKey);
          } else {
            this.game.scene.start(sceneKey);
          }
        }
      });
    });

    // Subscribe to state updates to update the JSON preview
    subscribeToState((state) => {
      const preview = document.getElementById('dev-state-preview');
      if (preview) {
        preview.textContent = JSON.stringify(state, null, 2);
      }
    });
  }

  private bindClick(selector: string, handler: () => void): void {
    const el = this.containerEl?.querySelector(selector);
    if (el) {
      el.addEventListener('click', handler);
    }
  }

  public toggle(force?: boolean): void {
    this.isVisible = force !== undefined ? force : !this.isVisible;
    if (this.containerEl) {
      if (this.isVisible) {
        this.containerEl.classList.remove('hidden');
        // Update state preview
        const preview = document.getElementById('dev-state-preview');
        if (preview) {
          preview.textContent = JSON.stringify(getGameState(), null, 2);
        }
      } else {
        this.containerEl.classList.add('hidden');
      }
    }
  }

  private flashNotification(msg: string): void {
    const notif = document.createElement('div');
    notif.className = 'dev-notification';
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 400);
    }, 1500);
  }
}
