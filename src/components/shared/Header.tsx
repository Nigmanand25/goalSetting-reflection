
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  currentRole: UserRole;
}

const Header: React.FC<HeaderProps> = ({ currentRole }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-white dark:bg-slate-800 shadow-lg border-b border-slate-200 dark:border-slate-700">
      <div className="w-full px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.906 59.906 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Zenith <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Coach</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">AI-Powered Goal Setting Platform</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Navigation & User */}
          <div className="flex items-center space-x-6">
            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentPath === '/' || currentPath === '/dashboard'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentPath === '/settings'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </Link>
              </nav>
            )}

            {/* Mobile Navigation */}
            {user && (
              <nav className="md:hidden flex items-center space-x-2">
                <Link
                  to="/"
                  className={`p-2 rounded-lg transition-colors ${
                    currentPath === '/' || currentPath === '/dashboard'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Dashboard"
                >
                  📊
                </Link>
                <Link
                  to="/settings"
                  className={`p-2 rounded-lg transition-colors ${
                    currentPath === '/settings'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Settings"
                >
                  ⚙️
                </Link>
              </nav>
            )}

            {/* User Profile & Sign Out */}
            {user && (
              <div className="flex items-center space-x-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="h-10 w-10 rounded-full ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentRole === UserRole.ADMIN ? 'Administrator' : 'Student'}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title="Sign Out"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
