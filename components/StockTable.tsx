import React from 'react';
import { ProcessedStockData, SortableKey, Currency, ConversionRates } from '../types';
import { formatCurrency } from '../utils/currency';

interface StockTableProps {
  stocks: ProcessedStockData[];
  onSort: (key: SortableKey) => void;
  sortConfig: { key: SortableKey; direction: 'asc' | 'dsc' };
  onRowClick: (stock: ProcessedStockData) => void;
  currency: Currency;
  rates: ConversionRates | null;
  comparisonList: string[];
  onToggleCompare: (symbol: string) => void;
  onToggleAllCompare: () => void;
}

const ChangeIndicator: React.FC<{ value: number }> = ({ value }) => {
  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <span className={`flex items-center justify-end font-mono ${colorClass}`}>
      {arrow} {Math.abs(value).toFixed(2)}%
    </span>
  );
};

const MomentumMeter: React.FC<{ score: number }> = ({ score }) => {
    let bgColor = 'bg-green-500';
    if (score < 40) bgColor = 'bg-red-500';
    else if (score < 70) bgColor = 'bg-yellow-500';

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-5 relative overflow-hidden flex items-center justify-end pr-2">
            <div
                className={`h-full rounded-full ${bgColor} transition-all duration-500`}
                style={{ width: `${score}%` }}
            ></div>
            <span className="absolute text-white text-xs font-bold mix-blend-difference">
                {score.toFixed(0)}
            </span>
        </div>
    );
};

const VolatilityBadge: React.FC<{ label: 'Low' | 'Medium' | 'High' }> = ({ label }) => {
    const styles = {
        Low: 'bg-green-500/20 text-green-700 dark:text-green-300',
        Medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
        High: 'bg-red-500/20 text-red-700 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[label]}`}>
            {label}
        </span>
    );
};

const HeaderWithTooltip: React.FC<{ title: string, tooltip: string }> = ({ title, tooltip }) => (
    <th scope="col" className="group relative py-3 px-4 text-right">
        <div className="flex items-center justify-end">
            {title}
            <span className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 -translate-x-1/2 left-1/2">
                {tooltip}
            </span>
        </div>
    </th>
);

const SortableHeader: React.FC<{
    title: string;
    align?: 'left' | 'right' | 'center';
    sortKey: SortableKey;
    onSort: (key: SortableKey) => void;
    sortConfig: { key: SortableKey; direction: 'asc' | 'dsc' };
}> = ({ title, align = 'right', sortKey, onSort, sortConfig }) => {
    const isSorted = sortConfig.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;

    const alignmentClass = align === 'left' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end';

    return (
        <th scope="col" className={`py-3 px-4 text-${align}`}>
            <button
                onClick={() => onSort(sortKey)}
                className={`flex items-center w-full font-inherit text-inherit ${alignmentClass} uppercase tracking-wider`}
            >
                {title}
                <span className={`ml-2 text-xs transition-opacity duration-200 ${isSorted ? 'opacity-100' : 'opacity-30'}`}>
                    {direction === 'asc' ? '▲' : '▼'}
                </span>
            </button>
        </th>
    );
};


const StockTable: React.FC<StockTableProps> = ({ stocks, onSort, sortConfig, onRowClick, currency, rates, comparisonList, onToggleCompare, onToggleAllCompare }) => {
  const headers = [
    { title: "#", align: 'left', key: 'initialRank' },
    { title: "Stock", align: 'left', key: 'symbol' },
    { title: `Price (${currency})`, align: 'right', key: 'price' },
    { title: "Last Updated", align: 'right' },
    { title: "1W %", align: 'right', key: 'change1w' },
    { title: "1M %", align: 'right', key: 'change1m' },
    { title: "3M %", align: 'right', key: 'change3m' },
    { title: "6M %", align: 'right', key: 'change6m' },
    { title: "1Y %", align: 'right', key: 'change1y' },
    { title: "Momentum", align: 'right', tooltip: "A 0-100 score based on weighted performance over multiple timeframes." },
    { title: "Volatility", align: 'right', tooltip: "A measure of the stock's price fluctuation. Higher means more risk." },
    { title: "Link", align: 'center' },
  ];
  
  const allSelected = stocks.length > 0 && comparisonList.length === stocks.length;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1200px] text-left">
        <thead className="border-b border-gray-200 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-4 text-center">
              <input 
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500"
                checked={allSelected}
                onChange={onToggleAllCompare}
                aria-label="Select all stocks"
              />
            </th>
            {headers.map((header) => {
              if (header.key) {
                return <SortableHeader
                    key={header.key}
                    title={header.title}
                    align={header.align as 'left' | 'right'}
                    sortKey={header.key as SortableKey}
                    onSort={onSort}
                    sortConfig={sortConfig}
                />
              }
              if (header.tooltip) {
                return <HeaderWithTooltip key={header.title} title={header.title} tooltip={header.tooltip} />
              }
              return (
                <th key={header.title} scope="col" className={`py-3 px-4 ${header.align === 'left' ? 'text-left' : header.align === 'center' ? 'text-center' : 'text-right'} uppercase tracking-wider`}>
                  {header.title}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {stocks.length > 0 ? (
            stocks.map((stock) => (
              <tr 
                key={stock.symbol} 
                className={`transition-colors duration-200 ${comparisonList.includes(stock.symbol) ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <td className="py-4 px-4 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500"
                    checked={comparisonList.includes(stock.symbol)}
                    onChange={() => onToggleCompare(stock.symbol)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${stock.name}`}
                  />
                </td>
                <td 
                  className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium cursor-pointer"
                  onClick={() => onRowClick(stock)}
                >
                    {stock.initialRank}
                </td>
                <td 
                  className="py-4 px-4 font-medium text-gray-900 dark:text-white cursor-pointer"
                  onClick={() => onRowClick(stock)}
                >
                  <div className="flex items-center">
                    <div>
                      <div className="text-base">{stock.symbol}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{stock.name}</div>
                    </div>
                    {stock.hasActiveAlert && <span className="ml-2 text-yellow-500" title="Price alert is active">🔔</span>}
                  </div>
                </td>
                <td 
                  className="py-4 px-4 text-right font-mono text-gray-900 dark:text-white cursor-pointer"
                  onClick={() => onRowClick(stock)}
                >
                  {formatCurrency(stock.price, currency, rates)}
                </td>
                <td 
                  className="py-4 px-4 text-right text-sm text-gray-500 dark:text-gray-400 font-mono cursor-pointer"
                  onClick={() => onRowClick(stock)}
                >
                  {stock.lastTradeDate || '-'}
                </td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><ChangeIndicator value={stock.change1w} /></td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><ChangeIndicator value={stock.change1m} /></td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><ChangeIndicator value={stock.change3m} /></td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><ChangeIndicator value={stock.change6m} /></td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><ChangeIndicator value={stock.change1y} /></td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><MomentumMeter score={stock.momentumScore} /></td>
                <td className="py-4 px-4 text-right cursor-pointer" onClick={() => onRowClick(stock)}><VolatilityBadge label={stock.volatilityLabel} /></td>
                <td className="py-4 px-4 text-center">
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(stock.name + ' stock')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Search for ${stock.name} on Google`}
                        className="inline-block text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length + 1} className="text-center py-12 text-gray-500 dark:text-gray-400">
                No stocks found for your filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;