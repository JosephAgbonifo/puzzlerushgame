import React from "react";
import { Trophy, Target, Star } from "lucide-react";

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
  progressPercentage,
}) => {
  return (
    <div className="block p-6 relative z-10 bg-gradient-to-l from-purple-950 via-purple-900 to-purple-950 rounded-xl shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Level Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300 font-medium">
              Level Score
            </span>
          </div>
          <div className="text-sm font-bold text-yellow-300">{score}</div>
        </div>

        {/* Total Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-300 font-medium">
              Total Score
            </span>
          </div>
          <div className="text-sm font-bold text-yellow-300">{totalScore}</div>
        </div>

        {/* Level */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-300 font-medium">
              Current Level
            </span>
          </div>
          <div className="text-sm font-bold text-yellow-300">{level}</div>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="text-sm text-gray-300 font-medium mb-1">Progress</div>
          <div className="text-sm font-semibold text-white">
            {foundWords} / {totalWords}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-lime-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
