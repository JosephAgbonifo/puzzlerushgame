import React from 'react';
import { Check, Lock } from 'lucide-react';
import { WordData } from '../types/game';

interface WordListProps {
  availableWords: WordData[];
  discoveredWords: WordData[];
  currentWord: string;
}

const WordList: React.FC<WordListProps> = ({
  availableWords,
  discoveredWords,
  currentWord
}) => {
  const groupedWords = availableWords.reduce((groups, word) => {
    const length = word.word.length;
    if (!groups[length]) {
      groups[length] = [];
    }
    groups[length].push(word);
    return groups;
  }, {} as Record<number, WordData[]>);

  const sortedLengths = Object.keys(groupedWords).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-purple-800">Words Found</h2>
        <div className="text-sm text-gray-600">
          {discoveredWords.length} / {availableWords.length}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedLengths.map(length => (
          <div key={length} className="border-b border-gray-200 pb-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {length} Letters
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {groupedWords[length].map((word, index) => {
                const isFound = discoveredWords.some(w => w.word === word.word);
                const isCurrentWord = currentWord === word.word;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                      isFound
                        ? 'bg-green-100 text-green-800'
                        : isCurrentWord
                        ? 'bg-gradient-to-r from-purple-100 to-orange-100 text-purple-800 animate-pulse'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isFound ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`font-medium ${
                        isFound ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {isFound ? word.word : '•'.repeat(word.word.length)}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isFound 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {word.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {discoveredWords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No words found yet.</p>
          <p className="text-sm mt-2">Start connecting letters to discover words!</p>
        </div>
      )}
    </div>
  );
};

export default WordList;