
import React from 'react';
import Card from '../shared/Card';

interface ProgressTrackerProps {
  consistency: number;
  streak: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ consistency, streak }) => {
  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Consistency Score */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <svg className="w-20 h-20" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-green-500"
                strokeDasharray={`${consistency}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                transform="rotate(90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-200">
              {consistency}%
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Consistency</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Average</p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center space-x-4">
          <div className="text-5xl">🔥</div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Current Streak</h4>
            <p className="text-2xl font-bold text-orange-500">{streak} Days</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressTracker;
