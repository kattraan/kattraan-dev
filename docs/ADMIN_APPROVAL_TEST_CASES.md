# Admin Approval Flow – Test Cases (CRITICAL)

Instructors must have **status === 'approved'** to log in. Until then, login must be **blocked** (403).

## Flow

1. Create instructor account (register → become instructor → submit enrollment).
2. User has **status = 'pending_approval'** (set in submit-enrollment).
3. **Try login** (email/password or Google) → must **block** with **403** and clear message.
4. Admin approves (POST `/api/auth/admin-approve` with `{ userId, action: 'approve' }`).
5. **Login again** → must **succeed** (200).

If unapproved instructors can log in → **security flaw**. Fix immediately.

## Where it is enforced

- **POST /api/auth/login** – After password check, if user has instructor role and `status !== 'approved'` → 403.
- **POST /api/auth/refresh** – On token refresh, re-check; if instructor not approved → 403 (so approval/revocation takes effect without waiting for token expiry).
- **Google OAuth callback** – After Passport attaches user, if instructor not approved → redirect to login with `?error=instructor_pending_approval`.
- **POST /api/auth/google-one-tap** – After resolving user, if instructor not approved → 403.

## User model

- **status** enum: `'active' | 'pending_enrollment' | 'pending_approval' | 'approved' | 'rejected'`.
- Instructor enrollment sets **status = 'pending_approval'**.
- Admin approve sets **status = 'approved'**; reject sets **status = 'rejected'**.

## How to test

1. Create a user and add instructor role (e.g. via become-instructor + submit-enrollment), or create user with instructor role and set `status: 'pending_approval'` in DB.
2. **Login** (email/password) → expect **403** and message: "Your instructor account is pending approval..."
3. As admin, call **POST /api/auth/admin-approve** with `{ userId: <id>, action: 'approve' }`.
4. **Login** again → expect **200** and tokens/success.
