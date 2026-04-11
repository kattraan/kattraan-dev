
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, CheckCircle, PlayCircle, Plus, Minus, ChevronDown, MessageSquare, Users, Eye, Lock } from 'lucide-react'
import { useSelector } from 'react-redux'
import heroBackground from '@/assets/hero-background.png'
import { ROUTES } from '@/config/routes'
import { checkEnrollment } from '@/features/learner/services/learnerCoursesService'
import {
    isCourseDescriptionHtml,
    sanitizeCourseDescriptionHtml,
    courseDescriptionPlainLength,
} from '@/utils/courseDescriptionHtml'
import CourseDetailsReviewsSection from '@/features/courses/components/details/CourseDetailsReviewsSection'

function getInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

const CourseDetails = ({ courseData, returnToUrl }) => {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const descRaw = courseData.description || ''
    const descIsHtml = isCourseDescriptionHtml(descRaw)
    const descriptionHtml = descIsHtml ? sanitizeCourseDescriptionHtml(descRaw) : ''
    const descriptionLines = descIsHtml
        ? []
        : descRaw
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
    const hasCourseDescription = descIsHtml
        ? courseDescriptionPlainLength(descRaw) > 0
        : descriptionLines.length > 0

    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
    const courseId = courseData?._id;
    const isPaidCourse = Number(courseData?.price) > 0;
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const [reviewStats, setReviewStats] = useState(null);

    const displayRating = reviewStats
        ? (reviewStats.totalCount > 0 ? reviewStats.averageRating : 0)
        : Number(courseData.rating) || 0;
    const displayCount = reviewStats != null ? reviewStats.totalCount : (Number(courseData.ratingCount) || 0);
    const titleStars = Math.min(5, Math.max(0, Math.round(Number(displayRating) || 0)));
    const breakdownRows =
        reviewStats?.breakdown?.length
            ? reviewStats.breakdown
            : [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percent: 0 }));

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            // Free courses are always unlocked.
            if (!isPaidCourse) {
                setIsEnrolled(true);
                return;
            }

            if (!courseId) {
                setIsEnrolled(false);
                return;
            }

            // Locked until a paid enrollment exists.
            if (!isAuthenticated) {
                setIsEnrolled(false);
                return;
            }

            setEnrollmentLoading(true);
            try {
                const res = await checkEnrollment(courseId);
                if (!cancelled) setIsEnrolled(!!res?.enrolled);
            } catch {
                if (!cancelled) setIsEnrolled(false);
            } finally {
                if (!cancelled) setEnrollmentLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [courseId, isAuthenticated, isPaidCourse]);


    return (
        <div className="lg:col-span-8 space-y-10 font-satoshi">

            {/* Title Section */}
            <div className="space-y-6">
                <div className="inline-flex items-center bg-gradient-brand text-white text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-brand-badge">
                    Bestseller
                </div>
                <h1 className="font-satoshi font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-white">
                    {courseData.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-[15px]">{Number(displayRating).toFixed(1)}</span>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < titleStars ? 'fill-[#eab308] text-[#eab308]' : 'text-[#52525b] fill-[#52525b]'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <span className="text-white/60">({Number(displayCount).toLocaleString()} ratings)</span>
                    <div className="flex items-center gap-2 text-white/80">
                        <Users className="w-4 h-4 text-white/40" />
                        <span>{courseData.learners} learners enrolled</span>
                    </div>
                </div>

                <div className="pt-4">
                    <div className="text-[14px] text-white/60">
                        Created by{' '}
                        <span className="cursor-pointer text-gradient-brand transition-opacity hover:opacity-90">
                            {courseData.instructor}
                        </span>
                    </div>
                    {courseData.instructorRole && (
                        <div className="text-white/50 text-[13px] mt-2 font-medium">{courseData.instructorRole}</div>
                    )}
                </div>
            </div>

            {/* What You'll Learn Box - Full width, better text layout */}
            <div className="mt-10 relative group w-full">
                <div className="absolute inset-x-0 -top-20 h-64 bg-brand-glow-soft blur-[100px] opacity-50 pointer-events-none -z-10" />
                <div
                    className="relative overflow-hidden border border-white/10 backdrop-blur-3xl p-8 lg:p-10 w-full min-h-[200px] rounded-2xl surface-glass-brand"
                    style={{ borderWidth: '0.67px' }}
                >
                    <h2 className="text-[22px] lg:text-[24px] mb-6 text-white font-bold">What You'll Learn</h2>

                    <div className="flex flex-col gap-4 w-full max-w-full">
                        {courseData.whatYouWillLearn.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 group/item w-full">
                                <div className="mt-0.5 shrink-0">
                                    <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center group-hover/item:border-white/60 transition-colors bg-white/5">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span className="text-[15px] leading-[1.6] text-white/95 font-light group-hover/item:text-white transition-colors flex-1 min-w-0">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Course Content - Exact Specification Match */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 tracking-tight">Course Content</h2>

                {/* Outer Box Container - Matching user specs */}
                <div
                    className="relative overflow-hidden bg-[#0c0c0c] shadow-3xl border-white/10"
                    style={{
                        maxWidth: '837px',
                        width: '100%',
                        height: '500px',
                        borderWidth: '0.67px',
                        borderRadius: '14px',
                        padding: '27px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    {/* Background Image and Glows */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <img
                            src={heroBackground}
                            alt=""
                            className="w-full h-full object-cover opacity-40 scale-105"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

                        {/* Radial Glows - Reduced blur for sharper look */}
                        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-brand-glow-soft blur-[60px] rounded-full opacity-90" />
                        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-brand-glow-soft-end blur-[80px] rounded-full opacity-90" />
                    </div>

                    {/* Inner Content - Scrollbar Hidden */}
                    <div
                        className="relative z-10 overflow-y-auto scrollbar-hide"
                        style={{
                            maxWidth: '801px',
                            width: '100%',
                            height: '446px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '9px',
                            scrollbarWidth: 'none', /* Firefox */
                            msOverflowStyle: 'none'  /* IE and Edge */
                        }}
                    >
                        {/* Webkit scrollbar hide */}
                        <style>{`
                            .scrollbar-hide::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        {courseData.content.map((section, idx) => {
                            const isExpanded = expandedSection === idx;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setExpandedSection(isExpanded ? -1 : idx)}
                                    className={`group border transition-all duration-500 overflow-hidden cursor-pointer flex-shrink-0 ${isExpanded ? 'bg-white/[0.08] border-white/20' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/15'}`}
                                    style={{
                                        maxWidth: '801px',
                                        width: '100%',
                                        height: isExpanded ? 'auto' : '56px',
                                        borderRadius: '14px',
                                        borderWidth: '0.67px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        opacity: 1,
                                        backdropFilter: 'blur(8px)'
                                    }}
                                >
                                    {/* Header */}
                                    <div className={`flex items-center justify-between px-6 ${isExpanded ? 'py-4' : 'h-full'}`}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-white/95 text-[15px] tracking-wide">{section.title}</span>
                                            <span className="text-[11px] text-[#a1a1aa] font-medium">{section.lectures} lectures</span>
                                        </div>
                                        <div className="text-white/40 group-hover:text-white transition-all duration-300">
                                            {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        </div>
                                    </div>

                                    {/* Expanded Content - chapter titles with watch link (no per-item titles) */}
                                    {isExpanded && (
                                        <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                                            <div className="space-y-4 mt-4">
                                                {(section.chapters && section.chapters.length > 0
                                                    ? section.chapters
                                                    : [...Array(Math.max(0, section.lectures))].map((_, i) => ({ title: `Lesson ${i + 1}`, contents: [] }))
                                                ).map((chapter, lIdx) => {
                                                    const courseId = courseData._id;
                                                    const chapterId = chapter.id || chapter._id;
                                                    const baseWatch = courseId && chapterId ? `${ROUTES.VIEW_COURSE}/${courseId}/watch?chapter=${chapterId}` : null;
                                                    const watchUrl = baseWatch && returnToUrl ? `${baseWatch}&returnTo=${encodeURIComponent(returnToUrl)}` : baseWatch;
                                                    const hasLesson = Array.isArray(chapter.contents) && chapter.contents.length > 0;
                                                    const canOpen = !!watchUrl && hasLesson && (!isPaidCourse || isEnrolled);
                                                    const isLocked = isPaidCourse && !isEnrolled && hasLesson;
                                                    const rowKey = chapterId || lIdx;

                                                    return (
                                                        <div
                                                            key={rowKey}
                                                            className={`group/item flex items-center justify-between gap-3 py-2.5 px-3 -mx-1 rounded-xl transition-colors ${canOpen ? 'cursor-pointer hover:bg-white/5' : ''}`}
                                                            role={canOpen ? 'button' : undefined}
                                                            tabIndex={canOpen ? 0 : undefined}
                                                            onClick={canOpen ? () => navigate(watchUrl) : undefined}
                                                            onKeyDown={canOpen ? (e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    navigate(watchUrl);
                                                                }
                                                            } : undefined}
                                                        >
                                                            <div className="flex items-center gap-4 min-w-0 flex-1 text-[13px] text-white/70 group-hover/item:text-white transition-colors">
                                                                <PlayCircle className="w-4.5 h-4.5 text-white/40 group-hover/item:text-white/60 flex-shrink-0" />
                                                                <span className="font-medium tracking-wide truncate">{chapter.title}</span>
                                                            </div>
                                                            {canOpen && (
                                                                <span
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[color:var(--color-gradient-start)] group-hover/item:text-[color:var(--color-gradient-end)] hover:bg-white/5 transition-colors flex-shrink-0"
                                                                    aria-label="Open lesson"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </span>
                                                            )}
                                                            {isLocked && !enrollmentLoading && (
                                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/45 flex-shrink-0" aria-label="Locked">
                                                                    <Lock className="w-4 h-4" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Requirements */}
            <div className="mt-12 group">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    Requirements
                </h2>
                <div className="relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <ul className="list-disc pl-5 space-y-3 text-[#d4d4d8] text-[15px] font-light marker:text-[color:var(--color-gradient-start)]">
                        <li>A computer (Windows, Mac, or Linux) with internet access</li>
                        <li>No prior programming experience required - we'll start from the basics</li>
                        <li>Willingness to learn and practice coding regularly</li>
                        <li>Basic computer skills (file management, web browsing)</li>
                    </ul>
                </div>
            </div>

            {/* Description */}
            <div className="mt-12 lg:max-w-[837px]">
                <h2 className="text-2xl font-bold mb-6">Description</h2>
                <div className={`relative space-y-4 text-[#d4d4d8] text-[15px] font-light leading-relaxed transition-all duration-500 overflow-hidden ${!showFullDescription ? 'max-h-[200px]' : 'max-h-[2000px]'}`}>
                    {hasCourseDescription ? (
                        descIsHtml ? (
                            <div
                                className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_li]:marker:text-[color:var(--color-gradient-start)] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:text-[color:var(--color-gradient-start)] [&_a]:underline hover:[&_a]:text-[color:var(--color-gradient-end)]"
                                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                            />
                        ) : (
                            <div className="space-y-4">
                                {descriptionLines.map((line, idx) => (
                                    <p key={`desc-line-${idx}`} className="whitespace-pre-wrap">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        )
                    ) : (
                        <p>No description available for this course.</p>
                    )}

                    {!showFullDescription && hasCourseDescription && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
                    )}
                </div>
                {hasCourseDescription && (
                    <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="flex items-center gap-1 text-gradient-brand font-bold hover:opacity-90 transition-all text-sm mt-4 uppercase tracking-widest"
                    >
                        {showFullDescription ? 'Show less' : 'Show more'}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFullDescription ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* Who This Course Is For */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Who This Course Is For</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "Beginners who want to start a career in web development",
                        "Self-taught developers looking to fill knowledge gaps",
                        "Designers wanting to bring their designs to life",
                        "Entrepreneurs building their own applications",
                        "Learners seeking practical development skills",
                        "Anyone interested in modern tech stacks"
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div
                                className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,140,66,0.45),0_0_14px_rgba(255,63,180,0.35)] bg-gradient-brand-diag"
                                aria-hidden
                            />
                            <span className="text-[#d4d4d8] text-sm font-light">{item}</span>
                        </div>
                    ))}
                </div>
            </div>



            {/* Instructor Section - real data from course creator */}
            <div className="mt-12 pt-12 border-t border-white/10">
                <h2 className="text-2xl font-bold mb-6">Instructor</h2>

                <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-gradient-start)] to-[var(--color-primary-purple)] p-0.5">
                                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary-dark">
                                    {courseData.instructorImage ? (
                                        <img
                                            src={courseData.instructorImage}
                                            alt={courseData.instructor}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="select-none text-xl font-bold text-gradient-brand-purple">
                                            {getInitials(courseData.instructor)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 text-lg font-bold text-gradient-brand-purple">{courseData.instructor}</div>
                                {courseData.instructorRole && (
                                    <div className="text-[#d4d4d8] font-light text-sm mb-3">{courseData.instructorRole}</div>
                                )}

                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#a1a1aa] font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5 fill-[color:var(--color-primary-purple)] text-[color:var(--color-primary-purple)]" />
                                        {Number(displayRating).toFixed(1)} Course rating
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {Number(displayCount).toLocaleString()} Reviews
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        {Number(courseData.learners).toLocaleString()} Learners
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {courseData.instructorBio && (
                        <div className="text-[#d4d4d8] text-[15px] font-light leading-relaxed mt-4 whitespace-pre-wrap">
                            {courseData.instructorBio}
                        </div>
                    )}
                </div>
            </div>

            {/* Rating Summary Card - Exact Color Match */}
            <div className="mt-12 flex justify-start">
                <div
                    className="relative overflow-hidden border border-white/5 shadow-2xl flex items-center px-10"
                    style={{
                        width: '642px',
                        height: '194px',
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #2a1b1b 0%, #120c0c 100%)'
                    }}
                >
                    {/* Atmospheric Glows */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {/* Top-center reddish glow */}
                        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-full h-full bg-brand-glow-soft blur-[80px] rounded-full opacity-80" />
                        {/* Subtle ambient light */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 w-full flex items-center">
                        {/* Left Side: Score */}
                        <div className="w-[35%] flex flex-col items-center border-r border-white/10 pr-8">
                            <div className="text-[72px] font-bold text-white leading-none mb-3 tracking-tight">{Number(displayRating).toFixed(1)}</div>
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-[18px] h-[18px] ${i < titleStars ? 'text-[#FFB800] fill-[#FFB800]' : 'text-white/20 fill-white/20'}`} />
                                ))}
                            </div>
                            <div className="text-white/60 text-[14px] font-medium font-satoshi">{Number(displayCount).toLocaleString()} Ratings</div>
                        </div>

                        {/* Right Side: Progress Bars */}
                        <div className="flex-1 pl-10 space-y-[8px]">
                            {breakdownRows.map((row) => (
                                <div key={row.stars} className="flex items-center gap-4 group">
                                    <div className="flex items-center gap-1.5 min-w-[32px]">
                                        <span className="text-white/80 text-[13px] font-medium">{row.stars}</span>
                                        <Star className="w-[14px] h-[14px] text-[#FFB800] fill-[#FFB800]" />
                                    </div>

                                    <div className="flex-1 h-[6px] bg-white/15 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-brand transition-all duration-700 ease-out"
                                            style={{ width: `${row.percent}%` }}
                                        />
                                    </div>

                                    <div className="w-[45px] text-right">
                                        <span className="text-white/80 text-[13px] font-medium">{Number(row.count).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <CourseDetailsReviewsSection
                courseId={courseId}
                canReview={isEnrolled}
                onStatsLoaded={setReviewStats}
            />
        </div>
    )
}

export default CourseDetails