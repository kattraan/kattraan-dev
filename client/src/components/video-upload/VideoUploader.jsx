import React, { useRef, useCallback, useState } from 'react';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { VideoProgress } from './VideoProgress';
import { createVideoUpload, saveVideoMetadata } from '@/features/courses/services/videoUploadService';

const ALLOWED_EXTENSIONS = ['.mp4'];
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const MIME_MP4 = 'video/mp4';

function getVideoDuration(file) {
  if (!file || !file.type.startsWith('video/')) return Promise.resolve(0);
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
 * Production-grade video upload: direct to Bunny Stream via TUS (resumable).
 * Backend only creates the video entry and returns credentials; file never touches the server.
 *
 * @param {object} props
 * @param {string} [props.chapterId] - Required for saving metadata
 * @param {string} [props.courseId] - Optional, for context
 * @param {string} [props.title] - Defaults to file name
 * @param {string} [props.description]
 * @param {(data: { contentId: string, bunnyVideoId: string }) => void} [props.onSuccess]
 * @param {(error: Error) => void} [props.onError]
 * @param {boolean} [props.disabled]
 */
export function VideoUploader({
  chapterId,
  courseId,
  title: initialTitle,
  description,
  onSuccess,
  onError,
  disabled = false,
}) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const uppyRef = useRef(null);
  const credentialsRef = useRef(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    setFileName('');
    setFileSize(0);
    credentialsRef.current = null;
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
    }
  }, []);

  const startUpload = useCallback(
    async (file) => {
      if (!file || !(file instanceof File)) return;

      const ext = (file.name.slice(file.name.lastIndexOf('.')).toLowerCase());
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setErrorMessage('Only .mp4 files are allowed. H.264 is preferred.');
        setStatus('error');
        onError?.(new Error('Invalid format'));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('File is too large. Maximum size is 10GB.');
        setStatus('error');
        onError?.(new Error('File too large'));
        return;
      }

      const title = initialTitle?.trim() || file.name || 'Untitled Video';
      setFileName(file.name);
      setFileSize(file.size);
      setStatus('creating');
      setProgress(0);
      setErrorMessage('');

      let credentials;
      try {
        credentials = await createVideoUpload(title);
        credentialsRef.current = credentials;
      } catch (err) {
        setErrorMessage(err?.message || 'Failed to prepare upload');
        setStatus('error');
        onError?.(err);
        return;
      }

      const uppy = new Uppy({
        id: `bunny-tus-${Date.now()}`,
        autoProceed: true,
        allowMultiple: false,
      });

      uppy.use(Tus, {
        endpoint: credentials.uploadUrl,
        retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
        chunkSize: 5 * 1024 * 1024, // 5MB chunks for resumable
        headers: {
          AuthorizationSignature: credentials.signature,
          AuthorizationExpire: String(credentials.expirationTime),
          VideoId: credentials.videoId,
          LibraryId: credentials.libraryId,
        },
        uploadDataCreationStrategy: 'individual',
      });

      uppy.addFile({
        name: file.name,
        type: file.type || MIME_MP4,
        data: file,
      });

      const fileIds = uppy.getFiles().map((f) => f.id);
      if (fileIds.length) {
        uppy.setFileMeta(fileIds[0], {
          filetype: file.type || MIME_MP4,
          title: title,
        });
      }

      uppy.on('progress', (p) => {
        setStatus('uploading');
        setProgress(p);
      });

      uppy.on('upload-success', async () => {
        setStatus('processing');
        setProgress(100);

        let duration = 0;
        try {
          duration = await getVideoDuration(file);
        } catch (_) {}

        if (!chapterId) {
          setErrorMessage('chapterId is required to save video to the course. Upload succeeded on Bunny.');
          setStatus('error');
          uppy.close();
          return;
        }

        try {
          const saveRes = await saveVideoMetadata({
            title,
            description: description || '',
            bunnyVideoId: credentials.videoId,
            duration,
            chapterId,
            courseId: courseId || undefined,
            fileName: file.name,
            fileSize: typeof file.size === 'number' ? file.size : undefined,
          });
          setStatus('completed');
          const contentId = saveRes?.data?._id;
          if (contentId) onSuccess?.({ contentId, bunnyVideoId: credentials.videoId });
        } catch (err) {
          setErrorMessage(err?.message || 'Upload succeeded but saving metadata failed');
          setStatus('error');
          onError?.(err);
        } finally {
          uppy.close();
        }
      });

      uppy.on('upload-error', (_, err) => {
        setErrorMessage(err?.message || 'Upload failed');
        setStatus('error');
        onError?.(err);
        uppy.close();
      });

      uppyRef.current = uppy;
    },
    [chapterId, courseId, initialTitle, description, onSuccess, onError]
  );

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target?.files?.[0];
      if (file && !disabled) startUpload(file);
      e.target.value = '';
    },
    [startUpload, disabled]
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Choose video file</span>
        <input
          type="file"
          accept=".mp4,video/mp4"
          onChange={handleInputChange}
          disabled={disabled}
          className="block w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-pink/20 file:px-4 file:py-2 file:text-primary-pink file:font-semibold hover:file:bg-primary-pink/30"
        />
      </label>
      <p className="text-xs text-white/50">
        MP4 only, max 10GB. Upload is resumable; you can retry if it fails.
      </p>
      <VideoProgress
        status={status}
        progress={progress}
        errorMessage={errorMessage}
        fileName={fileName}
        fileSize={fileSize}
      />
      {status === 'error' && (
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-primary-pink hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default VideoUploader;
