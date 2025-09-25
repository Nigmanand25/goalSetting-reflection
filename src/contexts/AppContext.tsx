import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { StudentData, AdminDashboardData, UserRole, DailyEntry, Reflection, QuizEvaluation, ConfidenceLevel, SMARTScore } from '@/types';
import { useAuth } from './AuthContext';
import { updateUserProgress, initializeUserProgress, calculateAverageSmartScore } from '@/utils';
import * as firebaseService from '@/services/firebaseServiceReal';
import { UserDeletionOptions } from '@/services/firebaseServiceReal';
import { evaluateGoalCompletion } from '@/services/geminiService';

// Helper function to clean undefined values from objects
const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
};

interface AppContextType {
  userRole: UserRole;
  studentData: StudentData | null;
  adminData: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  addGoal: (goalText: string, smartScore?: SMARTScore) => Promise<void>;
  addReflection: (reflection: { text: string; depth: number; confidenceLevel: ConfidenceLevel }) => Promise<void>;
  addQuizResult: (evaluation: QuizEvaluation) => Promise<void>;
  selectedStudent: StudentData | null;
  viewStudentDetails: (studentId: string) => Promise<void>;
  clearStudentDetailsView: () => void;
  removeUser: (userId: string) => Promise<void>;
  removeUserCompletely: (userId: string, options?: UserDeletionOptions) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
        console.log('🔄 Loading admin dashboard data from Firebase...');
        const data = await firebaseService.getAdminDashboardData();
        console.log('✅ Admin data loaded:', data);
        setAdminData(data);
        setStudentData(null);
      }
    } catch (err) {
      console.error('❌ Error loading data:', err);
      if (err instanceof Error && err.message.includes('permission-denied')) {
        setError('Firebase permission denied. Please check Firestore security rules or contact the administrator.');
      } else if (err instanceof Error && err.message.includes('No data found')) {
        setError('No data found in Firebase. Please ensure the application is being used by students.');
      } else {
        setError('Failed to fetch data. Please try again later.');
      }
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

  const addGoal = async (goalText: string, smartScore?: SMARTScore) => {
    if (!studentData || !user) return;
    
    try {
      // Update user progress if SMART score is provided
      let updatedProgress = studentData.progress;
      let smartPercentage: number | undefined;
      if (smartScore) {
        if (!updatedProgress) {
          updatedProgress = initializeUserProgress();
        }
        updatedProgress = updateUserProgress(updatedProgress, smartScore);
        smartPercentage = calculateAverageSmartScore(smartScore);
      }

      const newEntry: DailyEntry = {
        date: new Date().toISOString(),
        goal: { text: goalText, completed: false, smartScore, smartPercentage },
      };
      const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(user.uid, newEntry);
      
      // Update progress in student data
      if (updatedProgress) {
        updatedStudentData.progress = updatedProgress;
      }

      setStudentData(updatedStudentData);
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to save goal. Please try again.');
    }
  };

  const addReflection = async (reflection: Reflection) => {
    if (!studentData || !user) return;
    
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysEntry = studentData.entries.find(e => e.date.startsWith(todayStr));
      
      if (todaysEntry && todaysEntry.goal) {
        // Create clean entry without undefined values
        let updatedEntry: DailyEntry = {
          date: todaysEntry.date,
          goal: { ...todaysEntry.goal }, // Copy the goal
          reflection
        };
        
        // Only add quizEvaluation if it exists
        if (todaysEntry.quizEvaluation) {
          updatedEntry.quizEvaluation = todaysEntry.quizEvaluation;
        }

        // 🤖 AI Goal Completion Evaluation
        try {
          console.log('🤖 Evaluating goal completion with AI...');
          
          const aiEvaluation = await evaluateGoalCompletion(
            todaysEntry.goal.text,
            reflection.text,
            todaysEntry.quizEvaluation,
            user.uid,
            userRole
          );

          console.log('🎯 AI Goal Evaluation Result:', aiEvaluation);

          // Update goal completion based on AI analysis
          // Only mark as completed if AI is confident (>70%)
          if (aiEvaluation.confidence >= 70) {
            updatedEntry.goal.completed = aiEvaluation.isCompleted;
            
            // Add AI analysis to the entry for future reference
            updatedEntry.goal.aiEvaluation = {
              isCompleted: aiEvaluation.isCompleted,
              confidence: aiEvaluation.confidence,
              reasoning: aiEvaluation.reasoning,
              aiAnalysis: aiEvaluation.aiAnalysis,
              evaluatedAt: new Date().toISOString()
            };

            console.log(`✅ Goal ${aiEvaluation.isCompleted ? 'COMPLETED' : 'NOT COMPLETED'} by AI (${aiEvaluation.confidence}% confidence)`);
          } else {
            console.log(`⚠️ AI confidence too low (${aiEvaluation.confidence}%), keeping manual status`);
          }

        } catch (aiError) {
          console.error('🚫 AI goal evaluation failed:', aiError);
          // Continue without AI evaluation - don't block the reflection save
        }
        
        const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(user.uid, updatedEntry);
        setStudentData(updatedStudentData);
      }
    } catch (error) {
      console.error('Error adding reflection:', error);
      setError('Failed to save reflection. Please try again.');
    }
  };

  const addQuizResult = async (evaluation: QuizEvaluation) => {
    if (!studentData || !user) return;
    
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysEntry = studentData.entries.find(e => e.date.startsWith(todayStr));

      if (todaysEntry) {
        // Create clean entry without undefined values
        const updatedEntry: DailyEntry = {
          date: todaysEntry.date,
          goal: todaysEntry.goal,
          quizEvaluation: evaluation
        };
        
        // Only add reflection if it exists
        if (todaysEntry.reflection) {
          updatedEntry.reflection = todaysEntry.reflection;
        }
        
        const updatedStudentData = await firebaseService.addOrUpdateDailyEntry(user.uid, updatedEntry);
        setStudentData(updatedStudentData);
      }
    } catch (error) {
      console.error('Error adding quiz result:', error);
      setError('Failed to save quiz result. Please try again.');
    }
  };

  const viewStudentDetails = useCallback(async (studentId: string) => {
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
  }, []);

  const clearStudentDetailsView = useCallback(() => {
    setSelectedStudent(null);
  }, []);

  const removeUser = useCallback(async (userId: string) => {
    if (!user || userRole !== UserRole.ADMIN) {
      throw new Error('Unauthorized: Only admins can remove users');
    }

    setLoading(true);
    setError(null);
    
    try {
      await firebaseService.removeUser(userId, user.uid);
      
      // Refresh admin data to remove the user from the list
      const updatedAdminData = await firebaseService.getAdminDashboardData();
      setAdminData(updatedAdminData);
      
      // Clear selected student if it was the removed user
      if (selectedStudent?.studentId === userId) {
        setSelectedStudent(null);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user';
      setError(errorMessage);
      console.error('Remove user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, userRole, selectedStudent?.studentId]);


  const removeUserCompletely = useCallback(async (userId: string, options: UserDeletionOptions = {}) => {
    if (!user || userRole !== UserRole.ADMIN) {
      throw new Error('Unauthorized: Only admins can remove users');
    }

    setLoading(true);
    setError(null);
    
    try {
      await firebaseService.removeUserCompletely(userId, user.uid, options);
      
      // Refresh admin data to remove the user from the list
      const updatedAdminData = await firebaseService.getAdminDashboardData();
      setAdminData(updatedAdminData);
      
      // Clear selected student if it was the removed user
      if (selectedStudent?.studentId === userId) {
        setSelectedStudent(null);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user completely';
      setError(errorMessage);
      console.error('Complete remove user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, userRole, selectedStudent?.studentId]);


  return (
    <AppContext.Provider value={{ userRole, studentData, adminData, loading, error, addGoal, addReflection, addQuizResult, selectedStudent, viewStudentDetails, clearStudentDetailsView, removeUser, removeUserCompletely }}>
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