import React from 'react';
import { Trophy, Target, Star } from 'lucide-react';

interface GameStatsProps {
  score: number;
  totalScore: number;
  level: number;
  foundWords: number;
  totalWords: number;
  progressPercentage: number;
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  totalScore,
  level,
  foundWords,
  totalWords,
  progressPercentage
}) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-gold-400" />
            <span className="text-sm font-medium text-gray-200">Level Score</span>
          </div>
          <div className="text-2xl font-bold text-gold-300">{score}</div>
        </div>

        {/* Total Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="h-5 w-5 text-gold-500" />
            <span className="text-sm font-medium text-gray-200">Total Score</span>
          </div>
          <div className="text-2xl font-bold text-gold-300">{totalScore}</div>
        </div>

        {/* Level */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-gold-500" />
            <span className="text-sm font-medium text-gray-200">Level</span>
          </div>
          <div className="text-2xl font-bold text-gold-300">{level}</div>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-200">Progress</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {foundWords} / {totalWords}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="progress-bar h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;