function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a print dialog with a simple certificate (user can save as PDF).
 * @returns {boolean} false if the popup was blocked
 */
export function openCourseCertificatePrint({
  courseTitle,
  learnerName,
  issuedDate,
}) {
  const title = escapeHtml(courseTitle || "Course");
  const name = escapeHtml(learnerName || "Learner");
  const dateStr = escapeHtml(
    issuedDate instanceof Date
      ? issuedDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : String(issuedDate || new Date().toLocaleDateString()),
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Certificate — ${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Georgia, "Times New Roman", serif;
      background: #f4f4f5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .frame {
      width: 100%;
      max-width: 720px;
      margin: 24px;
      padding: 4px;
      border-radius: 8px;
      background: linear-gradient(135deg, #ff8c42 0%, #ff3fb4 100%);
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    }
    .inner {
      background: #fff;
      border-radius: 6px;
      padding: 48px 40px 40px;
      text-align: center;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 0.35em;
      font-weight: 700;
      color: #ff3fb4;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #18181b;
      margin: 0 0 8px;
    }
    .sub {
      font-size: 14px;
      color: #71717a;
      margin-bottom: 28px;
    }
    .name {
      font-size: 32px;
      font-weight: 700;
      color: #18181b;
      border-bottom: 2px solid #e4e4e7;
      display: inline-block;
      padding-bottom: 12px;
      margin-bottom: 20px;
      max-width: 100%;
    }
    .course {
      font-size: 18px;
      font-weight: 600;
      color: #3f3f46;
      line-height: 1.4;
      margin-bottom: 32px;
    }
    .footer {
      font-size: 12px;
      color: #a1a1aa;
    }
    @media print {
      body { background: #fff; }
      .frame { box-shadow: none; margin: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="frame">
    <div class="inner">
      <div class="badge">CERTIFICATE OF COMPLETION</div>
      <h1>Kattraan</h1>
      <p class="sub">This certifies that</p>
      <div class="name">${name}</div>
      <p class="sub" style="margin-bottom:12px">has successfully completed</p>
      <p class="course">${title}</p>
      <p class="footer">Issued on ${dateStr}</p>
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  return true;
}
