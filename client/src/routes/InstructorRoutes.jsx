import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import DashboardLayout, { DASHBOARD_ROLES } from "@/layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Lazy loading sub-pages
const Dashboard = lazy(
  () => import("../pages/dashboard/InstructorDashboardPage"),
);
const MyCourses = lazy(
  () => import("../pages/instructor/courses/MyCoursesPage"),
);
const CreateCourse = lazy(
  () => import("../pages/instructor/courses/CourseEditorPage"),
);
const Learners = lazy(() => import("../pages/instructor/courses/LearnersPage"));
const Analytics = lazy(() => import("../pages/instructor/AnalyticsPage"));
const Settings = lazy(() => import("../pages/instructor/SettingsPage"));

/**
 * Specialized Routing Module for the Instructor Dashboard.
 * Dashboard pages use DashboardLayout (sidebar + navbar). Create/Edit course open in a separate full-screen page.
 */
const InstructorRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
        {/* Full-screen editor: separate page, no sidebar */}
        <Route
          path="create-course"
          element={
            <Suspense fallback={null}>
              <CreateCourse />
            </Suspense>
          }
        />
        <Route
          path="edit-course/:id"
          element={
            <Suspense fallback={null}>
              <CreateCourse />
            </Suspense>
          }
        />

        {/* Dashboard layout routes (sidebar + navbar) */}
        <Route element={<DashboardLayout role={DASHBOARD_ROLES.INSTRUCTOR} />}>
          <Route
            index
            element={
              <Suspense fallback={null}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="my-courses"
            element={
              <Suspense fallback={null}>
                <MyCourses />
              </Suspense>
            }
          />
          <Route
            path="learners"
            element={
              <Suspense fallback={null}>
                <Learners />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={null}>
                <Settings />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default InstructorRoutes;
