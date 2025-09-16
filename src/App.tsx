import React, { useState } from 'react';
import { StudentDashboard, AdminDashboard } from './components';
import { LoginPage } from './components/auth';
import { Header } from './components/shared';
import { SettingsPage } from './components/SettingsPage';
import { FirstTimeApiSetup } from './components/shared/FirstTimeApiSetup';
import { UserRole } from './types';
import { useApp, useAuth } from './contexts';

type Page = 'dashboard' | 'settings';

const App: React.FC = () => {
  const { userRole } = useApp();
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header currentRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 w-full">
        <div className="w-full h-full min-h-[calc(100vh-80px)]">
          {currentPage === 'settings' ? (
            <SettingsPage />
          ) : (
            <div className="w-full h-full">
              {userRole === UserRole.STUDENT ? <StudentDashboard /> : <AdminDashboard />}
            </div>
          )}
        </div>
      </main>
      
      {/* First time API setup modal */}
      <FirstTimeApiSetup />
    </div>
  );
};

export default App;