const mongoose = require("mongoose");
const BaseContent = require("./shared/BaseContent");

const ContentSchema = new mongoose.Schema({
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  type: {
    type: String,
    enum: ["video", "article", "quiz", "image", "audio", "resource"],
    required: true
  },
  metadata: { type: Object, default: {} },
}, { discriminatorKey: "type", timestamps: true });

ContentSchema.add(BaseContent);

module.exports = mongoose.model("Content", ContentSchema);
