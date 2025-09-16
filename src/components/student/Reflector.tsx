import React, { useState } from 'react';
import Card from '../shared/Card';
import { ConfidenceLevel } from '@/types';
import { analyzeReflection } from '@/services/geminiService';
import { useAuth } from '@/contexts/AuthContext';

interface ReflectorProps {
  onReflectionSubmit: (text: string, depth: number, confidence: ConfidenceLevel) => Promise<void>;
  todaysGoal?: string;
}

const Reflector: React.FC<ReflectorProps> = ({ onReflectionSubmit, todaysGoal }) => {
  const { user, userRole } = useAuth();
  const [text, setText] = useState('');
  const [depth, setDepth] = useState(3);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>('');

  const confidenceOptions = [
    { value: ConfidenceLevel.LOW, label: 'Low', color: 'bg-red-500' },
    { value: ConfidenceLevel.MEDIUM, label: 'Medium', color: 'bg-yellow-500' },
    { value: ConfidenceLevel.HIGH, label: 'High', color: 'bg-green-500' },
  ];

  // Analyze reflection with AI
  const analyzeWithAI = async () => {
    if (!text.trim()) return;
    
    const wordCount = text.split(' ').filter(word => word.length > 0).length;
    if (wordCount < 30) {
      setValidationError('Reflection must be at least 50 words for meaningful analysis.');
      return;
    }

    // Use today's goal or a fallback
    const goalToUse = todaysGoal || 'personal development and learning';

    setIsAnalyzing(true);
    setValidationError('');
    
    try {
      const result = await analyzeReflection(text, goalToUse, user?.uid, userRole);
      setAnalysisResult(result);
      
      if (result.isValid) {
        // Use AI-determined values
        setDepth(result.depth);
        setConfidence(result.confidenceLevel);
        setValidationError('');
      } else {
        setValidationError(result.feedback);
      }
    } catch (error) {
      console.error('Failed to analyze reflection:', error);
      setValidationError('Failed to analyze reflection. Please check your content and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;

    // If no AI analysis done yet, require it first
    if (!analysisResult) {
      setValidationError('Please analyze your reflection with AI first by clicking "Analyze Reflection".');
      return;
    }

    // Check if reflection passed AI validation
    if (!analysisResult.isValid) {
      setValidationError('Please improve your reflection based on the AI feedback before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReflectionSubmit(text, analysisResult.depth, analysisResult.confidenceLevel);
      // Reset form after successful submission
      setText('');
      setAnalysisResult(null);
      setValidationError('');
    } catch (error) {
      console.error("Failed to submit reflection", error);
      setValidationError('Failed to submit reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 bg-purple-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">How did it go today?</h3>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Reflect on your progress, challenges, and learnings.</p>
      
      {todaysGoal && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Today's Goal:</p>
          <p className="text-blue-600 dark:text-blue-300 mt-1">{todaysGoal}</p>
        </div>
      )}

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your Reflection (minimum 50 words)
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {text.split(' ').filter(word => word.length > 0).length} words
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setAnalysisResult(null); // Reset analysis when text changes
            setValidationError('');
          }}
          placeholder="Write a detailed reflection about your progress on today's goal. Include specific examples, challenges you faced, what you learned, and how you felt about your progress. Be honest and thoughtful - this helps the AI provide better insights."
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          rows={6}
          disabled={isSubmitting || isAnalyzing}
        />
      </div>

      {/* AI Analysis Button */}
      <div className="mt-4">
        <button
          onClick={analyzeWithAI}
          disabled={!text.trim() || text.split(' ').filter(word => word.length > 0).length < 50 || isAnalyzing || isSubmitting}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing with AI...
            </>
          ) : (
            '🤖 Analyze Reflection with AI'
          )}
        </button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{validationError}</p>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysisResult && (
        <div className={`mt-4 p-4 rounded-lg border ${
          analysisResult.isValid 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">
              {analysisResult.isValid ? '✅' : '⚠️'}
            </span>
            <h4 className={`font-medium ${
              analysisResult.isValid 
                ? 'text-green-800 dark:text-green-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              AI Analysis Results
            </h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Depth Score:</span>
              <span className="font-semibold">{analysisResult.depth}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Confidence Level:</span>
              <span className={`font-semibold capitalize ${
                analysisResult.confidenceLevel === ConfidenceLevel.HIGH ? 'text-green-600' :
                analysisResult.confidenceLevel === ConfidenceLevel.MEDIUM ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {analysisResult.confidenceLevel.toLowerCase()}
              </span>
            </div>
          </div>

          <div className={`mt-3 p-3 rounded ${
            analysisResult.isValid 
              ? 'bg-green-100 dark:bg-green-800/30'
              : 'bg-yellow-100 dark:bg-yellow-800/30'
          }`}>
            <p className={`text-sm ${
              analysisResult.isValid 
                ? 'text-green-700 dark:text-green-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              <strong>Feedback:</strong> {analysisResult.feedback}
            </p>
          </div>

          {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
            <div className="mt-3">
              <p className={`text-sm font-medium ${
                analysisResult.isValid 
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                Suggestions for improvement:
              </p>
              <ul className="mt-1 text-xs space-y-1">
                {analysisResult.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className={`${
                    analysisResult.isValid 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI-determined values display (read-only after analysis) */}
      {analysisResult && analysisResult.isValid && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            AI-Determined Values (automatically set based on analysis):
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400">Depth Score</label>
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {analysisResult.depth}/5
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analysisResult.depth / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400">Confidence Level</label>
              <div className={`text-lg font-semibold capitalize ${
                analysisResult.confidenceLevel === ConfidenceLevel.HIGH ? 'text-green-600' :
                analysisResult.confidenceLevel === ConfidenceLevel.MEDIUM ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {analysisResult.confidenceLevel.toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!analysisResult?.isValid || isSubmitting || isAnalyzing}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : !analysisResult ? (
            '⚠️ Analyze reflection first'
          ) : !analysisResult.isValid ? (
            '⚠️ Improve reflection based on AI feedback'
          ) : (
            '✅ Submit Validated Reflection'
          )}
        </button>
        
        {!analysisResult?.isValid && analysisResult && (
          <p className="mt-2 text-xs text-center text-yellow-600 dark:text-yellow-400">
            Please address the AI feedback before submitting your reflection.
          </p>
        )}
      </div>
    </Card>
  );
};

export default Reflector;