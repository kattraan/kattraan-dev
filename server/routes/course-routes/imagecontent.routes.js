// routes/course-routes/imagecontent.routes.js
const express = require('express');
const router = express.Router();
const imageContentController = require('../../controllers/course-controller/image.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createContentBody, updateContent } = require('../../validations/content');
const { requireContentChapterOwner, requireContentOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

router.get('/', authorizeRoles('learner', 'instructor', 'admin'), imageContentController.getAllImageContents);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), imageContentController.getImageContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), ...createContentBody, imageContentController.createImageContent);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), ...updateContent, imageContentController.updateImageContent);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), imageContentController.deleteImageContent);

module.exports = router;
