import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, Loader2, Sparkles, Pencil, Trash2, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  fetchCourseReviews,
  fetchMyCourseReview,
  submitCourseReview,
  updateMyCourseReview,
  deleteMyCourseReview,
} from '@/features/courses/services/courseReviewsService';

const SUGGESTED_REVIEW_TAGS = [
  'Clear explanations',
  'Engaging',
  'Good examples',
  'Too fast',
  'Needs more examples',
  'Helpful support',
];

function formatTimeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 14) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** True when updatedAt is meaningfully after createdAt (edited review). */
function reviewWasEdited(createdAt, updatedAt) {
  if (!createdAt || !updatedAt) return false;
  const c = new Date(createdAt).getTime();
  const u = new Date(updatedAt).getTime();
  if (Number.isNaN(c) || Number.isNaN(u)) return false;
  return u > c + 2000;
}

/** Label + timestamp for public list (show last activity). */
function reviewListTimeMeta(r) {
  const createdAt = r.createdAt;
  const updatedAt = r.updatedAt || createdAt;
  if (reviewWasEdited(createdAt, updatedAt)) {
    return { iso: updatedAt, label: 'Edited' };
  }
  return { iso: createdAt, label: 'Posted' };
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function StarRow({ rating, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= rating ? 'text-[#FFB800] fill-[#FFB800]' : 'text-white/15 fill-transparent'}`}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="p-0.5 rounded-md text-[#71717a] hover:text-[#FFB800] disabled:opacity-50 transition-colors"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star className={`w-7 h-7 ${n <= value ? 'text-[#FFB800] fill-[#FFB800]' : ''}`} />
        </button>
      ))}
    </div>
  );
}

function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function useEscapeClose(onClose, enabled) {
  useEffect(() => {
    if (!enabled || !onClose) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onClose]);
}

/**
 * @param {object} props
 * @param {string} props.courseId
 * @param {boolean} props.canReview
 * @param {(stats: object) => void} [props.onStatsLoaded]
 */
export default function CourseDetailsReviewsSection({ courseId, canReview, onStatsLoaded }) {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [myLoading, setMyLoading] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formTags, setFormTags] = useState([]);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [thankYouMode, setThankYouMode] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadList = useCallback(
    async (pageNum) => {
      if (!courseId) return;
      setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchCourseReviews(courseId, { page: pageNum, limit: 8 });
        setPayload(data);
        if (data && typeof onStatsLoaded === 'function') {
          onStatsLoaded({
            averageRating: data.averageRating,
            totalCount: data.totalCount,
            breakdown: data.breakdown || [],
          });
        }
      } catch (e) {
        setLoadError(e.response?.data?.message || e.message || 'Could not load reviews');
        setPayload(null);
      } finally {
        setLoading(false);
      }
    },
    [courseId, onStatsLoaded]
  );

  const loadMine = useCallback(async () => {
    if (!courseId || !isAuthenticated) {
      setMyReview(null);
      return;
    }
    setMyLoading(true);
    try {
      const mine = await fetchMyCourseReview(courseId);
      setMyReview(mine);
      if (mine) {
        setFormRating(mine.rating);
        setFormComment(mine.comment || '');
        setFormTags(Array.isArray(mine.tags) ? mine.tags : []);
        setIsEditingReview(false);
      } else {
        setFormRating(5);
        setFormComment('');
        setFormTags([]);
        setIsEditingReview(false);
      }
    } catch {
      setMyReview(null);
    } finally {
      setMyLoading(false);
    }
  }, [courseId, isAuthenticated]);

  useEffect(() => {
    loadList(page);
  }, [loadList, page]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  useEffect(() => {
    if (!thankYouMode) return undefined;
    const t = window.setTimeout(() => setThankYouMode(null), 10000);
    return () => window.clearTimeout(t);
  }, [thankYouMode]);

  useBodyScrollLock(!!thankYouMode || showDeleteConfirm);
  useEscapeClose(() => setThankYouMode(null), !!thankYouMode);
  useEscapeClose(() => {
    if (!deleteBusy) {
      setShowDeleteConfirm(false);
      setDeleteError(null);
    }
  }, showDeleteConfirm);

  const refreshAll = async () => {
    await Promise.all([loadList(page), loadMine()]);
  };

  const cancelEdit = () => {
    if (myReview) {
      setFormRating(myReview.rating);
      setFormComment(myReview.comment || '');
      setFormTags(Array.isArray(myReview.tags) ? myReview.tags : []);
    }
    setIsEditingReview(false);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !canReview || !isAuthenticated) return;
    setFormBusy(true);
    setFormError(null);
    const submittedAsUpdate = !!myReview;
    try {
      if (submittedAsUpdate) {
        await updateMyCourseReview(courseId, { rating: formRating, comment: formComment, tags: formTags });
      } else {
        await submitCourseReview(courseId, { rating: formRating, comment: formComment, tags: formTags });
      }
      await refreshAll();
      setIsEditingReview(false);
      setThankYouMode(submittedAsUpdate ? 'updated' : 'new');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setFormError(msg);
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteMyCourseReview(courseId);
      setShowDeleteConfirm(false);
      setDeleteError(null);
      setIsEditingReview(false);
      await refreshAll();
      setFormRating(5);
      setFormComment('');
      setFormTags([]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not delete review';
      setDeleteError(msg);
    } finally {
      setDeleteBusy(false);
    }
  };

  const reviews = payload?.reviews || [];
  const totalPages = payload?.totalPages ?? 0;

  const showReviewForm = !myReview || isEditingReview;
  const myReviewTimeMeta = myReview ? reviewListTimeMeta(myReview) : null;
  const thankYouDialog = thankYouMode && typeof document !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            onClick={() => setThankYouMode(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-thank-title"
            className="relative z-[201] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-obsidian shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-300"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: 'linear-gradient(to right, var(--color-gradient-start), var(--color-gradient-end), var(--color-gradient-start))',
              }}
            />
            <button
              type="button"
              onClick={() => setThankYouMode(null)}
              className="absolute right-3 top-3 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="px-6 pb-6 pt-8 sm:px-8 sm:pt-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--color-gradient-start)]/25 to-[color:var(--color-primary-purple)]/20 text-[color:var(--color-gradient-start)] ring-1 ring-[color:var(--color-gradient-start)]/25">
                <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gradient block">
                {thankYouMode === 'new' ? 'Review received' : 'Changes saved'}
              </p>
              <h2 id="review-thank-title" className="mt-2 text-center text-xl font-bold text-white sm:text-2xl">
                {thankYouMode === 'new' ? 'Thank you for your feedback' : 'Thanks for updating your review'}
              </h2>
              <p className="mt-3 text-center text-sm leading-relaxed text-white/65">
                {thankYouMode === 'new'
                  ? 'Your review is now part of this course’s story. It helps other learners choose wisely and gives instructors valuable insight.'
                  : 'Your updated review is live. Accurate, thoughtful ratings keep the community trustworthy for everyone.'}
              </p>
              <button
                type="button"
                onClick={() => setThankYouMode(null)}
                className="mt-8 w-full rounded-xl py-3 text-sm font-semibold text-white btn-gradient"
              >
                Continue learning
              </button>
              
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  const deleteDialog = showDeleteConfirm && typeof document !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Cancel"
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            onClick={() => {
              if (!deleteBusy) {
                setShowDeleteConfirm(false);
                setDeleteError(null);
              }
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            className="relative z-[201] w-full max-w-md rounded-2xl border border-white/10 bg-obsidian p-6 shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200 sm:p-8"
          >
            <h2 id="delete-review-title" className="text-lg font-bold text-white">
              Remove your review?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              This permanently deletes your rating and comment for this course. The public course rating will update for all learners.
            </p>
            {deleteError && <p className="mt-3 text-sm text-red-400">{deleteError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {deleteBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete review
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="mt-12 pt-12 border-t border-white/10 space-y-8 max-w-[837px]">
      {thankYouDialog}
      {deleteDialog}

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student reviews</h2>
        <p className="mt-1 text-sm text-white/50">
          Ratings and comments from enrolled learners. You can post once per course, then edit or remove your review anytime.
        </p>
      </div>

      {isAuthenticated && canReview && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <h3 className="text-base font-semibold text-white">Your review</h3>
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">Course feedback</span>
          </div>

          {myLoading ? (
            <div className="flex items-center gap-2 text-white/50 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your review…
            </div>
          ) : (
            <>
              {myReview && !isEditingReview && (
                <div className="rounded-xl border border-white/10 bg-black/25 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <StarRow rating={myReview.rating} size="md" />
                      <p className="text-sm leading-relaxed text-white/85">
                        {myReview.comment?.trim() ? myReview.comment : (
                          <span className="text-white/40 italic">No written comment — rating only.</span>
                        )}
                      </p>
                      <p className="text-xs text-white/40">
                        <time
                          dateTime={myReviewTimeMeta?.iso ? new Date(myReviewTimeMeta.iso).toISOString() : undefined}
                        >
                          {myReviewTimeMeta.label} {formatTimeAgo(myReviewTimeMeta.iso)}
                        </time>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-row items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        aria-label="Edit review"
                        onClick={() => {
                          setFormRating(myReview.rating);
                          setFormComment(myReview.comment || '');
                          setFormTags(Array.isArray(myReview.tags) ? myReview.tags : []);
                          setIsEditingReview(true);
                          setFormError(null);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete review"
                        onClick={() => {
                          setDeleteError(null);
                          setShowDeleteConfirm(true);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showReviewForm && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  {myReview && isEditingReview && (
                    <p className="text-sm text-white/50">Update your rating or comment below.</p>
                  )}
                  {!myReview && (
                    <p className="text-sm text-white/50">Share a star rating and optional written feedback.</p>
                  )}
                  <div>
                    <span className="text-xs text-white/45 uppercase tracking-wider block mb-2">Rating</span>
                    <StarInput value={formRating} onChange={setFormRating} disabled={formBusy} />
                  </div>
                  <div>
                    <label htmlFor="course-review-comment" className="text-xs text-white/45 uppercase tracking-wider block mb-2">
                      Written feedback (optional)
                    </label>
                    <textarea
                      id="course-review-comment"
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      disabled={formBusy}
                      rows={4}
                      maxLength={2000}
                      placeholder="What helped you learn? What could be improved?"
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gradient-start)]/40 resize-y min-h-[100px]"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-white/45 uppercase tracking-wider block mb-2">Tags (optional)</span>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_REVIEW_TAGS.map((tag) => {
                        const active = formTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            disabled={formBusy}
                            onClick={() => {
                              setFormTags((prev) => {
                                if (prev.includes(tag)) return prev.filter((x) => x !== tag);
                                if (prev.length >= 8) return prev;
                                return [...prev, tag];
                              });
                            }}
                            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                              active
                                ? 'border-primary-pink/50 bg-primary-pink/20 text-white'
                                : 'border-white/12 bg-white/[0.03] text-white/65 hover:bg-white/[0.08]'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {formError && <p className="text-sm text-red-400">{formError}</p>}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={formBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold px-6 py-2.5 disabled:opacity-60 btn-gradient"
                    >
                      {formBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                      {myReview ? 'Save changes' : 'Submit review'}
                    </button>
                    {myReview && isEditingReview && (
                      <button
                        type="button"
                        disabled={formBusy}
                        onClick={cancelEdit}
                        className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {isAuthenticated && !canReview && (
        <p className="text-sm text-white/50 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          Enroll in this course to leave a review.
        </p>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-white/50 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          Sign in and enroll to share your experience with this course.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-white/50 py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading reviews…
        </div>
      )}

      {loadError && !loading && (
        <p className="text-red-400 text-sm">{loadError}</p>
      )}

      {!loading && !loadError && reviews.length === 0 && (
        <p className="text-white/50 text-sm py-4">No reviews yet. Be the first to share feedback.</p>
      )}

      {!loading && reviews.length > 0 && (
        <ul className="space-y-6">
          {reviews.map((r) => {
            const timeMeta = reviewListTimeMeta(r);
            return (
            <li
              key={r.id}
              className="flex gap-4 border-b border-white/5 pb-8 last:border-0 last:pb-0"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                {getInitials(r.authorName)}
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <h4 className="font-bold text-white text-[15px] truncate">{r.authorName}</h4>
                    <StarRow rating={r.rating} />
                  </div>
                  <time
                    className="text-[#71717a] text-xs font-medium shrink-0"
                    dateTime={timeMeta.iso ? new Date(timeMeta.iso).toISOString() : undefined}
                  >
                    {timeMeta.label} {formatTimeAgo(timeMeta.iso)}
                  </time>
                </div>
                {r.comment ? (
                  <p className="text-[#d4d4d8] text-[14px] leading-relaxed font-light whitespace-pre-wrap break-words">
                    {r.comment}
                  </p>
                ) : (
                  <p className="text-white/35 text-sm italic">No written comment.</p>
                )}
                {Array.isArray(r.tags) && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/65">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {r.instructorReply?.message && (
                  <div className="mt-2 rounded-xl border border-primary-pink/25 bg-primary-pink/10 px-3.5 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-pink">Instructor reply</p>
                    <p className="mt-1 text-sm text-white/85 whitespace-pre-wrap">{r.instructorReply.message}</p>
                  </div>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-sm text-gradient-brand font-semibold hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
          >
            Previous
          </button>
          <span className="text-xs text-white/40">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm text-gradient-brand font-semibold hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
