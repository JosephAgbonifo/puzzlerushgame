import React from "react";
import { Check, Lock } from "lucide-react";
import { WordData } from "../types/game";

interface WordListProps {
  availableWords: WordData[];
  discoveredWords: WordData[];
  currentWord: string;
}

const WordList: React.FC<WordListProps> = ({
  availableWords,
  discoveredWords,
  currentWord,
}) => {
  const groupedWords = availableWords.reduce((groups, word) => {
    const length = word.word.length;
    if (!groups[length]) groups[length] = [];
    groups[length].push(word);
    return groups;
  }, {} as Record<number, WordData[]>);

  const sortedLengths = Object.keys(groupedWords)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl shadow-lg p-6 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gold-300 uppercase tracking-wide">
          Words Found
        </h2>
        <span className="text-xs text-gray-200">
          {discoveredWords.length} / {availableWords.length}
        </span>
      </div>

      {/* Word Groups */}
      <div className="space-y-4 max-h-[30rem] overflow-y-auto custom-scrollbar pr-1">
        {sortedLengths.map((length) => (
          <div key={length} className="pb-3 border-b border-gold-400/20">
            <h3 className="text-xs font-semibold text-gray-200 mb-2">
              {length} Letters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupedWords[length].map((word, index) => {
                const isFound = discoveredWords.some(
                  (w) => w.word === word.word
                );
                const isCurrent = currentWord === word.word;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 
                      ${
                        isFound
                          ? "emerald-accent text-white neon-emerald"
                          : isCurrent
                          ? "gold-accent text-primary-900 animate-pulse neon-gold"
                          : "bg-primary-900 text-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {isFound ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {isFound ? word.word : "•".repeat(word.word.length)}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isFound
                          ? "bg-emerald-700 text-white"
                          : "bg-primary-800 text-gray-300"
                      }`}
                    >
                      {word.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {discoveredWords.length === 0 && (
        <div className="text-center py-8 text-gray-300">
          <p>No words found yet.</p>
          <p className="text-sm mt-2">
            Start connecting letters to discover hidden words!
          </p>
        </div>
      )}
    </div>
  );
};

export default WordList;
