const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    key: { type: String, required: true },
  },
  { _id: false }
);

const ReactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const CommunityMessageSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  body: { type: String, required: true, trim: true, maxlength: 2000 },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityMessage" },
  editedAt: { type: Date },
  attachments: { type: [AttachmentSchema], default: [] },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  mentionsEveryone: { type: Boolean, default: false },
  reactions: { type: [ReactionSchema], default: [] },
  isPinned: { type: Boolean, default: false },
  pinnedAt: { type: Date },
  pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

CommunityMessageSchema.index({ community: 1, createdAt: -1 });
CommunityMessageSchema.index({ community: 1, isPinned: 1 });
CommunityMessageSchema.index({ community: 1, body: "text" });

module.exports = mongoose.model("CommunityMessage", CommunityMessageSchema);
