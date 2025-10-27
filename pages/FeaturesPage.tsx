import React from 'react';

const FeatureCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-start space-x-4 transition-transform transform hover:scale-105">
    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
      {children}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const FeaturesPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Application Features
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Discover the powerful tools at your disposal to monitor, compare, and analyze high-growth US stocks.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <FeatureCard title="Stock Comparison Tool" description="Select multiple stocks with checkboxes and compare their performance side-by-side in a detailed modal with a multi-line chart and data table.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path></svg>
          </FeatureCard>

          <FeatureCard title="Customizable Data View" description="Tailor your dashboard by selecting the number of stocks to display (5 to 100) and choosing your preferred data source (Gemini, Google Finance, Yahoo Finance).">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l-1.414-1.414M6.05 6.05L4.636 4.636m12.728 0l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M12 18a6 6 0 100-12 6 6 0 000 12z"></path></svg>
          </FeatureCard>
          
          <FeatureCard title="Multi-Currency Support" description="Instantly switch between USD, EUR, and INR. All prices, charts, and historical data are converted in real-time using the latest exchange rates.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0 1v.01M4 4h16v16H4V4z"></path></svg>
          </FeatureCard>

          <FeatureCard title="Historical Price Lookup" description="In the stock detail modal, use the date selector to fetch and display the closing price of a stock on any specific past date.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </FeatureCard>

          <FeatureCard title="Export & Print" description="Download the current table view as a CSV file for offline analysis in Excel or Google Sheets, or print a clean, professional report directly to PDF.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </FeatureCard>
          
          <FeatureCard title="Detailed Stock Analysis" description="Click any stock row to open a detailed view with a 1-year performance chart, key metrics, and historical lookup functionality.">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </FeatureCard>
          
          <FeatureCard title="Momentum & Volatility" description="Gauge performance trends with the 0-100 Momentum Score and assess risk with the 'Low', 'Medium', or 'High' Volatility Indicator.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </FeatureCard>
          
          <FeatureCard title="Interactive Table" description="Instantly sort any column by clicking its header, or use the search bar to filter the entire list by company name or stock symbol.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9M3 12h9m-9 4h13m0-4l3 3m0 0l3-3m-3 3v-6"/></svg>
          </FeatureCard>
          
          <FeatureCard title="Light & Dark Modes" description="Switch between a light and dark theme for comfortable viewing in any lighting condition. Your preference is saved for your next visit.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </FeatureCard>
          
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
