import React from 'react';

const Shimmer = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`} />
);

export const TabSkeleton: React.FC = () => (
  <div className="space-y-4 p-1">
    <Shimmer className="h-8 w-48" />
    <Shimmer className="h-24 w-full" />
    <div className="grid grid-cols-2 gap-4">
      <Shimmer className="h-40" />
      <Shimmer className="h-40" />
    </div>
    <Shimmer className="h-16 w-full" />
    <Shimmer className="h-16 w-full" />
  </div>
);
