const mongoose = require('mongoose');
const Course = require('../../models/Course');
const CourseReview = require('../../models/CourseReview');
const LearnerCourses = require('../../models/LearnerCourses');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

async function getPublishedCourseLean(courseId) {
  return Course.findOne({
    _id: courseId,
    isDeleted: { $ne: true },
    status: 'published',
  })
    .select('_id')
    .lean();
}

async function isUserEnrolled(userId, courseId) {
  const doc = await LearnerCourses.findOne({
    userId: userId.toString(),
    'courses.courseId': courseId.toString(),
  })
    .select('_id')
    .lean();
  return !!doc;
}

function serializePublicReview(doc, populatedUser) {
  const name = populatedUser?.userName?.trim() || 'Learner';
  return {
    id: doc._id.toString(),
    rating: doc.rating,
    comment: doc.comment || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt || doc.createdAt,
    authorName: name,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    pinned: !!doc.pinned,
    instructorReply: doc.instructorReply?.message
      ? {
          message: doc.instructorReply.message,
          instructorName: doc.instructorReply.instructorName || 'Instructor',
          createdAt: doc.instructorReply.createdAt || null,
          updatedAt: doc.instructorReply.updatedAt || doc.instructorReply.createdAt || null,
        }
      : null,
  };
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of tags) {
    const t = String(raw || '').trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t.slice(0, 40));
  }
  return out.slice(0, 8);
}

/**
 * GET /api/courses/:id/reviews — public list + aggregates (published courses only).
 */
