import React from 'react';

export default function HistorySkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="aspect-video bg-gray-200/70 dark:bg-gray-800" />
      <div className="p-3 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/5" />
        </div>
      </div>
    </div>
  );
}


