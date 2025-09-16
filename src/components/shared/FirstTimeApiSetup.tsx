import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiSettings } from './ApiSettings';
import { getUserProfile } from '../../services/firebaseServiceReal';

interface FirstTimeApiSetupProps {
  onComplete?: () => void;
}

export const FirstTimeApiSetup: React.FC<FirstTimeApiSetupProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkApiKeyStatus();
  }, [user]);

  const checkApiKeyStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.uid);
      const hasApiKey = profile?.geminiApiKey && profile.geminiApiKey.trim() !== '';
      
      if (!hasApiKey) {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
      // Show setup modal if we can't determine the status
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySet = () => {
    setShowModal(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span>Checking your setup...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🚀 Welcome to Zenith Coach!</h2>
              <p className="text-gray-600 mt-2">
                To get the best AI-powered experience, please set up your Gemini API key.
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              title="Skip for now"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <ApiSettings onApiKeySet={handleApiKeySet} isFirstTime={true} />
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 You can always configure this later in Settings
            </div>
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
