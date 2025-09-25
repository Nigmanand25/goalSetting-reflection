import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../shared/Card';
import { useApp } from '@/contexts/AppContext';
import UserDeletionModal from './UserDeletionModal';
import { UserDeletionOptions } from '@/services/firebaseServiceReal';

interface Student {
  id: string;
  name: string;
  email?: string;
}

interface StudentsListProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, onSelectStudent }) => {
  const navigate = useNavigate();
  const { removeUserCompletely } = useApp();
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const handleStudentClick = (studentId: string) => {
    // Update URL to show student detail route
    navigate(`/admin/students/${studentId}`);
    // Keep existing behavior
    onSelectStudent(studentId);
  };

  const handleRemoveUser = async (userId: string, userName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering student click
    setShowDeletionModal({ userId, userName });
  };

  const confirmRemoveUser = async (options: UserDeletionOptions) => {
    if (!showDeletionModal) return;
    
    try {
      setRemovingUserId(showDeletionModal.userId);
      await removeUserCompletely(showDeletionModal.userId, options);
      console.log(`Successfully removed user: ${showDeletionModal.userName}`);
      setShowDeletionModal(null);
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert(`Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRemovingUserId(null);
    }
  };

  const cancelRemove = () => {
    setShowDeletionModal(null);
  };
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <span className="text-2xl mr-2">👥</span>
          All Students
        </h3>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full">
          {students?.length || 0} students
        </span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {students?.map((student) => (
          <div
            key={student.id}
            className="group p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={() => handleStudentClick(student.id)}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {student.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {student.email || `ID: ${student.id}`}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Remove User Button */}
                <button
                  onClick={(e) => handleRemoveUser(student.id, student.name, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200"
                  title={`Remove ${student.name}`}
                  disabled={removingUserId === student.id}
                >
                  {removingUserId === student.id ? (
                    <div className="w-4 h-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
                
                {/* Navigation Arrow */}
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  onClick={() => handleStudentClick(student.id)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
        
        {(!students || students.length === 0) && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-slate-500 dark:text-slate-400">No students found</p>
          </div>
        )}
      </div>
      
      {/* User Deletion Modal */}
      {showDeletionModal && (
        <UserDeletionModal
          isOpen={true}
          userName={showDeletionModal.userName}
          onConfirm={confirmRemoveUser}
          onCancel={cancelRemove}
          isDeleting={removingUserId === showDeletionModal.userId}
        />
      )}
    </Card>
  );
};

export default StudentsList;
