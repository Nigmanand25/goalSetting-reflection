import React from 'react';
import { SMARTScore } from '@/types';

interface SmartScoreDisplayProps {
  score: SMARTScore;
  size?: 'small' | 'medium' | 'large';
  showAverage?: boolean;
}

const SmartScoreDisplay: React.FC<SmartScoreDisplayProps> = ({ 
  score, 
  size = 'medium',
  showAverage = false 
}) => {
  const scoreItems = [
    { key: 'specific', name: 'Specific', value: score.specific, color: 'bg-blue-500' },
    { key: 'measurable', name: 'Measurable', value: score.measurable, color: 'bg-green-500' },
    { key: 'achievable', name: 'Achievable', value: score.achievable, color: 'bg-yellow-500' },
    { key: 'realistic', name: 'Realistic', value: score.realistic, color: 'bg-orange-500' },
    { key: 'timeBound', name: 'Time-bound', value: score.timeBound, color: 'bg-purple-500' },
  ];

  const average = (score.specific + score.measurable + score.achievable + score.realistic + score.timeBound) / 5;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'grid-cols-5 gap-1',
          item: 'p-1',
          label: 'text-xs',
          value: 'text-sm font-bold',
        };
      case 'large':
        return {
          container: 'grid-cols-2 sm:grid-cols-5 gap-3',
          item: 'p-3',
          label: 'text-sm font-medium',
          value: 'text-xl font-bold',
        };
      default: // medium
        return {
          container: 'grid-cols-2 sm:grid-cols-5 gap-2',
          item: 'p-2',
          label: 'text-xs font-medium',
          value: 'text-lg font-bold',
        };
    }
  };

  const classes = getSizeClasses();

  const getScoreColor = (value: number) => {
    if (value >= 4.5) return 'text-green-600 dark:text-green-400';
    if (value >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
    if (value >= 2.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-2">
      {showAverage && (
        <div className="text-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Average Score: </span>
          <span className={`font-bold ${getScoreColor(average)}`}>
            {average.toFixed(1)}/5.0
          </span>
        </div>
      )}
      
      <div className={`grid ${classes.container} text-center`}>
        {scoreItems.map((item) => (
          <div key={item.key} className={`bg-slate-100 dark:bg-slate-700 ${classes.item} rounded-lg`}>
            <div className={`${classes.label} text-slate-500 dark:text-slate-400`}>
              {size === 'small' ? item.name.charAt(0) : item.name}
            </div>
            <div className={`${classes.value} ${getScoreColor(item.value)}`}>
              {item.value}/5
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartScoreDisplay;
