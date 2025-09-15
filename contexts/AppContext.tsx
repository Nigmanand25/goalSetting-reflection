import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { StudentData, AdminDashboardData, UserRole, DailyEntry, Reflection, QuizEvaluation, ConfidenceLevel } from '../types';
import { useAuth } from './AuthContext';
import * as firebaseService from '../services/firebaseServiceReal';

interface AppContextType {
  userRole: UserRole;
  studentData: StudentData | null;
  adminData: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  switchRole: (role: UserRole) => void;
  addGoal: (goalText: string) => Promise<void>;
  addReflection: (reflection: { text: string; depth: number; confidenceLevel: ConfidenceLevel }) => Promise<void>;
  addQuizResult: (evaluation: QuizEvaluation) => Promise<void>;
  selectedStudent: StudentData | null;
  viewStudentDetails: (studentId: string) => Promise<void>;
  clearStudentDetailsView: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (role: UserRole, userId?: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (role === UserRole.STUDENT) {
        // Use authenticated user ID or fallback to demo ID
        const studentId = userId || 'S123';
        const data = await firebaseService.getStudentData(studentId, displayName);
        setStudentData(data);
        setAdminData(null);
      } else {
        const data = await firebaseService.getAdminDashboardData();
        setAdminData(data);
        setStudentData(null);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Clear selected student when switching roles
      setSelectedStudent(null);
      fetchData(userRole, user.uid, user.displayName || undefined);
    }
  }, [userRole, user, fetchData]);
  
  const switchRole = (role: UserRole) => {
      // Role switching is now handled by AuthContext
      console.log('Role switching to:', role);
  };

  const addGoal = async (goalText: string) => {
      if (!studentData || !user) return;
      const newEntry: DailyEntry = {
        date: new Date().toISOString(),
        goal: { text: goalText, completed: false },
      };
      const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(user.uid, newEntry);
      setStudentData(updatedStudentData);
  };

  const addReflection = async (reflection: Reflection) => {
    if (!studentData || !user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysEntry = studentData.entries.find(e => e.date.startsWith(todayStr));
    
    if (todaysEntry) {
       const updatedEntry = { ...todaysEntry, reflection };
       const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(user.uid, updatedEntry);
       setStudentData(updatedStudentData);
    }
  };

  const addQuizResult = async (evaluation: QuizEvaluation) => {
    if (!studentData || !user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysEntry = studentData.entries.find(e => e.date.startsWith(todayStr));

    if (todaysEntry) {
      const updatedEntry = { ...todaysEntry, quizEvaluation: evaluation };
      const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(user.uid, updatedEntry);
      setStudentData(updatedStudentData);
    }
  };

  const viewStudentDetails = async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
        const data = await firebaseService.getStudentData(studentId);
        setSelectedStudent(data);
    } catch (err) {
        setError('Failed to fetch student details.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const clearStudentDetailsView = () => {
    setSelectedStudent(null);
  };


  return (
    <AppContext.Provider value={{ userRole, studentData, adminData, loading, error, switchRole, addGoal, addReflection, addQuizResult, selectedStudent, viewStudentDetails, clearStudentDetailsView }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};