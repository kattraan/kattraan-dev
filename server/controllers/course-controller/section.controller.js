// controllers/instructor-controller/section.controller.js
const Section = require('../../models/Section');
const createCrudController = require('../common/crud.controller');

// Custom Section Controllers for LMS

// Get all sections (optionally by course)
exports.getAllSections = async (req, res) => {
	try {
		const filter = {};
		if (req.query.course) filter.course = req.query.course;
		const sections = await Section.find(filter).populate('chapters');
		res.json({ success: true, data: sections });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Get section by ID
exports.getSectionById = async (req, res) => {
	try {
		const section = await Section.findById(req.params.id).populate('chapters');
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

// Delete section and remove from parent course
exports.deleteSection = async (req, res) => {
	try {
		const section = await Section.findByIdAndDelete(req.params.id);
		if (!section) return res.status(404).json({ success: false, message: 'Not found' });
		// Remove section from parent course
		await Course.findByIdAndUpdate(
			section.course,
			{ $pull: { sections: section._id } }
		);
		res.json({ success: true, message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
