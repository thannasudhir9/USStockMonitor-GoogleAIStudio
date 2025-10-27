import { Currency, ConversionRates } from '../types';

export const formatCurrency = (
    priceInUsd: number,
    currency: Currency,
    rates: ConversionRates | null
): string => {
    if (rates === null) {
        return '...';
    }

    const convertedPrice = priceInUsd * (rates[currency] || 1);
    
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    
    return formatter.format(convertedPrice);
};
