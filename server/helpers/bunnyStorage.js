const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

// Bunny.net Storage configuration
const STORAGE_ZONE_NAME = (process.env.BUNNY_STORAGE_ZONE_NAME || "").trim();
const STORAGE_PASSWORD = (process.env.BUNNY_STORAGE_PASSWORD || "").trim();
const STORAGE_REGION = (process.env.BUNNY_STORAGE_REGION || "").trim();
const CDN_HOSTNAME = (process.env.BUNNY_CDN_HOSTNAME || "").trim();

/**
 * Bunny Storage HTTP API host (see https://docs.bunny.net/storage/http).
 * Frankfurt uses the global hostname; other regions use {code}.storage.bunnycdn.com
 * with codes: uk, ny, la, sg, se, br, jh, syd — not ISO country codes like "de".
 */
function bunnyStorageBaseUrl(regionRaw) {
    const r = (regionRaw || "").trim().toLowerCase();
    if (!r || r === "de" || r === "frankfurt") {
        return "https://storage.bunnycdn.com";
    }
    return `https://${r}.storage.bunnycdn.com`;
}

const STORAGE_BASE_URL = bunnyStorageBaseUrl(STORAGE_REGION);

/**
 * Upload a file to Bunny.net Storage
 * @param {string} filePath - Absolute path to the temp file on disk
 * @returns {Promise<{key: string, url: string}>}
 */
async function uploadMediaToBunny(filePath) {
    if (!STORAGE_ZONE_NAME || !STORAGE_PASSWORD) {
        throw new Error(
            "Bunny Storage is not configured: set BUNNY_STORAGE_ZONE_NAME and BUNNY_STORAGE_PASSWORD in server/.env (use the Storage zone password from Bunny dashboard, not the Stream API key)."
        );
    }
    if (!CDN_HOSTNAME) {
        throw new Error(
            "BUNNY_CDN_HOSTNAME is not set in server/.env (your Pull Zone hostname, e.g. myzone.b-cdn.net)."
        );
    }

    const contentType = mime.lookup(filePath) || "application/octet-stream";
    let ext = path.extname(filePath).toLowerCase();

    if (!ext || ext.length < 2) {
        ext = mime.extension(contentType) ? "." + mime.extension(contentType) : "";
    }

    // Organize files into folders by type
    let prefix = "other";
    if (contentType.startsWith("image/")) prefix = "images";
    else if (contentType.startsWith("video/")) prefix = "videos";
    else if (contentType.startsWith("audio/")) prefix = "audio";
    else if (contentType === "application/pdf" || contentType.includes("msword"))
        prefix = "docs";

    // Sanitize baseName and encode segments
    const baseName = path.basename(filePath, path.extname(filePath)).replace(/\s+/g, '-');
    const key = `${prefix}/${Date.now()}-${baseName}${ext}`;

    try {
        const fileContent = fs.readFileSync(filePath);

        // Encode each part of the key for the URL
        const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const uploadUrl = `${STORAGE_BASE_URL}/${STORAGE_ZONE_NAME}/${encodedKey}`;

        console.log(`Uploading to Bunny.net: ${uploadUrl}`);

        // PUT the file to Bunny.net Storage API
        await axios.put(
            uploadUrl,
            fileContent,
            {
                headers: {
                    AccessKey: STORAGE_PASSWORD,
                    "Content-Type": "application/octet-stream",
                    "Content-Length": fileContent.length,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        // Remove temp file after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {
            key, // Keep original key for storage/delete
            url: `https://${CDN_HOSTNAME}/${encodedKey}`,
        };
    } catch (err) {
        // Cleanup temp file on failure
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        const status = err.response?.status;
        const bunnyBody = err.response?.data;
        console.error("Bunny.net upload error:", bunnyBody || err.message);
        if (status === 401 || status === 403) {
            throw new Error(
                "Bunny Storage rejected the request (unauthorized). Verify BUNNY_STORAGE_PASSWORD is the Storage zone 'FTP & API access' password and BUNNY_STORAGE_ZONE_NAME matches the zone name exactly."
            );
        }
        if (status === 404) {
            throw new Error(
                "Bunny Storage returned 404. Check BUNNY_STORAGE_ZONE_NAME and BUNNY_STORAGE_REGION (must match the region where the storage zone was created, or leave region empty for global)."
            );
        }
        if (err.code === "ENOTFOUND") {
            throw new Error(
                `Cannot reach Bunny Storage (DNS). Region "${STORAGE_REGION || "(empty)"}" may be wrong. For Frankfurt leave BUNNY_STORAGE_REGION empty; for other regions use Bunny's code from the dashboard (uk, ny, la, sg, se, br, jh, syd) — not "de".`
            );
        }
        throw err;
    }
}

/**
 * Delete a file from Bunny.net Storage
 * @param {string} key - The storage path/key of the file to delete
 */
async function deleteMediaFromBunny(key) {
    const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');
    await axios.delete(
        `${STORAGE_BASE_URL}/${STORAGE_ZONE_NAME}/${encodedKey}`,
        {
            headers: {
                AccessKey: STORAGE_PASSWORD,
            },
        }
    );
}

module.exports = { uploadMediaToBunny, deleteMediaFromBunny };
