import { createContext, useContext } from 'react';

export const DashboardLayoutContext = createContext({
  openMobileSidebar: () => {},
  closeMobileSidebar: () => {},
});

export const useDashboardLayout = () => useContext(DashboardLayoutContext);
