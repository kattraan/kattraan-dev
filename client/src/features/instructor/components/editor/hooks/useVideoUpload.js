import { useState, useCallback, useRef } from "react";
import courseService from "@/features/courses/services/courseService";
import { uploadVideoDirect } from "@/features/courses/services/videoUploadService";

/**
 * Get video duration in seconds from a File using the browser's video element.
 * @param {File} file
 * @returns {Promise<number>} duration in seconds
 */
function getVideoDuration(file) {
  if (!file || !file.type.startsWith("video/")) return Promise.resolve(0);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
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
 * Upload state per content/pending key.
 * @typedef {{ progress: number, status: 'uploading'|'processing'|'complete'|'error', title: string, error?: string }} UploadStateItem
 */

/**
 * useVideoUpload – handles video upload with progress, optional processing polling, and retry.
 * State is keyed by contentId (edit) or `pending-${chapterId}` (new).
 * Modal should close as soon as startUpload is called; progress is shown inline in curriculum.
 *
 * @param {string} courseId
 * @param {{ onUploadComplete: (payload: UploadCompletePayload) => void, onError?: (err: Error, key: string) => void }} options
 */
export function useVideoUpload(courseId, { onUploadComplete, onError }) {
  const [uploadState, setUploadState] = useState({});
  const pendingPayloadRef = useRef({});

  const getKey = useCallback((chapterId, contentId) => {
    if (contentId) return contentId;
    return `pending-${chapterId}`;
  }, []);

  const setStateForKey = useCallback((key, updatesOrFn) => {
    setUploadState((prev) => {
      const next = { ...prev };
      if (updatesOrFn === null) {
        delete next[key];
        return next;
      }
      const updates =
        typeof updatesOrFn === "function"
          ? updatesOrFn(prev[key] || {})
          : updatesOrFn;
      next[key] = { ...(prev[key] || {}), ...updates };
      return next;
    });
  }, []);

  const clearUpload = useCallback(
    (key) => {
      setStateForKey(key, null);
      pendingPayloadRef.current[key] = null;
    },
    [setStateForKey],
  );

  const runUpload = useCallback(
    async (key, payload) => {
      const {
        videoFile,
        thumbnailFile,
        subtitles,
        title,
        description,
        resourceFiles,
        engagementTemplateId,
        engagementTemplateName,
        engagementTemplateLabels,
        engagementTemplateEmojis,
        chapterId,
        existingContent,
      } = payload;

      const isEditing = !!existingContent?._id;
      const hasVideo = !!videoFile;

      const resolvedTitle =
        title || existingContent?.title || "Chapter Video";

      if (!hasVideo && !isEditing) {
        setStateForKey(key, {
          status: "error",
          error: "No video file selected",
        });
        onError?.(new Error("No video file"), key);
        return;
      }

      let videoUrl = existingContent?.videoUrl || "";
      let thumbnailValue = existingContent?.thumbnail || "";
      let durationSeconds = existingContent?.duration ?? 0;

      try {
        if (videoFile) {
          try {
            durationSeconds = await getVideoDuration(videoFile);
          } catch {
            // keep existing or 0
          }
        }
        if (videoFile) {
          setStateForKey(key, {
            progress: 0,
            status: "uploading",
            title: resolvedTitle,
          });

          const useDirectUpload = !isEditing;
          if (useDirectUpload) {
            const res = await uploadVideoDirect(videoFile, {
              chapterId,
              title: resolvedTitle,
              description,
              courseId,
              onProgress: (percent) => {
                setStateForKey(key, (prev) => ({
                  ...prev,
                  // Guard against late progress events overriding a completed state.
                  progress:
                    prev?.status === "complete" ? 100 : Math.min(100, percent),
                  status:
                    prev?.status === "complete" || prev?.status === "error"
                      ? prev.status
                      : percent >= 100
                        ? "processing"
                        : "uploading",
                }));
              },
            });
            if (!res?.success || !res?.data)
              throw new Error("Video upload failed");
            setStateForKey(key, { progress: 100, status: "complete" });
            onUploadComplete(
              {
                contentId: res.data._id,
                contentData: null,
                isEditing: false,
                isHlsCreate: true,
                key,
              },
              () => clearUpload(key),
            );
            return;
          }

          const videoUploadRes = await courseService.uploadMediaWithProgress(
            videoFile,
            courseId,
            (percent) => {
              setStateForKey(key, (prev) => ({
                ...prev,
                // Guard against late progress events overriding a completed state.
                progress:
                  prev?.status === "complete" ? 100 : Math.min(100, percent),
                status:
                  prev?.status === "complete" || prev?.status === "error"
                    ? prev.status
                    : percent >= 100
                      ? "processing"
                      : "uploading",
              }));
            },
          );

          if (!videoUploadRes?.success) throw new Error("Video upload failed");
          videoUrl = videoUploadRes.data?.url || videoUrl;
        }

        setStateForKey(key, { progress: 100, status: "processing" });

        if (thumbnailFile) {
          try {
            const thumbRes = await courseService.uploadMedia(
              thumbnailFile,
              courseId,
            );
            if (thumbRes?.success)
              thumbnailValue = thumbRes.data?.url || thumbnailValue;
          } catch {
            // non-fatal
          }
        }

        const existingResources = existingContent?.resources || [];
        const newResources = [];
        if (resourceFiles?.length) {
          for (const res of resourceFiles) {
            try {
              const r = await courseService.uploadMedia(res.file, courseId);
              if (r?.success)
                newResources.push({
                  title: res.file.name,
                  url: r.data.url,
                  fileType: res.file.type,
                  fileSize: res.file.size,
                });
            } catch {
              // skip failed resource
            }
          }
        }

        const mainSubtitle = subtitles?.find((s) => s.file);
        const contentData = {
          chapter: chapterId,
          type: "video",
          title: resolvedTitle,
          description: description || "",
          videoUrl,
          thumbnail: thumbnailValue,
          duration: durationSeconds,
          resources: [...existingResources, ...newResources],
          engagementTemplateId:
            engagementTemplateId ||
            existingContent?.engagementTemplateId ||
            existingContent?.metadata?.engagementTemplateId ||
            "",
          metadata: {
            fileName: "",
            fileSize:
              videoFile?.size || existingContent?.metadata?.fileSize || 0,
            hasSubtitle: !!mainSubtitle,
            subtitleName: mainSubtitle?.file?.name || "",
            languages: subtitles?.map((s) => s.language) || [],
            engagementTemplateId:
              engagementTemplateId ||
              existingContent?.metadata?.engagementTemplateId ||
              "",
            engagementTemplateName:
              engagementTemplateName ||
              existingContent?.metadata?.engagementTemplateName ||
              "",
            engagementTemplateLabels:
              engagementTemplateLabels?.length
                ? engagementTemplateLabels
                : existingContent?.metadata?.engagementTemplateLabels || [],
            engagementTemplateEmojis:
              engagementTemplateEmojis?.length
                ? engagementTemplateEmojis
                : existingContent?.metadata?.engagementTemplateEmojis || [],
          },
        };

        onUploadComplete(
          {
            contentId: existingContent?._id,
            contentData,
            isEditing,
            key,
          },
          () => clearUpload(key),
        );
        setStateForKey(key, { progress: 100, status: "complete" });
      } catch (err) {
        setStateForKey(key, {
          status: "error",
          error: err?.message || "Upload failed",
          progress: 0,
        });
        onError?.(err, key);
      }
    },
    [courseId, setStateForKey, onUploadComplete, onError, clearUpload],
  );

  const startUpload = useCallback(
    (payload) => {
      const { chapterId, existingContent } = payload;
      const key = getKey(chapterId, existingContent?._id);
      pendingPayloadRef.current[key] = payload;
      runUpload(key, payload);
    },
    [getKey, runUpload],
  );

  const retryUpload = useCallback(
    (key) => {
      const payload = pendingPayloadRef.current[key];
      if (!payload) return;
      setStateForKey(key, {
        progress: 0,
        status: "uploading",
        error: undefined,
      });
      runUpload(key, payload);
    },
    [setStateForKey, runUpload],
  );

  return {
    uploadState,
    startUpload,
    clearUpload,
    retryUpload,
  };
}
