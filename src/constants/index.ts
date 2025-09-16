// Application Constants
export const APP_NAME = 'Goal Setting & Reflection Coach';

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  GOALS: 'goals',
  REFLECTIONS: 'reflections',
  QUIZZES: 'quizzes',
  ANALYTICS: 'analytics',
} as const;

// Quiz Configuration
export const QUIZ_CONFIG = {
  MIN_QUESTIONS: 3,
  MAX_QUESTIONS: 5,
  PASS_THRESHOLD: 0.7,
} as const;

// Goal Scoring Thresholds
export const SCORING_THRESHOLDS = {
  SMART_MINIMUM: 70,
  EXCELLENT: 85,
  GOOD: 70,
  NEEDS_IMPROVEMENT: 50,
} as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  DEFAULT_DAYS_RANGE: 15,
  ENGAGEMENT_THRESHOLDS: {
    HIGH: 80,
    MEDIUM: 60,
    LOW: 40,
  },
  RISK_THRESHOLDS: {
    HIGH_RISK: 40,
    MEDIUM_RISK: 60,
  },
} as const;

// UI Constants
export const UI_CONFIG = {
  LOADING_DELAY: 1000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
} as const;
