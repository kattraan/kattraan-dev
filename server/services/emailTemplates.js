// services/emailTemplates.js

/**
 * Returns a full HTML email template.
 * @param {string} headerText - Used in the <title> tag.
 * @param {string} content    - Inner HTML injected into the card body.
 * @returns {string}
 */
function createEmailTemplate(headerText, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerText}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    body, table, td, p, a, span {
      font-family: 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    body { margin: 0; padding: 0; background: #000000; }
    a    { text-decoration: none; }
    img  { border: 0; display: block; }

    /* ── Outer page ── */
    .page {
      width: 100%;
      background: #000000;
      padding: 48px 16px 64px;
    }

    /* ── Card ── */
    .card {
      max-width: 560px;
      margin: 0 auto;
      background: #0c0c0c;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 48px 120px rgba(0, 0, 0, 0.9);
    }

    /* ── Header (black with large logo + wordmark) ── */
    .header {
      background: #000000;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 40px 40px 36px;
      text-align: center;
    }
    .brand-logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      /* Let the logo's own colors show — it is the only color on the page */
    }
    .brand-name {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 6px;
      text-transform: uppercase;
      line-height: 1;
      margin: 0;
      display: block;
    }
    .brand-tagline {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-top: 6px;
      display: block;
    }

    /* ── Body content ── */
    .body {
      padding: 44px 52px 52px;
      text-align: center;
    }

    /* Thin top accent line */
    .accent-line {
      width: 40px;
      height: 3px;
      background: #ffffff;
      border-radius: 999px;
      margin: 0 auto 28px;
    }

    .body h2 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 10px;
      letter-spacing: -0.4px;
      line-height: 1.3;
    }

    .body p {
      font-size: 15px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.75;
      margin: 0 0 14px;
    }

    .body strong, .body b {
      color: #ffffff;
      font-weight: 700;
    }

    /* ── OTP block ── */
    .otp-card {
      display: inline-block;
      margin: 20px 0 10px;
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 18px;
      padding: 28px 56px 24px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .otp-digits {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 14px;
      padding-left: 14px;
      color: #ffffff;
      line-height: 1;
    }
    .otp-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.25);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 12px;
    }

    /* Expiry pill */
    .expiry-pill {
      display: inline-block;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 999px;
      padding: 7px 18px;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 0.3px;
      margin: 6px 0 28px;
    }

    /* ── CTA button ── */
    .button-container { margin: 24px 0 16px; }
    .cta-button {
      display: inline-block;
      padding: 16px 52px;
      background: #ffffff;
      color: #000000 !important;
      border-radius: 14px;
      font-weight: 800;
      font-size: 15px;
      letter-spacing: 0.3px;
      text-decoration: none;
      box-shadow: 0 4px 24px rgba(255, 255, 255, 0.12);
    }

    /* Fallback URL */
    .callout {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 12px;
      font-family: 'Courier New', 'Consolas', monospace;
      color: rgba(255, 255, 255, 0.35);
      word-break: break-all;
      margin: 16px 0;
      text-align: left;
    }

    /* Rule */
    .rule, hr {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      margin: 28px 0;
    }

    .note {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.25);
      line-height: 1.65;
    }

    /* ── Footer ── */
    .footer {
      max-width: 560px;
      margin: 0 auto;
      padding: 28px 20px 48px;
      text-align: center;
    }
    .footer-line {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      margin: 0 auto 24px;
      max-width: 400px;
    }
    .socials { margin-bottom: 16px; }
    .s-btn {
      display: inline-block;
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      line-height: 36px;
      text-align: center;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.35);
      text-decoration: none;
      margin: 0 4px;
    }
    .footer p {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.18);
      margin: 5px 0;
    }
    .footer a {
      color: rgba(255, 255, 255, 0.28);
      text-decoration: none;
    }
    .footer-sep {
      color: rgba(255, 255, 255, 0.12);
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="page">

    <div class="card">

      <!-- Header: logo + wordmark -->
      <div class="header">
        <img src="cid:kattranLogo" alt="Kattraan" class="brand-logo" />
        <span class="brand-name">Kattraan</span>
        <span class="brand-tagline">New-Gen Learning Hub</span>
      </div>

      <!-- Content -->
      <div class="body">
        <div class="accent-line"></div>
        ${content}
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <hr class="footer-line" />
      <div class="socials">
        <a href="#" class="s-btn">FB</a>
        <a href="#" class="s-btn">TW</a>
        <a href="#" class="s-btn">IN</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Kattraan &mdash; All rights reserved.</p>
      <p>
        <a href="#">Unsubscribe</a>
        <span class="footer-sep">&bull;</span>
        <a href="#">Privacy Policy</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

module.exports = { createEmailTemplate };
