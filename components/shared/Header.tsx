
import React from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg className="h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.906 59.906 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Zenith <span className="text-indigo-500">Coach</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Role Switcher */}
          <div className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 p-1 rounded-full">
            <button
              onClick={() => onRoleChange(UserRole.STUDENT)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                currentRole === UserRole.STUDENT ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => onRoleChange(UserRole.ADMIN)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                currentRole === UserRole.ADMIN ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Info & Sign Out */}
          {user && (
            <div className="flex items-center space-x-3">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-slate-700 dark:text-slate-300 hidden sm:block">
                {user.displayName}
              </span>
              <button
                onClick={signOut}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
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
    </header>
  );
};

export default Header;
