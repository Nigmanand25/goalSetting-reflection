import { GoogleGenAI, Type } from "@google/genai";
import { SMARTScore, QuizQuestion, Quiz, AdminDashboardData } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Function to get SMART score analysis from Gemini API
export const getSmartScore = async (goal: string): Promise<{score: SMARTScore, feedback: string}> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn("VITE_GEMINI_API_KEY is not set. Using mock data for getSmartScore.");
      await new Promise(resolve => setTimeout(resolve, 500));
      return { 
          score: { specific: 4, measurable: 3, achievable: 5, realistic: 4, timeBound: 2 },
          feedback: "This is a great start! To make it even better, try adding a specific number to measure your success. (Mock Response)"
      };
  }
  
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following student goal and rate it on a scale of 1 to 5 for each SMART principle (Specific, Measurable, Achievable, Realistic, Time-bound). Provide brief, constructive feedback. Goal: "${goal}"`,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  score: {
                      type: Type.OBJECT,
                      properties: {
                          specific: { type: Type.INTEGER },
                          measurable: { type: Type.INTEGER },
                          achievable: { type: Type.INTEGER },
                          realistic: { type: Type.INTEGER },
                          timeBound: { type: Type.INTEGER },
                      },
                      required: ["specific", "measurable", "achievable", "realistic", "timeBound"],
                  },
                  feedback: {
                      type: Type.STRING,
                      description: "Constructive feedback for the student."
                  },
              },
              required: ["score", "feedback"],
          },
      },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr);
};

// Function to generate a complete quiz based on goal and reflection
export const generatePersonalizedQuiz = async (goal: string, reflection?: string): Promise<Quiz> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("VITE_GEMINI_API_KEY is not set. Using mock data for generatePersonalizedQuiz.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
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
                    question: "When facing a setback in your goals, what's the best approach?",
                    options: ["Give up and try something else", "Analyze what went wrong and adjust your approach", "Push harder with the same strategy", "Take a long break before trying again"],
                    correctAnswer: "Analyze what went wrong and adjust your approach",
                    explanation: "Setbacks are learning opportunities that help you refine your strategy."
                },
                {
                    question: "What's the most important factor in maintaining long-term motivation?",
                    options: ["Rewards and incentives", "Connecting goals to your deeper values", "Peer pressure from others", "Fear of failure"],
                    correctAnswer: "Connecting goals to your deeper values",
                    explanation: "When goals align with your core values, motivation becomes more sustainable."
                },
                {
                    question: "How should you break down a large, overwhelming goal?",
                    options: ["Into monthly milestones only", "Into small, actionable daily tasks", "Into yearly phases", "Keep it as one big goal"],
                    correctAnswer: "Into small, actionable daily tasks",
                    explanation: "Breaking goals into daily actions makes them less overwhelming and more achievable."
                },
                {
                    question: "What's the best way to track your progress?",
                    options: ["Only check at the end", "Daily reflection and measurement", "Weekly reviews only", "When you feel like it"],
                    correctAnswer: "Daily reflection and measurement",
                    explanation: "Regular tracking helps you stay on course and make adjustments when needed."
                },
                {
                    question: "When is the best time to review and adjust your goals?",
                    options: ["Never, goals should remain fixed", "Only when you fail", "Regularly through scheduled reviews", "When others suggest changes"],
                    correctAnswer: "Regularly through scheduled reviews",
                    explanation: "Regular reviews ensure your goals remain relevant and achievable as circumstances change."
                },
                {
                    question: "What's the most effective way to overcome procrastination?",
                    options: ["Wait for motivation to strike", "Use the 2-minute rule: start with 2 minutes", "Set harder deadlines", "Punish yourself for delays"],
                    correctAnswer: "Use the 2-minute rule: start with 2 minutes",
                    explanation: "Starting with just 2 minutes overcomes the initial resistance and often leads to continued work."
                },
                {
                    question: "How important is celebrating small wins?",
                    options: ["Not important, focus on big goals", "Very important for maintaining motivation", "Only celebrate final achievements", "Celebrations are distracting"],
                    correctAnswer: "Very important for maintaining motivation",
                    explanation: "Celebrating small wins reinforces positive behavior and maintains momentum."
                },
                {
                    question: "What's the best approach when you don't feel motivated?",
                    options: ["Wait until motivation returns", "Rely on discipline and systems", "Lower your standards", "Skip the day completely"],
                    correctAnswer: "Rely on discipline and systems",
                    explanation: "Motivation is temporary, but good systems and discipline create consistent progress."
                },
                {
                    question: "How should you handle conflicting goals?",
                    options: ["Try to do everything at once", "Prioritize based on values and impact", "Abandon the harder goals", "Let others decide for you"],
                    correctAnswer: "Prioritize based on values and impact",
                    explanation: "Clear priorities help you focus energy on what matters most to you."
                },
                {
                    question: "What's the role of accountability in goal achievement?",
                    options: ["Not necessary if you're disciplined", "Essential for increasing commitment", "Only useful for big goals", "Can be replaced by willpower"],
                    correctAnswer: "Essential for increasing commitment",
                    explanation: "Accountability creates external motivation and helps maintain consistency in your efforts."
                }
            ]
        };
    }

    const prompt = `Create a personalized 12-question multiple-choice quiz based on:
    
    Goal: "${goal}"
    ${reflection ? `Recent Reflection: "${reflection}"` : ''}
    
    Instructions:
    - Generate exactly 12 questions that help the user learn about achieving their specific goal
    - Mix questions about goal-setting strategies, overcoming obstacles, productivity, motivation, and habits
    - Make questions relevant to their goal and reflection content
    - Each question should have 4 options with one correct answer
    - Include practical, actionable knowledge
    - Provide brief explanations for correct answers
    
    Topics to cover:
    1. SMART goal principles
    2. Breaking down large goals
    3. Overcoming procrastination
    4. Building motivation
    5. Creating accountability
    6. Time management
    7. Habit formation
    8. Dealing with setbacks
    9. Measuring progress
    10. Celebrating milestones
    11. Goal-specific strategies
    12. Reflection and adjustment`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                                correctAnswer: { type: Type.STRING },
                                explanation: { type: Type.STRING },
                            },
                            required: ["question", "options", "correctAnswer", "explanation"],
                        },
                    },
                },
                required: ["title", "description", "questions"],
            },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

// Legacy function for backward compatibility
export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion> => {
    const quiz = await generatePersonalizedQuiz(topic);
    return quiz.questions[0] || {
        question: "What is the most important factor in achieving goals?",
        options: ["Luck", "Consistent daily action", "Perfect planning", "Waiting for motivation"],
        correctAnswer: "Consistent daily action",
        explanation: "Consistency beats perfection when it comes to achieving goals."
    };
};

// Function to generate a weekly summary from Gemini API
export const generateWeeklySummary = async (adminData: AdminDashboardData): Promise<string> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("VITE_GEMINI_API_KEY is not set. Using mock data for generateWeeklySummary.");
        await new Promise(resolve => setTimeout(resolve, 1200));
        return "Overall engagement remains strong this week with a 92% goal completion rate. A slight dip in reflection depth was noted on Wednesday. Students like Chloe Davis are showing signs of struggle. Recommend a targeted check-in. (Mock Response)";
    }
    
    const prompt = `
        You are an expert educational analyst. Based on the following weekly data for a student cohort, provide a concise, actionable summary (3-4 sentences). 
        Highlight overall trends, identify potential areas of concern, and suggest one specific action for the administrator.
        
        Data:
        - Key Performance Indicators: ${JSON.stringify(adminData.kpis)}
        - At-Risk Students: ${adminData.atRiskStudents.map((s) => `${s.name} (${s.reason})`).join(', ')}
        - Engagement Trend: ${JSON.stringify(adminData.engagementData)}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    return response.text;
};