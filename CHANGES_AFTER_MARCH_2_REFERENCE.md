# Kattraan – Changes After March 2, 2026 (Reference Document)

This document summarizes all work done **after March 2, 2026** for reference. It includes both **committed** changes (March 4) and **current uncommitted** changes in the working tree.

---

## 1. Committed Work (March 4, 2026)

**Commits:** `8fb4621`, `5b0c85c`  
**Message:** *feat: Assignment Responses, Comments, and Q&A tabs + course-view QnA/Comments*

### 1.1 Instructor – Course Editor Tabs

| Feature | Description |
|--------|-------------|
| **Assignment Responses tab** | View and grade assignment/quiz submissions; quiz auto-grading support. |
| **Comments tab** | List chapter comments; reply; mark as read/unread. |
| **Q&A tab** | List Q&A questions; reply and remove questions. |

### 1.2 Course View (Preview) – Tabs

| Tab | Description |
|-----|-------------|
| **Description** | Course/chapter description. |
| **Resources** | Course resources. |
| **QnA** | Ask questions, reply, delete. |
| **Comments** | Chapter comments with ask/reply/delete. |

### 1.3 Backend APIs Added/Updated

| Area | Details |
|------|---------|
| **Assignment submissions** | New controller `assignmentSubmissionsController.js`; APIs for submissions. |
| **Chapter comments** | New `chapterComment.controller.js`, routes `chapter-comments.routes.js`, validation `chapterComment.js`. |
| **Q&A** | New `qna.controller.js`, `qna.routes.js`, validation `qna.js`. |
| **Learner assignments** | `learnerAssignmentsController.js` and `learner-assignments-routes.js` for learner submission flows. |
| **Learner courses** | `learnerCoursesController.js` and learner-courses routes extended. |

### 1.4 New/Updated Models

- **AssignmentSubmission** – assignment/quiz submission records.
- **ChapterComment** – comments on chapters.
- **QnaQuestion** – Q&A questions and answers.
- **Course** – optional `duration`, `learners` fields for display.
- **LearnerCourses** – used for enrollment tracking.

### 1.5 Frontend Services

- **chapterCommentService.js** – chapter comment API calls.
- **qnaService.js** – Q&A API calls.
- **courseService.js** – extended for new course/course-view APIs.
- **learnerAssignmentsService.js** – learner assignment submission APIs.

### 1.6 UI / UX

- Replaced **alert()** with **toast** (e.g. QuizModal, useQuizBuilder, MyCoursesFeature, AssignmentResponsesTab).
- Replaced **window.confirm** with **ConfirmDialog** (e.g. delete course in MyCoursesFeature).
- **ContentCard** and dashboard layout fixes.
- **Lazy-loaded editor tabs** – Curriculum, Information, Drip, Report, Comments, QnA, Assignment Responses, Reviews, ChatBot Analytics load on demand with Suspense.
- **CurriculumContentItem** – memoized with `React.memo`; supports video upload state (uploading/processing/error) and retry.
- **LMSVideoPlayer** – updates for course watch experience.
- **CourseDetails**, **CourseSidebar** – layout and content updates for course details page.
- **CourseViewPreviewContentTabs** – Description, Resources, QnA, Comments tabs.
- **ResourceUploadModal** – new modal for uploading resources.
- **VideoUploadModal** – refinements.
- **useCourseEditor** and **useVideoUpload** – hooks for curriculum content and video upload.

### 1.7 Other

