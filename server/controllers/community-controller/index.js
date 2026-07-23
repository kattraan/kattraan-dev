const Community = require("../../models/Community");
const CommunityMembership = require("../../models/CommunityMembership");
const CommunityMessage = require("../../models/CommunityMessage");
const Course = require("../../models/Course");
const LearnerCourses = require("../../models/LearnerCourses");
const { isAdmin } = require("../../middleware/communityOwnership");
const { uploadMediaToBunny } = require("../../helpers/bunnyStorage");

const MESSAGES_PAGE_SIZE = 30;
const REPLY_POPULATE = {
  path: "replyTo",
  select: "body sender",
  populate: { path: "sender", select: "userName" },
};

const primaryRole = (req) => {
  const roles = req.user.roleNames || [];
  if (roles.includes("admin")) return "admin";
  if (roles.includes("instructor")) return "instructor";
  return "learner";
};

/** Enrolled learners, the course's own instructor, or any admin may request to join. */
const isEligibleToJoin = async (req, courseId) => {
  if (isAdmin(req)) return true;
  const course = await Course.findById(courseId).select("createdBy").lean();
  if (course?.createdBy && String(course.createdBy) === String(req.user._id)) return true;
  if (primaryRole(req) === "instructor") return true;
  const doc = await LearnerCourses.findOne({
    userId: req.user._id.toString(),
    "courses.courseId": courseId.toString(),
  }).lean();
  return !!doc;
};

const getMembershipStatus = async (community, req) => {
  if (isAdmin(req)) return "admin";
  if (String(community.createdBy) === String(req.user._id)) return "owner";
  const membership = await CommunityMembership.findOne({
    community: community._id,
    user: req.user._id,
  })
    .select("status")
    .lean();
  return membership ? membership.status : "none";
};

