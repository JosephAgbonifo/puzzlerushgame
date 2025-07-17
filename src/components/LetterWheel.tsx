import React, { useState, useRef, useEffect, useCallback } from "react";
import { Letter } from "../types/game";
import clsx from "clsx";

interface LetterWheelProps {
  letters: Letter[];
  selectedLetters: Letter[];
  currentWord: string;
  onLetterSelect: (letter: Letter) => void;
  onLetterDeselect: (letterId: string) => void;
  onWordSubmit: () => void;
  incorrectSelection?: boolean;
  disabled?: boolean;
}

const PuzzlePiece: React.FC<{
  letter: string;
  isSelected: boolean;
  selectionOrder?: number;
  style: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}> = ({
  letter,
  isSelected,
  selectionOrder,
  style,
  onMouseDown,
  onTouchStart,
}) => {
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 transform select-none ${
        isSelected ? "scale-110 z-10" : "hover:scale-105 z-5"
      }`}
      style={style}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Puzzle Piece SVG */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        className={`drop-shadow-lg transition-all duration-200 ${
          isSelected ? "drop-shadow-xl" : "hover:drop-shadow-xl"
        }`}
      >
        <defs>
          <linearGradient
            id={`puzzleGradient-${letter}-${isSelected}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {isSelected ? (
              <>
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#c084fc" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#faf5ff" />
                <stop offset="100%" stopColor="#f3e8ff" />
              </>
            )}
          </linearGradient>
          <filter
            id={`shadow-${letter}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="3"
              floodColor="#000000"
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        {/* Puzzle Piece Shape */}
        <path
          d="M8 8 L24 8 Q28 4 32 8 Q36 12 32 16 L48 16 Q52 12 56 16 L56 32 Q60 36 56 40 Q52 44 56 48 L56 56 L40 56 Q36 60 32 56 Q28 52 32 48 L16 48 Q12 52 8 48 Q4 44 8 40 L8 24 Q4 20 8 16 Q12 12 8 8 Z"
          fill={`url(#puzzleGradient-${letter}-${isSelected})`}
          stroke={isSelected ? "#f97316" : "#e5e7eb"}
          strokeWidth={isSelected ? "2" : "1"}
          filter={`url(#shadow-${letter})`}
        />
      </svg>

      {/* Letter */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-xl font-bold pointer-events-none ${
            isSelected ? "text-white" : "text-purple-800"
          }`}
        >
          {letter}
        </span>
      </div>

      {/* Selection Order Badge */}
      {isSelected && selectionOrder && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white">
          {selectionOrder}
        </div>
      )}
    </div>
  );
};

const LetterWheel: React.FC<LetterWheelProps> = ({
  letters,
  selectedLetters,
  currentWord,
  onLetterSelect,
  onLetterDeselect,
  onWordSubmit,
  incorrectSelection = false,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPath, setDragPath] = useState<{ x: number; y: number }[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const getLetterPosition = useCallback((index: number, total: number) => {
    const radius = 120; // Radius from center
    const centerX = 150; // Half of container width
    const centerY = 150; // Half of container height
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }, []);

  const getLetterAtPosition = useCallback(
    (x: number, y: number): Letter | null => {
      if (!wheelRef.current) return null;

      const rect = wheelRef.current.getBoundingClientRect();
      const relativeX = x - rect.left;
      const relativeY = y - rect.top;

      for (let i = 0; i < letters.length; i++) {
        const pos = getLetterPosition(i, letters.length);
        const distance = Math.sqrt(
          Math.pow(relativeX - pos.x, 2) + Math.pow(relativeY - pos.y, 2)
        );

        if (distance <= 35) {
          // Puzzle piece radius
          return letters[i];
        }
      }
      return null;
    },
    [letters, getLetterPosition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, letter?: Letter) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);

      if (letter && !selectedLetters.some((l) => l.id === letter.id)) {
        onLetterSelect(letter);
      }

      const rect = wheelRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
        setDragPath([{ x, y }]);
      }
    },
    [selectedLetters, onLetterSelect, disabled]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !wheelRef.current || disabled) return;

      const rect = wheelRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
      setDragPath((prev) => [...prev.slice(-10), { x, y }]);

      const letterAtPosition = getLetterAtPosition(e.clientX, e.clientY);
      if (
        letterAtPosition &&
        !selectedLetters.some((l) => l.id === letterAtPosition.id)
      ) {
        onLetterSelect(letterAtPosition);
      }
    },
    [isDragging, selectedLetters, onLetterSelect, getLetterAtPosition, disabled]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragPath([]);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, letter?: Letter) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);

      if (letter && !selectedLetters.some((l) => l.id === letter.id)) {
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
    },
    [selectedLetters, onLetterSelect, disabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !wheelRef.current || disabled) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = wheelRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setMousePosition({ x, y });
      setDragPath((prev) => [...prev.slice(-10), { x, y }]);

      const letterAtPosition = getLetterAtPosition(
        touch.clientX,
        touch.clientY
      );
      if (
        letterAtPosition &&
        !selectedLetters.some((l) => l.id === letterAtPosition.id)
      ) {
        onLetterSelect(letterAtPosition);
      }
    },
    [isDragging, selectedLetters, onLetterSelect, getLetterAtPosition, disabled]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragPath([]);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" && currentWord.length >= 3) {
      onWordSubmit();
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center space-y-6">
        {/* Word Display */}
        <div className="h-16 flex items-center justify-center">
          {currentWord ? (
            <div
              className={clsx(
                "text-2xl font-bold px-6 py-3 rounded-xl bg-white/10 backdrop-blur",
                "transition-all duration-200 text-white",
                incorrectSelection && "ring-2 ring-rose-500"
              )}
            >
              {currentWord}
            </div>
          ) : (
            <div className="text-gray-400 text-lg">
              {disabled ? "Game Paused" : "Drag to connect puzzle pieces"}
            </div>
          )}
        </div>

        {/* Puzzle Wheel */}
        <div
          ref={wheelRef}
          className={clsx(
            "relative rounded-full transition-all duration-200",
            "bg-gradient-to-br from-amber-600/30 via-amber-500/30 to-amber-400/30",
            "shadow-2xl border-[6px] border-gold-400",
            incorrectSelection && "ring-4 ring-rose-500/50",
            disabled && "opacity-50"
          )}
          style={{ width: "300px", height: "300px" }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {selectedLetters.map((letter, index) => {
              if (index === 0) return null;
              const prev = selectedLetters[index - 1];
              const currentPos = getLetterPosition(
                letters.findIndex((l) => l.id === letter.id),
                letters.length
              );
              const prevPos = getLetterPosition(
                letters.findIndex((l) => l.id === prev.id),
                letters.length
              );

              return (
                <line
                  key={`${prev.id}-${letter.id}`}
                  x1={prevPos.x}
                  y1={prevPos.y}
                  x2={currentPos.x}
                  y2={currentPos.y}
                  stroke="url(#connectionGradient)"
                  strokeWidth="4"
                  filter="url(#glow)"
                />
              );
            })}

            {isDragging && selectedLetters.length > 0 && (
              <line
                x1={
                  getLetterPosition(
                    letters.findIndex(
                      (l) =>
                        l.id === selectedLetters[selectedLetters.length - 1].id
                    ),
                    letters.length
                  ).x
                }
                y1={
                  getLetterPosition(
                    letters.findIndex(
                      (l) =>
                        l.id === selectedLetters[selectedLetters.length - 1].id
                    ),
                    letters.length
                  ).y
                }
                x2={mousePosition.x}
                y2={mousePosition.y}
                stroke="url(#activeConnectionGradient)"
                strokeWidth="3"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            )}

            <defs>
              <linearGradient
                id="connectionGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFED85" />
              </linearGradient>
              <linearGradient
                id="activeConnectionGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFED85" />
                <stop offset="100%" stopColor="#FFFACD" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor="#FFD700"
                />
              </filter>
            </defs>
          </svg>

          {/* Letters */}
          {letters.map((letter, index) => {
            const pos = getLetterPosition(index, letters.length);
            const isSelected = selectedLetters.some((l) => l.id === letter.id);
            const order =
              selectedLetters.findIndex((l) => l.id === letter.id) + 1;

            return (
              <div
                key={letter.id}
                className={clsx(
                  "absolute w-10 h-10 text-white text-2xl  font-extrabold rounded-full",
                  "bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950",
                  "flex items-center justify-center shadow-lg border-2 border-gold-400",
                  "transition-transform transform hover:scale-110 active:scale-95",
                  isSelected && "ring-4 ring-gold-300"
                )}
                style={{
                  left: `${pos.x - 25}px`,
                  top: `${pos.y - 25}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, letter)}
                onTouchStart={(e) => handleTouchStart(e, letter)}
              >
                {letter.char}
                {order > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-gold-400 text-black w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {order}
                  </span>
                )}
              </div>
            );
          })}

          {/* Center */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          w-24 h-24 bg-gradient-to-br from-amber-500 via-gold-400 to-gold-300 
          rounded-full shadow-xl border-[6px] border-primary-500 
          flex items-center justify-center animate-pulse"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-full shadow-inner"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterWheel;
