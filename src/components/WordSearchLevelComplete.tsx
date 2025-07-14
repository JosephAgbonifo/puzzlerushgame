import React, { useState, useEffect } from 'react';
import { Trophy, Star, Clock, Target } from 'lucide-react';
import { formatTime } from '../utils/wordSearchUtils';

interface WordSearchLevelCompleteProps {
  level: number;
  score: number;
  timeRemaining: number;
  difficulty: string;
  onNextLevel: () => void;
  onRestart: () => void;
}

const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ['#FFE082', '#4CAF50', '#4A90E2', '#FF7F7F'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 opacity-80"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  );
};

const WordSearchLevelComplete: React.FC<WordSearchLevelCompleteProps> = ({
  level,
  score,
  timeRemaining,
  difficulty,
  onNextLevel,
  onRestart
}) => {
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCountdown(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showCountdown) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onNextLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showCountdown, onNextLevel]);

  const nextLevel = level + 1;
  const difficultyIncrease = 
    (level % 5 === 0 && difficulty !== 'expert') ? 
    `Difficulty increased to ${getNextDifficulty(difficulty)}!` : 
    null;

  const getNextDifficulty = (current: string): string => {
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = difficulties.indexOf(current);
    return difficulties[Math.min(currentIndex + 1, difficulties.length - 1)];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <Confetti />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-500">
        {/* Trophy Animation */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg animate-bounce">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Level Complete Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-pulse">
          Level Complete! 🎉
        </h2>
        
        <p className="text-lg text-gray-600 mb-6">
          Great job! Prepare for Level {nextLevel}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Score</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">{score}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Time Left</span>
            </div>
            <div className="text-2xl font-bold text-green-800 font-mono">
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Difficulty Increase Notification */}
        {difficultyIncrease && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Star className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {difficultyIncrease}
              </span>
            </div>
          </div>
        )}

        {/* Countdown */}
        {showCountdown && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Next level starts in:</p>
            <div className="text-4xl font-bold text-blue-600 animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onNextLevel}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            Start Next Level
          </button>
          
          <button
            onClick={onRestart}
            className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordSearchLevelComplete;