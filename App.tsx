import React, { useState, useEffect } from 'react';
import DashboardPage from './pages/DashboardPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import ThemeToggle from './components/ThemeToggle';
import Navbar from './components/Navbar';
import { Page, Currency } from './types';
import CurrencySelector from './components/CurrencySelector';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    const savedCurrency = localStorage.getItem('currency');
    return (savedCurrency as Currency) || 'USD';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const renderContent = () => {
    switch (currentPage) {
        case 'dashboard':
            return <DashboardPage currency={currency} />;
        case 'features':
            return <FeaturesPage />;
        case 'contact':
            return <ContactPage />;
        default:
            return <DashboardPage currency={currency} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main className="max-w-7xl mx-auto">
        <header className="relative mb-8 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
          <div className="text-center md:text-left">
             <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              US Stocks Monitor
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
            <CurrencySelector currentCurrency={currency} onCurrencyChange={setCurrency} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>
        
        {renderContent()}

        <footer className="text-center mt-12 text-gray-500 dark:text-gray-500 text-sm no-print">
            <p>Data provided by Gemini. This is not financial advice. Information may not be real-time.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;