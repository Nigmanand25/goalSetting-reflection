import React, { useState, useEffect, useCallback } from 'react';
import Card from '../shared/Card';
import { generatePersonalizedQuiz } from '@/services/geminiService';
import { Quiz, QuizQuestion } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

const QuizCard: React.FC = () => {
  const { studentData, addQuizResult } = useApp();
  const { user, userRole } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        // Find today's entry to get the goal and reflection
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysEntry = studentData?.entries.find(e => e.date.startsWith(todayStr));
        
        const goalText = todaysEntry?.goal.text || "personal development and goal achievement";
        const reflectionText = todaysEntry?.reflection?.text;

        console.log("Generating personalized quiz for:", { goalText, hasReflection: !!reflectionText });
        const generatedQuiz = await generatePersonalizedQuiz(goalText, reflectionText, user?.uid, userRole);
        setQuiz(generatedQuiz);
        setUserAnswers(new Array(generatedQuiz.questions.length).fill(''));
      } catch (error) {
        console.error("Error fetching quiz:", error);
        // Provide a fallback quiz if API fails
        // Use the same comprehensive fallback as the service
        setQuiz({
          title: "Personal Development Quiz",
          description: "Test your knowledge about achieving your goals",
          questions: [
            {
              question: "What makes a goal 'SMART'?",
              options: ["Simple, Meaningful, Achievable, Realistic, Timely", "Specific, Measurable, Achievable, Relevant, Time-bound", "Strong, Motivating, Ambitious, Rewarding, Trackable", "Strategic, Manageable, Actionable, Results-focused, Targeted"],
              correctAnswer: "Specific, Measurable, Achievable, Relevant, Time-bound",
              explanation: "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound."
            },
            {
              question: "What is the most effective way to build a new habit?",
              options: ["Start with 30-minute sessions", "Begin with tiny, 2-minute actions", "Only practice when motivated", "Set multiple habits at once"],
              correctAnswer: "Begin with tiny, 2-minute actions",
              explanation: "Starting small makes it easier to be consistent and build momentum."
            },
            {
              question: "When facing a setback, what's the best approach?",
              options: ["Give up and try something else", "Analyze what went wrong and adjust", "Push harder with the same strategy", "Take a long break"],
              correctAnswer: "Analyze what went wrong and adjust",
              explanation: "Setbacks are learning opportunities that help you refine your strategy."
            },
            {
              question: "What maintains long-term motivation best?",
              options: ["Rewards and incentives", "Connecting goals to your values", "Peer pressure", "Fear of failure"],
              correctAnswer: "Connecting goals to your values",
              explanation: "Value-aligned goals provide sustainable, intrinsic motivation."
            },
            {
              question: "How should you break down large goals?",
              options: ["Monthly milestones only", "Small, actionable daily tasks", "Yearly phases", "Keep as one big goal"],
              correctAnswer: "Small, actionable daily tasks",
              explanation: "Daily tasks make large goals manageable and less overwhelming."
            },
            {
              question: "Best way to overcome procrastination?",
              options: ["Wait for motivation", "Use the 2-minute rule", "Set harder deadlines", "Punish yourself"],
              correctAnswer: "Use the 2-minute rule",
              explanation: "Starting with just 2 minutes overcomes initial resistance."
            }
          ]
        });
        setUserAnswers(new Array(6).fill(''));
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [studentData]);

  const handleAnswer = useCallback((option: string) => {
    if (!quiz || showExplanation) return;
    
    setSelectedAnswer(option);
    setShowExplanation(true);
    
    // Update user answers
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
    
    // Update score if correct
    if (option === quiz.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  }, [quiz, currentQuestionIndex, userAnswers, showExplanation]);

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      const finalScore = score.total === quiz.questions.length - 1 
        ? { ...score, total: score.total + 1 }
        : score;
      
      const percentage = Math.round((finalScore.correct / finalScore.total) * 100);
      let feedback = "";
      
      if (percentage >= 90) {
        feedback = "Outstanding! You have excellent knowledge about goal achievement. Keep applying these principles!";
      } else if (percentage >= 70) {
        feedback = "Great job! You understand most key concepts. Review the areas you missed to strengthen your goal-setting skills.";
      } else if (percentage >= 50) {
        feedback = "Good effort! You're on the right track. Consider studying more about SMART goals and productivity techniques.";
      } else {
        feedback = "Keep learning! Goal achievement is a skill that improves with practice and knowledge. Review the explanations and try again.";
      }
      
      addQuizResult({
        score: finalScore.correct,
        total: finalScore.total,
        correctAnswers: finalScore.correct,
        incorrectAnswers: finalScore.total - finalScore.correct,
        feedback: feedback
      });
    }
  }, [quiz, currentQuestionIndex, score, addQuizResult]);
  
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <p className="ml-3 text-slate-500">Generating your personalized quiz...</p>
        </div>
      </Card>
    );
  }

  if (!quiz) {
    return <Card><p className="text-center text-red-500">Could not load quiz. Please try again later.</p></Card>;
  }

  if (quizCompleted) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-shrink-0 bg-green-500 rounded-full h-16 w-16 flex items-center justify-center text-white">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Quiz Completed! 🎉</h3>
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
            {score.correct}/{score.total}
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {Math.round((score.correct / score.total) * 100)}% Score
          </p>
          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
            <p className="text-sm text-teal-800 dark:text-teal-200">
              Great job completing your personalized learning quiz! Keep applying these insights to achieve your goals.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 bg-teal-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{quiz.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>
            <div className="flex items-center mt-1 space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                🤖 AI-Personalized
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                📝 Based on your goal & reflection
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {currentQuestionIndex + 1} / {quiz.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
        <div 
          className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question */}
      <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">
        {currentQuestion.question}
      </h4>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = option === selectedAnswer;
          let buttonClass = 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-transparent';
          
          if (showExplanation) {
            if (isCorrect) {
              buttonClass = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
            } else if (isSelected && !isCorrect) {
              buttonClass = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
            } else {
              buttonClass = 'bg-slate-100 dark:bg-slate-700 opacity-60 border-slate-200 dark:border-slate-600';
            }
          } else if (isSelected) {
            buttonClass = 'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700';
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg transition-all ${buttonClass}`}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mb-4">
          <div className={`p-4 rounded-lg ${
            selectedAnswer === currentQuestion.correctAnswer
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
          }`}>
            <div className="flex items-start">
              <svg className="flex-shrink-0 w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium mb-1">
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Not quite right."}
                </p>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Score: {score.correct}/{score.total + 1}
            </div>
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuizCard;