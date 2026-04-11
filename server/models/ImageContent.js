const mongoose = require("mongoose");
const Content = require("./Content");

const ImageContentSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
});

module.exports = Content.discriminator("image", ImageContentSchema);
