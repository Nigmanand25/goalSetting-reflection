import { GoogleGenAI, Type } from "@google/genai";
import { SMARTScore, QuizQuestion, AdminDashboardData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to get SMART score analysis from Gemini API
export const getSmartScore = async (goal: string): Promise<{score: SMARTScore, feedback: string}> => {
  if (!process.env.API_KEY) {
      console.warn("API_KEY is not set. Using mock data for getSmartScore.");
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

// Function to generate a quiz question from Gemini API
export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY is not set. Using mock data for generateQuizQuestion.");
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            question: `What is the primary purpose of a 'for' loop in Python? (Mock Response)`,
            options: [
                'To declare a variable',
                'To execute a block of code repeatedly for each item in a sequence',
                'To handle errors and exceptions',
                'To define a function'
            ],
            correctAnswer: 'To execute a block of code repeatedly for each item in a sequence'
        };
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a multiple-choice quiz question based on this topic: "${topic}". The question should have 4 options, with one correct answer.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer"],
            },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

// Function to generate a weekly summary from Gemini API
export const generateWeeklySummary = async (adminData: AdminDashboardData): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY is not set. Using mock data for generateWeeklySummary.");
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