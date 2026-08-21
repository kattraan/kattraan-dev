const BlogPost = require("../models/BlogPost");
const Testimonial = require("../models/Testimonial");
const SiteContentMeta = require("../models/SiteContentMeta");
const { DEFAULT_BLOGS, DEFAULT_TESTIMONIALS } = require("../data/siteContentSeed");

let seeding = null;

async function ensureSiteContentSeeded() {
  if (seeding) return seeding;
  seeding = (async () => {
    const meta = await SiteContentMeta.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default", blogsSeeded: false, testimonialsSeeded: false } },
      { upsert: true, new: true }
    );

    const updates = {};
    if (!meta.blogsSeeded) {
      const blogCount = await BlogPost.countDocuments();
      if (blogCount === 0) await BlogPost.insertMany(DEFAULT_BLOGS);
      updates.blogsSeeded = true;
    }
    if (!meta.testimonialsSeeded) {
      const testimonialCount = await Testimonial.countDocuments();
      if (testimonialCount === 0) await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
      updates.testimonialsSeeded = true;
    }
    if (Object.keys(updates).length) {
      await SiteContentMeta.updateOne({ key: "default" }, { $set: updates });
    }
  })().finally(() => {
    seeding = null;
  });
  return seeding;
}

function serializeBlog(doc) {
  const row = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(row._id),
    title: row.title,
    category: row.category,
    description: row.description,
    readTime: row.readTime,
    image: row.image || "",
    content: row.content || [],
    published: row.published !== false,
    sortOrder: row.sortOrder || 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function serializeTestimonial(doc) {
  const row = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(row._id),
    category: row.category,
    text: row.text,
    author: row.author,
    journey: row.journey,
    date: row.date,
    rating: row.rating || 5,
    featured: Boolean(row.featured),
    published: row.published !== false,
    sortOrder: row.sortOrder || 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

module.exports = {
  ensureSiteContentSeeded,
  serializeBlog,
  serializeTestimonial,
};
