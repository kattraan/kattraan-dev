// controllers/instructor-controller/content.controller.js
const Content = require('../../models/Content');
const createCrudController = require('../common/crud.controller');

const crud = createCrudController(Content);
exports.getAllContents = crud.getAll;
exports.getContentById = crud.getById;
exports.createContent = crud.create;
exports.updateContent = crud.update;
exports.deleteContent = crud.delete;
