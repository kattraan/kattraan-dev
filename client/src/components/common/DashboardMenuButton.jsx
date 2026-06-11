import React from 'react';
import { Menu } from 'lucide-react';
import { useDashboardLayout } from '@/layouts/DashboardLayoutContext';

const DashboardMenuButton = () => {
  const { openMobileSidebar } = useDashboardLayout();

  return (
    <button
      type="button"
      onClick={openMobileSidebar}
      className="lg:hidden flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
      aria-label="Open navigation menu"
    >
      <Menu size={20} />
    </button>
  );
};

export default DashboardMenuButton;
