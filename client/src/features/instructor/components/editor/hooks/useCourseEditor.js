import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const AUTO_SAVE_DEBOUNCE_MS = 2000;

/** Get video duration in seconds from a URL (for backfilling missing duration). */
function getVideoDurationFromUrl(url) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(Math.round(video.duration));
      video.src = "";
    };
    video.onerror = () => resolve(0);
    video.src = url;
  });
}

import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  updateCourse,
  submitForReview,
} from "@/features/courses/store/courseSlice";
import { useGetCourseByIdQuery } from "@/features/courses/api/coursesApi";
import courseService from "@/features/courses/services/courseService";
import { useToast } from "@/components/ui/Toast";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { logger } from "@/utils/logger";
import { useVideoUpload } from "./useVideoUpload";
import { listEngagementTemplates } from "@/features/instructor/services/chapterEngagementTemplateService";

const INITIAL_COURSE_DETAILS = {
  title: "",
  status: "draft",
  description: "",
  subtitle: "",
  price: 0,
  discount: 0,
  level: "beginner",
  category: "",
  sections: [],
  image: "",
  thumbnail: "",
  validity: false,
  validityDays: 30,
  showAsLocked: false,
  disableQnA: false,
  disableComments: false,
  visibility: "private", // 'public' | 'private' – intent only; actual publish is via Submit for Review
  chapterEngagementTemplates: [],
};

/**
 * Custom hook encapsulating all CourseEditor business logic.
 * Separates state, side effects, and handlers from UI for testability and reusability.
 */
