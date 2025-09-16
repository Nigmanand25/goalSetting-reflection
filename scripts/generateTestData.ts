import { StudentData, DailyEntry, Goal, Reflection, QuizEvaluation, ConfidenceLevel, SMARTScore, Badge } from '../types';

// Comprehensive data generator for test student
export class TestDataGenerator {
  private readonly testEmail = 'test@gmail.com';
  private readonly testStudentId = 'TEST_STUDENT_001';
  private readonly testStudentName = 'Test Student';
  
  // Sample goals for different subjects/categories
  private readonly goalTemplates = [
    // Programming/Computer Science
    "Complete 10 JavaScript array manipulation exercises",
    "Build a simple calculator using React",
    "Learn about API integration with fetch()",
    "Practice algorithm problems on sorting arrays",
    "Create a responsive webpage using CSS Grid",
    "Understand asynchronous programming with Promises",
    "Implement user authentication in Node.js",
    
    // Mathematics
    "Solve 15 calculus derivative problems",
    "Practice linear algebra matrix operations",
    "Complete statistics probability exercises",
    "Review trigonometry identities and proofs",
    "Work on geometry coordinate plane problems",
    "Study algebraic equation solving techniques",
    
    // Science
    "Review chemistry periodic table properties",
    "Study physics motion and force concepts",
    "Learn about cellular biology processes",
    "Understand atomic structure and bonding",
    "Practice chemical equation balancing",
    
    // Language Arts
    "Read 2 chapters of assigned literature",
    "Write a 500-word essay on character development",
    "Practice grammar rules for complex sentences",
    "Analyze poetry for literary devices",
    "Complete vocabulary building exercises",
    
    // General Study Skills
    "Create detailed study notes for upcoming exam",
    "Practice time management with Pomodoro technique",
    "Review and summarize key concepts from lectures",
    "Prepare presentation slides for group project",
    "Complete research for term paper"
  ];

  // Reflection templates for different depths and confidence levels
  private readonly reflectionTemplates = {
    depth1: [
      "I did it.",
      "It was okay.",
      "Finished the task.",
      "Got it done.",
      "Completed successfully."
    ],
    depth2: [
      "The task was straightforward but took longer than expected.",
      "I completed it but felt rushed towards the end.",
      "It was challenging but manageable with some effort.",
      "Good progress made, though some parts were confusing."
    ],
    depth3: [
      "This was quite challenging and required me to think differently about the problem. I learned some new approaches but still feel there's room for improvement in my understanding.",
      "I found this task engaging and it helped me connect concepts I learned earlier. The practical application made the theory clearer, though I struggled with some advanced parts.",
      "Completing this goal required breaking it down into smaller steps. I felt confident with the basics but realized I need more practice with the complex scenarios."
    ],
    depth4: [
      "Today's goal really pushed my understanding to the next level. I started by reviewing the fundamentals, then applied them step-by-step. The most challenging part was connecting different concepts, but I managed to work through it by drawing diagrams and taking detailed notes. I feel much more confident now and can see how this relates to future topics.",
      "This was an excellent learning experience that challenged me in unexpected ways. I initially struggled with the core concepts, but after researching additional resources and practicing multiple examples, everything clicked. The breakthrough moment came when I realized the pattern, and suddenly all the pieces fell into place. I'm excited to build on this foundation.",
      "Working on this goal today gave me deep insights into both the subject matter and my own learning process. I noticed that I learn best when I can visualize the concepts and relate them to real-world examples. The practice problems were particularly helpful in reinforcing my understanding, and I feel ready to tackle more advanced challenges."
    ],
    depth5: [
      "Today's learning session was transformative in ways I didn't expect. Starting with the basic concepts, I methodically worked through each component, taking time to truly understand the underlying principles rather than just memorizing procedures. What struck me most was how this topic connects to everything we've learned previously - it's like finding the missing piece that makes the whole picture clear. I encountered several challenging moments where I had to step back and approach problems from different angles. Through persistence and careful analysis, I developed new problem-solving strategies that I know will be valuable going forward. The confidence I've gained from mastering this material is immense, and I can already see applications in upcoming projects. This experience has reinforced my belief that deep, thoughtful practice is far more valuable than surface-level completion.",
      "Reflecting on today's work, I'm amazed by how much my understanding has evolved. The goal initially seemed daunting, but by breaking it into manageable chunks and maintaining a growth mindset, I was able to push through moments of confusion and frustration. What made this particularly rewarding was discovering connections between this material and concepts from other subjects - it's fascinating how knowledge builds upon itself. I found myself questioning assumptions, exploring alternative approaches, and even identifying areas where the conventional methods could be improved. The depth of engagement I felt today reminded me why I'm passionate about learning. I've not only mastered the technical content but also developed better metacognitive awareness of my learning process. I'm excited to see how this foundation will support more advanced topics, and I feel prepared to help classmates who might be struggling with similar concepts."
    ]
  };

