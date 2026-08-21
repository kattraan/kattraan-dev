/** Quizzes and assignments share Content type `quiz`; mode lives on metadata. */
export function isAssignmentQuizContent(content) {
  return (
    content?.type === "quiz" &&
    content?.metadata?.assessmentMode === "assignment"
  );
}

export function getQuizContentInChapter(chapter) {
  return chapter?.contents?.find((c) => c.type === "quiz") ?? null;
}

/** @returns {'assignment' | 'quiz' | null} */
export function getChapterAssessmentKind(chapter) {
  const quiz = getQuizContentInChapter(chapter);
  if (!quiz) return null;
  return isAssignmentQuizContent(quiz) ? "assignment" : "quiz";
}

export function assessmentLabel(kindOrIsAssignment) {
  if (kindOrIsAssignment === true || kindOrIsAssignment === "assignment") {
    return "Assignment";
  }
  return "Quiz";
}
