const mongoose = require("mongoose");

const CommunityMembershipSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "moderator", "member"], default: "member" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "removed"],
    default: "pending",
  },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  decidedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

CommunityMembershipSchema.index({ community: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("CommunityMembership", CommunityMembershipSchema);
