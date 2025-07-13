import React, { useState, useRef, useEffect } from 'react';
import { Settings, Volume2, VolumeX, RotateCcw, Wallet, Wifi, WifiOff } from 'lucide-react';

interface TopNavigationProps {
  level: number;
  soundEnabled: boolean;
  volume: number;
  isWalletConnected: boolean;
  onVolumeChange: (volume: number) => void;
  onSoundToggle: () => void;
  onRestart: () => void;
  onWalletConnect: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  level,
  soundEnabled,
  volume,
  isWalletConnected,
  onVolumeChange,
  onSoundToggle,
  onRestart,
  onWalletConnect
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRestart = () => {
    setShowRestartConfirm(true);
    setShowSettings(false);
  };

  const confirmRestart = () => {
    onRestart();
    setShowRestartConfirm(false);
  };

  const cancelRestart = () => {
    setShowRestartConfirm(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 border-b border-purple-600 shadow-lg">
        <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
          {/* Left Section - Settings */}
          <div className="flex items-center space-x-4 min-w-[120px]">
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700 hover:bg-purple-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-purple-900"
                aria-label="Settings"
                aria-expanded={showSettings}
                aria-haspopup="true"
              >
                <Settings className="w-4 h-4 text-orange-300 hover:text-orange-200 transition-colors duration-200" />
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute top-12 left-0 w-64 bg-purple-800 rounded-xl shadow-xl border border-purple-600 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* Volume Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-purple-200" htmlFor="volume-slider">
                        Volume
                      </label>
                      <button
                        onClick={onSoundToggle}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-orange-300" />
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
                        className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-orange-400"
                        aria-label="Volume level"
                      />
                      <div 
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg pointer-events-none transition-all duration-200"
                        style={{ width: `${soundEnabled ? volume : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-purple-300 mt-1">{volume}%</div>
                  </div>

                  {/* Restart Button */}
                  <button
                    onClick={handleRestart}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-purple-800"
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent leading-tight">
              Puzzle Rush
            </h1>
            <div className="text-lg font-semibold text-purple-200 leading-tight">
              Level {level}
            </div>
          </div>

          {/* Right Section - Wallet */}
          <div className="flex items-center space-x-4 min-w-[120px] justify-end">
            <div className="flex items-center space-x-2">
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-1">
                {isWalletConnected ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
                <div className={`w-2 h-2 rounded-full ${
                  isWalletConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`} />
              </div>

              {/* Wallet Connect Button */}
              <button
                onClick={onWalletConnect}
                className={`h-8 px-3 flex items-center space-x-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-900 ${
                  isWalletConnected
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-400'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white focus:ring-orange-400'
                }`}
                aria-label={isWalletConnected ? 'Wallet connected' : 'Connect wallet'}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {isWalletConnected ? 'Connected' : 'Connect'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-purple-800 rounded-xl shadow-2xl border border-purple-600 p-6 max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Restart Game?</h3>
            <p className="text-purple-200 mb-6">
              This will reset your current progress and start from Level 1. Are you sure?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelRestart}
                className="flex-1 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestart}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
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