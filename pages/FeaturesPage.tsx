import React from 'react';

const FeatureCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-start space-x-4">
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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Application Features
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          Discover the powerful tools at your disposal to monitor and analyze high-growth US stocks.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard title="Up-to-Date Stock Data" description="Get the latest available data on the top 50 high-growth US stocks with a single click of the 'Refresh' button.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 10.5M20 20l-1.5-1.5A9 9 0 002.5 13.5"/></svg>
          </FeatureCard>
          <FeatureCard title="Momentum Score" description="A unique 0-100 score indicating each stock's current performance trend, calculated from a weighted average of its recent growth.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </FeatureCard>
          <FeatureCard title="Volatility Indicator" description="Quickly assess risk with a clear 'Low', 'Medium', or 'High' volatility label, based on the stock's recent price fluctuations.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </FeatureCard>
          <FeatureCard title="Interactive Sorting" description="Click on any column header—Stock, Price, or any percentage change—to sort the entire table and find top performers instantly.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9M3 12h9m-9 4h13m0-4l3 3m0 0l3-3m-3 3v-6"/></svg>
          </FeatureCard>
          <FeatureCard title="Instant Search & Filter" description="Use the search bar to immediately filter the list by company name or stock symbol, narrowing down to the stocks you care about.">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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
