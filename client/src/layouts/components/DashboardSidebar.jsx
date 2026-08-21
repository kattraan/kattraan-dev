import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import BrandLogo from "@/components/common/BrandLogo";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Video,
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

const ICON_MAP = {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Video,
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
  MessageCircle,
};

/**
 * Config-driven sidebar for DashboardLayout.
 * Renders nav from dashboardConfig; supports default (light/dark) and dark-only variant.
 */
const DashboardSidebar = ({
  navItems = [],
  sidebarVariant = "default",
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  const isDarkOnly = sidebarVariant === "dark";
  const showExpanded = !isCollapsed || isHoverExpanded || isMobileOpen;

  const asideBase =
    "transition-all duration-300 flex flex-col z-50 font-satoshi fixed inset-y-0 left-0 h-[100dvh] overflow-hidden";
  const asideWidth = showExpanded ? "w-72" : "lg:w-20 w-72";
  const mobileTransform = isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0";
  const asideTheme = isDarkOnly
    ? "bg-[#06070d]/95 backdrop-blur-3xl border-r border-white/10 shadow-[8px_0_28px_rgba(0,0,0,0.55)]"
    : "bg-white/60 dark:bg-[#0a0b12]/92 backdrop-blur-3xl border-r border-gray-200 dark:border-white/10 shadow-none dark:shadow-[8px_0_28px_rgba(0,0,0,0.45)]";

  const logoBorder = isDarkOnly
    ? "border-white/5"
    : "border-gray-200 dark:border-white/5";
  const collapseBtn = isDarkOnly
    ? "p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
    : "p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all";

  const linkActive = "sidebar-link-active text-white";
  const linkInactive = isDarkOnly
    ? "text-white/40 hover:text-white"
    : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white";

  return (
    <>
      <div
        className={`hidden lg:block flex-shrink-0 transition-[width] duration-300 ${showExpanded ? "w-72" : "w-20"}`}
        aria-hidden="true"
      />
      <aside
        onMouseEnter={() => setIsHoverExpanded(true)}
        onMouseLeave={() => setIsHoverExpanded(false)}
        className={`${asideWidth} ${asideTheme} ${asideBase} ${mobileTransform}`}
      >
        <div
          className={`h-[72px] flex items-center border-b ${logoBorder} ${showExpanded ? "px-6 justify-between" : "px-3 justify-center"}`}
        >
          {showExpanded ? (
            <BrandLogo />
          ) : (
            <Link to={ROUTES.HOME} className="lg:hidden">
              <img src={logo} alt="Kattraan Logo" className="h-8 w-auto" loading="lazy" />
            </Link>
          )}
          {showExpanded ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Clear hover-expand first: sidebar often looks open only from hover
                // while isCollapsed is still true; toggling would pin it open instead.
                setIsHoverExpanded(false);
                setIsCollapsed(true);
              }}
              className={`${collapseBtn} hidden lg:block`}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="hidden lg:flex items-center justify-center bg-transparent p-0"
              aria-label="Expand sidebar"
            >
              <img
                src={logo}
                alt="Kattraan Logo"
                className="h-8 w-8 object-contain hover:scale-105 transition-transform duration-300"
              />
            </button>
          )}
        </div>

        <nav className="flex-grow py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact ?? false}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `sidebar-nav-link flex items-center rounded-xl group select-none ${
                    showExpanded ? "gap-4 px-4" : "justify-center px-2"
                  } py-3.5 ${isActive ? linkActive : linkInactive}`
                }
              >
                {({ isActive }) => (
                  <>
                    {Icon && (
                      <Icon
                        size={20}
                        className={`flex-shrink-0 ${isActive ? "text-white" : ""}`}
                      />
                    )}
                    {showExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
