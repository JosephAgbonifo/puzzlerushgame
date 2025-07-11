import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const wheelRadius = 120;
  const centerX = 150;
  const centerY = 150;

  const getLetterPosition = useCallback((index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + wheelRadius * Math.cos(angle);
    const y = centerY + wheelRadius * Math.sin(angle);
    return { x, y };
  }, []);

  const getLetterAtPosition = useCallback((x: number, y: number): Letter | null => {
    if (!wheelRef.current) return null;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;
    
    for (let i = 0; i < letters.length; i++) {
      const pos = getLetterPosition(i, letters.length);
      const distance = Math.sqrt(
        Math.pow(relativeX - pos.x, 2) + Math.pow(relativeY - pos.y, 2)
      );
      
      if (distance <= 28) { // Letter radius
        return letters[i];
      }
    }
    return null;
  }, [letters, getLetterPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent, letter?: Letter) => {
    e.preventDefault();
    setIsDragging(true);
    
    if (letter && !selectedLetters.some(l => l.id === letter.id)) {
      onLetterSelect(letter);
    }
    
    const rect = wheelRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
      setDragPath([{ x, y }]);
    }
  }, [selectedLetters, onLetterSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    setDragPath(prev => [...prev.slice(-10), { x, y }]); // Keep last 10 points
    
    const letterAtPosition = getLetterAtPosition(e.clientX, e.clientY);
    if (letterAtPosition && !selectedLetters.some(l => l.id === letterAtPosition.id)) {
      onLetterSelect(letterAtPosition);
    }
  }, [isDragging, selectedLetters, onLetterSelect, getLetterAtPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragPath([]);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, letter?: Letter) => {
    e.preventDefault();
    setIsDragging(true);
    
    if (letter && !selectedLetters.some(l => l.id === letter.id)) {
      onLetterSelect(letter);
    }
    
    const touch = e.touches[0];
    const rect = wheelRef.current?.getBoundingClientRect();
    if (rect) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      setMousePosition({ x, y });
      setDragPath([{ x, y }]);
    }
  }, [selectedLetters, onLetterSelect]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !wheelRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setMousePosition({ x, y });
    setDragPath(prev => [...prev.slice(-10), { x, y }]);
    
    const letterAtPosition = getLetterAtPosition(touch.clientX, touch.clientY);
    if (letterAtPosition && !selectedLetters.some(l => l.id === letterAtPosition.id)) {
      onLetterSelect(letterAtPosition);
    }
  }, [isDragging, selectedLetters, onLetterSelect, getLetterAtPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragPath([]);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
          <div className="text-2xl font-bold text-purple-800 bg-gradient-to-r from-purple-100 to-orange-100 px-6 py-2 rounded-lg border-2 border-purple-200 shadow-lg">
            {currentWord}
          </div>
        ) : (
          <div className="text-gray-400 text-lg">Drag to connect letters</div>
        )}
      </div>

      {/* Letter Wheel */}
      <div 
        ref={wheelRef}
        className="relative bg-gradient-to-br from-purple-100 via-orange-50 to-purple-100 rounded-full shadow-xl border-4 border-purple-200"
        style={{ width: '300px', height: '300px' }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Connection Lines */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {/* Static connections between selected letters */}
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
                stroke="url(#purpleGradient)"
                strokeWidth="4"
                className="drop-shadow-sm"
              />
            );
          })}
          
          {/* Dynamic line from last selected letter to mouse position */}
          {isDragging && selectedLetters.length > 0 && (
            <line
              x1={getLetterPosition(
                letters.findIndex(l => l.id === selectedLetters[selectedLetters.length - 1].id),
                letters.length
              ).x}
              y1={getLetterPosition(
                letters.findIndex(l => l.id === selectedLetters[selectedLetters.length - 1].id),
                letters.length
              ).y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="url(#orangeGradient)"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          )}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Letters */}
        {letters.map((letter, index) => {
          const position = getLetterPosition(index, letters.length);
          const isSelected = selectedLetters.some(l => l.id === letter.id);
          const selectionOrder = selectedLetters.findIndex(l => l.id === letter.id) + 1;

          return (
            <div
              key={letter.id}
              className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform select-none ${
                isSelected 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl scale-110 ring-4 ring-orange-300' 
                  : 'bg-gradient-to-br from-white to-purple-50 text-purple-800 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-purple-50 hover:to-orange-50'
              }`}
              style={{
                left: `${position.x - 28}px`,
                top: `${position.y - 28}px`,
                zIndex: isSelected ? 10 : 5
              }}
              onMouseDown={(e) => handleMouseDown(e, letter)}
              onTouchStart={(e) => handleTouchStart(e, letter)}
            >
              <span className="text-xl font-bold pointer-events-none">{letter.char}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {selectionOrder}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-200 via-orange-100 to-purple-200 rounded-full shadow-inner flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-orange-300 rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onClearSelection}
          disabled={selectedLetters.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Clear
        </button>
        <button
          onClick={onWordSubmit}
          disabled={currentWord.length < 3}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg hover:from-purple-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Submit Word
        </button>
      </div>
    </div>
  );
};

export default LetterWheel;