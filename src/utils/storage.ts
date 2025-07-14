import { GameProgress, PlayerProfile } from '../types/game';

const STORAGE_KEY = 'wordPuzzleGame';
const PROFILE_KEY = 'playerProfile';

export const saveProgress = (progress: GameProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const getStoredProgress = (): GameProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};

export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
};

export const savePlayerProfile = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save player profile:', error);
  }
};

export const getPlayerProfile = (): PlayerProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load player profile:', error);
    return null;
  }
};