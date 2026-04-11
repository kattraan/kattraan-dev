# ContentCard Usage Checklist

This document tracks which pages use the shared **ContentCard** (via `DashboardLayout` from `@/components/layout/DashboardLayout` or direct `ContentCard` from `@/components/ui`) for a consistent, production-grade main content area.

---

## How content gets the card

- **Dashboard pages (instructor, learner, admin):** Use **`DashboardLayout`** (title, subtitle, optional headerRight). It wraps content in a single `ContentCard`.
- **Course editor tabs:** Use **`ContentCard`** directly with tab-specific title/subtitle (Information, Curriculum, Drip, Reports, Comments, Q&A, Reviews, Submissions, ChatBot Analytics).
- **Full-screen / standalone pages:** No card (e.g. Course Editor shell, View Course, Course Watch, auth pages, landing).

---

## Learner dashboard (under `/dashboard/*`)

| Route | Page component | Feature / content | ContentCard? |
|-------|----------------|-------------------|--------------|
| `/dashboard` | LearnerDashboardPage | LearnerDashboard | ✅ DashboardLayout |
| `/dashboard` (instructor viewing) | LearnerDashboardPage | JoinAsLearnerView | ✅ DashboardLayout (added) |
| `/dashboard/my-courses` | LearnerMyCoursesPage | LearnerMyCourses | ✅ DashboardLayout |
| `/dashboard/classes` | LearnerLiveClassesPage | LiveClassesFeature | ✅ DashboardLayout |
| `/dashboard/assignments` | LearnerAssignmentsPage | AssignmentsFeature | ✅ DashboardLayout |
| `/dashboard/certificates` | LearnerCertificatesPage | CertificatesFeature | ✅ DashboardLayout |
| `/dashboard/profile` | SettingsPage | SettingsPage | ✅ DashboardLayout |

---

## Instructor dashboard (under `/instructor-dashboard/*`)

| Route | Page component | Feature / content | ContentCard? |
|-------|----------------|-------------------|--------------|
| `/instructor-dashboard` | InstructorDashboardPage | InstructorDashboard | ✅ DashboardLayout |
| `/instructor-dashboard/my-courses` | MyCoursesPage | MyCoursesFeature | ✅ DashboardLayout |
| `/instructor-dashboard/learners` | LearnersPage | LearnersList | ✅ DashboardLayout |
| `/instructor-dashboard/analytics` | AnalyticsPage | AnalyticsOverview | ✅ DashboardLayout |
| `/instructor-dashboard/settings` | SettingsPage | SettingsPage | ✅ DashboardLayout |
| `/instructor-dashboard/create-course` | CourseEditorPage | CourseEditor | N/A – full-screen editor |
| `/instructor-dashboard/edit-course/:id` | CourseEditorPage | CourseEditor | Tabs use ContentCard (see below) |

---

## Instructor course editor tabs (inside edit-course)

| Tab | Component | ContentCard? |
|-----|-----------|--------------|
| Information | InformationTab | ✅ ContentCard "Course Details" |
| Curriculum | CurriculumTab | ✅ ContentCard "Course Content" |
| Drip | DripTab | ✅ ContentCard "Content schedule" |
| Reports | ReportTab | ✅ ContentCard "Analytics" |
| Comments | CommentsTab | ✅ ContentCard "Comments" |
| Q&A | QnATab | ✅ ContentCard "Q&A" |
| Reviews | ReviewsTab | ✅ ContentCard "Reviews" |
| Submissions | AssignmentResponsesTab | ✅ ContentCard "Assignment Responses" |
| AI assistant | ChatBotAnalyticsTab | ✅ ContentCard "ChatBot Analytics" |

---

## Admin dashboard (under `/admin-dashboard/*`)

| Route | Page component | Feature / content | ContentCard? |
|-------|----------------|-------------------|--------------|
| `/admin-dashboard` | AdminDashboardPage | AdminDashboard | ✅ DashboardLayout |
| `/admin-dashboard/instructors` | InstructorApprovalsPage | InstructorApprovals | ✅ DashboardLayout |
| `/admin-dashboard/courses` | CourseReviewPage | CourseReview | ✅ DashboardLayout |
| Course review detail (if routed) | CourseReviewDetailPage | CourseReviewDetail | ✅ DashboardLayout |

---

## Pages that intentionally do not use ContentCard

- **Public:** Landing, Categories, Course details, Course list, Login, Sign up, Forgot/Reset password, Instructor signup, Enrollment, Waiting for approval.
- **Standalone protected:** View Course (`/view-course/:courseId`), Course Watch (`/view-course/:courseId/watch`) – full-page course view.
- **Course editor shell:** Create/Edit course page – full-screen editor; card is used inside each tab, not at page level.

---

## Summary

- All **dashboard** pages (learner, instructor, admin) use **DashboardLayout** → one ContentCard per page.
- All **course editor tabs** use **ContentCard** with a clear title and subtitle.
- **JoinAsLearnerView** (instructor on learner dashboard) now uses **DashboardLayout** for consistency.
- No dashboard or editor content is missing the shared card.

Last updated: after adding ContentCard to JoinAsLearnerView and documenting full audit.
