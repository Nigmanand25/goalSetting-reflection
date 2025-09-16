import React from 'react';
import { DailyEntry } from '@/types';

interface MiniCalendarProps {
  entries: DailyEntry[];
  onDateSelect?: (date: string) => void;
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ entries, onDateSelect, className = '' }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Generate last 30 days
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date.startsWith(dateStr));
    
    days.push({
      date,
      dateStr,
      entry,
      isToday: i === 0
    });
  }

  const getStatusColor = (entry: DailyEntry | undefined, isToday: boolean) => {
    if (isToday) {
      return 'bg-indigo-500 text-white';
    }
    
    if (!entry) return 'bg-slate-100 dark:bg-slate-700 text-slate-400';
    
    const hasGoal = entry.goal;
    const hasReflection = entry.reflection;
    const hasQuiz = entry.quizEvaluation;
    
    if (hasGoal && hasReflection && hasQuiz) {
      return 'bg-green-500 text-white';
    } else if (hasGoal && hasReflection) {
      return 'bg-yellow-500 text-white';
    } else if (hasGoal) {
      return 'bg-blue-500 text-white';
    }
    
    return 'bg-slate-200 dark:bg-slate-600 text-slate-400';
  };

  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3 text-center">
        Activity Overview (Last 30 Days)
      </h4>
      
      <div className="grid grid-cols-10 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect?.(day.dateStr)}
            className={`
              w-6 h-6 text-xs rounded flex items-center justify-center transition-all hover:scale-110
              ${getStatusColor(day.entry, day.isToday)}
            `}
            title={`${day.date.toLocaleDateString()} - ${
              day.entry 
                ? `Goal: ${day.entry.goal ? '✓' : '✗'}, Reflection: ${day.entry.reflection ? '✓' : '✗'}, Quiz: ${day.entry.quizEvaluation ? '✓' : '✗'}`
                : 'No activity'
            }`}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
      
      <div className="flex justify-center space-x-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Complete</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Goal Only</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
