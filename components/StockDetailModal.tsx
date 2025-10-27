import React, { useMemo, useState, useCallback } from 'react';
import { ProcessedStockData, Currency, ConversionRates } from '../types';
import { formatCurrency } from '../utils/currency';
import { fetchHistoricalPrice } from '../services/geminiService';

interface StockDetailModalProps {
  stock: ProcessedStockData;
  onClose: () => void;
  currency: Currency;
  rates: ConversionRates | null;
}

const ChangeIndicator: React.FC<{ value: number; label: string }> = ({ value, label }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    return (
        <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`font-mono font-semibold ${colorClass}`}>
                {isPositive ? '+' : '-'}{Math.abs(value).toFixed(2)}%
            </span>
        </div>
    );
};

const SparklineChart: React.FC<{ stock: ProcessedStockData; currency: Currency; rates: ConversionRates | null }> = ({ stock, currency, rates }) => {
    const { points, min, max } = useMemo(() => {
        const now = stock.price;
        const price1y = now / (1 + stock.change1y / 100);
        const price6m = now / (1 + stock.change6m / 100);
        const price3m = now / (1 + stock.change3m / 100);
        const price1m = now / (1 + stock.change1m / 100);
        const price1w = now / (1 + stock.change1w / 100);

        const data = [price1y, price6m, price3m, price1m, price1w, now];
        
        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        const range = dataMax - dataMin === 0 ? 1 : dataMax - dataMin;

        const width = 280;
        const height = 80;
        const paddingY = 15;

        const chartPoints = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = (height - paddingY) - ((d - dataMin) / range) * (height - (2 * paddingY));
            return { x, y };
        });

        return { points: chartPoints, min: dataMin, max: dataMax };
    }, [stock]);

    const pathD = points.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
    const isPositive = stock.change1y >= 0;
    const strokeColor = isPositive ? 'stroke-green-500' : 'stroke-red-500';
    const fillColor = isPositive ? 'fill-green-500' : 'fill-red-500';

    return (
        <div className="w-full relative pl-16">
            <svg viewBox={`0 0 280 80`} className="w-full h-auto overflow-visible">
                <line x1="0" y1={points[0].y} x2="280" y2={points[0].y} strokeDasharray="2" className="stroke-gray-300 dark:stroke-gray-600" />
                <path d={pathD} fill="none" strokeWidth="2" className={strokeColor} />
                <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="4" className={`${fillColor} stroke-white dark:stroke-gray-800`} strokeWidth="2" />
            </svg>
            <div className="absolute left-0 -top-1 -bottom-1 flex flex-col justify-between text-xs text-gray-400 font-mono py-1">
                <span className="text-right w-14">{formatCurrency(max, currency, rates)}</span>
                <span className="text-right w-14">{formatCurrency(min, currency, rates)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 Year Ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};

const HistoricalPriceLookup: React.FC<{ stock: ProcessedStockData; currency: Currency; rates: ConversionRates | null }> = ({ stock, currency, rates }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [historicalPrice, setHistoricalPrice] = useState<number | null | 'not_found'>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
        setHistoricalPrice(null);
        setError(null);
    };

    const handleFetchPrice = useCallback(async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        setError(null);
        setHistoricalPrice(null);

        try {
            const result = await fetchHistoricalPrice(stock.symbol, selectedDate);
            if (result && result.price !== null) {
                setHistoricalPrice(result.price);
            } else {
                setHistoricalPrice('not_found');
            }
        } catch (err) {
            setError('Failed to fetch price.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, stock.symbol]);

    return (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-400 dark:text-gray-500 mb-3">Historical Price Lookup</h3>
            <div className="flex flex-col sm:flex-row gap-2 items-start">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full sm:w-auto flex-grow px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select date for historical price"
                />
                <button
                    onClick={handleFetchPrice}
                    disabled={!selectedDate || isLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Fetching...' : 'Get Price'}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {historicalPrice !== null && (
                 <div className="mt-3 text-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                    {historicalPrice === 'not_found' ? (
                        <p className="text-gray-600 dark:text-gray-300">No data available for {selectedDate}. The market may have been closed.</p>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200">
                            Closing price on {selectedDate}: <span className="font-bold text-lg">{formatCurrency(historicalPrice, currency, rates)}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};


const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, currency, rates }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-auto transition-transform transform scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 id="stock-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div className="mb-6 text-right">
                <p className="text-4xl font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(stock.price, currency, rates)}</p>
                {stock.lastTradeDate && <p className="text-xs text-gray-400">As of {stock.lastTradeDate}</p>}
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase text-gray-400 dark:text-gray-500 mb-2">1-Year Performance</h3>
                <SparklineChart stock={stock} currency={currency} rates={rates} />
            </div>

            <div className="space-y-2">
                <ChangeIndicator value={stock.change1w} label="1 Week" />
                <ChangeIndicator value={stock.change1m} label="1 Month" />
                <ChangeIndicator value={stock.change3m} label="3 Months" />
                <ChangeIndicator value={stock.change6m} label="6 Months" />
                <ChangeIndicator value={stock.change1y} label="1 Year" />
            </div>
            
            <HistoricalPriceLookup stock={stock} currency={currency} rates={rates} />
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;