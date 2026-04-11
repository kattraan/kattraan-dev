const mongoose = require("mongoose");
const Content = require("./Content");

const AudioContentSchema = new mongoose.Schema({
  audioUrl: { type: String, required: true },
  duration: { type: Number },
});

module.exports = Content.discriminator("audio", AudioContentSchema);
