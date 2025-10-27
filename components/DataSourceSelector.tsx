import React from 'react';
import { DataSource } from '../types';

interface DataSourceSelectorProps {
    currentSource: DataSource;
    onSourceChange: (source: DataSource) => void;
}

const sources: DataSource[] = ['Gemini', 'Google Finance', 'Yahoo Finance'];

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ currentSource, onSourceChange }) => {
    return (
        <div className="relative group flex items-center gap-2">
            <label htmlFor="data-source" className="text-sm font-medium text-gray-600 dark:text-gray-300">Data Source:</label>
            <select
                id="data-source"
                value={currentSource}
                onChange={(e) => onSourceChange(e.target.value as DataSource)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
                {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                ))}
            </select>
             <span className="absolute -top-12 -right-12 w-max max-w-xs p-2 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                Note: This instructs the AI to provide data as found on the selected platform. It is not a direct connection.
            </span>
        </div>
    );
};

export default DataSourceSelector;