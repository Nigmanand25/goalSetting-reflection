import { UserProgress, SMARTScore } from '@/types';

export const INITIAL_SMART_THRESHOLD = 40; // Starting at 40%
export const MAX_SMART_THRESHOLD = 85;     // Maximum threshold
export const THRESHOLD_INCREMENT = 5;      // Increase by 5% each time
export const DAYS_BETWEEN_INCREASES = 2;   // Increase every 2 days

export const calculateAverageSmartScore = (smartScore: SMARTScore): number => {
  const scores = [
    smartScore.specific,
    smartScore.measurable,
    smartScore.achievable,
    smartScore.realistic,
    smartScore.timeBound
  ];
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 20); // Convert to percentage
};

export const initializeUserProgress = (): UserProgress => {
  const now = new Date().toISOString();
  return {
    currentSmartThreshold: INITIAL_SMART_THRESHOLD,
    goalsAnalyzed: 0,
    daysActive: 0,
    averageSmartScore: 0,
    lastThresholdIncrease: now,
    startDate: now
  };
};

export const updateUserProgress = (
  currentProgress: UserProgress,
  newSmartScore: SMARTScore
): UserProgress => {
  const newAverageScore = calculateAverageSmartScore(newSmartScore);
  const goalsAnalyzed = currentProgress.goalsAnalyzed + 1;
  
  // Calculate running average
  const totalScore = (currentProgress.averageSmartScore * currentProgress.goalsAnalyzed) + newAverageScore;
  const averageSmartScore = Math.round(totalScore / goalsAnalyzed);
  
  // Calculate days active
  const startDate = new Date(currentProgress.startDate);
  const today = new Date();
  const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if threshold should increase
  const daysSinceLastIncrease = Math.floor(
    (today.getTime() - new Date(currentProgress.lastThresholdIncrease).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let newThreshold = currentProgress.currentSmartThreshold;
  let lastThresholdIncrease = currentProgress.lastThresholdIncrease;
  
  if (daysSinceLastIncrease >= DAYS_BETWEEN_INCREASES && 
      newThreshold < MAX_SMART_THRESHOLD &&
      averageSmartScore >= newThreshold) {
    newThreshold = Math.min(newThreshold + THRESHOLD_INCREMENT, MAX_SMART_THRESHOLD);
    lastThresholdIncrease = today.toISOString();
  }
  
  return {
    currentSmartThreshold: newThreshold,
    goalsAnalyzed,
    daysActive,
    averageSmartScore,
    lastThresholdIncrease,
    startDate: currentProgress.startDate
  };
};

export const canSetGoal = (smartScore: SMARTScore, requiredThreshold: number): boolean => {
  const averageScore = calculateAverageSmartScore(smartScore);
  return averageScore >= requiredThreshold;
};

export const getProgressMessage = (progress: UserProgress): string => {
  const daysUntilNextIncrease = DAYS_BETWEEN_INCREASES - 
    Math.floor((new Date().getTime() - new Date(progress.lastThresholdIncrease).getTime()) / (1000 * 60 * 60 * 24));
  
  if (progress.currentSmartThreshold >= MAX_SMART_THRESHOLD) {
    return "🏆 You've mastered SMART goal setting!";
  }
  
  if (daysUntilNextIncrease <= 0 && progress.averageSmartScore >= progress.currentSmartThreshold) {
    return `🎯 Ready to level up! Threshold will increase to ${progress.currentSmartThreshold + THRESHOLD_INCREMENT}% soon.`;
  }
  
  return `📈 Keep improving! ${daysUntilNextIncrease} days until next level-up opportunity.`;
};
