// components/layout/LoadingStates.tsx - 로딩 상태 컴포넌트들
import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="card animate-pulse">
    <div className="flex items-start gap-4 mb-6">
      <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
    </div>
    
    <div className="grid grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
      ))}
    </div>
    
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin`} />
  );
}; 