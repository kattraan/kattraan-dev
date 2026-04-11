// routes/instructor/comment.routes.js
const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/course-controller/comment.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createComment, updateComment } = require('../../validations/comment');
const { requireCommentOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

// Use numeric role IDs: 1=learner, 2=instructor, 3=admin
router.get('/', authorizeRoles('learner', 'instructor', 'admin'), commentController.getAllComments);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), commentController.getCommentById);
router.post('/', authorizeRoles('learner', 'instructor', 'admin'), ...createComment, commentController.createComment);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireCommentOwner('id'), ...updateComment, commentController.updateComment);
router.delete('/:id', authorizeRoles('admin'), commentController.deleteComment);

module.exports = router;
