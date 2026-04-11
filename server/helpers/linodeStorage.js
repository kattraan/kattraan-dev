const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

// Use trim() to clean up any hidden spaces from .env
const s3Config = {
  endpoint: (process.env.LINODE_ENDPOINT || "").trim(),
  region: (process.env.LINODE_REGION || "").trim(),
  credentials: {
    accessKeyId: (process.env.LINODE_ACCESS_KEY_ID || "").trim(),
    secretAccessKey: (process.env.LINODE_SECRET_ACCESS_KEY || "").trim(),
  },
  forcePathStyle: true, // Crucial for Linode Object Storage
};

const s3 = new S3Client(s3Config);

async function uploadMediaToLinode(filePath) {
  const contentType = mime.lookup(filePath) || "application/octet-stream";
  let ext = path.extname(filePath).toLowerCase();

  if (!ext || ext.length < 2) {
    ext = mime.extension(contentType) ? "." + mime.extension(contentType) : "";
  }

  let prefix = "other";
  if (contentType.startsWith("image/")) prefix = "images";
  else if (contentType.startsWith("video/")) prefix = "videos";
  else if (contentType.startsWith("audio/")) prefix = "audio";
  else if (contentType === "application/pdf" || contentType.includes("msword")) prefix = "docs";

  const baseName = path.basename(filePath, path.extname(filePath));
  const key = `${prefix}/${Date.now()}-${baseName}${ext}`;

  try {
    const fileContent = fs.readFileSync(filePath);

    await s3.send(
      new PutObjectCommand({
        Bucket: (process.env.LINODE_BUCKET || "").trim(),
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ContentLength: fileContent.length,
      })
    );

    // Remove temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      key,
      url: `${(process.env.LINODE_BASE_URL || "").trim()}/${encodeURIComponent(key)}`,
    };
  } catch (err) {
    // Cleanup on failure
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }
}

async function deleteMediaFromLinode(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: (process.env.LINODE_BUCKET || "").trim(),
      Key: key,
    })
  );
}

module.exports = { uploadMediaToLinode, deleteMediaFromLinode };
