const BlogPost = require("../../models/BlogPost");
const Testimonial = require("../../models/Testimonial");
const {
  ensureSiteContentSeeded,
  serializeBlog,
  serializeTestimonial,
} = require("../../helpers/siteContent");

function noStore(res) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
}

async function listPublicBlogs(req, res) {
  try {
    await ensureSiteContentSeeded();
    const blogs = await BlogPost.find({ published: { $ne: false } })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    noStore(res);
    return res.json({ success: true, data: blogs.map(serializeBlog) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getPublicBlog(req, res) {
  try {
    await ensureSiteContentSeeded();
    const blog = await BlogPost.findOne({ _id: req.params.id, published: { $ne: false } }).lean();
    if (!blog) return res.status(404).json({ success: false, message: "Article not found" });
    noStore(res);
    return res.json({ success: true, data: serializeBlog(blog) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function listPublicTestimonials(req, res) {
  try {
    await ensureSiteContentSeeded();
    const items = await Testimonial.find({ published: { $ne: false } })
      .sort({ featured: -1, sortOrder: 1, createdAt: 1 })
      .lean();
    noStore(res);
    return res.json({ success: true, data: items.map(serializeTestimonial) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listPublicBlogs,
  getPublicBlog,
  listPublicTestimonials,
};
