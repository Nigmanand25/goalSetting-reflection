import { GoogleGenAI, Type } from "@google/genai";
import { SMARTScore, QuizQuestion, Quiz, AdminDashboardData, Reflection, ConfidenceLevel, UserRole } from '@/types';
import { getUserProfile } from './firebaseServiceReal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Helper function to get system API key from Firestore
const getSystemApiKey = async (): Promise<string | null> => {
  try {
    const configRef = doc(db, 'adminConfig', 'system');
    const configSnap = await getDoc(configRef);
    if (configSnap.exists() && configSnap.data()?.geminiApiKey) {
      return configSnap.data().geminiApiKey;
    }
  } catch (error) {
    console.error('Error getting system API key:', error);
  }
  return null;
};

// Helper function to get API key based on user role
const getApiKeyForUser = async (userId?: string, userRole?: UserRole): Promise<string> => {
  // Admin users use system API key from Firestore, fallback to .env
  if (userRole === UserRole.ADMIN) {
    const systemKey = await getSystemApiKey();
    if (systemKey) {
      return systemKey;
    }
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("Admin Gemini API key is not configured. Please set it in Settings.");
    }
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  // Student users use their personal API key
  if (userId) {
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile?.geminiApiKey) {
        return userProfile.geminiApiKey;
      }
    } catch (error) {
      console.error('Error getting user API key:', error);
    }
  }

  // Fallback to system key or .env key if no user key is found
  const systemKey = await getSystemApiKey();
  if (systemKey) {
    return systemKey;
  }

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  throw new Error("No Gemini API key available. Please configure your API key in Settings.");
};

// Create AI instance with dynamic API key
const createAIInstance = async (userId?: string, userRole?: UserRole): Promise<GoogleGenAI> => {
  const apiKey = await getApiKeyForUser(userId, userRole);
  return new GoogleGenAI({ apiKey });
};

