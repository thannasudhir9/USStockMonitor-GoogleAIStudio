export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change1w: number;
  change1m: number;
  change3m: number;
  change6m: number;
  change1y: number;
  lastTradeDate?: string;
}

export interface ProcessedStockData extends StockData {
  initialRank: number;
  momentumScore: number;
  volatilityLabel: 'Low' | 'Medium' | 'High';
}

export type SortableKey = 'initialRank' | 'symbol' | 'price' | 'change1w' | 'change1m' | 'change3m' | 'change6m' | 'change1y';

export type Page = 'dashboard' | 'features' | 'contact';

export interface SummaryStats {
    marketSentiment: 'Positive' | 'Neutral' | 'Negative';
    topGainer: ProcessedStockData | null;
    avg6mGrowth: number;
}

export type Currency = 'USD' | 'EUR' | 'INR';

export interface ConversionRates {
    USD: 1;
    EUR: number;
    INR: number;
}

export type DataSource = 'Gemini' | 'Google Finance' | 'Yahoo Finance';