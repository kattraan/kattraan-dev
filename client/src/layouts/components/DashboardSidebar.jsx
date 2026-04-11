import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/store/authSlice";
import logo from "@/assets/logo.png";
import BrandLogo from "@/components/common/BrandLogo";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Video,
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
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
  LogOut,
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
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const isDarkOnly = sidebarVariant === "dark";

  const asideBase =
    "flex-shrink-0 transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen font-satoshi";
  const asideWidth = isCollapsed ? "w-20" : "w-72";
  const asideTheme = isDarkOnly
    ? "bg-[#06070d]/95 backdrop-blur-3xl border-r border-white/10 shadow-[8px_0_28px_rgba(0,0,0,0.55)]"
    : "bg-white/60 dark:bg-[#0a0b12]/92 backdrop-blur-3xl border-r border-gray-200 dark:border-white/10 shadow-none dark:shadow-[8px_0_28px_rgba(0,0,0,0.45)]";

  const logoBorder = isDarkOnly
    ? "border-white/5"
    : "border-gray-200 dark:border-white/5";
  const collapseBtn = isDarkOnly
    ? "p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
    : "p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all";

  const linkActive = "sidebar-link-active";
  const linkActiveText = "text-white";
  const linkInactive = isDarkOnly
    ? "text-white/40 hover:bg-white/5 hover:text-white"
    : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white/90 border border-transparent";

  return (
    <aside className={`${asideWidth} ${asideTheme} ${asideBase}`}>
      <div
        className={`h-[72px] flex items-center px-6 border-b ${logoBorder} ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isCollapsed ? (
          <BrandLogo />
        ) : (
          <Link to={ROUTES.HOME}>
            <img src={logo} alt="Logo" className="h-8 w-auto" loading="lazy" />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={collapseBtn}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-grow py-8 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact ?? false}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group border ${
                  isActive ? `${linkActive} ${linkActiveText}` : linkInactive
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {Icon && (
                    <Icon
                      size={20}
                      className={`${isCollapsed ? "mx-auto" : ""} ${isActive ? "text-white" : "group-hover:text-primary-pink"} transition-colors duration-300`}
                    />
                  )}
                  {!isCollapsed && (
                    <span className="text-sm font-semibold">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div
        className={`p-4 border-t ${logoBorder} transition-colors duration-300`}
      >
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} className={isCollapsed ? "mx-auto" : ""} />
          {!isCollapsed && (
            <span className="text-[15px] font-bold">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
