import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  Wallet,
  Home,
  BookText,
  User,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { PlayerProfile } from "../types/game";

interface TopNavigationProps {
  level: number;
  onSetView: (view: "home" | "words" | "profile" | "settings") => void;
  soundEnabled: boolean;
  volume: number;
  isWalletConnected: boolean;
  onVolumeChange: (volume: number) => void;
  onSoundToggle: () => void;
  onRestart: () => void;
  onWalletConnect: () => void;
  onShowProfile: () => void;
  onShowMissions: () => void;
  playerProfile: PlayerProfile | null;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  soundEnabled,
  volume,
  onVolumeChange,
  onSoundToggle,
  onRestart,
  onShowProfile,
  onShowMissions,
  onSetView,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { publicKey, disconnect, connect } = useWallet();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRestart = () => {
    setShowRestartConfirm(true);
    setShowSettings(false);
  };

  const confirmRestart = () => {
    onRestart();
    setShowRestartConfirm(false);
  };

  const cancelRestart = () => setShowRestartConfirm(false);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[300px] h-[50px] bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 shadow-lg rounded-xl z-50">
        <div className="flex items-center justify-between h-full">
          {/* Left: Settings */}
          {/* View Buttons */}
          <div className="grid grid-cols-4 gap-2 w-full">
            <button
              onClick={() => {
                onSetView("home");
                setShowSettings(false);
              }}
              className="flex justify-center flex-col items-center text-xs text-white hover:scale-105 focus:outline-none"
            >
              <Home className="w-5 h-5 mb-1 text-blue-400" />
            </button>
            <button
              onClick={() => {
                onSetView("words");
                setShowSettings(false);
              }}
              className="flex flex-col justify-center items-center text-xs text-white hover:scale-105 focus:outline-none"
            >
              <BookText className="w-5 h-5 mb-1 text-green-400" />
            </button>
            <button
              onClick={() => {
                onSetView("profile");
                setShowSettings(false);
              }}
              className="flex flex-col justify-center items-center text-xs text-white hover:scale-105 focus:outline-none"
            >
              <User className="w-5 h-5 mb-1 text-pink-400" />
            </button>{" "}
            <div
              className="relative flex items-center justify-center"
              ref={settingsRef}
            >
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-orange-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-400"
                aria-label="Settings"
                aria-expanded={showSettings}
                aria-haspopup="true"
              >
                <Settings className="w-4 h-4 text-gold-300" />
              </button>
            </div>
            {showSettings && (
              <div className="absolute bottom-14 left-32 -translate-x-1/2 w-64 bg-gray-900 rounded-xl shadow-xl border border-yellow-400/30 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
                {/* Volume Control */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="volume-slider"
                      className="text-sm font-medium text-gray-200"
                    >
                      Volume
                    </label>
                    <button
                      onClick={onSoundToggle}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-gold-400"
                      aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-gold-300" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="volume-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      disabled={!soundEnabled}
                      className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                    <div
                      className="absolute top-2 left-0 h-2 bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg pointer-events-none"
                      style={{ width: `${soundEnabled ? volume : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{volume}%</div>
                </div>

                <button
                  onClick={onShowProfile}
                  className="p-2 rounded-lg text-amber-500 block hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  aria-label="View profile"
                >
                  Profile
                </button>

                <button
                  onClick={onShowMissions}
                  className="p-2 rounded-full text-amber-500 block hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  aria-label="View missions"
                >
                  Missions
                </button>

                <div className="flex w-full mb-3 items-center gap-2">
                  <button
                    onClick={publicKey ? disconnect : connect}
                    className={clsx(
                      "h-8 px-3 w-full justify-center flex items-center gap-2 rounded-lg hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                      publicKey
                        ? "bg-emerald-600 text-white focus:ring-emerald-400"
                        : "bg-yellow-500 text-black focus:ring-gold-400"
                    )}
                    aria-label={
                      publicKey ? "Wallet connected" : "Connect wallet"
                    }
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {publicKey ? "Connected" : "Connect"}
                    </span>
                  </button>
                </div>

                {/* Restart */}
                <button
                  onClick={handleRestart}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-800 text-white rounded-lg hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm font-medium">Restart Game</span>
                </button>
              </div>
            )}
          </div>

          {/* Right side can be used later */}
          <div className="flex items-center gap-2"></div>
        </div>
      </nav>

      {/* Restart Confirm Dialog */}
      {showRestartConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-primary-800 rounded-xl shadow-2xl border border-gold-400/30 p-6 max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Restart Game?</h3>
            <p className="text-gray-200 mb-6">
              This will reset your current progress and start from Level 1. Are
              you sure?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelRestart}
                className="flex-1 px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestart}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
