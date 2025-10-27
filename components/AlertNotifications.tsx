import React, { useState, useEffect } from 'react';
import { ProcessedStockData, PriceAlert, Currency, ConversionRates } from '../types';
import { formatCurrency } from '../utils/currency';

interface TriggeredAlert {
    alert: PriceAlert;
    stock: ProcessedStockData;
}

interface AlertNotificationsProps {
    triggeredAlerts: TriggeredAlert[];
    onDismiss: (symbol: string) => void;
    currency: Currency;
    rates: ConversionRates | null;
}

const AlertNotification: React.FC<{
    alertData: TriggeredAlert;
    onDismiss: (symbol: string) => void;
    currency: Currency;
    rates: ConversionRates | null;
}> = ({ alertData, onDismiss, currency, rates }) => {
    const { alert, stock } = alertData;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            handleDismiss();
        }, 10000); // Auto-dismiss after 10 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(alert.symbol), 300); // Wait for animation
    };

    const message = `${stock.symbol} has crossed ${alert.condition} ${formatCurrency(alert.targetPrice, currency, rates)}. Current price: ${formatCurrency(stock.price, currency, rates)}.`;

    return (
        <div 
            role="alert"
            className={`w-full max-w-md bg-white dark:bg-gray-700 rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <span className="text-xl">🔔</span>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Price Alert Triggered!</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleDismiss}
                            className="inline-flex text-gray-400 bg-transparent rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AlertNotifications: React.FC<AlertNotificationsProps> = ({ triggeredAlerts, onDismiss, currency, rates }) => {
    if (triggeredAlerts.length === 0) {
        return null;
    }

    return (
        <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {triggeredAlerts.map(alertData => (
                    <AlertNotification
                        key={alertData.alert.symbol}
                        alertData={alertData}
                        onDismiss={onDismiss}
                        currency={currency}
                        rates={rates}
                    />
                ))}
            </div>
        </div>
    );
};

export default AlertNotifications;
