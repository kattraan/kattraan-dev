const mongoose = require("mongoose");
const Content = require("./Content");

const VideoContentSchema = new mongoose.Schema({
  /** Bunny Stream video ID (guid). Playback URL: https://{BUNNY_CDN_URL}/{bunnyVideoId}/playlist.m3u8 */
  bunnyVideoId: { type: String, required: true },
  /** Encoding status from Bunny Stream. Playback works when "ready". */
  encodingStatus: {
    type: String,
    enum: ["pending", "processing", "ready", "failed"],
    default: "processing",
  },
  duration: { type: Number }, // in seconds (set when Bunny finishes encoding)
  resolution: { type: String }, // e.g. "1920x1080"
  thumbnail: { type: String }, // video preview image URL
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  // Lesson-level resources (files/links) from "Upload resources" – shown in watch page Resources tab
  resources: [
    {
      title: { type: String },
      url: { type: String },
      fileType: { type: String },
      fileSize: { type: Number },
    },
  ],
  engagementTemplateId: { type: String, default: "" },
});

module.exports = Content.discriminator("video", VideoContentSchema);
