/**
 * HTML fragments for live-session transactional emails (embedded in createEmailTemplate).
 * Uses inline styles for better client compatibility.
 */

function escapeHtml(s) {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getDisplayTimeZone() {
  return process.env.LIVE_SESSION_EMAIL_TZ || "Asia/Kolkata";
}

/**
 * @param {Date|string} start
 * @param {Date|string} end
 */
function formatSessionRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const tz = getDisplayTimeZone();
  const dayFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: tz,
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });
  const day = dayFmt.format(s).toUpperCase();
  const t1 = timeFmt.format(s);
  const t2 = timeFmt.format(e);
  return `${day} · ${t1} – ${t2}`;
}

function calendarStub(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return { month: "—", day: "—" };
  }
  const tz = getDisplayTimeZone();
  const m = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: tz }).format(d);
  const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: tz }).format(d);
  return { month: m.toUpperCase(), day: dayNum };
}

function sessionRowsHtml(sessions) {
  if (!sessions || sessions.length === 0) {
    return '<p style="color:rgba(255,255,255,0.6);">No session rows.</p>';
  }
  return sessions
    .map((sess) => {
      const title = escapeHtml(sess.title || "Live session");
      const range = formatSessionRange(sess.scheduledAt, sess.scheduledEnd);
      const { month, day } = calendarStub(sess.scheduledAt);
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;border-collapse:collapse;">
  <tr>
    <td style="width:56px;vertical-align:top;padding-right:12px;">
      <div style="border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.15);">
        <div style="background:linear-gradient(90deg,#ff3fb4 0%,#9e30ff 100%);color:#fff;font-size:11px;font-weight:700;text-align:center;padding:5px 6px;">${escapeHtml(
          month,
        )}</div>
        <div style="background:#1a1625;color:#fff;font-size:22px;font-weight:800;text-align:center;padding:6px 4px;">${escapeHtml(
          day,
        )}</div>
      </div>
    </td>
    <td style="vertical-align:top;text-align:left;">
      <p style="margin:0 0 4px 0;color:#ffffff;font-weight:700;font-size:15px;">${range}</p>
      <p style="margin:0;color:rgba(255,255,255,0.65);font-size:14px;">${title} · <span style="color:#a78bfa;">live</span></p>
    </td>
  </tr>
</table>`;
    })
    .join("");
}

/**
 * @param {object} opts
 * @param {string} opts.recipientName
 * @param {string} opts.courseTitle
 * @param {Array<{ title?: string, scheduledAt: Date, scheduledEnd: Date }>} opts.sessions
 * @param {string} opts.instructorName
 * @param {boolean} opts.isInstructor
 * @param {string} opts.watchUrl
 */
function buildLiveSessionsCreatedContent(opts) {
  const {
    recipientName,
    courseTitle,
    sessions,
    instructorName,
    isInstructor,
    watchUrl,
  } = opts;
  const name = escapeHtml(recipientName || "there");
  const course = escapeHtml(courseTitle || "your course");
  const instructor = escapeHtml(instructorName || "your instructor");
  const rows = sessionRowsHtml(sessions);

  const intro = isInstructor
    ? `<p style="color:rgba(255,255,255,0.85);">Your live video sessions for <strong style="color:#fff;">${course}</strong> are saved. Here is what learners will see in their schedule:</p>
       <p style="color:rgba(255,255,255,0.65);font-size:14px;">Enrolled learners are notified by email. They can join from the course page; the meeting link opens at the scheduled time.</p>`
    : `<p style="color:rgba(255,255,255,0.85);"><strong style="color:#fff;">${instructor}</strong> scheduled new live sessions for <strong style="color:#fff;">${course}</strong>.</p>
       <p style="color:rgba(255,255,255,0.65);font-size:14px;">Open your course below to see the full list and join links when it is time.</p>`;

  return `<h2 style="color:#ffffff;margin-top:0;">Hey ${name},</h2>
${intro}
<div style="margin:24px 0;padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);text-align:left;">
  <p style="margin:0 0 12px 0;font-size:12px;font-weight:800;letter-spacing:0.12em;color:#a78bfa;">UPCOMING LIVE SESSIONS</p>
  ${rows}
</div>
<div style="text-align:center;margin-top:8px;">
  <a href="${escapeHtml(watchUrl)}" class="cta-button">Open course &amp; live sessions</a>
</div>
<p style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:28px;">Questions? Reply to this email or contact ${escapeHtml(
    process.env.SUPPORT_EMAIL || "support@kattraan.com",
  )}.</p>
<p style="color:rgba(255,255,255,0.55);margin-bottom:0;">Cheers,<br/><strong style="color:#fff;">Team Kattraan</strong></p>`;
}

/**
 * @param {object} opts
 * @param {string} opts.recipientName
 * @param {string} opts.courseTitle
 * @param {Array<{ title?: string, scheduledAt: Date, scheduledEnd: Date }>} opts.sessions
 * @param {string} opts.instructorName
 * @param {string} opts.watchUrl
 */
function buildLiveSessionsCancelledContent(opts) {
  const {
    recipientName,
    courseTitle,
    sessions,
    instructorName,
    watchUrl,
    isInstructorRecipient = false,
  } = opts;
  const name = escapeHtml(recipientName || "there");
  const course = escapeHtml(courseTitle || "your course");
  const instructor = escapeHtml(instructorName || "The instructor");
  const rows = sessionRowsHtml(sessions);

  const cancelIntro = isInstructorRecipient
    ? `<p style="color:rgba(255,255,255,0.85);">You removed the following live session(s) from <strong style="color:#fff;">${course}</strong>. Enrolled learners were sent a cancellation email (when email is configured).</p>`
    : `<p style="color:rgba(255,255,255,0.85);">${instructor} cancelled the following live session(s) on <strong style="color:#fff;">${course}</strong>.</p>`;

  return `<h2 style="color:#ffffff;margin-top:0;">Hey ${name},</h2>
${cancelIntro}
<div style="margin:24px 0;padding:20px;border-radius:16px;border:1px solid rgba(248,113,113,0.35);background:rgba(248,113,113,0.06);text-align:left;">
  <p style="margin:0 0 12px 0;font-size:12px;font-weight:800;letter-spacing:0.12em;color:#fca5a5;">CANCELLED SESSIONS</p>
  ${rows}
</div>
<p style="color:rgba(255,255,255,0.65);font-size:14px;">If the schedule changes again, we will let you know. You can always open the course for the latest live sessions.</p>
<div style="text-align:center;margin-top:8px;">
  <a href="${escapeHtml(watchUrl)}" class="cta-button">View course</a>
</div>
<p style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:28px;">Need help? Contact ${escapeHtml(
    process.env.SUPPORT_EMAIL || "support@kattraan.com",
  )}.</p>
