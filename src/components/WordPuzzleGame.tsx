import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Lightbulb } from 'lucide-react';
import LetterWheel from './LetterWheel';
import WordList from './WordList';
import GameStats from './GameStats';
import TopNavigation from './TopNavigation';
import { GameState, WordData, Letter } from '../types/game';
import { generateLetterSet, validateWord, getWordScore, playSound, wordDictionary } from '../utils/gameUtils';
import { getStoredProgress, saveProgress } from '../utils/storage';

const WordPuzzleGame: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
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
  const [volume, setVolume] = useState(75);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [incorrectSelection, setIncorrectSelection] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    initializeGame();
  };

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
    const minLength = 3;
    const maxLength = Math.min(8, 5 + gameState.level);

    // Get all words from our dictionary that can be formed with available letters
    for (let length = minLength; length <= maxLength; length++) {
      const wordsOfLength = wordDictionary[length] || [];
      
      for (const word of wordsOfLength) {
        const wordCounts = word.split('').reduce((acc, char) => {
          acc[char] = (acc[char] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const canForm = Object.entries(wordCounts).every(([char, count]) => 
          letterCounts[char] >= count
        );

        if (canForm) {
          availableWords.push({
            word: word,
            score: getWordScore(word, gameState.level),
            found: false
          });
        }
      }
    }
    
    return availableWords.sort((a, b) => a.word.length - b.word.length);
  };

  // Auto-submit when valid word is formed
  useEffect(() => {
    const checkAndSubmitWord = async () => {
      if (gameState.currentWord.length >= 3) {
        const isValid = await validateWord(gameState.currentWord);
        const wordData = gameState.availableWords.find(w => w.word === gameState.currentWord);
        const alreadyFound = gameState.discoveredWords.some(w => w.word === gameState.currentWord);
        
        if (isValid && wordData && !alreadyFound) {
          // Auto-submit valid word
          setTimeout(() => {
            handleWordSubmit();
          }, 500); // Small delay for better UX
        }
      }
    };

    checkAndSubmitWord();
  }, [gameState.currentWord]);

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
      showIncorrectFeedback('Words must be at least 3 letters long!');
      return;
    }

    const wordData = gameState.availableWords.find(w => w.word === gameState.currentWord);
    
    if (!wordData) {
      showIncorrectFeedback('Not a valid word!');
      return;
    }

    if (gameState.discoveredWords.some(w => w.word === gameState.currentWord)) {
      showIncorrectFeedback('Already found this word!');
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

    setGameMessage(`Excellent! +${wordData.score} points! 🎉`);
    
    if (gameState.soundEnabled) {
      playSound('success');
    }

    // Check if level is complete
    if (newDiscoveredWords.length === gameState.availableWords.length) {
      setGameMessage('🎊 Level Complete! Amazing work! 🎊');
      if (gameState.soundEnabled) {
        playSound('levelComplete');
      }
    }
  };

  const showIncorrectFeedback = (message: string) => {
    setGameMessage(message);
    setIncorrectSelection(true);
    
    if (gameState.soundEnabled) {
      playSound('error');
    }
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    // Auto-clear after 0.5s
    setTimeout(() => {
      handleClearSelection();
      setIncorrectSelection(false);
    }, 500);
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
      setGameMessage('No more hints available this level!');
      return;
    }

    const unFoundWords = gameState.availableWords.filter(w => !gameState.discoveredWords.some(d => d.word === w.word));
    if (unFoundWords.length === 0) return;

    const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
    setShowHint(true);
    setGameMessage(`💡 Hint: ${randomWord.word.slice(0, 2)}${'*'.repeat(randomWord.word.length - 2)}`);
    
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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleWalletConnect = () => {
    setIsWalletConnected(!isWalletConnected);
  };

  const handleRestart = () => {
    clearProgress();
    setGameState(prev => ({
      ...prev,
      level: 1,
      totalScore: 0
    }));
    initializeGame();
  };

  const progressPercentage = gameState.availableWords.length > 0 
    ? (gameState.discoveredWords.length / gameState.availableWords.length) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-purple-200">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
              Puzzle Rush
            </h1>
            <p className="text-purple-200 text-lg mb-2">
              Connect puzzle pieces to form words!
            </p>
            <p className="text-purple-300 text-sm mb-4">
              Drag across letters to create words and advance through levels
            </p>
          </div>
          
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Sample puzzle pieces for decoration */}
              {['P', 'U', 'Z', 'Z', 'L', 'E'].map((letter, index) => (
                <div key={index} className="relative">
                  <svg width="48" height="48" viewBox="0 0 56 56" className="mx-auto">
                    <defs>
                      <linearGradient id={`previewGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#fdba74" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 8 L24 8 Q28 4 32 8 Q36 12 32 16 L48 16 Q52 12 56 16 L56 32 Q60 36 56 40 Q52 44 56 48 L56 56 L40 56 Q36 60 32 56 Q28 52 32 48 L16 48 Q12 52 8 48 Q4 44 8 40 L8 24 Q4 20 8 16 Q12 12 8 8 Z"
                      fill={`url(#previewGradient-${index})`}
                      stroke="#a855f7"
                      strokeWidth="1"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{letter}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xl font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-orange-400 hover:border-orange-300 neon-glow"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen text-white">
      {/* Top Navigation */}
      <TopNavigation
        level={gameState.level}
        soundEnabled={gameState.soundEnabled}
        volume={volume}
        isWalletConnected={isWalletConnected}
        onVolumeChange={handleVolumeChange}
        onSoundToggle={toggleSound}
        onRestart={handleRestart}
        onWalletConnect={handleWalletConnect}
      />

      {/* Main Game Area */}
      <div className="pt-[60px] p-4 max-w-4xl mx-auto">
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
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              gameMessage.includes('Excellent!') || gameMessage.includes('Complete') ? 'bg-green-500 text-white neon-success' :
              gameMessage.includes('Not a valid') || gameMessage.includes('Already found') || gameMessage.includes('must be at least') ? 'bg-red-500 text-white neon-error animate-pulse' :
              'bg-orange-500 text-white neon-info'
            }`}>
              {gameMessage}
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Letter Wheel */}
          <div className="flex flex-col items-center">
            <div className={`transition-all duration-200 ${incorrectSelection ? 'animate-pulse' : ''}`}>
              <LetterWheel
                letters={gameState.letters}
                selectedLetters={gameState.selectedLetters}
                currentWord={gameState.currentWord}
                onLetterSelect={handleLetterSelect}
                onLetterDeselect={handleLetterDeselect}
                onWordSubmit={handleWordSubmit}
                onClearSelection={handleClearSelection}
                incorrectSelection={incorrectSelection}
              />
            </div>
            
            {/* Controls */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleHint}
                disabled={gameState.hintsUsed >= 3}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl neon-button focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-purple-900"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Hint ({3 - gameState.hintsUsed})</span>
              </button>
              
              {gameState.isComplete && (
                <button
                  onClick={handleNextLevel}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl neon-button focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-purple-900"
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
    </div>
  );
};

export default WordPuzzleGame;