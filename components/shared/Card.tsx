import React from 'react';

interface CardProps {
  // FIX: Make the 'children' prop optional to allow the Card component to be used without children, e.g., in loading skeletons.
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
