import { ProcessedStockData } from '../types';

function escapeCsvCell(cell: string | number): string {
    const cellString = String(cell);
    // If the cell contains a comma, double quote, or newline, wrap it in double quotes
    if (/[",\n]/.test(cellString)) {
        // Also, double up any existing double quotes
        return `"${cellString.replace(/"/g, '""')}"`;
    }
    return cellString;
}

export function exportToCsv(stocks: ProcessedStockData[], filename: string): void {
    if (!stocks || stocks.length === 0) {
        console.warn("No data to export.");
        return;
    }

    const headers = [
        'Symbol', 'Name', 'Price (USD)', 'Last Trade Date',
        '1W %', '1M %', '3M %', '6M %', '1Y %',
        'Momentum Score', 'Volatility'
    ];

    const rows = stocks.map(stock => [
        stock.symbol,
        stock.name,
        stock.price,
        stock.lastTradeDate || 'N/A',
        stock.change1w,
        stock.change1m,
        stock.change3m,
        stock.change6m,
        stock.change1y,
        stock.momentumScore,
        stock.volatilityLabel,
    ].map(escapeCsvCell));

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}