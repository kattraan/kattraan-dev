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

/**
 * Create a Bunny Stream video and get TUS upload credentials.
 * @param {string} title - Video title
 * @returns {Promise<{ videoId: string, uploadUrl: string, libraryId: string, expirationTime: number, signature: string }>}
 */
export async function createVideoUpload(title) {
  const { data } = await apiClient.post(VIDEO_CREATE_URL, { title: title || 'Untitled Video' });
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
 * @param {object} options - { chapterId, title?, description?, courseId?, onProgress?(percent: number) }
 * @returns {Promise<{ success: boolean, data: { _id: string } }>}
 */
export function uploadVideoDirect(file, options = {}) {
  const { chapterId, title, description, courseId, onProgress } = options;
  const titleStr = (title && String(title).trim()) || file.name || 'Untitled Video';

  return new Promise((resolve, reject) => {
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
        uppy.addFile({ name: file.name, type: file.type || MIME_MP4, data: file });
        const fileIds = uppy.getFiles().map((f) => f.id);
        if (fileIds.length) uppy.setFileMeta(fileIds[0], { filetype: file.type || MIME_MP4, title: titleStr });

        uppy.on('progress', (p) => typeof onProgress === 'function' && onProgress(p));
        uppy.on('upload-success', async () => {
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
