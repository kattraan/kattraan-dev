const Course = require('../../models/Course');
const LearnerCourses = require('../../models/LearnerCourses');
const CourseProgress = require('../../models/CourseProgress');
const User = require('../../models/User');
const ChapterEngagementFeedback = require('../../models/ChapterEngagementFeedback');
const Content = require('../../models/Content');

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
    const { chapterId, from, to } = req.query;

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
    const chapters = sectionList.flatMap((s) =>
      (s.chapters || []).map((ch) => ({
        id: ch._id.toString(),
        title: ch.title,
        order: ch.order,
        sectionId: s._id?.toString() || '',
        sectionTitle: s.title || 'Untitled section',
      })),
    );
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

    const chapterIdFilter = chapterId ? String(chapterId) : null;
    const createdAtFilter = {};
    if (from) createdAtFilter.$gte = new Date(from);
    if (to) createdAtFilter.$lte = new Date(to);

    const feedbackMatch = { courseId };
    if (chapterIdFilter) feedbackMatch.chapterId = chapterIdFilter;
    if (Object.keys(createdAtFilter).length > 0) {
      feedbackMatch.createdAt = createdAtFilter;
    }

    const feedbackDocs = await ChapterEngagementFeedback.find(feedbackMatch)
      .select('chapterId contentId rating createdAt')
      .lean();

    const videoContentIds = [...new Set(feedbackDocs.map((d) => d.contentId?.toString()).filter(Boolean))];
    const videoContentMap = {};
    if (videoContentIds.length > 0) {
      const videoDocs = await Content.find({ _id: { $in: videoContentIds }, type: 'video' })
        .select('_id chapter title')
        .lean();
      videoDocs.forEach((v) => {
        videoContentMap[v._id.toString()] = v;
      });
    }

    const chapterTitleMap = {};
    const chapterSectionMap = {};
    chapters.forEach((c) => {
      chapterTitleMap[c.id] = c.title;
      chapterSectionMap[c.id] = {
        sectionId: c.sectionId || '',
        sectionTitle: c.sectionTitle || 'Untitled section',
      };
    });

    const perVideoMap = new Map();
    const perChapterMap = new Map();
    const dailyTrendMap = new Map();
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    feedbackDocs.forEach((doc) => {
      const rating = Number(doc.rating || 0);
      const cId = doc.contentId?.toString();
      const chId = doc.chapterId?.toString();
      if (!rating || !cId || !chId) return;
      if (distribution[rating] != null) distribution[rating] += 1;

      if (!perVideoMap.has(cId)) {
        perVideoMap.set(cId, { contentId: cId, chapterId: chId, totalScore: 0, totalResponses: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
      const videoBucket = perVideoMap.get(cId);
      videoBucket.totalScore += rating;
      videoBucket.totalResponses += 1;
      videoBucket.distribution[rating] += 1;

      if (!perChapterMap.has(chId)) {
        perChapterMap.set(chId, { chapterId: chId, totalScore: 0, totalResponses: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
      const chapterBucket = perChapterMap.get(chId);
      chapterBucket.totalScore += rating;
      chapterBucket.totalResponses += 1;
      chapterBucket.distribution[rating] += 1;

      const dayKey = new Date(doc.createdAt).toISOString().slice(0, 10);
      if (!dailyTrendMap.has(dayKey)) {
        dailyTrendMap.set(dayKey, { date: dayKey, totalScore: 0, totalResponses: 0 });
      }
      const dayBucket = dailyTrendMap.get(dayKey);
      dayBucket.totalScore += rating;
      dayBucket.totalResponses += 1;
    });

    const perVideo = [...perVideoMap.values()].map((row) => {
      const videoMeta = videoContentMap[row.contentId] || {};
      const lowConfusionShare = row.totalResponses > 0
        ? Math.round((((row.distribution[1] || 0) + (row.distribution[2] || 0)) / row.totalResponses) * 100)
        : 0;
      return {
        contentId: row.contentId,
        chapterId: row.chapterId,
        chapterTitle: chapterTitleMap[row.chapterId] || 'Untitled chapter',
        sectionId: chapterSectionMap[row.chapterId]?.sectionId || '',
        sectionTitle: chapterSectionMap[row.chapterId]?.sectionTitle || 'Untitled section',
        videoTitle: videoMeta.title || 'Untitled video',
        averageScore: row.totalResponses > 0 ? Number((row.totalScore / row.totalResponses).toFixed(2)) : 0,
        totalResponses: row.totalResponses,
        distribution: row.distribution,
        lowConfusionShare,
      };
    });

    const perChapter = [...perChapterMap.values()].map((row) => ({
      chapterId: row.chapterId,
      chapterTitle: chapterTitleMap[row.chapterId] || 'Untitled chapter',
      averageScore: row.totalResponses > 0 ? Number((row.totalScore / row.totalResponses).toFixed(2)) : 0,
      totalResponses: row.totalResponses,
      distribution: row.distribution,
    }));

    const totalResponses = feedbackDocs.length;
    const averageScore = totalResponses > 0
      ? Number((feedbackDocs.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalResponses).toFixed(2))
      : 0;

    const lowPerformingVideos = perVideo
      .filter((v) => v.lowConfusionShare >= 35 || v.averageScore <= 2.7)
      .sort((a, b) => b.lowConfusionShare - a.lowConfusionShare)
      .slice(0, 5);

    const courseAverage = perChapter.length > 0
      ? Number((perChapter.reduce((sum, ch) => sum + ch.averageScore, 0) / perChapter.length).toFixed(2))
      : 0;

    const smartInsights = [];
    if (lowPerformingVideos[0]) {
      smartInsights.push(`${lowPerformingVideos[0].lowConfusionShare}% of learners found "${lowPerformingVideos[0].videoTitle}" confusing.`);
    }
    perChapter.forEach((ch) => {
      if (courseAverage > 0 && ch.averageScore < courseAverage - 0.4) {
        smartInsights.push(`"${ch.chapterTitle}" is below the course average understanding level.`);
      }
    });

    const trend = [...dailyTrendMap.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        date: d.date,
        averageScore: d.totalResponses > 0 ? Number((d.totalScore / d.totalResponses).toFixed(2)) : 0,
        totalResponses: d.totalResponses,
      }));

    res.json({
      success: true,
      data: {
        totalLearners,
        totalChapters,
        completionDistribution,
        averageCompletionRate,
        chapterCompletion,
        leaderboard: leaderboardWithUsers,
        engagementAnalytics: {
          totalResponses,
          averageScore,
          distribution,
          perVideo,
          perChapter,
          lowPerformingVideos,
          trend,
          smartInsights,
          suggestions: [
            'Re-record this video with clearer pacing',
            'Add examples or visuals in confusing sections',
            'Simplify explanation and break into shorter steps',
          ],
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getCourseAnalytics };
