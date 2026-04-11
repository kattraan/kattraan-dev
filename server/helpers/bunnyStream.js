const axios = require("axios");

const BUNNY_STREAM_BASE = "https://video.bunnycdn.com";
const LIBRARY_ID = (process.env.BUNNY_LIBRARY_ID || "").trim().replace(/\s/g, "");
const API_KEY = (process.env.BUNNY_API_KEY || "").trim().replace(/\s/g, "");

/**
 * Get shared axios config for Bunny Stream API (base URL + auth).
 * @returns {{ baseURL: string, headers: object }}
 */
function getStreamConfig() {
  if (!LIBRARY_ID || !API_KEY) {
    throw new Error(
      "Bunny Stream: BUNNY_LIBRARY_ID and BUNNY_API_KEY must be set in environment."
    );
  }
  return {
    baseURL: BUNNY_STREAM_BASE,
    headers: {
      AccessKey: API_KEY,
      Accept: "application/json",
    },
  };
}

/**
 * Create a new video in the Bunny Stream library (metadata only).
 * Used by bunnyService for TUS direct-upload flow; client uploads file to Bunny.
 *
 * @param {string} title - Video title (required by Bunny API)
 * @returns {Promise<string>} The video guid (videoId) for TUS upload
 * @throws {Error} When env is missing, request fails, or response has no guid
 */
async function createBunnyVideo(title) {
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Bunny Stream: title is required and must be a non-empty string.");
  }

  const config = getStreamConfig();
  const url = `/library/${LIBRARY_ID}/videos`;

  try {
    const { data, status } = await axios.post(
      url,
      { title: title.trim() },
      {
        baseURL: config.baseURL,
        headers: {
          ...config.headers,
          "Content-Type": "application/json",
        },
        validateStatus: (s) => s >= 200 && s < 300,
      }
    );

    const guid = data?.guid ?? data?.videoId;
    if (!guid) {
      throw new Error(
        `Bunny Stream: create video response missing guid (status ${status}).`
      );
    }
    return String(guid);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data;
      const msg =
        body?.message ?? body?.ErrorMessage ?? body?.error ?? err.message ?? "Unknown error";
      if (status === 401) {
        const hint =
          "Use the key from Stream → your library (ID " + LIBRARY_ID + ") → API. " +
          "If the key is correct, confirm Library ID matches that same library.";
        const fullMsg = typeof body === "object"
          ? `${msg} (${hint})`
          : "Bunny Stream create video failed (401 Unauthorized). " + hint;
        throw new Error(fullMsg);
      }
      throw new Error(
        `Bunny Stream create video failed (${status ?? "network"}): ${msg}`
      );
    }
    throw err;
  }
}

/**
 * Get video details from Bunny Stream (e.g. after encoding completes).
 * Use for webhook: update duration and resolution in DB.
 *
 * @param {string} videoId - Bunny Stream video guid
 * @returns {Promise<{ length: number, width: number, height: number, resolution: string }|null>}
 */
async function getBunnyVideo(videoId) {
  if (!videoId || typeof videoId !== "string" || videoId.trim().length === 0) {
    return null;
  }

  const config = getStreamConfig();
  const url = `/library/${LIBRARY_ID}/videos/${encodeURIComponent(videoId.trim())}`;

  try {
    const { data } = await axios.get(url, {
      baseURL: config.baseURL,
      headers: config.headers,
      validateStatus: (s) => s === 200,
    });

    const length = typeof data?.length === "number" ? data.length : 0;
    const width = typeof data?.width === "number" ? data.width : 0;
    const height = typeof data?.height === "number" ? data.height : 0;
    const resolution = width && height ? `${width}x${height}` : "";

    return { length, width, height, resolution };
  } catch {
    return null;
  }
}

module.exports = {
  createBunnyVideo,
  getBunnyVideo,
};
