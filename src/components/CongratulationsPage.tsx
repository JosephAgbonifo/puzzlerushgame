import React, { useState, useEffect } from 'react';
import { Trophy, Star, Clock, ArrowRight, Target } from 'lucide-react';

interface CongratulationsPageProps {
  level: number;
  score: number;
  timeBonus: number;
  wordsFound: number;
  totalWords: number;
  onContinue: () => void;
  isVisible: boolean;
}

const CongratulationsPage: React.FC<CongratulationsPageProps> = ({
  level,
  score,
  timeBonus,
  wordsFound,
  totalWords,
  onContinue,
  isVisible
}) => {
  const [countdown, setCountdown] = useState(5);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    // Show stats after initial animation
    const statsTimer = setTimeout(() => setShowStats(true), 800);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(statsTimer);
      clearInterval(countdownTimer);
    };
  }, [isVisible, onContinue]);

  useEffect(() => {
    if (isVisible) {
      setCountdown(5);
      setShowStats(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const completionPercentage = (wordsFound / totalWords) * 100;
  const isPerfect = wordsFound === totalWords;
  const isExcellent = completionPercentage >= 80;
  const isGood = completionPercentage >= 60;

  const getPerformanceMessage = () => {
    if (isPerfect) return "Perfect! 🎯";
    if (isExcellent) return "Excellent! ⭐";
    if (isGood) return "Well Done! 👍";
    return "Good Effort! 💪";
  };

  const getPerformanceColor = () => {
    if (isPerfect) return "text-gold-300";
    if (isExcellent) return "text-emerald-400";
    if (isGood) return "text-blue-400";
    return "text-purple-400";
  };

  const getNextLevelPreview = () => {
    const nextLevel = level + 1;
    if (nextLevel <= 3) return "Next: Beginner Challenge";
    if (nextLevel <= 6) return "Next: Intermediate Puzzle";
    if (nextLevel <= 10) return "Next: Advanced Challenge";
    if (nextLevel <= 15) return "Next: Expert Level";
    return "Next: Master Challenge";
  };

  return (
    <div className="congratulations-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="congratulations-card max-w-md w-full p-8 text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="w-16 h-16 text-gold-400 animate-bounce" />
              {isPerfect && (
                <Star className="w-6 h-6 text-gold-300 absolute -top-2 -right-2 animate-spin" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gold-300 mb-2">
            Level {level} Complete!
          </h1>
          <p className={`text-xl font-semibold ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="space-y-4 mb-6 animate-in slide-in-from-top-2 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-800 rounded-lg p-3 border border-gold-400/30">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Target className="w-4 h-4 text-gold-400" />
                  <span className="text-sm text-gray-300">Score</span>
                </div>
                <div className="text-xl font-bold text-gold-300">{score}</div>
              </div>
              
              <div className="bg-primary-800 rounded-lg p-3 border border-gold-400/30">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Time Bonus</span>
                </div>
                <div className="text-xl font-bold text-emerald-400">+{timeBonus}</div>
              </div>
            </div>

            <div className="bg-primary-800 rounded-lg p-4 border border-gold-400/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Words Found</span>
                <span className="text-lg font-bold text-white">
                  {wordsFound} / {totalWords}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="progress-bar h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className={`text-sm font-medium ${getPerformanceColor()}`}>
                  {Math.round(completionPercentage)}% Complete
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Next Level Preview */}
        <div className="mb-6 p-4 bg-primary-800/50 rounded-lg border border-gold-400/20">
          <p className="text-gray-300 text-sm mb-2">{getNextLevelPreview()}</p>
          <div className="flex items-center justify-center space-x-2 text-gold-400">
            <span className="text-sm font-medium">Get Ready!</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Continue Button & Countdown */}
        <div className="space-y-4">
          <button
            onClick={onContinue}
            className="w-full gold-accent py-3 px-6 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 neon-gold"
          >
            Continue to Level {level + 1}
          </button>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Auto-continuing in{' '}
              <span className="text-gold-400 font-bold text-lg">{countdown}</span>
              {' '}seconds
            </p>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
              <div 
                className="bg-gold-400 h-1 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsPage;