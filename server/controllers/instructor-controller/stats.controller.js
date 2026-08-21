const Course = require('../../models/Course');
const LearnerCourses = require('../../models/LearnerCourses');
const CourseReview = require('../../models/CourseReview');
const CourseProgress = require('../../models/CourseProgress');
const Order = require('../../models/Order');
const { paidOrderMatch, paidAmountExpr } = require('../../helpers/coursePrice');

/**
 * GET /api/instructor/stats
 * Returns overview stats for the authenticated instructor's dashboard.
 */
async function getInstructorStats(req, res) {
  try {
    const instructorId = req.user._id;

    // ── courses ──────────────────────────────────────────────────────────
    const courses = await Course.find({ createdBy: instructorId, isDeleted: false })
      .select('_id title thumbnail status learners price discount liveSessions')
      .lean();

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === 'published').length;
    const draftCourses = courses.filter((c) => c.status === 'draft').length;
    const pendingCourses = courses.filter((c) => c.status === 'pending_approval').length;
    const rejectedCourses = courses.filter((c) => c.status === 'rejected').length;

    const courseIds = courses.map((c) => c._id.toString());

    // ── unique learners (from LearnerCourses) ────────────────────────────
    // Each LearnerCourses doc represents one learner; count how many have at
    // least one of the instructor's courseIds in their courses array.
    const learnerDocs = await LearnerCourses.find({
      'courses.courseId': { $in: courseIds },
    })
      .select('userId courses.courseId courses.dateOfPurchase')
      .lean();

    const totalLearners = learnerDocs.length;

    // ── avg watch time (minutes per enrolled learner) ─────────────────────
    let avgWatchMinutes = 0;
    if (courseIds.length > 0 && totalLearners > 0) {
      const progressDocs = await CourseProgress.find({
        courseId: { $in: courseIds },
      })
        .select('chapterProgress.currentTime')
        .lean();

      let totalWatchedSeconds = 0;
      for (const p of progressDocs) {
        for (const ch of p.chapterProgress || []) {
          const t = Number(ch?.currentTime);
          if (Number.isFinite(t) && t > 0) totalWatchedSeconds += t;
        }
      }
      avgWatchMinutes = Math.round((totalWatchedSeconds / 60) / totalLearners);
    }

    const instructorIdStr = instructorId.toString();

    const revenueAgg = await Order.aggregate([
      { $match: { instructorId: instructorIdStr, ...paidOrderMatch() } },
      {
        $group: {
          _id: '$courseId',
          total: { $sum: paidAmountExpr() },
        },
      },
    ]);
    const revenueByCourse = Object.fromEntries(
      revenueAgg.map((row) => [String(row._id), row.total || 0]),
    );
    const totalRevenue = revenueAgg.reduce((sum, row) => sum + (row.total || 0), 0);

    let avgCompletionPercent = 0;
    if (courseIds.length > 0) {
      const completionDocs = await CourseProgress.find({
        courseId: { $in: courseIds },
      })
        .select('completed chapterProgress')
        .lean();

      if (completionDocs.length > 0) {
        const sum = completionDocs.reduce((acc, doc) => {
          if (doc.completed) return acc + 100;
          const chapters = doc.chapterProgress || [];
          if (!chapters.length) return acc;
          const chapterAvg =
            chapters.reduce((s, ch) => s + (Number(ch.watchedPercentage) || 0), 0) /
            chapters.length;
          return acc + chapterAvg;
        }, 0);
        avgCompletionPercent = Math.round(sum / completionDocs.length);
      }
    }

    // ── ratings ──────────────────────────────────────────────────────────
    const reviews = await CourseReview.find({
      course: { $in: courseIds },
    })
      .select('rating course')
      .lean();

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
          ) / 10
        : null;

    // ── top courses by learner count ─────────────────────────────────────
    const topCourses = [...courses]
      .sort((a, b) => (b.learners || 0) - (a.learners || 0))
      .slice(0, 5)
      .map((c) => ({
        courseId: c._id,
        title: c.title,
        thumbnail: c.thumbnail || null,
        status: c.status,
        learners: c.learners || 0,
        price: c.price || 0,
        discount: c.discount || 0,
        revenue: revenueByCourse[c._id.toString()] || 0,
      }));

    // ── recent enrollments ───────────────────────────────────────────────
    // Flatten all relevant enrollments, sort by date, take last 5
    const recentEnrollments = [];
    for (const doc of learnerDocs) {
      for (const entry of doc.courses || []) {
        if (!courseIds.includes(entry.courseId?.toString())) continue;
        const course = courses.find((c) => c._id.toString() === entry.courseId?.toString());
        recentEnrollments.push({
          userId: doc.userId,
          courseId: entry.courseId,
          courseTitle: course?.title || 'Untitled',
          date: entry.dateOfPurchase || null,
        });
      }
    }
    recentEnrollments.sort((a, b) => new Date(b.date) - new Date(a.date));

    const allottedLiveSessions = [];
    for (const course of courses) {
      for (const session of course.liveSessions || []) {
        const start = session.scheduledAt ? new Date(session.scheduledAt) : null;
        if (!start || Number.isNaN(start.getTime())) continue;
        const durationMinutes =
          Number(session.durationMinutes) > 0 ? Number(session.durationMinutes) : 60;
        const end = session.scheduledEnd
          ? new Date(session.scheduledEnd)
          : new Date(start.getTime() + durationMinutes * 60_000);
        if (Number.isNaN(end.getTime())) continue;
        allottedLiveSessions.push({
          _id: session._id,
          courseId: course._id,
          courseTitle: course.title || 'Untitled course',
          title: session.title || 'Live session',
          meetingUrl: session.meetingUrl || '',
          scheduledAt: start.toISOString(),
          scheduledEnd: end.toISOString(),
          durationMinutes,
        });
      }
    }
    allottedLiveSessions.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    const upcomingLiveCount = allottedLiveSessions.filter(
      (s) => new Date(s.scheduledEnd).getTime() >= Date.now(),
    ).length;

    res.json({
      success: true,
      data: {
        totalLearners,
        totalCourses,
        publishedCourses,
        draftCourses,
        pendingCourses,
        rejectedCourses,
        totalRevenue: Math.round(totalRevenue),
        avgWatchMinutes,
        avgCompletionPercent,
        avgRating,
        totalReviews,
        topCourses,
        recentEnrollments: recentEnrollments.slice(0, 5),
        allottedLiveSessions,
        upcomingLiveCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getInstructorStats };
