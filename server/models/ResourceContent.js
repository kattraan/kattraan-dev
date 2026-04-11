const mongoose = require("mongoose");
const Content = require("./Content");

const ResourceContentSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  fileType: { type: String }, // pdf, docx, pptx, etc.
});

module.exports = Content.discriminator("resource", ResourceContentSchema);
