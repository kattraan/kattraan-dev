const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const {
  uploadMediaToBunny,
  deleteMediaFromBunny,
} = require("../../helpers/bunnyStorage");
const authenticate = require("../../middleware/auth-middleware");
const { ensureUserCanEditCourse } = require("../../middleware/courseOwnership");
const { requireMediaOwner } = require("../../middleware/courseOwnership");
const { validateDeleteKey, validateUploadBody } = require("../../validations/media");
const { signStorageCdnUrl } = require("../../helpers/bunnyToken");
const Media = require("../../models/Media");

/** Client-facing URL TTL when pull-zone token auth is enabled (pathname-based re-sign on API reads still works). */
const UPLOAD_URL_TTL_SEC = 60 * 60 * 24 * 7;

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const router = express.Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

// Single file upload: requires courseId in body; enforces course ownership
router.post(
  "/upload",
  upload.single("file"),
  validateUploadBody,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }
    const courseId = req.body && req.body.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const ownership = await ensureUserCanEditCourse(req, courseId);
    if (ownership.notFound) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (ownership.forbidden) {
      return res.status(403).json({ success: false, message: "You can only upload media for your own courses" });
    }

    try {
      const { key, url } = await uploadMediaToBunny(req.file.path);
      const media = await Media.create({
        key,
        url,
        course: courseId,
        uploadedBy: req.user._id,
      });
      const clientUrl = signStorageCdnUrl(url, UPLOAD_URL_TTL_SEC);
      return res.status(201).json({ success: true, data: { key, url: clientUrl, id: media._id } });
    } catch (e) {
      console.error("Upload error details:", e);
      return res.status(500).json({ success: false, message: "Error uploading file: " + (e.message || "Unknown error") });
    }
  }
);

// Bulk upload: requires courseId in body; enforces course ownership
router.post(
  "/bulk-upload",
  upload.array("files", 10),
  validateUploadBody,
  async (req, res) => {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }
    const courseId = req.body && req.body.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const ownership = await ensureUserCanEditCourse(req, courseId);
    if (ownership.notFound) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (ownership.forbidden) {
      return res.status(403).json({ success: false, message: "You can only upload media for your own courses" });
    }

    try {
      const uploads = await Promise.all(req.files.map((f) => uploadMediaToBunny(f.path)));
      const mediaDocs = await Media.insertMany(
        uploads.map(({ key, url }) => ({
          key,
          url,
          course: courseId,
          uploadedBy: req.user._id,
        }))
      );
      return res.status(201).json({
        success: true,
        data: uploads.map((u, i) => ({
          key: u.key,
          url: signStorageCdnUrl(u.url, UPLOAD_URL_TTL_SEC),
          id: mediaDocs[i]._id,
        })),
      });
    } catch (e) {
      console.error("Bulk upload error:", e);
      return res.status(500).json({ success: false, message: "Bulk upload failed: " + (e.message || "Unknown error") });
    }
  }
);

// Delete: ownership enforced via requireMediaOwner (media → course → createdBy)
router.delete(
  "/delete/:key",
  validateDeleteKey,
  requireMediaOwner("key"),
  async (req, res) => {
    const key = req.media.key;
    try {
      await deleteMediaFromBunny(key);
      req.media.isDeleted = true;
      req.media.deletedAt = new Date();
      await req.media.save();
      return res.status(200).json({ success: true, message: "Asset deleted", key });
    } catch (e) {
      console.error("Delete error:", e);
      return res.status(500).json({ success: false, message: "Error deleting file: " + (e.message || "Unknown error") });
    }
  }
);

module.exports = router;
