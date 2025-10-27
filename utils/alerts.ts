import { PriceAlert, ProcessedStockData } from '../types';

const ALERTS_STORAGE_KEY = 'stockAlerts';

export function getAlerts(): PriceAlert[] {
    try {
        const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
        return storedAlerts ? JSON.parse(storedAlerts) : [];
    } catch (error) {
        console.error("Failed to parse alerts from localStorage", error);
        return [];
    }
}

export function saveAlerts(alerts: PriceAlert[]): void {
    try {
        localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
        console.error("Failed to save alerts to localStorage", error);
    }
}

export function addOrUpdateAlert(alert: PriceAlert): void {
    const alerts = getAlerts();
    const existingIndex = alerts.findIndex(a => a.symbol === alert.symbol);
    if (existingIndex > -1) {
        alerts[existingIndex] = alert;
    } else {
        alerts.push(alert);
    }
    saveAlerts(alerts);
}

export function removeAlert(symbol: string): void {
    let alerts = getAlerts();
    alerts = alerts.filter(a => a.symbol !== symbol);
    saveAlerts(alerts);
}

export function checkAlerts(
    stocks: ProcessedStockData[],
    alerts: PriceAlert[]
): { triggered: { alert: PriceAlert; stock: ProcessedStockData }[]; remaining: PriceAlert[] } {
    const triggered: { alert: PriceAlert; stock: ProcessedStockData }[] = [];
    const remaining: PriceAlert[] = [];

    const stockPriceMap = new Map(stocks.map(stock => [stock.symbol, stock.price]));

    for (const alert of alerts) {
        const currentPrice = stockPriceMap.get(alert.symbol);

        if (currentPrice === undefined) {
            remaining.push(alert); // Keep alert if stock is not in the current list
            continue;
        }

        const conditionMet =
            (alert.condition === 'above' && currentPrice > alert.targetPrice) ||
            (alert.condition === 'below' && currentPrice < alert.targetPrice);

        if (conditionMet) {
            const stock = stocks.find(s => s.symbol === alert.symbol)!;
            triggered.push({ alert, stock });
        } else {
            remaining.push(alert);
        }
    }

    return { triggered, remaining };
}
