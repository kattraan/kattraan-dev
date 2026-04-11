const Course = require("../../models/Course");
const Section = require("../../models/Section");
const Chapter = require("../../models/Chapter");
const Content = require("../../models/Content");
const AssignmentSubmission = require("../../models/AssignmentSubmission");

/**
 * GET /api/courses/:id/assignments
 * List assignments (quiz contents) for this course with submission counts. Instructor only.
 */
async function getAssignmentsForCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId)
      .populate({
        path: "sections",
        match: { isDeleted: false },
        populate: {
          path: "chapters",
          match: { isDeleted: false },
          populate: {
            path: "contents",
            match: { isDeleted: false },
          },
        },
      })
      .lean();
    if (!course || course.isDeleted) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const contentIds = [];
    const assignmentMeta = [];
    (course.sections || []).forEach((sec) => {
      (sec.chapters || []).forEach((ch) => {
        (ch.contents || []).forEach((cont) => {
          if (
            cont &&
            cont.type === "quiz" &&
            cont.metadata?.assessmentMode === "assignment"
          ) {
            contentIds.push(cont._id);
            assignmentMeta.push({
              contentId: cont._id,
              title: cont.title || "Untitled Assignment",
              chapterTitle: ch.title,
              sectionTitle: sec.title,
            });
          }
        });
      });
    });

    if (contentIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const counts = await AssignmentSubmission.aggregate([
      { $match: { content: { $in: contentIds } } },
      { $group: { _id: "$content", count: { $sum: 1 } } },
    ]);
    const countByContent = {};
    counts.forEach((c) => {
      countByContent[c._id.toString()] = c.count;
    });

    const assignments = assignmentMeta.map((m) => ({
      id: m.contentId,
      contentId: m.contentId,
      title: m.title,
      chapterTitle: m.chapterTitle,
      sectionTitle: m.sectionTitle,
      submissions: countByContent[m.contentId.toString()] || 0,
    }));

    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/courses/:id/assignments/:contentId/submissions
 * List submissions for one assignment (content). Instructor only.
 */
async function getSubmissionsForAssignment(req, res) {
  try {
    const { id: courseId, contentId } = req.params;
    const content = await Content.findOne({
      _id: contentId,
      type: "quiz",
    })
      .populate("chapter")
      .lean();
    if (!content) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    const chapter = content.chapter;
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    const section = await Section.findById(chapter.section).lean();
    if (!section || section.course.toString() !== courseId) {
      return res.status(404).json({ success: false, message: "Assignment not in this course" });
    }

    const submissions = await AssignmentSubmission.find({
      course: courseId,
      content: contentId,
    })
      .populate("user", "userName userEmail")
      .sort({ submittedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        assignment: {
          _id: content._id,
          title: content.title,
          chapterTitle: chapter.title,
          questions: content.questions || [],
        },
        submissions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/courses/:id/submissions/:submissionId
 * Body: { grade?, instructorFeedback? }
 * Grade a submission. Instructor only.
 */
async function gradeSubmission(req, res) {
  try {
    const { id: courseId, submissionId } = req.params;
    const { grade, instructorFeedback } = req.body || {};

    const submission = await AssignmentSubmission.findOne({
      _id: submissionId,
      course: courseId,
    });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (grade !== undefined) submission.grade = Number(grade);
    if (instructorFeedback !== undefined) submission.instructorFeedback = instructorFeedback;
    submission.status = "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    await submission.save();

    const populated = await AssignmentSubmission.findById(submission._id)
      .populate("user", "userName userEmail")
      .populate("content", "title type");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAssignmentsForCourse,
  getSubmissionsForAssignment,
  gradeSubmission,
};
