
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center bg-red-50 dark:bg-gray-700/50 rounded-lg p-6">
      <svg className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops! Something went wrong.</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorDisplay;