// _shared/BaseContent.js
const mongoose = require("mongoose");
const AuditFields = require("./AuditFields");
const SoftDelete = require("./SoftDelete");

const BaseContent = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String, // URL of thumbnail (for video, audio, article, etc.)
  },
  order: {
    type: Number,
    default: 0,
  },
  ...AuditFields,
  ...SoftDelete,
};

module.exports = BaseContent;
