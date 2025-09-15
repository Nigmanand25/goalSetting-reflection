
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface SMARTScore {
  specific: number;
  measurable: number;
  achievable: number;
  realistic: number;
  timeBound: number;
}

export interface Goal {
  text: string;
  smartScore?: SMARTScore;
  completed: boolean;
}

export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Reflection {
  text: string;
  depth: number;
  confidenceLevel: ConfidenceLevel;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizEvaluation {
  score: number;
  total: number;
  feedback: string;
}

export interface DailyEntry {
  date: string;
  goal: Goal;
  reflection?: Reflection;
  quizEvaluation?: QuizEvaluation;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or SVG string
}

export interface StudentData {
  studentId: string;
  name: string;
  consistencyScore: number;
  streak: number;
  entries: DailyEntry[];
  badges: Badge[];
}

export interface AtRiskStudent {
    id: string;
    name: string;
    reason: string;
    missedGoals: number;
    avgReflectionDepth: number;
    avgTestScore: number;
}

export interface AdminDashboardData {
    kpis: {
        goalCompletion: number;
        avgReflectionDepth: number;
        avgTestPerformance: number;
    };
    atRiskStudents: AtRiskStudent[];
    engagementData: { name: string; goals: number; reflections: number; confidence: number }[];
}