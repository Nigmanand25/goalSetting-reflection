import React from 'react';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Header from './components/shared/Header';
import { UserRole } from './types';
import { useApp } from './contexts/AppContext';

const App: React.FC = () => {
  const { userRole, switchRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header currentRole={userRole} onRoleChange={switchRole} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {userRole === UserRole.STUDENT ? <StudentDashboard /> : <AdminDashboard />}
      </main>
    </div>
  );
};

export default App;