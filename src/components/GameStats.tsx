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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Level Score</span>
          </div>
          <div className="text-2xl font-bold text-orange-800">{score}</div>
        </div>

        {/* Total Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Total Score</span>
          </div>
          <div className="text-2xl font-bold text-yellow-800">{totalScore}</div>
        </div>

        {/* Level */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Level</span>
          </div>
          <div className="text-2xl font-bold text-purple-800">{level}</div>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {foundWords} / {totalWords}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;