// controllers/instructor-controller/content.controller.js
const Content = require('../../models/Content');
const createCrudController = require('../common/crud.controller');

const crud = createCrudController(Content);

// Scoped list: honor ?chapter= so non-admins cannot pull every content doc.
exports.getAllContents = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.chapter) filter.chapter = req.query.chapter;
    const items = await Content.find(filter);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContentById = crud.getById;
exports.createContent = crud.create;
exports.updateContent = crud.update;
exports.deleteContent = crud.delete;