// Function to get SMART score analysis from Gemini API
export const getSmartScore = async (goal: string, userId?: string, userRole?: UserRole): Promise<{score: SMARTScore, feedback: string}> => {
  const ai = await createAIInstance(userId, userRole);
  
  const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
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

// Function to analyze and validate reflection using AI
export const analyzeReflection = async (reflectionText: string, goal: string, userId?: string, userRole?: UserRole): Promise<{
  isValid: boolean;
  depth: number;
  confidenceLevel: ConfidenceLevel;
  feedback: string;
}> => {
  const ai = await createAIInstance(userId, userRole);

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Analyze this student reflection for a goal and provide detailed assessment:

Goal: "${goal}"
Reflection: "${reflectionText}"

Evaluate the reflection on the following criteria:
1. Validity: Is it a proper, detailed reflection (minimum 50 words, not just generic statements)?
2. Depth: Rate 1-5 based on self-awareness, insight, and detail level
3. Confidence Level: HIGH/MEDIUM/LOW based on the tone and conviction shown
4. Provide constructive feedback and specific suggestions for improvement

Reflection should demonstrate:
- Self-awareness and honest assessment
- Specific examples or experiences
- Insights about challenges and successes  
- Learning and growth mindset
- Connection to the goal

Reject reflections that are:
- Too short (under 50 words)
- Generic or copy-pasted
- Not actually reflective (just stating facts)
- Completely unrelated to the goal`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: {
            type: Type.BOOLEAN,
            description: "Whether the reflection meets quality standards"
          },
          depth: {
            type: Type.INTEGER,
            description: "Depth rating from 1-5"
          },
          confidenceLevel: {
            type: Type.STRING,
            description: "HIGH, MEDIUM, or LOW confidence level"
          },
          feedback: {
            type: Type.STRING,
            description: "Constructive feedback for the student"
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific suggestions for improvement"
          }
        },
        required: ["isValid", "depth", "confidenceLevel", "feedback", "suggestions"]
      }
    }
  });

  const result = JSON.parse(response.text.trim());
  
  // Convert string confidence level to enum
  const confidenceLevel = result.confidenceLevel === 'HIGH' ? ConfidenceLevel.HIGH :
                         result.confidenceLevel === 'MEDIUM' ? ConfidenceLevel.MEDIUM :
                         ConfidenceLevel.LOW;

  return {
    ...result,
    confidenceLevel
  };
};

// Function to generate a complete quiz based on goal and reflection
export const generatePersonalizedQuiz = async (goal: string, reflection?: string, userId?: string, userRole?: UserRole): Promise<Quiz> => {
    const ai = await createAIInstance(userId, userRole);

    const prompt = `Create a personalized 12-question multiple-choice quiz specifically tailored to this student's goal and reflection:
    
    Goal: "${goal}"
    ${reflection ? `Student's Reflection: "${reflection}"` : ''}
    
    Instructions:
    - Generate exactly 12 questions that are DIRECTLY RELEVANT to their specific goal
    - Base questions on the goal domain (fitness, learning, career, habits, etc.)
    - If reflection is provided, incorporate insights from their reflection into questions
    - Test knowledge that would help them succeed with THIS specific goal
    - Include domain-specific strategies, common challenges, and best practices
    - Each question should have 4 realistic options with one clearly correct answer
    - Make it educational and actionable for their specific situation
    - Provide detailed explanations that teach them something valuable
    
    Example focus areas based on goal type:
    - Fitness goals: exercise science, nutrition, motivation, progress tracking
    - Learning goals: study techniques, memory, skill acquisition, practice methods
    - Career goals: networking, skill development, interview preparation, productivity
    - Habit goals: behavior change, consistency, environmental design, accountability
    
    Topics to customize based on their goal:
    1. Domain-specific strategies and techniques
    2. Common obstacles and how to overcome them  
    3. Best practices for this type of goal
    4. Motivation and consistency techniques
    5. Progress measurement methods
    6. Time management for this goal
    7. Building supporting habits
    8. Dealing with specific setbacks
    9. Tools and resources for success
    10. Milestone planning and celebration
    11. Advanced techniques and optimization
    12. Long-term sustainability strategies
    
    Make each question educational and directly applicable to achieving their specific goal.`;

    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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
export const generateQuizQuestion = async (topic: string, userId?: string, userRole?: UserRole): Promise<QuizQuestion> => {
    const quiz = await generatePersonalizedQuiz(topic, undefined, userId, userRole);
    return quiz.questions[0] || {
        question: "What is the most important factor in achieving goals?",
        options: ["Luck", "Consistent daily action", "Perfect planning", "Waiting for motivation"],
        correctAnswer: "Consistent daily action",
        explanation: "Consistency beats perfection when it comes to achieving goals."
    };
};

// Function to generate a weekly summary from Gemini API  
export const generateWeeklySummary = async (adminData: AdminDashboardData, userId?: string, userRole?: UserRole): Promise<string> => {
    const ai = await createAIInstance(userId, userRole);
    
    const prompt = `
        You are an expert educational analyst. Based on the following weekly data for a student cohort, provide a concise, actionable summary (3-4 sentences). 
        Highlight overall trends, identify potential areas of concern, and suggest one specific action for the administrator.
        
        Data:
        - Key Performance Indicators: ${JSON.stringify(adminData.kpis)}
        - At-Risk Students: ${adminData.atRiskStudents.map((s) => `${s.name} (${s.reason})`).join(', ')}
        - Engagement Trend: ${JSON.stringify(adminData.engagementData)}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
    });
    
    return response.text;
};

// Function to test if an API key is valid
export const testGeminiAPI = async (apiKey: string): Promise<boolean> => {
    try {
        const testAI = new GoogleGenAI({ apiKey });
        const response = await testAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "Test message: Please respond with 'API key is working'",
        });
        
        const responseText = response.text.toLowerCase();
        return responseText.includes('api key is working') || responseText.includes('working');
    } catch (error) {
        console.error('API key test failed:', error);
        return false;
    }
};