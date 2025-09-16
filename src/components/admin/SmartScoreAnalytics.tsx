import React, { useState } from 'react';
import { DailyEntry, SMARTScore } from '@/types';
import Card from '../shared/Card';

// Frequency Polygon Component
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

interface SmartScoreAnalyticsProps {
  entries: DailyEntry[];
}

const SmartScoreAnalytics: React.FC<SmartScoreAnalyticsProps> = ({ entries }) => {
  const [expandedSections, setExpandedSections] = useState({
    criteria: false,
    breakdown: false
  });
  
  const toggleSection = (section: 'criteria' | 'breakdown') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Extract SMART scores from entries
  const smartScores = entries
    .filter(entry => entry.goal?.smartScore)
    .map(entry => ({
      date: entry.date,
      smartScore: entry.goal.smartScore!,
      percentage: entry.goal.smartPercentage || 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (smartScores.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <span className="text-2xl mr-2">🧠</span>
          SMART Score Analytics
        </h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No SMART scores available yet
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Start setting goals with AI analysis to see analytics here
          </p>
        </div>
      </div>
    );
  }

  // Calculate average scores for each SMART criteria
  const avgScores: Record<string, number> = smartScores.reduce(
    (acc, curr) => ({
      specific: acc.specific + curr.smartScore.specific,
      measurable: acc.measurable + curr.smartScore.measurable,
      achievable: acc.achievable + curr.smartScore.achievable,
      realistic: acc.realistic + curr.smartScore.realistic,
      timeBound: acc.timeBound + curr.smartScore.timeBound,
    }),
    { specific: 0, measurable: 0, achievable: 0, realistic: 0, timeBound: 0 }
  );

  const count = smartScores.length;
  Object.keys(avgScores).forEach(key => {
    avgScores[key] = Math.round((avgScores[key] / count) * 10) / 10;
  });

  // Calculate overall trend
  const overallPercentages = smartScores.map(s => s.percentage);
  const latestPercentage = overallPercentages[overallPercentages.length - 1] || 0;
  const firstPercentage = overallPercentages[0] || 0;
  const trend = latestPercentage - firstPercentage;

  // Prepare data for frequency polygons
  const overallScoreData = smartScores.map(entry => ({
    date: entry.date,
    value: entry.percentage
  }));

  const specificScoreData = smartScores.map(entry => ({
    date: entry.date,
    value: entry.smartScore.specific * 20 // Convert to percentage
  }));

  const measurableScoreData = smartScores.map(entry => ({
    date: entry.date,
    value: entry.smartScore.measurable * 20
  }));

  const achievableScoreData = smartScores.map(entry => ({
    date: entry.date,
    value: entry.smartScore.achievable * 20
  }));

  const realisticScoreData = smartScores.map(entry => ({
    date: entry.date,
    value: entry.smartScore.realistic * 20
  }));

  const timeBoundScoreData = smartScores.map(entry => ({
    date: entry.date,
    value: entry.smartScore.timeBound * 20
  }));

  return (
    <div className="space-y-4">
      {/* Main Overview Card - Always Visible & Prominent */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-xl border-2 border-blue-200 dark:border-slate-600 p-6 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent dark:from-slate-700 dark:to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="text-3xl mr-3 drop-shadow-sm">🧠</span>
              <div>
                <div className="text-xl font-bold">SMART Score Analytics</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">AI-Powered Goal Analysis</div>
              </div>
            </h3>
            <div className="text-right bg-white dark:bg-slate-800 rounded-lg p-3 shadow-md border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overall Trend</div>
              <div className={`text-xl font-bold flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-1">{trend >= 0 ? '📈' : '📉'}</span>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </div>
            </div>
          </div>

        {/* Main Overall Score Frequency Polygon */}
        <FrequencyPolygon 
          data={overallScoreData} 
          color="#3b82f6" 
          title="📈 Overall SMART Score Progression"
          yAxisLabel="Score (%)"
        />

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-600 mt-6">
            <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {smartScores.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Goals Analyzed</div>
            </div>
            <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {latestPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Latest Score</div>
            </div>
            <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(overallPercentages.reduce((a, b) => a + b, 0) / overallPercentages.length).toFixed(0)}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Average Score</div>
            </div>
            <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.max(...Object.values(avgScores)).toFixed(1)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Best Criteria</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Criteria Card - Collapsible */}
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 transition-all duration-300 ${
        expandedSections.criteria 
          ? 'border-green-200 dark:border-green-800 shadow-green-100 dark:shadow-green-900/20' 
          : 'border-dashed border-slate-300 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700'
      }`}>
        <div 
          className="flex justify-between items-center p-5 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent dark:hover:from-green-900/20 dark:hover:to-transparent transition-all duration-200 rounded-t-xl group"
          onClick={() => toggleSection('criteria')}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-all duration-200 ${
              expandedSections.criteria 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
            }`}>
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Individual SMART Criteria
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {expandedSections.criteria ? 'Detailed frequency analysis' : 'Click to view 5 criteria charts'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            </div>
            <div className={`p-2 rounded-full transition-all duration-200 ${
              expandedSections.criteria 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <svg 
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${expandedSections.criteria ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {expandedSections.criteria && (
          <div className="p-6 pt-0 border-t border-green-200 dark:border-green-800 bg-gradient-to-b from-green-50/30 to-transparent dark:from-green-900/10 dark:to-transparent">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="transform transition-all duration-300 hover:scale-105">
                <FrequencyPolygon 
                  data={specificScoreData} 
                  color="#10b981" 
                  title="🎯 Specific Scores"
                />
              </div>
              <div className="transform transition-all duration-300 hover:scale-105">
                <FrequencyPolygon 
                  data={measurableScoreData} 
                  color="#f59e0b" 
                  title="📊 Measurable Scores"
                />
              </div>
              <div className="transform transition-all duration-300 hover:scale-105">
                <FrequencyPolygon 
                  data={achievableScoreData} 
                  color="#8b5cf6" 
                  title="✅ Achievable Scores"
                />
              </div>
              <div className="transform transition-all duration-300 hover:scale-105">
                <FrequencyPolygon 
                  data={realisticScoreData} 
                  color="#ef4444" 
                  title="🎲 Realistic Scores"
                />
              </div>
              <div className="lg:col-span-2 flex justify-center">
                <div className="w-full lg:w-1/2 transform transition-all duration-300 hover:scale-105">
                  <FrequencyPolygon 
                    data={timeBoundScoreData} 
                    color="#06b6d4" 
                    title="⏰ Time-bound Scores"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdown Card - Collapsible */}
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 transition-all duration-300 ${
        expandedSections.breakdown 
          ? 'border-purple-200 dark:border-purple-800 shadow-purple-100 dark:shadow-purple-900/20' 
          : 'border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700'
      }`}>
        <div 
          className="flex justify-between items-center p-5 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent dark:hover:from-purple-900/20 dark:hover:to-transparent transition-all duration-200 rounded-t-xl group"
          onClick={() => toggleSection('breakdown')}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-all duration-200 ${
              expandedSections.breakdown 
                ? 'bg-purple-100 dark:bg-purple-900/30' 
                : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30'
            }`}>
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Average Criteria Breakdown
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {expandedSections.breakdown ? 'Performance metrics by criteria' : 'Progress bars for each SMART element'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              {Object.values(avgScores).reduce((a, b) => a + b, 0) / 5 >= 4 ? '🟢 Excellent' :
               Object.values(avgScores).reduce((a, b) => a + b, 0) / 5 >= 3 ? '🟡 Good' : '🔴 Needs Work'}
            </div>
            <div className={`p-2 rounded-full transition-all duration-200 ${
              expandedSections.breakdown 
                ? 'bg-purple-100 dark:bg-purple-900/30' 
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <svg 
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${expandedSections.breakdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {expandedSections.breakdown && (
          <div className="p-6 pt-0 border-t border-purple-200 dark:border-purple-800 bg-gradient-to-b from-purple-50/30 to-transparent dark:from-purple-900/10 dark:to-transparent">
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 shadow-inner border border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                {Object.entries(avgScores).map(([criteria, score], index) => (
                  <div key={criteria} className="space-y-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          score >= 4 ? 'bg-green-500' :
                          score >= 3 ? 'bg-yellow-500' :
                          score >= 2 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {criteria.charAt(0).toUpperCase() + criteria.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {score}/5
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          score >= 4 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          score >= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          score >= 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {((score/5) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 shadow-inner">
                      <div
                        className={`h-4 rounded-full transition-all duration-1000 shadow-sm ${
                          score >= 4 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          score >= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          score >= 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ 
                          width: `${(score / 5) * 100}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartScoreAnalytics;
