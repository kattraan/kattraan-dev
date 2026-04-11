// routes/instructor/resourcecontent.routes.js
const express = require('express');
const router = express.Router();
const resourceContentController = require('../../controllers/course-controller/resource.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createContentBody, updateContent } = require('../../validations/content');
const { requireContentChapterOwner, requireContentOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

// Use numeric role IDs: 1=learner, 2=instructor, 3=admin
router.get('/', authorizeRoles('learner', 'instructor', 'admin'), resourceContentController.getAllResourceContents);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), resourceContentController.getResourceContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), ...createContentBody, resourceContentController.createResourceContent);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), ...updateContent, resourceContentController.updateResourceContent);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), resourceContentController.deleteResourceContent);

module.exports = router;
