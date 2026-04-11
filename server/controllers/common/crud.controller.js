// controllers/common/crud.controller.js

// Generic CRUD controller factory for any Mongoose model
function createCrudController(Model) {
  return {
    async getAll(req, res) {
      try {
        const items = await Model.find({ isDeleted: false });
        res.json({ success: true, data: items });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    },
    async getById(req, res) {
      try {
        const item = await Model.findById(req.params.id);
        if (!item || item.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    },
    async create(req, res) {
      try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json({ success: true, data: item });
      } catch (err) {
        res.status(400).json({ success: false, message: err.message });
      }
    },
    async update(req, res) {
      try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
      } catch (err) {
        res.status(400).json({ success: false, message: err.message });
      }
    },
    async delete(req, res) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted' });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    },
  };
}

module.exports = createCrudController;
