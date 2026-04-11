const Course = require('../../models/Course');
const Section = require('../../models/Section');
const Chapter = require('../../models/Chapter');
const LearnerCourses = require('../../models/LearnerCourses');
const createCrudController = require('../common/crud.controller');
const { signStorageCdnUrl } = require('../../helpers/bunnyToken');

const STORAGE_THUMB_TTL_SEC = 60 * 60 * 24 * 7;

/** Sign course.cover CDN URL when BUNNY_STORAGE_PULL_ZONE_TOKEN_KEY is set (Bunny token auth on pull zone). */
function signCourseThumbnailOnSend(courseLike) {
    if (!courseLike) return courseLike;
    const o = typeof courseLike.toObject === 'function' ? courseLike.toObject() : { ...courseLike };
    if (o.thumbnail) o.thumbnail = signStorageCdnUrl(o.thumbnail, STORAGE_THUMB_TTL_SEC);
    return o;
}

const CRUD_PROTECTED_FIELDS = [
    'status', 'submittedForReviewAt', 'approvedAt', 'rejectedAt', 'rejectionReason', 'approvedBy'
];

const crud = createCrudController(Course);

function stripProtectedFields(body) {
    const b = { ...body };
    CRUD_PROTECTED_FIELDS.forEach((key) => delete b[key]);
    return b;
}

/** Strip internal media IDs from video content so they are never exposed by the course API. */
function sanitizeVideoContent(content) {
    if (!content || content.type !== 'video') return content;
    const { bunnyVideoId, videoUrl, ...rest } = content;
    return rest;
}

/** Sanitize all video contents in course.sections[].chapters[].contents[] before sending. */
function sanitizeCourseContents(courseObj) {
    if (!courseObj || !courseObj.sections) return courseObj;
    courseObj.sections.forEach((section) => {
        if (section.chapters && Array.isArray(section.chapters)) {
            section.chapters.forEach((chapter) => {
                if (chapter.contents && Array.isArray(chapter.contents)) {
                    chapter.contents = chapter.contents.map(sanitizeVideoContent);
                }
            });
        }
    });
    return courseObj;
}

