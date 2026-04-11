import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, CheckSquare, Square, FileEdit, Inbox, User, Eye, X, BookCheck, BookOpen, Send } from 'lucide-react';
import { Card, Input, ContentCard } from '@/components/ui';
import chapterCommentService from '@/features/courses/services/chapterCommentService';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0][0] || '?').toUpperCase();
}

function getRelativeTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min !== 1 ? 's' : ''} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr !== 1 ? 's' : ''} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day !== 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

function CommentViewModal({ comment, onClose, onUpdate }) {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!comment) return null;
  const replies = comment.replies || [];
  const isRead = comment.isRead;

  const handleMarkRead = async () => {
    try {
      await chapterCommentService.updateComment(comment._id, { isRead: true });
      onUpdate?.({ ...comment, isRead: true });
    } catch {}
  };

  const handleMarkUnread = async () => {
    try {
      await chapterCommentService.updateComment(comment._id, { isRead: false });
      onUpdate?.({ ...comment, isRead: false });
    } catch {}
  };

  const handleSendReply = async () => {
    const text = (replyText || '').trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await chapterCommentService.addReply(comment._id, text);
      const updated = res?.data ?? res;
      if (updated && updated._id) onUpdate?.(updated);
      setReplyText('');
    } catch {
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumb = [comment.course?.title, comment.chapter?.title].filter(Boolean).join(' > ') || 'Comment';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header: X, breadcrumb, Mark as read/unread */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-white/10 shrink-0">
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70" aria-label="Close">
            <X size={20} />
          </button>
          <p className="text-sm font-medium text-gray-700 dark:text-white/80 truncate flex-1 min-w-0 mx-2" title={breadcrumb}>{breadcrumb}</p>
          {isRead ? (
            <button
              type="button"
              onClick={handleMarkUnread}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-xs font-bold hover:opacity-90 shadow-sm transition-colors"
            >
              <BookOpen size={14} /> Mark as unread
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMarkRead}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-xs font-bold hover:opacity-90 shadow-sm transition-colors"
            >
              <BookCheck size={14} /> Mark as read
            </button>
          )}
        </div>

        {/* Comments thread */}
        <div className="p-4 overflow-y-auto flex-1 space-y-5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/70 shrink-0">
              {getInitials(comment.user?.userName || comment.user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{comment.user?.userName || comment.user?.name || '—'}</p>
              <p className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1.5 mt-0.5">
                {!isRead && (
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] shrink-0" aria-hidden />
                )}
                {getRelativeTime(comment.createdAt)}
              </p>
              <p className="text-sm text-gray-700 dark:text-white/80 mt-2 whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>

          {replies.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-500 dark:text-white/50">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</p>
              {replies.map((r, i) => (
                <div key={r._id || i} className="flex gap-3 pl-0">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/70 shrink-0">
                    {getInitials(r.user?.userName || r.user?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.user?.userName || r.user?.name || '—'}</p>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{getRelativeTime(r.createdAt)}</p>
                    <p className="text-sm text-gray-700 dark:text-white/80 mt-1 whitespace-pre-wrap">{r.text}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer: write comment + send */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex items-center gap-3 shrink-0 bg-gray-50/50 dark:bg-black/20">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white/70 shrink-0">
            ?
          </div>
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            placeholder="Write a comment..."
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-pink/30 focus:border-primary-pink/50"
          />
          <button
            type="button"
            onClick={handleSendReply}
            disabled={!replyText.trim() || submitting}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Comments tab for course discussion management
 */
const CommentsTab = ({ activeCommentStatus, setActiveCommentStatus }) => {
  const { id: courseId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewComment, setViewComment] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const loadComments = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await chapterCommentService.getComments({ courseId });
      const data = res?.data ?? res;
      setComments(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const byStatus = (list) => {
    if (activeCommentStatus === 'Unread') return list.filter((c) => !c.isRead);
    if (activeCommentStatus === 'Read') return list.filter((c) => c.isRead);
    return list;
  };

  const bySearch = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        (c.user?.userName || '').toLowerCase().includes(q) ||
        (c.user?.userEmail || '').toLowerCase().includes(q) ||
        (c.text || '').toLowerCase().includes(q)
    );
  };

  const byDateRange = (list) => {
    if (!startDate && !endDate) return list;
    return list.filter((c) => {
      const t = c.createdAt ? new Date(c.createdAt).getTime() : 0;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (t < start.getTime()) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (t > end.getTime()) return false;
      }
      return true;
    });
  };

  const filtered = byDateRange(bySearch(byStatus(comments)));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((c) => c._id).filter(Boolean)));
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => chapterCommentService.updateComment(id, { isRead: true }))
      );
      setComments((prev) =>
        prev.map((c) => (selectedIds.has(c._id) ? { ...c, isRead: true } : c))
      );
      setSelectedIds(new Set());
    } catch {
      loadComments();
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleMarkAsUnread = async () => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => chapterCommentService.updateComment(id, { isRead: false }))
      );
      setComments((prev) =>
        prev.map((c) => (selectedIds.has(c._id) ? { ...c, isRead: false } : c))
      );
      setSelectedIds(new Set());
    } catch {
      loadComments();
    } finally {
      setBulkUpdating(false);
    }
  };

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
      <ContentCard
        title="Comments"
        subtitle="List of all the comments on your course."
        variant="flat"
        className="flex-1 min-w-0"
      >
        <Card className="p-8 space-y-6 rounded-[24px] bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by User details"
                  className="pl-12 bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/5 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus:border-orange-500/30 transition-colors duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 pointer-events-none" size={18} />
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2 gap-3">
                <Calendar size={16} className="text-gray-400 dark:text-white/20 shrink-0" />
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-white/40">
                  Start date
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none text-gray-700 dark:text-white/80 text-xs font-medium focus:outline-none focus:ring-0 [color-scheme:dark]"
                  />
                </label>
                <span className="text-gray-300 dark:text-white/10">–</span>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-white/40">
                  End date
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none text-gray-700 dark:text-white/80 text-xs font-medium focus:outline-none focus:ring-0 [color-scheme:dark]"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['All', 'Unread', 'Read'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveCommentStatus(status)}
                    className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-300 ${
                      activeCommentStatus === status
                        ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-sm shadow-[0_10px_20px_rgba(255,63,180,0.15)]'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  disabled={!someSelected || bulkUpdating}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors rounded-lg px-3 py-2 ${
                    someSelected && !bulkUpdating
                      ? 'text-primary-pink dark:text-primary-pink bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 dark:bg-gradient-to-r dark:from-[#FF8C42]/20 dark:to-[#FF3FB4]/20 hover:bg-gradient-to-r hover:from-[#FF8C42]/15 hover:to-[#FF3FB4]/15 dark:hover:bg-gradient-to-r dark:hover:from-[#FF8C42]/25 dark:hover:to-[#FF3FB4]/25'
                      : 'text-gray-400 dark:text-white/30 cursor-not-allowed'
                  }`}
                >
                  <FileEdit size={14} /> {bulkUpdating ? 'Updating…' : 'Mark as read'}
                </button>
                <button
                  type="button"
                  onClick={handleMarkAsUnread}
                  disabled={!someSelected || bulkUpdating}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors rounded-lg px-3 py-2 ${
                    someSelected && !bulkUpdating
                      ? 'text-gray-700 dark:text-white/90 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'
                      : 'text-gray-400 dark:text-white/30 cursor-not-allowed'
                  }`}
                >
                  <FileEdit size={14} /> Mark as unread
                </button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors duration-300">
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 px-6 py-4 text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">
              <button
                type="button"
                onClick={filtered.length ? toggleSelectAll : undefined}
                disabled={filtered.length === 0}
                className="w-4 h-4 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-primary-pink focus:outline-none focus:ring-2 focus:ring-primary-pink/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected ? <CheckSquare size={14} className="text-primary-pink" /> : <Square size={14} className="text-gray-400 dark:text-white/30" />}
              </button>
              <div>Comment</div>
              <div>User</div>
              <div>Course</div>
              <div>Chapter</div>
              <div>Created at</div>
              <div className="text-right">Actions</div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 dark:text-white/40">Loading comments…</div>
            ) : filtered.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-300 dark:text-white/10">
                  <Inbox size={32} />
                </div>
                <p className="text-[13px] text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest">No Data</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((c) => {
                  const id = c._id || c.id;
                  const checked = selectedIds.has(id);
                  return (
                  <div
                    key={id}
                    className={`grid grid-cols-7 items-center px-6 py-4 text-sm text-gray-700 dark:text-white/80 gap-2 ${
                      !c.isRead ? 'bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 dark:bg-gradient-to-r dark:from-[#FF8C42]/20 dark:to-[#FF3FB4]/20' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSelect(id)}
                      className="w-4 h-4 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-pink/50"
                      aria-label={checked ? 'Deselect' : 'Select'}
                    >
                      {checked ? <CheckSquare size={14} className="text-primary-pink" /> : <Square size={14} className="text-gray-400 dark:text-white/30" />}
                    </button>
                    <div className="min-w-0 line-clamp-2">{c.text}</div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400 dark:text-white/40 shrink-0" />
                      <span className="truncate">{c.user?.userName || c.user?.name || '—'}</span>
                    </div>
                    <div className="truncate">{c.course?.title || '—'}</div>
                    <div className="truncate">{c.chapter?.title || '—'}</div>
                    <div className="text-xs text-gray-500 dark:text-white/50">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setViewComment(c);
                          if (!c.isRead) {
                            chapterCommentService.updateComment(id, { isRead: true }).then(() => {
                              setComments((prev) => prev.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
                            }).catch(() => {});
                          }
                        }}
                        className="inline-flex items-center gap-1 text-primary-pink dark:text-primary-pink/90 hover:underline text-sm font-medium"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </ContentCard>
      {viewComment && (
        <CommentViewModal
          comment={viewComment}
          onClose={() => setViewComment(null)}
          onUpdate={(updated) => {
            setViewComment(updated);
            setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
          }}
        />
      )}
    </div>
  );
};

export default CommentsTab;
