# LMS Video System – Architecture & API

## Overview

Marketplace-grade watch page at `/view-course/:courseId/watch?chapter=:chapterId` with resume playback, watch-time tracking, auto-next lesson, keyboard shortcuts, and backend progress sync.

---

## Backend Progress API Contract

### GET `/api/learner/course-progress/:courseId`

**Auth:** Required (cookie or Bearer).

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "string",
    "chapterProgress": [
      {
        "chapterId": "string",
        "currentTime": number,
        "duration": number,
        "watchedPercentage": number,
        "completed": boolean,
        "lastWatchedAt": "ISO date"
      }
    ],
    "overallPercentage": number,
    "completed": boolean
  }
}
```

- `chapterProgress`: per-chapter progress (resume position, completion).
- `overallPercentage`: derived on frontend from `completedCount / totalChapters` (course structure).

---

### PATCH `/api/learner/course-progress`

**Auth:** Required.

**Body:**
```json
{
  "courseId": "string",
  "chapterId": "string",
  "currentTime": number,
  "duration": number,
  "watchedPercentage": number
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "string",
    "chapterId": "string",
    "currentTime": number,
    "duration": number,
    "watchedPercentage": number,
    "completed": boolean
  }
}
```

**Rules:**
- Completion is **only** set by the backend when `watchedPercentage >= 90` (anti-cheat).
- Frontend sends progress every ~10s while playing; backend upserts `chapterProgress` by `chapterId`.

---

## File Structure

```
client/src/
├── components/
│   └── video/
│       └── LMSVideoPlayer.jsx      # Full LMS player (controls, resume, speed memory, keyboard)
├── hooks/
│   ├── useVideoProgress.js         # Fetch progress, 10s sync, initialTime / isCompleted
│   └── useKeyboardShortcuts.js     # Space, F, M, ArrowLeft/Right (when player focused)
├── features/
│   └── learner/
│       └── services/
│           └── courseProgressService.js   # getCourseProgress, updateCourseProgress
├── utils/
│   └── videoUtils.js               # formatTime, formatDuration, PLAYBACK_RATES, LMS_PLAYBACK_SPEED_KEY
├── pages/
│   └── courses/
│       └── CourseWatchPage.jsx     # Integrates player, progress hook, next overlay, sidebar progress

server/
├── models/
│   └── CourseProgress.js           # userId, courseId, chapterProgress[], completed
├── controllers/
│   └── learner-controller/
│       └── courseProgressController.js   # getProgress, updateProgress
└── routes/
    └── learner-routes/
        └── course-progress-routes.js    # GET /:courseId, PATCH /
```

---

## Architecture Decisions

1. **Resume:** On load, `GET` progress for the course; for the active `chapterId`, `initialTime` is passed to `LMSVideoPlayer`, which seeks on `canplay`. Completion is shown from backend data (`isCompleted`).

2. **Watch-time:** `useVideoProgress` receives `playback` (currentTime, duration, isPlaying) from the player. Every 10s while `isPlaying`, it sends `PATCH` with current position and computed `watchedPercentage`. Completion is **never** set by the client alone; backend sets it when `watchedPercentage >= 90`.

3. **Auto-next:** On `ended`, if there is a next chapter, a 5s countdown overlay is shown; then `handleChapterSelect(next)` and URL `?chapter=nextId`. If no next chapter, a “Course Completed” overlay is shown.

4. **Keyboard shortcuts:** `useKeyboardShortcuts(containerRef, handlers)` only runs when focus is not in an input/textarea; Space (play/pause), F (fullscreen), M (mute), ArrowLeft/Right (±10s).

5. **Playback speed memory:** Stored in `localStorage` under `lms_playback_speed`; applied on load and on change in `LMSVideoPlayer`.

6. **Sidebar progress:** `progressByChapter` and `overallPercentage` (computed from course structure) are passed to the sidebar. Real duration from progress or chapter video content; check icon for completed lessons; “X% COMPLETE” at top.

7. **Security:** Video URLs are not exposed in public listing. Completion is verified and stored only on the backend. Enrollment check can be added in the progress controller when needed.

8. **Errors:** Player shows retry UI on video error; progress sync failures are stored in hook state (optional toast). Tab visibility (pause when hidden) can be added via `document.visibilityState`.