  // Quiz questions pool for different topics
  private readonly quizQuestions = [
    {
      question: "What is the correct syntax for creating a JavaScript array?",
      options: ["let arr = {1, 2, 3}", "let arr = [1, 2, 3]", "let arr = (1, 2, 3)", "let arr = <1, 2, 3>"],
      correctAnswer: "let arr = [1, 2, 3]",
      explanation: "JavaScript arrays are created using square brackets []"
    },
    {
      question: "What is the derivative of x²?",
      options: ["x", "2x", "x²", "2x²"],
      correctAnswer: "2x",
      explanation: "Using the power rule: d/dx(x²) = 2x^(2-1) = 2x"
    },
    {
      question: "Which HTML tag is used for the largest heading?",
      options: ["<h6>", "<h1>", "<header>", "<title>"],
      correctAnswer: "<h1>",
      explanation: "H1 is the largest heading tag in HTML"
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswer: "Au",
      explanation: "Au comes from the Latin word 'aurum' meaning gold"
    },
    {
      question: "What does CSS stand for?",
      options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
      correctAnswer: "Cascading Style Sheets",
      explanation: "CSS stands for Cascading Style Sheets, used for styling web pages"
    }
  ];

  // Generate SMART score for a goal
  private generateSmartScore(): { smartScore: SMARTScore; smartPercentage: number } {
    const specific = Math.floor(Math.random() * 3) + 3; // 3-5
    const measurable = Math.floor(Math.random() * 3) + 3; // 3-5
    const achievable = Math.floor(Math.random() * 3) + 3; // 3-5
    const realistic = Math.floor(Math.random() * 3) + 3; // 3-5
    const timeBound = Math.floor(Math.random() * 3) + 3; // 3-5

    const smartScore: SMARTScore = {
      specific,
      measurable,
      achievable,
      realistic,
      timeBound
    };

    const smartPercentage = ((specific + measurable + achievable + realistic + timeBound) / 25) * 100;

    return { smartScore, smartPercentage };
  }

  // Generate reflection with specified depth and confidence
  private generateReflection(depth: number, confidenceLevel: ConfidenceLevel): Reflection {
    let text: string;
    
    switch (depth) {
      case 1:
        text = this.reflectionTemplates.depth1[Math.floor(Math.random() * this.reflectionTemplates.depth1.length)];
        break;
      case 2:
        text = this.reflectionTemplates.depth2[Math.floor(Math.random() * this.reflectionTemplates.depth2.length)];
        break;
      case 3:
        text = this.reflectionTemplates.depth3[Math.floor(Math.random() * this.reflectionTemplates.depth3.length)];
        break;
      case 4:
        text = this.reflectionTemplates.depth4[Math.floor(Math.random() * this.reflectionTemplates.depth4.length)];
        break;
      case 5:
        text = this.reflectionTemplates.depth5[Math.floor(Math.random() * this.reflectionTemplates.depth5.length)];
        break;
      default:
        text = this.reflectionTemplates.depth3[0];
    }

    return {
      text,
      depth,
      confidenceLevel
    };
  }

  // Generate quiz evaluation
  private generateQuizEvaluation(): QuizEvaluation {
    const totalQuestions = 5;
    const correctAnswers = Math.floor(Math.random() * totalQuestions) + 1; // 1-5 correct
    const score = correctAnswers;
    const total = totalQuestions;
    const percentage = (correctAnswers / totalQuestions) * 100;

    let feedback: string;
    if (percentage >= 90) {
      feedback = "Excellent work! You've mastered this topic.";
    } else if (percentage >= 80) {
      feedback = "Great job! You have a solid understanding.";
    } else if (percentage >= 70) {
      feedback = "Good effort! Review the missed concepts.";
    } else if (percentage >= 60) {
      feedback = "You're getting there! More practice needed.";
    } else {
      feedback = "Keep practicing! Review the fundamentals.";
    }

    return {
      score,
      total,
      feedback,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers
    };
  }

