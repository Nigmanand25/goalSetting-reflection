import React, { useState, useMemo } from 'react';
import { DailyEntry, ConfidenceLevel } from '@/types';
import Card from '../shared/Card';
import StatsOverview from './StatsOverview';

interface CalendarViewProps {
  entries: DailyEntry[];
  studentName: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries, studentName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const current = new Date(startDate);

    // Generate 42 days (6 weeks) for complete calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const entry = entries.find(e => e.date.startsWith(dateStr));
      
      days.push({
        date: new Date(current),
        dateStr,
        entry,
        isCurrentMonth: current.getMonth() === currentMonth,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [entries, currentMonth, currentYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const getEntryStatusColor = (entry: DailyEntry | undefined, isCurrentMonth: boolean) => {
    if (!entry || !isCurrentMonth) return 'bg-slate-50 dark:bg-slate-800';
    
    const hasGoal = entry.goal;
    const hasReflection = entry.reflection;
    const hasQuiz = entry.quizEvaluation;
    
    if (hasGoal && hasReflection && hasQuiz) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
    } else if (hasGoal && hasReflection) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    } else if (hasGoal) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
    }
    
    return 'bg-slate-50 dark:bg-slate-800';
  };

  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case ConfidenceLevel.HIGH:
        return 'text-green-600 dark:text-green-400';
      case ConfidenceLevel.MEDIUM:
        return 'text-yellow-600 dark:text-yellow-400';
      case ConfidenceLevel.LOW:
        return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      <StatsOverview entries={entries} />
      
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          📅 {studentName}'s Progress Calendar
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-lg font-medium min-w-[200px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
          <span>Complete Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded"></div>
          <span>Partial Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded"></div>
          <span>Goal Only</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center font-medium text-slate-600 dark:text-slate-400">
            {day}
          </div>
        ))}
        
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`
              relative p-2 h-20 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer
              transition-all hover:shadow-md
              ${getEntryStatusColor(day.entry, day.isCurrentMonth)}
              ${!day.isCurrentMonth ? 'opacity-40' : ''}
              ${day.isToday ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''}
            `}
            onClick={() => day.entry && setSelectedEntry(day.entry)}
          >
            <div className={`text-sm font-medium ${day.isCurrentMonth ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
              {day.date.getDate()}
            </div>
            
            {day.entry && day.isCurrentMonth && (
              <div className="mt-1 space-y-0.5">
                {day.entry.goal && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Goal set"></div>
                )}
                {day.entry.reflection && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" title="Reflection done"></div>
                )}
                {day.entry.quizEvaluation && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Quiz completed"></div>
                )}
              </div>
            )}
            
            {day.isToday && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Entry Details */}
      {selectedEntry && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold">
              📋 {new Date(selectedEntry.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Goal */}
            {selectedEntry.goal && (
              <div>
                <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-1">🎯 Goal</h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded">
                  {selectedEntry.goal.text}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    selectedEntry.goal.completed 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {selectedEntry.goal.completed ? '✅ Completed' : '⏳ In Progress'}
                  </span>
                </div>
              </div>
            )}

            {/* Reflection */}
            {selectedEntry.reflection && (
              <div>
                <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-1">🤔 Reflection</h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded mb-2">
                  {selectedEntry.reflection.text}
                </p>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded">
                    Depth: {selectedEntry.reflection.depth}/5
                  </span>
                  <span className={`px-2 py-1 rounded ${getConfidenceColor(selectedEntry.reflection.confidenceLevel)} bg-opacity-10`}>
                    Confidence: {selectedEntry.reflection.confidenceLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Quiz */}
            {selectedEntry.quizEvaluation && (
              <div>
                <h5 className="font-medium text-green-600 dark:text-green-400 mb-1">📝 Quiz Results</h5>
                <div className="bg-white dark:bg-slate-900 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score:</span>
                    <span className={`text-sm font-bold ${
                      (selectedEntry.quizEvaluation.score / selectedEntry.quizEvaluation.total) >= 0.8 
                        ? 'text-green-600 dark:text-green-400'
                        : (selectedEntry.quizEvaluation.score / selectedEntry.quizEvaluation.total) >= 0.6
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {selectedEntry.quizEvaluation.score}/{selectedEntry.quizEvaluation.total}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {selectedEntry.quizEvaluation.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </Card>
    </div>
  );
};

export default CalendarView;
