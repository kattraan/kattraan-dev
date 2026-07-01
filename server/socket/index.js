const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const Blacklist = require("../models/Blacklist");
const User = require("../models/User");
const Community = require("../models/Community");
const CommunityMembership = require("../models/CommunityMembership");
const CommunityMessage = require("../models/CommunityMessage");

let io = null;

/** communityId -> Set<userId> currently joined to that room's socket(s). */
const onlineByCommunity = new Map();

const communityRoom = (communityId) => `community:${communityId}`;
const userRoom = (userId) => `user:${userId}`;
const REPLY_SNIPPET_LENGTH = 80;
const QUICK_REACTIONS = new Set(["👍", "❤️", "😂", "😮", "😢", "🙏"]);

const isAdmin = (socket) =>
  Array.isArray(socket.user?.roleNames) &&
  socket.user.roleNames.map((r) => String(r).toLowerCase()).includes("admin");

/** Re-checks membership against the DB — sockets bypass the Express middleware chain. */
async function canAccessCommunity(socket, communityId) {
  const community = await Community.findOne({ _id: communityId, isDeleted: { $ne: true } }).lean();
  if (!community) return { ok: false };
  if (isAdmin(socket) || String(community.createdBy) === String(socket.user._id)) {
    return { ok: true, community, role: "owner" };
  }
  const membership = await CommunityMembership.findOne({
    community: communityId,
    user: socket.user._id,
    status: "approved",
  }).lean();
  if (!membership) return { ok: false };
  return { ok: true, community, role: membership.role };
}

/**
 * Matches @token patterns in a message body against the community's mentionable
 * users (approved members + owner). Tokens are compared against userName with
 * whitespace stripped, case-insensitive — a deliberate simplification since
 * userName has no uniqueness/no-space constraint at the model level.
 * @returns {Promise<{ mentions: string[], mentionsEveryone: boolean }>}
 */
async function resolveMentions(body, communityId, canMentionEveryone) {
  const tokens = [...body.matchAll(/@([a-zA-Z0-9_]+)/g)].map((m) => m[1].toLowerCase());
  if (tokens.length === 0) return { mentions: [], mentionsEveryone: false };

  const mentionsEveryone = canMentionEveryone && tokens.includes("everyone");

  const memberships = await CommunityMembership.find({ community: communityId, status: "approved" })
    .populate("user", "userName")
    .lean();
  const community = await Community.findById(communityId).select("createdBy").populate("createdBy", "userName").lean();

  const candidates = memberships
    .map((m) => m.user)
    .concat(community?.createdBy ? [community.createdBy] : [])
    .filter(Boolean);

  const mentions = candidates
    .filter((u) => tokens.includes(String(u.userName).replace(/\s+/g, "").toLowerCase()))
    .map((u) => u._id);

  return { mentions: [...new Set(mentions.map(String))], mentionsEveryone };
}

function addOnline(communityId, userId) {
  if (!onlineByCommunity.has(communityId)) onlineByCommunity.set(communityId, new Set());
  onlineByCommunity.get(communityId).add(String(userId));
}

function removeOnline(communityId, userId) {
  const set = onlineByCommunity.get(communityId);
  if (!set) return;
  set.delete(String(userId));
  if (set.size === 0) onlineByCommunity.delete(communityId);
}

function emitPresence(communityId) {
  const onlineUserIds = [...(onlineByCommunity.get(communityId) || [])];
  io.to(communityRoom(communityId)).emit("presence-update", { communityId, onlineUserIds });
}

