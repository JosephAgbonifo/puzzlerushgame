import React from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '../utils/wordSearchUtils';

interface WordSearchTimerProps {
  timeRemaining: number;
  isWarning: boolean;
}

const WordSearchTimer: React.FC<WordSearchTimerProps> = ({ timeRemaining, isWarning }) => {
  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-lg transition-all duration-200 ${
      isWarning 
        ? 'bg-red-100 text-red-700 animate-pulse border-2 border-red-300' 
        : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
    }`}>
      <Clock className={`h-5 w-5 ${isWarning ? 'animate-spin' : ''}`} />
      <span className="font-mono">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default WordSearchTimer;