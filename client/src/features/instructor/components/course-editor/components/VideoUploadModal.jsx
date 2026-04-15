import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Video,
  Loader2,
  AlertCircle,
  Trash2,
  Edit2,
  Plus,
} from "lucide-react";

/**
 * Video Upload Modal: video file, title, thumbnail, subtitles only.
 * Description and resources are edited in the curriculum tab (Tagmango-style).
 */
const VideoUploadModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  existingContent,
  chapterTitle = "",
  templates = [],
}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [subtitles, setSubtitles] = useState([]); // [{ id, language, file }]
  const [title, setTitle] = useState("");
  const [engagementTemplateId, setEngagementTemplateId] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && existingContent) {
      setTitle(existingContent.title || "");
      setThumbnailPreview(existingContent.thumbnail || null);
      setVideoFile(null);
      setThumbnailFile(null);
      setSubtitles([]);
      setEngagementTemplateId(
        existingContent.engagementTemplateId ||
          existingContent.metadata?.engagementTemplateId ||
          "",
      );
    } else if (isOpen && !existingContent) {
      setTitle(chapterTitle || "");
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setSubtitles([]);
      setEngagementTemplateId("");
    }
  }, [isOpen, existingContent, chapterTitle]);

  if (!isOpen) return null;

  const isEditing = !!existingContent;

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubtitle = () => {
    setSubtitles([
      ...subtitles,
      { id: Date.now(), language: "English", file: null },
    ]);
  };

  const handleRemoveSubtitle = (id) => {
    setSubtitles(subtitles.filter((s) => s.id !== id));
  };

  const handleSubtitleChange = (id, field, value) => {
    setSubtitles(
      subtitles.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleStartProcessing = () => {
    if (!isEditing && !videoFile) return;
    const selectedTemplate = templates.find(
      (template) => String(template._id) === String(engagementTemplateId),
    );
    onSave({
      videoFile,
      thumbnailFile,
      subtitles,
      title,
      description: existingContent?.description ?? "",
      resourceFiles: [],
      engagementTemplateId,
      engagementTemplateName:
        selectedTemplate?.question || selectedTemplate?.name || "",
      engagementTemplateLabels: selectedTemplate?.labels || [],
      engagementTemplateEmojis: selectedTemplate?.emojis || [],
    });
  };

  // Determine what to show in the video area
  const hasExistingVideo = isEditing && existingContent?.videoUrl;
  const hasVideoSelected = !!videoFile;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[520px] bg-[#1E1E1E] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01]">
          <h2 className="text-[17px] font-bold text-white tracking-tight mx-auto">
            {isEditing ? "Edit Video" : "Upload Video"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-white/10">
          {/* Video Upload Area / Summary Card */}
          <div
            onClick={() =>
              !hasVideoSelected &&
              !hasExistingVideo &&
              videoInputRef.current?.click()
            }
            className={`relative w-full rounded-[20px] transition-all ${!hasVideoSelected && !hasExistingVideo ? "cursor-pointer group" : ""}`}
          >
            {hasVideoSelected || hasExistingVideo ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-[20px] p-4 flex items-center justify-between group/card shadow-lg">
                <div className="flex items-center gap-4">
                  {/* Show thumbnail if available, otherwise show video icon */}
                  {thumbnailPreview ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-pink/20 flex items-center justify-center text-primary-pink shadow-inner">
                      <Video size={24} />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-[14px] font-bold text-white truncate max-w-[280px]">
                      {title || existingContent?.title || chapterTitle || "Video"}
                    </p>
                    <p className="text-[11px] font-black uppercase tracking-wider text-white/30 mt-0.5">
                      MP4 •{" "}
                      {videoFile
                        ? (videoFile.size / (1024 * 1024)).toFixed(2) + " MB"
                        : existingContent?.metadata?.fileSize
                          ? (
                              existingContent.metadata.fileSize /
                              (1024 * 1024)
                            ).toFixed(2) + " MB"
                          : "Video"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    videoInputRef.current?.click();
                  }}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            ) : (
              <div className="min-h-[140px] border-2 border-dashed border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03] rounded-[20px] flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-all">
                  <Upload size={24} />
                </div>
                <p className="text-[14px] font-bold text-white/50 group-hover:text-white transition-colors">
                  Tap to Upload video from Computer
                </p>
              </div>
            )}
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleVideoSelect}
            />
          </div>

          {/* Add Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Course"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white focus:outline-none focus:border-primary-pink/30 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">
              Chapter Engagement Template
            </label>
            <select
              value={engagementTemplateId}
              onChange={(e) => setEngagementTemplateId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white focus:outline-none focus:border-primary-pink/30 transition-all"
            >
              <option value="" className="bg-[#1E1E1E]">
                No template
              </option>
              {templates.map((template) => (
                <option
                  key={template._id}
                  value={template._id}
                  className="bg-[#1E1E1E]"
                >
                  {template.question || template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thumbnail Section */}
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[20px]">
            <div className="space-y-1 pr-4">
              <h4 className="text-[13px] font-bold text-white">
                Add Thumbnail (Optional)
              </h4>
              <p className="text-[11px] text-white/40 leading-relaxed">
                You can upload a thumbnail for your video.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {thumbnailPreview && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[18px] text-[11px] font-bold text-white transition-all whitespace-nowrap active:scale-95"
              >
                {thumbnailFile || thumbnailPreview
                  ? "Change Thumbnail"
                  : "Upload Thumbnail"}
              </button>
            </div>
            <input
              type="file"
              ref={thumbnailInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleThumbnailSelect}
            />
          </div>

          {/* Subtitles Section */}
          <div className="space-y-4">
            {subtitles.length > 0 && (
              <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20">
                  Language
                </label>
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20">
                  Upload Subtitle (vtt only)
                </label>
                <div className="w-6" />
              </div>
            )}

            {subtitles.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center animate-in slide-in-from-top-1 duration-200"
              >
                <select
                  value={sub.language}
                  onChange={(e) =>
                    handleSubtitleChange(sub.id, "language", e.target.value)
                  }
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[12px] font-bold text-white focus:outline-none focus:border-primary-pink/30 appearance-none cursor-pointer"
                >
                  <option value="English" className="bg-[#1E1E1E]">
                    English
                  </option>
                  <option value="Tamil" className="bg-[#1E1E1E]">
                    Tamil
                  </option>
                  <option value="Hindi" className="bg-[#1E1E1E]">
                    Hindi
                  </option>
                  <option value="Spanish" className="bg-[#1E1E1E]">
                    Spanish
                  </option>
                </select>

                <div className="relative group/sub">
                  <input
                    type="file"
                    accept=".vtt"
                    onChange={(e) =>
                      handleSubtitleChange(sub.id, "file", e.target.files[0])
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold text-white/40 truncate group-hover/sub:border-white/20 transition-all flex items-center justify-between">
                    <span className="truncate pr-2">
                      {sub.file ? sub.file.name : "Choose file..."}
                    </span>
                    <Upload size={14} className="shrink-0 text-white/20" />
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSubtitle(sub.id)}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddSubtitle}
              className="w-full py-3 border border-dashed border-orange-500/20 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/[0.03] hover:border-orange-500/40 transition-all group"
            >
              <Plus size={15} className="text-orange-500" />
              <span className="text-[12px] font-bold text-orange-500/80 group-hover:text-orange-500 transition-colors">
                Add subtitle
              </span>
            </button>
          </div>

          {/* Compact Note Box */}
          <div className="p-3 bg-orange-500/[0.03] border border-orange-500/10 rounded-xl flex gap-2.5">
            <AlertCircle
              size={14}
              className="text-orange-500 shrink-0 mt-0.5"
            />
            <p className="text-[10.5px] leading-tight text-orange-500/60 font-medium italic">
              Videos uploaded here can't be downloaded later. Please keep a
              backup for your later use.
            </p>
          </div>

          {/* CTA Button */}
          <button
            disabled={(!isEditing && !videoFile) || isSaving}
            onClick={handleStartProcessing}
            className={`w-full py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5
                            ${
                              (!isEditing && !videoFile) || isSaving
                                ? "bg-white/5 text-white/20 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-[#FF3FB4]/10 hover:shadow-[#FF3FB4]/20 hover:brightness-105"
                            }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : isEditing ? (
              "Update Video"
            ) : (
              "Start Video Processing"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
