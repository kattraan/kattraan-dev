import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import courseService from "@/features/courses/services/courseService";
import { useToast } from "@/components/ui/Toast";
import { countCourseChapterCompletion } from "@/features/courses/utils/courseChapterCompletion";
import { openCourseCertificatePrint } from "@/features/courses/utils/openCourseCertificatePrint";
import CourseViewPreviewHeader from "@/features/instructor/components/course-editor/components/CourseViewPreviewHeader";
import LMSVideoPlayer from "@/components/video/LMSVideoPlayer";
import CourseWatchQuizPanel from "@/features/courses/components/watch/CourseWatchQuizPanel";
import CourseViewPreviewContentTabs from "@/features/instructor/components/course-editor/components/CourseViewPreviewContentTabs";
import CourseViewPreviewSidebar from "@/features/instructor/components/course-editor/components/CourseViewPreviewSidebar";
import { ROUTES } from "@/config/routes";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { getCourseProgress } from "@/features/learner/services/courseProgressService";
import { getAssignmentRowByContentId } from "@/features/learner/services/learnerAssignmentsService";

const SIDEBAR_BREAKPOINT = 768;
const NEXT_LESSON_COUNTDOWN_SEC = 5;

function useSidebarCollapsedDefault() {
  const [defaultCollapsed, setDefaultCollapsed] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${SIDEBAR_BREAKPOINT}px)`).matches
      : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_BREAKPOINT}px)`);
    const handler = () => setDefaultCollapsed(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return defaultCollapsed;
}

/** Flatten sections into [chapter] in order. */
function getChapterList(courseData) {
  if (!courseData?.sections) return [];
  const list = [];
  courseData.sections.forEach((sec) => {
    (sec.chapters || []).forEach((ch) => list.push(ch));
  });
  return list;
}

function getPrevChapter(courseData, currentChapter) {
  const list = getChapterList(courseData);
  if (!currentChapter || list.length === 0) return null;
  const id = currentChapter._id || currentChapter.id;
  const idx = list.findIndex((ch) => (ch._id || ch.id) === id);
  if (idx <= 0) return null;
  return list[idx - 1];
}

function getNextChapter(courseData, currentChapter) {
  const list = getChapterList(courseData);
  if (!currentChapter || list.length === 0) return null;
  const id = currentChapter._id || currentChapter.id;
  const idx = list.findIndex((ch) => (ch._id || ch.id) === id);
  if (idx < 0 || idx >= list.length - 1) return null;
  return list[idx + 1];
}

