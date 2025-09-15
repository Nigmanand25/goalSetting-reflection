import React, { useMemo } from 'react';
import { ConfidenceLevel } from '../../types';
import GoalSetter from './GoalSetter';
import Reflector from './Reflector';
import QuizCard from './QuizCard';
import ProgressTracker from './ProgressTracker';
import Timeline from './Timeline';
import { useApp } from '../../contexts/AppContext';
import Card from '../shared/Card';
import Badges from './Badges';

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <Card className="h-36 bg-slate-200 dark:bg-slate-800"></Card>
        <Card className="h-24 bg-slate-200 dark:bg-slate-800"></Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="h-64 bg-slate-200 dark:bg-slate-800"></Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="h-96 bg-slate-200 dark:bg-slate-800"></Card>
            </div>
        </div>
    </div>
);


const StudentDashboard: React.FC = () => {
  const { studentData, loading, error, addGoal, addReflection } = useApp();

  const todaysEntry = useMemo(() => {
    if (!studentData?.entries) return undefined;
    const todayStr = new Date().toISOString().split('T')[0];
    return studentData.entries.find(entry => entry.date.startsWith(todayStr));
  }, [studentData]);

  const view = useMemo(() => {
    if (!todaysEntry || !todaysEntry.goal) return 'goal';
    if (!todaysEntry.reflection) return 'reflect';
    if (!todaysEntry.quizEvaluation) return 'quiz';
    return 'done'; // All tasks for the day are complete
  }, [todaysEntry]);

  const handleGoalSet = async (goalText: string) => {
    await addGoal(goalText);
  };

  const handleReflectionSubmit = async (reflectionText: string, depth: number, confidence: ConfidenceLevel) => {
    await addReflection({ text: reflectionText, depth: depth, confidenceLevel: confidence });
  };
  
  if (loading) return <LoadingSkeleton />;
  if (error) return <Card><p className="text-center text-red-500">{error}</p></Card>;
  if (!studentData) return <Card><p className="text-center text-slate-500">No student data available.</p></Card>;
  
  const renderCurrentTask = () => {
      switch (view) {
          case 'goal':
              return <GoalSetter onGoalSet={handleGoalSet} />;
          case 'reflect':
              return <Reflector onReflectionSubmit={handleReflectionSubmit} />;
          case 'quiz':
              return <QuizCard />;
          case 'done':
              return <Card><h3 className="text-xl font-semibold text-center text-green-500">Great work today! ✨</h3><p className="text-center text-slate-500 dark:text-slate-400 mt-2">You've completed all your tasks. See you tomorrow!</p></Card>;
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Welcome back, {studentData.name}!
      </h2>
      
      <ProgressTracker 
        consistency={studentData.consistencyScore}
        streak={studentData.streak}
      />

      {studentData.badges && studentData.badges.length > 0 && (
          <Badges badges={studentData.badges} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {renderCurrentTask()}
        </div>
        
        <div className="lg:col-span-1">
          <Timeline entries={studentData.entries} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;