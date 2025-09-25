import React, { useState } from 'react';
import { UserDeletionOptions } from '@/services/firebaseServiceReal';

interface UserDeletionModalProps {
  isOpen: boolean;
  userName: string;
  onConfirm: (options: UserDeletionOptions) => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

const UserDeletionModal: React.FC<UserDeletionModalProps> = ({
  isOpen,
  userName,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  const [deletionOptions, setDeletionOptions] = useState<UserDeletionOptions>({
    deleteAuthAccount: false,
    clearBrowserData: true,
    clearExternalData: false
  });

  const handleConfirm = async () => {
    await onConfirm(deletionOptions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Complete User Deletion
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Remove {userName} permanently
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 text-sm mt-0.5">🚨</span>
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-medium mb-1">This action cannot be undone!</p>
              <p>All learning data, progress, and account information will be permanently deleted.</p>
            </div>
          </div>
        </div>

        {/* Deletion Options */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-slate-900 dark:text-white">Select deletion scope:</h4>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deletionOptions.clearBrowserData || false}
                onChange={(e) => setDeletionOptions(prev => ({ 
                  ...prev, 
                  clearBrowserData: e.target.checked 
                }))}
                className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  🧹 Clear Browser Data
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Remove localStorage, cache, cookies, and offline data
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deletionOptions.deleteAuthAccount || false}
                onChange={(e) => setDeletionOptions(prev => ({ 
                  ...prev, 
                  deleteAuthAccount: e.target.checked 
                }))}
                className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  🔐 Delete Authentication Account
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Remove Firebase Auth login (limited to current user only)
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deletionOptions.clearExternalData || false}
                onChange={(e) => setDeletionOptions(prev => ({ 
                  ...prev, 
                  clearExternalData: e.target.checked 
                }))}
                className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  🔗 Clear External Integrations
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Remove data from third-party services and APIs
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-6">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong>What will be deleted:</strong> All Firestore data, daily entries, goals, reflections, quiz results, user profile
            {deletionOptions.clearBrowserData && ', browser storage & cache'}
            {deletionOptions.deleteAuthAccount && ', authentication account'}
            {deletionOptions.clearExternalData && ', external service data'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                🗑️ Delete Everything
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeletionModal;