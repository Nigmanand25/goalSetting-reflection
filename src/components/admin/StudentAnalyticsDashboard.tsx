import React, { useState, useEffect } from 'react';
import { StudentData, ConfidenceLevel } from '@/types';
import Card from '../shared/Card';
import SmartScoreAnalytics from './SmartScoreAnalytics';
import ReflectionAnalytics from './ReflectionAnalytics';
import QuizAnalytics from './QuizAnalytics';
import EngagementAnalytics from './EngagementAnalytics';
import Timeline from '../student/Timeline';
import Badges from '../student/Badges';
import { calculateGoalSuccessRate } from '@/services/geminiService';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

interface StudentAnalyticsDashboardProps {
  student: StudentData;
  onBack: () => void;
}

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = 'blue' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500'
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: 'excellent' | 'good' | 'average' | 'needs-improvement'; label: string }> = ({ status, label }) => {
  const statusConfig = {
    'excellent': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: '🌟' },
    'good': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', icon: '👍' },
    'average': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', icon: '⚡' },
    'needs-improvement': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', icon: '⚠️' }
  };

  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className="mr-1">{config.icon}</span>
      {label}
    </span>
  );
};

const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'timeline'>('overview');
  const { user, userRole } = useAuth();
  const { removeUser } = useApp();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  // AI-powered Goal Success Rate State
  const [aiSuccessRate, setAiSuccessRate] = useState<{
    rate: number;
    analysis: string;
    insights: string[];
    loading: boolean;
    error: string | null;
  }>({
    rate: 0,
    analysis: '',
    insights: [],
    loading: true,
    error: null
  });

  // Calculate AI-powered goal success rate on component mount
  useEffect(() => {
    const calculateAISuccessRate = async () => {
      if (!student.entries || student.entries.length === 0) {
        setAiSuccessRate({
          rate: 0,
          analysis: 'No data available for analysis',
          insights: ['Start setting daily goals', 'Add reflections to track progress'],
          loading: false,
          error: null
        });
        return;
      }

      try {
        setAiSuccessRate(prev => ({ ...prev, loading: true, error: null }));
        
        const result = await calculateGoalSuccessRate(
          student.entries,
          student.name,
          user?.uid,
          userRole
        );
        
        setAiSuccessRate({
          rate: result.successRate,
          analysis: result.analysis,
          insights: result.insights,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error calculating AI success rate:', error);
        setAiSuccessRate({
          rate: 0,
          analysis: 'Unable to calculate success rate',
          insights: ['Please try again later'],
          loading: false,
          error: 'Analysis failed'
        });
      }
    };

    calculateAISuccessRate();
  }, [student.entries, student.name, user?.uid, userRole]);

  // Handle remove user
  const handleRemoveUser = async () => {
    if (!showRemoveConfirm) {
      setShowRemoveConfirm(true);
      return;
    }

    try {
      setIsRemoving(true);
      await removeUser(student.studentId);
      onBack(); // Go back to dashboard after successful removal
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert(`Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRemoving(false);
      setShowRemoveConfirm(false);
    }
  };

  const cancelRemove = () => {
    setShowRemoveConfirm(false);
  };
  
  // Enhanced Analytics Calculations (Fallback/Comparison)
  const totalEntries = student.entries?.length || 0;
  const totalGoals = student.entries?.filter(e => e.goal)?.length || 0;
  
  // TEMPORARY FIX: Consider goal "completed" if reflection + quiz are done OR explicitly marked complete
  const completedGoals = student.entries?.filter(e => 
    e.goal && (
      e.goal.completed === true || 
      (e.reflection && e.quizEvaluation) // Both reflection and quiz done = goal completed
    )
  )?.length || 0;
  
  const totalReflections = student.entries?.filter(e => e.reflection)?.length || 0;
  const totalQuizzes = student.entries?.filter(e => e.quizEvaluation)?.length || 0;
  const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // DEBUG: Log the actual data structure
  console.log('=== ANALYTICS DEBUG ===');
  console.log('Student:', student.name);
  console.log('Total entries:', totalEntries);
  console.log('Entries with goals:', totalGoals);
  console.log('Completed goals (with new logic):', completedGoals);
  console.log('Goal completion rate:', goalCompletionRate);
  console.log('Sample entries:', student.entries?.slice(0, 3));
  console.log('========================');

  // Calculate active days and consistency
  const firstEntry = student.entries?.reduce((earliest, entry) => 
    new Date(entry.date) < new Date(earliest.date) ? entry : earliest
  );
  const daysSinceStart = firstEntry ? 
    Math.ceil((new Date().getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Advanced metrics
  const smartScores = student.entries?.filter(e => e.goal?.smartPercentage) || [];
  const avgSmartScore = smartScores.length > 0 ? 
    smartScores.reduce((sum, e) => sum + (e.goal?.smartPercentage || 0), 0) / smartScores.length : 0;

  const reflections = student.entries?.filter(e => e.reflection) || [];
  const avgReflectionDepth = reflections.length > 0 ?
    reflections.reduce((sum, e) => sum + (e.reflection?.depth || 0), 0) / reflections.length : 0;

  const quizzes = student.entries?.filter(e => e.quizEvaluation) || [];
  const avgQuizScore = quizzes.length > 0 ?
    quizzes.reduce((sum, e) => sum + ((e.quizEvaluation?.score || 0) / (e.quizEvaluation?.total || 1)) * 100, 0) / quizzes.length : 0;

  // Learning progression metrics
  const recentEntries = student.entries?.slice(-7) || []; // Last 7 entries
  
  // Apply same completion logic for recent entries
  const recentCompletedGoals = recentEntries.filter(e => 
    e.goal && (
      e.goal.completed === true || 
      (e.reflection && e.quizEvaluation)
    )
  ).length;
  const recentGoalCompletion = recentCompletedGoals / Math.max(recentEntries.length, 1) * 100;
  
  // Confidence levels analysis
  const confidenceLevels = reflections.map(e => e.reflection?.confidenceLevel).filter(Boolean);
  const highConfidenceCount = confidenceLevels.filter(level => level === ConfidenceLevel.HIGH).length;
  const confidenceRate = confidenceLevels.length > 0 ? (highConfidenceCount / confidenceLevels.length) * 100 : 0;

  // Overall performance status
  const getOverallStatus = () => {
    const score = (goalCompletionRate + avgSmartScore + (avgReflectionDepth * 20) + avgQuizScore + student.consistencyScore) / 5;
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'average';
    return 'needs-improvement';
  };

  // Learning trend analysis
  const getLearningTrend = () => {
    if (recentGoalCompletion > goalCompletionRate + 10) return 'improving';
    if (recentGoalCompletion < goalCompletionRate - 10) return 'declining';
    return 'stable';
  };

  const tabs = [
    { id: 'overview', label: 'Quick Overview', icon: '🎯' },
    { id: 'details', label: 'Detailed Analytics', icon: '�' },
    { id: 'timeline', label: 'Progress Timeline', icon: '📅' },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-auto">
      <div className="p-6 space-y-6">
        
        {/* Header with Quick Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {student.name}
                </h1>
                <div className="flex items-center space-x-3 mb-3">
                  <StatusBadge status={getOverallStatus()} label={`Overall: ${getOverallStatus().replace('-', ' ')}`} />
                  <span className={`text-sm font-medium ${
                    getLearningTrend() === 'improving' ? 'text-green-600' :
                    getLearningTrend() === 'declining' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {getLearningTrend() === 'improving' ? '📈 Improving' :
                     getLearningTrend() === 'declining' ? '📉 Needs attention' : '➡️ Stable progress'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    🔥 {student.streak} day streak
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    📊 {totalEntries} total activities
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    ⏱️ {daysSinceStart} days active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Remove User Button */}
              {showRemoveConfirm ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRemoveUser}
                    disabled={isRemoving}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isRemoving ? 'Removing...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={cancelRemove}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRemoveUser}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  title={`Remove ${student.name}`}
                >
                  🗑️ Remove User
                </button>
              )}
              
              {/* Back Button */}
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* At-a-Glance Performance Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <ProgressRing progress={goalCompletionRate} size={80} color="green" />
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-3">Goal Success</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{completedGoals}/{totalGoals} completed</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <ProgressRing progress={avgSmartScore} size={80} color="blue" />
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-3">Goal Quality</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">SMART score avg</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <ProgressRing progress={(avgReflectionDepth / 5) * 100} size={80} color="purple" />
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-3">Reflection Depth</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{avgReflectionDepth.toFixed(1)}/5 average</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <ProgressRing progress={student.consistencyScore} size={80} color="orange" />
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-3">Consistency</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Daily engagement</p>
          </div>
        </div>

        {/* Key Insights Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
            💡 Key Insights at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📚</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Learning Activity</span>
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalEntries}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {daysSinceStart > 0 ? `${(totalEntries / daysSinceStart).toFixed(1)}/day` : 'Just started'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎯</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">AI Success Rate</span>
                  {aiSuccessRate.loading && (
                    <div className="animate-spin h-3 w-3 border border-green-400 border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>
              
              {aiSuccessRate.loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-green-200 dark:bg-green-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-green-200 dark:bg-green-700 rounded w-full"></div>
                </div>
              ) : aiSuccessRate.error ? (
                <div>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">Error</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    AI analysis failed
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">{aiSuccessRate.rate}%</div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    AI-powered analysis
                  </div>
                  {aiSuccessRate.analysis && (
                    <div className="text-xs text-green-500 dark:text-green-400 mt-1 italic">
                      "{aiSuccessRate.analysis}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💭</span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Reflection Quality</span>
              </div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{avgReflectionDepth.toFixed(1)}/5</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {reflections.length} reflections
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🧠</span>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Quiz Performance</span>
              </div>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{avgQuizScore.toFixed(0)}%</div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                {quizzes.length} quizzes taken
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Quick Action Items & Badges */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Performance Summary */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                    📈 Recent Performance (Last 7 Days)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{recentGoalCompletion.toFixed(0)}%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Goal completion</div>
                      <div className={`text-xs mt-1 ${
                        recentGoalCompletion > goalCompletionRate ? 'text-green-600' : 
                        recentGoalCompletion < goalCompletionRate ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {recentGoalCompletion > goalCompletionRate ? '↗️ Above average' :
                         recentGoalCompletion < goalCompletionRate ? '↘️ Below average' : '➡️ On track'}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{confidenceRate.toFixed(0)}%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">High confidence</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {highConfidenceCount}/{confidenceLevels.length} reflections
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges & Achievements */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                    🏆 Achievements
                  </h3>
                  {student.badges && student.badges.length > 0 ? (
                    <div className="space-y-2">
                      {student.badges.slice(0, 3).map((badge, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                          <span className="text-lg">{badge.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{badge.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{badge.description}</div>
                          </div>
                        </div>
                      ))}
                      {student.badges.length > 3 && (
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                          +{student.badges.length - 3} more badges
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                      <span className="text-2xl mb-2 block">🎯</span>
                      <div className="text-sm">No badges earned yet</div>
                      <div className="text-xs">Keep completing goals!</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights Section */}
              {!aiSuccessRate.loading && !aiSuccessRate.error && aiSuccessRate.insights.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">AI Insights & Recommendations</h3>
                  </div>
                  <div className="space-y-2">
                    {aiSuccessRate.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">💡</span>
                        <span className="text-sm text-blue-700 dark:text-blue-300">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Analytics Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SmartScoreAnalytics entries={student.entries || []} />
                <EngagementAnalytics student={student} entries={student.entries || []} />
              </div>
            </>
          )}

          {activeTab === 'details' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SmartScoreAnalytics entries={student.entries || []} />
                <QuizAnalytics entries={student.entries || []} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReflectionAnalytics entries={student.entries || []} />
                <EngagementAnalytics student={student} entries={student.entries || []} />
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
                📅 Complete Progress Timeline
              </h3>
              <Timeline entries={student.entries || []} />
            </div>
          )}
        </div>

        {/* Insights Section - Always Visible */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            💡 Key Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Analysis */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Performance Analysis
              </h4>
              <div className="space-y-3 text-sm">
                {goalCompletionRate >= 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-500 text-lg">✅</span>
                    <span className="text-green-700 dark:text-green-300">Excellent goal completion rate - keep up the great work!</span>
                  </div>
                )}
                {goalCompletionRate < 80 && goalCompletionRate >= 60 && (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-yellow-500 text-lg">⚠️</span>
                    <span className="text-yellow-700 dark:text-yellow-300">Good progress, but there's room for improvement in goal completion.</span>
                  </div>
                )}
                {goalCompletionRate < 60 && (
                  <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-red-500 text-lg">🚨</span>
                    <span className="text-red-700 dark:text-red-300">Focus needed on goal completion - consider setting more achievable targets.</span>
                  </div>
                )}
                {avgSmartScore >= 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-500 text-lg">🧠</span>
                    <span className="text-blue-700 dark:text-blue-300">Excellent SMART goal quality - shows strong planning skills.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Insights */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔥</span>
                Engagement Patterns
              </h4>
              <div className="space-y-3 text-sm">
                {totalReflections / Math.max(totalGoals, 1) >= 0.8 && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-purple-500 text-lg">💭</span>
                    <span className="text-purple-700 dark:text-purple-300">Excellent reflection habit - high self-awareness demonstrated.</span>
                  </div>
                )}
                {totalQuizzes > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <span className="text-indigo-500 text-lg">📊</span>
                    <span className="text-indigo-700 dark:text-indigo-300">Actively engaging with quiz assessments to test knowledge.</span>
                  </div>
                )}
                {student.streak > 7 && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-orange-500 text-lg">🔥</span>
                    <span className="text-orange-700 dark:text-orange-300">Impressive learning streak - maintaining excellent momentum!</span>
                  </div>
                )}
                {student.consistencyScore >= 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-500 text-lg">📈</span>
                    <span className="text-green-700 dark:text-green-300">Strong consistency in learning activities.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsDashboard;
