import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { StudentData, AdminDashboardData, UserRole, DailyEntry, Reflection, QuizEvaluation, ConfidenceLevel } from '../types';
import * as firebaseService from '../services/firebaseService';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STUDENT);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      if (role === UserRole.STUDENT) {
        const data = await firebaseService.getStudentData('S123'); // Hardcoded student ID for demo
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
    fetchData(userRole);
  }, [userRole, fetchData]);
  
  const switchRole = (role: UserRole) => {
      setUserRole(role);
  };

  const addGoal = async (goalText: string) => {
      if (!studentData) return;
      const newEntry: DailyEntry = {
        date: new Date().toISOString(),
        goal: { text: goalText, completed: false },
      };
      const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(studentData.studentId, newEntry);
      setStudentData(updatedStudentData);
  };

  const addReflection = async (reflection: Reflection) => {
    if (!studentData) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysEntry = studentData.entries.find(e => e.date.startsWith(todayStr));
    
    if (todaysEntry) {
       const updatedEntry = { ...todaysEntry, reflection };
       const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(studentData.studentId, updatedEntry);
       setStudentData(updatedStudentData);
    }
  };

  const addQuizResult = async (evaluation: QuizEvaluation) => {
    if (!studentData) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysEntry = studentData.entries.find(e => e.date.startsWith(todayStr));

    if (todaysEntry) {
      const updatedEntry = { ...todaysEntry, quizEvaluation: evaluation };
      const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(studentData.studentId, updatedEntry);
      setStudentData(updatedStudentData);
    }
  };


  return (
    <AppContext.Provider value={{ userRole, studentData, adminData, loading, error, switchRole, addGoal, addReflection, addQuizResult }}>
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
