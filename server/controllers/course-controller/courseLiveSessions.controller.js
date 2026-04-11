const mongoose = require("mongoose");
const Course = require("../../models/Course");
const { notifyLiveSessionsChanged } = require("../../services/liveSessionNotifications.service");

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_OCCURRENCES = 366;

/**
 * Expand calendar-based recurrence: daily or weekly on selected weekdays until recurrenceEndDate (inclusive).
 */
function expandByCalendarRule(s, at, durMs, endDateStr) {
  const until = new Date(endDateStr);
  if (Number.isNaN(until.getTime())) return [];

  until.setHours(23, 59, 59, 999);

  const frequency = String(s.recurrenceFrequency || "weekly").toLowerCase() === "daily" ? "daily" : "weekly";
  let repeatOn = Array.isArray(s.repeatOn)
    ? [...new Set(s.repeatOn.map((n) => parseInt(n, 10)).filter((n) => n >= 0 && n <= 6))].sort((a, b) => a - b)
    : [];
  if (frequency === "daily") {
    repeatOn = [0, 1, 2, 3, 4, 5, 6];
  } else if (!repeatOn.length) {
    repeatOn = [at.getDay()];
  }

  const startH = at.getHours();
  const startM = at.getMinutes();
  const startSec = at.getSeconds();
  const anchorMs = at.getTime();
  const untilTime = until.getTime();
  const meetingUrl = s.meetingUrl;

  const out = [];
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);

  let n = 0;
  while (d.getTime() <= untilTime && n < MAX_OCCURRENCES) {
    if (repeatOn.includes(d.getDay())) {
      const start = new Date(d);
      start.setHours(startH, startM, startSec, 0);
      if (start.getTime() >= anchorMs) {
        out.push({
          title: s.title,
          meetingUrl,
          scheduledAt: start.toISOString(),
          scheduledEnd: new Date(start.getTime() + durMs).toISOString(),
        });
        n += 1;
      }
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/**
 * Expands new sessions (no _id) with recurring=true:
 * - New shape: recurrenceEndDate + recurrenceFrequency + repeatOn (Tagmango-style).
 * - Legacy: recurrenceWeeks only (same weekday, +7 days each).
 */
function expandRecurringSessions(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const s of raw) {
    const hasId = s?._id && mongoose.Types.ObjectId.isValid(String(s._id));
    if (hasId) {
      out.push(s);
      continue;
    }
    if (!s.recurring) {
      out.push(s);
      continue;
    }

    const at = new Date(s?.scheduledAt);
    const endAt = new Date(s?.scheduledEnd);
    if (Number.isNaN(at.getTime()) || Number.isNaN(endAt.getTime())) {
      out.push(s);
      continue;
    }
    const durMs = endAt.getTime() - at.getTime();
    if (durMs <= 0) {
      out.push(s);
      continue;
    }

    const endDateStr = s.recurrenceEndDate || s.endsOn;

    if (endDateStr) {
      const expanded = expandByCalendarRule(s, at, durMs, endDateStr);
      if (expanded.length) {
        expanded.forEach((x) => out.push(x));
      } else {
        const { recurring: _r, recurrenceFrequency: _f, repeatOn: _p, recurrenceEndDate: _e, endsOn: _eo, sameLinkForAll: _s, recurrenceWeeks: _w, ...rest } = s;
        out.push(rest);
      }
      continue;
    }

    const weeks = Math.min(52, Math.max(1, parseInt(s.recurrenceWeeks, 10) || 8));
    if (weeks > 1) {
      for (let i = 0; i < weeks; i += 1) {
        const start = new Date(at.getTime() + i * WEEK_MS);
        const end = new Date(start.getTime() + durMs);
        out.push({
          title: s.title,
          meetingUrl: s.meetingUrl,
          scheduledAt: start.toISOString(),
          scheduledEnd: end.toISOString(),
        });
      }
      continue;
    }

    out.push(s);
  }
  return out;
}

/**
 * PUT /api/courses/:id/live-sessions
 * Body: { sessions: [{ title?, meetingUrl, scheduledAt, scheduledEnd, _id?,
 *   recurring?, recurrenceWeeks? (legacy), recurrenceFrequency?, repeatOn?, recurrenceEndDate?, sameLinkForAll? }] }
 * durationMinutes is derived from start/end when both are set.
 * Replaces the course liveSessions array (instructor-owned course only).
 */
async function updateCourseLiveSessions(req, res) {
  try {
    const courseId = req.params.id;
    const raw = req.body?.sessions;
    if (!Array.isArray(raw)) {
      return res.status(400).json({ success: false, message: "sessions must be an array" });
    }

    const expanded = expandRecurringSessions(raw);

    const mapped = expanded
      .map((s) => {
        const url = String(s?.meetingUrl || "").trim();
        const at = new Date(s?.scheduledAt);
        const endAt = new Date(s?.scheduledEnd);
        if (!url || Number.isNaN(at.getTime())) return null;
        try {
          // eslint-disable-next-line no-new
          new URL(url);
        } catch {
          return null;
        }
        let scheduledEnd = endAt;
        let durationMinutes;
        if (!Number.isNaN(scheduledEnd.getTime())) {
          const diffMs = scheduledEnd.getTime() - at.getTime();
          durationMinutes = Math.round(diffMs / (60 * 1000));
          if (durationMinutes < 5 || durationMinutes > 480) return null;
          if (scheduledEnd.getTime() <= at.getTime()) return null;
        } else {
          durationMinutes = Math.min(480, Math.max(5, Number(s?.durationMinutes) || 60));
          scheduledEnd = new Date(at.getTime() + durationMinutes * 60 * 1000);
        }
        const row = {
          title: String(s?.title || "").trim().slice(0, 200),
          meetingUrl: url,
          scheduledAt: at,
          scheduledEnd,
          durationMinutes,
        };
        if (s?._id && mongoose.Types.ObjectId.isValid(String(s._id))) {
          row._id = new mongoose.Types.ObjectId(String(s._id));
        }
        return row;
      })
      .filter(Boolean);

    if (expanded.length > 0 && mapped.length !== expanded.length) {
      return res.status(400).json({
        success: false,
        message:
          "Each session needs a valid https URL, start time, and end time at least 5 minutes after start (max 8 hours).",
      });
    }

    const courseBefore = await Course.findOne(
      { _id: courseId, isDeleted: { $ne: true } },
    )
      .select("liveSessions title")
      .lean();

    if (!courseBefore) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const course = await Course.findOneAndUpdate(
      { _id: courseId, isDeleted: { $ne: true } },
      { $set: { liveSessions: mapped, updatedBy: req.user._id } },
      { new: true, runValidators: true },
    )
      .select("liveSessions title")
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    setImmediate(() => {
      notifyLiveSessionsChanged({
        courseId: String(courseId),
        courseTitle: course.title || courseBefore.title,
        instructorUserId: req.user._id,
        beforeSessions: courseBefore.liveSessions || [],
        afterSessions: course.liveSessions || [],
      }).catch((e) => console.error("[liveSessionNotifications]", e.message || e));
    });

    return res.json({ success: true, data: course });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = { updateCourseLiveSessions };
