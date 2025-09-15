import React, { useState, useCallback } from 'react';
import Card from '../shared/Card';
import SmartScoreDisplay from '../shared/SmartScoreDisplay';
import { getSmartScore } from '../../services/geminiService';
import { SMARTScore } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { 
  calculateAverageSmartScore, 
  canSetGoal, 
  getProgressMessage 
} from '../../utils/progressUtils';

interface GoalSetterProps {
  onGoalSet: (goal: string, smartScore?: SMARTScore) => Promise<void>;
}

const GoalSetter: React.FC<GoalSetterProps> = ({ onGoalSet }) => {
  const { studentData } = useApp();
  const [goal, setGoal] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [analysis, setAnalysis] = useState<{score: SMARTScore, feedback: string} | null>(null);
  const [showThresholdInfo, setShowThresholdInfo] = useState(false);

  const currentProgress = studentData?.progress;
  const requiredThreshold = currentProgress?.currentSmartThreshold || 40;
  const progressMessage = currentProgress ? getProgressMessage(currentProgress) : '';

  const handleAnalyze = useCallback(async () => {
    if (!goal.trim()) return;
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const result = await getSmartScore(goal);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing goal:", error);
      // Provide fallback scoring for demo
      setAnalysis({
        score: {
          specific: 3,
          measurable: 3,
          achievable: 4,
          realistic: 4,
          timeBound: 2,
        },
        feedback: "Analysis temporarily unavailable. Please refine your goal and try again."
      });
    } finally {
      setLoadingAnalysis(false);
    }
  }, [goal]);

  const handleSetGoal = async () => {
    if (!goal.trim()) return;
    
    // Check if goal needs analysis first
    if (!analysis) {
      alert('Please analyze your goal with AI first to ensure it meets SMART criteria.');
      return;
    }

    // Check if goal meets threshold
    if (!canSetGoal(analysis.score, requiredThreshold)) {
      const currentScore = calculateAverageSmartScore(analysis.score);
      alert(`Goal quality too low! Your score: ${currentScore}%. Required: ${requiredThreshold}%.\n\nPlease improve your goal based on the AI feedback and analyze again.`);
      return;
    }

    setIsSettingGoal(true);
    try {
        await onGoalSet(goal, analysis.score);
        setGoal('');
        setAnalysis(null);
    } catch (error) {
        console.error("Failed to set goal", error);
        alert('Failed to set goal. Please try again.');
    } finally {
        setIsSettingGoal(false);
    }
  };

  const currentScore = analysis ? calculateAverageSmartScore(analysis.score) : 0;
  const meetsThreshold = analysis ? canSetGoal(analysis.score, requiredThreshold) : false;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 bg-indigo-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Set Today's Goal</h3>
        </div>
        <button
          onClick={() => setShowThresholdInfo(!showThresholdInfo)}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          ℹ️ Progress Info
        </button>
      </div>

      {/* Progress Information */}
      {showThresholdInfo && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Your SMART Goal Progress
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Current Level:</span>
              <span className="font-medium">{requiredThreshold}% minimum required</span>
            </div>
            <div className="flex justify-between">
              <span>Goals Analyzed:</span>
              <span className="font-medium">{currentProgress?.goalsAnalyzed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Score:</span>
              <span className="font-medium">{currentProgress?.averageSmartScore || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>Days Active:</span>
              <span className="font-medium">{currentProgress?.daysActive || 0}</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
            {progressMessage}
          </p>
        </div>
      )}

      {/* Threshold Indicator */}
      <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-900/20 dark:to-green-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Required SMART Score:</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${requiredThreshold}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold">{requiredThreshold}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter your goal for today. Make it specific, measurable, achievable, relevant, and time-bound..."
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          rows={4}
        />
      </div>

      <div className="flex space-x-3 mt-4">
        <button
          onClick={handleAnalyze}
          disabled={!goal.trim() || loadingAnalysis}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {loadingAnalysis ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            '🤖 Analyze with AI'
          )}
        </button>

        <button
          onClick={handleSetGoal}
          disabled={!goal.trim() || !analysis || !meetsThreshold || isSettingGoal}
          className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
            meetsThreshold 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-400 cursor-not-allowed text-white'
          }`}
        >
          {isSettingGoal ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Setting Goal...
            </>
          ) : (
            <>
              {meetsThreshold ? '✅' : '❌'} Set Goal
            </>
          )}
        </button>
      </div>

      {/* Current Score Display */}
      {analysis && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Goal Score:</span>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              meetsThreshold 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {currentScore}% {meetsThreshold ? '✅' : '❌'}
            </div>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">✨ AI Feedback</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">{analysis.feedback}</p>
            <div className="mt-3">
              <SmartScoreDisplay score={analysis.score} size="medium" showAverage={true} />
            </div>
          </div>
          
          {!meetsThreshold && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Goal needs improvement!</strong> Your score ({currentScore}%) is below the required {requiredThreshold}%. 
                Please revise your goal based on the AI feedback above and analyze again.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GoalSetter;