import { NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";
import BrandLogo from "@/components/common/BrandLogo";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

const InstructorSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      path: ROUTES.INSTRUCTOR_DASHBOARD,
      exact: true,
    },
    { label: "My Courses", icon: BookOpen, path: ROUTES.INSTRUCTOR_MY_COURSES },
    { label: "Learners", icon: Users, path: ROUTES.INSTRUCTOR_LEARNERS },
    { label: "Analytics", icon: BarChart3, path: ROUTES.INSTRUCTOR_ANALYTICS },
    { label: "Settings", icon: Settings, path: ROUTES.INSTRUCTOR_SETTINGS },
  ];

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-72"} bg-white/60 dark:bg-[#0c091a]/60 backdrop-blur-3xl border-r border-gray-200 dark:border-white/5 transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen`}
    >
      {/* Logo Area */}
      <div
        className={`h-[72px] flex items-center px-6 border-b border-gray-200 dark:border-white/5 ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isCollapsed ? (
          <BrandLogo />
        ) : (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center bg-transparent p-0"
            aria-label="Expand sidebar"
          >
            <img src={logo} alt="Kattraan Logo" className="h-8 w-8 object-contain hover:scale-105 transition-transform duration-300" loading="lazy" />
          </button>
        )}
        {!isCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={18} />
        </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-8 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
                            sidebar-nav-link flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group select-none
                            ${
                              isActive
                                ? "sidebar-link-active text-white"
                                : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                            }
                        `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`${isCollapsed ? "mx-auto" : ""} ${isActive ? "text-white" : ""} transition-colors duration-300`}
                />
                {!isCollapsed && (
                  <span className="text-sm font-semibold">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
