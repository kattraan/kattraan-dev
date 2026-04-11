const LearnerCourses = require("../../models/LearnerCourses");
const Course = require("../../models/Course");
const Section = require("../../models/Section");
const Chapter = require("../../models/Chapter");
const Content = require("../../models/Content");
const AssignmentSubmission = require("../../models/AssignmentSubmission");

/** Only these appear on GET /learner/assignments (dashboard). Lesson quizzes use the course player only. */
function isGradedAssignmentQuizContent(cont) {
  return (
    cont &&
    cont.type === "quiz" &&
    !cont.isDeleted &&
    cont.metadata?.assessmentMode === "assignment"
  );
}

function normalizeSelectedIndexes(answerEntry = {}, questionType = "single") {
  if (questionType === "single") {
    return Number.isInteger(answerEntry.single) ? [answerEntry.single] : [];
  }
  if (questionType === "multiple") {
    return Array.isArray(answerEntry.multiple)
      ? answerEntry.multiple.filter((i) => Number.isInteger(i)).sort((a, b) => a - b)
      : [];
  }
  return [];
}

function indexesEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function evaluateQuizSubmission(content, submissionTextRaw) {
  let parsed = {};
  try {
    parsed = submissionTextRaw ? JSON.parse(submissionTextRaw) : {};
  } catch {
    parsed = {};
  }

  const answersList = Array.isArray(parsed?.answers) ? parsed.answers : [];
  const answerByQuestionIndex = {};
  answersList.forEach((a) => {
    if (Number.isInteger(a?.questionIndex)) {
      answerByQuestionIndex[a.questionIndex] = a;
    }
  });

  const questions = Array.isArray(content.questions) ? content.questions : [];
  const passingPercentage = Number(content?.metadata?.passingPercentage) || 0;
  const enforcePassingGrade = !!content?.metadata?.enforcePassingGrade;
  const allowRetake = !!content?.metadata?.allowRetake;

  const evaluatedQuestions = [];
  let totalMarks = 0;
  let earnedMarks = 0;
  let hasSubjective = false;

  questions.forEach((q, questionIndex) => {
    const type = q?.type || "single";
    const marks = Number(q?.marks) || 1;
    totalMarks += marks;

    const answerEntry = answerByQuestionIndex[questionIndex] || {};
    if (type === "subjective") {
      hasSubjective = true;
      evaluatedQuestions.push({
        questionIndex,
        question: q?.question || "",
        type,
        marks,
        selectedOptionIndexes: [],
        correctOptionIndexes: [],
        isCorrect: null,
        earnedMarks: 0,
      });
      return;
    }

    const selectedOptionIndexes = normalizeSelectedIndexes(answerEntry, type);
    const optionTexts = Array.isArray(q?.options) ? q.options : [];
    const correctOptionIndexes =
      type === "single"
        ? (Number.isInteger(q?.correctAnswer) ? [q.correctAnswer] : [])
        : (Array.isArray(q?.correctAnswers)
            ? q.correctAnswers.filter((i) => Number.isInteger(i)).sort((a, b) => a - b)
            : []);

    const isCorrect = indexesEqual(selectedOptionIndexes, correctOptionIndexes);
    const questionEarnedMarks = isCorrect ? marks : 0;
    earnedMarks += questionEarnedMarks;

    evaluatedQuestions.push({
      questionIndex,
      question: q?.question || "",
      type,
      marks,
      optionTexts,
      selectedOptionIndexes,
      correctOptionIndexes,
      isCorrect,
      earnedMarks: questionEarnedMarks,
    });
  });

  const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  // Always compute pass/fail from score vs instructor passing percentage.
  // enforcePassingGrade can be used for progression gates, but pass label must stay truthful.
  const passed = percentage >= passingPercentage;

  return {
    type: "quiz",
    autoEvaluated: !hasSubjective,
    hasSubjective,
    totalMarks,
    earnedMarks,
    percentage,
    passingPercentage,
    enforcePassingGrade,
    allowRetake,
    passed,
    /** Learner may submit another attempt when the instructor enabled retakes (server still enforces pass + enforce + !allow edge cases). */
    canRetake: !!allowRetake,
    questions: evaluatedQuestions,
    submittedAt: new Date(),
  };
}

