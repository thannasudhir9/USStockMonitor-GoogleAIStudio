import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StockData, ProcessedStockData, SortableKey, SummaryStats, Currency, ConversionRates } from '../types';
import { fetchHighGrowthStocks, fetchConversionRates } from '../services/geminiService';
import StockTable from '../components/StockTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import StockDetailModal from '../components/StockDetailModal';
import DashboardHeader from '../components/DashboardHeader';
import StockCountSelector from '../components/StockCountSelector';
import TableSkeleton from '../components/TableSkeleton';

interface DashboardPageProps {
    currency: Currency;
}

const calculateMomentumScore = (stocks: StockData[]): { score: number, raw: number }[] => {
  const weights = { change1w: 0.35, change1m: 0.25, change3m: 0.2, change6m: 0.15, change1y: 0.05 };
  
  if (stocks.length === 0) return [];

  const rawScores = stocks.map(stock => {
    const score = (stock.change1w * weights.change1w) +
                  (stock.change1m * weights.change1m) +
                  (stock.change3m * weights.change3m) +
                  (stock.change6m * weights.change6m) +
                  (stock.change1y * weights.change1y);
    return { symbol: stock.symbol, raw: score };
  });

  const minScore = Math.min(...rawScores.map(s => s.raw));
  const maxScore = Math.max(...rawScores.map(s => s.raw));

  if (maxScore === minScore) {
    return rawScores.map(s => ({ score: 50, raw: s.raw }));
  }

  return rawScores.map(s => {
    const normalizedScore = ((s.raw - minScore) / (maxScore - minScore)) * 100;
    return { score: normalizedScore, raw: s.raw };
  });
};

const calculateVolatility = (stocks: StockData[]): { label: 'Low' | 'Medium' | 'High', value: number }[] => {
    if (stocks.length === 0) return [];
    
    const volatilities = stocks.map(stock => {
        const changes = [stock.change1w, stock.change1m, stock.change3m, stock.change6m, stock.change1y];
        const mean = changes.reduce((acc, val) => acc + val, 0) / changes.length;
        const variance = changes.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / changes.length;
        return { symbol: stock.symbol, value: Math.sqrt(variance) };
    });

    const sortedValues = [...volatilities].sort((a, b) => a.value - b.value);
    const lowThreshold = sortedValues[Math.floor(sortedValues.length / 3)]?.value ?? 0;
    const highThreshold = sortedValues[Math.floor(2 * sortedValues.length / 3)]?.value ?? Infinity;

    return volatilities.map(v => {
        let label: 'Low' | 'Medium' | 'High' = 'Medium';
        if (v.value <= lowThreshold) label = 'Low';
        else if (v.value >= highThreshold) label = 'High';
        return { label, value: v.value };
    });
};


const DashboardPage: React.FC<DashboardPageProps> = ({ currency }) => {
  const [stocks, setStocks] = useState<ProcessedStockData[] | null>(null);
  const [conversionRates, setConversionRates] = useState<ConversionRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'asc' | 'dsc' }>({ key: 'change6m', direction: 'dsc' });
  const [selectedStock, setSelectedStock] = useState<ProcessedStockData | null>(null);
  const [stockCount, setStockCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('stockCount');
    return savedCount ? parseInt(savedCount, 10) : 25;
  });

  useEffect(() => {
    localStorage.setItem('stockCount', String(stockCount));
  }, [stockCount]);

  const loadStockData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stockData, ratesData] = await Promise.all([
          fetchHighGrowthStocks(stockCount),
          fetchConversionRates()
      ]);
      
      setConversionRates({ USD: 1, ...ratesData });
      
      const momentumScores = calculateMomentumScore(stockData);
      const volatilities = calculateVolatility(stockData);

      const processedData: ProcessedStockData[] = stockData.map((stock, index) => ({
        ...stock,
        momentumScore: momentumScores[index]?.score ?? 50,
        volatilityLabel: volatilities[index]?.label ?? 'Medium',
      }));

      setStocks(processedData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [stockCount]);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  const filteredStocks = useMemo(() => stocks
    ? stocks.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null, [stocks, searchQuery]);

  const handleSort = (key: SortableKey) => {
    let direction: 'asc' | 'dsc' = 'asc';
    if (sortConfig.key === key) {
        direction = sortConfig.direction === 'asc' ? 'dsc' : 'asc';
    } else {
        direction = ['price', 'symbol'].includes(key) ? 'asc' : 'dsc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedStocks = useMemo(() => {
    if (!filteredStocks) return null;
    
    const sortableItems = [...filteredStocks];
    sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
    });
    return sortableItems;
  }, [filteredStocks, sortConfig]);
  
  const summaryStats: SummaryStats | null = useMemo(() => {
    if (!sortedStocks || sortedStocks.length === 0) return null;

    const avg6mGrowth = sortedStocks.reduce((acc, stock) => acc + stock.change6m, 0) / sortedStocks.length;
    const weeklyChanges = sortedStocks.map(s => s.change1w);
    const positiveCount = weeklyChanges.filter(c => c > 0).length;
    const sentimentRatio = positiveCount / sortedStocks.length;
    
    let marketSentiment: SummaryStats['marketSentiment'] = 'Neutral';
    if (sentimentRatio > 0.6) marketSentiment = 'Positive';
    else if (sentimentRatio < 0.4) marketSentiment = 'Negative';

    const topGainer = [...sortedStocks].sort((a, b) => b.change1w - a.change1w)[0];

    return { avg6mGrowth, marketSentiment, topGainer };
  }, [sortedStocks]);


  const renderContent = () => {
    if (isLoading && !stocks) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorDisplay message={error} onRetry={loadStockData} />;
    }
    if (sortedStocks) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {isLoading ? <TableSkeleton /> : <StockTable stocks={sortedStocks} onSort={handleSort} sortConfig={sortConfig} onRowClick={setSelectedStock} currency={currency} rates={conversionRates} />}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <DashboardHeader stats={summaryStats} />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
         <div className="relative w-full sm:w-72">
             <input
                type="text"
                placeholder="Filter by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
             />
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
         </div>
         <div className="flex items-center gap-4">
            <StockCountSelector currentCount={stockCount} onCountChange={setStockCount} />
             <button
                onClick={loadStockData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 10.5M20 20l-1.5-1.5A9 9 0 002.5 13.5"/>
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
         </div>
      </div>
      
      {renderContent()}

      {selectedStock && (
        <StockDetailModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
          currency={currency}
          rates={conversionRates}
        />
      )}
    </>
  );
};

export default DashboardPage;