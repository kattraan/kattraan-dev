// controllers/course-controller/image.controller.js
const ImageContent = require('../../models/ImageContent');
const Chapter = require('../../models/Chapter');

// Get all image contents
exports.getAllImageContents = async (req, res) => {
    try {
        const filter = {};
        if (req.query.chapter) filter.chapter = req.query.chapter;
        const items = await ImageContent.find(filter);
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get image content by ID
exports.getImageContentById = async (req, res) => {
    try {
        const item = await ImageContent.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create image content AND push to chapter
exports.createImageContent = async (req, res) => {
    try {
        const item = new ImageContent(req.body);
        await item.save();

        if (req.body.chapter) {
            await Chapter.findByIdAndUpdate(req.body.chapter, {
                $push: { contents: item._id }
            });
        }

        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update image content
exports.updateImageContent = async (req, res) => {
    try {
        const item = await ImageContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete image content AND remove from chapter
exports.deleteImageContent = async (req, res) => {
    try {
        const item = await ImageContent.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });

        if (item.chapter) {
            await Chapter.findByIdAndUpdate(item.chapter, {
                $pull: { contents: item._id }
            });
        }

        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
