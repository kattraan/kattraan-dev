# HLS Streaming Implementation — Kattraan LMS

## 1. Files Created

| File | Purpose |
|------|---------|
| `server/helpers/videoTranscoder.js` | FFmpeg wrapper: `convertToHLS(inputPath, outputDir)` and `getVideoMetadata(inputPath)` for duration/resolution. |

## 2. Files Modified

| File | Changes |
|------|---------|
| `server/helpers/bunnyStorage.js` | Added `uploadFileToBunnyKey(filePath, storageKey)` and `uploadHlsToBunny(localDir, videoId)` to upload playlist + segments under `videos/{videoId}/`. |
| `server/models/VideoContent.js` | `videoUrl` optional; added `hlsPath` (String), `resolution` (String). |
| `server/services/video.service.js` | `getPlaybackUrlFromContent()` prefers `hlsPath` (builds CDN URL); added `processVideoToHls(mp4Path, contentId)`. |
| `server/services/course.service.js` | Chapter content response strips `hlsPath` (and `videoUrl`) for video type. |
| `server/controllers/course-controller/video.controller.js` | Added `uploadHlsVideo`: multer → transcode → upload HLS → create VideoContent with `hlsPath`, duration, resolution. |
| `server/routes/course-routes/videocontent.routes.js` | Added `POST /upload-hls` (multer single file, requireContentChapterOwner). |
| `client/src/components/video/LMSVideoPlayer.jsx` | On HLS fatal error (e.g. manifest load / network), refetches `GET /api/videos/:videoId/play` and reloads source. |
| `client/src/features/courses/services/courseService.js` | Added `uploadVideoHls(file, chapterId, title)`. |
| `client/src/features/instructor/components/editor/hooks/useVideoUpload.js` | New video uploads use `uploadVideoHls`; on success calls `onUploadComplete` with `isHlsCreate: true` (no separate createContent). |
| `client/src/features/instructor/components/editor/hooks/useCourseEditor.js` | `handleVideoUploadComplete` handles `isHlsCreate`: skips createContent, refreshes course and shows success toast. |

## 3. New Video Pipeline

```
Instructor uploads MP4
        │
        ▼
POST /videocontents/upload-hls (multipart: file, chapter, title)
        │
        ├─► Multer saves to uploads/
        ├─► videoService.processVideoToHls(mp4Path, contentId)
        │       ├─► getVideoMetadata(mp4Path)  → duration, resolution
        │       ├─► convertToHLS(mp4Path, outputDir)  → playlist.m3u8 + segment*.ts
        │       └─► uploadHlsToBunny(outputDir, contentId)  → Bunny videos/{contentId}/
        ├─► Create VideoContent { _id, chapter, title, hlsPath, duration, resolution }
        ├─► Push content to Chapter
        └─► Delete temp MP4 and HLS dir
        │
        ▼
Bunny CDN structure:
  videos/
    {video-id}/
      playlist.m3u8
      segment0.ts
      segment1.ts
      ...
```

**Playback**

1. Client loads chapter content (no `videoUrl`/`hlsPath` in response).
2. Player has `videoContentId` → `GET /api/videos/:videoId/play` → backend checks enrollment, builds signed URL for `hlsPath` (or legacy `videoUrl`), returns `{ playbackUrl }`.
3. Player sets `playbackUrl` (e.g. `https://cdn…/videos/{id}/playlist.m3u8?token=…&expires=…`).
4. HLS: use Hls.js (or native Safari); refresh URL every 45s; on fatal manifest/network error, refetch play URL and reload.