- **TASKS_DONE.md** – updated with completed tasks.
- **.gitignore** – updated (commit 5b0c85c).
- **client/dist/** – production build artifacts updated.

---

## 2. Uncommitted Work (Current Working Tree)

These changes are **not yet committed** and extend the course listing and editor behavior.

### 2.1 Public Course Listing – Enriched Data

| Layer | Change |
|-------|--------|
| **Server – course.controller.js** | `getPublic` now enriches each course with: **enrolled count** (from `LearnerCourses` aggregation) and **total duration** (from video content across sections/chapters). Returns `learners`, `durationMinutes`, `enrolledCount` per course. |
| **Server – Course model** | Added optional fields: `duration` (number, minutes), `learners` (number, enrolled count). |
| **Client – CourseCard.jsx** | Uses `durationMinutes`, `enrolledCount`/`learners` for display. New layout: thumbnail, category tag, title, description, **stats row** (sections count, duration, enrolled) with BookOpen/Clock/Users icons, “View details” CTA, price. Styling: gradient background, rounded card, hover scale. |
| **Client – CourseListPage.jsx** | Adjusted to work with enriched public API response. |
| **Client – learnerCoursesService.js** | New/updated helpers if needed for enrollment check or enrolled courses (e.g. `checkEnrollment`, `getMyEnrolledCourses`, `enrollInCourse`). |

### 2.2 Learner Courses API

| File | Change |
|------|--------|
| **learnerCoursesController.js** | Extended with logic that supports enrollment checks and possibly enrollment count or progress (e.g. for use by `getPublic` or learner dashboard). |
| **learner-courses-routes.js** | Route updates (e.g. new or modified endpoints for check/enroll/list). |

### 2.3 Course Details & Sidebar

| File | Change |
|------|--------|
| **CourseDetails.jsx** | Simplified or refactored (e.g. fewer redundant state/logic, use of enriched course data where applicable). |
| **CourseSidebar.jsx** | Extended (e.g. sidebar content, sections, or metadata using duration/enrolled or new APIs). |

### 2.4 Course Editor – Curriculum & Upload

| File | Change |
|------|--------|
| **CurriculumContentItem.jsx** | Small fixes (e.g. label “Edit Assignment” for quiz, or upload-state handling). |
| **CourseViewPreviewContentTabs.jsx** | Cleanup/simplification (e.g. removed ~40 lines of redundant or unused code). |
| **ResourceUploadModal.jsx** | Refactor/simplification (e.g. state handling, validation, or UI flow). |
| **useCourseEditor.js** | New or expanded logic (~65 lines added) for curriculum editing, content types, or integration with resources/video. |
| **useVideoUpload.js** | New or expanded logic (~32 lines) for video upload, progress, or processing state. |

---

## 3. File-Level Summary (Uncommitted)

| File | Summary |
|------|---------|
| `client/.../CourseCard.jsx` | Enriched card UI; stats (sections, duration, enrolled); new layout and styles. |
| `client/.../CourseDetails.jsx` | Simplified/refactored. |
| `client/.../CourseSidebar.jsx` | Extended sidebar content. |
| `client/.../CourseViewPreviewContentTabs.jsx` | Code cleanup. |
| `client/.../ResourceUploadModal.jsx` | Refactor. |
| `client/.../CurriculumContentItem.jsx` | Minor fixes. |
| `client/.../useCourseEditor.js` | New/expanded editor hook logic. |
| `client/.../useVideoUpload.js` | New/expanded video upload hook. |
| `client/.../learnerCoursesService.js` | New or updated learner course API helpers. |
| `client/.../CourseListPage.jsx` | Uses enriched public listing. |
| `server/.../course.controller.js` | `getPublic` enrichment (enrolled count + duration). |
| `server/.../learnerCoursesController.js` | Extended learner course endpoints/logic. |
| `server/models/Course.js` | `duration`, `learners` fields. |
| `server/.../learner-courses-routes.js` | Route changes. |

---

## 4. Quick Reference – Key APIs/Data After March 2

- **Public course list** – `GET /api/courses/public` (or equivalent) returns courses with `durationMinutes`, `enrolledCount`/`learners`.
- **Chapter comments** – New chapter-comment APIs (create, list, reply, read/unread).
- **Q&A** – New Q&A APIs (list, create, reply, delete).
- **Assignment submissions** – New submission and grading APIs for instructors and learners.

---

*Document generated for reference. “After 2nd date” = after March 2, 2026. Last updated to reflect git history and current uncommitted diff.*
