import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import ThemeToggle from '@/components/ThemeToggle';
import { ROUTES } from '@/config/routes';

const BrandLogo = ({ className = "", showThemeToggle = true }) => {
  return (
    <div className={`flex items-center gap-3 flex-shrink-0 ${className}`}>
      <Link to={ROUTES.HOME} className="flex items-center group">
        <img
          src={logo}
          alt="Kattraan Logo"
          className="h-8 w-auto group-hover:scale-105 transition-transform duration-300"
        />
        <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white tracking-wide group-hover:text-gray-700 dark:group-hover:text-white/90 transition-colors duration-300">
          Kattraan
        </span>
      </Link>
      {showThemeToggle && <ThemeToggle />}
    </div>
  );
};

export default BrandLogo;
