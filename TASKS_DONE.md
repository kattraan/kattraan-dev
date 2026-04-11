# Tasks Done

- **Dashboard layouts:** Fixed navbar/sidebar; only main content scrolls (Instructor, Learner, Admin, Student).

- **Backend validation:** Added express-validator on all POST/PUT routes with per-domain validation files and validateRequest middleware (course, section, chapter, content, quiz, comment, review, user, auth, media, common).

- **Auth validations:** Validated login, register, forgot/reset password, enrollment, admin-approve, and Google one-tap.

- **Media validation:** Asset delete route validates `key` param (validateDeleteKey).

- **CORS:** Production requires CLIENT_URL; app throws at startup if missing or localhost.

- **Course ownership:** Middleware so instructors can only create/edit/delete their own courses, sections, chapters, and content (used on all course-routes).

- **Error responses:** Sanitized global error handler; no stack or sensitive info in API responses.

- **Frontend API errors:** Centralized toast messages from API errors (getApiErrorForToast, attachApiMessage in apiClient).

- **Replaced alert() with toast** in QuizModal, useQuizBuilder, MyCoursesFeature, and AssignmentResponsesTab.

- **Replaced window.confirm with ConfirmDialog** for delete course in MyCoursesFeature.

- **Removed commented-out code** in CurriculumTab and editor/nav files.

- **Memoized list items:** CurriculumContentTypeCard and new CurriculumContentItem with React.memo; used in CurriculumTab.

- **Lazy-loaded editor tabs:** All course-editor tabs (Curriculum, Information, Drip, Report, Comments, QnA, Assignment Responses, Reviews, ChatBot Analytics) load on demand with Suspense.

- **Image lazy loading:** Added loading="lazy" on images across app (editor, course cards, auth, sidebars, landing page including HeroSection, PathSelector, CourseSection, BlogSection, TrendingCourses, CTACarousel).

- **Docs:** Frontend senior architect audit (FRONTEND_SENIOR_ARCHITECT_AUDIT.md) and FormField reference component for a11y (FormField.reference.jsx).

---

### 2026-03-01 (UI consistency, dashboards, course editor)

- **Shared ContentCard:** Added `ContentCard` component (title, subtitle, headerRight, headerBorder, variant); used on all dashboard pages via `DashboardLayout` and on all course-editor tabs (Information, Curriculum, Drip, Report, Comments, Q&A, Reviews, Submissions, ChatBot Analytics). Exported from `@/components/ui`. Audit checklist in `docs/CONTENT_CARD_CHECKLIST.md`.

- **JoinAsLearnerView:** Wrapped in `DashboardLayout` (ContentCard) so instructor-on-learner-dashboard view matches other dashboard pages.

- **QnATab:** Fixed missing opening `ContentCard` so Q&A tab shows the shared content card like other tabs.

- **Dashboard content padding:** Centralized in `dashboardConfig` (`DASHBOARD_CONTENT_PADDING`); content `DashboardLayout` no longer adds its own padding. Reduced gap from sidebar: `px-8` → `px-5` for content and for all three headers (Instructor, Learner, Admin).

- **Navbar not shrinking:** In route `DashboardLayout`, wrapped header in `flex-shrink-0` div so top navbar keeps full width on all pages (fixed My Courses / learner pages). Main has `min-w-0` so only content area scrolls.

- **Sidebar not shrinking:** Added `flex-shrink-0` to `DashboardSidebar` so sidebar width stays fixed (e.g. learner dashboard when switching between Dashboard, My Courses, etc.).

- **Edit course in separate page:** Create-course and edit-course routes moved back outside `DashboardLayout` so they open full-screen (no sidebar). `CourseEditor` uses `h-screen` again.

- **ContentCard header:** Min-height and `sm:items-center` on header row so page card header (e.g. My Courses with Create Course button) matches Overview and doesn’t look uneven.

- **My Courses course cards:** Reduced card size: more columns (`xl:grid-cols-4`), smaller gap (`gap-4`), shorter thumb (`aspect-[16/10]`), less padding and smaller text/badges/buttons, `rounded-xl`.

_Updated: 2026-03-01_

---

### Git push (if push didn’t work)

- **Upstream set:** `dev` tracks `origin/dev`, so you can run `git push` from the repo root.
- **If push asks for a password:** GitHub no longer accepts account passwords over HTTPS. Use a [Personal Access Token (PAT)](https://github.com/settings/tokens) as the password, or switch to SSH and use SSH keys.
- **If you see “rejected (non-fast-forward)”:** Someone else pushed to `dev`. Run:  
  `git pull --rebase origin dev`  
  then  
  `git push origin dev`
