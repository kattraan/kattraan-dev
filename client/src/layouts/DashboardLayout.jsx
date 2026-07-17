import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayoutContext } from "@/layouts/DashboardLayoutContext";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardConfig, DASHBOARD_ROLES } from "@/config/dashboardConfig";
import { ROUTES } from "@/config/routes";
import DashboardSidebar from "@/layouts/components/DashboardSidebar";
import InstructorHeader from "@/features/instructor/components/InstructorHeader";
import LearnerHeader from "@/features/learner/components/LearnerHeader";
import AdminHeader from "@/features/admin/components/AdminHeader";
import heroBackground from "@/assets/hero-background.webp";

/**
 * Single reusable dashboard layout for all roles.
 * Config-driven sidebar; role-specific header preserved for business logic (e.g. role switcher).
 * Use: <Route element={<DashboardLayout role="learner" />}> ... nested routes with <Outlet />
 */
const DashboardLayout = ({ role = DASHBOARD_ROLES.LEARNER }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const openMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);

  const config = getDashboardConfig(role);

  // Instructor-only: redirect when status is pending
  useEffect(() => {
    if (role !== DASHBOARD_ROLES.INSTRUCTOR || !user) return;
    if (user.status === "pending_enrollment") {
      navigate(ROUTES.INSTRUCTOR_ENROLLMENT);
    } else if (user.status === "pending_approval") {
      navigate(ROUTES.WAITING_APPROVAL);
    } else if (user.status === "rejected") {
      navigate(ROUTES.WAITING_APPROVAL, { state: { rejected: true } });
    }
  }, [role, user, navigate]);

  const renderHeader = () => {
    if (role === DASHBOARD_ROLES.ADMIN) return <AdminHeader />;
    if (role === DASHBOARD_ROLES.INSTRUCTOR) return <InstructorHeader />;
    return <LearnerHeader />;
  };

  return (
    <DashboardLayoutContext.Provider value={{ openMobileSidebar, closeMobileSidebar }}>
    <div className="min-h-[100dvh] h-[100dvh] bg-gray-100 dark:bg-black flex font-satoshi selection:bg-primary-pink/30 relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={heroBackground}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-[0.4] pointer-events-none transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-gray-50 dark:via-black/40 dark:to-black transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-pink/5 blur-[150px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-purple/5 blur-[150px] -z-10 rounded-full" />
      </div>

      {isMobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Close navigation menu"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar – drawer on mobile, sticky on desktop */}
      <DashboardSidebar
        navItems={config.navItems}
        sidebarVariant={config.sidebarVariant || "default"}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Right column */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10 min-w-0">
        {/* Fixed header */}
        <div className="flex-shrink-0 w-full min-w-0">{renderHeader()}</div>

        {/* Content area: margin on top / left / right, flush at bottom */}
        <div className="flex-1 min-h-0 px-3 sm:px-4 pt-3 sm:pt-4 pb-0 overflow-hidden">
          {/* White scrollable container – rounded top corners, open bottom */}
          <div className="h-full bg-white dark:bg-[#070709] rounded-t-2xl overflow-y-auto scrollbar-hide border border-b-0 border-gray-200 dark:border-white/[0.08] shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <div className={`${config.contentPadding}`}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayoutContext.Provider>
  );
};

export default DashboardLayout;
export { DASHBOARD_ROLES };
