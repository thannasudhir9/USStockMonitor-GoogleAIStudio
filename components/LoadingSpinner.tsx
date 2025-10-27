
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 border-4 border-blue-400 border-dashed rounded-full animate-spin border-t-transparent"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading data...</p>
    </div>
  );
};

export default LoadingSpinner;