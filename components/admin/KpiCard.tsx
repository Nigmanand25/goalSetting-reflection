
import React from 'react';
import Card from '../shared/Card';

interface KpiCardProps {
  title: string;
  value: string;
  trend: number; // Positive for up, negative for down
}

const TrendIndicator: React.FC<{ trend: number }> = ({ trend }) => {
  const isUp = trend >= 0;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isUp ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
      {isUp ? (
        <svg className="-ml-0.5 mr-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="-ml-0.5 mr-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {Math.abs(trend)}%
    </span>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend }) => {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
        </div>
        <TrendIndicator trend={trend} />
      </div>
    </Card>
  );
};

export default KpiCard;
