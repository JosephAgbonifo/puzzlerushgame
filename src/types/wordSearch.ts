export interface WordSearchLetter {
  id: string;
  char: string;
  row: number;
  col: number;
  isHighlighted: boolean;
  isCorrect: boolean;
  wordId?: string;
}

export interface WordSearchWord {
  id: string;
  word: string;
  found: boolean;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'diagonal-reverse';
}

export interface WordSearchGameState {
  level: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  grid: WordSearchLetter[][];
  words: WordSearchWord[];
  foundWords: WordSearchWord[];
  selectedLetters: WordSearchLetter[];
  score: number;
  timeRemaining: number;
  isComplete: boolean;
  isGameOver: boolean;
  gridSize: number;
}

export interface GameSettings {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeLimit: number;
  gridSize: number;
  wordCount: number;
}