  // Generate 15 days of comprehensive data
  public generate15DaysData(): StudentData {
    const entries: DailyEntry[] = [];
    const today = new Date();
    
    // Generate badges for achievements
    const badges: Badge[] = [
      { id: 'streak-7', name: '7-Day Streak', description: 'Maintained a consistent streak for 7 days in a row!', icon: '🔥' },
      { id: 'deep-thinker', name: 'Deep Thinker', description: 'Consistently provided deep, thoughtful reflections (average depth of 4+).', icon: '🧠' },
      { id: 'quiz-whiz', name: 'Quiz Whiz', description: 'Mastered the daily quizzes with an average score of 90% or higher.', icon: '🎯' }
    ];

    // Generate data for each of the last 15 days
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Pick a random goal
      const goalText = this.goalTemplates[Math.floor(Math.random() * this.goalTemplates.length)];
      const { smartScore, smartPercentage } = this.generateSmartScore();
      
      // 85% chance of completion
      const completed = Math.random() > 0.15;
      
      const goal: Goal = {
        text: goalText,
        smartScore,
        smartPercentage,
        completed
      };

      const entry: DailyEntry = {
        date: date.toISOString(),
        goal
      };

      // 90% chance of reflection if goal is completed, 40% if not completed
      const hasReflection = completed ? Math.random() > 0.1 : Math.random() > 0.6;
      
      if (hasReflection) {
        // Generate realistic depth and confidence distributions
        let depth: number;
        let confidenceLevel: ConfidenceLevel;
        
        if (completed) {
          // Higher depth and confidence for completed goals
          depth = Math.floor(Math.random() * 3) + 3; // 3-5
          confidenceLevel = Math.random() > 0.3 ? 
            (Math.random() > 0.5 ? ConfidenceLevel.HIGH : ConfidenceLevel.MEDIUM) : 
            ConfidenceLevel.LOW;
        } else {
          // Lower depth and confidence for incomplete goals
          depth = Math.floor(Math.random() * 3) + 1; // 1-3
          confidenceLevel = Math.random() > 0.2 ? ConfidenceLevel.LOW : ConfidenceLevel.MEDIUM;
        }
        
        entry.reflection = this.generateReflection(depth, confidenceLevel);
      }

      // 70% chance of quiz evaluation
      if (Math.random() > 0.3) {
        entry.quizEvaluation = this.generateQuizEvaluation();
      }

      entries.push(entry);
    }

    // Calculate consistency score based on completed goals
    const completedGoals = entries.filter(e => e.goal.completed).length;
    const consistencyScore = Math.round((completedGoals / entries.length) * 100);

    // Calculate streak (consecutive days with completed goals from recent)
    let streak = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].goal.completed) {
        streak++;
      } else {
        break;
      }
    }

    return {
      studentId: this.testStudentId,
      name: this.testStudentName,
      consistencyScore,
      streak,
      entries,
      badges,
      progress: {
        currentSmartThreshold: 75,
        goalsAnalyzed: entries.length,
        daysActive: 15,
        averageSmartScore: entries.reduce((sum, e) => sum + (e.goal.smartPercentage || 0), 0) / entries.length,
        lastThresholdIncrease: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: entries[0].date
      }
    };
  }

  // Method to add this data to the mock database
  public addToMockDatabase(mockDb: any): void {
    const testData = this.generate15DaysData();
    mockDb.students[this.testStudentId] = testData;
    
    console.log('✅ Added 15 days of test data for:', {
      email: this.testEmail,
      studentId: this.testStudentId,
      name: this.testStudentName,
      totalEntries: testData.entries.length,
      completedGoals: testData.entries.filter(e => e.goal.completed).length,
      reflections: testData.entries.filter(e => e.reflection).length,
      quizzes: testData.entries.filter(e => e.quizEvaluation).length,
      consistencyScore: testData.consistencyScore,
      streak: testData.streak,
      badges: testData.badges.length
    });
  }
}

// Export function to be called from Firebase service
export function generateTestStudentData() {
  const generator = new TestDataGenerator();
  return generator.generate15DaysData();
}
