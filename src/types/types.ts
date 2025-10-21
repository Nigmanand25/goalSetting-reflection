
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
  smartPercentage?: number;  // Calculated percentage score (0-100)
  completed: boolean;
  aiEvaluation?: {
    isCompleted: boolean;
    confidence: number; // 0-100
    reasoning: string;
    aiAnalysis: string;
    evaluatedAt: string;
  };
}

export interface UserProgress {
  currentSmartThreshold: number;  // Current minimum SMART score required
  goalsAnalyzed: number;         // Total goals analyzed with AI
  daysActive: number;            // Days since first goal
  averageSmartScore: number;     // Running average of SMART scores
  lastThresholdIncrease: string; // Date of last threshold increase
  startDate: string;             // When user started using the system
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
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  title: string;
  description: string;
}

export interface QuizEvaluation {
  score: number;
  total: number;
  feedback: string;
  correctAnswers: number;
  incorrectAnswers: number;
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

export interface DailyEngagement {
  date: string;
  engagementScore: number; // 0-100
  activitiesCompleted: number;
  hasGoal: boolean;
  hasReflection: boolean;
  hasQuiz: boolean;
  timeSpent?: number; // minutes spent on platform
}

export interface DailyEngagementMetrics {
  dailyEngagement: DailyEngagement[];
  averageDaily: number;
  activeDays: number;
  streakDays: number;
  weeklyTrend: number; // percentage change from last week
  monthlyTrend: number; // percentage change from last month
}

export interface StudentData {
  studentId: string;
  name: string;
  consistencyScore: number;
  streak: number;
  entries: DailyEntry[];
  badges: Badge[];
  progress?: UserProgress;       // Add progress tracking
  dailyEngagement?: DailyEngagementMetrics; // Add daily engagement tracking
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
    students: { id: string; name: string; email?: string }[]; // All students list
    engagementData: { name: string; goals: number; reflections: number; confidence: number }[];
}