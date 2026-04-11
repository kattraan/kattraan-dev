const Course = require('../../models/Course');
const LearnerCourses = require('../../models/LearnerCourses');
const CourseProgress = require('../../models/CourseProgress');
const User = require('../../models/User');

/**
 * GET /api/instructor/learners
 * Returns all learners enrolled in the authenticated instructor's courses,
 * with per-learner progress aggregated across those courses.
 */
async function getInstructorLearners(req, res) {
  try {
    const instructorId = req.user._id.toString();

    // All courses owned by this instructor
    const courses = await Course.find({ createdBy: instructorId, isDeleted: false })
      .select('_id title thumbnail image')
      .lean();

    if (courses.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const courseIds = courses.map((c) => c._id.toString());
    const courseMap = Object.fromEntries(
      courses.map((c) => [c._id.toString(), c])
    );

    // LearnerCourses docs that contain at least one of these courseIds
    const learnerDocs = await LearnerCourses.find({
      'courses.courseId': { $in: courseIds },
    }).lean();

    // Build per-learner aggregation
    const learnerMap = {};

    for (const doc of learnerDocs) {
      const userId = doc.userId;
      const relevantCourses = doc.courses.filter((c) =>
        courseIds.includes(c.courseId?.toString())
      );
      if (!relevantCourses.length) continue;

      if (!learnerMap[userId]) {
        learnerMap[userId] = { userId, enrolledCourses: [], lastActive: null };
      }

      for (const entry of relevantCourses) {
        const cId = entry.courseId?.toString();
        const progress = await CourseProgress.findOne({
          userId,
          courseId: cId,
        }).lean();

        const chapterProgress = progress?.chapterProgress || [];
        const completedCount = chapterProgress.filter((c) => c.completed).length;
        const totalLessons = entry.totalLessons ?? 0;
        const progressPct =
          totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

        const lastWatched = chapterProgress.reduce((latest, c) => {
          if (!c.lastWatchedAt) return latest;
          const d = new Date(c.lastWatchedAt);
          return !latest || d > latest ? d : latest;
        }, null);

        learnerMap[userId].enrolledCourses.push({
          courseId: cId,
          title: entry.title || courseMap[cId]?.title || 'Untitled',
          thumbnail: courseMap[cId]?.thumbnail || courseMap[cId]?.image || null,
          progress: progressPct,
          completedLessons: completedCount,
          totalLessons,
          dateOfPurchase: entry.dateOfPurchase || null,
          lastWatchedAt: lastWatched,
        });

        if (
          lastWatched &&
          (!learnerMap[userId].lastActive ||
            lastWatched > learnerMap[userId].lastActive)
        ) {
          learnerMap[userId].lastActive = lastWatched;
        }
      }
    }

    // Hydrate with user info
    const userIds = Object.keys(learnerMap);
    const users = await User.find({ _id: { $in: userIds } })
      .select('userName userEmail profileImage')
      .lean();
    const userInfoMap = Object.fromEntries(
      users.map((u) => [u._id.toString(), u])
    );

    const result = userIds.map((userId) => {
      const info = learnerMap[userId];
      const user = userInfoMap[userId] || {};
      const enrolledCourses = info.enrolledCourses;
      const avgProgress =
        enrolledCourses.length > 0
          ? Math.round(
              enrolledCourses.reduce((s, c) => s + c.progress, 0) /
                enrolledCourses.length
            )
          : 0;

      const enrolledSince = enrolledCourses.reduce((earliest, c) => {
        if (!c.dateOfPurchase) return earliest;
        const d = new Date(c.dateOfPurchase);
        return !earliest || d < earliest ? d : earliest;
      }, null);

      return {
        userId,
        name: user.userName || 'Unknown',
        email: user.userEmail || '',
        profileImage: user.profileImage || null,
        courseCount: enrolledCourses.length,
        avgProgress,
        enrolledCourses,
        lastActive: info.lastActive,
        enrolledSince,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getInstructorLearners };
