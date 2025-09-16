import React from 'react';
import { DailyEntry, StudentData } from '@/types';
import Card from '../shared/Card';

interface EngagementAnalyticsProps {
  student: StudentData;
  entries: DailyEntry[];
}

const EngagementAnalytics: React.FC<EngagementAnalyticsProps> = ({ student, entries }) => {
  // Calculate engagement metrics
  const totalDays = entries.length;
  const daysWithGoals = entries.filter(e => e.goal).length;
  const daysWithReflections = entries.filter(e => e.reflection).length;
  const daysWithQuizzes = entries.filter(e => e.quizEvaluation).length;
  const completedGoals = entries.filter(e => e.goal?.completed).length;

  // Calculate streaks and patterns
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Weekly activity pattern
  const weeklyActivity = sortedEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[dayOfWeek];
    
    if (!acc[dayName]) acc[dayName] = 0;
    acc[dayName]++;
    return acc;
  }, {} as Record<string, number>);

  // Monthly activity trend (last 6 months)
  const monthlyActivity = sortedEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) acc[monthKey] = { goals: 0, reflections: 0, quizzes: 0 };
    if (entry.goal) acc[monthKey].goals++;
    if (entry.reflection) acc[monthKey].reflections++;
    if (entry.quizEvaluation) acc[monthKey].quizzes++;
    
    return acc;
  }, {} as Record<string, { goals: number; reflections: number; quizzes: number }>);

  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, Math.round(
    (daysWithGoals * 0.3 + 
     daysWithReflections * 0.4 + 
     daysWithQuizzes * 0.2 + 
     (completedGoals / Math.max(daysWithGoals, 1)) * 0.1 * 100)
  ));

  // Activity frequency
  const totalActivities = daysWithGoals + daysWithReflections + daysWithQuizzes;
  const avgActivitiesPerWeek = totalDays > 0 ? (totalActivities / totalDays) * 7 : 0;

  // Get most active day
  const mostActiveDay = Object.entries(weeklyActivity).reduce((a, b) => 
    weeklyActivity[a[0]] > weeklyActivity[b[0]] ? a : b
  );

  // Recent activity trend (last 30 days vs previous 30 days)
  const last30Days = sortedEntries.slice(-30);
  const previous30Days = sortedEntries.slice(-60, -30);
  const recentActivityScore = last30Days.length > 0 ? 
    (last30Days.filter(e => e.goal || e.reflection || e.quizEvaluation).length / last30Days.length) * 100 : 0;
  const previousActivityScore = previous30Days.length > 0 ? 
    (previous30Days.filter(e => e.goal || e.reflection || e.quizEvaluation).length / previous30Days.length) * 100 : 0;
  const activityTrend = recentActivityScore - previousActivityScore;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxWeeklyActivity = Math.max(...(Object.values(weeklyActivity) as number[]), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <span className="text-2xl mr-2">🔥</span>
          Engagement Analytics
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400">Engagement Score</div>
          <div className={`text-2xl font-bold ${
            engagementScore >= 80 ? 'text-green-600' :
            engagementScore >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {engagementScore}%
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {student.streak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {student.consistencyScore}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Consistency</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {totalDays}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Active Days</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {avgActivitiesPerWeek.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Activities/Week</div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Activity Breakdown
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-16 text-sm text-slate-600 dark:text-slate-400">Goals</div>
            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${totalDays > 0 ? (daysWithGoals / totalDays) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="w-12 text-sm text-slate-600 dark:text-slate-400 text-right">
              {daysWithGoals}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-16 text-sm text-slate-600 dark:text-slate-400">Reflections</div>
            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${totalDays > 0 ? (daysWithReflections / totalDays) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="w-12 text-sm text-slate-600 dark:text-slate-400 text-right">
              {daysWithReflections}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-16 text-sm text-slate-600 dark:text-slate-400">Quizzes</div>
            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                style={{ width: `${totalDays > 0 ? (daysWithQuizzes / totalDays) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="w-12 text-sm text-slate-600 dark:text-slate-400 text-right">
              {daysWithQuizzes}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Pattern */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Weekly Activity Pattern
        </h4>
        <div className="flex items-end space-x-2 h-16">
          {dayNames.map(day => {
            const activityCount = weeklyActivity[day] || 0;
            const height = maxWeeklyActivity > 0 ? (activityCount / maxWeeklyActivity) * 100 : 0;
            return (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    day === mostActiveDay[0] ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
                  style={{ 
                    height: `${height}%`,
                    minHeight: activityCount > 0 ? '4px' : '2px'
                  }}
                ></div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {day}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {activityCount}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Trend */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Recent Activity Trend
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last 30 days vs previous 30 days
            </p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${activityTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {activityTrend >= 0 ? '+' : ''}{activityTrend.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Most active: {mostActiveDay[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementAnalytics;
