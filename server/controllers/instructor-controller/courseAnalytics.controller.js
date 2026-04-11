const Course = require('../../models/Course');
const LearnerCourses = require('../../models/LearnerCourses');
const CourseProgress = require('../../models/CourseProgress');
const User = require('../../models/User');

const COMPLETION_BUCKETS = [
  { key: '0-1%', min: 0, max: 1 },
  { key: '1-25%', min: 1, max: 25 },
  { key: '26-50%', min: 26, max: 50 },
  { key: '51-75%', min: 51, max: 75 },
  { key: '76-99%', min: 76, max: 99 },
  { key: '100%', min: 100, max: 100 },
];

function bucketForPercent(pct) {
  if (pct <= 1) return '0-1%';
  if (pct <= 25) return '1-25%';
  if (pct <= 50) return '26-50%';
  if (pct <= 75) return '51-75%';
  if (pct < 100) return '76-99%';
  return '100%';
}

/**
 * GET /api/courses/:id/analytics
 * Returns course analytics for the instructor (completion distribution, chapter completion, leaderboard).
 * Must be course owner (enforced by requireCourseOwner on route).
 */
async function getCourseAnalytics(req, res) {
  try {
    const courseId = req.params.id;

    const course = await Course.findOne({ _id: courseId, isDeleted: false })
      .populate({
        path: 'sections',
        match: { isDeleted: false },
        populate: {
          path: 'chapters',
          match: { isDeleted: false },
          select: '_id title order',
        },
      })
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const sectionList = course.sections || [];
    const chapters = sectionList.flatMap((s) => (s.chapters || []).map((ch) => ({ id: ch._id.toString(), title: ch.title, order: ch.order })));
    const totalChapters = chapters.length;

    const learnerDocs = await LearnerCourses.find({ 'courses.courseId': courseId })
      .select('userId courses.courseId courses.dateOfPurchase')
      .lean();

    const enrolledUserIds = [];
    const purchasedAtByUser = {};
    for (const doc of learnerDocs) {
      for (const entry of doc.courses || []) {
        if (entry.courseId?.toString() !== courseId) continue;
        enrolledUserIds.push(doc.userId);
        purchasedAtByUser[doc.userId] = entry.dateOfPurchase || null;
      }
    }

    const uniqueUserIds = [...new Set(enrolledUserIds)];
    const totalLearners = uniqueUserIds.length;

    const progressDocs = await CourseProgress.find({ courseId }).lean();

    const progressByUser = {};
    for (const p of progressDocs) {
      const uid = p.userId?.toString();
      const completedCount = (p.chapterProgress || []).filter((c) => c.completed).length;
      const pct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
      const lastWatched = (p.chapterProgress || [])
        .reduce((latest, c) => {
          if (!c.lastWatchedAt) return latest;
          const d = new Date(c.lastWatchedAt);
          return !latest || d > latest ? d : latest;
        }, null);
      progressByUser[uid] = {
        completedCount,
        pct,
        lastWatchedAt: lastWatched,
        chapterProgress: p.chapterProgress || [],
      };
    }

    const completionDistribution = {};
    COMPLETION_BUCKETS.forEach((b) => { completionDistribution[b.key] = 0; });

    let sumPct = 0;
    let countWithProgress = 0;
    for (const uid of uniqueUserIds) {
      const prog = progressByUser[uid];
      const pct = prog ? prog.pct : 0;
      const key = bucketForPercent(pct);
      completionDistribution[key] = (completionDistribution[key] || 0) + 1;
      sumPct += pct;
      countWithProgress += 1;
    }

    const averageCompletionRate = totalLearners > 0 ? Math.round(sumPct / totalLearners) : 0;

    const chapterCompletion = chapters.map((ch) => {
      let completedCount = 0;
      for (const p of progressDocs) {
        const cp = (p.chapterProgress || []).find((c) => c.chapterId === ch.id);
        if (cp && cp.completed) completedCount++;
      }
      return {
        chapterId: ch.id,
        title: ch.title,
        order: ch.order,
        completedCount,
        totalLearners,
        percent: totalLearners > 0 ? Math.round((completedCount / totalLearners) * 100) : 0,
      };
    });

    const leaderboard = [];
    for (const uid of uniqueUserIds) {
      const prog = progressByUser[uid];
      leaderboard.push({
        userId: uid,
        completionPercent: prog ? prog.pct : 0,
        purchasedAt: purchasedAtByUser[uid] || null,
        lastProgressAt: prog?.lastWatchedAt || null,
      });
    }
    leaderboard.sort((a, b) => {
      if (b.completionPercent !== a.completionPercent) return b.completionPercent - a.completionPercent;
      const aDate = a.lastProgressAt ? new Date(a.lastProgressAt).getTime() : 0;
      const bDate = b.lastProgressAt ? new Date(b.lastProgressAt).getTime() : 0;
      return bDate - aDate;
    });

    const userIds = leaderboard.map((e) => e.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('userName userEmail')
      .lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const leaderboardWithUsers = leaderboard.map((row, idx) => {
      const u = userMap[row.userId] || {};
      return {
        rank: idx + 1,
        userId: row.userId,
        name: u.userName || 'Unknown',
        email: u.userEmail || '',
        completionPercent: row.completionPercent,
        purchasedAt: row.purchasedAt,
        lastProgressAt: row.lastProgressAt,
      };
    });

    res.json({
      success: true,
      data: {
        totalLearners,
        totalChapters,
        completionDistribution,
        averageCompletionRate,
        chapterCompletion,
        leaderboard: leaderboardWithUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getCourseAnalytics };