<p style="color:rgba(255,255,255,0.55);margin-bottom:0;">Cheers,<br/><strong style="color:#fff;">Team Kattraan</strong></p>`;
}

function sessionUpdateRowsHtml(updates) {
  if (!updates || updates.length === 0) {
    return '<p style="color:rgba(255,255,255,0.6);">No updates.</p>';
  }
  return updates
    .map(({ before, after }) => {
      const title = escapeHtml(after.title || before.title || "Live session");
      const oldRange = formatSessionRange(before.scheduledAt, before.scheduledEnd);
      const newRange = formatSessionRange(after.scheduledAt, after.scheduledEnd);
      return `<div style="margin:16px 0;padding:14px;border-radius:12px;border:1px solid rgba(167,139,250,0.35);background:rgba(167,139,250,0.06);text-align:left;">
  <p style="margin:0 0 8px 0;color:#ffffff;font-weight:700;font-size:15px;">${title}</p>
  <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;text-decoration:line-through;">Was: ${escapeHtml(oldRange)}</p>
  <p style="margin:4px 0 0 0;color:#c4b5fd;font-size:14px;font-weight:600;">Now: ${escapeHtml(newRange)}</p>
</div>`;
    })
    .join("");
}

/**
 * @param {object} opts
 * @param {Array<{ before: { title?, scheduledAt, scheduledEnd }, after: { title?, scheduledAt, scheduledEnd } }>} opts.updates
 */
function buildLiveSessionsUpdatedContent(opts) {
  const {
    recipientName,
    courseTitle,
    updates,
    instructorName,
    isInstructor,
    watchUrl,
  } = opts;
  const name = escapeHtml(recipientName || "there");
  const course = escapeHtml(courseTitle || "your course");
  const instructor = escapeHtml(instructorName || "your instructor");
  const rows = sessionUpdateRowsHtml(updates);

  const intro = isInstructor
    ? `<p style="color:rgba(255,255,255,0.85);">You updated the live session schedule for <strong style="color:#fff;">${course}</strong>. Learners were notified by email.</p>`
    : `<p style="color:rgba(255,255,255,0.85);"><strong style="color:#fff;">${instructor}</strong> updated the live session schedule for <strong style="color:#fff;">${course}</strong>.</p>`;

  return `<h2 style="color:#ffffff;margin-top:0;">Hey ${name},</h2>
${intro}
<div style="margin:24px 0;padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);text-align:left;">
  <p style="margin:0 0 12px 0;font-size:12px;font-weight:800;letter-spacing:0.12em;color:#a78bfa;">UPDATED SESSIONS</p>
  ${rows}
</div>
<div style="text-align:center;margin-top:8px;">
  <a href="${escapeHtml(watchUrl)}" class="cta-button">Open course &amp; live sessions</a>
</div>
<p style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:28px;">Questions? Contact ${escapeHtml(
    process.env.SUPPORT_EMAIL || "support@kattraan.com",
  )}.</p>
<p style="color:rgba(255,255,255,0.55);margin-bottom:0;">Cheers,<br/><strong style="color:#fff;">Team Kattraan</strong></p>`;
}

module.exports = {
  escapeHtml,
  buildLiveSessionsCreatedContent,
  buildLiveSessionsCancelledContent,
  buildLiveSessionsUpdatedContent,
};
