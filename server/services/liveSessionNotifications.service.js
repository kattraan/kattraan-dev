const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const LearnerCourses = require("../models/LearnerCourses");
const { sendEmail } = require("./gmailService");
const { createEmailTemplate } = require("./emailTemplates");
const {
  buildLiveSessionsCreatedContent,
  buildLiveSessionsCancelledContent,
  buildLiveSessionsUpdatedContent,
} = require("./liveSessionEmailTemplates");

const LOGO_ATTACHMENTS = [
  {
    filename: "logo.png",
    path: path.join(__dirname, "../../client/src/assets/logo.png"),
    cid: "kattranLogo",
  },
];

function isEmailConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function sessionFingerprint(s) {
  if (!s) return "";
  const at = new Date(s.scheduledAt).getTime();
  const et = new Date(s.scheduledEnd || s.scheduledAt).getTime();
  const url = String(s.meetingUrl || "").trim();
  const title = String(s.title || "").trim();
  return `${at}|${et}|${url}|${title}`;
}

/**
 * Compare saved subdocuments after a full-array replace.
 * Uses _id when present; falls back to time+url+title for legacy rows without _id.
 * @returns {{ added: object[], removed: object[], modified: { before: object, after: object }[] }}
 */
function diffLiveSessions(oldSessions = [], newSessions = []) {
  const oldArr = (oldSessions || []).filter(Boolean);
  const newArr = (newSessions || []).filter(Boolean);

  const newIdSet = new Set(
    newArr.filter((s) => s != null && s._id != null).map((s) => String(s._id)),
  );
  const oldIdSet = new Set(
    oldArr.filter((s) => s != null && s._id != null).map((s) => String(s._id)),
  );

  const newFpSet = new Set(newArr.map(sessionFingerprint));
  const oldFpSet = new Set(oldArr.map(sessionFingerprint));

  const removed = [];
  for (const o of oldArr) {
    if (o._id != null) {
      if (!newIdSet.has(String(o._id))) removed.push(o);
    } else if (!newFpSet.has(sessionFingerprint(o))) {
      removed.push(o);
    }
  }

  const added = [];
  for (const n of newArr) {
    if (n._id != null) {
      if (!oldIdSet.has(String(n._id))) added.push(n);
    } else if (!oldFpSet.has(sessionFingerprint(n))) {
      added.push(n);
    }
  }

  const modified = [];
  for (const n of newArr) {
    if (n == null || n._id == null) continue;
    const id = String(n._id);
    if (!oldIdSet.has(id)) continue;
    const o = oldArr.find((x) => x && x._id != null && String(x._id) === id);
    if (!o) continue;
    if (sessionFingerprint(o) !== sessionFingerprint(n)) {
      modified.push({ before: o, after: n });
    }
  }

  return { added, removed, modified };
}

function toPlainSession(s) {
  return {
    title: s.title,
    scheduledAt: s.scheduledAt,
    scheduledEnd: s.scheduledEnd,
  };
}

async function getEnrolledLearners(courseId, excludeUserId) {
  const cid = String(courseId).trim();
  const courseIdVariants = [cid];
  if (mongoose.Types.ObjectId.isValid(cid)) {
    courseIdVariants.push(new mongoose.Types.ObjectId(cid));
  }
  const docs = await LearnerCourses.find({
    courses: { $elemMatch: { courseId: { $in: courseIdVariants } } },
  }).lean();
  const ex = excludeUserId ? String(excludeUserId) : null;
  const userIds = [
    ...new Set(
      docs
        .map((d) => d.userId)
        .filter((id) => id && (!ex || String(id) !== ex)),
    ),
  ];
  if (userIds.length === 0) return [];
  const users = await User.find({ _id: { $in: userIds } })
    .select("userEmail userName")
    .lean();
  return users.filter((u) => u && u.userEmail);
}

async function sendMailSafe(to, subject, innerHtml) {
  await sendEmail({
    to,
    subject,
    message: createEmailTemplate(subject, innerHtml),
    attachments: LOGO_ATTACHMENTS,
  });
}

/**
 * Fire-and-forget friendly: notify instructor + learners when sessions are added, removed, or updated (same _id, changed time/link/title).
 */
