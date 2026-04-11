const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 500,
    },
    url: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

MediaSchema.index({ key: 1 }, { unique: true });
MediaSchema.index({ course: 1 });
MediaSchema.index({ isDeleted: 1, key: 1 });

module.exports = mongoose.model("Media", MediaSchema);
