import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getUserProfile } from '../../services/firebaseServiceReal';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { testGeminiAPI } from '../../services/geminiService';

interface ApiKeySettingsProps {
  mode: 'personal' | 'system';
  title?: string;
  description?: string;
  onApiKeySet?: () => void;
  isFirstTime?: boolean;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({
  mode,
  title = mode === 'personal' ? 'Personal AI Configuration' : 'System AI Configuration',
  description = mode === 'personal'
    ? 'Configure your personal Gemini API key for AI-powered features'
    : 'Configure the system-wide Gemini API key for all admin operations',
  onApiKeySet,
  isFirstTime = false
}) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (mode === 'personal') {
      loadPersonalApiKey();
    } else {
      loadSystemApiKey();
    }
  }, [user, mode]);

  const loadPersonalApiKey = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.geminiApiKey) {
        // Show masked API key
        const maskedKey = profile.geminiApiKey.substring(0, 10) + '...' + profile.geminiApiKey.slice(-4);
        setApiKey(maskedKey);
        setMessage('Personal API key is configured');
        setMessageType('success');
      } else {
        setMessage('No personal API key configured. Please set one below.');
        setMessageType('info');
      }
    } catch (error) {
      console.error('Error loading personal API key:', error);
      setMessage('Error loading API key configuration');
      setMessageType('error');
    }
  };

  const loadSystemApiKey = async () => {
    if (!user) return;

    try {
      const configRef = doc(db, 'adminConfig', 'system');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists() && configSnap.data()?.geminiApiKey) {
        // Show masked API key
        const key = configSnap.data().geminiApiKey;
        const maskedKey = key.substring(0, 10) + '...' + key.slice(-4);
        setApiKey(maskedKey);
        setMessage('System API key is configured');
        setMessageType('success');
      } else {
        setMessage('No system API key configured. Please set one below.');
        setMessageType('info');
      }
    } catch (error) {
      console.error('Error loading system API key:', error);
      setMessage('Error loading API key configuration');
      setMessageType('error');
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.includes('...')) {
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

      if (mode === 'personal') {
        // Save to user profile
        await updateUserProfile(user!.uid, {
          geminiApiKey: apiKey,
          apiKeyUpdatedAt: new Date().toISOString()
        });
        setMessage('✅ Personal API key saved successfully!');
      } else {
        // Save to admin config
        const configRef = doc(db, 'adminConfig', 'system');
        await setDoc(configRef, {
          geminiApiKey: apiKey,
          updatedBy: user?.uid,
          updatedAt: new Date(),
          updatedByEmail: user?.email
        });
        setMessage('✅ System API key saved successfully!');
      }

      setMessageType('success');
      onApiKeySet?.();

      // Mask the displayed key
      const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.slice(-4);
      setApiKey(maskedKey);
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage('❌ Failed to save API key');
      setMessageType('error');
    }
    setIsLoading(false);
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
      console.error('API test error:', error);
      setMessage('❌ API key test failed');
      setMessageType('error');
    }
    setIsTestingApi(false);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    // Clear any previous messages when user starts typing
    if (message) {
      setMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {mode === 'personal' ? 'Personal' : 'System'} Gemini API Key
        </label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder={`Enter your ${mode === 'personal' ? 'personal' : 'system'} API key`}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
        />
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {mode === 'personal'
            ? 'This API key will be used for your personal AI features'
            : 'This API key will be used for all admin AI operations and as fallback for students'
          }
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleSaveApiKey}
          disabled={isLoading || !apiKey}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save API Key'}
        </button>

        <button
          onClick={handleTestApi}
          disabled={isTestingApi || !apiKey}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {isTestingApi ? 'Testing...' : 'Test API Key'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${
          messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
          messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Security Notice</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {mode === 'personal'
                ? 'Keep your personal API key secure. It will only be used for your AI features.'
                : 'This system API key will be used for all administrative operations. Make sure to use a secure, dedicated API key with appropriate quotas.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
