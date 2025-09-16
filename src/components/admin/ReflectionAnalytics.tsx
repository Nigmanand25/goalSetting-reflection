import React from 'react';
import { DailyEntry, ConfidenceLevel } from '@/types';
import Card from '../shared/Card';

// Frequency Polygon Component (same as in SmartScoreAnalytics)
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

interface ReflectionAnalyticsProps {
  entries: DailyEntry[];
}

const ReflectionAnalytics: React.FC<ReflectionAnalyticsProps> = ({ entries }) => {
  // Extract reflections from entries
  const reflections = entries
    .filter(entry => entry.reflection)
    .map(entry => ({
      date: entry.date,
      reflection: entry.reflection!
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (reflections.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <span className="text-2xl mr-2">💭</span>
          Reflection Analytics
        </h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💭</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No reflections available yet
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Start reflecting on goals to see depth and confidence analytics
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalReflections = reflections.length;
  const avgDepth = reflections.reduce((sum, r) => sum + r.reflection.depth, 0) / totalReflections;
  
  // Confidence level distribution
  const confidenceDistribution = reflections.reduce(
    (acc, r) => {
      acc[r.reflection.confidenceLevel] = (acc[r.reflection.confidenceLevel] || 0) + 1;
      return acc;
    },
    {} as Record<ConfidenceLevel, number>
  );

  // Depth trend over time
  const depthTrend = reflections.slice(-10).map(r => r.reflection.depth);
  const recentAvgDepth = depthTrend.reduce((a, b) => a + b, 0) / depthTrend.length;
  const earlierDepth = reflections.slice(0, Math.min(10, reflections.length)).reduce((sum, r) => sum + r.reflection.depth, 0) / Math.min(10, reflections.length);
  const depthImprovement = recentAvgDepth - earlierDepth;

  // Get confidence level colors
  const getConfidenceColor = (level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH: return 'bg-green-500';
      case ConfidenceLevel.MEDIUM: return 'bg-yellow-500';
      case ConfidenceLevel.LOW: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getConfidenceColorText = (level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH: return 'text-green-600';
      case ConfidenceLevel.MEDIUM: return 'text-yellow-600';
      case ConfidenceLevel.LOW: return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  // Prepare data for frequency polygons
  const depthProgressionData = reflections.map(reflection => ({
    date: reflection.date,
    value: reflection.reflection.depth
  }));

  // Confidence level as numeric values for frequency polygon
  const confidenceProgressionData = reflections.map(reflection => ({
    date: reflection.date,
    value: reflection.reflection.confidenceLevel === ConfidenceLevel.HIGH ? 3 :
           reflection.reflection.confidenceLevel === ConfidenceLevel.MEDIUM ? 2 : 1
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <span className="text-2xl mr-2">💭</span>
          Reflection Analytics
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400">Depth Trend</div>
          <div className={`text-lg font-semibold ${depthImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {depthImprovement >= 0 ? '+' : ''}{depthImprovement.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Main Frequency Polygons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FrequencyPolygon 
          data={depthProgressionData} 
          color="#8b5cf6" 
          title="📈 Reflection Depth Progression"
          yAxisLabel="Depth (1-5)"
        />
        <FrequencyPolygon 
          data={confidenceProgressionData} 
          color="#10b981" 
          title="🎯 Confidence Level Progression"
          yAxisLabel="Confidence (1-3)"
        />
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalReflections}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Total Reflections</div>
        </div>
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {avgDepth.toFixed(1)}/5
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Average Depth</div>
        </div>
        <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {recentAvgDepth.toFixed(1)}/5
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">Recent Average</div>
        </div>
        <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.max(...Object.values(confidenceDistribution).map(val => val as number))}
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-300">Peak Confidence</div>
        </div>
      </div>

      {/* Confidence Level Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Confidence Level Distribution
        </h4>
        <div className="space-y-2">
          {Object.entries(confidenceDistribution).map(([level, count]) => {
            const percentage = ((count as number) / totalReflections) * 100;
            return (
              <div key={level} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-slate-600 dark:text-slate-400 capitalize">
                  {level.toLowerCase()}
                </div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getConfidenceColor(level as ConfidenceLevel)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-slate-600 dark:text-slate-400 text-right">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Depth Trend Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Reflection Depth Trend (Last 10)
        </h4>
        <div className="flex items-end space-x-1 h-16">
          {depthTrend.map((depth, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  depth >= 4 ? 'bg-green-500' :
                  depth >= 3 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ 
                  height: `${(depth / 5) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {depth}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reflection Sample */}
      {reflections.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Latest Reflection
          </h4>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(reflections[reflections.length - 1].date).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${getConfidenceColorText(reflections[reflections.length - 1].reflection.confidenceLevel)}`}>
                  {reflections[reflections.length - 1].reflection.confidenceLevel.toLowerCase()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Depth: {reflections[reflections.length - 1].reflection.depth}/5
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
              {reflections[reflections.length - 1].reflection.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionAnalytics;
