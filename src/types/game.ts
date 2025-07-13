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
  volume: number;
}

export interface LetterSet {
  letters: Letter[];
  centerLetter: string;
}