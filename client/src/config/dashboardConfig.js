/**
 * Dashboard layout configuration per role.
 * Used by DashboardLayout and DashboardSidebar for a single, config-driven layout.
 *
 * - title: Used for accessibility / branding context
 * - navItems: Sidebar navigation (label, path, exact for index routes, icon name matching Lucide)
 * - contentPadding: Tailwind padding class for main content area (shared so navbar/content inset is consistent)
 */
import { ROUTES } from "./routes";

/** Shared content area padding: matches header horizontal padding so navbar and content align. Reduced gap from sidebar. */
export const DASHBOARD_CONTENT_PADDING = "px-5 pt-0 pb-6";

export const DASHBOARD_ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  LEARNER: "learner",
};

const dashboardConfig = {
  [DASHBOARD_ROLES.ADMIN]: {
    title: "Admin",
    contentPadding: DASHBOARD_CONTENT_PADDING,
    sidebarVariant: "default",
    navItems: [
      {
        label: "Admin Panel",
        path: ROUTES.ADMIN_DASHBOARD,
        exact: true,
        icon: "LayoutDashboard",
      },
      {
        label: "Instructor Approvals",
        path: ROUTES.ADMIN_INSTRUCTORS,
        icon: "ShieldCheck",
      },
      {
        label: "Course Approvals",
        path: ROUTES.ADMIN_COURSES,
        icon: "BookOpen",
      },
      { label: "User Center", path: ROUTES.ADMIN_USERS, icon: "Users" },
      {
        label: "System Settings",
        path: ROUTES.ADMIN_SETTINGS,
        icon: "Settings",
      },
    ],
  },
  [DASHBOARD_ROLES.INSTRUCTOR]: {
    title: "Instructor",
    contentPadding: DASHBOARD_CONTENT_PADDING,
    sidebarVariant: "default",
    navItems: [
      {
        label: "Overview",
        path: ROUTES.INSTRUCTOR_DASHBOARD,
        exact: true,
        icon: "LayoutDashboard",
      },
      {
        label: "My Courses",
        path: ROUTES.INSTRUCTOR_MY_COURSES,
        icon: "BookOpen",
      },
      { label: "Learners", path: ROUTES.INSTRUCTOR_LEARNERS, icon: "Users" },
      {
        label: "Analytics",
        path: ROUTES.INSTRUCTOR_ANALYTICS,
        icon: "BarChart3",
      },
      { label: "Settings", path: ROUTES.INSTRUCTOR_SETTINGS, icon: "Settings" },
    ],
  },
  [DASHBOARD_ROLES.LEARNER]: {
    title: "Learner",
    contentPadding: DASHBOARD_CONTENT_PADDING,
    sidebarVariant: "default",
    navItems: [
      {
        label: "Dashboard",
        path: ROUTES.DASHBOARD,
        exact: true,
        icon: "LayoutDashboard",
      },
      {
        label: "My Courses",
        path: ROUTES.DASHBOARD_MY_COURSES,
        icon: "BookOpen",
      },
      { label: "Live Classes", path: ROUTES.DASHBOARD_CLASSES, icon: "Video" },
      {
        label: "Assignments",
        path: ROUTES.DASHBOARD_ASSIGNMENTS,
        icon: "FileText",
      },
      {
        label: "Certificates",
        path: ROUTES.DASHBOARD_CERTIFICATES,
        icon: "GraduationCap",
      },
      { label: "Profile", path: ROUTES.DASHBOARD_PROFILE, icon: "User" },
    ],
  },
};

/**
 * Get config for a role.
 */
export function getDashboardConfig(role) {
  return dashboardConfig[role] || dashboardConfig[DASHBOARD_ROLES.LEARNER];
}

export default dashboardConfig;
