import React from 'react';
import { SummaryStats } from '../types';

interface DashboardHeaderProps {
    stats: SummaryStats | null;
}

const StatCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-1 min-w-[180px]">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {children}
        </div>
    </div>
);

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ stats }) => {
    const sentimentColor = {
        Positive: 'text-green-500',
        Negative: 'text-red-500',
        Neutral: 'text-yellow-500',
    };

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Market Sentiment">
                    {stats?.marketSentiment ? (
                        <span className={sentimentColor[stats.marketSentiment]}>
                            {stats.marketSentiment}
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </StatCard>
                <StatCard title="Top Gainer (1W)">
                    {stats?.topGainer ? (
                        <span>
                           {stats.topGainer.symbol} <span className="text-green-500 text-lg">▲{stats.topGainer.change1w.toFixed(2)}%</span>
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </StatCard>
                <StatCard title="Avg. 6M Growth">
                    {stats?.avg6mGrowth ? (
                        <span className={stats.avg6mGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                            {stats.avg6mGrowth.toFixed(2)}%
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </StatCard>
            </div>
        </div>
    );
};

export default DashboardHeader;
