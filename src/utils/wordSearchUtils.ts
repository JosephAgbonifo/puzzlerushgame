import { WordSearchLetter, WordSearchWord, WordSearchGameState } from '../types/wordSearch';

// Word lists for different difficulties
const wordLists = {
  beginner: [
    'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BIRD', 'FISH', 'BOOK', 'GAME',
    'LOVE', 'HOPE', 'PLAY', 'WORK', 'HOME', 'FOOD', 'WATER', 'LIGHT', 'MUSIC', 'DANCE'
  ],
  intermediate: [
    'HAPPY', 'SMILE', 'LAUGH', 'DREAM', 'PEACE', 'MAGIC', 'BRAVE', 'SMART', 'QUICK', 'STRONG',
    'FRIEND', 'FAMILY', 'NATURE', 'GARDEN', 'FLOWER', 'OCEAN', 'MOUNTAIN', 'FOREST', 'RAINBOW', 'SUNSET'
  ],
  advanced: [
    'ADVENTURE', 'CREATIVE', 'POSITIVE', 'HARMONY', 'BALANCE', 'WISDOM', 'COURAGE', 'FREEDOM', 'SUCCESS', 'JOURNEY',
    'BEAUTIFUL', 'WONDERFUL', 'AMAZING', 'FANTASTIC', 'BRILLIANT', 'EXCELLENT', 'PERFECT', 'AWESOME', 'INCREDIBLE', 'MAGNIFICENT'
  ],
  expert: [
    'EXTRAORDINARY', 'MAGNIFICENT', 'SPECTACULAR', 'PHENOMENAL', 'OUTSTANDING', 'EXCEPTIONAL', 'REMARKABLE', 'INCREDIBLE',
    'BREATHTAKING', 'UNFORGETTABLE', 'INSPIRATIONAL', 'REVOLUTIONARY', 'TRANSFORMATIVE', 'ENLIGHTENING', 'EMPOWERING'
  ]
};

const directions = [
  { row: 0, col: 1 },   // horizontal
  { row: 1, col: 0 },   // vertical
  { row: 1, col: 1 },   // diagonal
  { row: 1, col: -1 },  // diagonal-reverse
  { row: 0, col: -1 },  // horizontal-reverse
  { row: -1, col: 0 },  // vertical-reverse
  { row: -1, col: -1 }, // diagonal-reverse-up
  { row: -1, col: 1 }   // diagonal-up
];

export const generateWordSearchGrid = (
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  level: number
): { grid: WordSearchLetter[][], words: WordSearchWord[] } => {
  const settings = getGameSettings(difficulty);
  const gridSize = settings.gridSize;
  const wordCount = Math.min(settings.wordCount + Math.floor(level / 3), wordLists[difficulty].length);
  
  // Initialize empty grid
  const grid: WordSearchLetter[][] = [];
  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      grid[row][col] = {
        id: `${row}-${col}`,
        char: '',
        row,
        col,
        isHighlighted: false,
        isCorrect: false
      };
    }
  }

  // Select random words
  const availableWords = [...wordLists[difficulty]];
  const selectedWords: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    selectedWords.push(availableWords.splice(randomIndex, 1)[0]);
  }

  const placedWords: WordSearchWord[] = [];

  // Place words in grid
  selectedWords.forEach((word, index) => {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      
      if (canPlaceWord(grid, word, startRow, startCol, direction, gridSize)) {
        placeWord(grid, word, startRow, startCol, direction, index.toString());
        
        const endRow = startRow + direction.row * (word.length - 1);
        const endCol = startCol + direction.col * (word.length - 1);
        
        placedWords.push({
          id: index.toString(),
          word,
          found: false,
          startRow,
          startCol,
          endRow,
          endCol,
          direction: getDirectionName(direction)
        });
        
        placed = true;
      }
      attempts++;
    }
  });

  // Fill empty cells with random letters
  fillEmptyCells(grid, gridSize);

  return { grid, words: placedWords };
};

const canPlaceWord = (
  grid: WordSearchLetter[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { row: number; col: number },
  gridSize: number
): boolean => {
  const endRow = startRow + direction.row * (word.length - 1);
  const endCol = startCol + direction.col * (word.length - 1);

  // Check bounds
  if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
    return false;
  }

  // Check if cells are empty or contain the same letter
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    const cell = grid[row][col];
    
    if (cell.char !== '' && cell.char !== word[i]) {
      return false;
    }
  }

  return true;
};

const placeWord = (
  grid: WordSearchLetter[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { row: number; col: number },
  wordId: string
): void => {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    grid[row][col].char = word[i];
    grid[row][col].wordId = wordId;
  }
};

const fillEmptyCells = (grid: WordSearchLetter[][], gridSize: number): void => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col].char === '') {
        grid[row][col].char = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
};

const getDirectionName = (direction: { row: number; col: number }): 'horizontal' | 'vertical' | 'diagonal' | 'diagonal-reverse' => {
  if (direction.row === 0) return 'horizontal';
  if (direction.col === 0) return 'vertical';
  if (direction.row === direction.col) return 'diagonal';
  return 'diagonal-reverse';
};

export const getGameSettings = (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
  const settings = {
    beginner: { timeLimit: 300, gridSize: 10, wordCount: 5 },
    intermediate: { timeLimit: 240, gridSize: 12, wordCount: 7 },
    advanced: { timeLimit: 180, gridSize: 14, wordCount: 9 },
    expert: { timeLimit: 120, gridSize: 16, wordCount: 12 }
  };
  
  return settings[difficulty];
};

export const checkWordSelection = (
  selectedLetters: WordSearchLetter[],
  words: WordSearchWord[]
): WordSearchWord | null => {
  if (selectedLetters.length < 2) return null;

  const selectedWord = selectedLetters.map(letter => letter.char).join('');
  const reverseWord = selectedLetters.map(letter => letter.char).reverse().join('');

  for (const word of words) {
    if (word.found) continue;
    
    if (word.word === selectedWord || word.word === reverseWord) {
      // Verify the selection matches the word's position
      if (isValidWordSelection(selectedLetters, word)) {
        return word;
      }
    }
  }

  return null;
};

const isValidWordSelection = (
  selectedLetters: WordSearchLetter[],
  word: WordSearchWord
): boolean => {
  if (selectedLetters.length !== word.word.length) return false;

  const first = selectedLetters[0];
  const last = selectedLetters[selectedLetters.length - 1];

  // Check if selection matches word position (forward or backward)
  const matchesForward = 
    (first.row === word.startRow && first.col === word.startCol &&
     last.row === word.endRow && last.col === word.endCol);
     
  const matchesBackward = 
    (first.row === word.endRow && first.col === word.endCol &&
     last.row === word.startRow && last.col === word.startCol);

  return matchesForward || matchesBackward;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateScore = (
  foundWords: WordSearchWord[],
  timeRemaining: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): number => {
  const difficultyMultiplier = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
    expert: 3
  };

  const baseScore = foundWords.reduce((total, word) => total + word.word.length * 10, 0);
  const timeBonus = timeRemaining * 2;
  const difficultyBonus = baseScore * difficultyMultiplier[difficulty];

  return Math.floor(baseScore + timeBonus + difficultyBonus);
};