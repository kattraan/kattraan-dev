// routes/instructor/quizcontent.routes.js
const express = require('express');
const router = express.Router();
const quizContentController = require('../../controllers/course-controller/quiz.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createQuiz, updateQuiz } = require('../../validations/quiz');
const { requireContentChapterOwner, requireContentOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

// Use numeric role IDs: 1=learner, 2=instructor, 3=admin
router.get('/', authorizeRoles('learner', 'instructor', 'admin'), quizContentController.getAllQuizContents);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), quizContentController.getQuizContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), ...createQuiz, quizContentController.createQuizContent);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), ...updateQuiz, quizContentController.updateQuizContent);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), quizContentController.deleteQuizContent);

module.exports = router;
