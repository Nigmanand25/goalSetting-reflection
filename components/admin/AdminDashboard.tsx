import React from 'react';
import KpiCard from './KpiCard';
import RiskAlerts from './RiskAlerts';
import EngagementChart from './EngagementChart';
import AiSummary from './AiSummary';
import { useApp } from '../../contexts/AppContext';
import Card from '../shared/Card';

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="h-28 bg-slate-200 dark:bg-slate-800"></Card>
            <Card className="h-28 bg-slate-200 dark:bg-slate-800"></Card>
            <Card className="h-28 bg-slate-200 dark:bg-slate-800"></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card className="h-64 bg-slate-200 dark:bg-slate-800"></Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card className="h-96 bg-slate-200 dark:bg-slate-800"></Card>
                <Card className="h-48 bg-slate-200 dark:bg-slate-800"></Card>
            </div>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
  const { adminData, loading, error } = useApp();

  if (loading) return <LoadingSkeleton />;
  if (error) return <Card><p className="text-center text-red-500">{error}</p></Card>;
  if (!adminData) return <Card><p className="text-center text-slate-500">No admin data available.</p></Card>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Administrator Dashboard
      </h2>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Goal Completion" value={`${adminData.kpis.goalCompletion}%`} trend={2} />
        <KpiCard title="Avg. Reflection Depth" value={`${adminData.kpis.avgReflectionDepth}/5`} trend={-5} />
        <KpiCard title="Avg. Test Performance" value={`${adminData.kpis.avgTestPerformance}%`} trend={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Alerts */}
        <div className="lg:col-span-1">
          <RiskAlerts students={adminData.atRiskStudents} />
        </div>
        
        {/* Engagement & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <EngagementChart data={adminData.engagementData} />
          <AiSummary adminData={adminData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;