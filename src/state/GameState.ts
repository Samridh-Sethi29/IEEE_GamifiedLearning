import { GameState, SkillKey, DecisionKey, StateListener } from '../types/gameTypes';

export const defaultGameState: Readonly<GameState> = Object.freeze({
  player: {
    name: 'Explorer',
    avatar: 'avatar_1'
  },
  skills: {
    life: 0,
    human: 0,
    digital: 0,
    vocational: 0,
    entrepreneurial: 0
  },
  xp: 0,
  coins: 100,
  sustainability: 50,
  water: 100,
  currentWorld: 'menu',
  decisions: {
    waterSaved: false,
    safetyFollowed: false,
    teamwork: false,
    negotiationSuccess: false
  },
  completedWorlds: []
});

class GameStateManager {
  private state: GameState;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = this.clone(defaultGameState);
  }

  private clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private notify(): void {
    const readonlyState = Object.freeze(this.clone(this.state));
    this.listeners.forEach((listener) => {
      try {
        listener(readonlyState);
      } catch (err) {
        console.error('Error in GameState listener:', err);
      }
    });
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state to newly subscribed listener
    listener(this.getGameState());
    return () => this.listeners.delete(listener);
  }

  public getGameState(): Readonly<GameState> {
    return Object.freeze(this.clone(this.state));
  }

  public setFullState(newState: Partial<GameState>): void {
    this.state = {
      ...this.clone(defaultGameState),
      ...this.clone(newState),
      player: {
        ...defaultGameState.player,
        ...(newState.player || {})
      },
      skills: {
        ...defaultGameState.skills,
        ...(newState.skills || {})
      },
      decisions: {
        ...defaultGameState.decisions,
        ...(newState.decisions || {})
      },
      completedWorlds: Array.isArray(newState.completedWorlds)
        ? [...newState.completedWorlds]
        : []
    };
    this.sanitize();
    this.notify();
  }

  private sanitize(): void {
    // Enforce constraints
    this.state.xp = Math.max(0, this.state.xp || 0);
    this.state.coins = Math.max(0, this.state.coins || 0);
    this.state.sustainability = Math.min(100, Math.max(0, this.state.sustainability ?? 50));
    this.state.water = Math.max(0, this.state.water ?? 100);

    const skillKeys: SkillKey[] = ['life', 'human', 'digital', 'vocational', 'entrepreneurial'];
    for (const key of skillKeys) {
      this.state.skills[key] = Math.max(0, this.state.skills[key] || 0);
    }
  }

  public updateSkill(skill: SkillKey, amount: number): void {
    if (skill in this.state.skills) {
      this.state.skills[skill] = Math.max(0, this.state.skills[skill] + amount);
      this.notify();
    }
  }

  public addXP(amount: number): void {
    this.state.xp = Math.max(0, this.state.xp + amount);
    this.notify();
  }

  public addCoins(amount: number): void {
    this.state.coins = Math.max(0, this.state.coins + amount);
    this.notify();
  }

  public updateSustainability(amount: number): void {
    this.state.sustainability = Math.min(100, Math.max(0, this.state.sustainability + amount));
    this.notify();
  }

  public updateWater(amount: number): void {
    this.state.water = Math.max(0, this.state.water + amount);
    this.notify();
  }

  public setPlayerProfile(name: string, avatar: string): void {
    this.state.player.name = name.trim() || 'Explorer';
    this.state.player.avatar = avatar || 'avatar_1';
    this.notify();
  }

  public setDecision(key: DecisionKey, value: boolean): void {
    if (key in this.state.decisions) {
      this.state.decisions[key] = value;
      this.notify();
    }
  }

  public setCurrentWorld(world: string): void {
    this.state.currentWorld = world;
    this.notify();
  }

  public completeWorld(world: string): void {
    if (!this.state.completedWorlds.includes(world)) {
      this.state.completedWorlds.push(world);
      this.notify();
    }
  }

  public resetGame(): void {
    this.state = this.clone(defaultGameState);
    this.notify();
  }
}

// Single instance for the application
export const gameState = new GameStateManager();

// Centralized API functions as specified in requirements
export const getGameState = (): Readonly<GameState> => gameState.getGameState();
export const updateSkill = (skill: SkillKey, amount: number): void => gameState.updateSkill(skill, amount);
export const addXP = (amount: number): void => gameState.addXP(amount);
export const addCoins = (amount: number): void => gameState.addCoins(amount);
export const updateSustainability = (amount: number): void => gameState.updateSustainability(amount);
export const updateWater = (amount: number): void => gameState.updateWater(amount);
export const setPlayerProfile = (name: string, avatar: string): void => gameState.setPlayerProfile(name, avatar);
export const setDecision = (key: DecisionKey, value: boolean): void => gameState.setDecision(key, value);
export const setCurrentWorld = (world: string): void => gameState.setCurrentWorld(world);
export const completeWorld = (world: string): void => gameState.completeWorld(world);
export const resetGame = (): void => gameState.resetGame();
export const subscribeToState = (listener: StateListener): (() => void) => gameState.subscribe(listener);
export const setFullState = (newState: Partial<GameState>): void => gameState.setFullState(newState);
