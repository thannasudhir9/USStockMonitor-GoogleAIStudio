import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StockData, ProcessedStockData, SortableKey, SummaryStats, Currency, ConversionRates, DataSource, PriceAlert } from '../types';
import { fetchHighGrowthStocks, fetchConversionRates } from '../services/geminiService';
import { exportToCsv } from '../utils/export';
import { getAlerts, checkAlerts, addOrUpdateAlert, removeAlert, saveAlerts } from '../utils/alerts';
import StockTable from '../components/StockTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import StockDetailModal from '../components/StockDetailModal';
import DashboardHeader from '../components/DashboardHeader';
import StockCountSelector from '../components/StockCountSelector';
import TableSkeleton from '../components/TableSkeleton';
import DataSourceSelector from '../components/DataSourceSelector';
import ExportControls from '../components/ExportControls';
import AlertNotifications from '../components/AlertNotifications';

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
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [conversionRates, setConversionRates] = useState<ConversionRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'asc' | 'dsc' }>({ key: 'initialRank', direction: 'asc' });
  const [modalContent, setModalContent] = useState<{ stock?: ProcessedStockData; comparisonList?: ProcessedStockData[] } | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<{ alert: PriceAlert; stock: ProcessedStockData }[]>([]);
  const [stockCount, setStockCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('stockCount');
    return savedCount ? parseInt(savedCount, 10) : 25;
  });
   const [dataSource, setDataSource] = useState<DataSource>(() => {
    const savedSource = localStorage.getItem('dataSource');
    return (savedSource as DataSource) || 'Gemini';
  });

  useEffect(() => {
    setActiveAlerts(getAlerts());
  }, []);

  useEffect(() => {
    localStorage.setItem('stockCount', String(stockCount));
  }, [stockCount]);

   useEffect(() => {
    localStorage.setItem('dataSource', dataSource);
  }, [dataSource]);

  const loadStockData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!stocks) { // Only clear comparison on first load, not refresh
        setComparisonList([]);
    }
    try {
      const [stockData, ratesData] = await Promise.all([
          fetchHighGrowthStocks(stockCount, dataSource),
          fetchConversionRates()
      ]);
      
      setConversionRates({ USD: 1, ...ratesData });
      
      const momentumScores = calculateMomentumScore(stockData);
      const volatilities = calculateVolatility(stockData);

      const processedData: ProcessedStockData[] = stockData.map((stock, index) => ({
        ...stock,
        initialRank: index + 1,
        momentumScore: momentumScores[index]?.score ?? 50,
        volatilityLabel: volatilities[index]?.label ?? 'Medium',
      }));

      // Check for triggered alerts
      const currentAlerts = getAlerts();
      const { triggered, remaining } = checkAlerts(processedData, currentAlerts);
      if (triggered.length > 0) {
        setTriggeredAlerts(prev => [...prev, ...triggered]);
        setActiveAlerts(remaining);
        saveAlerts(remaining);
      }

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
  }, [stockCount, dataSource, stocks]);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  const stocksWithAlerts = useMemo(() => {
    if (!stocks) return null;
    const alertSymbols = new Set(activeAlerts.map(a => a.symbol));
    return stocks.map(stock => ({
        ...stock,
        hasActiveAlert: alertSymbols.has(stock.symbol),
    }));
  }, [stocks, activeAlerts]);

  const filteredStocks = useMemo(() => stocksWithAlerts
    ? stocksWithAlerts.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null, [stocksWithAlerts, searchQuery]);

  const handleSort = (key: SortableKey) => {
    let direction: 'asc' | 'dsc' = 'asc';
    if (sortConfig.key === key) {
        direction = sortConfig.direction === 'asc' ? 'dsc' : 'asc';
    } else {
        direction = ['initialRank', 'price', 'symbol'].includes(key) ? 'asc' : 'dsc';
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

  const handleExportCsv = () => {
    if (sortedStocks) {
      exportToCsv(sortedStocks, `us-stocks-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };
  
  const handleToggleCompare = (symbol: string) => {
    setComparisonList(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  };

  const handleToggleAllCompare = () => {
    if (!sortedStocks) return;
    const allSymbols = sortedStocks.map(s => s.symbol);
    if (comparisonList.length === allSymbols.length) {
      setComparisonList([]);
    } else {
      setComparisonList(allSymbols);
    }
  };
  
  const handleCompareClick = () => {
    if (stocks) {
      const stocksToCompare = stocks.filter(s => comparisonList.includes(s.symbol));
      setModalContent({ comparisonList: stocksToCompare });
    }
  };

  const handleSetAlert = (alert: PriceAlert) => {
    addOrUpdateAlert(alert);
    setActiveAlerts(getAlerts());
  };

  const handleRemoveAlert = (symbol: string) => {
    removeAlert(symbol);
    setActiveAlerts(getAlerts());
  };

  const handleDismissAlert = (symbol: string) => {
    setTriggeredAlerts(prev => prev.filter(a => a.alert.symbol !== symbol));
  };

  const renderContent = () => {
    if (isLoading && !stocks) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorDisplay message={error} onRetry={loadStockData} />;
    }
    if (sortedStocks) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden printable-table">
            {isLoading ? <TableSkeleton /> : 
              <StockTable 
                stocks={sortedStocks} 
                onSort={handleSort} 
                sortConfig={sortConfig} 
                onRowClick={(stock) => setModalContent({ stock })}
                currency={currency} 
                rates={conversionRates}
                comparisonList={comparisonList}
                onToggleCompare={handleToggleCompare}
                onToggleAllCompare={handleToggleAllCompare}
              />}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <AlertNotifications
          triggeredAlerts={triggeredAlerts}
          onDismiss={handleDismissAlert}
          currency={currency}
          rates={conversionRates}
      />
      <DashboardHeader stats={summaryStats} />
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6 no-print">
         <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
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
            <DataSourceSelector currentSource={dataSource} onSourceChange={setDataSource} />
         </div>
         <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
            {comparisonList.length >= 2 && (
              <button
                onClick={handleCompareClick}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
              >
                Compare ({comparisonList.length})
              </button>
            )}
            <StockCountSelector currentCount={stockCount} onCountChange={setStockCount} />
            <ExportControls onExportCsv={handleExportCsv} />
             <button
                onClick={loadStockData}
                disabled={isLoading}
                title="Refresh Data"
                className="flex items-center justify-center h-10 w-10 shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 10.5M20 20l-1.5-1.5A9 9 0 002.5 13.5"/>
                </svg>
            </button>
         </div>
      </div>
      
      {renderContent()}

      {modalContent && (
        <StockDetailModal 
          stock={modalContent.stock}
          comparisonList={modalContent.comparisonList}
          onClose={() => setModalContent(null)} 
          currency={currency}
          rates={conversionRates}
          activeAlert={activeAlerts.find(a => a.symbol === modalContent.stock?.symbol)}
          onSetAlert={handleSetAlert}
          onRemoveAlert={handleRemoveAlert}
        />
      )}
    </>
  );
};

export default DashboardPage;