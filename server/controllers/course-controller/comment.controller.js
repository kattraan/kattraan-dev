// controllers/instructor-controller/comment.controller.js
const Comment = require('../../models/Comment');
const createCrudController = require('../common/crud.controller');

const crud = createCrudController(Comment);
exports.getAllComments = crud.getAll;
exports.getCommentById = crud.getById;
exports.createComment = crud.create;
exports.updateComment = crud.update;
exports.deleteComment = crud.delete;
