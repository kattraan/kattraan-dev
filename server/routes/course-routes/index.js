// routes/instructor/index.js
const express = require('express');
const router = express.Router();





const courseRoutes = require('./course.routes');
const sectionRoutes = require('./section.routes');
const chapterRoutes = require('./chapter.routes');
const contentRoutes = require('./content.routes');
const videoContentRoutes = require('./videocontent.routes');
const quizContentRoutes = require('./quizcontent.routes');
const resourceContentRoutes = require('./resourcecontent.routes');
const articleContentRoutes = require('./articlecontent.routes');
const commentRoutes = require('./comment.routes');

const mediaRoutes = require('./media.routes');
const courseReviewRoutes = require('./coursereview.routes');
const audioContentRoutes = require('./audiocontent.routes');
const imageContentRoutes = require('./imagecontent.routes');
const qnaRoutes = require('./qna.routes');
const chapterCommentRoutes = require('./chapter-comments.routes');

router.use('/courses', courseRoutes);
router.use('/sections', sectionRoutes);
router.use('/chapters', chapterRoutes);
router.use('/contents', contentRoutes);
router.use('/videocontents', videoContentRoutes);
router.use('/quizcontents', quizContentRoutes);
router.use('/resourcecontents', resourceContentRoutes);
router.use('/articlecontents', articleContentRoutes);
router.use('/comments', commentRoutes);
router.use('/coursereviews', courseReviewRoutes);
router.use('/media', mediaRoutes);
router.use('/audiocontents', audioContentRoutes);
router.use('/imagecontents', imageContentRoutes);
router.use('/qna', qnaRoutes);
router.use('/chapter-comments', chapterCommentRoutes);

module.exports = router;
