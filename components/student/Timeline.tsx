
import React from 'react';
import Card from '../shared/Card';
import { DailyEntry } from '../../types';

interface TimelineProps {
  entries: DailyEntry[];
}

const TimelineEntry: React.FC<{ entry: DailyEntry, isLast: boolean }> = ({ entry, isLast }) => {
    const statusColor = entry.goal.completed ? 'bg-green-500' : 'bg-red-500';
    return (
        <li className="relative pb-8">
            {!isLast && <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />}
            <div className="relative flex space-x-3">
                <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-50 dark:ring-slate-900 ${statusColor}`}>
                        {entry.goal.completed ? (
                             <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                             <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                    </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{entry.goal.text}</p>
                    </div>
                </div>
            </div>
        </li>
    );
};


const Timeline: React.FC<TimelineProps> = ({ entries }) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Your Journey</h3>
      <ul className="-mb-8">
        {entries.map((entry, index) => (
          <TimelineEntry key={entry.date} entry={entry} isLast={index === entries.length - 1} />
        ))}
      </ul>
    </Card>
  );
};

export default Timeline;
