import React from 'react';
import Card from '../shared/Card';

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
            onClick={() => onSelectStudent(student.id)}
            className="group p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        ))}
        
        {(!students || students.length === 0) && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-slate-500 dark:text-slate-400">No students found</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentsList;