async function notifyLiveSessionsChanged({
  courseId,
  courseTitle,
  instructorUserId,
  beforeSessions,
  afterSessions,
}) {
  const { added, removed, modified } = diffLiveSessions(beforeSessions, afterSessions);
  if (added.length === 0 && removed.length === 0 && modified.length === 0) {
    return;
  }

  if (!isEmailConfigured()) {
    console.warn(
      "[liveSessionNotifications] SMTP_USER/SMTP_PASS not set — live session emails skipped (add/update/delete notifications not sent).",
    );
    return;
  }

  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const watchUrl = `${base}/view-course/${courseId}/watch`;
  const titleSafe = courseTitle || "Your course";

  const addedPlain = added.map(toPlainSession);
  const removedPlain = removed.map(toPlainSession);
  const modifiedPlain = modified.map(({ before, after }) => ({
    before: toPlainSession(before),
    after: toPlainSession(after),
  }));

  try {
    const instId =
      instructorUserId != null && mongoose.Types.ObjectId.isValid(String(instructorUserId))
        ? new mongoose.Types.ObjectId(String(instructorUserId))
        : instructorUserId;
    const instructorDoc = await User.findById(instId).select("userName userEmail").lean();
    const instructorName = instructorDoc?.userName || "Instructor";
    const instructorEmail = instructorDoc?.userEmail;
    const instructor = instructorName;

    const learners = await getEnrolledLearners(courseId, instructorUserId);
    if (removed.length > 0 && learners.length === 0) {
      console.warn(
        "[liveSessionNotifications] cancellation skipped: no enrolled learners with email for course",
        String(courseId),
      );
    }

    if (removed.length > 0 && instructorEmail) {
      try {
        const html = buildLiveSessionsCancelledContent({
          recipientName: instructorName,
          courseTitle: titleSafe,
          sessions: removedPlain,
          instructorName,
          watchUrl,
          isInstructorRecipient: true,
        });
        await sendMailSafe(
          instructorEmail,
          `Live sessions removed — ${titleSafe}`,
          html,
        );
      } catch (e) {
        console.error("[liveSessionNotifications] instructor removal mail", e.message || e);
      }
    }

    if (added.length > 0 && instructorEmail) {
      try {
        const html = buildLiveSessionsCreatedContent({
          recipientName: instructorName,
          courseTitle: titleSafe,
          sessions: addedPlain,
          instructorName: instructor,
          isInstructor: true,
          watchUrl,
        });
        await sendMailSafe(
          instructorEmail,
          `Live sessions scheduled — ${titleSafe}`,
          html,
        );
      } catch (e) {
        console.error("[liveSessionNotifications] instructor mail", e.message || e);
      }
    }

    if (added.length > 0 && learners.length > 0) {
      await Promise.allSettled(
        learners.map((u) =>
          sendMailSafe(
            u.userEmail,
            `New live sessions: ${titleSafe}`,
            buildLiveSessionsCreatedContent({
              recipientName: u.userName,
              courseTitle: titleSafe,
              sessions: addedPlain,
              instructorName: instructor,
              isInstructor: false,
              watchUrl,
            }),
          ),
        ),
      );
    }

    if (removed.length > 0 && learners.length > 0) {
      await Promise.allSettled(
        learners.map((u) =>
          sendMailSafe(
            u.userEmail,
            `Live session cancelled — ${titleSafe}`,
            buildLiveSessionsCancelledContent({
              recipientName: u.userName,
              courseTitle: titleSafe,
              sessions: removedPlain,
              instructorName: instructor,
              watchUrl,
              isInstructorRecipient: false,
            }),
          ),
        ),
      );
    }

    if (modified.length > 0 && instructorEmail) {
      try {
        await sendMailSafe(
          instructorEmail,
          `Live schedule updated — ${titleSafe}`,
          buildLiveSessionsUpdatedContent({
            recipientName: instructorName,
            courseTitle: titleSafe,
            updates: modifiedPlain,
            instructorName: instructor,
            isInstructor: true,
            watchUrl,
          }),
        );
      } catch (e) {
        console.error("[liveSessionNotifications] instructor update mail", e.message || e);
      }
    }

    if (modified.length > 0 && learners.length > 0) {
      await Promise.allSettled(
        learners.map((u) =>
          sendMailSafe(
            u.userEmail,
            `Live session schedule updated — ${titleSafe}`,
            buildLiveSessionsUpdatedContent({
              recipientName: u.userName,
              courseTitle: titleSafe,
              updates: modifiedPlain,
              instructorName: instructor,
              isInstructor: false,
              watchUrl,
            }),
          ),
        ),
      );
    }
  } catch (err) {
    console.error("[liveSessionNotifications]", err.message || err);
  }
}

module.exports = {
  diffLiveSessions,
  notifyLiveSessionsChanged,
};
