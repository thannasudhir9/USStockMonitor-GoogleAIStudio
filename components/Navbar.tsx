import React from 'react';
import { Page } from '../types';

interface NavbarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string }[] = [
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'features', label: 'Features' },
    { page: 'contact', label: 'Contact & About' },
];

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
    return (
        <nav className="flex items-center gap-2 sm:gap-4 p-1 rounded-full bg-gray-200 dark:bg-gray-800">
            {navItems.map(item => {
                const isActive = currentPage === item.page;
                return (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                            isActive
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
};

export default Navbar;
