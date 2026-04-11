// controllers/instructor-controller/coursereview.controller.js
const CourseReview = require('../../models/CourseReview');
const createCrudController = require('../common/crud.controller');

const crud = createCrudController(CourseReview);
exports.getAllCourseReviews = crud.getAll;
exports.getCourseReviewById = crud.getById;
exports.createCourseReview = crud.create;
exports.updateCourseReview = crud.update;
exports.deleteCourseReview = crud.delete;
