/**
 * Derives per-chapter completion for certificate / overall progress.
 * - Video (or video+quiz) chapters: video must be marked completed in progress.
 * - If the chapter also has a quiz, the learner must have attempted it.
 * - Quiz-only / assignment-only chapters: submission must exist (quizChapterSummaries).
 */

function chapterKey(chapter) {
  if (chapter?._id == null && chapter?.id == null) return "";
  return String(chapter._id || chapter.id);
}

function chapterHasPlayableVideo(chapter) {
  return !!chapter?.contents?.some(
    (c) => c.type === "video" && (c._id || c.id || c.videoUrl),
  );
}

function chapterHasQuiz(chapter) {
  return !!chapter?.contents?.some((c) => c.type === "quiz");
}

export function isChapterFullyComplete(
  chapter,
  progressByChapter = {},
  quizChapterSummaries = {},
) {
  const key = chapterKey(chapter);
  if (!key) return false;

  const hasPlayableVideo = chapterHasPlayableVideo(chapter);
  const hasQuiz = chapterHasQuiz(chapter);

  if (hasPlayableVideo) {
    const videoDone = !!progressByChapter[key]?.completed;
    const quizDone = !hasQuiz || !!quizChapterSummaries[key]?.attempted;
    return videoDone && quizDone;
  }

  if (hasQuiz) {
    return !!quizChapterSummaries[key]?.attempted;
  }

  // Articles / empty items must not block the rest of the course.
  return true;
}

export function countCourseChapterCompletion(
  courseData,
  progressByChapter = {},
  quizChapterSummaries = {},
) {
  let total = 0;
  let completed = 0;

  for (const sec of courseData?.sections || []) {
    for (const ch of sec.chapters || []) {
      const key = chapterKey(ch);
      if (!key) continue;

      const hasPlayableVideo = chapterHasPlayableVideo(ch);
      const hasQuiz = chapterHasQuiz(ch);
      if (!hasPlayableVideo && !hasQuiz) continue;

      total += 1;
      if (isChapterFullyComplete(ch, progressByChapter, quizChapterSummaries)) {
        completed += 1;
      }
    }
  }

  return {
    total,
    completed,
    isComplete: total > 0 && completed === total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
