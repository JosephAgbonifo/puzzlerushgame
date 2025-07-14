export interface Letter {
  id: string;
  char: string;
  index: number;
}

export interface WordData {
  word: string;
  score: number;
  found: boolean;
}

export interface GameState {
  level: number;
  letters: Letter[];
  discoveredWords: WordData[];
  availableWords: WordData[];
  currentWord: string;
  selectedLetters: Letter[];
  score: number;
  totalScore: number;
  hintsUsed: number;
  soundEnabled: boolean;
  isComplete: boolean;
}

export interface GameProgress {
  level: number;
  totalScore: number;
  soundEnabled: boolean;
}

export interface LetterSet {
  letters: Letter[];
  centerLetter: string;
}

// New interfaces for hourly puzzle system
export interface HourlyPuzzle {
  id: string;
  releaseTime: Date;
  expiryTime: Date;
  category: PuzzleCategory;
  difficulty: PuzzleDifficulty;
  letters: Letter[];
  targetWords: string[];
  xpReward: number;
  isActive: boolean;
  isRare?: boolean;
}

export interface PuzzleAttempt {
  puzzleId: string;
  playerId: string;
  startTime: Date;
  endTime?: Date;
  wordsFound: string[];
  accuracy: number;
  completionTime: number;
  xpEarned: number;
  traits: PlayerTrait[];
}

export interface PlayerTrait {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  level: number;
  benefits: TraitBenefit[];
}

export interface TraitBenefit {
  type: 'xp_boost' | 'early_access' | 'double_xp' | 'special_content';
  value: number;
  description: string;
}

export interface PlayerProfile {
  id: string;
  walletAddress?: string;
  username: string;
  totalXP: number;
  level: number;
  traits: PlayerTrait[];
  puzzleHistory: PuzzleAttempt[];
  streakCount: number;
  longestStreak: number;
  badges: Badge[];
  reputation: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  requirements: MissionRequirement[];
  rewards: MissionReward[];
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiryTime?: Date;
}

export interface MissionRequirement {
  type: 'solve_puzzles' | 'earn_xp' | 'maintain_streak' | 'solve_within_time';
  target: number;
  current: number;
}

export interface MissionReward {
  type: 'xp' | 'trait' | 'badge' | 'special_puzzle';
  value: number | string;
  description: string;
}

export type PuzzleCategory = 'standard' | 'themed' | 'challenge' | 'rare_drop';
export type PuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';
export type MissionType = 'hourly_puzzle' | 'streak_challenge' | 'rare_puzzle_drop' | 'daily_quest';

// Honeycomb integration types
export interface HoneycombMission {
  id: string;
  puzzleId: string;
  releaseTime: string;
  category: string;
  metadata: Record<string, any>;
}

export interface OnChainIdentity {
  walletAddress: string;
  traits: PlayerTrait[];
  verifiedPuzzles: string[];
  reputation: number;
  lastUpdated: Date;
}