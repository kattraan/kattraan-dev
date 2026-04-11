const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email address
    pass: process.env.SMTP_PASS, // Your App Password (not your Gmail password)
  },
});

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} options.message - HTML body content
 * @param {Array} [options.attachments] - Array of attachment objects
 */
async function sendEmail({ to, subject, message, attachments = [] }) {
  try {
    const info = await transporter.sendMail({
      from: `"Kattraan" <${process.env.SMTP_USER}>`, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
      attachments: attachments, // Attachments array
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    // Throwing error so the caller knows it failed
    throw error;
  }
}

module.exports = { sendEmail };

