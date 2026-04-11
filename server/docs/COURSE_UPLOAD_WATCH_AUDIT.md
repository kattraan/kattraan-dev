# Course Upload & Course Watch – Full Functionality Audit

**Scope:** Backend only (Node/Express). Covers course creation → curriculum (sections, chapters, content) → video upload (Bunny Stream) → learner watch (overview, chapter content, video playback, progress).

---

## 1. Flow Summary

### 1.1 Course upload / authoring

| Step | Endpoint | Auth | Ownership | Notes |
|------|----------|------|-----------|--------|
| Create course | `POST /api/courses` | instructor, admin | — | `createCourse` validation; status defaults to `draft`. |
| Update course | `PUT /api/courses/:id` | instructor, admin | `requireCourseOwner` | Status/approval fields stripped. |
| Submit for review | `PATCH /api/courses/:id/submit-for-review` | instructor, admin | `requireCourseOwner` | Validates title, description, price, ≥1 section, ≥1 chapter, ≥1 content. |
| Add section | `POST /api/sections` | instructor, admin | `requireCourseOwnerFromBody('course')` | Section linked to course. |
| Add chapter | `POST /api/chapters` | instructor, admin | `requireChapterSectionOwner('section')` + `requireCourseNotPendingReview` | Chapter linked to section. |
| Add video content (metadata) | `POST /api/videocontents` | instructor, admin | `requireContentChapterOwner('chapter')` | Body must include `bunnyVideoId` (schema required). |
| Upload video (Bunny Stream) | `POST /api/videocontents/upload-hls` | instructor, admin | `requireContentChapterOwner('chapter')` | Multer 1GB limit; create + upload to Bunny; save `bunnyVideoId`, `encodingStatus: 'processing'`. |
| Other content types | `POST /api/articlecontents`, quizcontents, etc. | instructor, admin | Same pattern | Content ownership via chapter → section → course. |

- Curriculum edits (sections, chapters, content) are blocked when `course.status === 'pending_approval'` via `requireCourseNotPendingReview`.
- Clone: `POST /api/courses/clone/:id` with `requireCourseOwner`; new course is draft.

### 1.2 Learner course watch

| Step | Endpoint | Auth | Enrollment / role | Notes |
|------|----------|------|-------------------|--------|
| Course overview (sidebar) | `GET /api/courses/:courseId/overview` | learner, instructor, admin | **Not checked** | Slim course + sections + chapters (no contents). |
| Chapter content | `GET /api/chapters/:chapterId/content` | learner, instructor, admin | **Checked** | `videoService.isEnrolledOrElevated`; instructor/admin bypass. `getChapterWithContent` strips `bunnyVideoId` from video contents. |
| Video play URL | `GET /api/videos/:videoId/play` | learner, instructor, admin | **Checked** | Same enrollment/elevated check; returns signed Bunny Stream or legacy URL. |
| Chapter play (first video) | `GET /api/chapters/:chapterId/play` | learner, instructor, admin | **Checked** | Same as above for first video in chapter. |
| Progress get | `GET /api/learner/course-progress/:courseId` | authenticated | **Enrolled only** | 403 if not enrolled. |
| Progress update | `PATCH /api/learner/course-progress` | authenticated | **Enrolled only** | Body: `courseId`, `chapterId`, `currentTime`, `duration`, `watchedPercentage`. Completion at ≥90% server-side. |

- Video playback: no raw URLs in API; signed URLs with 5‑min TTL (Bunny Stream) or legacy signed MP4.

---

## 2. Positives

- **Ownership & authorization**
  - Course/section/chapter/content ownership enforced via `courseOwnership` middlewares; instructors cannot modify each other’s courses.
  - Status flow (draft → pending_approval → published/rejected) with submit-for-review validation and blocked edits while pending.

- **Video security**
  - Bunny Stream: create → upload MP4 → store only `bunnyVideoId`; no local HLS pipeline.
  - Playback requires auth + enrollment; signed URLs (token + expiry); `bunnyVideoId` stripped in `getChapterWithContent` and in video CRUD responses via `sanitizeVideoForClient`.
  - Legacy `videoUrl` still supported for old records (signed URL fallback).

- **Progress**
  - Progress and completion (e.g. ≥90% watched) enforced server-side; enrollment checked on get/update.

- **Validation**
  - Course/chapter/create/update use express-validator; MongoId and length limits in place.

- **Security**
  - CSRF: Origin header checked for state-changing requests; CORS uses `CLIENT_URL`; production requires non-localhost `CLIENT_URL`.
  - Protected course fields (status, approval, etc.) stripped in general update.

- **Structure**
  - Clear separation: routes → controllers → services; ownership and role checks centralized in middleware.

---

## 3. Negatives & production improvements

### 3.1 Security & data exposure

| Issue | Severity | Recommendation |
|-------|----------|-----------------|
| **GET /api/courses/:id** returns full course (sections, chapters, contents) with **no stripping of `bunnyVideoId`** (and no enrollment check). Any authenticated user (including learners) can call it and see video IDs. | Medium | In `course.controller.getById`, strip `bunnyVideoId` (and legacy `videoUrl`) from video contents before sending, and/or restrict full course to owner + admin. |
| **Course overview** (`GET /api/courses/:courseId/overview`) has **no enrollment or visibility check**. Any authenticated user can load overview of any course (including draft). | Low–Medium | For production: allow overview only if user is enrolled, or course is published, or user is instructor/admin (and optionally owner). |
| **Enrollment** is only checked at content/progress/play level, not at “can see this course exists” level. | Low | Document intended behavior; if drafts must be hidden from learners, add visibility/enrollment checks to overview (and possibly to course getById). |

### 3.2 Validation & input

