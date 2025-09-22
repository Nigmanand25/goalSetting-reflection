import React from 'react';
import { ApiKeySettings } from './shared/ApiKeySettings';
import AdminConsole from './admin/AdminConsole';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const isAdmin = userRole === UserRole.ADMIN;
  
  return (
    <div className="w-full min-h-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
            {isAdmin && <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">Admin</span>}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-1">
          {/* API Settings Section - Only for Students */}
          {!isAdmin ? (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">AI Configuration</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Configure your personal Gemini API key for AI-powered features</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ApiKeySettings mode="personal" />
              </div>
            </div>
          ) : (
            /* Admin API Status Section */
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="p-6 border-b border-indigo-200/50 dark:border-indigo-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <span className="text-white text-lg">👑</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin AI Configuration</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">AI features are centrally configured for admin users</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ApiKeySettings mode="system" />
              </div>
            </div>
          )}

          {/* Admin User Management Section - Only for Admins */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-red-700/50">
              <div className="p-6 border-b border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage user roles and permissions</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AdminConsole />
              </div>
            </div>
          )}

          {/* Additional Settings Sections in a grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Notifications Section */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <span className="text-white text-lg">🔔</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Notifications</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Configure your notification preferences</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Daily Reminders</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get reminded to set goals and reflect</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Progress Updates</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Weekly progress summary emails</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <span className="text-white text-lg">👤</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Update your profile information</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-semibold">👤</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Profile settings coming soon...</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Advanced profile customization features will be available in the next update</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
