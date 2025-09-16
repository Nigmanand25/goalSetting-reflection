import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import { generateWeeklySummary } from '@/services/geminiService';
import { AdminDashboardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AiSummaryProps {
    adminData: AdminDashboardData;
}

const AiSummary: React.FC<AiSummaryProps> = ({ adminData }) => {
  const { user, userRole } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!adminData) return;
      setLoading(true);
      try {
        const result = await generateWeeklySummary(adminData, user?.uid, userRole);
        setSummary(result);
      } catch (error) {
        console.error("Failed to generate summary:", error);
        setSummary("An error occurred while generating the summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [adminData]);

  return (
    <Card>
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">AI Weekly Insights</h3>
        </div>
        
        <div className="mt-4 text-slate-600 dark:text-slate-300">
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
            ) : (
                <p className="whitespace-pre-wrap">{summary}</p>
            )}
        </div>
    </Card>
  );
};

export default AiSummary;