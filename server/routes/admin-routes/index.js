const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { param, body } = require('express-validator');
const validateRequest = require('../../middleware/validateRequest');
const { getPendingCourses, approveCourse, rejectCourse } = require('../../controllers/admin-controller/courseReview.controller');
const { getAdminStats } = require('../../controllers/admin-controller/stats.controller');
const {
  getPublishedCourses,
  getHomepageFeatured,
  updateHomepageFeatured,
} = require('../../controllers/admin-controller/homepageFeatured.controller');
const {
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadSiteImage,
} = require('../../controllers/admin-controller/siteContent.controller');
const path = require('path');
const { createHardenedUpload, handleUploadErrors } = require('../../config/uploadSecurity');

const siteUpload = createHardenedUpload({
  uploadsDir: path.join(__dirname, '../../uploads/site'),
  maxFileSizeBytes: 5 * 1024 * 1024,
  maxFiles: 1,
});

router.use(authenticate);
router.use(authorizeRoles('admin'));

const validateId = [param('id').notEmpty().isMongoId().withMessage('Invalid course ID'), validateRequest];

// GET /api/admin/stats — platform overview for admin dashboard
router.get('/stats', getAdminStats);

// GET /api/admin/courses/pending
router.get('/courses/pending', getPendingCourses);

router.get('/courses/published', getPublishedCourses);
router.get('/courses/homepage-featured', getHomepageFeatured);
router.put(
  '/courses/homepage-featured',
  [
    body('trendingCourseIds').optional().isArray(),
    body('popularCourseIds').optional().isArray(),
  ],
  validateRequest,
  updateHomepageFeatured
);

// PATCH /api/admin/courses/:id/approve
router.patch('/courses/:id/approve', validateId, approveCourse);

// PATCH /api/admin/courses/:id/reject (body: { rejectionReason: string })
router.patch(
  '/courses/:id/reject',
  validateId,
  [body('rejectionReason').notEmpty().trim().withMessage('Rejection reason is required')],
  validateRequest,
  rejectCourse
);

const validateContentId = [param('id').notEmpty().isMongoId().withMessage('Invalid ID'), validateRequest];

router.get('/site/blogs', listBlogs);
router.post('/site/blogs', createBlog);
router.patch('/site/blogs/:id', validateContentId, updateBlog);
router.delete('/site/blogs/:id', validateContentId, deleteBlog);

router.get('/site/testimonials', listTestimonials);
router.post('/site/testimonials', createTestimonial);
router.patch('/site/testimonials/:id', validateContentId, updateTestimonial);
router.delete('/site/testimonials/:id', validateContentId, deleteTestimonial);

router.post('/site/upload', siteUpload.single('file'), uploadSiteImage);
router.use(handleUploadErrors);

module.exports = router;
