const express = require('express');
const router = express.Router();
const videoPlayController = require('../../controllers/video-controller/videoPlay.controller');
const videoUploadController = require('../../controllers/video-controller/videoUpload.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { requireContentChapterOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

// Playback: signed URL for a video content by its _id
router.get('/:videoId/play', authorizeRoles('learner', 'instructor', 'admin'), videoPlayController.getPlayUrl);

// Direct upload flow: create (Bunny + TUS credentials) → client uploads to Bunny → save metadata
router.post('/create', authorizeRoles('instructor', 'admin'), videoUploadController.createVideo);
router.post(
  '/save',
  authorizeRoles('instructor', 'admin'),
  requireContentChapterOwner('chapterId'),
  videoUploadController.saveVideoMetadata,
);

module.exports = router;