| Issue | Severity | Recommendation |
|-------|----------|-----------------|
| **Video upload**: only extension filter (mp4, mov, avi, webm); no MIME or magic-byte check. | Low | Validate `Content-Type` or file magic bytes to reduce risk of disguised uploads. |
| **Progress PATCH**: `courseId`/`chapterId` not validated as MongoIds; no check that `chapterId` belongs to `courseId`. | Low | Add express-validator MongoId + existence check; optionally validate chapter is in course. |
| **Create video content** (`POST /api/videocontents` with body): schema requires `bunnyVideoId`; no server-side validation that it’s a valid Bunny guid format. | Low | Optional: validate format or existence if Bunny API supports it. |

### 3.3 Operations & robustness

| Issue | Severity | Recommendation |
|-------|----------|-----------------|
| **Console logging** in `course.controller.getById` (course/chapter/content tree). | Low | Remove or guard with `process.env.NODE_ENV !== 'production'`. |
| **Upload** writes to local `uploads/` then reads into memory; 1GB limit can cause high memory usage. | Medium | For large files: stream to Bunny or use chunked upload; consider lower limit or separate “large upload” flow. |
| **No rate limiting** on video play or upload. | Medium | Add rate limits (e.g. per user/IP) for `GET /api/videos/:id/play` and `POST .../upload-hls` to prevent abuse. |
| **Bunny Stream** encoding status not synced to DB (e.g. `encodingStatus` stays `"processing"`). | Low | Optional: webhook or polling job to set `encodingStatus: "ready"` and update `duration`/`resolution` when Bunny finishes. |
| **Temp file cleanup** on upload failure is in place; ensure `uploads/` is not committed and is in `.gitignore`. | Low | Verify .gitignore and add cleanup cron if needed. |

### 3.4 API design & consistency

| Issue | Severity | Recommendation |
|-------|----------|-----------------|
| **Inconsistent response shapes** (e.g. some `{ success, data }`, some `{ success, message, data }`). | Low | Standardize success/error envelope and document in OpenAPI. |
| **404 vs 403**: “Access denied or video not found” returns 403; sometimes 404 is clearer for “resource does not exist”. | Low | Differentiate: 404 when content/video missing, 403 when not allowed. |
| **GET /api/courses/:id** vs **GET /api/courses/:courseId/overview**: same role but different param names (`id` vs `courseId`). | Low | Use same param name for consistency. |

### 3.5 Data & schema

| Issue | Severity | Recommendation |
|-------|----------|-----------------|
| **Legacy video content** may still have `videoUrl`, `hlsPath`, `hlsStatus`, `processingFilePath`. | Low | Plan migration or document; ensure playback and any admin UI handle both legacy and Bunny Stream records. |
| **LearnerCourses.totalLessons** is set at enroll from chapter count; if curriculum changes, total can be stale. | Low | Recompute on enroll or periodically; or document as “snapshot at enroll”. |
| **CourseProgress** completion is per chapter; no explicit “content completed” list. | Low | Fine if completion is chapter-based; document and align frontend. |

### 3.6 Observability & errors

| Issue | Severity | Recommendation |
|-------|----------|-----------------|
| **Generic 500 messages** in production hide real errors. | Low | Keep generic user message but log full error/server stack server-side; consider request id in logs. |
| **Bunny API errors** are wrapped in message; no structured error code for client. | Low | Optional: map Bunny 4xx/5xx to stable client error codes for retry/display. |

---

## 4. Checklist for production

- [ ] Strip `bunnyVideoId` (and `videoUrl`) in `GET /api/courses/:id` for video contents, or restrict full course to owner/admin.
- [ ] Add enrollment or visibility check to `GET /api/courses/:courseId/overview` (e.g. enrolled or published or admin).
- [ ] Add rate limiting for video play and video upload.
- [ ] Validate progress PATCH `courseId`/`chapterId` (MongoId + chapter in course).
- [ ] Remove or gate debug `console.log` in course getById.
- [ ] Consider streaming or chunked upload for large videos; document max file size.
- [ ] Ensure `uploads/` is in `.gitignore` and not deployed to production as persistent storage.
- [x] **Bunny Stream webhook** – `POST /api/webhooks/bunny-stream` updates `encodingStatus` to `ready` or `failed` when Bunny finishes; duration/resolution synced when status is Finished. Configure this URL in Bunny dashboard (Stream → Library → Webhooks).
- [ ] Document 404 vs 403 for “not found” vs “forbidden” and align handlers.

---

## 5. File reference (backend)

| Area | Files |
|------|--------|
| **Routes** | `routes/course-routes/index.js`, `course.routes.js`, `section.routes.js`, `chapter.routes.js`, `videocontent.routes.js`, `video-routes/video.routes.js`, `learner-routes/course-progress-routes.js`, `learner-routes/learner-courses-routes.js` |
| **Controllers** | `course.controller.js`, `courseWatch.controller.js`, `chapter.controller.js`, `video.controller.js`, `videoPlay.controller.js` (video + course), `courseProgressController.js`, `learnerCoursesController.js` |
| **Services** | `course.service.js`, `video.service.js`, `progress.service.js` |
| **Middleware** | `courseOwnership.js`, `auth-middleware`, `role-middleware`, `csrf.js` |
| **Validation** | `validations/course.js`, `validations/chapter.js`, `validations/content.js` |
| **Models** | `Course`, `Section`, `Chapter`, `Content` / `VideoContent`, `LearnerCourses`, `CourseProgress` |
| **Video / CDN** | `helpers/bunnyStream.js`, `helpers/bunnyToken.js`, `helpers/bunnyStorage.js` (media only) |

---

*Audit covers the backend flows only. Frontend should always use the play endpoint for video URLs and not display or store raw `bunnyVideoId`/`videoUrl`.*