exports.listReviews = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await getPublishedCourseLean(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const courseOid = new mongoose.Types.ObjectId(String(courseId));

    const [stats] = await CourseReview.aggregate([
      { $match: { course: courseOid } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const totalCount = stats?.count || 0;
    const averageRating =
      totalCount > 0 ? Math.round(stats.avg * 10) / 10 : 0;

    const distRows = await CourseReview.aggregate([
      { $match: { course: courseOid } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distRows.forEach((row) => {
      if (row._id >= 1 && row._id <= 5) starCounts[row._id] = row.count;
    });

    const breakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = starCounts[stars] || 0;
      const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { stars, count, percent };
    });

    const rows = await CourseReview.find({ course: courseOid })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'userName')
      .lean();

    const reviews = rows.map((r) => serializePublicReview(r, r.user));
    const positiveCount = (starCounts[4] || 0) + (starCounts[5] || 0);
    const negativeCount = (starCounts[1] || 0) + (starCounts[2] || 0);
    const neutralCount = starCounts[3] || 0;
    const positivePercent = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;
    const negativePercent = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;
    const neutralPercent = totalCount > 0 ? Math.round((neutralCount / totalCount) * 100) : 0;

    const topTagsRows = await CourseReview.aggregate([
      { $match: { course: courseOid } },
      { $unwind: '$tags' },
      { $match: { tags: { $type: 'string', $ne: '' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);
    const topTags = topTagsRows.map((r) => ({ tag: r._id, count: r.count }));

    const trendRows = await CourseReview.aggregate([
      { $match: { course: courseOid } },
      {
        $project: {
          rating: 1,
          d: { $ifNull: ['$updatedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$d' },
            month: { $month: '$d' },
          },
          count: { $sum: 1 },
          ratingSum: { $sum: '$rating' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const trend = trendRows.map((r) => ({
      month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
      count: r.count,
      averageRating: r.count > 0 ? Math.round((r.ratingSum / r.count) * 10) / 10 : 0,
    }));

    return res.json({
      success: true,
      data: {
        reviews,
        averageRating,
        totalCount,
        breakdown,
        page,
        limit,
        totalPages: totalCount ? Math.ceil(totalCount / limit) : 0,
        sentiment: {
          positivePercent,
          neutralPercent,
          negativePercent,
          positiveCount,
          neutralCount,
          negativeCount,
        },
        topTags,
        trend,
      },
    });
  } catch (err) {
    console.error('listReviews', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to load reviews' });
  }
};

/**
 * GET /api/courses/:id/reviews/mine — current user's review for this course (auth).
 */
exports.getMyReview = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await getPublishedCourseLean(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const review = await CourseReview.findOne({
      course: courseId,
      user: req.user._id,
    }).lean();

    if (!review) {
      return res.json({ success: true, data: null });
    }

    return res.json({
      success: true,
      data: {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment || '',
        tags: Array.isArray(review.tags) ? review.tags : [],
        createdAt: review.createdAt,
        updatedAt: review.updatedAt || review.createdAt,
      },
    });
  } catch (err) {
    console.error('getMyReview', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to load your review' });
  }
};

/**
 * POST /api/courses/:id/reviews — enrolled learners only (auth).
 */
exports.createReview = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await getPublishedCourseLean(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrolled = await isUserEnrolled(req.user._id, courseId);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'Only enrolled students can review this course',
      });
    }

    const existing = await CourseReview.findOne({ course: courseId, user: req.user._id })
      .select('_id')
      .lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this course',
      });
    }

    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    const tags = normalizeTags(req.body.tags);

    const review = await CourseReview.create({
      course: courseId,
      user: req.user._id,
      rating,
      comment,
      tags,
    });

    await Course.findByIdAndUpdate(courseId, { $addToSet: { reviews: review._id } });

    return res.status(201).json({
      success: true,
      data: {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment || '',
        tags: Array.isArray(review.tags) ? review.tags : [],
        createdAt: review.createdAt,
        updatedAt: review.updatedAt || review.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this course',
      });
    }
    console.error('createReview', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to submit review' });
  }
};

/**
 * PATCH /api/courses/:id/reviews/mine — update own review (auth, enrolled).
 */
exports.updateMyReview = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await getPublishedCourseLean(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrolled = await isUserEnrolled(req.user._id, courseId);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'Only enrolled students can update a review',
      });
    }

    const review = await CourseReview.findOne({ course: courseId, user: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'No review found to update' });
    }

    if (req.body.rating !== undefined) {
      review.rating = Number(req.body.rating);
    }
    if (req.body.comment !== undefined) {
      review.comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    }
    if (req.body.tags !== undefined) {
      review.tags = normalizeTags(req.body.tags);
    }
    await review.save();

    return res.json({
      success: true,
      data: {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment || '',
        tags: Array.isArray(review.tags) ? review.tags : [],
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (err) {
    console.error('updateMyReview', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to update review' });
  }
};

/**
 * DELETE /api/courses/:id/reviews/mine — remove own review (auth, enrolled).
 */
exports.deleteMyReview = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await getPublishedCourseLean(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrolled = await isUserEnrolled(req.user._id, courseId);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'Only enrolled students can delete their review',
      });
    }

    const review = await CourseReview.findOneAndDelete({
      course: courseId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'No review found to delete' });
    }

    await Course.findByIdAndUpdate(courseId, { $pull: { reviews: review._id } });

    return res.json({ success: true, message: 'Review removed' });
  } catch (err) {
    console.error('deleteMyReview', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete review' });
  }
};

/**
 * PATCH /api/courses/:id/reviews/:reviewId/meta — instructor owner can reply/pin.
 */
exports.updateInstructorReviewMeta = async (req, res) => {
  try {
    const { id: courseId, reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    const review = await CourseReview.findOne({ _id: reviewId, course: courseId }).populate('user', 'userName').exec();
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.body.pinned !== undefined) {
      review.pinned = !!req.body.pinned;
    }

    if (req.body.reply !== undefined) {
      const reply = String(req.body.reply || '').trim();
      if (reply) {
        review.instructorReply = {
          message: reply,
          instructorId: req.user._id,
          instructorName: req.user?.userName || 'Instructor',
          createdAt: review.instructorReply?.createdAt || new Date(),
          updatedAt: new Date(),
        };
      } else {
        review.instructorReply = undefined;
      }
    }

    await review.save();

    return res.json({
      success: true,
      data: serializePublicReview(review.toObject(), review.user),
    });
  } catch (err) {
    console.error('updateInstructorReviewMeta', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update review meta' });
  }
};
