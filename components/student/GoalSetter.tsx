import React, { useState, useCallback } from 'react';
import Card from '../shared/Card';
import SmartScoreDisplay from '../shared/SmartScoreDisplay';
import { getSmartScore } from '../../services/geminiService';
import { SMARTScore } from '../../types';

interface GoalSetterProps {
  onGoalSet: (goal: string, smartScore?: SMARTScore) => Promise<void>;
}

const GoalSetter: React.FC<GoalSetterProps> = ({ onGoalSet }) => {
  const [goal, setGoal] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [analysis, setAnalysis] = useState<{score: SMARTScore, feedback: string} | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!goal.trim()) return;
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const result = await getSmartScore(goal);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing goal:", error);
      // Optionally show an error to the user
    } finally {
      setLoadingAnalysis(false);
    }
  }, [goal]);

  const handleSetGoal = async () => {
    if (!goal.trim()) return;
    setIsSettingGoal(true);
    try {
        await onGoalSet(goal, analysis?.score);
    } catch (error) {
        console.error("Failed to set goal", error);
        // Optionally show an error to the user
    } finally {
        setIsSettingGoal(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 bg-indigo-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">What's Your Goal for Today?</h3>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Set a clear and ambitious goal to kickstart your day.</p>
      
      <div className="mt-4">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Practice 5 advanced loop problems in Python today"
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          rows={3}
          disabled={isSettingGoal}
        />
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">✨ AI Feedback</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">{analysis.feedback}</p>
            <div className="mt-3">
              <SmartScoreDisplay score={analysis.score} size="medium" showAverage={true} />
            </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loadingAnalysis || !goal.trim() || isSettingGoal}
          className="w-full sm:w-auto flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50 transition"
        >
          {loadingAnalysis ? 'Analyzing...' : 'Analyze with AI'}
        </button>
        <button
          onClick={handleSetGoal}
          disabled={!goal.trim() || isSettingGoal || loadingAnalysis}
          className="w-full sm:w-auto flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {isSettingGoal ? 'Setting...' : 'Set Goal'}
        </button>
      </div>
    </Card>
  );
};

export default GoalSetter;