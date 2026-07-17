// controllers/instructor-controller/quizcontent.controller.js
const QuizContent = require('../../models/QuizContent');
const Chapter = require('../../models/Chapter');
const Section = require('../../models/Section');
const createCrudController = require('../common/crud.controller');
const { ensureUserCanEditCourse } = require('../../middleware/courseOwnership');

const crud = createCrudController(QuizContent);

/** Remove correct-answer keys so learners can't read answers before submitting. */
function stripQuizAnswers(quiz) {
  if (!quiz) return quiz;
  const plain = typeof quiz.toObject === 'function' ? quiz.toObject() : quiz;
  const questions = Array.isArray(plain.questions)
    ? plain.questions.map((q) => {
        const { correctAnswer, correctAnswers, ...rest } = q;
        return rest;
      })
    : plain.questions;
  return { ...plain, questions };
}

/** True when the requester owns the quiz's course (or is admin) and may see answers. */
async function canViewQuizAnswers(req, quiz) {
  if (!quiz?.chapter) return false;
  const chapter = await Chapter.findById(quiz.chapter).select('section').lean();
  if (!chapter?.section) return false;
  const section = await Section.findById(chapter.section).select('course').lean();
  if (!section?.course) return false;
  const result = await ensureUserCanEditCourse(req, section.course);
  return !!result.ok;
}

// Custom create method with logging
exports.createQuizContent = async (req, res) => {
    try {
        console.log('📝 Creating Quiz Content...');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        const { chapter, title, description, questions, metadata } = req.body;

        // Validate required fields
        if (!chapter) {
            return res.status(400).json({ success: false, message: 'Chapter ID is required' });
        }
        if (!title) {
            return res.status(400).json({ success: false, message: 'Quiz title is required' });
        }
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one question is required' });
        }

        console.log(`✅ Validation passed. Creating quiz with ${questions.length} questions`);
        console.log('Questions data:', JSON.stringify(questions, null, 2));

        // Create QuizContent (type is automatically set to 'quiz' by discriminator)
        const quizContent = new QuizContent({
            chapter,
            title,
            description,
            questions,  // This is the critical field that needs to be saved
            metadata: metadata || {}
        });

        console.log('🔍 QuizContent before save:', JSON.stringify(quizContent.toObject(), null, 2));

        await quizContent.save();

        console.log('✅ Quiz saved successfully:', quizContent._id);
        console.log('Questions in saved document:', quizContent.questions?.length || 0);

        // Update the chapter to include this content using atomic operator
        const Chapter = require('../../models/Chapter');
        await Chapter.findByIdAndUpdate(chapter, {
            $addToSet: { contents: quizContent._id }
        });
        console.log('✅ Chapter updated with quiz content via $addToSet');

        // Fetch the saved document to verify
        const savedQuiz = await QuizContent.findById(quizContent._id);
        console.log('🔍 Verification - Questions in DB:', savedQuiz.questions?.length || 0);

        res.status(201).json({ success: true, data: savedQuiz });
    } catch (err) {
        console.error('❌ Quiz creation error:', err);
        console.error('Error stack:', err.stack);
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET /api/quizcontents/:id — strip correct answers unless the requester owns the course.
exports.getQuizContentById = async (req, res) => {
    try {
        const quiz = await QuizContent.findById(req.params.id);
        if (!quiz || quiz.isDeleted) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        const allowAnswers = await canViewQuizAnswers(req, quiz);
        const data = allowAnswers ? quiz : stripQuizAnswers(quiz);
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/quizcontents — only admins receive answers; others get redacted questions.
// Non-admins must pass ?chapter= (enforced by requireContentListAccess).
exports.getAllQuizContents = async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (req.query.chapter) filter.chapter = req.query.chapter;
        const items = await QuizContent.find(filter);
        const isAdmin = req.user?.roleNames
            ?.map((r) => String(r).toLowerCase())
            .includes('admin');
        const data = isAdmin ? items : items.map(stripQuizAnswers);
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateQuizContent = crud.update;
exports.deleteQuizContent = crud.delete;
