import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import WordSearchGrid from './WordSearchGrid';
import WordSearchWordList from './WordSearchWordList';
import WordSearchTimer from './WordSearchTimer';
import WordSearchLevelComplete from './WordSearchLevelComplete';
import { WordSearchGameState, WordSearchLetter, WordSearchWord } from '../types/wordSearch';
import { generateWordSearchGrid, getGameSettings, checkWordSelection, calculateScore } from '../utils/wordSearchUtils';

const WordSearchGame: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<WordSearchGameState>({
    level: 1,
    difficulty: 'beginner',
    grid: [],
    words: [],
    foundWords: [],
    selectedLetters: [],
    score: 0,
    timeRemaining: 300,
    isComplete: false,
    isGameOver: false,
    gridSize: 10
  });

  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [incorrectSelection, setIncorrectSelection] = useState(false);
  const [gameMessage, setGameMessage] = useState('');

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = getGameSettings(gameState.difficulty);
    const { grid, words } = generateWordSearchGrid(gameState.difficulty, gameState.level);
    
    setGameState(prev => ({
      ...prev,
      grid,
      words,
      foundWords: [],
      selectedLetters: [],
      timeRemaining: settings.timeLimit,
      isComplete: false,
      isGameOver: false,
      gridSize: settings.gridSize
    }));
    
    setGameMessage(`Level ${gameState.level} - Find all ${words.length} words!`);
  }, [gameState.difficulty, gameState.level]);

  // Start game
  const handleStartGame = () => {
    setGameStarted(true);
    initializeGame();
  };

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameState.isComplete || gameState.isGameOver || gameState.timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          return { ...prev, timeRemaining: 0, isGameOver: true };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameState.isComplete, gameState.isGameOver, gameState.timeRemaining]);

  // Check for level completion
  useEffect(() => {
    if (gameState.foundWords.length === gameState.words.length && gameState.words.length > 0) {
      const finalScore = calculateScore(gameState.foundWords, gameState.timeRemaining, gameState.difficulty);
      setGameState(prev => ({
        ...prev,
        score: finalScore,
        isComplete: true
      }));
    }
  }, [gameState.foundWords.length, gameState.words.length, gameState.timeRemaining, gameState.difficulty]);

  // Handle letter selection
  const handleLetterSelect = useCallback((letter: WordSearchLetter) => {
    if (gameState.isComplete || gameState.isGameOver) return;

    setGameState(prev => ({
      ...prev,
      selectedLetters: [...prev.selectedLetters, letter]
    }));
  }, [gameState.isComplete, gameState.isGameOver]);

  // Handle selection completion
  const handleSelectionComplete = useCallback(() => {
    if (gameState.selectedLetters.length < 2) {
      handleSelectionClear();
      return;
    }

    const foundWord = checkWordSelection(gameState.selectedLetters, gameState.words);
    
    if (foundWord) {
      // Correct word found
      const updatedGrid = gameState.grid.map(row =>
        row.map(cell => {
          const isPartOfWord = gameState.selectedLetters.some(selected => selected.id === cell.id);
          return isPartOfWord ? { ...cell, isCorrect: true, isHighlighted: false } : cell;
        })
      );

      setGameState(prev => ({
        ...prev,
        grid: updatedGrid,
        foundWords: [...prev.foundWords, foundWord],
        selectedLetters: []
      }));

      setGameMessage(`Great! Found "${foundWord.word}"! 🎉`);
      
      // Play success sound
      if (soundEnabled) {
        playSuccessSound();
      }
    } else {
      // Incorrect selection
      setIncorrectSelection(true);
      setGameMessage('Not a valid word. Try again!');
      
      // Play error sound
      if (soundEnabled) {
        playErrorSound();
      }
      
      // Auto-clear after 0.5 seconds
      setTimeout(() => {
        handleSelectionClear();
        setIncorrectSelection(false);
      }, 500);
    }
  }, [gameState.selectedLetters, gameState.words, gameState.grid, soundEnabled]);

  // Handle selection clear
  const handleSelectionClear = useCallback(() => {
    const updatedGrid = gameState.grid.map(row =>
      row.map(cell => ({ ...cell, isHighlighted: false }))
    );

    setGameState(prev => ({
      ...prev,
      grid: updatedGrid,
      selectedLetters: []
    }));
  }, [gameState.grid]);

  // Handle next level
  const handleNextLevel = () => {
    const newLevel = gameState.level + 1;
    let newDifficulty = gameState.difficulty;
    
    // Increase difficulty every 5 levels
    if (newLevel % 5 === 1 && newLevel > 1) {
      const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
      const currentIndex = difficulties.indexOf(gameState.difficulty);
      if (currentIndex < difficulties.length - 1) {
        newDifficulty = difficulties[currentIndex + 1] as any;
      }
    }

    setGameState(prev => ({
      ...prev,
      level: newLevel,
      difficulty: newDifficulty,
      isComplete: false,
      score: 0
    }));

    setTimeout(() => {
      initializeGame();
    }, 100);
  };

  // Handle restart
  const handleRestart = () => {
    setGameState(prev => ({
      ...prev,
      level: 1,
      difficulty: 'beginner',
      score: 0,
      isComplete: false,
      isGameOver: false
    }));
    
    setTimeout(() => {
      initializeGame();
    }, 100);
  };

  // Sound effects
  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volume / 100 * 0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  };

  const playErrorSound = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(volume / 100 * 0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  };

  const isTimerWarning = gameState.timeRemaining <= 30 && gameState.timeRemaining > 0;

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">
              Word Search
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Find hidden words in the grid!
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Drag across letters to select words horizontally, vertically, or diagonally
            </p>
          </div>
          
          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Top Navigation */}
      <nav className="bg-blue-500 text-white shadow-lg" style={{ height: '60px' }}>
        <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
          {/* Left Section - Settings */}
          <div className="flex items-center space-x-4 min-w-[120px]">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                style={{ width: '32px', height: '32px' }}
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettings && (
                <div className="absolute top-12 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 text-gray-800">
                  {/* Volume Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Volume</label>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      disabled={!soundEnabled}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{volume}%</div>
                  </div>

                  {/* Restart Button */}
                  <button
                    onClick={handleRestart}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">Restart Game</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Title and Level */}
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="text-2xl font-bold leading-tight" style={{ fontSize: '24px' }}>
              Word Search
            </h1>
            <div className="text-lg font-semibold leading-tight" style={{ fontSize: '18px' }}>
              Level {gameState.level} - {gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}
            </div>
          </div>

          {/* Right Section - Timer */}
          <div className="flex items-center space-x-4 min-w-[120px] justify-end">
            <WordSearchTimer 
              timeRemaining={gameState.timeRemaining}
              isWarning={isTimerWarning}
            />
          </div>
        </div>
      </nav>

      {/* Main Game Area */}
      <div className="p-4 max-w-7xl mx-auto">
        {/* Game Message */}
        {gameMessage && (
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {gameMessage}
            </div>
          </div>
        )}

        {/* Game Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word List */}
          <div className="lg:col-span-1">
            <WordSearchWordList 
              words={gameState.words}
              foundWords={gameState.foundWords}
            />
          </div>

          {/* Game Grid */}
          <div className="lg:col-span-2">
            <WordSearchGrid
              grid={gameState.grid}
              selectedLetters={gameState.selectedLetters}
              onLetterSelect={handleLetterSelect}
              onSelectionComplete={handleSelectionComplete}
              onSelectionClear={handleSelectionClear}
              incorrectSelection={incorrectSelection}
            />
          </div>
        </div>

        {/* Game Over Screen */}
        {gameState.isGameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Time's Up!</h2>
              <p className="text-gray-600 mb-6">
                You found {gameState.foundWords.length} out of {gameState.words.length} words.
              </p>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Level Complete Screen */}
        {gameState.isComplete && (
          <WordSearchLevelComplete
            level={gameState.level}
            score={gameState.score}
            timeRemaining={gameState.timeRemaining}
            difficulty={gameState.difficulty}
            onNextLevel={handleNextLevel}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default WordSearchGame;