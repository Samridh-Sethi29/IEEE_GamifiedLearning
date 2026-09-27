import { GameState } from '../types/gameTypes';
import { getGameState, setFullState, resetGame } from './GameState';

export const SAVE_KEY = 'skillverse_game_state';

export class SaveManager {
  /**
   * Check if localStorage is available in the current browser environment.
   */
  public static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a valid save exists.
   */
  public static hasSavedGame(): boolean {
    if (!this.isStorageAvailable()) return false;
    try {
      const data = window.localStorage.getItem(SAVE_KEY);
      return data !== null && data.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Save the current GameState into localStorage.
   */
  public static saveGame(): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('[SaveManager] localStorage is unavailable. Save skipped.');
      return false;
    }
    try {
      const currentState = getGameState();
      const serialized = JSON.stringify(currentState);
      window.localStorage.setItem(SAVE_KEY, serialized);
      console.log('[SaveManager] Game state successfully saved.');
      return true;
    } catch (err) {
      console.error('[SaveManager] Failed to save game state:', err);
      return false;
    }
  }

  /**
   * Load the saved state from localStorage into GameState.
   * If missing or corrupted, fails gracefully without crashing.
   */
  public static loadGame(): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('[SaveManager] localStorage is unavailable. Cannot load.');
      return false;
    }
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) {
        console.log('[SaveManager] No saved game data found.');
        return false;
      }

      const parsed = JSON.parse(raw) as Partial<GameState>;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid save data format');
      }

      setFullState(parsed);
      console.log('[SaveManager] Game state successfully restored from storage.');
      return true;
    } catch (err) {
      console.error('[SaveManager] Error loading or corrupted save data, state kept as defaults:', err);
      return false;
    }
  }

  /**
   * Delete the saved game from localStorage and optionally reset the in-memory state.
   */
  public static deleteSave(resetMemory: boolean = true): boolean {
    if (resetMemory) {
      resetGame();
    }
    if (!this.isStorageAvailable()) return false;
    try {
      window.localStorage.removeItem(SAVE_KEY);
      console.log('[SaveManager] Save data removed from storage.');
      return true;
    } catch (err) {
      console.error('[SaveManager] Failed to delete save data:', err);
      return false;
    }
  }
}

// Standalone functions for direct export as requested
export const saveGame = (): boolean => SaveManager.saveGame();
export const loadGame = (): boolean => SaveManager.loadGame();
export const hasSavedGame = (): boolean => SaveManager.hasSavedGame();
export const deleteSave = (resetMemory?: boolean): boolean => SaveManager.deleteSave(resetMemory);
