import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={(e) => {
                e.preventDefault(); // In case it's inside a link or form
                toggleTheme();
            }}
            className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 hover:bg-black/10 dark:hover:bg-white/10 ${className}`}
            aria-label="Toggle Dark Mode"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className="relative w-5 h-5 overflow-hidden flex items-center justify-center text-gray-800 dark:text-gray-200">
                {/* Sun icon scaling in/out */}
                <Sun 
                    className={`absolute inset-0 w-full h-full text-yellow-500 transition-all duration-500 transform ${
                        theme === 'light' 
                            ? 'opacity-100 rotate-0 scale-100' 
                            : 'opacity-0 -rotate-90 scale-50'
                    }`} 
                />
                
                {/* Moon icon scaling in/out */}
                <Moon 
                    className={`absolute inset-0 w-full h-full text-blue-300 transition-all duration-500 transform ${
                        theme === 'dark' 
                            ? 'opacity-100 rotate-0 scale-100' 
                            : 'opacity-0 rotate-90 scale-50'
                    }`} 
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
