import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../shared/Card';
import { AtRiskStudent } from '@/types';

interface RiskAlertsProps {
  students: AtRiskStudent[];
  onSelectStudent: (studentId: string) => void;
}

const RiskAlerts: React.FC<RiskAlertsProps> = ({ students, onSelectStudent }) => {
  const navigate = useNavigate();

  const handleStudentClick = (studentId: string) => {
    // Update URL to show student detail route
    navigate(`/admin/students/${studentId}`);
    // Keep existing behavior
    onSelectStudent(studentId);
  };
  return (
    <Card>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 bg-red-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">At-Risk Students</h3>
      </div>
      
      <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
        {students.map(student => (
          <li key={student.id}>
            <button 
              onClick={() => handleStudentClick(student.id)}
              className="w-full text-left py-3 px-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
              aria-label={`View details for ${student.name}`}
            >
                <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{student.name}</p>
                    <span className="text-xs font-semibold text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900 px-2 py-1 rounded-full">
                        Alert
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{student.reason}</p>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RiskAlerts;