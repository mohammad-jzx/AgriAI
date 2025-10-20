import React from 'react';

export function SkeletonPanel() {
  return (
    <div className="w-full h-full min-h-[560px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 backdrop-blur-sm animate-pulse">
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-green-200 to-green-300 dark:from-green-700 dark:to-green-600 rounded-full animate-pulse" />

        <div className="space-y-3 w-full max-w-md">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-shimmer" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-5/6 animate-shimmer delay-100" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-4/6 animate-shimmer delay-200" />
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-8">
          <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse" />
          <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse delay-75" />
          <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse delay-150" />
          <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse delay-75" />
        </div>

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">جارٍ تحميل محلل الأمراض...</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .delay-75 { animation-delay: 75ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-150 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>
    </div>
  );
}
