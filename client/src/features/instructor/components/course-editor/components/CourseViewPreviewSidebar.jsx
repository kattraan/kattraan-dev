import React, { forwardRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  PlayCircle,
  FileText,
  CheckCircle2,
  Award,
  Lock,
  Download,
} from "lucide-react";
import { formatDuration, formatDurationHuman } from "@/utils/videoUtils";

/** Seconds for a chapter: progress override, else sum of all video content durations. */
function getChapterDuration(chapter, progressByChapter = {}) {
  const id = chapter._id || chapter.id;
  const key = id != null ? String(id) : "";
  const fromProgress =
    key && progressByChapter[key]?.duration != null
      ? progressByChapter[key].duration
      : null;
  if (fromProgress != null && fromProgress > 0) return fromProgress;
  const videos =
    chapter.contents?.filter((c) => c.type === "video") ?? [];
  let sum = 0;
  for (const v of videos) {
    const d = v.duration;
    if (typeof d === "number" && d > 0) sum += d;
  }
  return sum > 0 ? sum : null;
}

function getSectionTotalSeconds(section, progressByChapter) {
  const chapters = section.chapters ?? [];
  let total = 0;
  for (const ch of chapters) {
    const d = getChapterDuration(ch, progressByChapter);
    if (typeof d === "number" && d > 0) total += d;
  }
  return total;
}

function getOrderedChapterIds(sections = []) {
  const ids = [];
  sections.forEach((section) => {
    (section?.chapters || []).forEach((chapter) => {
      const id = chapter?._id || chapter?.id;
      if (id != null) ids.push(String(id));
    });
  });
  return ids;
}

