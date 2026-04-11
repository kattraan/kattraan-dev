// controllers/instructor-controller/quizcontent.controller.js
const QuizContent = require('../../models/QuizContent');
const createCrudController = require('../common/crud.controller');

const crud = createCrudController(QuizContent);

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

exports.getAllQuizContents = crud.getAll;
exports.getQuizContentById = crud.getById;
exports.updateQuizContent = crud.update;
exports.deleteQuizContent = crud.delete;
