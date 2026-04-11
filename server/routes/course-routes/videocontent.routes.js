// routes/instructor/videocontent.routes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const videoContentController = require('../../controllers/course-controller/video.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createContentBody, updateContent } = require('../../validations/content');
const { requireContentChapterOwner, requireContentOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

/** Reject invalid ObjectIds so paths like "upload-hls" are not treated as :id */
function validateVideoContentId(req, res, next) {
  const id = req.params.id;
  if (!id) return next();
  const isValid = mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
  if (!isValid) return res.status(404).json({ success: false, message: 'Not found' });
  next();
}

// Video upload is done via direct TUS to Bunny: POST /api/videos/create → client uploads → POST /api/videos/save

// Use numeric role IDs: 1=learner, 2=instructor, 3=admin
router.get('/', authorizeRoles('learner', 'instructor', 'admin'), videoContentController.getAllVideoContents);
router.get('/:id', validateVideoContentId, authorizeRoles('learner', 'instructor', 'admin'), videoContentController.getVideoContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), ...createContentBody, videoContentController.createVideoContent);
router.put('/:id', validateVideoContentId, authorizeRoles('instructor', 'admin'), requireContentOwner('id'), ...updateContent, videoContentController.updateVideoContent);
router.delete('/:id', validateVideoContentId, authorizeRoles('instructor', 'admin'), requireContentOwner('id'), videoContentController.deleteVideoContent);

module.exports = router;
