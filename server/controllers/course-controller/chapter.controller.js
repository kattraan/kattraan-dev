// controllers/instructor-controller/chapter.controller.js
const Chapter = require('../../models/Chapter');
const createCrudController = require('../common/crud.controller');

const Section = require('../../models/Section');

// Get all chapters (optionally by section)
exports.getAllChapters = async (req, res) => {
	try {
		const filter = { isDeleted: { $ne: true } };
		if (req.query.section) filter.section = req.query.section;
		const chapters = await Chapter.find(filter);
		res.json({ success: true, data: chapters });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Get chapter by ID
exports.getChapterById = async (req, res) => {
	try {
		const chapter = await Chapter.findOne({
			_id: req.params.id,
			isDeleted: { $ne: true },
		});
		if (!chapter) return res.status(404).json({ success: false, message: 'Not found' });
		res.json({ success: true, data: chapter });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Create chapter and push to parent section
exports.createChapter = async (req, res) => {
	try {
		const chapter = new Chapter(req.body);
		await chapter.save();
		// Push chapter._id to the parent section's chapters array
		await Section.findByIdAndUpdate(
			chapter.section,
			{ $push: { chapters: chapter._id } },
			{ new: true }
		);
		res.status(201).json({ success: true, data: chapter });
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

// Update chapter
exports.updateChapter = async (req, res) => {
	try {
		const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!chapter) return res.status(404).json({ success: false, message: 'Not found' });
		res.json({ success: true, data: chapter });
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

// Delete chapter (soft-delete) and remove from parent section
exports.deleteChapter = async (req, res) => {
	try {
		const chapter = await Chapter.findById(req.params.id);
		if (!chapter || chapter.isDeleted) {
			return res.status(404).json({ success: false, message: 'Not found' });
		}

		const deletedAt = new Date();
		const deletedBy = req.user?._id ? String(req.user._id) : undefined;
		chapter.isDeleted = true;
		chapter.deletedAt = deletedAt;
		if (deletedBy) chapter.deletedBy = deletedBy;
		await chapter.save();

		const Content = require('../../models/Content');
		await Content.updateMany(
			{ chapter: chapter._id, isDeleted: { $ne: true } },
			{ $set: { isDeleted: true, deletedAt, ...(deletedBy ? { deletedBy } : {}) } },
		);

		await Section.findByIdAndUpdate(chapter.section, {
			$pull: { chapters: chapter._id },
		});
		res.json({ success: true, message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
