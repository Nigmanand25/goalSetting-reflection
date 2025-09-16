import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getUserProfile } from '../../services/firebaseServiceReal';
import { testGeminiAPI } from '../../services/geminiService';

interface ApiSettingsProps {
  onApiKeySet?: () => void;
  isFirstTime?: boolean;
}

export const ApiSettings: React.FC<ApiSettingsProps> = ({ onApiKeySet, isFirstTime = false }) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadExistingApiKey();
  }, [user]);

  const loadExistingApiKey = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.geminiApiKey) {
        // Show masked API key
        const maskedKey = profile.geminiApiKey.substring(0, 10) + '...' + profile.geminiApiKey.slice(-4);
        setApiKey(maskedKey);
        setMessage('API key is already configured');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const handleTestApi = async () => {
    if (!apiKey || apiKey.includes('...')) {
      setMessage('Please enter a valid API key');
      setMessageType('error');
      return;
    }

    setIsTestingApi(true);
    setMessage('Testing API key...');
    setMessageType('info');

    try {
      const isValid = await testGeminiAPI(apiKey);
      if (isValid) {
        setMessage('✅ API key is valid and working!');
        setMessageType('success');
      } else {
        setMessage('❌ API key is invalid or not working');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Error testing API key');
      setMessageType('error');
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!user || !apiKey || apiKey.includes('...')) {
      setMessage('Please enter a valid API key');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('Saving API key...');
    setMessageType('info');

    try {
      // Test API key first
      const isValid = await testGeminiAPI(apiKey);
      if (!isValid) {
        setMessage('❌ Invalid API key. Please check and try again.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      // Save to user profile
      await updateUserProfile(user.uid, {
        geminiApiKey: apiKey,
        apiKeyUpdatedAt: new Date().toISOString()
      });

      setMessage('✅ API key saved successfully!');
      setMessageType('success');
      
      // Mask the displayed key
      const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.slice(-4);
      setApiKey(maskedKey);

      if (onApiKeySet) {
        onApiKeySet();
      }
    } catch (error) {
      setMessage('❌ Error saving API key');
      setMessageType('error');
      console.error('Error saving API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateApiKey = () => {
    setApiKey('');
    setMessage('Enter your new Gemini API key');
    setMessageType('info');
  };

  const isApiKeyMasked = apiKey.includes('...');
  const hasApiKey = apiKey && isApiKeyMasked;

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {isFirstTime ? '🚀 Welcome! Setup Your AI Assistant' : 'Gemini API Configuration'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {isFirstTime 
            ? 'To use AI-powered features, please configure your Gemini API key'
            : 'Manage your Gemini API key for AI features'
          }
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
            Gemini API Key
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type={isApiKeyMasked ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key (AIzaSy...)"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                disabled={isApiKeyMasked}
              />
              {apiKey && !isApiKeyMasked && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-xs text-slate-400">🔒</span>
                </div>
              )}
            </div>
            {hasApiKey && (
              <button
                onClick={handleUpdateApiKey}
                className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Update
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border-l-4 ${
            messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500' :
            messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-500'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!isApiKeyMasked && (
            <button
              onClick={handleTestApi}
              disabled={isTestingApi || !apiKey}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <span>{isTestingApi ? '🔄' : '🧪'}</span>
              <span>{isTestingApi ? 'Testing...' : 'Test API'}</span>
            </button>
          )}
          
          <button
            onClick={handleSaveApiKey}
            disabled={isLoading || isApiKeyMasked || !apiKey}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-400 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <span>{isLoading ? '💾' : hasApiKey ? '✅' : '💾'}</span>
            <span>{isLoading ? 'Saving...' : hasApiKey ? 'Configured' : 'Save API Key'}</span>
          </button>
        </div>

        <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <span className="text-white text-lg">🔑</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">How to get your Gemini API Key:</h3>
              <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside ml-2">
                <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key" button</li>
                <li>Copy the generated key and paste it above</li>
              </ol>
              <div className="mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Your API key is securely stored in your profile and never shared with third parties.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
