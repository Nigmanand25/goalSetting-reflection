import React, { useMemo, useState } from 'react';
import { ConfidenceLevel } from '../../types';
import GoalSetter from './GoalSetter';
import Reflector from './Reflector';
import QuizCard from './QuizCard';
import ProgressTracker from './ProgressTracker';
import Timeline from './Timeline';
import CalendarView from './CalendarView';
import StatsOverview from './StatsOverview';
import { useApp } from '../../contexts/AppContext';
import Card from '../shared/Card';
import Badges from './Badges';

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <Card className="h-36 bg-slate-200 dark:bg-slate-800"></Card>
        <Card className="h-24 bg-slate-200 dark:bg-slate-800"></Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="h-64 bg-slate-200 dark:bg-slate-800"></Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="h-96 bg-slate-200 dark:bg-slate-800"></Card>
            </div>
        </div>
    </div>
);


type ViewType = 'today' | 'calendar' | 'progress';

const StudentDashboard: React.FC = () => {
  const { studentData, loading, error, addGoal, addReflection } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('today');

  const todaysEntry = useMemo(() => {
    if (!studentData?.entries) return undefined;
    const todayStr = new Date().toISOString().split('T')[0];
    return studentData.entries.find(entry => entry.date.startsWith(todayStr));
  }, [studentData]);

  const view = useMemo(() => {
    if (!todaysEntry || !todaysEntry.goal) return 'goal';
    if (!todaysEntry.reflection) return 'reflect';
    if (!todaysEntry.quizEvaluation) return 'quiz';
    return 'done'; // All tasks for the day are complete
  }, [todaysEntry]);

  const handleGoalSet = async (goalText: string) => {
    await addGoal(goalText);
  };

  const handleReflectionSubmit = async (reflectionText: string, depth: number, confidence: ConfidenceLevel) => {
    await addReflection({ text: reflectionText, depth: depth, confidenceLevel: confidence });
  };
  
  if (loading) return <LoadingSkeleton />;
  if (!studentData) return <Card><p className="text-center text-slate-500">No student data available.</p></Card>;
  
  const renderCurrentTask = () => {
      switch (view) {
          case 'goal':
              return <GoalSetter onGoalSet={handleGoalSet} />;
          case 'reflect':
              return <Reflector onReflectionSubmit={handleReflectionSubmit} />;
          case 'quiz':
              return <QuizCard />;
          case 'done':
              return <Card><h3 className="text-xl font-semibold text-center text-green-500">Great work today! ✨</h3><p className="text-center text-slate-500 dark:text-slate-400 mt-2">You've completed all your tasks. See you tomorrow!</p></Card>;
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'today':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {renderCurrentTask()}
            </div>
            <div className="lg:col-span-1">
              <Timeline entries={studentData.entries} />
            </div>
          </div>
        );
      case 'calendar':
        return <CalendarView entries={studentData.entries} studentName={studentData.name} />;
      case 'progress':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressTracker 
                consistency={studentData.consistencyScore}
                streak={studentData.streak}
              />
              <StatsOverview entries={studentData.entries} />
            </div>
            {studentData.badges && studentData.badges.length > 0 && (
              <Badges badges={studentData.badges} />
            )}
            <Timeline entries={studentData.entries} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Welcome back, {studentData.name}!
        </h2>
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setCurrentView('today')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'today'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🏠 Today
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setCurrentView('progress')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'progress'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📊 Progress
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Stats (visible on all views) */}
      {currentView !== 'progress' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {studentData.streak}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Day Streak</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {studentData.consistencyScore}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Consistency</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {studentData.entries.length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Total Days</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {studentData.badges?.length || 0}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Badges</div>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default StudentDashboard;