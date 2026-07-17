// routes/course-routes/audiocontent.routes.js
const express = require('express');
const router = express.Router();
const audioContentController = require('../../controllers/course-controller/audio.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createContentBody, updateContent } = require('../../validations/content');
const { requireContentChapterOwner, requireContentOwner } = require('../../middleware/courseOwnership');
const { requireContentListAccess, requireContentReadAccess } = require('../../middleware/contentAccess');

router.use(authenticate);

router.get('/', authorizeRoles('learner', 'instructor', 'admin'), requireContentListAccess(), audioContentController.getAllAudioContents);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), requireContentReadAccess('id'), audioContentController.getAudioContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), ...createContentBody, audioContentController.createAudioContent);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), ...updateContent, audioContentController.updateAudioContent);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), audioContentController.deleteAudioContent);

module.exports = router;