/**
 * Initializes the Socket.IO server for the community live-chat feature.
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  const app = require("../app");

  io = new Server(httpServer, {
    cors: {
      origin: app.clientOrigin,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Authenticate the handshake the same way middleware/auth-middleware.js authenticates REST requests.
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie || "";
      const parsed = cookie.parse(rawCookie);
      const token = parsed.accessToken;
      if (!token) return next(new Error("Unauthorized"));

      const blacklisted = await Blacklist.findOne({ token });
      if (blacklisted) return next(new Error("Unauthorized"));

      const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
      const userId = payload._id || payload.user_id;
      const userDoc = await User.findById(userId).select("userName").lean();

      socket.user = {
        _id: userId,
        userName: userDoc?.userName || "Member",
        roles: Array.isArray(payload.roles || payload.role_id)
          ? payload.roles || payload.role_id
          : [payload.roles || payload.role_id],
        roleNames: payload.roleNames || [],
      };
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.user._id));
    socket.data.joinedCommunities = new Set();

    socket.on("join-community", async ({ communityId } = {}) => {
      const { ok } = await canAccessCommunity(socket, communityId);
      if (!ok) return socket.emit("error", { message: "Not a member of this community" });
      socket.join(communityRoom(communityId));
      socket.data.joinedCommunities.add(communityId);
      addOnline(communityId, socket.user._id);
      socket.emit("joined-community", { communityId });
      emitPresence(communityId);
    });

    socket.on("leave-community", ({ communityId } = {}) => {
      socket.leave(communityRoom(communityId));
      socket.data.joinedCommunities.delete(communityId);
      removeOnline(communityId, socket.user._id);
      emitPresence(communityId);
    });

    socket.on("send-message", async ({ communityId, body, replyTo, attachments } = {}) => {
      const trimmed = typeof body === "string" ? body.trim() : "";
      const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
      if (!trimmed && !hasAttachments) return;
      const { ok, role } = await canAccessCommunity(socket, communityId);
      if (!ok) return socket.emit("error", { message: "Not a member of this community" });

      const canMentionEveryone = role === "owner" || role === "moderator";
      const { mentions, mentionsEveryone } = await resolveMentions(
        trimmed,
        communityId,
        canMentionEveryone
      );

      let replySnippet = null;
      if (replyTo) {
        const original = await CommunityMessage.findOne({ _id: replyTo, community: communityId })
          .populate("sender", "userName")
          .lean();
        if (original) {
          replySnippet = {
            _id: original._id,
            senderName: original.sender?.userName || "Member",
            body: original.body.slice(0, REPLY_SNIPPET_LENGTH),
          };
        }
      }

      const message = await CommunityMessage.create({
        community: communityId,
        sender: socket.user._id,
        body: trimmed,
        replyTo: replySnippet ? replySnippet._id : undefined,
        attachments: hasAttachments ? attachments : [],
        mentions,
        mentionsEveryone,
      });

      io.to(communityRoom(communityId)).emit("new-message", {
        _id: message._id,
        community: communityId,
        sender: { _id: socket.user._id, userName: socket.user.userName },
        body: message.body,
        createdAt: message.createdAt,
        attachments: message.attachments,
        mentions: message.mentions,
        mentionsEveryone: message.mentionsEveryone,
        replyTo: replySnippet,
        reactions: [],
      });
    });

    socket.on("edit-message", async ({ communityId, messageId, body } = {}) => {
      const trimmed = typeof body === "string" ? body.trim() : "";
      if (!trimmed) return;
      const { ok } = await canAccessCommunity(socket, communityId);
      if (!ok) return socket.emit("error", { message: "Not a member of this community" });

      const message = await CommunityMessage.findById(messageId);
      if (!message || String(message.community) !== String(communityId)) return;
      if (String(message.sender) !== String(socket.user._id)) {
        return socket.emit("error", { message: "You can only edit your own messages" });
      }

      message.body = trimmed;
      message.editedAt = new Date();
      await message.save();

      io.to(communityRoom(communityId)).emit("message-edited", {
        messageId,
        body: message.body,
        editedAt: message.editedAt,
      });
    });

    socket.on("delete-message", async ({ communityId, messageId } = {}) => {
      const { ok, role } = await canAccessCommunity(socket, communityId);
      if (!ok) return socket.emit("error", { message: "Not a member of this community" });

      const message = await CommunityMessage.findById(messageId);
      if (!message || String(message.community) !== String(communityId)) return;

      const canDelete = role === "owner" || role === "moderator" || String(message.sender) === String(socket.user._id);
      if (!canDelete) return socket.emit("error", { message: "Not authorized to delete this message" });

      message.isDeleted = true;
      await message.save();
      io.to(communityRoom(communityId)).emit("message-deleted", { messageId });
    });

    socket.on("toggle-reaction", async ({ communityId, messageId, emoji } = {}) => {
      if (!QUICK_REACTIONS.has(emoji)) return;
      const { ok } = await canAccessCommunity(socket, communityId);
      if (!ok) return socket.emit("error", { message: "Not a member of this community" });

      const message = await CommunityMessage.findById(messageId);
      if (!message || String(message.community) !== String(communityId)) return;

      const userId = String(socket.user._id);
      const bucket = message.reactions.find((r) => r.emoji === emoji);

      if (bucket) {
        const idx = bucket.users.findIndex((u) => String(u) === userId);
        if (idx >= 0) {
          bucket.users.splice(idx, 1);
          if (bucket.users.length === 0) {
            message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
          }
        } else {
          bucket.users.push(socket.user._id);
        }
      } else {
        message.reactions.push({ emoji, users: [socket.user._id] });
      }

      await message.save();
      io.to(communityRoom(communityId)).emit("reaction-updated", {
        messageId,
        reactions: message.reactions,
      });
    });

    socket.on("pin-message", async ({ communityId, messageId } = {}) => {
      const { ok, role } = await canAccessCommunity(socket, communityId);
      if (!ok || (role !== "owner" && role !== "moderator")) {
        return socket.emit("error", { message: "Not authorized to pin messages" });
      }

      const message = await CommunityMessage.findById(messageId);
      if (!message || String(message.community) !== String(communityId)) return;

      message.isPinned = true;
      message.pinnedAt = new Date();
      message.pinnedBy = socket.user._id;
      await message.save();

      io.to(communityRoom(communityId)).emit("message-pinned", {
        messageId,
        pinnedAt: message.pinnedAt,
      });
    });

    socket.on("unpin-message", async ({ communityId, messageId } = {}) => {
      const { ok, role } = await canAccessCommunity(socket, communityId);
      if (!ok || (role !== "owner" && role !== "moderator")) {
        return socket.emit("error", { message: "Not authorized to unpin messages" });
      }

      const message = await CommunityMessage.findById(messageId);
      if (!message || String(message.community) !== String(communityId)) return;

      message.isPinned = false;
      message.pinnedAt = undefined;
      message.pinnedBy = undefined;
      await message.save();

      io.to(communityRoom(communityId)).emit("message-unpinned", { messageId });
    });

    socket.on("typing", ({ communityId } = {}) => {
      socket.to(communityRoom(communityId)).emit("user-typing", {
        userId: socket.user._id,
      });
    });

    socket.on("disconnect", () => {
      for (const communityId of socket.data.joinedCommunities) {
        removeOnline(communityId, socket.user._id);
        emitPresence(communityId);
      }
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
