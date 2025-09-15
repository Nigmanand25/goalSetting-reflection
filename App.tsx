import React from 'react';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './components/LoginPage';
import Header from './components/shared/Header';
import { UserRole } from './types';
import { useApp } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { userRole, switchRole } = useApp();
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show main app if user is authenticated
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