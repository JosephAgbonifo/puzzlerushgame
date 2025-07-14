import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WordSearchLetter } from '../types/wordSearch';

interface WordSearchGridProps {
  grid: WordSearchLetter[][];
  selectedLetters: WordSearchLetter[];
  onLetterSelect: (letter: WordSearchLetter) => void;
  onSelectionComplete: () => void;
  onSelectionClear: () => void;
  incorrectSelection: boolean;
}

const WordSearchGrid: React.FC<WordSearchGridProps> = ({
  grid,
  selectedLetters,
  onLetterSelect,
  onSelectionComplete,
  onSelectionClear,
  incorrectSelection
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellStyle = (letter: WordSearchLetter) => {
    let backgroundColor = '#FFFFFF';
    let color = '#333333';
    
    if (letter.isCorrect) {
      backgroundColor = '#FFE082'; // Soft yellow for correct words
      color = '#333333';
    } else if (selectedLetters.some(l => l.id === letter.id)) {
      if (incorrectSelection) {
        backgroundColor = '#FF7F7F'; // Gentle red for wrong selections
        color = '#FFFFFF';
      } else {
        backgroundColor = '#FFE082'; // Soft yellow while selecting
        color = '#333333';
      }
    }

    return {
      backgroundColor,
      color,
      transition: 'all 0.2s ease',
      transform: selectedLetters.some(l => l.id === letter.id) ? 'scale(1.05)' : 'scale(1)',
    };
  };

  const getLetterAtPosition = useCallback((clientX: number, clientY: number): WordSearchLetter | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cellSize = rect.width / grid[0].length;
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);

    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      return grid[row][col];
    }

    return null;
  }, [grid]);

  const isValidSelection = useCallback((start: WordSearchLetter, end: WordSearchLetter): boolean => {
    const rowDiff = Math.abs(end.row - start.row);
    const colDiff = Math.abs(end.col - start.col);
    
    // Allow horizontal, vertical, and diagonal selections
    return rowDiff === 0 || colDiff === 0 || rowDiff === colDiff;
  }, []);

  const getLettersBetween = useCallback((start: WordSearchLetter, end: WordSearchLetter): WordSearchLetter[] => {
    const letters: WordSearchLetter[] = [];
    const rowStep = start.row === end.row ? 0 : (end.row - start.row) / Math.abs(end.row - start.row);
    const colStep = start.col === end.col ? 0 : (end.col - start.col) / Math.abs(end.col - start.col);
    
    const steps = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));
    
    for (let i = 0; i <= steps; i++) {
      const row = start.row + rowStep * i;
      const col = start.col + colStep * i;
      letters.push(grid[row][col]);
    }
    
    return letters;
  }, [grid]);

  const handleMouseDown = useCallback((e: React.MouseEvent, letter: WordSearchLetter) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ row: letter.row, col: letter.col });
    onLetterSelect(letter);
  }, [onLetterSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const letter = getLetterAtPosition(e.clientX, e.clientY);
    if (!letter) return;

    const startLetter = grid[dragStart.row][dragStart.col];
    if (isValidSelection(startLetter, letter)) {
      const lettersInPath = getLettersBetween(startLetter, letter);
      
      // Clear current selection and select new path
      onSelectionClear();
      lettersInPath.forEach(l => onLetterSelect(l));
    }
  }, [isDragging, dragStart, grid, getLetterAtPosition, isValidSelection, getLettersBetween, onLetterSelect, onSelectionClear]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      onSelectionComplete();
    }
  }, [isDragging, onSelectionComplete]);

  const handleTouchStart = useCallback((e: React.TouchEvent, letter: WordSearchLetter) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ row: letter.row, col: letter.col });
    onLetterSelect(letter);
  }, [onLetterSelect]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStart) return;
    e.preventDefault();

    const touch = e.touches[0];
    const letter = getLetterAtPosition(touch.clientX, touch.clientY);
    if (!letter) return;

    const startLetter = grid[dragStart.row][dragStart.col];
    if (isValidSelection(startLetter, letter)) {
      const lettersInPath = getLettersBetween(startLetter, letter);
      
      onSelectionClear();
      lettersInPath.forEach(l => onLetterSelect(l));
    }
  }, [isDragging, dragStart, grid, getLetterAtPosition, isValidSelection, getLettersBetween, onLetterSelect, onSelectionClear]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      onSelectionComplete();
    }
  }, [isDragging, onSelectionComplete]);

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

  return (
    <div className="flex justify-center p-4">
      <div
        ref={gridRef}
        className={`grid gap-1 p-4 bg-gray-100 rounded-lg shadow-lg select-none transition-all duration-200 ${
          incorrectSelection ? 'animate-pulse' : ''
        }`}
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          maxWidth: '600px',
          aspectRatio: '1',
        }}
      >
        {grid.flat().map((letter) => (
          <div
            key={letter.id}
            className="flex items-center justify-center font-bold text-lg cursor-pointer border border-gray-300 rounded transition-all duration-200 hover:shadow-md"
            style={{
              ...getCellStyle(letter),
              aspectRatio: '1',
              minHeight: '30px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, letter)}
            onTouchStart={(e) => handleTouchStart(e, letter)}
          >
            {letter.char}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordSearchGrid;