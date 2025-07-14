import React from 'react';
import { Check } from 'lucide-react';
import { WordSearchWord } from '../types/wordSearch';

interface WordSearchWordListProps {
  words: WordSearchWord[];
  foundWords: WordSearchWord[];
}

const WordSearchWordList: React.FC<WordSearchWordListProps> = ({ words, foundWords }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Words to Find ({foundWords.length}/{words.length})
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {words.map((word) => {
          const isFound = foundWords.some(fw => fw.id === word.id);
          
          return (
            <div
              key={word.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                isFound
                  ? 'bg-green-100 text-green-800 line-through'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium ${isFound ? 'line-through' : ''}`}>
                {word.word}
              </span>
              {isFound && (
                <Check className="h-5 w-5 text-green-600 animate-bounce" />
              )}
            </div>
          );
        })}
      </div>
      
      {foundWords.length === words.length && (
        <div className="mt-4 text-center">
          <div className="text-green-600 font-bold text-lg animate-pulse">
            🎉 All Words Found! 🎉
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchWordList;