/**
 * Video direct-upload flow: create (get TUS credentials) and save metadata.
 * Upload is done by the client directly to Bunny TUS (no backend file handling).
 */
import apiClient from '@/api/apiClient';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

const VIDEO_CREATE_URL = '/videos/create';
const VIDEO_SAVE_URL = '/videos/save';
const MIME_MP4 = 'video/mp4';
/** Reject empty / cloud-placeholder / truncated files that finish TUS instantly and never play. */
const MIN_VIDEO_BYTES = 100 * 1024; // 100 KB
const MAX_VIDEO_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

/**
 * Strip characters that break Bunny titles, TUS metadata, or HTML rendering (e.g. `<`).
 * @param {string} value
 * @returns {string}
 */
export function sanitizeVideoTitle(value) {
  return String(value || '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate a local video File before creating a Bunny entry / starting TUS.
 * @param {File} file
 * @throws {Error}
 */
export function assertValidVideoFile(file) {
  if (!file || !(file instanceof File)) {
    throw new Error('Please select a video file from your computer.');
  }
  if (!file.size || file.size < MIN_VIDEO_BYTES) {
    throw new Error(
      'This video file is empty or incomplete (0 MB). If it is on OneDrive/Google Drive, make it available offline first, then re-select the file.',
    );
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('File is too large. Maximum size is 10GB.');
  }
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const looksLikeVideo =
    (file.type && file.type.startsWith('video/')) ||
    ['.mp4', '.mov', '.webm', '.m4v'].includes(ext);
  if (!looksLikeVideo) {
    throw new Error('Please upload a video file (MP4 recommended).');
  }
}

/**
 * Create a Bunny Stream video and get TUS upload credentials.
 * @param {string} title - Video title
 * @returns {Promise<{ videoId: string, uploadUrl: string, libraryId: string, expirationTime: number, signature: string }>}
 */
export async function createVideoUpload(title) {
  const safeTitle = sanitizeVideoTitle(title) || 'Untitled Video';
  const { data } = await apiClient.post(VIDEO_CREATE_URL, { title: safeTitle });
  if (!data?.success) throw new Error(data?.message || 'Failed to create video');
  return {
    videoId: data.videoId,
    uploadUrl: data.uploadUrl,
    libraryId: data.libraryId,
    expirationTime: data.expirationTime,
    signature: data.signature,
  };
}

/**
 * Save video metadata after client has uploaded file to Bunny.
 * @param {object} payload - { title, description, bunnyVideoId, duration, chapterId, courseId?, fileName?, fileSize? }
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function saveVideoMetadata(payload) {
  const { data } = await apiClient.post(VIDEO_SAVE_URL, payload);
  if (!data?.success) throw new Error(data?.message || 'Failed to save video');
  return data;
}

function getVideoDuration(file) {
  if (!file || !file.type?.startsWith('video/')) return Promise.resolve(0);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(video.duration));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

/**
 * Run full direct-upload flow: create → TUS upload to Bunny → save metadata.
 * Used by useVideoUpload (curriculum) and can be used elsewhere.
 *
 * @param {File} file - MP4 file
 * @param {object} options - { chapterId, title?, description?, courseId?, onProgress?(percent: number), onUploadFinished?() }
 * @returns {Promise<{ success: boolean, data: { _id: string } }>}
 */
export function uploadVideoDirect(file, options = {}) {
  const { chapterId, title, description, courseId, onProgress, onUploadFinished } = options;

  return new Promise((resolve, reject) => {
    try {
      assertValidVideoFile(file);
    } catch (err) {
      reject(err);
      return;
    }

    const titleStr =
      sanitizeVideoTitle(title) ||
      sanitizeVideoTitle(file.name) ||
      'Untitled Video';

    createVideoUpload(titleStr)
      .then((credentials) => {
        const uppy = new Uppy({ id: `bunny-tus-${Date.now()}`, autoProceed: true, allowMultiple: false });
        uppy.use(Tus, {
          endpoint: credentials.uploadUrl,
          retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
          chunkSize: 5 * 1024 * 1024,
          headers: {
            AuthorizationSignature: credentials.signature,
            AuthorizationExpire: String(credentials.expirationTime),
            VideoId: credentials.videoId,
            LibraryId: credentials.libraryId,
          },
          uploadDataCreationStrategy: 'individual',
        });
        // Prefer a safe filename for TUS metadata; keep original type/size.
        const base = sanitizeVideoTitle(file.name.replace(/\.[^.]+$/, ''));
        const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.mp4';
        const safeFileName = (base || 'video') + ext;
        uppy.addFile({
          name: safeFileName,
          type: file.type || MIME_MP4,
          data: file,
        });
        const fileIds = uppy.getFiles().map((f) => f.id);
        if (fileIds.length) uppy.setFileMeta(fileIds[0], { filetype: file.type || MIME_MP4, title: titleStr });

        uppy.on('progress', (p) => typeof onProgress === 'function' && onProgress(p));
        uppy.on('upload-success', async () => {
          // Bytes are on Bunny; remaining work is metadata save (not still "uploading").
          if (typeof onUploadFinished === 'function') onUploadFinished();
          let duration = 0;
          try {
            duration = await getVideoDuration(file);
          } catch (_) {}
          if (!chapterId) {
            uppy.close();
            reject(new Error('chapterId is required to save video'));
            return;
          }
          try {
            const saveRes = await saveVideoMetadata({
              title: titleStr,
              description: description || '',
              bunnyVideoId: credentials.videoId,
              duration,
              chapterId,
              courseId,
              fileName: file.name,
              fileSize: typeof file.size === 'number' ? file.size : undefined,
            });
            uppy.close();
            resolve({ success: true, data: saveRes.data });
          } catch (err) {
            uppy.close();
            reject(err);
          }
        });
        uppy.on('upload-error', (_, err) => {
          uppy.close();
          reject(err || new Error('Upload failed'));
        });
      })
      .catch(reject);
  });
}
