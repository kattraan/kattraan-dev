const Course = require('../../models/Course');

/**
 * GET /api/admin/courses/pending
 * List courses with status pending_approval (non-deleted).
 */
async function getPendingCourses(req, res) {
  try {
    const courses = await Course.find({
      status: 'pending_approval',
      isDeleted: { $ne: true },
    })
      .populate('createdBy', 'name userName email')
      .sort({ submittedForReviewAt: -1 })
      .lean();
    return res.json({
      success: true,
      message: 'Pending courses retrieved.',
      data: courses,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/courses/:id/approve
 * Approve course: status = published, approvedAt, approvedBy.
 */
async function approveCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot approve a deleted course.' });
    }
    if (course.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only courses pending approval can be approved.',
        data: { currentStatus: course.status },
      });
    }

    course.status = 'published';
    course.approvedAt = new Date();
    course.approvedBy = req.user._id;
    course.rejectedAt = undefined;
    course.rejectionReason = undefined;
    course.updatedBy = req.user._id;
    await course.save();

    return res.json({
      success: true,
      message: 'Course approved and now live.',
      data: { course: course.toObject() },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/courses/:id/reject
 * Reject course: status = rejected, rejectedAt, rejectionReason (required in body).
 */
async function rejectCourse(req, res) {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !String(rejectionReason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot reject a deleted course.' });
    }
    if (course.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only courses pending approval can be rejected.',
        data: { currentStatus: course.status },
      });
    }

    course.status = 'rejected';
    course.rejectedAt = new Date();
    course.rejectionReason = String(rejectionReason).trim();
    course.approvedAt = undefined;
    course.approvedBy = undefined;
    course.updatedBy = req.user._id;
    await course.save();

    return res.json({
      success: true,
      message: 'Course rejected. Instructor can resubmit after edits.',
      data: { course: course.toObject() },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getPendingCourses,
  approveCourse,
  rejectCourse,
};
