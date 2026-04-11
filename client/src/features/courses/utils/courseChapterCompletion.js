/**
 * Derives per-chapter completion for certificate / overall progress.
 * - Video (or video+quiz) chapters: video must be marked completed in progress.
 * - If the chapter also has a quiz, the learner must have attempted it.
 * - Quiz-only chapters: submission must exist (quizChapterSummaries).
 */
export function countCourseChapterCompletion(
  courseData,
  progressByChapter = {},
  quizChapterSummaries = {},
) {
  let total = 0;
  let completed = 0;

  for (const sec of courseData?.sections || []) {
    for (const ch of sec.chapters || []) {
      const key = ch?._id != null || ch?.id != null ? String(ch._id || ch.id) : "";
      if (!key) continue;

      const hasPlayableVideo = ch.contents?.some(
        (c) => c.type === "video" && (c._id || c.id || c.videoUrl),
      );
      const hasQuiz = ch.contents?.some((c) => c.type === "quiz");
      const quizOnly = !hasPlayableVideo && hasQuiz;

      if (quizOnly) {
        total += 1;
        if (quizChapterSummaries[key]?.attempted) completed += 1;
        continue;
      }

      if (hasPlayableVideo) {
        total += 1;
        const videoDone = !!progressByChapter[key]?.completed;
        const quizDone = !hasQuiz || !!quizChapterSummaries[key]?.attempted;
        if (videoDone && quizDone) completed += 1;
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
