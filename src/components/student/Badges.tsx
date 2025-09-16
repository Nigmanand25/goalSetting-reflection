import React from 'react';
import Card from '../shared/Card';
import { Badge } from '@/types';

interface BadgesProps {
  badges: Badge[];
}

const BadgeItem: React.FC<{ badge: Badge }> = ({ badge }) => (
  <div className="relative group flex flex-col items-center text-center">
    <div className="text-4xl p-3 bg-slate-200 dark:bg-slate-700 rounded-full transition-transform group-hover:scale-110">
        {badge.icon}
    </div>
    <p className="text-xs font-semibold mt-2 text-slate-700 dark:text-slate-200">{badge.name}</p>
    {/* Tooltip */}
    <div className="absolute bottom-full mb-2 w-48 p-2 text-xs text-white bg-slate-800 dark:bg-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {badge.description}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800 dark:border-t-slate-900"></div>
    </div>
  </div>
);

const Badges: React.FC<BadgesProps> = ({ badges }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Your Achievements</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {badges.map(badge => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </Card>
  );
};

export default Badges;
