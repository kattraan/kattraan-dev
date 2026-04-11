// services/emailTemplates.js

/**
 * Returns a full HTML email template with the given header and content.
 * @param {string} headerText - The title or header for the email.
 * @param {string} content - The HTML content to embed under the header.
 * @returns {string} - A complete HTML document string.
 */
function createEmailTemplate(headerText, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerText}</title>
  <style>
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');

    body, table, td {
      font-family: 'Satoshi', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #0c091a;
      color: #ffffff;
    }
    a { text-decoration: none; }
    
    .body-wrapper {
      width: 100%;
      background-color: #0c091a;
      padding: 40px 0;
    }

    /* Main Card */
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #1a1625;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Creative Curve Header - Refined */
    .curve-header {
      background: linear-gradient(135deg, #ff3fb4 0%, #9e30ff 100%);
      height: 140px;
      width: 100%;
      border-bottom-right-radius: 50% 20px;
      border-bottom-left-radius: 70% 20px;
      position: relative;
      padding-top: 25px;
    }
    
    /* Logo inside header */
    .logo-container {
      text-align: center;
      position: relative;
      z-index: 5;
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .logo-wrapper {
      text-align: center;
    }
    .logo-img {
      width: 50px;
      height: 50px;
      vertical-align: middle;
      display: inline-block;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
    }
    .brand-text {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      margin-left: 14px;
      vertical-align: middle;
      display: inline-block;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    
    /* Illustration overlap */
    .illustration-wrapper {
      text-align: center;
      margin-top: -85px; /* Perfect overlap */
      position: relative;
      z-index: 10;
      padding-bottom: 10px;
    }
    .main-illustration {
      width: 160px; /* Optimal size */
      height: 160px;
      object-fit: contain;
      display: inline-block;
      filter: drop-shadow(0 15px 25px rgba(0,0,0,0.3));
    }
    
    /* Content */
    .content {
      padding: 0 40px 40px 40px;
      text-align: center;
      color: #e0e0e0;
      font-size: 16px;
      line-height: 1.6;
    }
    .content h2 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      margin: 10px 0 15px 0;
      letter-spacing: -0.5px;
    } 
    .content p {
      margin-bottom: 25px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    /* Button */
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(90deg, #ff3fb4 0%, #9e30ff 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 8px 20px rgba(255, 63, 180, 0.3);
      margin-top: 10px;
      transition: transform 0.2s;
    }
    
    /* Footer */
    .footer {
      padding: 30px 20px;
      text-align: center;
    }
    .footer p {
      margin: 8px 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.3);
    }
    .footer a {
      color: rgba(255, 255, 255, 0.4);
      margin: 0 8px;
    }
    
    .social-link {
        display: inline-block;
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.08);
        border-radius: 50%;
        line-height: 32px;
        margin: 0 6px;
        color: rgba(255,255,255,0.8);
        font-size: 11px;
        font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="body-wrapper">
    <!-- Main Card -->
    <div class="container">
       <!-- Creative Header with Logo Inside -->
       <div class="curve-header">
          <div class="logo-wrapper">
            <div class="logo-container">
               <img src="cid:kattranLogo" alt="Logo" class="logo-img" />
               <span class="brand-text">Kattraan</span>
            </div>
          </div>
       </div>
       
       <!-- Overlapping Illustration -->
       <div class="illustration-wrapper">
          <!-- Reliable 3D Icon Source -->
          <img src="https://img.icons8.com/3d-fluency/375/padlock.png" alt="Security Lock" class="main-illustration" />
       </div>

       <!-- Content -->
       <div class="content">
          ${content}
       </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div style="margin-bottom: 20px;">
        <a href="#" class="social-link">FB</a>
        <a href="#" class="social-link">TW</a>
        <a href="#" class="social-link">IN</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Kattraan Inc. All rights reserved.</p>
      <p>
        <a href="#">Unsubscribe</a> • <a href="#">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { createEmailTemplate };