/**
 * GET /api/learner/assignments/by-content/:contentId
 * Submission for one quiz content (lesson quiz or graded assignment) if the user is enrolled.
 */
async function getAssignmentSubmissionForContent(req, res) {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;

    const content = await Content.findById(contentId).populate("chapter").lean();
    if (!content || content.type !== "quiz" || content.isDeleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    const chapter = content.chapter;
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    const section = await Section.findById(chapter.section).lean();
    if (!section) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    const courseId = section.course;

    const learnerDoc = await LearnerCourses.findOne({ userId: userId.toString() });
    const enrolled = learnerDoc?.courses?.some(
      (c) => c.courseId && c.courseId.toString() === courseId.toString()
    );
    if (!enrolled) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
    }

    const sub = await AssignmentSubmission.findOne({
      user: userId,
      content: contentId,
    }).lean();

    res.json({
      success: true,
      data: {
        submission: sub
          ? {
              _id: sub._id,
              status: sub.status,
              submittedAt: sub.submittedAt,
              attemptCount: sub.attemptCount || 0,
              latestEvaluation: sub.latestEvaluation || null,
              passed: !!sub.passed,
              grade: sub.grade,
              instructorFeedback: sub.instructorFeedback,
            }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/learner/assignments
 * Graded assignments only (metadata.assessmentMode === 'assignment'). Lesson quizzes are not listed here.
 */
async function getMyAssignments(req, res) {
  try {
    const userId = req.user._id.toString();
    const learnerDoc = await LearnerCourses.findOne({ userId }).lean();
    const enrolledCourseIds = (learnerDoc?.courses || [])
      .map((c) => c.courseId)
      .filter(Boolean);
    if (enrolledCourseIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const courses = await Course.find({
      _id: { $in: enrolledCourseIds },
      isDeleted: { $ne: true },
    })
      .populate("sections")
      .lean();
    const sectionIds = [];
    courses.forEach((c) => {
      (c.sections || []).forEach((s) => {
        if (s && !s.isDeleted) sectionIds.push(s._id);
      });
    });
    if (sectionIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const chapters = await Chapter.find({
      section: { $in: sectionIds },
      isDeleted: { $ne: true },
    })
      .populate("contents")
      .lean();
    const contentIds = [];
    chapters.forEach((ch) => {
      (ch.contents || []).forEach((cont) => {
        if (isGradedAssignmentQuizContent(cont)) {
          contentIds.push(cont._id);
        }
      });
    });
    if (contentIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const courseBySection = {};
    const courseTitles = {};
    courses.forEach((c) => {
      courseTitles[c._id.toString()] = c.title;
      (c.sections || []).forEach((s) => {
        if (s) {
          courseBySection[s._id.toString()] = c._id;
        }
      });
    });

    const submissions = await AssignmentSubmission.find({
      user: userId,
      content: { $in: contentIds },
    }).lean();

    const submissionByContent = {};
    submissions.forEach((s) => {
      submissionByContent[s.content.toString()] = s;
    });

    const assignments = [];
    for (const ch of chapters) {
      const courseId = ch.section ? courseBySection[ch.section.toString()] : null;
      const courseTitle = courseId ? courseTitles[courseId.toString()] : "Course";
      for (const cont of ch.contents || []) {
        if (!isGradedAssignmentQuizContent(cont)) continue;
        const sub = submissionByContent[cont._id.toString()];
        const questions = (cont.questions || []).map((q) => ({
          question: q.question,
          type: q.type || "single",
          options: q.options || [],
          marks: q.marks,
          image: q.image,
          _id: q._id,
        }));
        assignments.push({
          _id: cont._id,
          contentId: cont._id,
          title: cont.title || "Untitled Assignment",
          description: cont.description,
          courseId: courseId || ch.course,
          courseTitle,
          chapterId: ch._id,
          chapterTitle: ch.title || "Chapter",
          dueDate: cont.dueDate || null,
          points: (cont.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0) || 100,
          questions,
          isMcq: questions.length > 0,
          status: sub ? (sub.status === "graded" ? "Graded" : sub.status === "submitted" ? "Submitted" : "Pending") : "Pending",
          quizSettings: {
            passingPercentage: Number(cont?.metadata?.passingPercentage) || 0,
            enforcePassingGrade: !!cont?.metadata?.enforcePassingGrade,
            allowRetake: !!cont?.metadata?.allowRetake,
            assessmentMode:
              cont?.metadata?.assessmentMode === "assignment"
                ? "assignment"
                : "quiz",
          },
          submission: sub
            ? {
                _id: sub._id,
                status: sub.status,
                submittedAt: sub.submittedAt,
                attemptCount: sub.attemptCount || 0,
                latestEvaluation: sub.latestEvaluation || null,
                passed: !!sub.passed,
                grade: sub.grade,
                instructorFeedback: sub.instructorFeedback,
              }
            : null,
        });
      }
    }

    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/learner/assignments/:contentId/submit
 * Body: { submissionText?, submissionFileUrl? }
 * Create or update submission for this assignment (content).
 */
async function submitAssignment(req, res) {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;
    const { submissionText, submissionFileUrl } = req.body || {};

    const content = await Content.findById(contentId)
      .populate("chapter")
      .lean();
    if (!content || content.type !== "quiz" || content.isDeleted) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    const chapter = content.chapter;
    if (!chapter) {
      return res.status(400).json({ success: false, message: "Invalid assignment" });
    }
    const section = await Section.findById(chapter.section).lean();
    if (!section) {
      return res.status(400).json({ success: false, message: "Invalid assignment" });
    }
    const courseId = section.course;

    const learnerDoc = await LearnerCourses.findOne({ userId: userId.toString() });
    const enrolled = learnerDoc?.courses?.some(
      (c) => c.courseId && c.courseId.toString() === courseId.toString()
    );
    if (!enrolled) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
    }

    let submission = await AssignmentSubmission.findOne({
      user: userId,
      content: contentId,
    });

    const incomingText =
      submissionText !== undefined
        ? submissionText
        : (submission?.submissionText || "");
    const quizEvaluation = evaluateQuizSubmission(content, incomingText);

    if (submission) {
      // Retake policy enforcement for quizzes.
      if (
        quizEvaluation.enforcePassingGrade &&
        submission.passed &&
        !quizEvaluation.allowRetake
      ) {
        return res.status(400).json({
          success: false,
          message: "This assignment is already passed. Retake is disabled by the instructor.",
        });
      }
      if (
        quizEvaluation.enforcePassingGrade &&
        !submission.passed &&
        submission.attemptCount > 0 &&
        !quizEvaluation.allowRetake
      ) {
        return res.status(400).json({
          success: false,
          message: "Retake is disabled by the instructor.",
        });
      }
    }

    if (submission) {
      submission.submissionText = submissionText !== undefined ? submissionText : submission.submissionText;
      submission.submissionFileUrl = submissionFileUrl !== undefined ? submissionFileUrl : submission.submissionFileUrl;
      submission.status = "graded";
      submission.submittedAt = new Date();
      submission.attemptCount = (submission.attemptCount || 0) + 1;
      submission.latestEvaluation = quizEvaluation;
      submission.passed = !!quizEvaluation.passed;
      submission.grade = quizEvaluation.percentage;
      submission.gradedAt = new Date();
      submission.gradedBy = null;
    } else {
      submission = new AssignmentSubmission({
        user: userId,
        content: contentId,
        course: courseId,
        chapter: chapter._id,
        status: "graded",
        submissionText: submissionText || "",
        submissionFileUrl: submissionFileUrl || "",
        attemptCount: 1,
        latestEvaluation: quizEvaluation,
        passed: !!quizEvaluation.passed,
        grade: quizEvaluation.percentage,
        gradedAt: new Date(),
        gradedBy: null,
      });
    }
    await submission.save();

    const populated = await AssignmentSubmission.findById(submission._id)
      .populate("content", "title type")
      .populate("course", "title")
      .populate("chapter", "title");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getMyAssignments,
  submitAssignment,
  getAssignmentSubmissionForContent,
};
