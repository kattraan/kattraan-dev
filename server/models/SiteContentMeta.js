const mongoose = require("mongoose");

const SiteContentMetaSchema = new mongoose.Schema({
  key: { type: String, default: "default", unique: true },
  blogsSeeded: { type: Boolean, default: false },
  testimonialsSeeded: { type: Boolean, default: false },
});

module.exports = mongoose.model("SiteContentMeta", SiteContentMetaSchema);
