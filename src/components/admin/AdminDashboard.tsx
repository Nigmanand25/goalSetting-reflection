import React from 'react';
import KpiCard from './KpiCard';
import RiskAlerts from './RiskAlerts';
import EngagementChart from './EngagementChart';
import AiSummary from './AiSummary';
import StudentsList from './StudentsList';
import { useApp } from '@/contexts/AppContext';
import Card from '../shared/Card';
import StudentAnalyticsDashboard from './StudentAnalyticsDashboard';

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
  const { adminData, loading, error, selectedStudent, viewStudentDetails, clearStudentDetailsView } = useApp();

  if (loading) return <LoadingSkeleton />;
  
  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Unable to Load Admin Data
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          
          {error.includes('No data found') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                It looks like there's no data in Firebase yet. Please ensure students have started using the application to see analytics.
              </p>
            </div>
          )}
          
          {error.includes('permission') && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This appears to be a Firebase permissions issue. Please check your Firestore security rules or contact your administrator.
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (selectedStudent) {
    return <StudentAnalyticsDashboard student={selectedStudent} onBack={clearStudentDetailsView} />;
  }
  
  if (!adminData) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">No admin data available.</p>
        </div>
      </Card>
    );
  }

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

      <div className={`grid grid-cols-1 ${adminData.students ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {/* Students List - only show if students data is available */}
        {adminData.students && (
          <div className="lg:col-span-1">
            <StudentsList students={adminData.students} onSelectStudent={viewStudentDetails} />
          </div>
        )}
        
        {/* Risk Alerts */}
        <div className="lg:col-span-1">
          <RiskAlerts students={adminData.atRiskStudents} onSelectStudent={viewStudentDetails} />
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