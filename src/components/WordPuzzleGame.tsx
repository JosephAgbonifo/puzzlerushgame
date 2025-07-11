import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Lightbulb, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import LetterWheel from './LetterWheel';
import WordList from './WordList';
import GameStats from './GameStats';
import { GameState, WordData, Letter } from '../types/game';
import { generateLetterSet, validateWord, getWordScore, playSound } from '../utils/gameUtils';
import { getStoredProgress, saveProgress } from '../utils/storage';

const WordPuzzleGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    letters: [],
    discoveredWords: [],
    availableWords: [],
    currentWord: '',
    selectedLetters: [],
    score: 0,
    totalScore: 0,
    hintsUsed: 0,
    soundEnabled: true,
    isComplete: false
  });

  const [showHint, setShowHint] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Load saved progress
  useEffect(() => {
    const savedProgress = getStoredProgress();
    if (savedProgress) {
      setGameState(prev => ({
        ...prev,
        level: savedProgress.level,
        totalScore: savedProgress.totalScore,
        soundEnabled: savedProgress.soundEnabled ?? true
      }));
    }
  }, []);

  // Save progress when game state changes
  useEffect(() => {
    if (!isLoading) {
      saveProgress({
        level: gameState.level,
        totalScore: gameState.totalScore,
        soundEnabled: gameState.soundEnabled
      });
    }
  }, [gameState.level, gameState.totalScore, gameState.soundEnabled, isLoading]);

  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    const letterSet = generateLetterSet(gameState.level);
    const availableWords = await getAvailableWords(letterSet.letters);
    
    setGameState(prev => ({
      ...prev,
      letters: letterSet.letters,
      availableWords,
      discoveredWords: [],
      currentWord: '',
      selectedLetters: [],
      score: 0,
      hintsUsed: 0,
      isComplete: false
    }));
    
    setShowHint(false);
    setGameMessage('Find all the words!');
    setIsLoading(false);
  }, [gameState.level]);

  const getAvailableWords = async (letters: Letter[]): Promise<WordData[]> => {
    const letterCounts = letters.reduce((acc, letter) => {
      acc[letter.char] = (acc[letter.char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const availableWords: WordData[] = [];
    const minLength = Math.max(3, gameState.level + 1);
    const maxLength = Math.min(8, gameState.level + 4);

    // Generate all possible words from the letters
    const possibleWords = await generatePossibleWords(letters.map(l => l.char), minLength, maxLength);
    
    for (const word of possibleWords) {
      const wordCounts = word.split('').reduce((acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const canForm = Object.entries(wordCounts).every(([char, count]) => 
        letterCounts[char] >= count
      );

      if (canForm && await validateWord(word)) {
        availableWords.push({
          word: word.toUpperCase(),
          score: getWordScore(word, gameState.level),
          found: false
        });
      }
    }

    return availableWords.sort((a, b) => a.word.length - b.word.length);
  };

  const generatePossibleWords = async (chars: string[], minLength: number, maxLength: number): Promise<string[]> => {
    const words: string[] = [];
    const usedChars = chars.map(c => c.toLowerCase());
    
    // Common English words for different lengths
    const commonWords = [
      // 3-letter words
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'way', 'art', 'car', 'cat', 'dog', 'eat', 'eye', 'far', 'fun', 'got', 'hot', 'job', 'lot', 'may', 'run', 'sun', 'ten', 'yes', 'yet', 'red', 'big', 'end', 'ask', 'men', 'try', 'own', 'war', 'oil', 'sit', 'set', 'win', 'low', 'cut', 'hit', 'law', 'arm', 'age', 'act', 'air', 'bit', 'box', 'cup', 'die', 'ear', 'egg', 'few', 'fly', 'gun', 'ice', 'joy', 'key', 'lie', 'map', 'net', 'pen', 'pot', 'row', 'sea', 'sky', 'top', 'toy', 'van', 'wet', 'zoo',
      // 4-letter words
      'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year', 'back', 'call', 'came', 'each', 'even', 'find', 'give', 'hand', 'high', 'keep', 'last', 'left', 'life', 'live', 'look', 'made', 'most', 'move', 'must', 'name', 'need', 'next', 'open', 'part', 'play', 'read', 'said', 'same', 'seem', 'show', 'side', 'tell', 'turn', 'used', 'want', 'ways', 'week', 'went', 'word', 'work', 'best', 'both', 'care', 'door', 'down', 'face', 'fact', 'feel', 'feet', 'fire', 'food', 'form', 'four', 'free', 'game', 'girl', 'gone', 'head', 'help', 'home', 'hope', 'hour', 'idea', 'kind', 'knew', 'land', 'late', 'line', 'list', 'love', 'mind', 'near', 'once', 'only', 'talk', 'team', 'told', 'took', 'tree', 'true', 'type', 'walk', 'wall', 'wife', 'wind', 'book', 'draw', 'hard', 'hear', 'hold', 'lost', 'mean', 'plan', 'real', 'room', 'save', 'sort', 'stay', 'stop', 'sure', 'term', 'test', 'tool', 'upon', 'warm', 'wear', 'blue', 'cold', 'cool', 'dark', 'deep', 'easy', 'fine', 'full', 'half', 'hurt', 'jump', 'kill', 'nice', 'note', 'pair', 'park', 'pass', 'past', 'path', 'pick', 'poor', 'push', 'race', 'rich', 'ride', 'rock', 'role', 'rule', 'safe', 'ship', 'shop', 'shot', 'sick', 'size', 'skin', 'soft', 'soon', 'star', 'task', 'teen', 'thus', 'town', 'trip', 'ugly', 'unit', 'user', 'vast', 'view', 'vote', 'wake', 'wave', 'wide', 'wild', 'wine', 'wise', 'wood', 'zone',
      // 5-letter words
      'about', 'after', 'again', 'black', 'could', 'first', 'found', 'great', 'group', 'house', 'large', 'never', 'other', 'place', 'point', 'right', 'small', 'sound', 'still', 'three', 'under', 'water', 'where', 'while', 'world', 'would', 'write', 'years', 'young', 'above', 'among', 'began', 'being', 'below', 'build', 'carry', 'clean', 'clear', 'close', 'every', 'final', 'given', 'going', 'green', 'happy', 'heard', 'heart', 'heavy', 'human', 'light', 'lived', 'local', 'might', 'music', 'night', 'north', 'often', 'order', 'paper', 'party', 'peace', 'Phone', 'piece', 'plant', 'power', 'press', 'price', 'quick', 'quiet', 'quite', 'reach', 'shall', 'short', 'since', 'space', 'speak', 'spent', 'stage', 'start', 'state', 'story', 'study', 'third', 'those', 'trade', 'tried', 'using', 'value', 'voice', 'watch', 'white', 'whole', 'whose', 'woman', 'words', 'worse', 'worst', 'worth', 'wrong', 'wrote', 'alive', 'alone', 'along', 'angry', 'array', 'basic', 'beach', 'birth', 'bread', 'break', 'bring', 'brown', 'chair', 'cheap', 'check', 'chest', 'child', 'china', 'chose', 'claim', 'class', 'climb', 'clock', 'cloud', 'couch', 'count', 'court', 'cover', 'crash', 'cream', 'cross', 'crowd', 'dance', 'death', 'depth', 'doubt', 'draft', 'drama', 'dream', 'dress', 'drink', 'drive', 'early', 'earth', 'eight', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'exact', 'exist', 'extra', 'faith', 'false', 'field', 'fight', 'floor', 'focus', 'force', 'fresh', 'front', 'fruit', 'glass', 'grand', 'grant', 'grass', 'guard', 'guess', 'guest', 'guide', 'horse', 'hotel', 'house', 'image', 'index', 'inner', 'input', 'issue', 'judge', 'knife', 'known', 'label', 'laugh', 'layer', 'learn', 'least', 'leave', 'legal', 'level', 'limit', 'logic', 'loose', 'lucky', 'lunch', 'magic', 'major', 'march', 'match', 'mayor', 'metal', 'minor', 'mixed', 'model', 'money', 'month', 'mouse', 'mouth', 'movie', 'noise', 'nurse', 'ocean', 'offer', 'panel', 'phase', 'phone', 'photo', 'piano', 'pilot', 'plain', 'plate', 'plaza', 'point', 'pound', 'prime', 'prior', 'proof', 'proud', 'queen', 'radio', 'raise', 'range', 'rapid', 'ratio', 'react', 'relax', 'rider', 'river', 'rough', 'round', 'route', 'royal', 'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shade', 'shake', 'shape', 'share', 'sharp', 'shift', 'shine', 'shock', 'shore', 'shown', 'sight', 'silly', 'sixth', 'sixty', 'skill', 'sleep', 'slice', 'slide', 'smile', 'smoke', 'snake', 'snow', 'solid', 'solve', 'sorry', 'south', 'spare', 'speed', 'spell', 'spend', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'steam', 'steel', 'stick', 'stock', 'stone', 'store', 'storm', 'strip', 'stuck', 'style', 'sugar', 'sweet', 'swing', 'table', 'taken', 'taste', 'teach', 'thank', 'their', 'theme', 'there', 'these', 'thick', 'thing', 'think', 'title', 'today', 'total', 'touch', 'tough', 'tower', 'track', 'train', 'treat', 'trend', 'truck', 'trust', 'truth', 'twice', 'uncle', 'under', 'union', 'until', 'upper', 'urban', 'usage', 'usual', 'video', 'virus', 'visit', 'waste', 'weigh', 'wheel', 'width', 'woman', 'worth', 'youth'
    ];

    for (const word of commonWords) {
      if (word.length >= minLength && word.length <= maxLength) {
        const wordChars = word.toLowerCase().split('');
        const charCounts = wordChars.reduce((acc, char) => {
          acc[char] = (acc[char] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const availableCharCounts = usedChars.reduce((acc, char) => {
          acc[char] = (acc[char] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const canForm = Object.entries(charCounts).every(([char, count]) => 
          availableCharCounts[char] >= count
        );

        if (canForm) {
          words.push(word);
        }
      }
    }

    return words;
  };

  const handleLetterSelect = (letter: Letter) => {
    if (gameState.selectedLetters.some(l => l.id === letter.id)) {
      return; // Already selected
    }

    const newSelectedLetters = [...gameState.selectedLetters, letter];
    const newCurrentWord = newSelectedLetters.map(l => l.char).join('');

    setGameState(prev => ({
      ...prev,
      selectedLetters: newSelectedLetters,
      currentWord: newCurrentWord
    }));

    if (gameState.soundEnabled) {
      playSound('select');
    }
  };

  const handleLetterDeselect = (letterId: string) => {
    const letterIndex = gameState.selectedLetters.findIndex(l => l.id === letterId);
    if (letterIndex === -1) return;

    const newSelectedLetters = gameState.selectedLetters.slice(0, letterIndex);
    const newCurrentWord = newSelectedLetters.map(l => l.char).join('');

    setGameState(prev => ({
      ...prev,
      selectedLetters: newSelectedLetters,
      currentWord: newCurrentWord
    }));
  };

  const handleWordSubmit = async () => {
    if (gameState.currentWord.length < 3) {
      setGameMessage('Words must be at least 3 letters long');
      return;
    }

    const wordData = gameState.availableWords.find(w => w.word === gameState.currentWord);
    
    if (!wordData) {
      setGameMessage('Not a valid word');
      if (gameState.soundEnabled) {
        playSound('error');
      }
      handleClearSelection();
      return;
    }

    if (gameState.discoveredWords.some(w => w.word === gameState.currentWord)) {
      setGameMessage('Word already found!');
      if (gameState.soundEnabled) {
        playSound('error');
      }
      handleClearSelection();
      return;
    }

    // Valid new word found
    const newDiscoveredWords = [...gameState.discoveredWords, { ...wordData, found: true }];
    const newScore = gameState.score + wordData.score;
    const newTotalScore = gameState.totalScore + wordData.score;

    setGameState(prev => ({
      ...prev,
      discoveredWords: newDiscoveredWords,
      score: newScore,
      totalScore: newTotalScore,
      currentWord: '',
      selectedLetters: [],
      isComplete: newDiscoveredWords.length === prev.availableWords.length
    }));

    setGameMessage(`Great! +${wordData.score} points`);
    
    if (gameState.soundEnabled) {
      playSound('success');
    }

    // Check if level is complete
    if (newDiscoveredWords.length === gameState.availableWords.length) {
      setGameMessage('Level Complete! 🎉');
      if (gameState.soundEnabled) {
        playSound('levelComplete');
      }
    }
  };

  const handleClearSelection = () => {
    setGameState(prev => ({
      ...prev,
      currentWord: '',
      selectedLetters: []
    }));
  };

  const handleHint = () => {
    if (gameState.hintsUsed >= 3) {
      setGameMessage('No more hints available');
      return;
    }

    const unFoundWords = gameState.availableWords.filter(w => !gameState.discoveredWords.some(d => d.word === w.word));
    if (unFoundWords.length === 0) return;

    const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
    setShowHint(true);
    setGameMessage(`Hint: ${randomWord.word.slice(0, 2)}${'*'.repeat(randomWord.word.length - 2)}`);
    
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));

    setTimeout(() => setShowHint(false), 3000);
  };

  const handleNextLevel = () => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1
    }));
    initializeGame();
  };

  const handleRestart = () => {
    initializeGame();
  };

  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const progressPercentage = gameState.availableWords.length > 0 
    ? (gameState.discoveredWords.length / gameState.availableWords.length) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">Puzzle Rush</h1>
          <p className="text-purple-600 font-semibold">Level {gameState.level}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSound}
            className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 hover:from-purple-200 hover:to-orange-200 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {gameState.soundEnabled ? (
              <Volume2 className="h-5 w-5 text-purple-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-purple-600" />
            )}
          </button>
          <button
            onClick={handleRestart}
            className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 hover:from-purple-200 hover:to-orange-200 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RotateCcw className="h-5 w-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Game Stats */}
      <GameStats
        score={gameState.score}
        totalScore={gameState.totalScore}
        level={gameState.level}
        foundWords={gameState.discoveredWords.length}
        totalWords={gameState.availableWords.length}
        progressPercentage={progressPercentage}
      />

      {/* Game Message */}
      {gameMessage && (
        <div className="text-center mb-4">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            gameMessage.includes('Great!') ? 'bg-green-100 text-green-800' :
            gameMessage.includes('Not a valid') || gameMessage.includes('already found') ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {gameMessage}
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Letter Wheel */}
        <div className="flex flex-col items-center">
          <LetterWheel
            letters={gameState.letters}
            selectedLetters={gameState.selectedLetters}
            currentWord={gameState.currentWord}
            onLetterSelect={handleLetterSelect}
            onLetterDeselect={handleLetterDeselect}
            onWordSubmit={handleWordSubmit}
            onClearSelection={handleClearSelection}
          />
          
          {/* Controls */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleHint}
              disabled={gameState.hintsUsed >= 3}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Hint ({3 - gameState.hintsUsed})</span>
            </button>
            
            {gameState.isComplete && (
              <button
                onClick={handleNextLevel}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Next Level</span>
              </button>
            )}
          </div>
        </div>

        {/* Word List */}
        <div>
          <WordList
            availableWords={gameState.availableWords}
            discoveredWords={gameState.discoveredWords}
            currentWord={gameState.currentWord}
          />
        </div>
      </div>
    </div>
  );
};

export default WordPuzzleGame;