import React from 'react';

const ContactPage: React.FC = () => {
  const email = 'ethstk911@gmail.com';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          About US Stocks Monitor
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          This application is a specialized tool designed to help users track and analyze the top-performing stocks in the US market. By focusing on stocks that have demonstrated significant growth (over 50% in the last six months), we provide a curated dashboard with powerful analytics like Momentum Score and Volatility Indicators to offer deeper insights at a glance. Our goal is to present complex financial data in a clean, intuitive, and highly interactive interface.
        </p>

        <div className="border-t border-gray-200 dark:border-gray-700 my-10"></div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Contact Us
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Have questions, feedback, or suggestions? We'd love to hear from you. Your input helps us improve the application.
        </p>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Send an Email
        </a>
      </div>
    </div>
  );
};

export default ContactPage;