## 4. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           INSTRUCTOR UPLOAD                                │
├──────────────────────────────────────────────────────────────────────────┤
│  Client: courseService.uploadVideoHls(file, chapterId, title)            │
│    → POST /api/videocontents/upload-hls (multipart)                       │
│                                                                           │
│  Server:                                                                  │
│    Multer → uploads/                                                       │
│    videoTranscoder.convertToHLS(mp4, outDir)  [FFmpeg]                    │
│    bunnyStorage.uploadHlsToBunny(outDir, videoId)                         │
│    VideoContent.create({ hlsPath: /videos/{id}/playlist.m3u8, ... })     │
│    Chapter.update($push: contents)                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Bunny CDN                                                                │
│    videos/{video-id}/playlist.m3u8  (+ segment0.ts, segment1.ts, …)       │
│    Token Auth: ?token=…&expires=… (60s)                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                        │
┌──────────────────────────────────────────────────────────────────────────┐
│                           LEARNER PLAYBACK                                │
├──────────────────────────────────────────────────────────────────────────┤
│  Client: GET /api/videos/:videoId/play → { playbackUrl: signed .m3u8 }   │
│  LMSVideoPlayer:                                                          │
│    if (isHlsUrl(playbackUrl))                                             │
│      Hls.isSupported() ? Hls.js loadSource(playbackUrl) : video.src       │
│    else video.src = playbackUrl  (legacy MP4)                             │
│  Refresh playback URL every 45s; on fatal HLS error → refetch & reload    │
└──────────────────────────────────────────────────────────────────────────┘
```

## 5. How to Test HLS Streaming

### Prerequisites

- **FFmpeg** installed and on `PATH` (includes `ffprobe`).
  - Windows: e.g. `choco install ffmpeg` or download from https://ffmpeg.org.
  - macOS: `brew install ffmpeg`.
- **Bunny** pull zone with Token Authentication enabled; `BUNNY_TOKEN_AUTH_KEY` and `BUNNY_CDN_HOSTNAME` in `server/.env`.
- Server and client running (`npm run dev` in `server` and `client`).

### 1. Upload an HLS video (instructor)

- Log in as instructor, open a course, add or open a chapter.
- Use the new HLS upload flow:
  - **Option A (API):**  
    `POST /api/videocontents/upload-hls`  
    Body: form-data with `file` (MP4), `chapter` (chapterId), `title` (string).  
    Headers: `Authorization` (or cookie) as required.
  - **Option B (UI):** The course editor uses HLS for **new** video lessons: when you add a video and select a file, `useVideoUpload` calls `courseService.uploadVideoHls(file, chapterId, title)`; the server creates the content and pushes it to the chapter, so no separate create-content call is needed. Editing an existing video (title, thumbnail, etc.) does not replace the file with HLS; only new uploads go through the HLS pipeline.
- Confirm the created VideoContent has `hlsPath` (e.g. `/videos/<id>/playlist.m3u8`), `duration`, and `resolution`.

### 2. Playback (learner)

- Enroll a learner in the course (or use an instructor account).
- Open the course watch page and select the chapter that contains the HLS video.
- Open DevTools → Network: you should see:
  - `GET /api/videos/<videoId>/play` → 200, body has `playbackUrl` (`.m3u8?token=…&expires=…`).
  - Requests to the CDN for `playlist.m3u8` and `segment*.ts` (with the same token/expires).
- Video should play; timeline and progress should work (existing progress logic unchanged).

### 3. Token expiry and refetch

- Let the signed URL expire (e.g. wait > 60s or set a short TTL in dev).
- Trigger a new segment or playlist request (e.g. seek or wait for next segment).
- In the player, a fatal HLS error should trigger a refetch of `GET /api/videos/:videoId/play` and a reload of the playlist; playback should resume after refetch.

### 4. Legacy MP4

- Courses/chapters that still have only `videoUrl` (no `hlsPath`) should continue to play via the same play API (signed MP4 URL); no change to existing progress tracking.

## 6. Progress Tracking (unchanged)

- `GET /api/learner/course-progress/:courseId` and `PATCH /api/learner/course-progress` are unchanged.
- Enrollment is still required (403 if not enrolled).
- Progress still stores `currentTime`, `duration`, `watchedPercentage`, and completion; works for both HLS and MP4 playback.

## 7. File Structure on Bunny

After upload:

```
videos/
  {video-id}/           ← MongoDB VideoContent._id
    playlist.m3u8
    segment0.ts
    segment1.ts
    segment2.ts
    ...
```

`hlsPath` in the DB is stored as `/videos/{video-id}/playlist.m3u8` (or equivalent); the play API builds the full CDN URL and signs it.
