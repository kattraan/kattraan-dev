# Kattraan LMS — Testing Guide

This document describes how to run the server test suite and what it covers.

---

## Quick Start

From the **server** directory:

```bash
cd server
npm run test
```

- **Environment:** `NODE_ENV=test` is set automatically by the test script.
- **First run:** If using in-memory MongoDB for the first time, a MongoDB binary may be downloaded once (~500MB). Subsequent runs are faster.

---

## Test Stack

| Tool | Purpose |
|------|--------|
| **Jest** | Test runner |
| **Supertest** | HTTP assertions against the Express app |
| **mongodb-memory-server** | In-memory MongoDB for isolated tests (no real DB required) |
| **cross-env** | Sets `NODE_ENV=test` on all platforms |

---

## Test Structure

```
server/
├── jest.config.js          # Jest config (node env, test match, setup)
├── tests/
│   ├── setup.js            # Sets NODE_ENV=test and test JWT secrets
│   └── auth.test.js        # Authentication API tests
```

- **Setup:** `tests/setup.js` runs before tests and sets:
  - `NODE_ENV=test`
  - `JWT_SECRET` and `JWT_REFRESH_SECRET` (if not already set) for test use only.
- **Database:** Each test run starts an in-memory MongoDB instance, connects via `config/db.js`, and seeds the **Role** collection (learner, instructor, admin). **User** and **Blacklist** collections are cleared after each test to avoid cross-test leakage.

---

## What Is Tested

### 1. POST /api/auth/register

| Test | Expected |
|------|----------|
| Valid body (userName, userEmail @gmail.com, strong password) | **201** – success, `{ success: true, message: "Registered successfully" }` |
| Duplicate email (same user registered twice) | **400** – `{ success: false, message: "Email already registered." }` |
| Missing required fields | **400** – validation error |
| Non-Gmail email | **400** – message indicates Gmail only |
| Weak password (no uppercase/lowercase/number/special) | **400** – password strength error |

### 2. POST /api/auth/login

| Test | Expected |
|------|----------|
| Valid credentials (after register) | **200** – success, `Set-Cookie` headers for accessToken and refreshToken |
| Wrong password | **401** – invalid credentials |
| User not found (unknown email) | **401** – same response as wrong password |
| Missing email or password | **400** – "Email and password required" |

### 3. JWT Verification Middleware (GET /api/auth/check-auth)

Protected route used to verify the auth middleware behavior.

| Test | Expected |
|------|----------|
| Valid Bearer token (`Authorization: Bearer <token>`) | **200** – `{ success: true, data: { user: { ... } } }` |
| No token | **401** – "User is not authenticated" |
| Expired token | **401** – "Invalid or expired token" |
| Tampered token (modified payload) | **401** – "Invalid or expired token" |
| Token signed with wrong secret | **401** – "Invalid or expired token" |
| Token signed with wrong algorithm (e.g. HS384) | **401** – rejected (middleware uses `algorithms: ["HS256"]`) |

---

## Sample Test Run Output

All tests passing (15/15):

```
> server@1.0.0 test
> cross-env NODE_ENV=test jest --runInBand --forceExit

  console.log
    MongoDB connected

PASS tests/auth.test.js (7.036 s)
  POST /api/auth/register
    √ should register user successfully and return 201 (157 ms)
    √ should return 400 for duplicate email (161 ms)
    √ should return 400 when missing required fields (8 ms)
    √ should return 400 for non-Gmail email (8 ms)
    √ should return 400 for weak password (12 ms)
  POST /api/auth/login
    √ should login successfully and return 200 with success (232 ms)
    √ should return 401 for wrong password (148 ms)
    √ should return 401 for user not found (same message as wrong password) (85 ms)
    √ should return 400 when credentials are missing (82 ms)
  JWT verification middleware (GET /api/auth/check-auth)
    √ should allow access with valid Bearer token (239 ms)
    √ should return 401 when no token is provided (225 ms)
    √ should return 401 for expired token (228 ms)
    √ should return 401 for tampered token (235 ms)
    √ should return 401 for token signed with wrong secret (230 ms)
    √ should reject token signed with wrong algorithm (e.g. HS384) (249 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        ~7 s
```

---

## npm Script

In `server/package.json`:

```json
"scripts": {
  "test": "cross-env NODE_ENV=test jest --runInBand --forceExit"
}
```

- **`--runInBand`:** Runs test files serially so the in-memory DB state is predictable.
- **`--forceExit`:** Ensures Jest exits after tests (avoids hanging on open handles from the MongoDB driver).

---

## Error Responses (Reference)

The auth API uses these status codes consistently:

| Code | Meaning | Example |
|------|---------|--------|
| **400** | Bad request (validation, duplicate email, weak password, missing fields) | Duplicate email, missing credentials |
| **401** | Unauthorized (no/invalid/expired token, wrong credentials) | Wrong password, no Bearer token |
| **403** | Forbidden (valid auth but insufficient role) | Used on role-protected routes |

---

## Related Docs

- **[AUDIT-AUTHENTICATION-MODULE.md](./AUDIT-AUTHENTICATION-MODULE.md)** — Auth security audit and fixes.
- **[API-Documentation/authentication.md](./API-Documentation/authentication.md)** — Auth API usage.
- **Swagger:** `GET /api-docs` when the server is running — includes `/auth/register`, `/auth/login`, and `/auth/check-auth` (profile) with Bearer and cookie security.