export default function CourseWatchPage() {
  const toast = useToast();
  const authUser = useSelector((state) => state.auth?.user);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterIdFromUrl = searchParams.get("chapter");
  const returnToUrl = searchParams.get("returnTo"); // when coming from admin review, back goes to new course details UI
  const courseDetailsUrl = `${ROUTES.COURSE_DETAILS}/${courseId}`;

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Filled with parallel GET course progress (same tick as overview) so useVideoProgress does not duplicate the request. */
  const [progressSnapshot, setProgressSnapshot] = useState(null);
  // activeChapter holds the slim chapter from the overview (for sidebar).
  // activeChapterContent holds the lazily-loaded full chapter (for the player).
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeChapterContent, setActiveChapterContent] = useState(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const [expandedSections, setExpandedSections] = useState({});
  const [playback, setPlayback] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });
  const [nextOverlay, setNextOverlay] = useState(null);
  const defaultCollapsed = useSidebarCollapsedDefault();
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(defaultCollapsed);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [playerSize, setPlayerSize] = useState("normal"); // 'reduced' | 'normal' | 'extended'
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const activeChapterNodeRef = useRef(null);
  /** @type {[Record<string, { scorePercent: number|null, passed: boolean, attempted: boolean }>, Function]} */
  const [quizChapterSummaries, setQuizChapterSummaries] = useState({});

  const prevChapter = getPrevChapter(courseData, activeChapter);
  const nextChapter = getNextChapter(courseData, activeChapter);

  const chapterPayload = activeChapterContent || activeChapter;
  const quizContentForPanel =
    chapterPayload?.contents?.find((c) => c.type === "quiz") ?? null;
  const hasPlayableVideoInChapter = Boolean(
    chapterPayload?.contents?.some(
      (c) => c.type === "video" && (c._id || c.id || c.videoUrl),
    ),
  );
  const showQuizPanel = Boolean(
    quizContentForPanel && !hasPlayableVideoInChapter,
  );
  const showContentTabsBelowPlayer = !showQuizPanel;

  const handleTheaterModeToggle = useCallback(() => {
    setIsTheaterMode((prev) => {
      if (prev) {
        setIsSidebarCollapsed(false);
        setPlayerSize("normal");
      } else {
        setIsSidebarCollapsed(true);
        setPlayerSize("extended");
      }
      return !prev;
    });
  }, []);

  const handleExtendPlayer = useCallback((e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setPlayerSize((s) => {
      if (s === "reduced") return "normal";
      if (s === "normal") {
        setIsSidebarCollapsed(true);
        setIsTheaterMode(true);
        return "extended";
      }
      return s;
    });
  }, []);

  const handleReducePlayer = useCallback(
    (e) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();
      setPlayerSize((s) =>
        s === "extended" ? "normal" : s === "normal" ? "reduced" : s,
      );
      // Reduce is only shown when extended, so always reset theater/sidebar when clicked
      setIsSidebarCollapsed(defaultCollapsed);
      setIsTheaterMode(false);
    },
    [defaultCollapsed],
  );

  const chapterId = activeChapter?._id || activeChapter?.id;
  const { initialTime, isCompleted, progressByChapter, saveProgress } =
    useVideoProgress(courseId, chapterId, playback, playback.isPlaying, {
      courseProgressSnapshot: progressSnapshot,
      waitForSnapshot: true,
    });

  const chapterCompletion = useMemo(
    () =>
      countCourseChapterCompletion(
        courseData,
        progressByChapter,
        quizChapterSummaries,
      ),
    [courseData, progressByChapter, quizChapterSummaries],
  );
  const totalChapters = chapterCompletion.total;
  const overallPercentage = chapterCompletion.percentage;
  const isCourseComplete = chapterCompletion.isComplete;

  const learnerDisplayName = useMemo(() => {
    if (!authUser) return "Learner";
    if (authUser.firstName) {
      return `${authUser.firstName} ${authUser.lastName || ""}`.trim();
    }
    return (
      authUser.name ||
      authUser.userName ||
      authUser.username ||
      authUser.full_name ||
      "Learner"
    );
  }, [authUser]);

  const authRoleName = useMemo(
    () =>
      String(
        authUser?.role?.name ||
          authUser?.roleName ||
          authUser?.role ||
          "learner",
      ).toLowerCase(),
    [authUser],
  );
  // learner-only endpoints (/learner/course-progress, learner assignment row) should not run in instructor/admin preview.
  const shouldUseLearnerProgressApis = authRoleName === "learner";

  const handleCertificateDownload = useCallback(() => {
    if (!isCourseComplete) return;
    const ok = openCourseCertificatePrint({
      courseTitle: courseData?.title || "Course",
      learnerName: learnerDisplayName,
      issuedDate: new Date(),
    });
    if (!ok) {
      toast.error(
        "Popup blocked",
        "Allow pop-ups for this site to open your certificate, then try again.",
      );
    }
  }, [
    isCourseComplete,
    courseData?.title,
    learnerDisplayName,
    toast,
  ]);

  useEffect(() => {
    if (!isTheaterMode) setIsSidebarCollapsed(defaultCollapsed);
  }, [defaultCollapsed, isTheaterMode]);

  useEffect(() => {
    activeChapterNodeRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeChapter]);

  useEffect(() => {
    if (!shouldUseLearnerProgressApis) {
      setQuizChapterSummaries({});
      return undefined;
    }
    if (!courseData?.sections || !courseId) return undefined;
    let cancelled = false;
    setQuizChapterSummaries({});

    const tasks = [];
    for (const sec of courseData.sections || []) {
      for (const ch of sec.chapters || []) {
        const quizContent = ch.contents?.find((c) => c.type === "quiz");
        const hasPlayableVideo = ch.contents?.some(
          (c) => c.type === "video" && (c._id || c.id || c.videoUrl),
        );
        if (!quizContent || hasPlayableVideo) continue;
        const chKey = String(ch._id || ch.id);
        const qid = quizContent._id || quizContent.id;
        if (!qid) continue;
        tasks.push(
          getAssignmentRowByContentId(qid).then((row) => {
            if (cancelled) return null;
            const sub = row?.submission;
            const attempted = !!(
              sub?.latestEvaluation ||
              (sub?.attemptCount != null && sub.attemptCount > 0)
            );
            if (!attempted) return null;
            const fromGrade =
              sub?.grade != null && Number.isFinite(Number(sub.grade))
                ? Math.round(Number(sub.grade))
                : null;
            const fromEval =
              sub?.latestEvaluation?.percentage != null &&
              Number.isFinite(Number(sub.latestEvaluation.percentage))
                ? Math.round(Number(sub.latestEvaluation.percentage))
                : null;
            return {
              chKey,
              scorePercent: fromGrade ?? fromEval,
              passed: !!(sub?.passed || sub?.latestEvaluation?.passed),
              attempted: true,
            };
          }),
        );
      }
    }

    Promise.all(tasks).then((results) => {
      if (cancelled) return;
      const next = {};
      results.forEach((r) => {
        if (r) next[r.chKey] = r;
      });
      setQuizChapterSummaries(next);
    });

    return () => {
      cancelled = true;
    };
  }, [courseData, courseId, shouldUseLearnerProgressApis]);

  const handleQuizSubmittedForSidebar = useCallback(
    ({ chapterId, grade, passed }) => {
      if (chapterId == null) return;
      const key = String(chapterId);
      setQuizChapterSummaries((prev) => ({
        ...prev,
        [key]: {
          scorePercent:
            grade != null && Number.isFinite(Number(grade))
              ? Math.round(Number(grade))
              : null,
          passed: !!passed,
          attempted: true,
        },
      }));
    },
    [],
  );

  // Load overview + progress in parallel (cuts perceived time to interactive).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      setProgressSnapshot(null);
      try {
        const requests = shouldUseLearnerProgressApis
          ? [
              courseService.getCourseOverview(courseId),
              getCourseProgress(courseId),
            ]
          : [courseService.getCourseOverview(courseId)];
        const settled = await Promise.allSettled(requests);
        const overviewResult = settled[0];
        const progressResult = shouldUseLearnerProgressApis
          ? settled[1]
          : { status: "fulfilled", value: { chapterProgress: [], overallPercentage: 0 } };

        const prog =
          progressResult.status === "fulfilled"
            ? progressResult.value
            : { chapterProgress: [], overallPercentage: 0 };
        if (!cancelled) {
          setProgressSnapshot({ ...prog, forCourseId: courseId });
        }

        if (overviewResult.status !== "fulfilled") {
          const err = overviewResult.reason;
          if (!cancelled) {
            setError(
              err?.response?.data?.message ||
                err?.message ||
                "Failed to load course.",
            );
          }
          return;
        }

        const res = overviewResult.value;
        const data = res?.data ?? res;
        if (!cancelled && data) {
          setCourseData(data);
          const sections = data.sections || [];
          if (sections.length > 0) {
            const firstSec = sections[0];
            setExpandedSections({ [firstSec._id || firstSec.id]: true });
            let initialChapter = firstSec.chapters?.[0];
            const urlCh = chapterIdFromUrl ? String(chapterIdFromUrl) : "";
            if (urlCh && sections.length > 0) {
              for (const sec of sections) {
                const ch = (sec.chapters || []).find(
                  (c) => String(c._id || c.id) === urlCh,
                );
                if (ch) {
                  initialChapter = ch;
                  setExpandedSections((prev) => ({
                    ...prev,
                    [sec._id || sec.id]: true,
                  }));
                  break;
                }
              }
            }
            setActiveChapter(initialChapter);
          }
        } else if (!cancelled) setError("Course not found");
      } catch (err) {
        if (!cancelled)
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load course.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, chapterIdFromUrl, shouldUseLearnerProgressApis]);

  // Lazy-load full chapter content (with signed video URL) when active chapter changes
  useEffect(() => {
    let cancelled = false;
    const id = activeChapter?._id || activeChapter?.id;
    if (!id) {
      setActiveChapterContent(null);
      return;
    }
    setChapterLoading(true);
    (async () => {
      try {
        const res = await courseService.getChapterContent(id);
        const data = res?.data ?? res;
        if (!cancelled) setActiveChapterContent(data);
      } catch {
        if (!cancelled) setActiveChapterContent(activeChapter);
      } finally {
        if (!cancelled) setChapterLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChapter]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const handleBack = useCallback(() => {
    if (returnToUrl) {
      try {
        const path = decodeURIComponent(returnToUrl);
        navigate(path.startsWith("/") ? path : `/${path}`);
      } catch {
        navigate(courseDetailsUrl);
      }
    } else {
      // Default back behavior should return to the course details page.
      navigate(courseDetailsUrl);
    }
  }, [navigate, returnToUrl, courseDetailsUrl]);

  const handleChapterSelect = useCallback(
    (chapter) => {
      setActiveChapter(chapter);
      setNextOverlay(null);
      const id = chapter?._id || chapter?.id;
      if (id) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("chapter", id);
            return next;
          },
          { replace: true },
        );
      }
    },
    [setSearchParams],
  );

  const handleVideoEnded = useCallback(() => {
    if (chapterId && playback.duration > 0) {
      saveProgress({
        chapterId,
        currentTime: playback.duration,
        duration: playback.duration,
        watchedPercentage: 100,
      });
    }
    const next = getNextChapter(courseData, activeChapter);
    if (next) {
      setNextOverlay({
        nextChapter: next,
        countdown: NEXT_LESSON_COUNTDOWN_SEC,
      });
    } else {
      setNextOverlay({ completed: true });
    }
  }, [courseData, activeChapter, chapterId, playback.duration, saveProgress]);

  useEffect(() => {
    if (!nextOverlay?.nextChapter || nextOverlay.completed) return;
    const t = setInterval(() => {
      setNextOverlay((prev) => {
        if (!prev || prev.completed) return prev;
        const n = prev.countdown - 1;
        return n < 0 ? prev : { ...prev, countdown: n };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [nextOverlay?.nextChapter, nextOverlay?.completed]);

  useEffect(() => {
    if (nextOverlay?.countdown === 0 && nextOverlay?.nextChapter) {
      handleChapterSelect(nextOverlay.nextChapter);
      setNextOverlay(null);
    }
  }, [nextOverlay, handleChapterSelect]);

  // Dismiss "Up Next" / completion when user picks another lesson (sidebar, arrows, URL).
  useEffect(() => {
    setNextOverlay(null);
  }, [chapterId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current?.contains(event.target) ||
        event.target.closest("[data-profile-dropdown]")
      )
        return;
      setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center">
        <div className="text-gray-500 dark:text-white/50">Loading course…</div>
      </div>
    );
  }

  if (error || !courseData) {
    const isLocked =
      typeof error === "string" &&
      (/not enrolled|access denied|locked/i.test(error) || false);
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 dark:text-red-400">
          {error || "Course not found"}
        </p>
        {isLocked && (
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.CHECKOUT}/${courseId}`)}
            className="w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Enroll & Pay
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            returnToUrl
              ? navigate(decodeURIComponent(returnToUrl))
              : navigate(courseDetailsUrl)
          }
          className="text-primary-pink hover:underline"
        >
          Back to course
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-white flex flex-col font-satoshi overflow-hidden transition-colors duration-300">
      <CourseViewPreviewHeader
        courseTitle={courseData.title}
        onClose={handleBack}
        profileRef={profileRef}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
      />
      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 min-h-0 flex flex-col scrollbar-hide min-w-0 transition-all duration-300 bg-white dark:bg-[#0d0d0d] ${
            showQuizPanel
              ? "overflow-hidden"
              : `overflow-y-auto ${playerSize === "reduced" ? "flex items-center" : ""}`
          }`}
        >
          <div
            className={`w-full min-w-0 relative z-20 flex flex-col min-h-0 ${
              showQuizPanel ? "flex-1" : "flex-shrink-0 items-stretch"
            } ${!showQuizPanel && playerSize === "reduced" ? "max-w-4xl mx-auto" : ""}`}
          >
            {/* Top right: video size (hidden for quiz-only chapters) */}
            {!showQuizPanel && (
            <div className="absolute top-2 right-2 z-[25] pointer-events-none">
              <div className="pointer-events-auto">
                {playerSize === "extended" ? (
                  <button
                    type="button"
                    onClick={handleReducePlayer}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    aria-label="Reduce video size"
                    title="Reduce"
                  >
                    <Minimize2 size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExtendPlayer}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                    aria-label="Extend video size"
                    title="Extend"
                  >
                    <Maximize2 size={20} />
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Chapter prev/next hidden during quiz/assignment (use sidebar) — avoids overlap with results UI */}
            {!showQuizPanel && (
              <>
            <div className="absolute left-0 top-0 bottom-0 z-[25] pointer-events-none flex items-center pl-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevChapter && handleChapterSelect(prevChapter);
                }}
                disabled={!prevChapter}
                className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-colors"
                aria-label="Previous lesson"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="absolute right-0 top-0 bottom-0 z-[25] pointer-events-none flex items-center pr-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextChapter && handleChapterSelect(nextChapter);
                }}
                disabled={!nextChapter}
                className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-colors"
                aria-label="Next lesson"
              >
                <ChevronRight size={24} />
              </button>
            </div>
              </>
            )}

            <div
              className={`w-full min-w-0 relative ${
                showQuizPanel ? "flex flex-1 min-h-0 flex-col" : ""
              }`}
            >
              {showQuizPanel ? (
                <CourseWatchQuizPanel
                  contentId={
                    quizContentForPanel?._id || quizContentForPanel?.id
                  }
                  chapterTitle={chapterPayload?.title}
                  quizContent={quizContentForPanel}
                  isLoading={chapterLoading}
                  watchChapterId={activeChapter?._id || activeChapter?.id}
                  onQuizSubmitted={handleQuizSubmittedForSidebar}
                />
              ) : (
              <LMSVideoPlayer
                activeChapter={chapterPayload}
                posterUrl={courseData.image || courseData.thumbnail}
                autoPlay={false}
                initialTime={initialTime}
                isCompleted={isCompleted}
                onPlaybackStateChange={setPlayback}
                onEnded={handleVideoEnded}
                onTheaterModeToggle={handleTheaterModeToggle}
                isTheaterMode={isTheaterMode}
                className={playerSize === "extended" ? "" : "max-h-[72vh]"}
              />
              )}
              {nextOverlay?.nextChapter && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-30 p-6">
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
                    {/* Label */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                        Up Next
                      </span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Thumbnail + title */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-10 rounded-lg bg-white/10 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {nextOverlay.nextChapter.contents?.find(
                          (c) => c.type === "video",
                        )?.thumbnail ? (
                          <img
                            src={
                              nextOverlay.nextChapter.contents.find(
                                (c) => c.type === "video",
                              ).thumbnail
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ChevronRight size={18} className="text-white/30" />
                        )}
                      </div>
                      <p className="text-white font-bold text-sm leading-snug line-clamp-2">
                        {nextOverlay.nextChapter.title}
                      </p>
                    </div>

                    {/* Countdown ring + actions */}
                    <div className="flex items-center justify-between gap-3 mt-1">
                      {/* SVG countdown ring */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg
                          className="w-12 h-12 -rotate-90"
                          viewBox="0 0 44 44"
                        >
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="#FF3FB4"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 18}`}
                            strokeDashoffset={`${2 * Math.PI * 18 * (1 - nextOverlay.countdown / NEXT_LESSON_COUNTDOWN_SEC)}`}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm tabular-nums">
                          {nextOverlay.countdown}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setNextOverlay(null)}
                          className="px-3 py-1.5 rounded-lg text-white/60 hover:text-white text-xs font-semibold hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleChapterSelect(nextOverlay.nextChapter);
                            setNextOverlay(null);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-primary-pink text-white text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-pink-500/30"
                        >
                          Play now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {nextOverlay?.completed && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 gap-5 p-6">
                  <div className="w-16 h-16 rounded-full bg-primary-pink/20 border border-primary-pink/30 flex items-center justify-center mb-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-8 h-8 text-primary-pink"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xl text-white font-black tracking-tight">
                      Course Completed!
                    </p>
                    <p className="text-white/50 text-sm mt-1">
                      You've finished all lessons
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-sm">
                    {isCourseComplete && (
                      <button
                        type="button"
                        onClick={handleCertificateDownload}
                        className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/25 text-white font-bold text-sm hover:bg-white/15 transition-all"
                      >
                        Download certificate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2.5 rounded-xl bg-primary-pink text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-pink-500/30 transition-all"
                    >
                      Back to course
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {showContentTabsBelowPlayer && (
          <div
            className={
              playerSize === "reduced" ? "max-w-4xl mx-auto w-full" : ""
            }
          >
            <CourseViewPreviewContentTabs
              activeChapter={activeChapterContent || activeChapter}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              courseId={courseId}
            />
          </div>
          )}
        </main>
        <CourseViewPreviewSidebar
          ref={activeChapterNodeRef}
          courseData={courseData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          activeChapter={activeChapter}
          setActiveChapter={handleChapterSelect}
          isSidebarCollapsed={isTheaterMode ? true : isSidebarCollapsed}
          setIsSidebarCollapsed={
            isTheaterMode ? () => {} : setIsSidebarCollapsed
          }
          progressByChapter={progressByChapter}
          overallPercentage={overallPercentage}
          quizChapterSummaries={quizChapterSummaries}
          enableCertificatePanel
          certificateUnlocked={isCourseComplete}
          learnerDisplayName={learnerDisplayName}
          onCertificateDownload={handleCertificateDownload}
        />
      </div>
    </div>
  );
}
