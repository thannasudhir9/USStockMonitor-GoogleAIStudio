import React from 'react';
import { Currency } from '../types';

interface CurrencySelectorProps {
    currentCurrency: Currency;
    onCurrencyChange: (currency: Currency) => void;
}

const currencies: Currency[] = ['USD', 'EUR', 'INR'];
const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    INR: '₹'
};

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ currentCurrency, onCurrencyChange }) => {
    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
            {currencies.map(currency => {
                const isActive = currentCurrency === currency;
                return (
                    <button
                        key={currency}
                        onClick={() => onCurrencyChange(currency)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                            isActive
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        aria-pressed={isActive}
                    >
                        {currencySymbols[currency]}
                    </button>
                )
            })}
        </div>
    );
};

export default CurrencySelector;
