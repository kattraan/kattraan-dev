const fs = require("fs");
const path = require("path");
const multer = require("multer");

/**
 * Upload hardening shared by course media and community attachments.
 * Uses a strict MIME allowlist plus an extension blocklist so that dangerous
 * files (HTML/SVG/scripts/executables) can never be stored or served from the
 * CDN, and enforces a size cap to prevent disk/CDN abuse.
 */

// MIME types we are willing to store and serve from the CDN.
const ALLOWED_MIME_TYPES = new Set([
  // images (note: SVG intentionally excluded — it can carry scripts → XSS)
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  // documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  // media
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  // archives (downloaded, never executed server-side)
  "application/zip",
]);

// Extensions blocked regardless of the reported MIME type (defense in depth:
// a browser can execute these if the CDN mislabels the content type).
const BLOCKED_EXTENSIONS = new Set([
  ".html", ".htm", ".xhtml", ".shtml", ".svg", ".xml",
  ".js", ".mjs", ".jsx", ".ts",
  ".exe", ".bat", ".cmd", ".com", ".msi", ".sh", ".bash",
  ".php", ".phtml", ".jsp", ".asp", ".aspx", ".cgi", ".pl", ".py", ".rb",
  ".jar", ".app", ".dmg", ".scr", ".vbs", ".ps1", ".dll",
]);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type not allowed: ${ext}`));
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
}

/**
 * Build a hardened multer instance writing to `uploadsDir`.
 * @param {object} opts
 * @param {string} opts.uploadsDir  Destination directory.
 * @param {number} [opts.maxFileSizeBytes]  Per-file size cap.
 * @param {number} [opts.maxFiles]  Max files per request.
 */
function createHardenedUpload({ uploadsDir, maxFileSizeBytes = 50 * 1024 * 1024, maxFiles = 10 }) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  return multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
      },
    }),
    limits: {
      fileSize: maxFileSizeBytes,
      files: maxFiles,
    },
    fileFilter,
  });
}

/**
 * Express error handler for multer/file-filter rejections so clients get a
 * clean 400 instead of an unhandled 500.
 */
function handleUploadErrors(err, req, res, next) {
  if (!err) return next();
  const isMulter = err instanceof multer.MulterError;
  if (isMulter || /file type|Unsupported file/i.test(err.message || "")) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
    return res.status(400).json({ success: false, message });
  }
  return next(err);
}

module.exports = {
  ALLOWED_MIME_TYPES,
  BLOCKED_EXTENSIONS,
  createHardenedUpload,
  handleUploadErrors,
};
