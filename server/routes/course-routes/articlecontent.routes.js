// routes/instructor/articlecontent.routes.js
const express = require('express');
const router = express.Router();
const articleContentController = require('../../controllers/course-controller/article.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createContentBody, updateContent } = require('../../validations/content');
const { requireContentChapterOwner, requireContentOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

// Use numeric role IDs: 1=learner, 2=instructor, 3=admin
router.get('/', authorizeRoles('learner', 'instructor', 'admin'), articleContentController.getAllArticleContents);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), articleContentController.getArticleContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), ...createContentBody, articleContentController.createArticleContent);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), ...updateContent, articleContentController.updateArticleContent);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), articleContentController.deleteArticleContent);

module.exports = router;
