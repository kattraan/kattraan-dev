import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout, { DASHBOARD_ROLES } from '@/layouts/DashboardLayout';
import ScrollToTop from '@/components/common/ScrollToTop';
import AppLoader from '@/components/common/AppLoader';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ToastProvider } from '@/components/ui/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '@/features/auth/store/authSlice';
import { useEffect } from 'react';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import InstructorRoutes from '@/routes/InstructorRoutes';
import { LOADING } from '@/utils/constants';
import { ROUTES } from '@/config/routes';

// Lazy loading pages for better performance (Code Splitting)
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const InstructorSignUp = lazy(() => import('@/pages/auth/InstructorSignUpPage'));
const EnrollmentForm = lazy(() => import('@/pages/instructor/enrollment/EnrollmentPage'));
const WaitingForApproval = lazy(() => import('@/pages/auth/WaitingForApprovalPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const InstructorApprovalsPage = lazy(() => import('@/pages/admin/InstructorApprovalsPage'));
const CourseReviewPage = lazy(() => import('@/pages/admin/CourseReviewPage'));
const CourseReviewDetailPage = lazy(() => import('@/pages/admin/CourseReviewDetailPage'));
const CourseDetailsPage = lazy(() => import('@/pages/courses/CourseDetailsPage'));
const ViewCoursePage = lazy(() => import('@/pages/courses/ViewCoursePage'));
const CourseWatchPage = lazy(() => import('@/pages/courses/CourseWatchPage'));
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));

const Dashboard = lazy(() => import('@/pages/dashboard/LearnerDashboardPage'));
const CourseList = lazy(() => import('@/pages/courses/CourseListPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));

const LearnerMyCoursesPage = lazy(() => import('@/pages/dashboard/LearnerMyCoursesPage'));
const LearnerLiveClassesPage = lazy(() => import('@/pages/dashboard/LearnerLiveClassesPage'));
const LearnerAssignmentsPage = lazy(() => import('@/pages/dashboard/LearnerAssignmentsPage'));
const LearnerCertificatesPage = lazy(() => import('@/pages/dashboard/LearnerCertificatesPage'));
const MyAccountPage = lazy(() => import('@/pages/dashboard/MyAccountPage'));
const ViewProfilePage = lazy(() => import('@/pages/dashboard/ViewProfilePage'));
const PersonalDetailsPage = lazy(() => import('@/pages/dashboard/account/PersonalDetailsPage'));
const SocialAccountsPage = lazy(() => import('@/pages/dashboard/account/SocialAccountsPage'));
const PaymentDetailsPage = lazy(() => import('@/pages/dashboard/account/PaymentDetailsPage'));
const UpdateContactPage = lazy(() => import('@/pages/dashboard/account/UpdateContactPage'));
const SettingsPage = lazy(() => import('@/pages/instructor/SettingsPage')); // Reuse Instructor settings for UI consistency


/**
 * Route Configuration
 * Supports public routes, auth routes, and protected routes.
 */
function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show the full app immediately (optimistic render).
  // ProtectedRoute handles auth-guarded redirects; the skeleton below covers
  // the brief moment before checkAuth resolves inside those routes.

  return (
      <CurrencyProvider>
      <CartProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <Router>
            <ThemeProvider>
            <ScrollToTop />
          <Suspense fallback={<AppLoader message={LOADING.ROUTE} />}>
            <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<MainLayout><LandingPage /></MainLayout>} />
            <Route path={ROUTES.CATEGORIES} element={<MainLayout><CategoriesPage /></MainLayout>} />
            <Route path={`${ROUTES.COURSE_DETAILS}/:courseId`} element={<MainLayout><CourseDetailsPage /></MainLayout>} />
            
            {/* Auth Routes */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.INSTRUCTOR_SIGNUP} element={<InstructorSignUp />} />

            <Route element={<ProtectedRoute />}>
               <Route path={ROUTES.INSTRUCTOR_ENROLLMENT} element={<EnrollmentForm />} />
               <Route path={ROUTES.WAITING_APPROVAL} element={<WaitingForApproval />} />
            </Route>

            {/* Protected Routes (Authenticated Users) - Learner Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']} />}>
              <Route element={<DashboardLayout role={DASHBOARD_ROLES.LEARNER} />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.DASHBOARD_MY_COURSES} element={<LearnerMyCoursesPage />} />
                <Route path={ROUTES.DASHBOARD_CLASSES} element={<LearnerLiveClassesPage />} />
                <Route path={ROUTES.DASHBOARD_ASSIGNMENTS} element={<LearnerAssignmentsPage />} />
                <Route path={ROUTES.DASHBOARD_CERTIFICATES} element={<LearnerCertificatesPage />} />
                <Route path={ROUTES.DASHBOARD_PROFILE} element={<ViewProfilePage />} />
                <Route path={ROUTES.DASHBOARD_MY_ACCOUNT} element={<MyAccountPage />} />
                <Route path={ROUTES.DASHBOARD_PERSONAL_DETAILS} element={<PersonalDetailsPage />} />
                <Route path={ROUTES.DASHBOARD_SOCIAL_ACCOUNTS} element={<SocialAccountsPage />} />
                <Route path={ROUTES.DASHBOARD_PAYMENT_DETAILS} element={<PaymentDetailsPage />} />
                <Route path={ROUTES.DASHBOARD_UPDATE_CONTACT} element={<UpdateContactPage />} />
                <Route path={ROUTES.DASHBOARD_SETTINGS} element={<SettingsPage />} />
              </Route>
              <Route path={ROUTES.LEARNER_DASHBOARD} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.COURSES} element={<MainLayout><CourseList /></MainLayout>} />
              <Route path={ROUTES.CART} element={<MainLayout><CartPage /></MainLayout>} />
            </Route>

            {/* Instructor Domain - Nested Route Module */}
            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route path={`${ROUTES.INSTRUCTOR_DASHBOARD}/*`} element={<InstructorRoutes />} />
            </Route>

            {/* Course view & watch: learners (enrolled), instructors, and admins */}
            <Route element={<ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']} />}>
              <Route path={`${ROUTES.VIEW_COURSE}/:courseId/watch`} element={<CourseWatchPage />} />
              <Route path={`${ROUTES.VIEW_COURSE}/:courseId`} element={<ViewCoursePage />} />
              <Route path={`${ROUTES.CHECKOUT}/:courseId`} element={<CheckoutPage />} />
            </Route>

            {/* Admin Domain */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout role={DASHBOARD_ROLES.ADMIN} />}>
                <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
                <Route path={ROUTES.ADMIN_INSTRUCTORS} element={<InstructorApprovalsPage />} />
                <Route path={`${ROUTES.ADMIN_COURSE_REVIEW}/:courseId`} element={<CourseReviewDetailPage />} />
                <Route path={ROUTES.ADMIN_COURSES} element={<CourseReviewPage />} />
                <Route path={ROUTES.ADMIN_SETTINGS} element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
            </ThemeProvider>
          </Router>
        </ConfirmDialogProvider>
      </ToastProvider>
      </CartProvider>
      </CurrencyProvider>
  );
}

export default App;
