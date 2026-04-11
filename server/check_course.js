const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// We don't know the exact path to models, let's look for Course.js
async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Try to require the model dynamically
        const Course = require('./models/Course');

        const course = await mongoose.model('Course').findOne().sort({ updatedAt: -1 });
        if (course) {
            console.log('LATEST_COURSE_DATA');
            console.log(JSON.stringify({
                title: course.title,
                image: course.image,
                thumbnail: course.thumbnail,
                status: course.status
            }, null, 2));
        } else {
            console.log('No courses found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
