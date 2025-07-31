import React, { useState, useEffect } from "react";
import { Clock, Zap, Gift, Star } from "lucide-react";

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
  onPuzzleExpired,
}) => {
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const next = nextPuzzleTime.getTime();
      const expiry = currentPuzzleExpiry.getTime();

      setTimeUntilNext(Math.max(0, next - now));
      setTimeUntilExpiry(Math.max(0, expiry - now));

      if (expiry <= now) {
        onPuzzleExpired();
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [nextPuzzleTime, currentPuzzleExpiry, onPuzzleExpired]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  const getUrgencyLevel = (ms: number) => {
    const mins = ms / (1000 * 60);
    if (mins <= 5) return "critical";
    if (mins <= 15) return "warning";
    return "normal";
  };

  const urgency = getUrgencyLevel(timeUntilExpiry);
  const progressPercent = Math.max(
    0,
    (timeUntilExpiry / (60 * 60 * 1000)) * 100
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Current Puzzle */}
        <div
          className={`rounded-lg md:p-5 bg-purple-950 h-20 flex flex-col justify-between ${
            isRarePuzzle ? "rare-puzzle" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-brown">
              {isRarePuzzle ? (
                <>
                  <Gift className="w-4 h-4 text-yellow-400 animate-pulse" />
                  Rare Puzzle Active!
                  <Star className="w-3 h-3 text-yellow-400 animate-spin" />
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Current Puzzle Active
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {urgency === "critical" && (
                <Zap className="w-4 h-4 text-red-400 animate-pulse" />
              )}
              <span
                className={`text-sm font-bold ${
                  urgency === "critical"
                    ? "text-red-400 animate-pulse"
                    : urgency === "warning"
                    ? "text-orange-400"
                    : "text-yellow-400"
                }`}
              >
                {formatTime(timeUntilExpiry)}
              </span>
            </div>
          </div>
          <div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  isRarePuzzle
                    ? "bg-gradient-to-r from-orange-600 via-orange-400 to-red-400 animate-pulse"
                    : urgency === "critical"
                    ? "bg-gradient-to-r from-red-500 to-red-400 animate-pulse"
                    : "bg-gradient-to-r from-orange-500 to-yellow-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Expires</span>
              {isRarePuzzle && (
                <span className="text-yellow-400 font-semibold animate-pulse">
                  🎁 RARE DROP
                </span>
              )}
              <span>1 Hour</span>
            </div>
          </div>
        </div>

        {/* Next Puzzle */}
        <div className="bg-amber-600 text-amber-950 rounded-lg h-16 flex flex-col items-center justify-between border border-yellow-400/20">
          <div className="flex items-center justify-between w-4/5 m-auto h-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Next Puzzle</span>
            </div>
            <span className="bg-amber-950 text-orange-400 p-2 rounded-lg font-bold text-sm">
              {formatTime(timeUntilNext)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:grid grid-cols-2 gap-4 text-center">
        <div className="bg-primary-800/30 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Today's Puzzles</div>
          <div className="text-lg font-bold text-yellow-300">
            {new Date().getHours() + 1}/24
          </div>
        </div>
        <div className="bg-primary-800/30 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Rare Chance</div>
          <div className="text-lg font-bold text-rose-400">10%</div>
        </div>
      </div>
    </div>
  );
};

export default HourlyPuzzleTimer;