export function useCourseEditor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const toast = useToast();
  const { confirm } = useConfirmDialog();

  const isEditMode = !!id;

  const {
    data: courseData,
    isLoading: queryLoading,
    refetch: refetchCourse,
  } = useGetCourseByIdQuery(id, { skip: !id });

  const [activeTab, setActiveTab] = useState("Information");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [selectionChapterId, setSelectionChapterId] = useState(null);
  const [uploadingChapterId, setUploadingChapterId] = useState(null);
  const [uploadingChapterTitle, setUploadingChapterTitle] = useState("");
  const [activeFileUploadType, setActiveFileUploadType] = useState(null);
  const [activeReportSubTab, setActiveReportSubTab] =
    useState("Engagement Analytics");
  const [activeCommentStatus, setActiveCommentStatus] = useState("All");
  const [activeDripType, setActiveDripType] = useState(
    "Learner enrollment date",
  );
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizChapterId, setQuizChapterId] = useState(null);
  const [currentEditingQuiz, setCurrentEditingQuiz] = useState(null);
  const [quizSectionName, setQuizSectionName] = useState("");
  const [quizChapterName, setQuizChapterName] = useState("");
  /** When opening quiz builder from "Assignment" vs "Quiz" content card (new content default). */
  const [quizPreferredAssessmentMode, setQuizPreferredAssessmentMode] =
    useState("quiz");
  const [showCoursePreview, setShowCoursePreview] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideoContent, setEditingVideoContent] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleContent, setEditingArticleContent] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkContent, setEditingLinkContent] = useState(null);
  const [resourceUploadContent, setResourceUploadContent] = useState(null); // video content for resource upload modal
  const [descriptionModalContent, setDescriptionModalContent] = useState(null); // video content for chapter description modal
  const [courseDetails, setCourseDetails] = useState(INITIAL_COURSE_DETAILS);
  const [engagementTemplates, setEngagementTemplates] = useState([]);

  const fileInputRef = useRef(null);
  const skipNextAutoSaveRef = useRef(true);
  const durationBackfillRunRef = useRef(false);

  // Normalize backend status to lowercase enum (draft, pending_approval, published, rejected)
  const normalizeStatus = (s) => {
    if (!s) return "draft";
    const v = String(s).toLowerCase();
    return ["draft", "pending_approval", "published", "rejected"].includes(v)
      ? v
      : "draft";
  };

  // Sync RTK Query result into local state (backend may return { success, data } or raw course)
  useEffect(() => {
    if (!courseData) return;
    const data = courseData?.data ?? courseData;
    if (!data || typeof data !== "object") return;
    setCourseDetails({
      ...data,
      status: normalizeStatus(data.status),
      sections: (data.sections || []).map((sec) => ({
        ...sec,
        dripDays: sec.dripDays ?? sec.drip_days ?? 0,
      })),
    });
    if (data.dripType) setActiveDripType(data.dripType);
    setIsLoadingData(false);
    skipNextAutoSaveRef.current = true; // Skip auto-save for this sync-from-API update
  }, [courseData]);

  useEffect(() => {
    if (isEditMode && queryLoading) setIsLoadingData(true);
  }, [isEditMode, queryLoading]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listEngagementTemplates();
        if (mounted) setEngagementTemplates(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setEngagementTemplates([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    durationBackfillRunRef.current = false;
  }, [id]);

  // One-time backfill: for video contents with videoUrl but no duration, fetch duration and PATCH
  useEffect(() => {
    if (
      !id ||
      !courseDetails?.sections?.length ||
      durationBackfillRunRef.current
    )
      return;
    durationBackfillRunRef.current = true;
    const run = async () => {
      const toBackfill = [];
      for (const section of courseDetails.sections) {
        const chapters = section.chapters || [];
        for (const chapter of chapters) {
          const contents = chapter.contents || [];
          for (const content of contents) {
            if (
              content.type === "video" &&
              content.videoUrl &&
              (content.duration == null || content.duration === 0)
            ) {
              toBackfill.push({
                content,
                chapterId: chapter._id || chapter.id,
              });
            }
          }
        }
      }
      let updated = false;
      for (const { content, chapterId } of toBackfill) {
        try {
          const seconds = await getVideoDurationFromUrl(content.videoUrl);
          if (seconds > 0) {
            await courseService.updateContent("video", content._id, {
              ...content,
              chapter: chapterId,
              duration: seconds,
            });
            updated = true;
          }
        } catch {
          // CORS or load error – skip
        }
      }
      if (updated) await refetchCourse();
    };
    run();
  }, [id, courseDetails?.sections, refetchCourse]);

  const loadCourse = useCallback(async () => {
    if (!id) return;
    await refetchCourse();
  }, [id, refetchCourse]);

  const handleVideoUploadComplete = useCallback(
    async (payload, done) => {
      const { contentId, contentData, isEditing, isHlsCreate } = payload;
      try {
        if (isHlsCreate) {
          toast.success("Success", "Video lesson created (HLS streaming)!");
        } else if (isEditing && contentId) {
          await courseService.updateContent("video", contentId, contentData);
          toast.success("Success", "Video lesson updated!");
        } else {
          await courseService.createContent("video", contentData);
          toast.success("Success", "Video lesson created!");
        }
        await loadCourse();
        // Defer clearing upload state so refetched course data can propagate to UI first;
        // otherwise the pending card disappears before the new video appears in the list.
        if (typeof done === "function") {
          setTimeout(done, 150);
        }
      } catch (err) {
        logger.error("Video save error:", err);
        const { title: t, message: m } = err.apiMessageForToast || {
          title: "Save Failed",
          message: "Failed to save video lesson",
        };
        toast.error(t, m);
        // Do not call done() on error so the card stays visible for retry
      }
    },
    [loadCourse, toast],
  );

  const handleVideoUploadError = useCallback(
    (err, key) => {
      const { title: t, message: m } = err?.apiMessageForToast || {
        title: "Upload Failed",
        message: err?.message || "Video upload failed",
      };
      toast.error(t, m);
    },
    [toast],
  );

  const videoUpload = useVideoUpload(id, {
    onUploadComplete: handleVideoUploadComplete,
    onError: handleVideoUploadError,
  });
  const {
    uploadState: videoUploadState,
    startUpload: startVideoUpload,
    clearUpload: clearVideoUpload,
    retryUpload: retryVideoUpload,
  } = videoUpload;

  const handleSave = useCallback(
    async (status = null, shouldLoad = true, showToast = true) => {
      if (!courseDetails.title?.trim()) {
        toast.error("Missing Information", "Course title is required!");
        return;
      }

      setIsSaving(true);
      try {
        const payload = {
          ...courseDetails,
          dripType: activeDripType,
        };
        delete payload.status;
        delete payload.submittedForReviewAt;
        delete payload.approvedAt;
        delete payload.rejectedAt;
        delete payload.rejectionReason;
        delete payload.approvedBy;
        await dispatch(updateCourse({ id, courseData: payload })).unwrap();
        if (showToast) toast.success("Success", "Course information saved!");
        if (shouldLoad) await loadCourse();
      } catch (error) {
        const { title, message } = error.apiMessageForToast || {
          title: "Save Failed",
          message: "Failed to save course information",
        };
        toast.error(title, message);
      } finally {
        setIsSaving(false);
      }
    },
    [courseDetails, activeDripType, id, dispatch, loadCourse, toast],
  );

  // Auto-save as draft when courseDetails changes (debounced). Skip the update that came from API sync.
  useEffect(() => {
    if (!id || courseDetails.status === "pending_approval") return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    if (!courseDetails.title?.trim()) return;

    const timer = setTimeout(() => {
      skipNextAutoSaveRef.current = true; // Skip the courseDetails update that will come from refetch after save
      handleSave(null, true, false); // no status override, reload after save, no toast
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [courseDetails, id, handleSave]);

  const handleSubmitForReview = useCallback(async () => {
    if (!id) return;
    setIsSubmittingForReview(true);
    try {
      await dispatch(submitForReview(id)).unwrap();
      toast.success("Submitted", "Course submitted for review successfully.");
      await loadCourse();
    } catch (err) {
      const payload = err.payload || err;
      const message =
        payload.message || err.message || "Failed to submit for review.";
      const errors = Array.isArray(payload.errors) ? payload.errors : [];
      const detail = errors.length ? errors.join(" ") : message;
      const title = errors.length
        ? "Course is not ready for review"
        : "Submit failed";
      toast.error(title, detail);
    } finally {
      setIsSubmittingForReview(false);
    }
  }, [id, dispatch, loadCourse, toast]);

  const addSection = useCallback(
    async (title) => {
      try {
        const response = await courseService.createSection({
          course: id,
          title,
        });
        if (response.success) await loadCourse();
      } catch (error) {
        const { title, message } = error.apiMessageForToast || {
          title: "Creation Failed",
          message: "Failed to create section",
        };
        toast.error(title, message);
      }
    },
    [id, loadCourse, toast],
  );

  const deleteSection = useCallback(
    async (sectionId) => {
      const confirmed = await confirm({
        title: "Delete this section?",
        message:
          "This action cannot be undone. All chapters in this section will also be deleted.",
        confirmText: "Delete",
        variant: "danger",
      });
      if (confirmed) {
        try {
          await courseService.deleteSection(sectionId);
          await loadCourse();
        } catch (error) {
          const { title: t, message: m } = error.apiMessageForToast || {
            title: "Deletion Failed",
            message: "Failed to delete section",
          };
          toast.error(t, m);
        }
      }
    },
    [loadCourse, confirm, toast],
  );

  const updateSection = useCallback(
    async (sectionId, title) => {
      try {
        await courseService.updateSection(sectionId, { title });
        await loadCourse();
      } catch (error) {
        const { title: t2, message: m2 } = error.apiMessageForToast || {
          title: "Update Failed",
          message: "Failed to update section",
        };
        toast.error(t2, m2);
      }
    },
    [loadCourse, toast],
  );

  const addChapter = useCallback(
    async (sectionId, title = "New Chapter") => {
      try {
        const response = await courseService.createChapter({
          section: sectionId,
          title,
        });
        if (response.success) {
          const newChapter = response.data;
          await loadCourse();
          setExpandedChapterId(newChapter._id || newChapter.id);
        }
      } catch (error) {
        const { title: t3, message: m3 } = error.apiMessageForToast || {
          title: "Creation Failed",
          message: "Failed to create chapter",
        };
        toast.error(t3, m3);
      }
    },
    [loadCourse, toast],
  );

  const updateChapter = useCallback(async (sectionId, chapterId, updates) => {
    setCourseDetails((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        const secId = sec._id || sec.id;
        if (secId === sectionId) {
          return {
            ...sec,
            chapters: sec.chapters.map((ch) =>
              (ch._id || ch.id) === chapterId ? { ...ch, ...updates } : ch,
            ),
          };
        }
        return sec;
      });
      return { ...prev, sections: updatedSections };
    });
    try {
      await courseService.updateChapter(chapterId, updates);
    } catch (error) {
      logger.error("Failed to update chapter", error);
    }
  }, []);

  const deleteChapter = useCallback(
    async (chapterId) => {
      const confirmed = await confirm({
        title: "Delete this chapter?",
        message:
          "This action cannot be undone. All content in this chapter will be permanently removed.",
        confirmText: "Delete",
        variant: "danger",
      });
      if (confirmed) {
        try {
          await courseService.deleteChapter(chapterId);
          await loadCourse();
        } catch (error) {
          const { title: t4, message: m4 } = error.apiMessageForToast || {
            title: "Deletion Failed",
            message: "Failed to delete chapter",
          };
          toast.error(t4, m4);
        }
      }
    },
    [loadCourse, confirm, toast],
  );

  const deleteContent = useCallback(
    async (type, contentId) => {
      const confirmed = await confirm({
        title: `Delete this ${type}?`,
        message:
          "This action cannot be undone and the content will be permanently removed.",
        confirmText: "Delete",
        variant: "danger",
      });
      if (confirmed) {
        try {
          await courseService.deleteContent(type, contentId);
          toast.success(
            "Deleted",
            `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`,
          );
          await loadCourse();
        } catch (error) {
          logger.error("Failed to delete content", error);
          const { title: t5, message: m5 } = error.apiMessageForToast || {
            title: "Deletion Failed",
            message: "Failed to delete content",
          };
          toast.error(t5, m5);
        }
      }
    },
    [loadCourse, confirm, toast],
  );

  const moveSection = useCallback(
    async (fromIdx, toIdx) => {
      const newSections = [...courseDetails.sections];
      const [movedSection] = newSections.splice(fromIdx, 1);
      newSections.splice(toIdx, 0, movedSection);
      setCourseDetails((prev) => ({ ...prev, sections: newSections }));
      try {
        const sectionIds = newSections.map((sec) =>
          (sec._id || sec.id).toString(),
        );
        await courseService.updateCourse(id, { sections: sectionIds });
      } catch (error) {
        logger.error("Failed to persist section order", error);
        loadCourse();
      }
    },
    [id, courseDetails.sections, loadCourse],
  );

  const moveChapter = useCallback(
    async (sectionId, fromIdx, toIdx) => {
      const sId = (sectionId || "").toString();
      const sectionIdx = courseDetails.sections.findIndex(
        (sec) => (sec._id || sec.id).toString() === sId,
      );
      if (sectionIdx === -1) return;

      const targetSection = courseDetails.sections[sectionIdx];
      const newChapters = [...targetSection.chapters];
      const [movedChapter] = newChapters.splice(fromIdx, 1);
      newChapters.splice(toIdx, 0, movedChapter);

      const newSections = courseDetails.sections.map((sec, idx) =>
        idx === sectionIdx ? { ...sec, chapters: newChapters } : sec,
      );
      setCourseDetails((prev) => ({ ...prev, sections: newSections }));

      try {
        const chapterIds = newChapters.map((ch) =>
          (ch._id || ch.id).toString(),
        );
        await courseService.updateSection(sId, { chapters: chapterIds });
      } catch (error) {
        logger.error("Failed to persist chapter order", error);
        loadCourse();
      }
    },
    [courseDetails.sections, loadCourse],
  );

  const handleContentTrigger = useCallback(
    (type, chapterId, existingQuiz = null, secName = "", chapName = "") => {
      setActiveFileUploadType(type === "assignment" ? "quiz" : type);
      setUploadingChapterId(chapterId);

      if (type === "quiz" || type === "assignment") {
        setQuizPreferredAssessmentMode(
          type === "assignment" ? "assignment" : "quiz",
        );
        setQuizChapterId(chapterId);
        setSelectionChapterId(chapterId);
        let finalExistingQuiz = existingQuiz;
        let finalSecName = secName;
        let finalChapName = chapName;

        if (!finalExistingQuiz || !finalSecName) {
          courseDetails.sections?.forEach((sec) => {
            const chapter = sec.chapters?.find(
              (ch) => (ch._id || ch.id)?.toString() === chapterId?.toString(),
            );
            if (chapter) {
              finalSecName = sec.title;
              finalChapName = chapter.title;
              if (chapter.contents?.length > 0) {
                finalExistingQuiz = chapter.contents.find(
                  (c) => c.type === "quiz",
                );
              }
            }
          });
        }
        setQuizSectionName(finalSecName);
        setQuizChapterName(finalChapName);
        setCurrentEditingQuiz(finalExistingQuiz);
        setIsQuizModalOpen(true);
      } else if (type === "video") {
        let chapterTitle = "Chapter Video";
        let existingVideo = null;
        courseDetails.sections?.forEach((sec) => {
          const chapter = sec.chapters?.find(
            (ch) => (ch._id || ch.id)?.toString() === chapterId?.toString(),
          );
          if (chapter) chapterTitle = chapter.title || chapterTitle;
          if (chapter?.contents?.length > 0) {
            existingVideo = chapter.contents.find((c) => c.type === "video");
          }
        });
        setUploadingChapterTitle(chapterTitle);
        setEditingVideoContent(existingVideo || null);
        setIsVideoModalOpen(true);
      } else if (type === "article") {
        let existingArticle = null;
        courseDetails.sections?.forEach((sec) => {
          const chapter = sec.chapters?.find(
            (ch) => (ch._id || ch.id)?.toString() === chapterId?.toString(),
          );
          if (chapter?.contents?.length > 0) {
            existingArticle = chapter.contents.find(
              (c) => c.type === "article",
            );
          }
        });
        setEditingArticleContent(existingArticle || null);
        setIsArticleModalOpen(true);
      } else if (type === "link") {
        let existingLink = null;
        courseDetails.sections?.forEach((sec) => {
          const chapter = sec.chapters?.find(
            (ch) => (ch._id || ch.id)?.toString() === chapterId?.toString(),
          );
          if (chapter?.contents?.length > 0) {
            existingLink = chapter.contents.find(
              (c) => c.type === "resource" && c.fileType === "link",
            );
          }
        });
        setEditingLinkContent(existingLink || null);
        setIsLinkModalOpen(true);
      } else if (
        ["audio", "image", "resource"].includes(type) ||
        type === "pdf" ||
        type === "document"
      ) {
        fileInputRef.current?.click();
      }
    },
    [courseDetails.sections],
  );

  const handleSaveArticle = useCallback(
    async (articleData) => {
      if (!uploadingChapterId) return;
      setIsSaving(true);
      try {
        const contentData = {
          chapter: uploadingChapterId,
          type: "article",
          title: articleData.title,
          body: articleData.body,
          metadata: { charCount: articleData.body.length },
        };
        if (editingArticleContent?._id) {
          await courseService.updateContent(
            "article",
            editingArticleContent._id,
            contentData,
          );
          toast.success("Success", "Article updated!");
        } else {
          await courseService.createContent("article", contentData);
          toast.success("Success", "Article added to curriculum!");
        }
        await loadCourse();
        setIsArticleModalOpen(false);
        setEditingArticleContent(null);
      } catch (error) {
        const { title: t6, message: m6 } = error.apiMessageForToast || {
          title: "Error",
          message: "Failed to save article",
        };
        toast.error(t6, m6);
      } finally {
        setIsSaving(false);
      }
    },
    [uploadingChapterId, editingArticleContent, loadCourse, toast],
  );

  const handleSaveLink = useCallback(
    async (linkData) => {
      if (!uploadingChapterId) return;
      setIsSaving(true);
      try {
        const contentData = {
          chapter: uploadingChapterId,
          type: "resource",
          title: linkData.title,
          fileUrl: linkData.url,
          fileType: "link",
          metadata: { external: true },
        };
        if (editingLinkContent?._id) {
          await courseService.updateContent(
            "resource",
            editingLinkContent._id,
            contentData,
          );
          toast.success("Success", "Link updated!");
        } else {
          await courseService.createContent("resource", contentData);
          toast.success("Success", "Link added to curriculum!");
        }
        await loadCourse();
        setIsLinkModalOpen(false);
        setEditingLinkContent(null);
      } catch (error) {
        const { title: t7, message: m7 } = error.apiMessageForToast || {
          title: "Error",
          message: "Failed to save link",
        };
        toast.error(t7, m7);
      } finally {
        setIsSaving(false);
      }
    },
    [uploadingChapterId, editingLinkContent, loadCourse, toast],
  );

  const findVideoContentById = useCallback(
    (contentId) => {
      for (const section of courseDetails.sections || []) {
        for (const chapter of section.chapters || []) {
          const found = chapter.contents?.find(
            (c) => (c._id || c.id)?.toString() === String(contentId),
          );
          if (found) return { content: found, chapter };
        }
      }
      return null;
    },
    [courseDetails.sections],
  );

  const updateVideoDescription = useCallback(
    async (contentId, description) => {
      const found = findVideoContentById(contentId);
      if (!found) return;
      setIsSaving(true);
      try {
        const payload = {
          ...found.content,
          chapter: found.chapter._id || found.chapter.id,
          description: description ?? "",
        };
        await courseService.updateContent("video", contentId, payload);
        toast.success("Success", "Description updated!");
        await loadCourse();
      } catch (error) {
        const { title: t, message: m } = error.apiMessageForToast || {
          title: "Error",
          message: "Failed to update description",
        };
        toast.error(t, m);
      } finally {
        setIsSaving(false);
      }
    },
    [findVideoContentById, loadCourse, toast],
  );

  const openResourceUpload = useCallback((content) => {
    if (content?.type === "video") setResourceUploadContent(content);
  }, []);

  const closeResourceUpload = useCallback(
    () => setResourceUploadContent(null),
    [],
  );

  const openDescriptionModal = useCallback((content) => {
    if (content?.type === "video") setDescriptionModalContent(content);
  }, []);

  const closeDescriptionModal = useCallback(
    () => setDescriptionModalContent(null),
    [],
  );

  const handleSaveResources = useCallback(
    async (contentId, files) => {
      if (!files?.length || !id) return;
      const found = findVideoContentById(contentId);
      if (!found) return;
      setIsSaving(true);
      try {
        const existingResources = found.content.resources || [];
        const newResources = [];
        for (const file of files) {
          const r = await courseService.uploadMedia(file, id);
          if (r?.success && r?.data?.url) {
            newResources.push({
              title: file.name,
              url: r.data.url,
              fileType: file.type,
              fileSize: file.size,
            });
          }
        }
        const payload = {
          ...found.content,
          chapter: found.chapter._id || found.chapter.id,
          resources: [...existingResources, ...newResources],
        };
        await courseService.updateContent("video", contentId, payload);
        toast.success("Success", "Resources added!");
        await loadCourse();
        setResourceUploadContent(null);
      } catch (error) {
        const { title: t, message: m } = error.apiMessageForToast || {
          title: "Error",
          message: "Failed to add resources",
        };
        toast.error(t, m);
      } finally {
        setIsSaving(false);
      }
    },
    [id, findVideoContentById, loadCourse, toast],
  );

  const handleSaveVideo = useCallback(
    (videoData) => {
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
      } = videoData;
      const isEditing = !!editingVideoContent;
      if (!isEditing && !videoFile) return;
      if (!uploadingChapterId) return;

      const chapterId = uploadingChapterId;
      const pendingKey = `pending-${chapterId}`;
      const existingUpload =
        videoUploadState[pendingKey] ||
        (editingVideoContent?._id && videoUploadState[editingVideoContent._id]);
      if (
        existingUpload &&
        ["uploading", "processing"].includes(existingUpload.status)
      ) {
        toast.error(
          "Upload in progress",
          "Please wait for the current upload to finish.",
        );
        return;
      }

      // Close modal immediately so UX is non-blocking; upload continues in background
      setIsVideoModalOpen(false);
      setEditingVideoContent(null);
      setUploadingChapterId(null);

      const payload = {
        videoFile,
        thumbnailFile,
        subtitles: subtitles || [],
        title,
        description,
        resourceFiles: resourceFiles || [],
        engagementTemplateId: engagementTemplateId || "",
        engagementTemplateName: engagementTemplateName || "",
        engagementTemplateLabels: engagementTemplateLabels || [],
        engagementTemplateEmojis: engagementTemplateEmojis || [],
        chapterId,
        existingContent: isEditing ? editingVideoContent : null,
      };
      startVideoUpload(payload);
    },
    [
      uploadingChapterId,
      editingVideoContent,
      videoUploadState,
      startVideoUpload,
      toast,
    ],
  );

  const handleSaveQuiz = useCallback(
    async (chapterId, quizData) => {
      setIsSaving(true);
      try {
        const formattedQuestions = quizData.questions.map((q) => ({
          question: q.question,
          type: q.type || "single",
          options:
            q.type === "subjective"
              ? []
              : (q.options || []).map((opt) =>
                  typeof opt === "string" ? opt : opt.content,
                ),
          correctAnswer: q.type === "single" ? q.correctAnswer : undefined,
          correctAnswers: q.type === "multiple" ? q.correctAnswers : undefined,
          marks: q.marks || 1,
          image: q.questionImage || null,
        }));

        const payload = {
          chapter: chapterId,
          type: "quiz",
          title: quizData.title,
          description: quizData.description,
          questions: formattedQuestions,
          metadata: {
            passingPercentage: quizData.passingPercentage,
            enforcePassingGrade: quizData.enforcePassingGrade,
            enableCountdown: quizData.enableCountdown,
            allowRetake: quizData.allowRetake,
            assessmentMode:
              quizData.assessmentMode === "assignment" ? "assignment" : "quiz",
            questionCount: formattedQuestions.length,
            totalMarks: quizData.questions.reduce((sum, q) => sum + q.marks, 0),
          },
        };

        let response;
        if (currentEditingQuiz?._id) {
          response = await courseService.updateContent(
            "quiz",
            currentEditingQuiz._id,
            payload,
          );
        } else {
          response = await courseService.createContent("quiz", payload);
        }

        if (response.success && response.data)
          setCurrentEditingQuiz(response.data);
        await loadCourse();
        toast.success(
          "Success",
          currentEditingQuiz
            ? "Quiz updated successfully!"
            : "Quiz created successfully!",
        );
        return response.data;
      } catch (error) {
        logger.error("Quiz creation error:", error);
        const { title, message } = error.apiMessageForToast || {
          title: "Creation Failed",
          message: "Failed to create quiz. Please try again.",
        };
        toast.error(title, message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [currentEditingQuiz, loadCourse, toast],
  );

  const onFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !activeFileUploadType) return;

      setIsSaving(true);
      try {
        const uploadRes = await courseService.uploadMedia(file, id);
        if (uploadRes.success) {
          const { url } = uploadRes.data;
          if (
            activeFileUploadType === "course-cover" ||
            activeFileUploadType === "course-thumbnail"
          ) {
            const key =
              activeFileUploadType === "course-cover" ? "thumbnail" : "image";
            const merged = { ...courseDetails, [key]: url };
            // Avoid debounced auto-save overwriting thumbnail with stale state; show preview immediately
            skipNextAutoSaveRef.current = true;
            setCourseDetails(merged);
            await dispatch(updateCourse({ id, courseData: merged })).unwrap();
            await loadCourse();
            if (e.target) e.target.value = "";
            return;
          }

          if (!uploadingChapterId) return;

          let finalType = activeFileUploadType;
          if (
            activeFileUploadType === "pdf" ||
            activeFileUploadType === "document"
          ) {
            finalType = "resource";
          }

          const contentData = {
            chapter: uploadingChapterId,
            type: finalType,
            title: file.name,
            metadata: { fileName: file.name, fileSize: file.size },
          };
          if (finalType === "video") contentData.videoUrl = url;
          else if (finalType === "audio") contentData.audioUrl = url;
          else if (finalType === "image") contentData.imageUrl = url;
          else if (finalType === "resource") {
            contentData.fileUrl = url;
            contentData.fileType = file.name.split(".").pop().toLowerCase();
          } else {
            contentData.fileUrl = url;
          }

          await courseService.createContent(finalType, contentData);
          await loadCourse();
          toast.success(
            "Success",
            `${activeFileUploadType.charAt(0).toUpperCase() + activeFileUploadType.slice(1)} uploaded and added to curriculum!`,
          );
        }
      } catch (error) {
        logger.error("Upload error:", error);
        const { title: t9, message: m9 } = error.apiMessageForToast || {
          title: "Upload Failed",
          message: "File upload failed. Please try again.",
        };
        toast.error(t9, m9);
      } finally {
        setIsSaving(false);
        setUploadingChapterId(null);
        if (e.target) e.target.value = "";
      }
    },
    [
      activeFileUploadType,
      courseDetails,
      uploadingChapterId,
      id,
      dispatch,
      loadCourse,
      toast,
    ],
  );

  const handleUpdateDetails = useCallback((updates) => {
    setCourseDetails((prev) => ({ ...prev, ...updates }));
  }, []);

  const closeQuizModal = useCallback(() => {
    setIsQuizModalOpen(false);
    setCurrentEditingQuiz(null);
    setQuizPreferredAssessmentMode("quiz");
  }, []);

  const closeVideoModal = useCallback(() => {
    setIsVideoModalOpen(false);
    setUploadingChapterId(null);
    setUploadingChapterTitle("");
    setEditingVideoContent(null);
  }, []);

  const closeArticleModal = useCallback(() => {
    setIsArticleModalOpen(false);
    setEditingArticleContent(null);
  }, []);

  const closeLinkModal = useCallback(() => {
    setIsLinkModalOpen(false);
    setEditingLinkContent(null);
  }, []);

  const closeCoursePreview = useCallback(() => setShowCoursePreview(false), []);
  const openCoursePreview = useCallback(() => setShowCoursePreview(true), []);

  const fileInputAccept = useMemo(() => {
    if (
      activeFileUploadType === "video" ||
      activeFileUploadType === "course-thumbnail"
    )
      return "video/*";
    if (activeFileUploadType === "image") return "image/*";
    if (activeFileUploadType === "audio")
      return "audio/*,.mp3,.wav,.ogg,.m4a,.aac";
    if (activeFileUploadType === "pdf") return ".pdf";
    if (activeFileUploadType === "document")
      return ".doc,.docx,.ppt,.pptx,.txt,.csv";
    return undefined;
  }, [activeFileUploadType]);

  return {
    // State
    id,
    isEditMode,
    courseDetails,
    engagementTemplates,
    activeTab,
    isSaving,
    isSubmittingForReview,
    isLoadingData,
    expandedChapterId,
    selectionChapterId,
    uploadingChapterId,
    uploadingChapterTitle,
    activeFileUploadType,
    activeReportSubTab,
    activeCommentStatus,
    activeDripType,
    isQuizModalOpen,
    quizChapterId,
    currentEditingQuiz,
    quizSectionName,
    quizChapterName,
    quizPreferredAssessmentMode,
    showCoursePreview,
    isVideoModalOpen,
    editingVideoContent,
    videoUploadState,
    clearVideoUpload,
    retryVideoUpload,
    isArticleModalOpen,
    editingArticleContent,
    isLinkModalOpen,
    editingLinkContent,
    resourceUploadContent,
    descriptionModalContent,
    fileInputRef,
    fileInputAccept,

    // Setters
    setActiveTab,
    setActiveReportSubTab,
    setActiveCommentStatus,
    setActiveDripType,
    setExpandedChapterId,
    setSelectionChapterId,
    setCourseDetails,
    setEngagementTemplates,
    setShowCoursePreview,
    setActiveFileUploadType,

    // Handlers
    handleSave,
    handleSubmitForReview,
    handleUpdateDetails,
    addSection,
    deleteSection,
    updateSection,
    addChapter,
    updateChapter,
    deleteChapter,
    deleteContent,
    moveSection,
    moveChapter,
    handleContentTrigger,
    handleSaveArticle,
    handleSaveLink,
    handleSaveVideo,
    handleSaveQuiz,
    updateVideoDescription,
    openResourceUpload,
    closeResourceUpload,
    openDescriptionModal,
    closeDescriptionModal,
    handleSaveResources,
    onFileChange,
    loadCourse,
    closeQuizModal,
    closeVideoModal,
    closeArticleModal,
    closeLinkModal,
    closeCoursePreview,
    openCoursePreview,
    navigate,
  };
}