const CourseViewPreviewSidebar = forwardRef(function CourseViewPreviewSidebar(
  {
    courseData,
    expandedSections,
    toggleSection,
    activeChapter,
    setActiveChapter,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    progressByChapter = {},
    overallPercentage = 0,
    quizChapterSummaries = {},
    enableCertificatePanel = false,
    certificateUnlocked = false,
    learnerDisplayName = "",
    onCertificateDownload,
  },
  ref,
) {
  const orderedChapterIds = getOrderedChapterIds(courseData?.sections || []);

  return (
    <aside
      className={`${isSidebarCollapsed ? "w-0" : "w-[420px]"} bg-white dark:bg-[#161616] border-l border-gray-200 dark:border-white/10 flex flex-col h-full sticky top-0 transition-all duration-500 relative overflow-hidden`}
      aria-label="Course content"
    >
      <button
        type="button"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
        className={`absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-12 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-white/10 rounded-l-xl flex items-center justify-center text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all z-[100] shadow-2xl ${isSidebarCollapsed ? "rotate-180 -left-8" : ""}`}
        style={{ borderRight: "none" }}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronRight size={18} />
      </button>

      <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between min-w-[420px] bg-white dark:bg-[#141414]">
        <h3 className="text-[22px] font-black tracking-tight text-gray-900 dark:text-white">
          Content
        </h3>
        <span className="inline-flex items-center rounded-md px-2 py-1 bg-gradient-to-r from-[#FF8C42]/12 to-[#FF3FB4]/12 ring-1 ring-inset ring-[#FF8C42]/25 dark:ring-[#FF3FB4]/30">
          <span className="text-[10px] font-black bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent">
            {Math.round(overallPercentage)}% COMPLETE
          </span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide min-w-[420px] bg-white dark:bg-[#161616]">
        {courseData?.sections?.map((section, sIdx) => {
          const sectionId = section._id || section.id;
          const isExpanded = expandedSections[sectionId];
          const lessonCount = section.chapters?.length || 0;
          const sectionTotalSec = getSectionTotalSeconds(
            section,
            progressByChapter,
          );
          const sectionDurationLabel =
            sectionTotalSec > 0
              ? formatDurationHuman(sectionTotalSec)
              : null;
          const lessonLabel = lessonCount === 1 ? "Lesson" : "Lessons";

          return (
            <div
              key={sectionId}
              className="border-b border-gray-200/80 dark:border-white/[0.06]"
            >
              <button
                type="button"
                onClick={() => toggleSection(sectionId)}
                className={`w-full flex items-start justify-between gap-4 p-5 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all relative ${isExpanded ? "bg-gray-100/80 dark:bg-white/[0.04]" : ""}`}
                aria-expanded={isExpanded}
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 relative z-10 text-left">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className={`min-w-0 text-[16px] font-bold leading-[1.2] tracking-tight break-words ${isExpanded ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-white/90"}`}>
                      {section.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-white/30 font-bold uppercase tracking-[0.15em]">
                    {lessonCount} {lessonLabel}
                    {sectionDurationLabel
                      ? ` • ${sectionDurationLabel}`
                      : ""}
                  </span>
                </div>
                <div
                  className={`mt-1 shrink-0 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
                >
                  <ChevronDown
                    size={16}
                    stroke={isExpanded ? "url(#coursePreviewBrandGrad)" : undefined}
                    className={
                      isExpanded
                        ? ""
                        : "text-gray-400 dark:text-white/20"
                    }
                    aria-hidden
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="bg-gray-50/70 dark:bg-[#1a1a1a] border-t border-gray-200/80 dark:border-white/[0.06] animate-in slide-in-from-top-2 duration-300">
                  <div className="ml-6 my-2 border-l border-gray-200 dark:border-white/10">
                  {section.chapters?.map((chapter, cIdx) => {
                    const chId = chapter._id || chapter.id;
                    const chKey = chId != null ? String(chId) : "";
                    const orderIdx = orderedChapterIds.indexOf(chKey);
                    const prevChKey =
                      orderIdx > 0 ? orderedChapterIds[orderIdx - 1] : null;
                    const isActive =
                      activeChapter?._id === chId || activeChapter?.id === chId;
                    const isCompleted = progressByChapter[chKey]?.completed;
                    const isLocked =
                      !isCompleted &&
                      !isActive &&
                      prevChKey != null &&
                      !progressByChapter[prevChKey]?.completed;
                    const durationSec = getChapterDuration(
                      chapter,
                      progressByChapter,
                    );
                    const hasVideo = chapter.contents?.some(
                      (c) => c.type === "video",
                    );
                    const hasQuizOnlyDuration =
                      !hasVideo &&
                      chapter.contents?.some((c) => c.type === "quiz");
                    const durationStr =
                      durationSec != null
                        ? formatDuration(durationSec)
                        : hasQuizOnlyDuration
                          ? "Quiz"
                          : "—";
                    const titleTrimmed = chapter.title?.trim();
                    const displayTitle = titleTrimmed
                      ? titleTrimmed
                      : hasVideo
                        ? `Lesson ${cIdx + 1}`
                        : `Item ${cIdx + 1}`;
                    const quizSummary = chKey ? quizChapterSummaries[chKey] : null;
                    return (
                      <button
                        key={chId}
                        ref={isActive ? ref : undefined}
                        type="button"
                        onClick={() => {
                          if (isLocked) return;
                          setActiveChapter(chapter);
                        }}
                        className={`w-full flex items-start gap-3 py-3.5 pl-4 pr-4 transition-all text-left group relative ${isLocked ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-200/50 dark:hover:bg-white/[0.06]"} ${isActive ? "bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 dark:from-[#FF8C42]/[0.08] dark:to-[#FF3FB4]/[0.12]" : ""}`}
                        aria-disabled={isLocked}
                      >
                        {isActive && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-[#FF8C42] to-[#FF3FB4] shadow-[0_0_12px_rgba(255,63,180,0.45)]"
                            aria-hidden
                          />
                        )}
                        <div
                          className={`mt-1 shrink-0 ${isActive ? "" : isCompleted ? "text-green-600 dark:text-green-500" : "text-gray-400 dark:text-white/20 group-hover:text-gray-600 dark:group-hover:text-white/40"} transition-colors`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={16} aria-hidden />
                          ) : chapter.type === "quiz" ? (
                            <FileText
                              size={16}
                              stroke={isActive ? "url(#coursePreviewBrandGrad)" : undefined}
                              aria-hidden
                            />
                          ) : (
                            <PlayCircle
                              size={16}
                              stroke={isActive ? "url(#coursePreviewBrandGrad)" : undefined}
                              aria-hidden
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                          <span
                            className={`text-[13px] font-bold leading-tight ${isActive ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/90"} transition-all`}
                          >
                            {cIdx + 1}. {displayTitle}
                          </span>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-gray-400 dark:text-white/40 grayscale">
                                {chapter.type === "quiz" ? (
                                  <FileText size={10} aria-hidden />
                                ) : (
                                  <PlayCircle size={10} aria-hidden />
                                )}
                                <span className="text-[10px] font-bold text-gray-500 dark:text-white/40">
                                  {durationStr}
                                </span>
                              </div>
                              {chapter.isFree && (
                                <span className="text-[9px] font-black text-green-600 dark:text-green-500/80 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Preview
                                </span>
                              )}
                            </div>
                            <div
                              className={`flex flex-col gap-0.5 shrink-0 ${
                                isLocked
                                  ? "min-w-8 items-center text-center"
                                  : "items-end text-right"
                              }`}
                            >
                              {isLocked && (
                                <span
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300/80 dark:border-white/20 bg-white dark:bg-white/[0.06] text-gray-600 dark:text-white/70 shadow-sm"
                                  title="Locked"
                                  aria-label="Locked chapter"
                                >
                                  <Lock size={12} strokeWidth={2.25} aria-hidden />
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black animate-pulse bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent">
                                  <PlayCircle size={10} className="text-[#FF8C42]" aria-hidden />
                                  {hasQuizOnlyDuration ? "Current quiz" : "PLAYING"}
                                </span>
                              )}
                              {isActive &&
                                hasQuizOnlyDuration &&
                                quizSummary?.scorePercent != null && (
                                  <span className="text-[10px] font-bold tabular-nums text-gray-500 dark:text-white/45">
                                    {quizSummary.scorePercent}%
                                  </span>
                                )}
                              {!isActive &&
                                hasQuizOnlyDuration &&
                                quizSummary?.attempted && (
                                  <span
                                    className={`text-[10px] font-bold tabular-nums ${
                                      quizSummary.passed
                                        ? "text-green-600 dark:text-green-500"
                                        : "text-amber-700 dark:text-amber-400/90"
                                    }`}
                                  >
                                    {quizSummary.scorePercent != null
                                      ? `${quizSummary.scorePercent}%`
                                      : "Submitted"}
                                  </span>
                                )}
                              {!isActive &&
                                !hasQuizOnlyDuration &&
                                isCompleted && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-500">
                                    <CheckCircle2 size={10} aria-hidden />
                                    DONE
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {enableCertificatePanel && (
        <div className="p-5 border-t border-gray-200 dark:border-white/10 bg-gray-50/90 dark:bg-[#141414] min-w-[420px] shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Award
              size={18}
              className={
                certificateUnlocked
                  ? "text-[#FF8C42]"
                  : "text-gray-400 dark:text-white/35"
              }
              aria-hidden
            />
            <h4 className="text-[13px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Certificate
            </h4>
          </div>
          {certificateUnlocked ? (
            <div className="rounded-2xl border border-[#FF8C42]/35 dark:border-[#FF3FB4]/35 bg-white dark:bg-white/[0.04] p-4 shadow-sm dark:shadow-none">
              <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed mb-4">
                You&apos;ve completed this course. Download your certificate of
                completion for{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {courseData?.title || "this course"}
                </span>
                {learnerDisplayName ? (
                  <>
                    {" "}
                    — issued to{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {learnerDisplayName}
                    </span>
                  </>
                ) : null}
                .
              </p>
              <button
                type="button"
                onClick={() => onCertificateDownload?.()}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white hover:opacity-95 transition-opacity shadow-md shadow-[#FF3FB4]/20"
              >
                <Download size={16} aria-hidden />
                Download certificate
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 bg-white/60 dark:bg-white/[0.02] p-4 flex gap-3 items-start opacity-95">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-200/80 dark:bg-white/10 flex items-center justify-center">
                <Lock
                  size={18}
                  className="text-gray-500 dark:text-white/40"
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white/85 mb-1">
                  Locked until you finish
                </p>
                <p className="text-[11px] text-gray-500 dark:text-white/45 leading-relaxed">
                  Complete every lesson in this course (including quizzes) to
                  unlock your certificate. Progress must reach 100%.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
});

export default CourseViewPreviewSidebar;
