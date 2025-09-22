import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { StudentDashboard, AdminDashboard } from './components';
import { LoginPage } from './components/auth';
import { Header } from './components/shared';
import { SettingsPage } from './components/SettingsPage';
import { FirstTimeApiSetup } from './components/shared/FirstTimeApiSetup';
import { UserRole } from './types';
import { useApp, useAuth } from './contexts';

// Component to handle student detail route with URL params
const AdminStudentDetailRoute: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { viewStudentDetails, selectedStudent } = useApp();
  
  React.useEffect(() => {
    if (studentId && (!selectedStudent || selectedStudent.studentId !== studentId)) {
      viewStudentDetails(studentId);
    }
  }, [studentId]); // Only depend on studentId, not viewStudentDetails
  
  return <AdminDashboard />;
};

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

  // Main app with routing
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-200 font-sans">
        <Header currentRole={userRole} />
        <main className="flex-1 w-full">
          <div className="w-full h-full min-h-[calc(100vh-80px)]">
            <Routes>
              {/* Student Routes */}
              {userRole === UserRole.STUDENT && (
                <>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
              
              {/* Admin Routes */}
              {userRole === UserRole.ADMIN && (
                <>
                  <Route path="/admin/students/:studentId" element={<AdminStudentDetailRoute />} />
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        
        {/* First time API setup modal */}
        <FirstTimeApiSetup />
      </div>
    </Router>
  );
};

export default App;