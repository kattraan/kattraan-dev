const mongoose = require("mongoose");
const Content = require("./Content");

const ArticleContentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  images: [{ type: String }], // array of image URLs
});

module.exports = Content.discriminator("article", ArticleContentSchema);
