# Course Publish → Admin Approval Workflow

## 1. Course model (updated)

**File:** `server/models/Course.js`

- **status:** `enum: ["draft", "pending_approval", "published", "rejected"]`, default `"draft"`.
- **submittedForReviewAt:** Date (set when instructor submits).
- **approvedAt:** Date (set when admin approves).
- **rejectedAt:** Date (set when admin rejects).
- **rejectionReason:** String (required for reject).
- **approvedBy:** ObjectId ref User.
- Index on `status`.

**Migration (if you have existing courses with "Draft" / "Published"):**

```js
db.courses.updateMany({ status: "Draft" }, { $set: { status: "draft" } });
db.courses.updateMany({ status: "Published" }, { $set: { status: "published" } });
```

---

## 2. Instructor submit-for-review

**Route:** `PATCH /api/courses/:id/submit-for-review`

- **Auth:** `authenticate` + `authorizeRoles('instructor', 'admin')` + `requireCourseOwner('id')`.
- **Allowed status:** only `draft` or `rejected`.
- **Validation:** title, description, price set, at least one section, one chapter, one content item. On failure → `400` with `data.errors`.
- **On success:** `status = "pending_approval"`, `submittedForReviewAt = now`, clear rejection fields; response `{ success, message, data: { course } }`.

**Controller:** `server/controllers/course-controller/course.controller.js` → `submitForReview`.

---

## 3. Admin routes

- **GET /api/admin/courses/pending**  
  - Auth: `authenticate` + `authorizeRoles('admin')`.  
  - Returns courses with `status === 'pending_approval'` and `isDeleted !== true`, populated `createdBy`, sorted by `submittedForReviewAt` desc.

- **PATCH /api/admin/courses/:id/approve**  
  - Auth: same.  
  - Sets `status = 'published'`, `approvedAt = now`, `approvedBy = req.user._id`, clears rejection fields.  
  - Rejects if course is deleted or not `pending_approval`.

- **PATCH /api/admin/courses/:id/reject**  
  - Auth: same.  
  - Body: `{ rejectionReason: string }` (required).  
  - Sets `status = 'rejected'`, `rejectedAt = now`, `rejectionReason`, clears approval fields.  
  - Rejects if course is deleted or not `pending_approval`.

**Controller:** `server/controllers/admin-controller/courseReview.controller.js`.  
**Routes:** `server/routes/admin-routes/index.js` (mounted at `/api/admin`).

---

## 4. Public course visibility

- **GET /api/courses/public**  
  - Returns courses where `status === 'published'` and `isDeleted !== true`.  
  - Use this for learner-facing catalog; instructor listing still uses existing endpoints and shows all statuses.

**Course update (PUT):**  
- `status` and all approval-related fields are stripped from the body (in controller and in validation).  
- Instructors cannot set `status` to `published`; only admin approve can.

---

## 5. Frontend – Instructor (course editor)

- **Status badge in header:** Draft / Pending Admin Approval / Published / Rejected.
- **Submit for Review:** Shown only when `status === 'draft'` or `'rejected'`; calls `PATCH /api/courses/:id/submit-for-review`; toasts success or validation errors.
- **Pending:** When `status === 'pending_approval'`: banner “Your course is under review”, curriculum area read-only (message only); backend also returns 403 on section/chapter/content edits.
- **Rejected:** If `rejectionReason` exists, a red banner shows “Course rejected” and the admin feedback.
- **Create/update:** No `status` or approval fields sent; backend ignores them if sent.

**Files:**  
- `client/src/features/instructor/components/editor/components/EditorHeader.jsx` – badge + Submit for Review.  
- `client/src/features/instructor/components/editor/CourseEditor.jsx` – pending/rejected banners and read-only content.  
- `client/src/features/instructor/components/editor/hooks/useCourseEditor.js` – `handleSubmitForReview`, `normalizeStatus`, strip status from save.  
- `client/src/features/courses/services/courseService.js` – `submitForReview(id)`.  
- `client/src/features/courses/store/courseSlice.js` – `submitForReview` thunk and fulfilled handler.

---

## 6. Frontend – Admin (course review)

- **Page:** Course Management → `/admin-dashboard/courses` (CourseReviewPage).
- **List:** Pending courses with title, instructor name, submitted date.
- **Actions:** Preview (opens instructor edit in new tab), Approve, Reject.
- **Reject:** Modal with required “Rejection reason”; submit calls `PATCH /api/admin/courses/:id/reject` with `{ rejectionReason }`.
- List refreshes after approve/reject; toasts for success/error.

**Files:**  
- `client/src/features/admin/components/CourseReview.jsx` – list, approve, reject modal.  
- `client/src/features/admin/services/adminService.js` – `getPendingCourses`, `approveCourse`, `rejectCourse`.  
- `client/src/pages/admin/CourseReviewPage.jsx` – wrapper.  
- `client/src/App.jsx` – route `ROUTES.ADMIN_COURSES` → CourseReviewPage.

---

## 7. Security

- **Status and approval fields** are never writable via the general course create/update: stripped in controller (`stripProtectedFields`) and not in update validation. Only dedicated flows set them:
  - Submit: `submitForReview` sets `pending_approval` and `submittedForReviewAt`.
  - Approve/Reject: admin controller sets `published`/`rejected` and related fields.
- **Instructor cannot set `published`:** no route or body allows it; admin approve is the only path.
- **Curriculum edits when pending:** `requireCourseNotPendingReview` middleware on course PUT/DELETE and on section/chapter/content create/update/delete returns 403 when `course.status === 'pending_approval'`.
- **Admin routes:** All under `authenticate` + `authorizeRoles('admin')`.
- **Soft-deleted courses:** Cannot be approved or rejected (explicit checks in admin controller).
- **Ownership:** Submit-for-review uses `requireCourseOwner('id')`; section/chapter/content use existing ownership middlewares plus `requireCourseNotPendingReview`.

---

## 8. Response format

All APIs use:

- Success: `{ success: true, message: "...", data?: {} }`
- Error: `{ success: false, message: "..." }` (and optionally `data`, e.g. `errors` for submit validation).

---

## 9. Route summary

| Method | Path | Auth | Purpose |
|--------|------|------|--------|
| GET | /api/courses/public | optional | Public listing (published only) |
| PATCH | /api/courses/:id/submit-for-review | instructor/admin + owner | Submit for review |
| GET | /api/admin/courses/pending | admin | List pending courses |
| PATCH | /api/admin/courses/:id/approve | admin | Approve course |
| PATCH | /api/admin/courses/:id/reject | admin | Reject with reason |

---

## 10. Workflow summary

1. Instructor creates/edits course (status stays `draft` or becomes `rejected` after feedback).
2. Instructor clicks **Submit for Review** → validation runs; if OK, status → `pending_approval`, curriculum locked.
3. Admin opens **Course Management** → sees pending list → **Preview** / **Approve** / **Reject** (with reason).
4. **Approve** → status → `published`; course appears in public listing and for learners.
5. **Reject** → status → `rejected`, `rejectionReason` stored; instructor sees feedback and can edit and resubmit.
6. Only `published` courses are returned by `GET /api/courses/public` and are the ones visible in the learner catalog.
