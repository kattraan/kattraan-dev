const Course = require('../../models/Course');
const Section = require('../../models/Section');
const Chapter = require('../../models/Chapter');
const Content = require('../../models/Content');
// Ensure content discriminators are registered for deep clone
require('../../models/VideoContent');
require('../../models/ArticleContent');
require('../../models/QuizContent');
require('../../models/ImageContent');
require('../../models/AudioContent');
require('../../models/ResourceContent');
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

function getRoleNames(user) {
    return (Array.isArray(user?.roleNames) ? user.roleNames : [])
        .map((r) => String(r).toLowerCase());
}

function isAdminUser(user) {
    return getRoleNames(user).includes('admin');
}

function isInstructorUser(user) {
    return getRoleNames(user).includes('instructor');
}

function canViewUnpublishedCourse(user, course) {
    if (!user || !course) return false;
    if (isAdminUser(user)) return true;
    return course.createdBy && String(course.createdBy._id || course.createdBy) === String(user._id);
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

function cloneDocFields(doc) {
    const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
    delete obj._id;
    delete obj.id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.deletedAt;
    delete obj.deletedBy;
    obj.isDeleted = false;
    return obj;
}

module.exports = {
    ...crud,
    cloneDocFields,

    /**
     * Role-scoped listing:
     * - admin: all non-deleted courses
     * - instructor: own courses + published
     * - learner: published only
     */
    async getAll(req, res) {
        try {
            let filter = { isDeleted: { $ne: true }, status: 'published' };

            if (isAdminUser(req.user)) {
                filter = { isDeleted: { $ne: true } };
            } else if (isInstructorUser(req.user)) {
                filter = {
                    isDeleted: { $ne: true },
                    $or: [
                        { createdBy: req.user._id },
                        { status: 'published' },
                    ],
                };
            }

            const courses = await Course.find(filter).sort({ updatedAt: -1 });
            res.json({ success: true, data: courses.map((c) => signCourseThumbnailOnSend(c)) });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Soft-delete course and cascade soft-delete of curriculum
    async delete(req, res) {
        try {
            const course = await Course.findById(req.params.id);
            if (!course || course.isDeleted) {
                return res.status(404).json({ success: false, message: 'Not found' });
            }

            const deletedAt = new Date();
            const deletedBy = req.user?._id ? String(req.user._id) : undefined;

            course.isDeleted = true;
            course.deletedAt = deletedAt;
            if (deletedBy) course.deletedBy = deletedBy;
            await course.save();

            const sections = await Section.find({ course: course._id, isDeleted: { $ne: true } }).select('_id');
            const sectionIds = sections.map((s) => s._id);
            if (sectionIds.length) {
                await Section.updateMany(
                    { _id: { $in: sectionIds } },
                    { $set: { isDeleted: true, deletedAt, ...(deletedBy ? { deletedBy } : {}) } },
                );

                const chapters = await Chapter.find({
                    section: { $in: sectionIds },
                    isDeleted: { $ne: true },
                }).select('_id');
                const chapterIds = chapters.map((c) => c._id);
                if (chapterIds.length) {
                    await Chapter.updateMany(
                        { _id: { $in: chapterIds } },
                        { $set: { isDeleted: true, deletedAt, ...(deletedBy ? { deletedBy } : {}) } },
                    );
                    await Content.updateMany(
                        { chapter: { $in: chapterIds }, isDeleted: { $ne: true } },
                        { $set: { isDeleted: true, deletedAt, ...(deletedBy ? { deletedBy } : {}) } },
                    );
                }
            }

            return res.json({ success: true, message: 'Deleted' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

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

            const status = String(course.status || '').toLowerCase();
            if (status !== 'published' && !canViewUnpublishedCourse(req.user, course)) {
                return res.status(404).json({ success: false, message: 'Not found' });
            }

            const data = course.toObject ? course.toObject() : course;
            sanitizeCourseContents(data);
            if (data.thumbnail) data.thumbnail = signStorageCdnUrl(data.thumbnail, STORAGE_THUMB_TTL_SEC);
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getInstructorCourses(req, res) {
        try {
            const instructorId = req.user._id;
            const courses = await Course.find({ createdBy: instructorId, isDeleted: false });
            res.json({ success: true, data: courses.map((c) => signCourseThumbnailOnSend(c)) });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

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

    // Deep-clone course + sections + chapters + contents (independent ObjectIds)
    async cloneCourse(req, res) {
        try {
            const originalCourse = await Course.findById(req.params.id);
            if (!originalCourse || originalCourse.isDeleted) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }

            const courseObj = cloneDocFields(originalCourse);
            courseObj.title = `${courseObj.title || 'Untitled Course'} (Copy)`;
            courseObj.status = 'draft';
            courseObj.createdBy = req.user._id;
            courseObj.updatedBy = req.user._id;
            courseObj.sections = [];
            courseObj.learners = 0;
            delete courseObj.submittedForReviewAt;
            delete courseObj.approvedAt;
            delete courseObj.rejectedAt;
            delete courseObj.rejectionReason;
            delete courseObj.approvedBy;

            const newCourse = new Course(courseObj);
            await newCourse.save();

            const sections = await Section.find({
                course: originalCourse._id,
                isDeleted: { $ne: true },
            }).sort({ order: 1 }).lean();

            const newSectionIds = [];

            for (const section of sections) {
                const sectionFields = cloneDocFields(section);
                sectionFields.course = newCourse._id;
                sectionFields.chapters = [];
                sectionFields.createdBy = req.user._id;
                sectionFields.updatedBy = req.user._id;
                const newSection = await Section.create(sectionFields);

                const chapters = await Chapter.find({
                    section: section._id,
                    isDeleted: { $ne: true },
                }).sort({ order: 1 }).lean();

                const newChapterIds = [];
                for (const chapter of chapters) {
                    const chapterFields = cloneDocFields(chapter);
                    chapterFields.section = newSection._id;
                    chapterFields.contents = [];
                    chapterFields.createdBy = req.user._id;
                    chapterFields.updatedBy = req.user._id;
                    const newChapter = await Chapter.create(chapterFields);

                    const contents = await Content.find({
                        chapter: chapter._id,
                        isDeleted: { $ne: true },
                    }).sort({ order: 1 }).lean();

                    const newContentIds = [];
                    for (const content of contents) {
                        const contentFields = cloneDocFields(content);
                        contentFields.chapter = newChapter._id;
                        contentFields.createdBy = req.user._id;
                        contentFields.updatedBy = req.user._id;
                        const newContent = await Content.create(contentFields);
                        newContentIds.push(newContent._id);
                    }

                    newChapter.contents = newContentIds;
                    await newChapter.save();
                    newChapterIds.push(newChapter._id);
                }

                newSection.chapters = newChapterIds;
                await newSection.save();
                newSectionIds.push(newSection._id);
            }

            newCourse.sections = newSectionIds;
            await newCourse.save();

            res.status(201).json({ success: true, data: signCourseThumbnailOnSend(newCourse) });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

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

    async getPublic(req, res) {
        try {
            const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
            const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
            const skip = (page - 1) * limit;
            // lite=1: landing-page mode — skip nested duration aggregation for fast TTFB.
            const lite = ['1', 'true'].includes(String(req.query.lite || '').toLowerCase());
            const filter = {
                status: 'published',
                isDeleted: { $ne: true }
            };

            let courseFind = Course.find(filter)
                .sort({ updatedAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'name userName');
            if (lite) {
                courseFind = courseFind.select(
                    'title category description thumbnail image duration learners sections averageRating status createdAt updatedAt createdBy'
                );
            }

            const [courses, total] = await Promise.all([
                courseFind.lean(),
                Course.countDocuments(filter),
            ]);

            const courseIds = courses.map((c) => c._id);

            let countByCourseId = {};
            if (courseIds.length) {
                const enrollmentCounts = await LearnerCourses.aggregate([
                    { $unwind: '$courses' },
                    { $match: { 'courses.courseId': { $in: courseIds.map((id) => id.toString()) } } },
                    { $group: { _id: '$courses.courseId', count: { $sum: 1 } } }
                ]);
                countByCourseId = Object.fromEntries(
                    enrollmentCounts.map((r) => [r._id, r.count])
                );
            }

            let durationByCourseId = {};
            if (!lite && courseIds.length) {
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
                durationByCourseId = Object.fromEntries(
                    durationAgg.map((r) => [r._id.toString(), r.totalSeconds || 0])
                );
            }

            const enriched = courses.map((c) => {
                const idStr = c._id.toString();
                const learners = countByCourseId[idStr] ?? c.learners ?? 0;
                let durationMinutes = 0;
                if (!lite) {
                    const totalSeconds = durationByCourseId[idStr];
                    durationMinutes =
                        totalSeconds != null && totalSeconds > 0
                            ? Math.round(totalSeconds / 60)
                            : (c.duration != null && c.duration >= 0 ? c.duration : 0);
                } else if (c.duration != null && c.duration >= 0) {
                    durationMinutes = c.duration;
                }
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

            return res.json({
                success: true,
                data: enriched,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                },
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
};
