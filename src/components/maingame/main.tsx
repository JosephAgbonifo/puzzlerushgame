import { useEffect, useState, useCallback } from "react";
import { Lightbulb } from "lucide-react"; //, User, Target
import LetterWheel from "../LetterWheel";
import WordList from "../WordList";
import GameStats from "../GameStats";
import TopNavigation from "../TopNavigation";
import HourlyPuzzleTimer from "../HourlyPuzzleTimer";
import CongratulationsPage from "../CongratulationsPage";
import PlayerProfile from "../PlayerProfile";
import MissionPanel from "../MissionPanel";
import { useView } from "../../context/ViewProvider";

import {
  getStoredProgress,
  saveProgress,
  getPlayerProfile,
  savePlayerProfile,
} from "../../utils/storage";
import { PuzzleService, TraitService } from "../../services/puzzleService";
import { HoneycombService } from "../../services/honeycomb";
import {
  GameState,
  WordData,
  Letter,
  HourlyPuzzle,
  PlayerProfile as PlayerProfileType,
  Mission,
  PuzzleAttempt,
} from "../../types/game";
import {
  validateWord,
  getWordScore,
  playSound,
  wordDictionary,
} from "../../utils/gameUtils"; // generateLetterSet,

export default function PuzzleRushGame() {
  // const [showHint, setShowHint] = useState(false);
  // const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    letters: [],
    discoveredWords: [],
    availableWords: [],
    currentWord: "",
    selectedLetters: [],
    score: 0,
    totalScore: 0,
    hintsUsed: 0,
    soundEnabled: true,
    isComplete: false,
  });
  const [gameMessage, setGameMessage] = useState("");
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [incorrectSelection, setIncorrectSelection] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);

  // New state for hourly puzzle system
  const [currentPuzzle, setCurrentPuzzle] = useState<HourlyPuzzle | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfileType | null>(
    null
  );

  const [puzzleStartTime, setPuzzleStartTime] = useState<Date | null>(null);

  // Services
  const puzzleService = PuzzleService.getInstance();
  const traitService = TraitService.getInstance();
  const honeycombService = new HoneycombService(
    import.meta.env.VITE_HONEYCOMB_API_KEY || ""
  );

  // const handleStartGame = () => {
  //   setGameStarted(true);
  //   // initializeGame();
  // };

  // Initialize game
  useEffect(() => {
    initializeHourlyPuzzleSystem();
  }, []);

  // Load saved progress
  useEffect(() => {
    const savedProgress = getStoredProgress();
    const savedProfile = getPlayerProfile();

    if (savedProgress) {
      setGameState((prev) => ({
        ...prev,
        level: savedProgress.level,
        totalScore: savedProgress.totalScore,
        soundEnabled: savedProgress.soundEnabled ?? true,
      }));
    }

    if (savedProfile) {
      setPlayerProfile(savedProfile);
    } else {
      // Create new player profile
      const newProfile: PlayerProfileType = {
        id: `player_${Date.now()}`,
        username: "Puzzle Master",
        totalXP: 0,
        level: 1,
        traits: [],
        puzzleHistory: [],
        streakCount: 0,
        longestStreak: 0,
        badges: [],
        reputation: 0,
      };
      setPlayerProfile(newProfile);
      savePlayerProfile(newProfile);
    }
  }, []);

  // Save progress when game state changes
  useEffect(() => {
    if (!isLoading) {
      saveProgress({
        level: gameState.level,
        totalScore: gameState.totalScore,
        soundEnabled: gameState.soundEnabled,
      });
    }
  }, [
    gameState.level,
    gameState.totalScore,
    gameState.soundEnabled,
    isLoading,
  ]);

  useEffect(() => {
    if (playerProfile) {
      savePlayerProfile(playerProfile);
    }
  }, [playerProfile]);

  const initializeHourlyPuzzleSystem = useCallback(async () => {
    setIsLoading(true);

    // Get current hourly puzzle
    const puzzle = puzzleService.getCurrentPuzzle();
    setCurrentPuzzle(puzzle);

    if (puzzle) {
      const availableWords = await getAvailableWords(puzzle.letters);

      setGameState((prev) => ({
        ...prev,
        letters: puzzle.letters,
        availableWords,
        discoveredWords: [],
        currentWord: "",
        selectedLetters: [],
        score: 0,
        hintsUsed: 0,
        isComplete: false,
      }));

      setPuzzleStartTime(new Date());

      // Create Honeycomb mission
      try {
        await honeycombService.createMission(puzzle.id, {
          category: puzzle.category,
          difficulty: puzzle.difficulty,
          xpReward: puzzle.xpReward,
        });
      } catch (error) {
        console.warn("Failed to create Honeycomb mission:", error);
      }
    }

    // Initialize missions
    initializeMissions();

    // setShowHint(false);
    setGameMessage(
      puzzle?.isRare
        ? "🎁 Rare Puzzle Drop! Triple XP! 🎁"
        : "Find all the words in this hourly puzzle!"
    );
    setIsLoading(false);
  }, []);

  const initializeMissions = () => {
    const missions: Mission[] = [
      {
        id: "hourly_puzzle",
        type: "hourly_puzzle",
        title: "Hourly Challenge",
        description: "Complete the current hourly puzzle",
        requirements: [{ type: "solve_puzzles", target: 1, current: 0 }],
        rewards: [{ type: "xp", value: 100, description: "100 XP" }],
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        expiryTime: currentPuzzle?.expiryTime,
      },
      {
        id: "streak_challenge",
        type: "streak_challenge",
        title: "Streak Master",
        description: "Solve 5 hourly puzzles in a row",
        requirements: [
          {
            type: "maintain_streak",
            target: 5,
            current: playerProfile?.streakCount || 0,
          },
        ],
        rewards: [
          {
            type: "trait",
            value: "streak_master",
            description: "Streak Master Trait",
          },
          { type: "xp", value: 500, description: "500 Bonus XP" },
        ],
        progress: playerProfile?.streakCount || 0,
        maxProgress: 5,
        isCompleted: (playerProfile?.streakCount || 0) >= 5,
      },
    ];

    setActiveMissions(missions);
  };

  const getAvailableWords = async (letters: Letter[]): Promise<WordData[]> => {
    const letterCounts = letters.reduce((acc, letter) => {
      acc[letter.char] = (acc[letter.char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const availableWords: WordData[] = [];
    const minLength = 3;
    const maxLength = Math.min(8, 5 + gameState.level);

    // Get all words from our dictionary that can be formed with available letters
    for (let length = minLength; length <= maxLength; length++) {
      const allowedLengths = [3, 4, 5, 6, 7, 8] as const;
      type WordLength = (typeof allowedLengths)[number];

      function getWords(length: number): string[] {
        if (allowedLengths.includes(length as WordLength)) {
          return wordDictionary[length as WordLength];
        }
        return [];
      }

      const wordsOfLength = getWords(length);

      for (const word of wordsOfLength) {
        const wordCounts = word.split("").reduce((acc, char) => {
          acc[char] = (acc[char] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const canForm = Object.entries(wordCounts).every(
          ([char, count]) => letterCounts[char] >= count
        );

        if (canForm) {
          availableWords.push({
            word: word,
            score: getWordScore(word, gameState.level),
            found: false,
          });
        }
      }
    }

    return availableWords.sort((a, b) => a.word.length - b.word.length);
  };

  // Auto-submit and auto-clear system
  useEffect(() => {
    const checkAndSubmitWord = async () => {
      if (gameState.currentWord.length >= 3 && currentPuzzle?.isActive) {
        const isValid = await validateWord(gameState.currentWord);
        const wordData = gameState.availableWords.find(
          (w) => w.word === gameState.currentWord
        );
        const alreadyFound = gameState.discoveredWords.some(
          (w) => w.word === gameState.currentWord
        );

        if (isValid && wordData && !alreadyFound) {
          // Auto-submit valid word
          setTimeout(() => {
            handleWordSubmit();
          }, 500); // Small delay for better UX
        } else if (gameState.currentWord.length >= 3) {
          // Auto-clear invalid words after 0.5s
          setTimeout(() => {
            showIncorrectFeedback("Invalid word - auto clearing!");
          }, 500);
        }
      }
    };

    checkAndSubmitWord();
  }, [gameState.currentWord, currentPuzzle?.isActive]);

  const handleWordSubmit = async () => {
    if (gameState.currentWord.length < 3 || !currentPuzzle?.isActive) {
      showIncorrectFeedback("Words must be at least 3 letters long!");
      return;
    }

    const wordData = gameState.availableWords.find(
      (w) => w.word === gameState.currentWord
    );

    if (!wordData) {
      showIncorrectFeedback("Not a valid word!");
      return;
    }

    if (
      gameState.discoveredWords.some((w) => w.word === gameState.currentWord)
    ) {
      showIncorrectFeedback("Already found this word!");
      return;
    }

    // Valid new word found
    const baseXP = wordData.score;
    const traitMultipliedXP = playerProfile
      ? traitService.calculateXPWithTraits(baseXP, playerProfile.traits, {
          isStreak: playerProfile.streakCount > 0,
        })
      : baseXP;
    const finalXP = currentPuzzle?.isRare
      ? traitMultipliedXP * 3
      : traitMultipliedXP;

    const newDiscoveredWords = [
      ...gameState.discoveredWords,
      { ...wordData, found: true },
    ];
    const newScore = gameState.score + finalXP;
    const newTotalScore = gameState.totalScore + finalXP;

    setGameState((prev) => ({
      ...prev,
      discoveredWords: newDiscoveredWords,
      score: newScore,
      totalScore: newTotalScore,
      currentWord: "",
      selectedLetters: [],
      isComplete: newDiscoveredWords.length === prev.availableWords.length,
    }));

    setGameMessage(
      `Excellent! +${finalXP} XP! ${currentPuzzle?.isRare ? "🎁" : "🎉"}`
    );

    if (gameState.soundEnabled) {
      playSound("success");
    }

    // Check if level is complete
    if (newDiscoveredWords.length === gameState.availableWords.length) {
      await handlePuzzleCompletion();
    }
  };

  const handlePuzzleCompletion = async () => {
    if (!currentPuzzle || !playerProfile || !puzzleStartTime) return;

    const completionTime = Math.floor(
      (new Date().getTime() - puzzleStartTime.getTime()) / 1000
    );
    const accuracy = Math.floor(
      (gameState.discoveredWords.length / gameState.availableWords.length) * 100
    );

    // Create puzzle attempt record
    const puzzleAttempt: PuzzleAttempt = {
      puzzleId: currentPuzzle.id,
      playerId: playerProfile.id,
      startTime: puzzleStartTime,
      endTime: new Date(),
      wordsFound: gameState.discoveredWords.map((w) => w.word),
      accuracy,
      completionTime,
      xpEarned: gameState.score,
      traits: [],
    };

    // Check for new traits
    const newTraits = traitService.checkAndAwardTraits(playerProfile, {
      ...puzzleAttempt,
      puzzleReleaseTime: currentPuzzle.releaseTime,
    });

    // Update player profile
    const updatedProfile: PlayerProfileType = {
      ...playerProfile,
      totalXP: playerProfile.totalXP + gameState.score,
      level: Math.floor((playerProfile.totalXP + gameState.score) / 1000) + 1,
      traits: [...playerProfile.traits, ...newTraits],
      puzzleHistory: [...playerProfile.puzzleHistory, puzzleAttempt],
      streakCount: accuracy === 100 ? playerProfile.streakCount + 1 : 0,
      longestStreak: Math.max(
        playerProfile.longestStreak,
        accuracy === 100 ? playerProfile.streakCount + 1 : 0
      ),
      reputation: playerProfile.reputation + Math.floor(gameState.score / 10),
    };

    setPlayerProfile(updatedProfile);

    // Update Honeycomb
    try {
      if (playerProfile.walletAddress) {
        await honeycombService.completeMission(
          currentPuzzle.id,
          playerProfile.walletAddress,
          {
            completionTime,
            accuracy,
            wordsFound: gameState.discoveredWords.map((w) => w.word),
            xpEarned: gameState.score,
          }
        );

        if (newTraits.length > 0) {
          await honeycombService.updatePlayerTraits(
            playerProfile.walletAddress,
            updatedProfile.traits
          );
        }
      }
    } catch (error) {
      console.warn("Failed to update Honeycomb:", error);
    }

    setGameMessage("🎊 Puzzle Complete! Amazing work! 🎊");
    if (gameState.soundEnabled) {
      playSound("levelComplete");
    }

    // Show congratulations page
    setTimeout(() => {
      setShowCongratulations(true);
    }, 1000);
  };

  const showIncorrectFeedback = (message: string) => {
    setGameMessage(message);
    setIncorrectSelection(true);

    if (gameState.soundEnabled) {
      playSound("error");
    }

    // Haptic feedback for mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }

    // Auto-clear selection after 0.5s
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        currentWord: "",
        selectedLetters: [],
      }));
      setIncorrectSelection(false);
    }, 500);
  };

  const handleLetterSelect = (letter: Letter) => {
    if (gameState.selectedLetters.some((l) => l.id === letter.id)) {
      return; // Already selected
    }

    const newSelectedLetters = [...gameState.selectedLetters, letter];
    const newCurrentWord = newSelectedLetters.map((l) => l.char).join("");

    setGameState((prev) => ({
      ...prev,
      selectedLetters: newSelectedLetters,
      currentWord: newCurrentWord,
    }));

    if (gameState.soundEnabled) {
      playSound("select");
    }
  };

  const handleLetterDeselect = (letterId: string) => {
    const letterIndex = gameState.selectedLetters.findIndex(
      (l) => l.id === letterId
    );
    if (letterIndex === -1) return;

    const newSelectedLetters = gameState.selectedLetters.slice(0, letterIndex);
    const newCurrentWord = newSelectedLetters.map((l) => l.char).join("");

    setGameState((prev) => ({
      ...prev,
      selectedLetters: newSelectedLetters,
      currentWord: newCurrentWord,
    }));
  };

  const handleHint = () => {
    if (gameState.hintsUsed >= 3) {
      setGameMessage("No more hints available this level!");
      return;
    }

    const unFoundWords = gameState.availableWords.filter(
      (w) => !gameState.discoveredWords.some((d) => d.word === w.word)
    );
    if (unFoundWords.length === 0) return;

    const randomWord =
      unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
    // setShowHint(true);
    setGameMessage(
      `💡 Hint: ${randomWord.word.slice(0, 2)}${"*".repeat(
        randomWord.word.length - 2
      )}`
    );

    setGameState((prev) => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));

    // setTimeout(() => setShowHint(false), 3000);
  };

  const handleNextPuzzle = () => {
    setShowCongratulations(false);
    initializeHourlyPuzzleSystem();
  };

  const toggleSound = () => {
    setGameState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleWalletConnect = () => {
    setIsWalletConnected(!isWalletConnected);
  };

  const handleRestart = () => {
    setShowCongratulations(false);
    initializeHourlyPuzzleSystem();
  };

  const handlePuzzleExpired = () => {
    setGameMessage("⏰ Puzzle expired! New puzzle available!");
    initializeHourlyPuzzleSystem();
  };

  const progressPercentage =
    gameState.availableWords.length > 0
      ? (gameState.discoveredWords.length / gameState.availableWords.length) *
        100
      : 0;

  const { view, setView } = useView();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-purple-200">
            Loading game...
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="game-background max-w-[375px] m-auto relative text-white">
        <TopNavigation
          level={playerProfile?.level || 1}
          soundEnabled={gameState.soundEnabled}
          volume={volume}
          isWalletConnected={isWalletConnected}
          onVolumeChange={handleVolumeChange}
          onSoundToggle={toggleSound}
          onRestart={handleRestart}
          onWalletConnect={handleWalletConnect}
          onShowProfile={() => setShowProfile(true)}
          onShowMissions={() => setShowMissions(true)}
          playerProfile={playerProfile}
          onSetView={(view) => setView(view)}
        />
        <div className="md:flex">
          {/* //mobile display */}
          {view === "profile" ? (
            <div className="md:h-screen flex-1 p-10 pb-0 pt-5 md:pt-20">
              <div>
                {currentPuzzle && (
                  <div className="mb-6">
                    {/* Hourly Puzzle Timer */}
                    <HourlyPuzzleTimer
                      nextPuzzleTime={
                        new Date(currentPuzzle.expiryTime.getTime())
                      }
                      currentPuzzleExpiry={currentPuzzle.expiryTime}
                      isRarePuzzle={currentPuzzle.isRare}
                      onPuzzleExpired={handlePuzzleExpired}
                    />
                  </div>
                )}
                {/* Game Stats */}
                <div className="md:mb-6  relative z-10">
                  <GameStats
                    score={gameState.score}
                    totalScore={playerProfile?.totalXP || 0}
                    level={playerProfile?.level || 1}
                    foundWords={gameState.discoveredWords.length}
                    totalWords={gameState.availableWords.length}
                    progressPercentage={progressPercentage}
                  />
                </div>
              </div>
            </div>
          ) : view === "words" ? (
            <div className="h-screen relative z-10 flex-1 flex items-center justify-center">
              {/* Word List */}
              <div>
                <WordList
                  availableWords={gameState.availableWords}
                  discoveredWords={gameState.discoveredWords}
                  currentWord={gameState.currentWord}
                />
              </div>
            </div>
          ) : (
            <div className="h-screen flex-1  p-10 pt-0 md:pt-10 relative z-10">
              {/* Main Game Area */}
              <div className="md:p-4 max-w-4xl mx-auto">
                {/* Game Message */}
                {gameMessage && (
                  <div className="text-center mb-4 relative z-10">
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        gameMessage.includes("Excellent!") ||
                        gameMessage.includes("Complete")
                          ? "emerald-accent neon-emerald"
                          : gameMessage.includes("Not a valid") ||
                            gameMessage.includes("Already found") ||
                            gameMessage.includes("must be at least") ||
                            gameMessage.includes("Time's up")
                          ? "rose-accent neon-rose animate-pulse"
                          : "gold-accent neon-gold"
                      }`}
                    >
                      {gameMessage}
                    </div>
                  </div>
                )}

                {/* Main Game Area */}
                <div className="grid gap-8">
                  {/* Letter Wheel Section */}
                  <div className="flex flex-col items-center">
                    {/* Letter Wheel */}
                    <div
                      className={`transition-all duration-200 ${
                        incorrectSelection ? "animate-pulse" : ""
                      } ${
                        !currentPuzzle?.isActive
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      <LetterWheel
                        letters={gameState.letters}
                        selectedLetters={gameState.selectedLetters}
                        currentWord={gameState.currentWord}
                        onLetterSelect={handleLetterSelect}
                        onLetterDeselect={handleLetterDeselect}
                        onWordSubmit={handleWordSubmit}
                        incorrectSelection={incorrectSelection}
                        disabled={!currentPuzzle?.isActive}
                      />
                    </div>

                    {/* Hint Button */}
                    <div className="mt-6">
                      <button
                        onClick={handleHint}
                        disabled={
                          gameState.hintsUsed >= 3 || !currentPuzzle?.isActive
                        }
                        className="absolute bottom-60 md:bottom-40 left-10 flex items-center px-4 py-2 rounded-xl shadow-lg transition-all duration-200 neon-gold gold-accent 
          disabled:opacity-50 disabled:cursor-not-allowed 
          hover:shadow-xl focus:outline-none focus:ring-2 
          focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-purple-950"
                      >
                        <Lightbulb />
                        <sub>{3 - gameState.hintsUsed}</sub>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Congratulations Page */}
        <CongratulationsPage
          level={playerProfile?.level || 1}
          score={gameState.score}
          timeBonus={0}
          wordsFound={gameState.discoveredWords.length}
          totalWords={gameState.availableWords.length}
          onContinue={handleNextPuzzle}
          isVisible={showCongratulations}
        />

        {/* Player Profile Modal */}
        {playerProfile && (
          <PlayerProfile
            profile={playerProfile}
            isVisible={showProfile}
            onClose={() => setShowProfile(false)}
          />
        )}

        {/* Mission Panel */}
        <MissionPanel
          missions={activeMissions}
          isVisible={showMissions}
          onClose={() => setShowMissions(false)}
        />
        <img
          src="/letters.png"
          alt="alphabets"
          className="absolute w-screen h-screen z-0 top-0 bottom-0 opacity-25"
        />
      </div>
    );
  }
}
