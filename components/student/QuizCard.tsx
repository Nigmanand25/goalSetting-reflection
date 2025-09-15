import React, { useState, useEffect, useCallback } from 'react';
import Card from '../shared/Card';
import { generateQuizQuestion } from '../../services/geminiService';
import { QuizQuestion } from '../../types';
import { useApp } from '../../contexts/AppContext';

const QuizCard: React.FC = () => {
  const { studentData, addQuizResult } = useApp();
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        // Find today's entry to get the goal text
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysGoalText = studentData?.entries.find(e => e.date.startsWith(todayStr))?.goal.text;

        let quizTopic;
        if (todaysGoalText) {
          quizTopic = `Create a quiz question related to goal achievement and personal development, inspired by this goal: "${todaysGoalText}". Focus on practical strategies, motivation, or productivity concepts.`;
        } else {
          // Fallback topics for goal setting and personal development
          const topics = [
            "Goal setting strategies and SMART goals",
            "Time management and productivity techniques", 
            "Building and maintaining good habits",
            "Overcoming procrastination and obstacles",
            "Self-reflection and personal growth",
            "Motivation and maintaining consistency"
          ];
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          quizTopic = `Create a quiz question about ${randomTopic} for personal development.`;
        }

        const question = await generateQuizQuestion(quizTopic);
        setQuiz(question);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        // Provide a fallback question if API fails
        setQuiz({
          question: "What is the most important element of a SMART goal?",
          options: [
            "Making it as ambitious as possible",
            "Setting a specific deadline with measurable criteria", 
            "Sharing it with as many people as possible",
            "Writing it down in multiple places"
          ],
          correctAnswer: "Setting a specific deadline with measurable criteria"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [studentData]);

  const handleAnswer = useCallback((option: string) => {
    if (isAnswered || !quiz) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === quiz.correctAnswer;
    const feedback = isCorrect 
      ? "Excellent! This shows great understanding of personal development principles. Keep applying these concepts to your goals!"
      : `Good attempt! The correct answer focuses on the key principles that make goals more achievable. Remember: ${quiz.correctAnswer}`;
      
    addQuizResult({
        score: isCorrect ? 1 : 0,
        total: 1,
        feedback: feedback
    });
  }, [isAnswered, quiz, addQuizResult]);
  
  if (loading) {
    return <Card><p className="text-center text-slate-500">Generating your daily quiz...</p></Card>;
  }

  if (!quiz) {
    return <Card><p className="text-center text-red-500">Could not load quiz for today's goal.</p></Card>;
  }

  return (
    <Card>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 bg-teal-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Daily Knowledge Check</h3>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-2">{quiz.question}</p>

      <div className="mt-4 space-y-3">
        {quiz.options.map((option, index) => {
          const isCorrect = option === quiz.correctAnswer;
          const isSelected = option === selectedAnswer;
          let buttonClass = 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';
          if (isAnswered) {
            if (isCorrect) {
              buttonClass = 'bg-green-500 text-white';
            } else if (isSelected && !isCorrect) {
              buttonClass = 'bg-red-500 text-white';
            } else {
              buttonClass = 'bg-slate-100 dark:bg-slate-700 opacity-60';
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`w-full text-left p-3 rounded-lg transition ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {isAnswered && (
         <div className={`mt-4 p-3 rounded-lg text-sm ${
           quiz.correctAnswer === selectedAnswer 
             ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
             : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
         }`}>
            <strong>Feedback:</strong> {quiz.correctAnswer === selectedAnswer 
              ? "Excellent! This shows great understanding of personal development principles. Keep applying these concepts to your goals!" 
              : `Good attempt! The correct answer focuses on key principles that make goals more achievable. Remember: ${quiz.correctAnswer}`
            }
        </div>
      )}
    </Card>
  );
};

export default QuizCard;