import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import ThemeToggle from '@/components/ThemeToggle';
import { ROUTES } from '@/config/routes';

const BrandLogo = ({ className = "", showThemeToggle = true, variant = "auto" }) => {
  const textClass =
    variant === "light"
      ? "text-white group-hover:text-white/90"
      : variant === "dark"
        ? "text-gray-900 group-hover:text-gray-700 dark:text-white dark:group-hover:text-white/90"
        : "text-gray-900 group-hover:text-gray-700 dark:text-white dark:group-hover:text-white/90";

  return (
    <div className={`flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0 ${className}`}>
      <Link to={ROUTES.HOME} className="flex items-center group min-w-0">
        <img
          src={logo}
          alt="Kattraan Logo"
          className="h-7 sm:h-8 w-auto flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`ml-2 sm:ml-3 text-lg sm:text-xl font-bold tracking-wide transition-colors duration-300 truncate ${textClass}`}>
          Kattraan
        </span>
      </Link>
      {showThemeToggle && <ThemeToggle />}
    </div>
  );
};

export default BrandLogo;
