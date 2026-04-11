# Ownership Protection – Test Cases (CRITICAL)

All modifying routes (PUT / DELETE / POST) must enforce: **course owner = `course.createdBy`** and **check `course.createdBy === req.user._id`** (or user is admin). Otherwise → **security flaw**.

## Middleware check (server)

- **Course model** uses `createdBy` (AuditFields) as the instructor/owner.
- **courseOwnership.js** does: `String(course.createdBy) !== String(req.user._id)` → 403.
- Admin bypass: users with role `admin` can edit any course.

## Required test cases

| Test Case | Expected |
|-----------|----------|
| Instructor A edits Instructor B's course (PUT /courses/:id) | **403** |
| Instructor A deletes Instructor B's section (DELETE /sections/:id) | **403** |
| Instructor A edits own course (PUT /courses/:id) | **200** |

If any of these fail → security flaw.

## How to test

1. Create two instructor users (A and B) and get their JWT tokens.
2. Create a course as Instructor B (so `createdBy` = B’s `_id`).
3. **Test 1:** As Instructor A, send `PUT /api/courses/:courseId` with A’s token → expect **403** and message like "You can only edit your own courses".
4. **Test 2:** As Instructor A, send `DELETE /api/sections/:sectionId` for a section in B’s course → expect **403**.
5. **Test 3:** As Instructor A, create a course (owned by A), then send `PUT /api/courses/:courseId` with A’s token → expect **200**.

## Routes protected by ownership

| Route | Method | Middleware |
|-------|--------|------------|
| /courses/:id | PUT, DELETE | requireCourseOwner('id') |
| /courses | POST | (sets createdBy in controller) |
| /sections | POST | requireCourseOwnerFromBody('course') |
| /sections/:id | PUT, DELETE | requireSectionOwner('id') |
| /chapters | POST | requireChapterSectionOwner('section') |
| /chapters/:id | PUT, DELETE | requireChapterOwner('id') |
| /contents, /videocontents, /quizcontents, etc. | POST | requireContentChapterOwner('chapter') |
| /contents/:id, /videocontents/:id, etc. | PUT, DELETE | requireContentOwner('id') |

All of the above resolve ownership via **course.createdBy** and **req.user._id**.
