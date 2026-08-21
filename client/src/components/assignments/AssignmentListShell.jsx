import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

/**
 * Shared Assignments page chrome: optional learn-more, tabs, search, sectioned list.
 */
const AssignmentListShell = ({
  tabs = [],
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search',
  searchInputId = 'assignment-search',
  description,
  learnMoreTo,
  learnMoreLabel = 'Learn more',
  empty,
  children,
  headerExtra,
}) => {
  return (
    <div className="space-y-6 font-satoshi">
      {(description || learnMoreTo) && (
        <p className="text-sm text-gray-500 dark:text-white/45">
          {description}
          {description && learnMoreTo ? ' ' : null}
          {learnMoreTo && (
            <Link to={learnMoreTo} className="text-primary-pink font-semibold hover:underline">
              {learnMoreLabel}
            </Link>
          )}
        </p>
      )}

      {(tabs.length > 0 || headerExtra) && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          {tabs.length > 0 ? (
            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/10">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={clsx(
                      'relative pb-3 text-sm font-semibold transition-colors duration-200',
                      isActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70',
                    )}
                  >
                    {tab.label}
                    {typeof tab.count === 'number' && (
                      <span className="ml-1.5 text-xs font-medium text-gray-400 dark:text-white/35">
                        ({tab.count})
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-gradient-start to-gradient-end" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div />
          )}
          {headerExtra}
        </div>
      )}

      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 pointer-events-none"
          size={18}
        />
        <input
          id={searchInputId}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] pl-11 pr-12 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 focus:ring-2 focus:ring-primary-pink/20 transition-all duration-300"
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[11px] font-semibold text-gray-400 dark:text-white/35">
          /
        </kbd>
      </div>

      {empty ? empty : children}
    </div>
  );
};

/**
 * Timeline section with gray label + stacked cards.
 */
export const AssignmentSection = ({ label, children }) => (
  <section className="space-y-3">
    <h2 className="text-sm font-bold text-gray-500 dark:text-white/45">{label}</h2>
    <div className="space-y-2.5">{children}</div>
  </section>
);

export default AssignmentListShell;
