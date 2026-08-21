const path = require("path");
const BlogPost = require("../../models/BlogPost");
const Testimonial = require("../../models/Testimonial");
const {
  ensureSiteContentSeeded,
  serializeBlog,
  serializeTestimonial,
} = require("../../helpers/siteContent");

function pickBlogFields(body = {}) {
  const fields = {};
  if (body.title != null) fields.title = String(body.title).trim();
  if (body.category != null) fields.category = String(body.category).trim();
  if (body.description != null) fields.description = String(body.description).trim();
  if (body.readTime != null) fields.readTime = String(body.readTime).trim();
  if (body.image != null) fields.image = String(body.image).trim();
  if (Array.isArray(body.content)) {
    fields.content = body.content
      .filter((b) => b && b.text)
      .map((b) => ({
        type: b.type === "heading" ? "heading" : "paragraph",
        text: String(b.text).trim(),
      }));
  }
  if (Object.prototype.hasOwnProperty.call(body, "published")) {
    fields.published = body.published === true || body.published === "true";
  }
  if (body.sortOrder != null && body.sortOrder !== "") fields.sortOrder = Number(body.sortOrder) || 0;
  return fields;
}

function pickTestimonialFields(body = {}) {
  const fields = {};
  if (body.category != null) fields.category = String(body.category).trim();
  if (body.text != null) fields.text = String(body.text).trim();
  if (body.author != null) fields.author = String(body.author).trim();
  if (body.journey != null) fields.journey = String(body.journey).trim();
  if (body.date != null) fields.date = String(body.date).trim();
  if (body.rating != null) fields.rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  if (Object.prototype.hasOwnProperty.call(body, "featured")) {
    fields.featured = body.featured === true || body.featured === "true";
  }
  if (Object.prototype.hasOwnProperty.call(body, "published")) {
    fields.published = body.published === true || body.published === "true";
  }
  if (body.sortOrder != null && body.sortOrder !== "") fields.sortOrder = Number(body.sortOrder) || 0;
  return fields;
}

async function listBlogs(req, res) {
  try {
    await ensureSiteContentSeeded();
    const blogs = await BlogPost.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return res.json({ success: true, data: blogs.map(serializeBlog) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createBlog(req, res) {
  try {
    const fields = pickBlogFields(req.body);
    if (!fields.title || !fields.category || !fields.description || !fields.readTime) {
      return res.status(400).json({ success: false, message: "Title, category, description, and read time are required" });
    }
    const count = await BlogPost.countDocuments();
    if (fields.sortOrder == null) fields.sortOrder = count + 1;
    const created = await BlogPost.create(fields);
    return res.status(201).json({ success: true, data: serializeBlog(created) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateBlog(req, res) {
  try {
    const blog = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $set: pickBlogFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ success: false, message: "Article not found" });
    return res.json({ success: true, data: serializeBlog(blog) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteBlog(req, res) {
  try {
    const blog = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Article not found" });
    return res.json({ success: true, message: "Article deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function listTestimonials(req, res) {
  try {
    await ensureSiteContentSeeded();
    const items = await Testimonial.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return res.json({ success: true, data: items.map(serializeTestimonial) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createTestimonial(req, res) {
  try {
    const fields = pickTestimonialFields(req.body);
    if (!fields.category || !fields.text || !fields.author || !fields.journey || !fields.date) {
      return res.status(400).json({
        success: false,
        message: "Title, quote, name, journey, and date are required",
      });
    }
    const count = await Testimonial.countDocuments();
    if (fields.sortOrder == null) fields.sortOrder = count + 1;
    const created = await Testimonial.create(fields);
    return res.status(201).json({ success: true, data: serializeTestimonial(created) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateTestimonial(req, res) {
  try {
    const item = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: pickTestimonialFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Testimonial not found" });
    return res.json({ success: true, data: serializeTestimonial(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteTestimonial(req, res) {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Testimonial not found" });
    return res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function uploadSiteImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Image file is required" });
    if (!String(req.file.mimetype || "").startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Only image uploads are allowed" });
    }
    const url = `/uploads/site/${path.basename(req.file.filename)}`;
    return res.json({ success: true, data: { url } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadSiteImage,
};
