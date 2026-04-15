/**
 * Centralized route path constants.
 * Use these instead of string literals for navigation and route definitions.
 */
export const ROUTES = {
  HOME: "/",
  COURSES: "/courses",
  CATEGORIES: "/categories",
  COURSE_DETAILS: "/course-details",
  HELP: "/help",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  INSTRUCTOR_SIGNUP: "/instructor-signup",
  INSTRUCTOR_ENROLLMENT: "/instructor-enrollment",
  WAITING_APPROVAL: "/waiting-approval",

  // Learner dashboard
  DASHBOARD: "/dashboard",
  DASHBOARD_MY_COURSES: "/dashboard/my-courses",
  DASHBOARD_CLASSES: "/dashboard/classes",
  DASHBOARD_ASSIGNMENTS: "/dashboard/assignments",
  DASHBOARD_CERTIFICATES: "/dashboard/certificates",
  DASHBOARD_PROFILE: "/dashboard/profile",
  DASHBOARD_MY_ACCOUNT: "/dashboard/my-account",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_PERSONAL_DETAILS: "/dashboard/my-account/personal-details",
  DASHBOARD_SOCIAL_ACCOUNTS: "/dashboard/my-account/social-accounts",
  DASHBOARD_PAYMENT_DETAILS: "/dashboard/my-account/payment-details",
  DASHBOARD_UPDATE_CONTACT: "/dashboard/my-account/update-contact",
  LEARNER_DASHBOARD: "/learner-dashboard", // redirects to DASHBOARD

  // Instructor dashboard
  INSTRUCTOR_DASHBOARD: "/instructor-dashboard",
  INSTRUCTOR_MY_COURSES: "/instructor-dashboard/my-courses",
  INSTRUCTOR_CREATE_COURSE: "/instructor-dashboard/create-course",
  INSTRUCTOR_LEARNERS: "/instructor-dashboard/learners",
  INSTRUCTOR_ANALYTICS: "/instructor-dashboard/analytics",
  INSTRUCTOR_SETTINGS: "/instructor-dashboard/settings",

  // Admin dashboard
  ADMIN_DASHBOARD: "/admin-dashboard",
  ADMIN_INSTRUCTORS: "/admin-dashboard/instructors",
  ADMIN_COURSES: "/admin-dashboard/courses",
  ADMIN_COURSE_REVIEW: "/admin-dashboard/courses/review",
  ADMIN_USERS: "/admin-dashboard/users",

  // Cart & Checkout
  CART: "/cart",
  CHECKOUT: "/checkout", // /checkout/:courseId

  // Shared course view (instructor + admin): standalone page, no dashboard
  VIEW_COURSE: "/view-course", // /view-course/:courseId
  VIEW_COURSE_WATCH: "/view-course", // /view-course/:courseId/watch
  ADMIN_SETTINGS: "/admin-dashboard/settings",
};

export default ROUTES;
