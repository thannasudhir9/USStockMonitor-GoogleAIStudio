import React from 'react';

const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="py-4 px-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
        </td>
        <td className="py-4 px-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </td>
        <td className="py-4 px-4 text-right">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div>
        </td>
        <td className="py-4 px-4 text-right">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div>
        </td>
        {[...Array(5)].map((_, i) => (
             <td key={i} className="py-4 px-4 text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div>
            </td>
        ))}
        <td className="py-4 px-4 text-right">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
        </td>
        <td className="py-4 px-4 text-right">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 ml-auto"></div>
        </td>
        <td className="py-4 px-4 text-center">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </td>
    </tr>
);

const TableSkeleton: React.FC = () => {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left">
          <thead className="border-b border-gray-200 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400">
             <tr>
                <th className="py-3 px-4 text-left uppercase tracking-wider">#</th>
                <th className="py-3 px-4 text-left uppercase tracking-wider">Stock</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">Price</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">Last Updated</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">1W %</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">1M %</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">3M %</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">6M %</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">1Y %</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">Momentum</th>
                <th className="py-3 px-4 text-right uppercase tracking-wider">Volatility</th>
                <th className="py-3 px-4 text-center uppercase tracking-wider">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
};

export default TableSkeleton;