module.exports = {
    ...crud,

    // Override update: never allow status or approval fields to be set via general PUT
    async update(req, res) {
        try {
            const body = stripProtectedFields(req.body);
            const item = await Course.findByIdAndUpdate(req.params.id, { ...body, updatedBy: req.user._id }, { new: true });
            if (!item) return res.status(404).json({ success: false, message: 'Not found' });
            return res.json({ success: true, data: signCourseThumbnailOnSend(item) });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },
    // Override getById to populate sections and chapters
    async getById(req, res) {
        try {
            const course = await Course.findById(req.params.id)
                .populate('createdBy', 'userName enrollmentData')
                .populate({
                    path: 'sections',
                    match: { isDeleted: false },
                    populate: {
                        path: 'chapters',
                        match: { isDeleted: false },
                        populate: {
                            path: 'contents',
                            match: { isDeleted: false }
                        }
                    }
                });
            if (!course || course.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });

            const data = course.toObject ? course.toObject() : course;
            sanitizeCourseContents(data);
            if (data.thumbnail) data.thumbnail = signStorageCdnUrl(data.thumbnail, STORAGE_THUMB_TTL_SEC);
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    // Override getAll to filter by instructor (createdBy)
    async getInstructorCourses(req, res) {
        try {
            const instructorId = req.user._id;
            const courses = await Course.find({ createdBy: instructorId, isDeleted: false });
            res.json({ success: true, data: courses.map((c) => signCourseThumbnailOnSend(c)) });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Override create to associate with instructor (strip status/approval fields)
    async create(req, res) {
        try {
            const body = stripProtectedFields(req.body);
            const courseData = {
                ...body,
                createdBy: req.user._id,
                updatedBy: req.user._id
            };
            const item = new Course(courseData);
            await item.save();
            res.status(201).json({ success: true, data: signCourseThumbnailOnSend(item) });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    // Custom clone course logic
    async cloneCourse(req, res) {
        try {
            const originalCourse = await Course.findById(req.params.id);
            if (!originalCourse) return res.status(404).json({ success: false, message: 'Course not found' });

            const courseObj = originalCourse.toObject();
            delete courseObj._id;
            delete courseObj.createdAt;
            delete courseObj.updatedAt;

            courseObj.title = `${courseObj.title} (Copy)`;
            courseObj.status = 'draft';
            courseObj.createdBy = req.user._id;
            delete courseObj.submittedForReviewAt;
            delete courseObj.approvedAt;
            delete courseObj.rejectedAt;
            delete courseObj.rejectionReason;
            delete courseObj.approvedBy;

            const newCourse = new Course(courseObj);
            await newCourse.save();

            res.status(201).json({ success: true, data: signCourseThumbnailOnSend(newCourse) });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * Submit course for admin review. Course must be draft or rejected and pass completeness validation.
     */
    async submitForReview(req, res) {
        try {
            const courseId = req.params.id;
            const course = await Course.findById(courseId);
            if (!course || course.isDeleted) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
            const statusLower = String(course.status || '').toLowerCase();
            if (statusLower !== 'draft' && statusLower !== 'rejected') {
                return res.status(400).json({
                    success: false,
                    message: 'Course can only be submitted when in draft or rejected status.',
                    data: { currentStatus: course.status }
                });
            }

            const errors = [];
            if (!course.title || !String(course.title).trim()) errors.push('Title is required.');
            if (!course.description || !String(course.description).trim()) errors.push('Description is required.');
            if (course.price == null || Number(course.price) < 0) errors.push('Pricing must be set (non-negative number).');

            const sections = await Section.find({ course: courseId, isDeleted: { $ne: true } }).select('_id').lean();
            if (!sections.length) errors.push('At least one section is required.');
            const sectionIds = sections.map((s) => s._id);

            const chapters = await Chapter.find({ section: { $in: sectionIds }, isDeleted: { $ne: true } })
                .select('_id contents')
                .lean();
            if (!chapters.length) errors.push('At least one chapter is required.');

            let hasContent = false;
            for (const ch of chapters) {
                if (ch.contents && ch.contents.length > 0) {
                    hasContent = true;
                    break;
                }
            }
            if (!hasContent) errors.push('At least one content item is required in the curriculum.');

            if (errors.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Course is not ready for review.',
                    data: { errors }
                });
            }

            course.status = 'pending_approval';
            course.submittedForReviewAt = new Date();
            course.rejectedAt = undefined;
            course.rejectionReason = undefined;
            course.updatedBy = req.user._id;
            await course.save();

            return res.json({
                success: true,
                message: 'Course submitted for review successfully.',
                data: { course: signCourseThumbnailOnSend(course) }
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * Public listing: only published, non-deleted courses (for learners / discovery).
     * Enriches each course with enrolled count (learners) and total duration (from video content).
     */
    async getPublic(req, res) {
        try {
            const courses = await Course.find({
                status: 'published',
                isDeleted: { $ne: true }
            }).populate('createdBy', 'name userName').lean();

            const courseIds = courses.map((c) => c._id);

            // Enrollment count per course (courseId in LearnerCourses.courses)
            const enrollmentCounts = await LearnerCourses.aggregate([
                { $unwind: '$courses' },
                { $match: { 'courses.courseId': { $in: courseIds.map((id) => id.toString()) } } },
                { $group: { _id: '$courses.courseId', count: { $sum: 1 } } }
            ]);
            const countByCourseId = Object.fromEntries(
                enrollmentCounts.map((r) => [r._id, r.count])
            );

            // Total video duration per course (seconds): Section.course -> Chapter -> Content (type video)
            // Use Section collection so we get all sections for each course regardless of Course.sections array
            const durationAgg = await Section.aggregate([
                { $match: { course: { $in: courseIds }, isDeleted: { $ne: true } } },
                { $lookup: { from: 'chapters', localField: '_id', foreignField: 'section', as: 'chaps' } },
                { $unwind: { path: '$chaps', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'contents',
                        localField: 'chaps._id',
                        foreignField: 'chapter',
                        as: 'conts',
                        pipeline: [ { $match: { type: 'video', isDeleted: { $ne: true } } } ]
                    }
                },
                { $unwind: { path: '$conts', preserveNullAndEmptyArrays: true } },
                { $group: { _id: '$course', totalSeconds: { $sum: { $ifNull: ['$conts.duration', 0] } } } }
            ]);
            const durationByCourseId = Object.fromEntries(
                durationAgg.map((r) => [r._id.toString(), r.totalSeconds || 0])
            );

            const enriched = courses.map((c) => {
                const idStr = c._id.toString();
                const learners = countByCourseId[idStr] ?? c.learners ?? 0;
                const totalSeconds = durationByCourseId[idStr];
                // Prefer aggregated video duration; fallback to stored course.duration (minutes); then 0
                const durationMinutes =
                    totalSeconds != null && totalSeconds > 0
                        ? Math.round(totalSeconds / 60)
                        : (c.duration != null && c.duration >= 0 ? c.duration : 0);
                return {
                    ...c,
                    learners,
                    durationMinutes,
                    enrolledCount: learners,
                    thumbnail: c.thumbnail
                        ? signStorageCdnUrl(c.thumbnail, STORAGE_THUMB_TTL_SEC)
                        : c.thumbnail,
                };
            });

            return res.json({ success: true, data: enriched });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
};
