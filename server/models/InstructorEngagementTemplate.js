const mongoose = require("mongoose");

const InstructorEngagementTemplateSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    labels: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length === 5 && value.every((v) => String(v || "").trim());
        },
        message: "labels must contain 5 non-empty entries",
      },
    },
    emojis: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length === 5 &&
            value.every((v) => String(v || "").trim())
          );
        },
        message: "emojis must contain 5 non-empty entries",
      },
    },
    isDefault: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    defaultKey: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

InstructorEngagementTemplateSchema.index(
  { createdBy: 1, defaultKey: 1 },
  { unique: true, partialFilterExpression: { defaultKey: { $type: "string", $ne: "" } } },
);

module.exports = mongoose.model(
  "InstructorEngagementTemplate",
  InstructorEngagementTemplateSchema,
);
