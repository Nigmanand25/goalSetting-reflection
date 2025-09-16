import React from 'react';
import { StudentData } from '@/types';
import Timeline from '../student/Timeline';
import ProgressTracker from '../student/ProgressTracker';
import Badges from '../student/Badges';

interface StudentDetailViewProps {
  student: StudentData;
  onBack: () => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Student Details: {student.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Reviewing progress and activity.</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <ProgressTracker
        consistency={student.consistencyScore}
        streak={student.streak}
      />
      
      {student.badges && student.badges.length > 0 && (
          <Badges badges={student.badges} />
      )}

      <Timeline entries={student.entries} />
    </div>
  );
};

export default StudentDetailView;