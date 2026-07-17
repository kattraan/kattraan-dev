// controllers/instructor-controller/section.controller.js
const Section = require('../../models/Section');
const createCrudController = require('../common/crud.controller');

// Custom Section Controllers for LMS

// Get all sections (optionally by course)
exports.getAllSections = async (req, res) => {
	try {
		const filter = { isDeleted: { $ne: true } };
		if (req.query.course) filter.course = req.query.course;
		const sections = await Section.find(filter).populate({
			path: 'chapters',
			match: { isDeleted: { $ne: true } },
		});
		res.json({ success: true, data: sections });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Get section by ID
exports.getSectionById = async (req, res) => {
	try {
		const section = await Section.findOne({
			_id: req.params.id,
			isDeleted: { $ne: true },
		}).populate({
			path: 'chapters',
			match: { isDeleted: { $ne: true } },
		});
		if (!section) return res.status(404).json({ success: false, message: 'Not found' });
		res.json({ success: true, data: section });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
const Course = require('../../models/Course');

// Override createSection to update parent course
exports.createSection = async (req, res) => {
	try {
		// Create the section
		const section = new Section(req.body);
		await section.save();

		// Push section._id to the parent course's sections array
		await Course.findByIdAndUpdate(
			section.course,
			{ $push: { sections: section._id } },
			{ new: true }
		);

		res.status(201).json({ success: true, data: section });
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};
// Update section
exports.updateSection = async (req, res) => {
	try {
		const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!section) return res.status(404).json({ success: false, message: 'Not found' });
		res.json({ success: true, data: section });
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

// Delete section (soft-delete) and remove from parent course
exports.deleteSection = async (req, res) => {
	try {
		const section = await Section.findById(req.params.id);
		if (!section || section.isDeleted) {
			return res.status(404).json({ success: false, message: 'Not found' });
		}

		const deletedAt = new Date();
		const deletedBy = req.user?._id ? String(req.user._id) : undefined;
		section.isDeleted = true;
		section.deletedAt = deletedAt;
		if (deletedBy) section.deletedBy = deletedBy;
		await section.save();

		const Chapter = require('../../models/Chapter');
		const Content = require('../../models/Content');
		const chapters = await Chapter.find({
			section: section._id,
			isDeleted: { $ne: true },
		}).select('_id');
		const chapterIds = chapters.map((c) => c._id);
		if (chapterIds.length) {
			await Chapter.updateMany(
				{ _id: { $in: chapterIds } },
				{ $set: { isDeleted: true, deletedAt, ...(deletedBy ? { deletedBy } : {}) } },
			);
			await Content.updateMany(
				{ chapter: { $in: chapterIds }, isDeleted: { $ne: true } },
				{ $set: { isDeleted: true, deletedAt, ...(deletedBy ? { deletedBy } : {}) } },
			);
		}

		await Course.findByIdAndUpdate(section.course, {
			$pull: { sections: section._id },
		});
		res.json({ success: true, message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
