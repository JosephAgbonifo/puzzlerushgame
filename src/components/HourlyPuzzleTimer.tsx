import React, { useState, useEffect } from 'react';
import { Clock, Zap, Gift, Star } from 'lucide-react';

interface HourlyPuzzleTimerProps {
  nextPuzzleTime: Date;
  currentPuzzleExpiry: Date;
  isRarePuzzle?: boolean;
  onPuzzleExpired: () => void;
}

const HourlyPuzzleTimer: React.FC<HourlyPuzzleTimerProps> = ({
  nextPuzzleTime,
  currentPuzzleExpiry,
  isRarePuzzle = false,
  onPuzzleExpired
}) => {
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date().getTime();
      const nextTime = nextPuzzleTime.getTime();
      const expiryTime = currentPuzzleExpiry.getTime();

      setTimeUntilNext(Math.max(0, nextTime - now));
      setTimeUntilExpiry(Math.max(0, expiryTime - now));

      if (expiryTime <= now) {
        onPuzzleExpired();
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [nextPuzzleTime, currentPuzzleExpiry, onPuzzleExpired]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getUrgencyLevel = (timeLeft: number): 'normal' | 'warning' | 'critical' => {
    const minutes = timeLeft / (1000 * 60);
    if (minutes <= 5) return 'critical';
    if (minutes <= 15) return 'warning';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel(timeUntilExpiry);

  return (
    <div className="space-y-4">
      {/* Current Puzzle Timer */}
      <div className={`timer-container ${isRarePuzzle ? 'rare-puzzle' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isRarePuzzle ? (
              <Gift className="w-5 h-5 text-gold-400 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-gold-400" />
            )}
            <span className="text-sm font-medium text-gray-200">
              {isRarePuzzle ? 'Rare Puzzle Active!' : 'Current Puzzle'}
            </span>
            {isRarePuzzle && (
              <Star className="w-4 h-4 text-gold-400 animate-spin" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {urgencyLevel === 'critical' && (
              <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
            )}
            <span className={`text-lg font-bold ${
              urgencyLevel === 'critical' ? 'text-rose-400 animate-pulse' : 
              urgencyLevel === 'warning' ? 'text-orange-400' : 'text-gold-400'
            }`}>
              {formatTime(timeUntilExpiry)}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                isRarePuzzle ? 'bg-gradient-to-r from-gold-500 via-orange-400 to-rose-400 animate-pulse' :
                urgencyLevel === 'critical' ? 'bg-gradient-to-r from-rose-500 to-rose-400 animate-pulse' :
                urgencyLevel === 'warning' ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                'bg-gradient-to-r from-gold-500 to-gold-400'
              }`}
              style={{ 
                width: `${Math.max(0, (timeUntilExpiry / (60 * 60 * 1000)) * 100)}%` 
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Expires</span>
            {isRarePuzzle && (
              <span className="text-gold-400 font-medium animate-pulse">
                🎁 RARE DROP 🎁
              </span>
            )}
            <span>1 Hour</span>
          </div>
        </div>
      </div>

      {/* Next Puzzle Countdown */}
      <div className="bg-primary-800/50 rounded-lg p-4 border border-gold-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">Next Puzzle</span>
          </div>
          <span className="text-emerald-400 font-bold">
            {formatTime(timeUntilNext)}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          New puzzles drop every hour on the hour
        </div>
      </div>

      {/* Puzzle Stats */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-primary-800/30 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Today's Puzzles</div>
          <div className="text-lg font-bold text-gold-300">
            {new Date().getHours() + 1}/24
          </div>
        </div>
        <div className="bg-primary-800/30 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Rare Chance</div>
          <div className="text-lg font-bold text-rose-400">10%</div>
        </div>
      </div>
    </div>
  );
};

export default HourlyPuzzleTimer;