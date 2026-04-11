# Watch Page UI – Functionality Checklist

**Page:** `/view-course/:courseId/watch?chapter=:chapterId`  
**Purpose:** Student-style course player (video + sidebar) for admin review and instructor preview.

---

## Already implemented

| Area                 | What's done                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Header**           | Back button, Kattraan logo, course title, Share button (UI), profile avatar + dropdown                        |
| **Profile dropdown** | Display name, "Logged in", View profile, My account, Logout                                                   |
| **Video player**     | Native `<video>` with `controls` (play/pause, progress bar, time, volume, fullscreen)                         |
| **Video content**    | Loads and plays video from `activeChapter` when content type is video; poster from course image/thumbnail     |
| **Sidebar**          | "CONTENT" title, collapse/expand toggle, scrollable list                                                      |
| **Sections**         | Collapsible sections with "Section N: Title" and "X Lessons • 1h 24m" (duration currently hardcoded)          |
| **Lessons**          | Play/File icon, lesson number + title, duration "12:45" (hardcoded), "PLAYING" and pink bar for active lesson |
| **Lesson click**     | Clicking a chapter updates `activeChapter` and switches the main video/tab content                            |
| **Content tabs**     | Description, Resources, QnA, Notes tabs below video                                                           |
| **Description tab**  | Chapter description (sanitized HTML), Key Takeaways placeholder                                               |
| **Resources tab**    | List of resources with download links when available                                                          |
| **QnA tab**          | Placeholder "No questions yet" + Ask Question button                                                          |
| **URL**              | Initial chapter from `?chapter=:chapterId` on load                                                            |

---

## To do (UI / behaviour)

### 1. Header

| #   | Item                          | Priority | Notes                                                                                       |
| --- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| 1.1 | **Theme toggle (dark/light)** | Medium   | Add moon/sun icon; toggle theme for this page (or use app theme).                           |
| 1.2 | **Show user role in header**  | High     | Display "PLATFORM ADMIN" or "INSTRUCTOR" (or "LEARNER") next to profile, from `user.roles`. |
| 1.3 | **Share button action**       | Medium   | Implement share: Web Share API and/or "Copy link" (current page URL).                       |

### 2. Profile dropdown

| #   | Item                          | Priority | Notes                                                     |
| --- | ----------------------------- | -------- | --------------------------------------------------------- |
| 2.1 | **View profile / My account** | Low      | Wire to profile/settings route or keep as placeholder.    |
| 2.2 | **Role in dropdown**          | Low      | Show role label in the dropdown (e.g. under "Logged in"). |

### 3. Video player

| #   | Item                              | Priority | Notes                                                                                                       |
| --- | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| 3.1 | **Current time / total duration** | Low      | Native controls already show this; optional custom display (e.g. "0:06 / 1:24:39") if you replace controls. |
| 3.2 | **Poster image**                  | Done     | Uses course image or thumbnail.                                                                             |
| 3.3 | **Switching video**               | Done     | Changing chapter updates `activeChapter` and video source.                                                  |

### 4. Sidebar – content and data

| #   | Item                         | Priority | Notes                                                                                                                        |
| --- | ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | **Real progress: "X% DONE"** | High     | Replace hardcoded "84% DONE" with computed progress (e.g. completed chapters / total; requires progress API or local state). |
| 4.2 | **Section duration**         | High     | Replace "1h 24m" with real total duration per section from chapter/content metadata (e.g. video duration).                   |
| 4.3 | **Lesson duration**          | High     | Replace "12:45" with real duration per lesson from content metadata (e.g. `metadata.durationSeconds` or video duration).     |
| 4.4 | **"PLAYING" only on active** | Done     | Only the active chapter shows PLAYING and the pink bar.                                                                      |

### 5. URL and navigation

| #   | Item                           | Priority | Notes                                                                                                                                                                 |
| --- | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | **Sync URL on chapter change** | High     | When user selects a chapter in the sidebar, update URL to `?chapter=:chapterId` (e.g. via `navigate` or `setSearchParams`) so refresh/bookmark keeps the same lesson. |

### 6. Content tabs (below video)

| #   | Item                        | Priority | Notes                                                                               |
| --- | --------------------------- | -------- | ----------------------------------------------------------------------------------- |
| 6.1 | **Chapter duration in tab** | Medium   | Replace hardcoded "Duration: 12:45" with real duration from active chapter/content. |
| 6.2 | **Notes tab content**       | Medium   | Add Notes tab: list/input for per-chapter or per-course notes (or placeholder).     |
| 6.3 | **Key Takeaways**           | Low      | Currently placeholder; optionally drive from chapter/course data if available.      |

### 7. Floating action buttons (FAB)

| #   | Item                         | Priority | Notes                                                                                                                                                              |
| --- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7.1 | **FAB strip (bottom right)** | Low      | Add 3 buttons (e.g. video/camera, bar chart, brain) if product needs: Live lecture, Analytics, AI tools. Define actions and visibility (e.g. instructor vs admin). |

### 8. Responsive and a11y

| #   | Item                         | Priority | Notes                                                                     |
| --- | ---------------------------- | -------- | ------------------------------------------------------------------------- |
| 8.1 | **Mobile layout**            | Medium   | Sidebar collapse/stack on small screens; video and tabs remain usable.    |
| 8.2 | **Keyboard / screen reader** | Low      | Ensure tab order, aria-labels, and focus management for sidebar and tabs. |

### 9. Loading and errors

| #   | Item              | Priority | Notes                                                               |
| --- | ----------------- | -------- | ------------------------------------------------------------------- |
| 9.1 | **Loading state** | Done     | Full-page "Loading course…" while fetching.                         |
| 9.2 | **Error state**   | Done     | Message + "Back to course" when fetch fails.                        |
| 9.3 | **Video loading** | Low      | Optional loading spinner or placeholder while video source changes. |

---

## Summary

- **High priority:** Role in header (1.2), real progress % (4.1), section/lesson durations (4.2, 4.3), URL sync on chapter change (5.1).
- **Medium priority:** Theme toggle (1.1), Share action (1.3), chapter duration in tab (6.1), Notes tab (6.2), mobile layout (8.1).
- **Low priority:** Profile links (2.1, 2.2), custom time display (3.1), Key Takeaways (6.3), FAB strip (7.1), a11y (8.2), video loading state (9.3).

Use this list to implement or tick off features in the watch module.
