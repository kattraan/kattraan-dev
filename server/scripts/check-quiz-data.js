// Test script to verify quiz data in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

async function checkQuizData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get the Content model
        const Content = mongoose.model('Content');

        // Find all quiz content
        const quizzes = await Content.find({ type: 'quiz', isDeleted: false }).populate('chapter');

        console.log(`\n📊 Found ${quizzes.length} quizzes in database\n`);

        quizzes.forEach((quiz, index) => {
            console.log(`\n🎯 Quiz #${index + 1}:`);
            console.log(`   ID: ${quiz._id}`);
            console.log(`   Title: ${quiz.title}`);
            console.log(`   Chapter: ${quiz.chapter?.title || 'Unknown'}`);
            console.log(`   Questions: ${quiz.questions?.length || 0}`);

            if (quiz.questions && quiz.questions.length > 0) {
                quiz.questions.forEach((q, i) => {
                    console.log(`\n   Question ${i + 1}:`);
                    console.log(`      - Question: ${q.question}`);
                    console.log(`      - Type: ${q.type}`);
                    console.log(`      - Options: ${q.options?.length || 0}`);
                    console.log(`      - Marks: ${q.marks}`);
                });
            }
        });

        console.log('\n✅ Check complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkQuizData();
