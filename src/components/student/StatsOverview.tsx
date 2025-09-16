import React, { useMemo } from 'react';
import { DailyEntry, ConfidenceLevel, SMARTScore } from '@/types';
import Card from '../shared/Card';
import SmartScoreDisplay from '../shared/SmartScoreDisplay';

interface StatsOverviewProps {
  entries: DailyEntry[];
  className?: string;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ entries, className = '' }) => {
  const stats = useMemo(() => {
    const totalDays = entries.length;
    const completedGoals = entries.filter(e => e.goal?.completed).length;
    const reflectionDays = entries.filter(e => e.reflection).length;
    const quizDays = entries.filter(e => e.quizEvaluation).length;
    
    const avgReflectionDepth = reflectionDays > 0 
      ? entries.reduce((sum, e) => sum + (e.reflection?.depth || 0), 0) / reflectionDays
      : 0;
    
    const avgQuizScore = quizDays > 0
      ? entries.reduce((sum, e) => {
          if (e.quizEvaluation) {
            return sum + (e.quizEvaluation.score / e.quizEvaluation.total);
          }
          return sum;
        }, 0) / quizDays * 100
      : 0;

    // SMART Score Analytics
    const smartScoreEntries = entries.filter(e => e.goal?.smartScore);
    const avgSmartScore = smartScoreEntries.length > 0
      ? smartScoreEntries.reduce((acc, e) => {
          const score = e.goal!.smartScore!;
          return {
            specific: acc.specific + score.specific,
            measurable: acc.measurable + score.measurable,
            achievable: acc.achievable + score.achievable,
            realistic: acc.realistic + score.realistic,
            timeBound: acc.timeBound + score.timeBound,
          };
        }, { specific: 0, measurable: 0, achievable: 0, realistic: 0, timeBound: 0 })
      : null;

    if (avgSmartScore) {
      const count = smartScoreEntries.length;
      avgSmartScore.specific /= count;
      avgSmartScore.measurable /= count;
      avgSmartScore.achievable /= count;
      avgSmartScore.realistic /= count;
      avgSmartScore.timeBound /= count;
    }

    const confidenceLevels = entries.reduce((acc, e) => {
      if (e.reflection?.confidenceLevel) {
        acc[e.reflection.confidenceLevel] = (acc[e.reflection.confidenceLevel] || 0) + 1;
      }
      return acc;
    }, {} as Record<ConfidenceLevel, number>);

    // Current streak calculation
    let currentStreak = 0;
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const entry of sortedEntries) {
      if (entry.goal?.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalDays,
      completedGoals,
      reflectionDays,
      quizDays,
      goalCompletionRate: totalDays > 0 ? (completedGoals / totalDays) * 100 : 0,
      reflectionRate: totalDays > 0 ? (reflectionDays / totalDays) * 100 : 0,
      quizParticipationRate: totalDays > 0 ? (quizDays / totalDays) * 100 : 0,
      avgReflectionDepth,
      avgQuizScore,
      confidenceLevels,
      currentStreak,
      avgSmartScore: avgSmartScore as SMARTScore | null,
      smartScoreCount: smartScoreEntries.length
    };
  }, [entries]);

  const getConfidenceColor = (level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH:
        return 'text-green-600 dark:text-green-400';
      case ConfidenceLevel.MEDIUM:
        return 'text-yellow-600 dark:text-yellow-400';
      case ConfidenceLevel.LOW:
        return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <Card className={className}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        📊 Your Statistics
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Goal Completion Rate */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.goalCompletionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Goal Completion</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.completedGoals}/{stats.totalDays} goals completed
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Current Streak</div>
          <div className="text-xs text-slate-500 mt-1">consecutive completions</div>
        </div>

        {/* Reflection Rate */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.reflectionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Reflection Rate</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.reflectionDays}/{stats.totalDays} days reflected
          </div>
        </div>

        {/* Average Reflection Depth */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.avgReflectionDepth.toFixed(1)}/5
          </div>
          <div className="text-sm text-indigo-600 dark:text-indigo-400">Avg Depth</div>
          <div className="text-xs text-slate-500 mt-1">reflection quality</div>
        </div>

        {/* Quiz Performance */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.avgQuizScore.toFixed(1)}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Quiz Average</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.quizDays} quizzes taken
          </div>
        </div>

        {/* Quiz Participation */}
        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {stats.quizParticipationRate.toFixed(1)}%
          </div>
          <div className="text-sm text-teal-600 dark:text-teal-400">Quiz Participation</div>
          <div className="text-xs text-slate-500 mt-1">completion rate</div>
        </div>
      </div>

      {/* SMART Score Analytics */}
      {stats.avgSmartScore && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
            🎯 Average SMART Score ({stats.smartScoreCount} goals analyzed)
          </h4>
          <SmartScoreDisplay 
            score={stats.avgSmartScore} 
            size="medium" 
            showAverage={true}
          />
        </div>
      )}

      {/* Confidence Distribution */}
      {stats.reflectionDays > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
            Confidence Distribution
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.confidenceLevels).map(([level, count]) => {
              const countNum = Number(count || 0);
              return (
                <div key={level} className="text-center">
                  <div className={`text-lg font-bold ${getConfidenceColor(level as ConfidenceLevel)}`}>
                    {countNum}
                  </div>
                  <div className={`text-xs capitalize ${getConfidenceColor(level as ConfidenceLevel)}`}>
                    {level}
                  </div>
                  <div className="text-xs text-slate-500">
                    {((countNum / stats.reflectionDays) * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatsOverview;
