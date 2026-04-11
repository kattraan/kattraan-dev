# Kattraan LMS — Video Security & Streaming Architecture

## 1. New Files Created

| File | Purpose |
|------|---------|
| `server/controllers/video-controller/videoPlay.controller.js` | Thin controller for `GET /api/videos/:videoId/play`; delegates to video service. |
| `server/routes/video-routes/video.routes.js` | Routes for secure video playback API; auth + role middleware. |

## 2. Files Modified

| File | Changes |
|------|---------|
| `server/helpers/bunnyToken.js` | Default TTL 60s; added `generateSignedPlaybackUrl(videoPath, expirationTime)` and `signPath()`; JSDoc for Bunny Token Auth. |
| `server/services/video.service.js` | Added `getVideoPlayUrlByVideoId(videoId, userId, userRole)`; enrollment check; 60s signed URL; `PLAYBACK_URL_TTL` constant. |
| `server/services/course.service.js` | `getChapterWithContent()` no longer sends `videoUrl`; video contents returned without `videoUrl` (client uses play API). |
| `server/app.js` | Registered `app.use('/api/videos', videoRoutes)`. |
| `client/src/features/courses/services/courseService.js` | Added `getVideoPlayUrlByVideoId(videoId)` calling `GET /api/videos/:videoId/play`. |
| `client/src/components/video/LMSVideoPlayer.jsx` | Fetches playback URL by video content ID; refreshes URL every 45s; HLS.js + native HLS; watermark overlay (email + timestamp, 10s, random position); supports legacy `videoUrl` for instructor preview. |

## 3. Security Improvements

1. **Bunny Token Authentication**  
   All playback URLs are signed with HMAC-SHA256; default expiry 60 seconds. Raw CDN URLs are never sent to the client.

2. **Temporary Signed Playback URLs**  
   `generateSignedUrl(originalUrl, 60)` and `generateSignedPlaybackUrl(videoPath, expirationTime)` produce time-limited URLs.

3. **Secure Video Access API**  
   `GET /api/videos/:videoId/play`: verifies auth, resolves course from video → chapter → section → course, checks enrollment (or instructor/admin), returns only `{ playbackUrl }`. Video metadata from DB is not exposed.

4. **No Direct Video Exposure**  
   `videoUrl` is stripped from chapter content in `getChapterWithContent()`. Only the play endpoint returns a signed URL; the database `videoUrl` is never sent to the frontend.

5. **Enrollment Verification**  
   - Video play: `video.service.getVideoPlayUrlByVideoId()` checks enrollment (or elevated role).  
   - Progress: `GET/PATCH /api/learner/course-progress` already enforce enrollment (403 if not enrolled).

6. **Role-Based Access**  
   Video play route uses `authorizeRoles('learner', 'instructor', 'admin')`.

7. **Watermark Overlay**  
   Dynamic overlay with user email and current timestamp; position randomized every 10 seconds to discourage cropping.

## 4. Performance Improvements

1. **Lazy Chapter Loading**  
   Watch page uses `GET /api/courses/:courseId/overview` (slim) and `GET /api/chapters/:chapterId/content` when a chapter is selected. Full chapter content (including video content IDs) is loaded only when needed.

2. **Playback URL Refresh**  
   Client refreshes the signed URL every 45s so playback continues without user action when the 60s token expires.

3. **HLS Streaming**  
   When the playback URL is an `.m3u8` manifest, HLS.js (or native HLS on Safari) is used for adaptive streaming.

## 5. Updated System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  CourseWatchPage                                                             │
│    ├── getCourseOverview(courseId)     → slim course (sections/chapter IDs)  │
│    └── getChapterContent(chapterId)   → chapter + contents (no videoUrl)     │
│                                                                              │
│  LMSVideoPlayer                                                              │
│    ├── videoContentId from activeChapter.contents[video]._id                 │
│    ├── getVideoPlayUrlByVideoId(videoId) → GET /api/videos/:videoId/play     │
│    ├── playbackUrl refreshed every 45s                                        │
│    ├── HLS.js / native HLS for .m3u8                                          │
│    └── Watermark: email + timestamp, random position every 10s               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS (cookies / credentials)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Node.js + Express)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Routes                                                                      │
│    GET /api/courses/:courseId/overview     → courseWatch.getCourseOverview   │
│    GET /api/chapters/:chapterId/content   → courseWatch.getChapterContent     │
│    GET /api/videos/:videoId/play          → videoPlay.getPlayUrl              │
│    GET /api/learner/course-progress/:id    → progress.getProgress (enrolled)  │
│    PATCH /api/learner/course-progress     → progress.updateProgress (enrolled)│
├─────────────────────────────────────────────────────────────────────────────┤
│  Services                                                                    │
│    video.service    → getVideoPlayUrlByVideoId (enrollment, sign URL)        │
│    progress.service → isEnrolled, fetchProgress, saveProgress                 │
│    course.service   → getCourseOverview, getChapterWithContent (strip videoUrl)│
├─────────────────────────────────────────────────────────────────────────────┤
│  Helpers                                                                     │
│    bunnyToken → generateSignedUrl(url, 60), generateSignedPlaybackUrl(path)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
            │   MongoDB     │   │  LearnerCourses│   │  Bunny CDN     │
            │ Course,      │   │  (enrollment   │   │  (signed URL   │
            │ Chapter,     │   │   check)       │   │   only)        │
            │ Content,     │   │               │   │  .mp4 / .m3u8  │
            │ CourseProgress│   │               │   │                │
            └───────────────┘   └───────────────┘   └───────────────┘
```

**Data flow (video playback)**

1. User opens watch page → client loads course overview (slim).  
2. User selects chapter → client loads `GET /api/chapters/:chapterId/content` (no `videoUrl` in response).  
3. Player gets `videoContentId` from chapter contents.  
4. Player calls `GET /api/videos/:videoId/play` → backend checks enrollment, loads `videoUrl` from DB, returns signed URL (60s).  
5. Player sets source (HLS or MP4), refreshes play URL every 45s.  
6. Bunny CDN serves the asset only when the request includes a valid `token` and unexpired `expires`.

**Environment**

- `BUNNY_TOKEN_AUTH_KEY` — required for signing (Bunny pull zone Token Authentication).  
- `BUNNY_CDN_HOSTNAME` — used by `generateSignedPlaybackUrl` when building URL from path.
