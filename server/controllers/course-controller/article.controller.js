// controllers/course-controller/article.controller.js
const ArticleContent = require('../../models/ArticleContent');
const Chapter = require('../../models/Chapter');

// Get all article contents
exports.getAllArticleContents = async (req, res) => {
    try {
        const filter = {};
        if (req.query.chapter) filter.chapter = req.query.chapter;
        const items = await ArticleContent.find(filter);
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get article content by ID
exports.getArticleContentById = async (req, res) => {
    try {
        const item = await ArticleContent.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create article content AND push to chapter
exports.createArticleContent = async (req, res) => {
    try {
        const item = new ArticleContent(req.body);
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

// Update article content
exports.updateArticleContent = async (req, res) => {
    try {
        const item = await ArticleContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete article content AND remove from chapter
exports.deleteArticleContent = async (req, res) => {
    try {
        const item = await ArticleContent.findByIdAndDelete(req.params.id);
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
