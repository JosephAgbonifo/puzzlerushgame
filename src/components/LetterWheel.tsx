import React, { useState, useRef, useEffect } from 'react';
import { Letter } from '../types/game';

interface LetterWheelProps {
  letters: Letter[];
  selectedLetters: Letter[];
  currentWord: string;
  onLetterSelect: (letter: Letter) => void;
  onLetterDeselect: (letterId: string) => void;
  onWordSubmit: () => void;
  onClearSelection: () => void;
}

const LetterWheel: React.FC<LetterWheelProps> = ({
  letters,
  selectedLetters,
  currentWord,
  onLetterSelect,
  onLetterDeselect,
  onWordSubmit,
  onClearSelection
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPath, setDragPath] = useState<{ x: number; y: number }[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wheelRadius = 120;
  const centerX = 150;
  const centerY = 150;

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragPath([]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && wheelRef.current) {
        const rect = wheelRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDragPath(prev => [...prev, { x, y }]);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  const getLetterPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + wheelRadius * Math.cos(angle);
    const y = centerY + wheelRadius * Math.sin(angle);
    return { x, y };
  };

  const handleLetterClick = (letter: Letter) => {
    if (selectedLetters.some(l => l.id === letter.id)) {
      const letterIndex = selectedLetters.findIndex(l => l.id === letter.id);
      if (letterIndex === selectedLetters.length - 1) {
        onLetterDeselect(letter.id);
      }
    } else {
      onLetterSelect(letter);
    }
  };

  const handleLetterMouseDown = (letter: Letter) => {
    setIsDragging(true);
    if (!selectedLetters.some(l => l.id === letter.id)) {
      onLetterSelect(letter);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentWord.length >= 3) {
      onWordSubmit();
    } else if (e.key === 'Escape') {
      onClearSelection();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Current Word Display */}
      <div className="h-16 flex items-center justify-center">
        {currentWord ? (
          <div className="text-2xl font-bold text-orange-800 bg-orange-100 px-6 py-2 rounded-lg border-2 border-orange-200">
            {currentWord}
          </div>
        ) : (
          <div className="text-gray-400 text-lg">Connect letters to form words</div>
        )}
      </div>

      {/* Letter Wheel */}
      <div 
        ref={wheelRef}
        className="relative bg-gradient-to-br from-orange-100 to-amber-100 rounded-full shadow-lg"
        style={{ width: '300px', height: '300px' }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Connection Lines */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {selectedLetters.map((letter, index) => {
            if (index === 0) return null;
            const prevLetter = selectedLetters[index - 1];
            const currentPos = getLetterPosition(
              letters.findIndex(l => l.id === letter.id),
              letters.length
            );
            const prevPos = getLetterPosition(
              letters.findIndex(l => l.id === prevLetter.id),
              letters.length
            );
            
            return (
              <line
                key={`${prevLetter.id}-${letter.id}`}
                x1={prevPos.x}
                y1={prevPos.y}
                x2={currentPos.x}
                y2={currentPos.y}
                stroke="#f97316"
                strokeWidth="3"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Letters */}
        {letters.map((letter, index) => {
          const position = getLetterPosition(index, letters.length);
          const isSelected = selectedLetters.some(l => l.id === letter.id);
          const selectionOrder = selectedLetters.findIndex(l => l.id === letter.id) + 1;

          return (
            <div
              key={letter.id}
              className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                isSelected 
                  ? 'bg-orange-500 text-white shadow-lg scale-110' 
                  : 'bg-white text-orange-800 shadow-md hover:bg-orange-50'
              }`}
              style={{
                left: `${position.x - 28}px`,
                top: `${position.y - 28}px`,
                zIndex: isSelected ? 10 : 5
              }}
              onClick={() => handleLetterClick(letter)}
              onMouseDown={() => handleLetterMouseDown(letter)}
            >
              <span className="text-xl font-bold">{letter.char}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectionOrder}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full shadow-inner flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onClearSelection}
          disabled={selectedLetters.length === 0}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onWordSubmit}
          disabled={currentWord.length < 3}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Word
        </button>
      </div>
    </div>
  );
};

export default LetterWheel;