import React from 'react';

interface StockCountSelectorProps {
    currentCount: number;
    onCountChange: (count: number) => void;
}

const counts = [5, 10, 20, 25, 50, 100];

const StockCountSelector: React.FC<StockCountSelectorProps> = ({ currentCount, onCountChange }) => {
    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 px-2 hidden sm:inline">Top:</span>
            {counts.map(count => {
                const isActive = currentCount === count;
                return (
                    <button
                        key={count}
                        onClick={() => onCountChange(count)}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
                            isActive
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                        }`}
                    >
                        {count}
                    </button>
                )
            })}
        </div>
    );
};

export default StockCountSelector;