// =======================
// Create Community
// =======================
const createCommunity = async (req, res) => {
  try {
    const { course: courseId, name, description } = req.body;

    const course = await Course.findOne({ _id: courseId, isDeleted: { $ne: true } }).lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (!isAdmin(req) && String(course.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only create a community for your own course" });
    }

    const existing = await Community.findOne({ course: courseId, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ success: false, message: "This course already has a community" });
    }

    const community = await Community.create({
      course: courseId,
      name,
      description: description || "",
      createdBy: req.user._id,
    });

    await CommunityMembership.create({
      community: community._id,
      user: req.user._id,
      role: "owner",
      status: "approved",
      decidedBy: req.user._id,
      decidedAt: new Date(),
    });

    res.status(201).json({ success: true, community });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "This course already has a community" });
    }
    console.error("Create Community Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// List Communities (role-scoped)
// =======================
const listCommunities = async (req, res) => {
  try {
    let filter = { isDeleted: { $ne: true } };

    if (isAdmin(req)) {
      // no extra filter — admin sees all
    } else if (primaryRole(req) === "instructor") {
      filter.createdBy = req.user._id;
    } else {
      const learnerDoc = await LearnerCourses.findOne({ userId: req.user._id.toString() }).lean();
      const courseIds = (learnerDoc?.courses || []).map((c) => c.courseId);
      filter.course = { $in: courseIds };
    }

    const communities = await Community.find(filter)
      .populate("course", "title thumbnail")
      .sort({ createdAt: -1 })
      .lean();

    const withStatus = await Promise.all(
      communities.map(async (c) => ({
        ...c,
        membershipStatus: await getMembershipStatus(c, req),
      }))
    );

    res.json({ success: true, communities: withStatus });
  } catch (error) {
    console.error("List Communities Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Get Community Detail
// =======================
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate("course", "title thumbnail")
      .lean();
    if (!community) return res.status(404).json({ success: false, message: "Community not found" });

    const membershipStatus = await getMembershipStatus(community, req);
    res.json({ success: true, community: { ...community, membershipStatus } });
  } catch (error) {
    console.error("Get Community Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Update Community (owner/admin via requireCommunityOwner)
// =======================
const updateCommunity = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    update.updatedBy = req.user._id;
    update.updatedAt = new Date();

    const community = await Community.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, community });
  } catch (error) {
    console.error("Update Community Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Archive / Soft-delete Community (owner/admin)
// =======================
const archiveCommunity = async (req, res) => {
  try {
    await Community.findByIdAndUpdate(req.params.id, {
      status: "archived",
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: String(req.user._id),
    });
    res.json({ success: true, message: "Community archived" });
  } catch (error) {
    console.error("Archive Community Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Request to Join
// =======================
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
    if (!community) return res.status(404).json({ success: false, message: "Community not found" });

    const eligible = await isEligibleToJoin(req, community.course);
    if (!eligible) {
      return res.status(403).json({ success: false, message: "You must be enrolled in this course to request access" });
    }

    let membership = await CommunityMembership.findOne({ community: community._id, user: req.user._id });

    if (membership && ["pending", "approved"].includes(membership.status)) {
      return res.json({ success: true, membership });
    }

    if (membership) {
      membership.status = "pending";
      membership.decidedBy = undefined;
      membership.decidedAt = undefined;
      await membership.save();
    } else {
      membership = await CommunityMembership.create({
        community: community._id,
        user: req.user._id,
        role: "member",
        status: "pending",
      });
    }

    res.status(201).json({ success: true, membership });
  } catch (error) {
    console.error("Join Community Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Leave Community (self-service)
// =======================
const leaveCommunity = async (req, res) => {
  try {
    const membership = await CommunityMembership.findOne({
      community: req.params.id,
      user: req.user._id,
    });

    if (!membership || !["pending", "approved"].includes(membership.status)) {
      return res.status(400).json({ success: false, message: "You are not a member of this community" });
    }

    if (membership.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "Owners cannot leave their own community. Archive it instead.",
      });
    }

    membership.status = "removed";
    membership.decidedBy = req.user._id;
    membership.decidedAt = new Date();
    await membership.save();

    res.json({ success: true, message: "You have left the community" });
  } catch (error) {
    console.error("Leave Community Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// List Pending Join Requests (owner/admin)
// =======================
const listJoinRequests = async (req, res) => {
  try {
    const requests = await CommunityMembership.find({
      community: req.params.id,
      status: "pending",
    })
      .populate("user", "userName userEmail")
      .sort({ createdAt: 1 })
      .lean();
    res.json({ success: true, requests });
  } catch (error) {
    console.error("List Join Requests Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Approve / Reject Join Request (owner/admin)
// =======================
const decideJoinRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    const membership = await CommunityMembership.findOne({
      community: req.params.id,
      user: req.params.userId,
    });
    if (!membership) return res.status(404).json({ success: false, message: "Join request not found" });

    membership.status = action === "approve" ? "approved" : "rejected";
    membership.decidedBy = req.user._id;
    membership.decidedAt = new Date();
    await membership.save();

    let communityTitle = "a community";
    try {
      const community = await Community.findById(req.params.id).select("name").lean();
      communityTitle = community?.name || communityTitle;
    } catch (_) {
      /* ignore */
    }

    try {
      const { getIO } = require("../../socket");
      getIO()
        ?.to(`user:${membership.user}`)
        .emit("community-request-decided", {
          communityId: req.params.id,
          status: membership.status,
        });
    } catch (_) {
      // Socket layer is best-effort for notifications; REST flow must not fail because of it.
    }

    try {
      const notificationService = require("../../services/notification.service");
      const approved = membership.status === "approved";
      await notificationService.createNotification({
        userId: membership.user,
        type: "community_join_decided",
        title: approved ? "Community join approved" : "Community join declined",
        body: approved
          ? `You were approved to join ${communityTitle}.`
          : `Your request to join ${communityTitle} was declined.`,
        link: approved ? `/dashboard/community/${req.params.id}` : "/dashboard/community",
        meta: {
          communityId: String(req.params.id),
          status: membership.status,
        },
      });
    } catch (e) {
      console.error("[decideJoinRequest] notification", e.message || e);
    }

    res.json({ success: true, membership });
  } catch (error) {
    console.error("Decide Join Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// List Approved Members
// =======================
const listMembers = async (req, res) => {
  try {
    const members = await CommunityMembership.find({
      community: req.params.id,
      status: "approved",
    })
      .populate("user", "userName userEmail")
      .sort({ createdAt: 1 })
      .lean();
    res.json({ success: true, members });
  } catch (error) {
    console.error("List Members Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Remove Member (owner/admin)
// =======================
const removeMember = async (req, res) => {
  try {
    const membership = await CommunityMembership.findOneAndUpdate(
      { community: req.params.id, user: req.params.userId },
      { status: "removed", decidedBy: req.user._id, decidedAt: new Date() },
      { new: true }
    );
    if (!membership) return res.status(404).json({ success: false, message: "Member not found" });

    let communityName = "a community";
    try {
      const community = await Community.findById(req.params.id).select("name").lean();
      communityName = community?.name || communityName;
    } catch (_) {
      /* ignore */
    }

    try {
      const { getIO } = require("../../socket");
      getIO()?.to(`user:${req.params.userId}`).emit("community-removed", { communityId: req.params.id });
    } catch (_) {
      // best-effort
    }

    try {
      const notificationService = require("../../services/notification.service");
      await notificationService.createNotification({
        userId: req.params.userId,
        type: "community_removed",
        title: "Removed from community",
        body: `You were removed from ${communityName}.`,
        link: "/dashboard/community",
        meta: { communityId: String(req.params.id) },
      });
    } catch (e) {
      console.error("[removeMember] notification", e.message || e);
    }

    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Paginated Message History
// =======================
const getMessages = async (req, res) => {
  try {
    const { before, limit } = req.query;
    const filter = { community: req.params.id, isDeleted: false };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const pageSize = Math.min(parseInt(limit, 10) || MESSAGES_PAGE_SIZE, 100);
    const messages = await CommunityMessage.find(filter)
      .populate("sender", "userName")
      .populate(REPLY_POPULATE)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Search Messages
// =======================
const searchMessages = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, messages: [] });

    const messages = await CommunityMessage.find({
      community: req.params.id,
      isDeleted: false,
      body: { $regex: q.trim(), $options: "i" },
    })
      .populate("sender", "userName")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Search Messages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Pinned Messages
// =======================
const getPinnedMessages = async (req, res) => {
  try {
    const messages = await CommunityMessage.find({
      community: req.params.id,
      isPinned: true,
      isDeleted: false,
    })
      .populate("sender", "userName")
      .sort({ pinnedAt: -1 })
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Get Pinned Messages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// Upload Chat Attachment (metadata only — message is created via the
// send-message socket event so there is a single real-time creation path)
// =======================
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    const { key, url } = await uploadMediaToBunny(req.file.path);
    res.status(201).json({
      success: true,
      attachment: {
        url,
        key,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload Attachment Error:", error);
    res.status(500).json({ success: false, message: "Error uploading file: " + (error.message || "Unknown error") });
  }
};

module.exports = {
  createCommunity,
  listCommunities,
  getCommunity,
  updateCommunity,
  archiveCommunity,
  joinCommunity,
  leaveCommunity,
  listJoinRequests,
  decideJoinRequest,
  listMembers,
  removeMember,
  getMessages,
  searchMessages,
  getPinnedMessages,
  uploadAttachment,
};
