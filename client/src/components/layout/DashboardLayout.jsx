import React from "react";

/**
 * Standardized dashboard page wrapper.
 * Renders a page-style title row + children directly in the document flow so
 * the entire page scrolls (no inner overflow card). Padding is provided by the
 * route layout (dashboardConfig.contentPadding).
 */
const DashboardLayout = ({ title, subtitle, headerRight, children }) => {
  return (
    <div className="w-full">
      {/* Page title row – sticky inside the white scroll container */}
      {(title || subtitle || headerRight) && (
        <div className="sticky top-0 z-20 -mx-5 md:-mx-6 px-5 md:px-6 py-2.5 mb-2 bg-white dark:bg-black border-b border-gray-100 dark:border-white/[0.05] transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">
                  {subtitle}
                </p>
              )}
            </div>
            {headerRight && <div className="shrink-0 flex items-center gap-3">{headerRight}</div>}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default DashboardLayout;
