import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Headphones,
  ImageIcon,
  FileText,
  FileQuestion,
  Link as LinkIcon,
  FileEdit,
  X,
  PlayCircle,
  Edit2,
  ChevronRight,
  Check,
  GripVertical,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import ContentTypeIcon from "@/features/instructor/components/course-editor/shared/ContentTypeIcon";
import { Button, Card, Badge, ContentCard } from "@/components/ui";
import CurriculumContentTypeCard from "./CurriculumContentTypeCard";
import CurriculumContentItem from "./CurriculumContentItem";

/**
 * Curriculum tab for creating and organizing course content (sections and chapters)
 */
const CurriculumTab = ({
  sections,
  onAddSection,
  onAddChapter,
  onDeleteSection,
  onUpdateSection,
  onDeleteChapter,
  onUpdateChapter,
  onTriggerContent,
  onDeleteContent,
  expandedChapterId,
  setExpandedChapterId,
  selectionChapterId,
  setSelectionChapterId,
  onMoveSection,
  onMoveChapter,
  videoUploadState = {},
  retryVideoUpload,
  onOpenResourceUpload,
  onUpdateDescription,
}) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingChapterToSection, setAddingChapterToSection] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterIsFree, setNewChapterIsFree] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [expandedSectionId, setExpandedSectionId] = useState(
    () => sections?.[0]?._id || sections?.[0]?.id || null
  );
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState("");

  const [draggingSectionIndex, setDraggingSectionIndex] = useState(null);
  const [draggingChapterInfo, setDraggingChapterInfo] = useState(null);
  const [dragOverChapterIndex, setDragOverChapterIndex] = useState(null);

  const handleSectionDragStart = (idx) => setDraggingSectionIndex(idx);
  const handleSectionDragOver = (e) => e.preventDefault();
  const handleSectionDrop = (targetIdx) => {
    if (draggingSectionIndex === null || draggingSectionIndex === targetIdx) {
      setDraggingSectionIndex(null);
      return;
    }
    if (onMoveSection) onMoveSection(draggingSectionIndex, targetIdx);
    setDraggingSectionIndex(null);
  };

  const handleChapterDragStart = (e, sectionId, idx) => {
    const sId = (sectionId || "").toString();
    e.dataTransfer.setData("text/plain", idx.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggingChapterInfo({ sectionId: sId, idx });
  };
  const handleChapterDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverChapterIndex(index);
  };
  const handleChapterDrop = (e, targetSectionId, targetIdx) => {
    e.preventDefault();
    e.stopPropagation();
    const tSId = (targetSectionId || "").toString();
    if (!draggingChapterInfo) return;
    const sourceSId = draggingChapterInfo.sectionId;
    const sourceIdx = draggingChapterInfo.idx;
    if (sourceSId === tSId && sourceIdx !== targetIdx) {
      if (onMoveChapter) onMoveChapter(tSId, sourceIdx, targetIdx);
    }
    setDraggingChapterInfo(null);
    setDragOverChapterIndex(null);
  };

  const handleSaveSection = () => {
    if (newSectionTitle.trim()) {
      onAddSection(newSectionTitle);
      setNewSectionTitle("");
      setIsAddingSection(false);
    }
  };

  const startEditingSection = (section) => {
    setEditingSectionId(section._id || section.id);
    setEditingSectionTitle(section.title);
  };

  const handleSaveSectionEdit = () => {
    if (editingSectionTitle.trim() && editingSectionId) {
      onUpdateSection(editingSectionId, editingSectionTitle);
      setEditingSectionId(null);
      setEditingSectionTitle("");
    }
  };

  const startEditingChapter = (chapter) => {
    setEditingChapterId(chapter._id || chapter.id);
    setEditingChapterTitle(chapter.title);
  };

  const handleSaveChapterEdit = (sectionId) => {
    if (editingChapterTitle.trim() && editingChapterId) {
      onUpdateChapter(sectionId, editingChapterId, { title: editingChapterTitle });
      setEditingChapterId(null);
      setEditingChapterTitle("");
    }
  };

  const handleSaveChapter = (sectionId) => {
    if (newChapterTitle.trim()) {
      onAddChapter(sectionId, newChapterTitle);
      setNewChapterTitle("");
      setNewChapterIsFree(false);
      setAddingChapterToSection(null);
    }
  };

  const handleCancelChapter = () => {
    setNewChapterTitle("");
    setNewChapterIsFree(false);
    setAddingChapterToSection(null);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in fade-in duration-500 text-gray-900 dark:text-white font-satoshi transition-colors duration-300">
      <ContentCard
        title="Course Content"
        subtitle="Organize your course into sections and add chapters"
        variant="flat"
        className="flex-1 min-h-0 min-w-0"
      >
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div
              key={section._id || section.id}
              className={`space-y-3 transition-all duration-300 ${draggingSectionIndex === sectionIndex ? "opacity-40 grayscale blur-[1px] scale-[0.99]" : ""}`}
              draggable
              onDragStart={(e) => {
                if (draggingChapterInfo) { e.preventDefault(); return; }
                handleSectionDragStart(sectionIndex);
              }}
              onDragOver={handleSectionDragOver}
              onDrop={(e) => { e.stopPropagation(); handleSectionDrop(sectionIndex); }}
              onDragEnd={() => setDraggingSectionIndex(null)}
            >
              {/* ── Section Header ── */}
              {(() => {
                const sId = section._id || section.id;
                const isSectionOpen = expandedSectionId === sId;
                return (
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all duration-300 group/section ${
                      isSectionOpen
                        ? "bg-gradient-to-r from-[#FF8C42]/5 to-[#FF3FB4]/5 dark:bg-gradient-to-r dark:from-[#FF8C42]/10 dark:to-[#FF3FB4]/10 border-primary-pink/20 dark:border-primary-pink/15 shadow-[0_2px_14px_rgba(255,63,180,0.07)]"
                        : "bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-white/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-gray-200 dark:hover:border-white/10 hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                    }`}
                    onClick={() => setExpandedSectionId(prev => prev === sId ? null : sId)}
                  >
                    {/* Chevron */}
                    <ChevronRight
                      size={14}
                      className={`flex-shrink-0 transition-all duration-300 ${
                        isSectionOpen ? "rotate-90 text-primary-pink" : "text-gray-300 dark:text-white/20"
                      }`}
                    />

                    {/* Number badge — gradient when open */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-[13px] tabular-nums transition-all duration-300 ${
                      isSectionOpen
                        ? "bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-sm shadow-[0_0_20px_rgba(255,63,180,0.25)]"
                        : "bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-white/40"
                    }`}>
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-100 dark:bg-white/8 flex-shrink-0" />

                    {/* Title area */}
                    <div className="flex-1 min-w-0">
                      {editingSectionId === sId ? (
                        <div
                          className="flex items-center gap-2 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            autoFocus
                            className="flex-1 min-w-0 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[14px] font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/20 outline-none transition-all duration-200"
                            value={editingSectionTitle}
                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveSectionEdit();
                              if (e.key === "Escape") setEditingSectionId(null);
                            }}
                          />
                          <button
                            onClick={() => setEditingSectionId(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors flex-shrink-0"
                          >
                            <X size={13} /> Cancel
                          </button>
                          <button
                            onClick={handleSaveSectionEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors flex-shrink-0"
                          >
                            <Check size={13} /> Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`font-semibold text-[14px] truncate transition-colors duration-200 cursor-text select-none ${
                              isSectionOpen ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-white/70 group-hover/section:text-gray-900 dark:group-hover/section:text-white"
                            }`}
                            onClick={(e) => { e.stopPropagation(); startEditingSection(section); setExpandedSectionId(sId); }}
                            title="Click to edit"
                          >
                            {section.title}
                          </span>
                          <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                            isSectionOpen
                              ? "bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 text-white border border-white/10"
                              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-200/60 dark:border-white/[0.06]"
                          }`}>
                            {section.chapters?.length || 0}{" "}
                            {(section.chapters?.length || 0) === 1 ? "chapter" : "chapters"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditingSection(section); }}
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-300 dark:text-white/30 hover:text-gray-700 dark:hover:text-white transition-colors"
                          title="Edit section"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteSection(sId); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 dark:text-white/30 hover:text-red-500 transition-colors"
                          title="Delete section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div
                        className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50 cursor-grab active:cursor-grabbing hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                        aria-label="Drag to reorder section"
                      >
                        <GripVertical size={16} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Chapters Container (accordion) ── */}
              {expandedSectionId === (section._id || section.id) && (
              <div className="bg-gray-50/80 dark:bg-[#1E1E1E] border border-gray-100 dark:border-white/[0.07] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 space-y-1.5">
                  {section.chapters?.map((chapter, index) => {
                    const chId = chapter._id || chapter.id;
                    const isExpanded = expandedChapterId === chId;
                    const isEditing = editingChapterId === chId;
                    const isSelectionMode = selectionChapterId === chId;

                    return (
                      <div
                        key={chId}
                        className={`relative rounded-xl transition-all duration-250 group/chapter ${
                          draggingChapterInfo?.idx === index &&
                          draggingChapterInfo?.sectionId === (section._id || section.id).toString()
                            ? "opacity-30 scale-[0.98]"
                            : ""
                        } ${
                          dragOverChapterIndex === index
                            ? "ring-2 ring-primary-pink/30 dark:ring-primary-pink/25"
                            : ""
                        }`}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleChapterDragStart(e, section._id || section.id, index);
                        }}
                        onDragOver={(e) => handleChapterDragOver(e, index)}
                        onDragLeave={() => setDragOverChapterIndex(null)}
                        onDrop={(e) => handleChapterDrop(e, section._id || section.id, index)}
                        onDragEnd={() => {
                          setDraggingChapterInfo(null);
                          setDragOverChapterIndex(null);
                        }}
                      >
                        {/* Left accent on expand */}

                        {/* Chapter header row */}
                        <div
                          className={`flex items-center justify-between pl-4 pr-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none bg-white dark:bg-[#272727] border ${
                            isExpanded
                              ? "border-primary-pink/15 dark:border-primary-pink/10 shadow-sm"
                              : "border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm"
                          }`}
                          onClick={() => {
                            const nextExpanded = !isExpanded;
                            setExpandedChapterId(nextExpanded ? chId : null);
                            if (nextExpanded && (!chapter.contents || chapter.contents.length === 0)) {
                              setSelectionChapterId(chId);
                            } else {
                              setSelectionChapterId(null);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {/* Chevron */}
                            <ChevronRight
                              size={13}
                              className={`flex-shrink-0 text-gray-400 dark:text-white/30 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
                            />

                            {/* Chapter label */}
                            <span className="flex-shrink-0 text-[11px] font-black uppercase tracking-[0.12em] text-gray-500 dark:text-white/40 transition-colors duration-200">
                              Chapter {index + 1}
                            </span>

                            {/* Separator */}
                            <div className="flex-shrink-0 w-px h-3.5 bg-gray-200 dark:bg-white/10" />

                            {/* Content icon */}
                            <FileText
                              size={12}
                              className="flex-shrink-0 text-gray-400 dark:text-white/25 transition-colors duration-200"
                            />

                            {/* Chapter title / edit input */}
                            {isEditing ? (
                              <div
                                className="flex items-center gap-2 flex-1 max-w-md"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  autoFocus
                                  className="flex-1 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-gray-900 dark:text-white focus:border-primary-pink outline-none transition-all duration-200"
                                  value={editingChapterTitle}
                                  onChange={(e) => setEditingChapterTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveChapterEdit(section._id || section.id);
                                    if (e.key === "Escape") setEditingChapterId(null);
                                  }}
                                />
                                <button
                                  onClick={() => setEditingChapterId(null)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                                >
                                  <X size={11} /> Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveChapterEdit(section._id || section.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                                >
                                  <Check size={11} /> Save
                                </button>
                              </div>
                            ) : (
                              <span
                                className="text-[13px] font-semibold text-gray-600 dark:text-white/60 group-hover/chapter:text-gray-900 dark:group-hover/chapter:text-white/90 truncate max-w-[260px] transition-colors duration-200 cursor-text select-none"
                                onClick={(e) => { e.stopPropagation(); startEditingChapter(chapter); }}
                                title="Click to edit"
                              >
                                {chapter.title}
                              </span>
                            )}

                            {chapter.type && (
                              <Badge className="flex-shrink-0 bg-primary-pink/8 text-primary-pink border-primary-pink/15 text-[10px] py-0 capitalize">
                                {chapter.type}
                              </Badge>
                            )}
                          </div>

                          {/* Right side actions */}
                          <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                            {(!chapter.contents || chapter.contents.length === 0) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isTogglingOff = selectionChapterId === chId;
                                  if (isTogglingOff) {
                                    setSelectionChapterId(null);
                                  } else {
                                    setSelectionChapterId(chId);
                                    if (!isExpanded) setExpandedChapterId(chId);
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 border ${
                                  selectionChapterId === chId
                                    ? "bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white border-transparent shadow-[0_4px_12px_rgba(255,63,180,0.3)]"
                                    : "bg-white dark:bg-white/5 text-gray-600 dark:text-white/70 border-gray-200 dark:border-white/8 hover:border-primary-pink/30 hover:text-primary-pink"
                                }`}
                              >
                                <Plus
                                  size={13}
                                  className={selectionChapterId === chId ? "rotate-45 transition-transform" : "transition-transform"}
                                />
                                Content
                              </button>
                            )}

                            <div className="flex items-center gap-0.5 opacity-0 group-hover/chapter:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => { e.stopPropagation(); startEditingChapter(chapter); }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/30 hover:text-gray-800 dark:hover:text-white transition-colors"
                                title="Edit chapter"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteChapter(chId); }}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors"
                                title="Delete chapter"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div className="text-gray-300 dark:text-white/15 hover:text-gray-500 dark:hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors">
                              <GripVertical size={15} />
                            </div>
                          </div>
                        </div>

                        {/* Expanded content panel */}
                        {isExpanded &&
                          (isSelectionMode || chapter.type || chapter.contents?.length > 0) && (
                            <div className="mt-1.5 mx-1.5 mb-1.5 p-4 bg-white dark:bg-[#222] rounded-xl border border-gray-100 dark:border-white/[0.06] shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
                              {isSelectionMode ? (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                  <div className="flex items-center justify-between mb-5 px-0.5">
                                    <div>
                                      <p className="text-[13px] font-bold text-gray-700 dark:text-white/70">
                                        Choose content type
                                      </p>
                                      <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">
                                        Select the main type of content for this chapter
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectionChapterId(null); }}
                                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white transition-colors"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("video", chId)}
                                      Icon={PlayCircle}
                                      color="bg-[#FF5A5F]"
                                      label="Video"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("audio", chId)}
                                      Icon={PlayCircle}
                                      color="bg-[#FF9F00]"
                                      label="Audio"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("image", chId)}
                                      Icon={ImageIcon}
                                      color="bg-[#00C9FF]"
                                      label="Image"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("pdf", chId)}
                                      Icon={FileText}
                                      color="bg-[#FF1E6D]"
                                      label="PDF"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("document", chId)}
                                      Icon={FileText}
                                      color="bg-[#00D285]"
                                      label="Document"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("link", chId)}
                                      Icon={LinkIcon}
                                      color="bg-[#4A69FF]"
                                      label="Link"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("article", chId)}
                                      Icon={FileEdit}
                                      color="bg-[#1B263B]"
                                      label="Text"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("quiz", chId)}
                                      Icon={FileQuestion}
                                      color="bg-[#8B5CF6]"
                                      label="Quiz"
                                    />
                                    <CurriculumContentTypeCard
                                      onClick={() => onTriggerContent("assignment", chId)}
                                      Icon={ClipboardList}
                                      color="bg-[#0D9488]"
                                      label="Assignment"
                                    />
                                  </div>

                                  {videoUploadState[`pending-${chId}`] && (
                                    <div className="mt-4">
                                      <CurriculumContentItem
                                        key={`pending-${chId}`}
                                        content={{
                                          type: "video",
                                          _id: `pending-${chId}`,
                                          title: videoUploadState[`pending-${chId}`].title,
                                        }}
                                        chapterId={chId}
                                        onTriggerContent={onTriggerContent}
                                        onDeleteContent={() => {}}
                                        uploadState={videoUploadState[`pending-${chId}`]}
                                        onRetryUpload={retryVideoUpload}
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : chapter.contents && chapter.contents.length > 0 ? (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                  {chapter.contents.map((content, contentIdx) => (
                                    <CurriculumContentItem
                                      key={content._id || contentIdx}
                                      content={content}
                                      chapterId={chId}
                                      onTriggerContent={onTriggerContent}
                                      onDeleteContent={onDeleteContent}
                                      onOpenResourceUpload={onOpenResourceUpload}
                                      onUpdateDescription={onUpdateDescription}
                                      uploadState={videoUploadState[content._id]}
                                      onRetryUpload={retryVideoUpload}
                                    />
                                  ))}
                                  {videoUploadState[`pending-${chId}`] && (
                                    <CurriculumContentItem
                                      key={`pending-${chId}`}
                                      content={{
                                        type: "video",
                                        _id: `pending-${chId}`,
                                        title: videoUploadState[`pending-${chId}`].title,
                                      }}
                                      chapterId={chId}
                                      onTriggerContent={onTriggerContent}
                                      onDeleteContent={() => {}}
                                      onOpenResourceUpload={onOpenResourceUpload}
                                      onUpdateDescription={onUpdateDescription}
                                      uploadState={videoUploadState[`pending-${chId}`]}
                                      onRetryUpload={retryVideoUpload}
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between animate-in fade-in duration-300">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary-pink/10 dark:bg-primary-pink/15 flex items-center justify-center text-primary-pink border border-primary-pink/15">
                                      {chapter.type === "video" ? (
                                        <PlayCircle size={18} />
                                      ) : (
                                        <FileText size={18} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[13px] font-bold text-gray-900 dark:text-white capitalize">
                                        {chapter.type} Content
                                      </p>
                                      <p className="text-[11px] text-gray-500 dark:text-white/35 mt-0.5">
                                        Primary content type for this chapter
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectionChapterId(chId); }}
                                    className="text-[12px] font-bold text-primary-pink hover:text-primary-pink/80 transition-colors"
                                  >
                                    Change
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    );
                  })}

                  {/* Add chapter inline form */}
                  {addingChapterToSection === (section._id || section.id) ? (
                    <div className="mx-0.5 mt-1 p-3.5 bg-white dark:bg-[#272727] rounded-xl border border-primary-pink/20 dark:border-primary-pink/15 shadow-sm transition-colors duration-300 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 dark:text-white/35">
                          Chapter {(section.chapters?.length || 0) + 1}
                        </span>
                        <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <input
                          autoFocus
                          className="flex-1 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-[13px] font-medium placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/15 transition-all duration-200"
                          placeholder="Chapter title..."
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveChapter(section._id || section.id)}
                        />
                        <button
                          onClick={handleCancelChapter}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors flex-shrink-0"
                        >
                          <X size={13} /> Cancel
                        </button>
                        <button
                          onClick={() => handleSaveChapter(section._id || section.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors flex-shrink-0"
                        >
                          <Check size={13} /> Save
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5 mt-3 px-0.5">
                        <button
                          onClick={() => setNewChapterIsFree(!newChapterIsFree)}
                          className={`relative w-8 h-4 rounded-full flex-shrink-0 transition-all duration-300 ${newChapterIsFree ? "bg-primary-pink" : "bg-gray-200 dark:bg-white/15"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${newChapterIsFree ? "left-[calc(100%-14px)]" : "left-0.5"}`}
                          />
                        </button>
                        <span className="text-[11px] text-gray-500 dark:text-white/35 font-medium">
                          Make this chapter free for preview
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-1 pt-1.5 pb-0.5">
                      <button
                        onClick={() => setAddingChapterToSection(section._id || section.id)}
                        className="group/addbtn flex items-center gap-2 text-[12px] font-bold text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text opacity-80 group-hover/addbtn:opacity-100 transition-opacity duration-200 px-2 py-1.5 rounded-lg"
                      >
                        <div className="w-5 h-5 rounded-md border-2 border-dashed border-primary-pink/40 group-hover/addbtn:border-primary-pink flex items-center justify-center transition-colors duration-200">
                          <Plus size={11} className="text-primary-pink/90" />
                        </div>
                        Add more chapters
                      </button>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          ))}

          {/* ── Add New Section ── */}
          {isAddingSection ? (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-primary-pink/25 shadow-[0_4px_20px_rgba(255,63,180,0.08)] dark:shadow-none relative overflow-hidden transition-colors duration-300">
              <div className="ml-1 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A80]/15 to-[#C946C6]/15 border border-primary-pink/20 flex items-center justify-center text-primary-pink flex-shrink-0">
                <Plus size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-pink mb-1.5">
                  New Section
                </p>
                <input
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-[14px] font-semibold placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/20 transition-all duration-200"
                  placeholder="Enter section title..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setIsAddingSection(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                >
                  <Check size={14} /> Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSection(true)}
              className="group w-full flex items-center justify-center gap-4 px-10 py-7 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] hover:border-primary-pink/35 dark:hover:border-primary-pink/25 bg-transparent hover:bg-primary-pink/[0.02] dark:hover:bg-white/[0.02] transition-all duration-400"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/35 group-hover:bg-primary-pink group-hover:border-primary-pink group-hover:text-white group-hover:rotate-90 transition-all duration-400 shadow-sm">
                <Plus size={22} />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold text-gray-700 dark:text-white/60 group-hover:text-primary-pink transition-colors duration-300">
                  Add New Section
                </p>
                <p className="text-[12px] text-gray-400 dark:text-white/25 group-hover:text-gray-500 dark:group-hover:text-white/40 transition-colors duration-300">
                  Organize your course with modules
                </p>
              </div>
            </button>
          )}
        </div>
      </ContentCard>
    </div>
  );
};

export default CurriculumTab;
