import React from 'react';
import { StudentDashboard, AdminDashboard } from './components';
import { LoginPage } from './components/auth';
import { Header } from './components/shared';
import { UserRole } from './types';
import { useApp, useAuth } from './contexts';

const App: React.FC = () => {
  const { userRole } = useApp();
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
    <div className="min-h-screen h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      <Header currentRole={userRole} />
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          {userRole === UserRole.STUDENT ? <StudentDashboard /> : <AdminDashboard />}
        </div>
      </main>
    </div>
  );
};

export default App;