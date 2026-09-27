/**
 * Core type definitions for the SkillVerse game state and architecture.
 */

export interface PlayerProfile {
  name: string;
  avatar: string;
}

export interface PlayerSkills {
  life: number;
  human: number;
  digital: number;
  vocational: number;
  entrepreneurial: number;
}

export type SkillKey = keyof PlayerSkills;

export interface PlayerDecisions {
  waterSaved: boolean;
  safetyFollowed: boolean;
  teamwork: boolean;
  negotiationSuccess: boolean;
}

export type DecisionKey = keyof PlayerDecisions;

export interface GameState {
  player: PlayerProfile;
  skills: PlayerSkills;
  xp: number;
  coins: number;
  sustainability: number;
  water: number;
  currentWorld: string;
  decisions: PlayerDecisions;
  completedWorlds: string[];
}

export type StateListener = (state: Readonly<GameState>) => void;
