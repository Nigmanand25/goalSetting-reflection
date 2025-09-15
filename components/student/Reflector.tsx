import React, { useState } from 'react';
import Card from '../shared/Card';
import { ConfidenceLevel } from '../../types';

interface ReflectorProps {
  onReflectionSubmit: (text: string, depth: number, confidence: ConfidenceLevel) => Promise<void>;
}

const Reflector: React.FC<ReflectorProps> = ({ onReflectionSubmit }) => {
  const [text, setText] = useState('');
  const [depth, setDepth] = useState(3);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confidenceOptions = [
    { value: ConfidenceLevel.LOW, label: 'Low', color: 'bg-red-500' },
    { value: ConfidenceLevel.MEDIUM, label: 'Medium', color: 'bg-yellow-500' },
    { value: ConfidenceLevel.HIGH, label: 'High', color: 'bg-green-500' },
  ];

  const handleSubmit = async () => {
    if(!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
        await onReflectionSubmit(text, depth, confidence);
    } catch (error) {
        console.error("Failed to submit reflection", error);
        // Optionally show an error to the user
    } finally {
        setIsSubmitting(false);
    }
  }

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

      <div className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., I found the nested loops confusing at first, but after drawing it out, it started to make sense..."
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reflection Depth (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confidence Level</label>
          <div className="flex space-x-2 mt-2">
            {confidenceOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setConfidence(option.value)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition ${
                  confidence === option.value
                    ? `${option.color} text-white shadow-lg`
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                disabled={isSubmitting}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reflection'}
        </button>
      </div>
    </Card>
  );
};

export default Reflector;