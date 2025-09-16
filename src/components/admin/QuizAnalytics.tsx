import React from 'react';
import { DailyEntry } from '@/types';
import Card from '../shared/Card';

// Frequency Polygon Component (same as in other analytics)
const FrequencyPolygon: React.FC<{ 
  data: { date: string; value: number }[]; 
  color?: string; 
  title: string;
  yAxisLabel?: string;
}> = ({ data, color = '#3b82f6', title, yAxisLabel = 'Score' }) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const width = 100;
  const height = 60;
  const padding = 10;
  
  // Create SVG path for the frequency polygon
  const pathData = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((point.value - minValue) / range) * (height - 2 * padding);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create area fill path
  const areaPath = data.length > 0 ? 
    `${pathData} L ${(data.length - 1) / (data.length - 1) * (width - 2 * padding) + padding} ${height - padding} L ${padding} ${height - padding} Z` : '';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{title}</h4>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1={padding}
              y1={height - padding - (percent / 100) * (height - 2 * padding)}
              x2={width - padding}
              y2={height - padding - (percent / 100) * (height - 2 * padding)}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-200 dark:text-slate-600"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill={color}
            fillOpacity="0.1"
          />
          
          {/* Main line */}
          <path
            d={pathData}
            stroke={color}
            strokeWidth="2"
            fill="none"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((point.value - minValue) / range) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 -ml-8">
          <span>{maxValue.toFixed(0)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
          <span>{minValue.toFixed(0)}</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
        <span>{data.length > 0 ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
        <span>{data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color }}>{maxValue.toFixed(1)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Peak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Avg</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">{data.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Points</div>
        </div>
      </div>
    </div>
  );
};

interface QuizAnalyticsProps {
  entries: DailyEntry[];
}

const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({ entries }) => {
  // Extract quiz evaluations from entries
  const quizzes = entries
    .filter(entry => entry.quizEvaluation)
    .map(entry => ({
      date: entry.date,
      quiz: entry.quizEvaluation!
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (quizzes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Quiz Performance Analytics
        </h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No quiz results available yet
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Take some quizzes to see performance analytics and trends
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalQuizzes = quizzes.length;
  const totalCorrect = quizzes.reduce((sum, q) => sum + q.quiz.correctAnswers, 0);
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.quiz.total, 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  
  // Performance trend
  const performanceScores = quizzes.map(q => (q.quiz.score / q.quiz.total) * 100);
  const averageScore = performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length;
  
  // Recent vs Earlier performance
  const recentScores = performanceScores.slice(-5);
  const earlierScores = performanceScores.slice(0, Math.min(5, performanceScores.length));
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
  const improvement = recentAvg - earlierAvg;

  // Performance distribution
  const performanceRanges = performanceScores.reduce(
    (acc, score) => {
      if (score >= 90) acc.excellent++;
      else if (score >= 80) acc.good++;
      else if (score >= 70) acc.average++;
      else acc.needsImprovement++;
      return acc;
    },
    { excellent: 0, good: 0, average: 0, needsImprovement: 0 }
  );

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Prepare data for frequency polygons
  const scoreProgressionData = quizzes.map(quiz => ({
    date: quiz.date,
    value: (quiz.quiz.score / quiz.quiz.total) * 100
  }));

  const accuracyProgressionData = quizzes.map(quiz => ({
    date: quiz.date,
    value: (quiz.quiz.correctAnswers / quiz.quiz.total) * 100
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Quiz Performance Analytics
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400">Improvement</div>
          <div className={`text-lg font-semibold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Main Frequency Polygons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FrequencyPolygon 
          data={scoreProgressionData} 
          color="#3b82f6" 
          title="📈 Quiz Score Progression"
          yAxisLabel="Score (%)"
        />
        <FrequencyPolygon 
          data={accuracyProgressionData} 
          color="#10b981" 
          title="🎯 Accuracy Progression"
          yAxisLabel="Accuracy (%)"
        />
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalQuizzes}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Quizzes Taken</div>
        </div>
        <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {overallAccuracy.toFixed(0)}%
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">Overall Accuracy</div>
        </div>
        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {averageScore.toFixed(0)}%
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Average Score</div>
        </div>
        <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {recentAvg.toFixed(0)}%
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-300">Recent Average</div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Performance Distribution
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Excellent (90%+)', count: performanceRanges.excellent, color: 'bg-green-500' },
            { label: 'Good (80-89%)', count: performanceRanges.good, color: 'bg-blue-500' },
            { label: 'Average (70-79%)', count: performanceRanges.average, color: 'bg-yellow-500' },
            { label: 'Needs Improvement (<70%)', count: performanceRanges.needsImprovement, color: 'bg-red-500' }
          ].map(({ label, count, color }) => {
            const percentage = totalQuizzes > 0 ? (count / totalQuizzes) * 100 : 0;
            return (
              <div key={label} className="flex items-center space-x-3">
                <div className="w-36 text-sm text-slate-600 dark:text-slate-400">
                  {label}
                </div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-8 text-sm text-slate-600 dark:text-slate-400 text-right">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="space-y-2 mb-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Performance Trend (Last 10 Quizzes)
        </h4>
        <div className="flex items-end space-x-1 h-16">
          {performanceScores.slice(-10).map((score, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all duration-300 ${getPerformanceColor(score)}`}
                style={{ 
                  height: `${score}%`,
                  minHeight: '4px'
                }}
              ></div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {score.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Quiz Breakdown */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Recent Quiz Results
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {quizzes.slice(-5).reverse().map((quiz, index) => {
            const score = (quiz.quiz.score / quiz.quiz.total) * 100;
            return (
              <div key={index} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded p-2">
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(quiz.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {quiz.quiz.correctAnswers}/{quiz.quiz.total} correct
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  score >= 90 ? 'text-green-600' :
                  score >= 80 ? 'text-blue-600' :
                  score >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {score.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
