import React from "react";
import { Target, Clock, Gift, Zap, Star, Award } from "lucide-react";
import { Mission, MissionType } from "../types/game";

interface MissionPanelProps {
  missions: Mission[];
  isVisible: boolean;
  onClose: () => void;
}

const MissionPanel: React.FC<MissionPanelProps> = ({
  missions,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;
  const getMissionIcon = (type: MissionType) => {
    switch (type) {
      case "hourly_puzzle":
        return Clock;
      case "streak_challenge":
        return Zap;
      case "rare_puzzle_drop":
        return Gift;
      case "daily_quest":
        return Target;
      default:
        return Target;
    }
  };

  const getMissionColor = (type: MissionType) => {
    switch (type) {
      case "hourly_puzzle":
        return "text-blue-400";
      case "streak_challenge":
        return "text-emerald-400";
      case "rare_puzzle_drop":
        return "text-gold-400";
      case "daily_quest":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case "xp":
        return Zap;
      case "trait":
        return Star;
      case "badge":
        return Award;
      case "special_puzzle":
        return Gift;
      default:
        return Target;
    }
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
      <div className="bg-primary-800 rounded-xl shadow-2xl border border-gold-400/30 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-6 border-b border-gold-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-gold-400" />
              <div>
                <h2 className="text-2xl font-bold text-gold-300">
                  Active Missions
                </h2>
                <p className="text-gray-300">
                  Complete missions to earn rewards
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Missions List */}
        <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {missions.map((mission) => {
              const Icon = getMissionIcon(mission.type);
              const colorClass = getMissionColor(mission.type);
              const progressPercentage =
                (mission.progress / mission.maxProgress) * 100;

              return (
                <div
                  key={mission.id}
                  className={`bg-primary-700 rounded-lg p-4 border transition-all duration-200 ${
                    mission.isCompleted
                      ? "border-emerald-400/50 bg-emerald-900/20"
                      : "border-gold-400/30 hover:border-gold-400/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center ${
                          mission.isCompleted ? "bg-emerald-600" : ""
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            mission.isCompleted ? "text-white" : colorClass
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-bold ${
                            mission.isCompleted
                              ? "text-emerald-300"
                              : "text-white"
                          }`}
                        >
                          {mission.title}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {mission.description}
                        </p>
                      </div>
                    </div>
                    {mission.isCompleted && (
                      <div className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        COMPLETE
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>
                        {mission.progress} / {mission.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          mission.isCompleted
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : "bg-gradient-to-r from-gold-500 to-gold-400"
                        }`}
                        style={{
                          width: `${Math.min(100, progressPercentage)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-2">
                      Requirements:
                    </div>
                    <div className="space-y-1">
                      {mission.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              req.current >= req.target
                                ? "bg-emerald-400"
                                : "bg-gray-500"
                            }`}
                          />
                          <span className="text-gray-300">
                            {req.type.replace("_", " ").toUpperCase()}:{" "}
                            {req.current}/{req.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Rewards:</div>
                    <div className="flex flex-wrap gap-2">
                      {mission.rewards.map((reward, index) => {
                        const RewardIcon = getRewardIcon(reward.type);
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-1 bg-primary-600 rounded-full px-3 py-1 text-xs"
                          >
                            <RewardIcon className="w-3 h-3 text-gold-400" />
                            <span className="text-white">
                              {reward.description}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expiry Timer */}
                  {mission.expiryTime && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          Expires:{" "}
                          {new Date(mission.expiryTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {missions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active missions</p>
              <p className="text-sm mt-2">New missions will appear soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionPanel;
