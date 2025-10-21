import React, { useMemo, useState } from 'react';
import { ConfidenceLevel } from '@/types';
import GoalSetter from './GoalSetter';
import Reflector from './Reflector';
import QuizCard from './QuizCard';
import ProgressTracker from './ProgressTracker';
import Timeline from './Timeline';
import CalendarView from './CalendarView';
import StatsOverview from './StatsOverview';
import { useApp } from '@/contexts/AppContext';
import Card from '../shared/Card';
import Badges from './Badges';

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg w-1/2 shimmer"></div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-5 h-24 shimmer"></div>
                </div>
            ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl h-64 shimmer flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl mb-4">⏳</div>
                            <div className="text-slate-500 dark:text-slate-400">Loading your daily goals...</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                <div className="animate-pulse">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl h-96 shimmer flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl mb-2">📈</div>
                            <div className="text-slate-500 dark:text-slate-400 text-sm">Loading timeline...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>{`
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            .shimmer {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            .dark .shimmer {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                background-size: 200% 100%;
            }
        `}</style>
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
    console.log('=== DEBUGGING STUDENT FLOW ===');
    console.log('todaysEntry:', todaysEntry);
    console.log('hasGoal:', todaysEntry?.goal);
    console.log('hasReflection:', todaysEntry?.reflection);
    console.log('hasQuiz:', todaysEntry?.quizEvaluation);
    
    if (!todaysEntry || !todaysEntry.goal) {
      console.log('View: goal (no entry or no goal)');
      return 'goal';
    }
    if (!todaysEntry.reflection) {
      console.log('View: reflect (goal exists, no reflection)');
      return 'reflect';
    }
    if (!todaysEntry.quizEvaluation) {
      console.log('View: quiz (goal and reflection exist, no quiz)');
      return 'quiz';
    }
    console.log('View: done (all tasks complete)');
    console.log('===============================');
    return 'done'; // All tasks for the day are complete
  }, [todaysEntry]);

  const handleGoalSet = async (goalText: string, smartScore?: import('../../types').SMARTScore) => {
    await addGoal(goalText, smartScore);
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
              return <Reflector onReflectionSubmit={handleReflectionSubmit} todaysGoal={todaysEntry?.goal?.text} />;
          case 'quiz':
              return <QuizCard />;
          case 'done':
              return (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl border-2 border-green-200 dark:border-green-800 p-8 text-center relative overflow-hidden">
                  {/* Celebratory background elements */}
                  <div className="absolute top-0 left-1/4 w-16 h-16 bg-yellow-200 dark:bg-yellow-600 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="absolute top-4 right-1/4 w-12 h-12 bg-green-200 dark:bg-green-600 rounded-full opacity-30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-4 left-1/3 w-8 h-8 bg-blue-200 dark:bg-blue-600 rounded-full opacity-25 animate-bounce" style={{animationDelay: '1s'}}></div>
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 animate-pulse">🎉</div>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      Fantastic Work Today!
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                      You've completed all your daily tasks! 
                    </p>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-inner border border-green-200 dark:border-green-700 mb-4">
                      <div className="flex justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✅</span>
                          <span>Goal Set</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✅</span>
                          <span>Reflection Done</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✅</span>
                          <span>Quiz Completed</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Keep up the momentum! See you tomorrow for another productive day. 🚀
                    </p>
                  </div>
                </div>
              );
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
        <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setCurrentView('today')}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
              currentView === 'today'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span>Today</span>
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
              currentView === 'calendar'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">📅</span>
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setCurrentView('progress')}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
              currentView === 'progress'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">📊</span>
            <span>Progress</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-100 dark:border-blue-800">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {studentData.streak}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Day Streak</div>
            {studentData.streak > 0 && (
              <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">Keep it up!</div>
            )}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-100 dark:border-green-800">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {studentData.consistencyScore}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Consistency</div>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5 mt-2">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${studentData.consistencyScore}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-orange-100 dark:border-orange-800">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {studentData.dailyEngagement ? Math.round(studentData.dailyEngagement.averageDaily) : studentData.consistencyScore}%
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              {studentData.dailyEngagement ? 'Daily Engagement' : 'Consistency'}
            </div>
            <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-1.5 mt-2">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${studentData.dailyEngagement ? Math.round(studentData.dailyEngagement.averageDaily) : studentData.consistencyScore}%` }}
              ></div>
            </div>
            {studentData.dailyEngagement && studentData.dailyEngagement.weeklyTrend !== 0 && (
              <div className={`text-xs mt-1 ${
                studentData.dailyEngagement.weeklyTrend > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {studentData.dailyEngagement.weeklyTrend > 0 ? '↗' : '↘'} {Math.abs(studentData.dailyEngagement.weeklyTrend).toFixed(1)}% vs last week
              </div>
            )}
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100 dark:border-purple-800">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {studentData.entries.length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Days</div>
            <div className="text-xs text-purple-500 dark:text-purple-300 mt-1">
              {studentData.entries.length === 1 ? 'Just started!' : 'Great progress!'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-yellow-100 dark:border-yellow-800">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {studentData.badges?.length || 0}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Badges</div>
            {(studentData.badges?.length || 0) > 0 ? (
              <div className="text-xs text-yellow-500 dark:text-yellow-300 mt-1">Awesome!</div>
            ) : (
              <div className="text-xs text-yellow-500 dark:text-yellow-300 mt-1">Coming soon!</div>
            )}
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default StudentDashboard;