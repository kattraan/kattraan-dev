const mongoose = require('mongoose');
const LearnerCourses = require('../../models/LearnerCourses');
const CourseProgress = require('../../models/CourseProgress');
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');

/** Deduped ObjectIds from enrollment rows so Course.find($in) always matches stored courses. */
function enrollmentCourseObjectIds(courseEntries) {
  const seen = new Set();
  const oids = [];
  for (const entry of courseEntries || []) {
    const raw = entry?.courseId;
    if (raw == null) continue;
    const s = String(raw).trim();
    if (!mongoose.isValidObjectId(s)) continue;
    const id = new mongoose.Types.ObjectId(s);
    const key = id.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    oids.push(id);
  }
  return oids;
}

/**
 * GET /api/learner/courses
 * Returns the authenticated learner's enrolled courses with progress.
 */
async function getMyCourses(req, res) {
  try {
    const userId = req.user._id.toString();
    const doc = await LearnerCourses.findOne({ userId }).lean();
    const courseList = doc?.courses || [];

    const courseIds = [...new Set(courseList.map((entry) => String(entry.courseId)).filter(Boolean))];
    const progressRows = courseIds.length
      ? await CourseProgress.find({ userId, courseId: { $in: courseIds } }).lean()
      : [];
    const courseDocs = courseIds.length
      ? await Course.find({ _id: { $in: courseIds } }).select('duration').lean()
      : [];
    const durationByCourseId = new Map(
      courseDocs.map((c) => [String(c._id), c.duration]),
    );
    const progressByCourseId = new Map(
      progressRows.map((progress) => [String(progress.courseId), progress]),
    );

    const result = courseList.map((entry) => {
        const progress = progressByCourseId.get(String(entry.courseId));
        const chapterProgress = progress?.chapterProgress || [];
        const completedCount = chapterProgress.filter((c) => c.completed).length;
        const totalLessons = entry.totalLessons ?? 0;
        const isCompleted = !!(progress && progress.completed);
        const progressPercent = isCompleted
          ? 100
          : totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

        let lastWatchedAt = null;
        let lastWatchedChapterId = null;
        for (const ch of chapterProgress) {
          if (!ch.lastWatchedAt) continue;
          const watchedAt = new Date(ch.lastWatchedAt);
          if (Number.isNaN(watchedAt.getTime())) continue;
          if (!lastWatchedAt || watchedAt > lastWatchedAt) {
            lastWatchedAt = watchedAt;
            lastWatchedChapterId = ch.chapterId || null;
          }
        }

        return {
          id: entry.courseId,
          courseId: entry.courseId,
          title: entry.title || 'Untitled Course',
          instructor: entry.instructorName || 'Instructor',
          progress: progressPercent,
          totalLessons,
          completedLessons: completedCount,
          status: isCompleted ? 'Completed' : 'In Progress',
          completed: isCompleted,
          completionDate: progress?.completionDate || null,
          durationMinutes: durationByCourseId.get(String(entry.courseId)) ?? null,
          image: entry.courseImage || null,
          dateOfPurchase: entry.dateOfPurchase,
          lastWatchedAt: lastWatchedAt ? lastWatchedAt.toISOString() : null,
          lastWatchedChapterId,
        };
      });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/learner/courses/check/:courseId
 * Returns whether the authenticated user is enrolled in the given course.
 */
async function checkEnrollment(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }
    const doc = await LearnerCourses.findOne({ userId }).lean();
    const enrolled = doc?.courses?.some(
      (c) => (c.courseId && c.courseId.toString()) === courseId.toString()
    );
    return res.json({ success: true, enrolled: !!enrolled });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/learner/courses/enroll
 * Body: { courseId }
 * Enrolls the authenticated learner in a course (e.g. free or after payment).
 */
async function enrollCourse(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    const course = await Course.findById(courseId)
      .populate('createdBy', 'userName')
      .lean();
    if (!course || course.isDeleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (String(course.status) !== 'published') {
      return res.status(400).json({ success: false, message: 'Course is not available for enrollment' });
    }

    const price = Number(course.price) || 0;
    if (price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a paid course. Complete checkout to enroll.',
      });
    }

    const sectionIds = (course.sections || []).map((s) => s && s.toString()).filter(Boolean);
    const totalLessons = sectionIds.length
      ? await Chapter.countDocuments({ section: { $in: sectionIds }, isDeleted: { $ne: true } })
      : 0;

    const instructorName =
      course.createdBy?.userName || course.instructor?.name || 'Instructor';
    const courseIdStr = course._id.toString();
    const enrollment = {
      courseId: courseIdStr,
      title: course.title || 'Untitled Course',
      instructorId: course.createdBy?._id?.toString() || '',
      instructorName,
      dateOfPurchase: new Date(),
      courseImage: course.thumbnail || course.image || course.thumbnailUrl || '',
      totalLessons,
    };

    // Atomic upsert + conditional push (same locking pattern as paid fulfillment).
    // Concurrent free-enroll requests cannot duplicate the course or inflate learners.
    await LearnerCourses.updateOne(
      { userId },
      { $setOnInsert: { userId, courses: [] } },
      { upsert: true },
    );

    const enrollmentResult = await LearnerCourses.updateOne(
      { userId, 'courses.courseId': { $ne: courseIdStr } },
      { $push: { courses: enrollment } },
    );

    const doc = await LearnerCourses.findOne({ userId }).lean();

    if (enrollmentResult.modifiedCount !== 1) {
      return res.json({ success: true, message: 'Already enrolled', data: doc });
    }

    await Course.updateOne({ _id: courseId }, { $inc: { learners: 1 } });

    res.status(201).json({ success: true, message: 'Enrolled successfully', data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function sessionEndMs(scheduledAt, scheduledEnd, durationMinutes) {
  const start = new Date(scheduledAt).getTime();
  if (Number.isNaN(start)) return NaN;
  const endDate = scheduledEnd ? new Date(scheduledEnd).getTime() : NaN;
  if (!Number.isNaN(endDate) && endDate > start) return endDate;
  const durMin = Number(durationMinutes) > 0 ? Number(durationMinutes) : 60;
  return start + durMin * 60 * 1000;
}

const JOIN_WINDOW_MS = 30 * 60 * 1000;

/**
 * Join link is active from 30 minutes before start through session end (Tagmango-style).
 * joinStatus is "live" only during the scheduled start–end window.
 */
function computeLiveSessionUiState(scheduledAt, scheduledEnd, durationMinutes, now = new Date()) {
  const start = new Date(scheduledAt).getTime();
  if (Number.isNaN(start)) {
    return { joinStatus: 'scheduled', canJoin: false, learnerStatus: 'upcoming' };
  }
  const end = sessionEndMs(scheduledAt, scheduledEnd, durationMinutes);
  if (Number.isNaN(end)) {
    return { joinStatus: 'scheduled', canJoin: false, learnerStatus: 'upcoming' };
  }
  const t = now.getTime();
  if (t > end) return { joinStatus: 'ended', canJoin: false, learnerStatus: 'completed' };
  const joinOpensAt = start - JOIN_WINDOW_MS;
  const canJoin = t >= joinOpensAt && t <= end;
  const joinStatus = t >= start && t <= end ? 'live' : 'scheduled';
  return { joinStatus, canJoin, learnerStatus: 'upcoming' };
}

/**
 * GET /api/learner/courses/live-sessions
 * Flattened upcoming/past live sessions for enrolled courses only.
 */
async function getMyLiveSessions(req, res) {
  try {
    const userId = req.user._id.toString();
    const doc = await LearnerCourses.findOne({ userId }).lean();
    const objectIds = enrollmentCourseObjectIds(doc?.courses || []);
    if (!objectIds.length) {
      res.set('Cache-Control', 'private, no-store, must-revalidate');
      return res.json({ success: true, data: [] });
    }

    const courses = await Course.find({
      _id: { $in: objectIds },
      isDeleted: { $ne: true },
    })
      .select('title liveSessions')
      .populate('createdBy', 'userName')
      .lean();

    const now = new Date();
    const out = [];

    for (const c of courses) {
      const sessions = c.liveSessions || [];
      const instructor = c.createdBy?.userName || 'Instructor';
      for (const s of sessions) {
        if (!s?.meetingUrl || !s?.scheduledAt) continue;
        const { joinStatus, canJoin, learnerStatus } = computeLiveSessionUiState(
          s.scheduledAt,
          s.scheduledEnd,
          s.durationMinutes,
          now,
        );
        const sessionId = s._id ? String(s._id) : '';
        const endMs = sessionEndMs(s.scheduledAt, s.scheduledEnd, s.durationMinutes);
        const durationMinutes =
          s.durationMinutes && s.durationMinutes > 0
            ? s.durationMinutes
            : Math.max(5, Math.round((endMs - new Date(s.scheduledAt).getTime()) / (60 * 1000)));
        out.push({
          id: sessionId ? `${c._id}_${sessionId}` : `${c._id}_${out.length}`,
          sessionId,
          courseId: c._id.toString(),
          courseTitle: c.title || 'Course',
          instructor,
          title: (s.title && String(s.title).trim()) || `Live: ${c.title || 'Course'}`,
          meetingUrl: s.meetingUrl,
          scheduledAt: s.scheduledAt,
          scheduledEnd: Number.isNaN(endMs) ? null : new Date(endMs),
          durationMinutes,
          joinStatus,
          canJoin,
          learnerStatus,
        });
      }
    }

    out.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    res.set('Cache-Control', 'private, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    return res.json({ success: true, data: out });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getMyCourses, checkEnrollment, enrollCourse, getMyLiveSessions };
