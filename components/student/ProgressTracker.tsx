
import React from 'react';
import Card from '../shared/Card';

interface ProgressTrackerProps {
  consistency: number;
  streak: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ consistency, streak }) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent dark:from-green-900/30 dark:to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          Progress Tracker
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Consistency Score */}
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className={`${
                    consistency >= 80 ? 'text-green-500' :
                    consistency >= 60 ? 'text-yellow-500' :
                    consistency >= 40 ? 'text-orange-500' : 'text-red-500'
                  } transition-all duration-1000`}
                  strokeDasharray={`${consistency}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                    {consistency}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {consistency >= 80 ? 'Excellent!' :
                     consistency >= 60 ? 'Good!' :
                     consistency >= 40 ? 'Keep going!' : 'Let\'s improve!'}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Consistency</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Average</p>
            </div>
          </div>

          {/* Streak */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full border-4 border-orange-200 dark:border-orange-800 shadow-inner">
              <div className="text-center">
                <div className="text-4xl mb-1 animate-pulse">🔥</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {streak}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Current Streak</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {streak === 0 ? 'Start your streak today!' :
                 streak === 1 ? 'Great start!' :
                 streak < 7 ? `${7 - streak} days to 1 week!` :
                 streak < 30 ? `${30 - streak} days to 1 month!` :
                 'Amazing streak! 🌟'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Weekly Goal</span>
            <span>85%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                consistency >= 85 ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}
              style={{ width: `${Math.min(consistency, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
