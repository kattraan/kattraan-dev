// controllers/course-controller/audio.controller.js
const AudioContent = require('../../models/AudioContent');
const Chapter = require('../../models/Chapter');

// Get all audio contents
exports.getAllAudioContents = async (req, res) => {
    try {
        const filter = {};
        if (req.query.chapter) filter.chapter = req.query.chapter;
        const items = await AudioContent.find(filter);
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get audio content by ID
exports.getAudioContentById = async (req, res) => {
    try {
        const item = await AudioContent.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create audio content AND push to chapter
exports.createAudioContent = async (req, res) => {
    try {
        const item = new AudioContent(req.body);
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

// Update audio content
exports.updateAudioContent = async (req, res) => {
    try {
        const item = await AudioContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete audio content AND remove from chapter
exports.deleteAudioContent = async (req, res) => {
    try {
        const item = await AudioContent.findByIdAndDelete(req.params.id);
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
