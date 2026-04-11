import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { FileText, MessageSquare, Download, MoreHorizontal, CheckCircle2, Share2, Bookmark, ArrowLeft, Bold, Italic, List, ListOrdered, Link, Code, Plus, User, Paperclip, Send, X, ChevronDown, Trash2 } from 'lucide-react';
import qnaService from '@/features/courses/services/qnaService';
import chapterCommentService from '@/features/courses/services/chapterCommentService';
import { useToast } from '@/components/ui/Toast';

const TAB_OPTIONS = ['Description', 'Resources', 'QnA', 'Comments'];
/** Brand gradient fill for preview accents (matches CTAs: orange → pink). */
const PREVIEW_GRADIENT_TEXT =
  'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent';
const TITLE_MAX_LENGTH = 150;
const ALLOWED = { TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'span', 'div'], ATTR: ['href', 'target', 'rel'] };

const TIPS = [
  'Check grammar and spelling',
  'Be detailed; provide screenshots, error messages, code, or other clues whenever possible',
  'Search to see if your question has been asked before',
];

function ReplyBox({ questionId, onPublished, isPublishing }) {
  const [body, setBody] = useState('');
  const replyEditorRef = useRef(null);

  const handleFormat = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    replyEditorRef.current?.focus();
  };

  const handlePublish = async () => {
    const text = body.trim();
    if (!text) return;
    await onPublished(questionId, text);
    setBody('');
    if (replyEditorRef.current) replyEditorRef.current.innerText = '';
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden mt-3">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Bold" aria-label="Bold"><Bold size={16} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Italic" aria-label="Italic"><Italic size={16} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Bullet list" aria-label="Bullet list"><List size={16} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Numbered list" aria-label="Numbered list"><ListOrdered size={16} /></button>
        <button type="button" className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Link" aria-label="Link"><Link size={16} /></button>
        <button type="button" className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Attachment" aria-label="Attachment"><Paperclip size={16} /></button>
      </div>
      <div className="flex gap-2 p-3">
        <div
          ref={replyEditorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setBody(e.target.textContent || '')}
          className="min-h-[80px] flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink/50 [&:empty::before]:content-['Add\00a0a\00a0reply.'] [&:empty::before]:text-gray-400"
          data-placeholder="Add a reply."
        />
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing || !body.trim()}
          className="shrink-0 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-gray-100 dark:text-gray-900 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPublishing ? 'Publishing…' : 'Publish'}
        </button>
      </div>
      <div className="px-3 pb-3">
        <div className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-white/10 p-2 cursor-pointer hover:border-primary-pink/40 transition-colors">
          <Plus size={18} className="text-gray-400 dark:text-white/40" />
          <span className="text-xs font-medium text-gray-500 dark:text-white/50">Upload</span>
        </div>
      </div>
    </div>
  );
}

function AskQuestionForm({ onBack, onSubmit, title, onTitleChange, description, onDescriptionChange, descRef, isSubmitting }) {
  const fileInputRef = useRef(null);
  const handleFormat = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    descRef.current?.focus();
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] p-6 sm:p-8 transition-colors duration-300">
      <button
        type="button"
        onClick={onBack}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-white/70 mb-6"
      >
        <ArrowLeft size={18} className="shrink-0 transition-colors group-hover:text-[#FF8C42]" aria-hidden />
        <span className="transition-all group-hover:bg-gradient-to-r group-hover:from-[#FF8C42] group-hover:to-[#FF3FB4] group-hover:bg-clip-text group-hover:text-transparent">
          Back to All Questions
        </span>
      </button>

      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Tips on getting your questions answered faster</h4>
        <ul className="space-y-2">
          {TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/70">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" stroke="url(#coursePreviewBrandGrad)" aria-hidden />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
          <User size={20} className="text-gray-500 dark:text-white/50" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 dark:text-white">Creator</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              CREATOR
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Given our current workload, we are able to respond within 2–4 days.</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Title or Summary</label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value.slice(0, TITLE_MAX_LENGTH))}
            placeholder="Type your title"
            maxLength={TITLE_MAX_LENGTH}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink transition-all outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-white/40 tabular-nums">
            {title.length}/{TITLE_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Bold" aria-label="Bold"><Bold size={18} /></button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Italic" aria-label="Italic"><Italic size={18} /></button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Bullet list" aria-label="Bullet list"><List size={18} /></button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Numbered list" aria-label="Numbered list"><ListOrdered size={18} /></button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('createLink', 'https://'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Link" aria-label="Link"><Link size={18} /></button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'pre'); }} className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Code" aria-label="Code"><Code size={18} /></button>
          </div>
          <div
            ref={descRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onDescriptionChange(e.target.textContent || '')}
            className="min-h-[140px] px-4 py-3 text-gray-900 dark:text-white focus:outline-none [&:empty]:before:content-['Add\00a0a\00a0description.'] [&:empty]:before:text-gray-400 [&:empty]:before:dark:text-white/30"
            data-placeholder="Add a description"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Attachment (optional)</label>
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" aria-label="Upload attachment" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-pink/40 hover:bg-primary-pink/5 transition-colors text-left"
        >
          <Plus size={24} className="text-gray-400 dark:text-white/40" aria-hidden />
          <span className="text-sm font-medium text-gray-600 dark:text-white/60">Upload</span>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-sm font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

function hasPlayableVideoInChapter(activeChapter) {
  return Boolean(
    activeChapter?.contents?.some(
      (c) => c.type === 'video' && (c._id || c.id || c.videoUrl),
    ),
  );
}

// Prefer video for Description/Resources; if chapter is quiz-only, use quiz content for description text
function getActiveContent(activeChapter) {
  if (!activeChapter?.contents?.length) return null;
  const video = activeChapter.contents.find((c) => c.type === 'video');
  if (video && (video._id || video.id || video.videoUrl)) return video;
  return activeChapter.contents.find((c) => c.type === 'quiz') || null;
}

export default function CourseViewPreviewContentTabs({ activeChapter, activeTab, setActiveTab, courseId }) {
  const toast = useToast();
  const activeContent = getActiveContent(activeChapter);
  const quizBlock = activeChapter?.contents?.find((c) => c.type === 'quiz') ?? null;
  const videoPlayable = hasPlayableVideoInChapter(activeChapter);
  const isQuizOnlyLesson = Boolean(quizBlock && !videoPlayable);
  const questionCount = Array.isArray(quizBlock?.questions) ? quizBlock.questions.length : 0;
  const lessonSubtitle = isQuizOnlyLesson
    ? (questionCount > 0
        ? `Assessment • ${questionCount} question${questionCount !== 1 ? 's' : ''}`
        : 'Assessment')
    : 'Lesson • Duration shown in player';
  const [saved, setSaved] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showAskForm, setShowAskForm] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askDescription, setAskDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [publishingReplyId, setPublishingReplyId] = useState(null);
  const [removingQuestionId, setRemovingQuestionId] = useState(null);
  const [removingReplyKey, setRemovingReplyKey] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, userName } when replying
  const [publishingCommentReplyId, setPublishingCommentReplyId] = useState(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [openReplyMenuKey, setOpenReplyMenuKey] = useState(null); // 'commentId-replyId'
  const [deletingReplyKey, setDeletingReplyKey] = useState(null);
  const descRef = useRef(null);
  const commentMenuRef = useRef(null);
  const replyMenuRef = useRef(null);

  const handleShare = () => {
    if (navigator.share && activeChapter?.title) {
      navigator.share({
        title: activeChapter.title,
        text: `Check out this lesson: ${activeChapter.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  // Load comments whenever chapter or course changes
  useEffect(() => {
    const loadComments = async () => {
      const chapterId = activeChapter?._id || activeChapter?.id;
      if (!courseId || !chapterId) return;
      setLoadingComments(true);
      try {
        const res = await chapterCommentService.getComments({
          courseId,
          chapterId,
        });
        const data = res?.data ?? res;
        setComments(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };
    loadComments();
  }, [courseId, activeChapter]);

  useEffect(() => {
    if (!openCommentMenuId && !openReplyMenuKey) return;
    const handleClickOutside = (e) => {
      const inComment = commentMenuRef.current?.contains(e.target);
      const inReply = replyMenuRef.current?.contains(e.target);
      if (!inComment) setOpenCommentMenuId(null);
      if (!inReply) setOpenReplyMenuKey(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCommentMenuId, openReplyMenuKey]);

  // Load questions whenever chapter or course changes
  useEffect(() => {
    const loadQuestions = async () => {
      if (!courseId || !activeChapter?._id && !activeChapter?.id) return;
      setLoadingQuestions(true);
      try {
        const res = await qnaService.getQuestions({
          courseId,
          chapterId: activeChapter._id || activeChapter.id,
        });
        const data = res?.data ?? res;
        setQuestions(Array.isArray(data) ? data : data?.data || []);
      } catch {
        // fail silently for now; UI will just show empty state
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [courseId, activeChapter]);

  const handleRemoveQuestion = async (questionId) => {
    setRemovingQuestionId(questionId);
    try {
      await qnaService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => (q._id || q.id) !== questionId));
      if (expandedQuestionId === questionId) setExpandedQuestionId(null);
      toast.success('Removed', 'Question has been removed.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove question.';
      toast.error('Remove failed', msg);
    } finally {
      setRemovingQuestionId(null);
    }
  };

  const handleRemoveReply = async (questionId, replyId) => {
    const key = `${questionId}-${replyId}`;
    setRemovingReplyKey(key);
    try {
      const res = await qnaService.deleteReply(questionId, replyId);
      const updated = res?.data ?? res;
      setQuestions((prev) => prev.map((q) => (q._id === questionId || q.id === questionId ? updated : q)));
      toast.success('Removed', 'Reply has been removed.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove reply.';
      toast.error('Remove failed', msg);
    } finally {
      setRemovingReplyKey(null);
    }
  };

  const handlePublishReply = async (questionId, body) => {
    setPublishingReplyId(questionId);
    try {
      const res = await qnaService.addReply(questionId, body);
      const updated = res?.data ?? res;
      setQuestions((prev) => prev.map((q) => (q._id === questionId || q.id === questionId ? updated : q)));
      toast.success('Reply published', 'Your reply appears under the question.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to publish reply.';
      toast.error('Publish failed', msg);
    } finally {
      setPublishingReplyId(null);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    const sec = Math.floor((Date.now() - d) / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.floor(hr / 24);
    return `${day}d`;
  };

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!courseId || !activeChapter || !text) return;
    setSubmittingComment(true);
    try {
      const res = await chapterCommentService.createComment({
        courseId,
        chapterId: activeChapter._id || activeChapter.id,
        text,
      });
      const created = res?.data ?? res;
      setComments((prev) => [created, ...prev]);
      setCommentText('');
      toast.success('Comment added', 'Your comment is visible below.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add comment.';
      toast.error('Add failed', msg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddCommentReply = async (commentId, text) => {
    if (!text?.trim()) return;
    setPublishingCommentReplyId(commentId);
    try {
      const res = await chapterCommentService.addReply(commentId, text);
      const updated = res?.data ?? res;
      setComments((prev) => prev.map((c) => (c._id === commentId || c.id === commentId ? updated : c)));
      setCommentText('');
      setReplyingTo(null);
      toast.success('Reply added', 'Your reply appears under the comment.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add reply.';
      toast.error('Reply failed', msg);
    } finally {
      setPublishingCommentReplyId(null);
    }
  };

  const handleCommentSubmit = () => {
    const text = commentText.trim();
    if (!text) return;
    if (replyingTo) {
      handleAddCommentReply(replyingTo.commentId, text);
    } else {
      handleAddComment();
    }
  };

  const handleDeleteComment = async (commentId) => {
    setOpenCommentMenuId(null);
    if (replyingTo?.commentId === commentId) setReplyingTo(null);
    setDeletingCommentId(commentId);
    try {
      await chapterCommentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
      toast.success('Comment deleted', 'The comment has been removed.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete comment.';
      toast.error('Delete failed', msg);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const key = `${commentId}-${replyId}`;
    setOpenReplyMenuKey(null);
    setDeletingReplyKey(key);
    try {
      const res = await chapterCommentService.deleteReply(commentId, replyId);
      const updated = res?.data ?? res;
      setComments((prev) => prev.map((c) => (c._id || c.id) === commentId ? updated : c));
      toast.success('Reply deleted', 'The reply has been removed.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete reply.';
      toast.error('Delete failed', msg);
    } finally {
      setDeletingReplyKey(null);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!courseId || !activeChapter || !askTitle.trim() || !askDescription.trim()) return;
    setSubmittingQuestion(true);
    try {
      const res = await qnaService.createQuestion({
        courseId,
        chapterId: activeChapter._id || activeChapter.id,
        title: askTitle.trim(),
        description: askDescription.trim(),
      });
      const created = res?.data ?? res;
      setQuestions((prev) => [created, ...prev]);
      setAskTitle('');
      setAskDescription('');
      if (descRef.current) {
        descRef.current.innerHTML = '';
      }
      setShowAskForm(false);
      toast.success('Question submitted', 'Your question will appear in this lesson’s QnA and in the instructor’s Q&A tab.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit question.';
      toast.error('Submit failed', msg);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-white/10 px-8 pt-6 pb-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* YouTube-style: title + engagement row */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white pr-2">
            {activeChapter?.title || 'Select a chapter'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">{lessonSubtitle}</p>
          </div>

        {/* Engagement row (Share / Save / Download / More) removed as per requirement */}
        <div className="flex items-center gap-8 border-b border-gray-200 dark:border-white/5 mb-8" role="tablist">
          {TAB_OPTIONS.map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? '' : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60'}`}>
              <span className={activeTab === tab ? PREVIEW_GRADIENT_TEXT : undefined}>{tab}</span>
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] shadow-[0_0_12px_rgba(255,140,66,0.35)]" aria-hidden />}
            </button>
          ))}
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'Description' && (
            <div className="space-y-4">
              <div className="text-gray-600 dark:text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeContent?.description || activeChapter?.description || 'No description available.', { ALLOWED_TAGS: ALLOWED.TAGS, ALLOWED_ATTR: ALLOWED.ATTR }) }} />
              {!isQuizOnlyLesson && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <h4 className="text-gray-900 dark:text-white font-bold mb-2 text-sm">Key Takeaways</h4>
                  <ul className="space-y-2 text-gray-500 dark:text-white/40 text-[13px]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} stroke="url(#coursePreviewBrandGrad)" aria-hidden />
                      Understanding core concepts
                    </li>
                  </ul>
                </div>
              </div>
              )}
            </div>
          )}
          {activeTab === 'Resources' && (
            <div className="space-y-3">
              {(() => {
                // Video-level resources from "Upload resources" (content.resources: { url, title }[])
                const videoResources = activeContent?.resources ?? [];
                // Chapter-level resource-type contents (pdf, document, resource)
                const chapterResources = activeChapter?.contents?.filter((c) => ['pdf', 'document', 'resource'].includes(c.type)) ?? [];
                const hasVideoResources = videoResources.length > 0;
                const hasChapterResources = chapterResources.length > 0;
                const hasAny = hasVideoResources || hasChapterResources;

                if (!hasAny) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-white/30">
                      <FileText size={40} aria-hidden />
                      <p className="text-xs font-bold mt-4 tracking-widest uppercase text-gray-500 dark:text-white/40">No resources for this lesson</p>
                    </div>
                  );
                }
                return (
                  <>
                    {videoResources.map((res, i) => (
                      <a
                        key={`v-${i}`}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <FileText size={20} aria-hidden />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white max-w-[200px] truncate">{res.title || 'Attached Resource'}</p>
                            <p className="text-[11px] text-gray-500 dark:text-white/30 uppercase tracking-wider">Link</p>
                          </div>
                        </div>
                        <span className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 group-hover:text-gray-900 dark:group-hover:text-white transition-all">
                          <Download size={18} />
                        </span>
                      </a>
                    ))}
                    {chapterResources.map((res, i) => (
                      <div key={`c-${i}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <FileText size={20} aria-hidden />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white max-w-[200px] truncate">{res.metadata?.fileName || res.title || 'Attached Resource'}</p>
                            <p className="text-[11px] text-gray-500 dark:text-white/30 uppercase tracking-wider">{res.type} • {res.metadata?.fileSize ? (res.metadata.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Download File'}</p>
                          </div>
                        </div>
                        <a href={res.fileUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all" aria-label={`Download ${res.metadata?.fileName || res.title || 'resource'}`}>
                          <Download size={18} />
                        </a>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          )}
          {activeTab === 'QnA' && (
            showAskForm ? (
              <AskQuestionForm
                onBack={() => setShowAskForm(false)}
                onSubmit={handleSubmitQuestion}
                title={askTitle}
                onTitleChange={setAskTitle}
                description={askDescription}
                onDescriptionChange={setAskDescription}
                descRef={descRef}
                isSubmitting={submittingQuestion}
              />
            ) : (
              <div className="py-8">
                {loadingQuestions ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-white/30">
                    <div className="w-10 h-10 rounded-full border-2 border-[#FF8C42]/25 border-t-[#FF3FB4] animate-spin mb-4" />
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-white/40">Loading questions…</p>
                  </div>
                ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <MessageSquare size={24} className="text-gray-400 dark:text-white/20" aria-hidden />
                    </div>
                    <h4 className="text-gray-900 dark:text-white font-bold mb-1">No questions yet</h4>
                    <p className="text-sm text-gray-500 dark:text-white/30">Be the first to ask a question about this chapter.</p>
                    <button
                      type="button"
                      onClick={() => setShowAskForm(true)}
                      className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
                    >
                      Ask a question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Questions for this lesson</h4>
                      <button
                        type="button"
                        onClick={() => setShowAskForm(true)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                      >
                        Ask a question
                      </button>
                    </div>
                    <div className="space-y-3">
                      {questions.map((q) => {
                        const qId = q._id || q.id;
                        const replyCount = q.replies?.length ?? 0;
                        const isAnswered = q.status === 'answered' || replyCount > 0;
                        const isExpanded = expandedQuestionId === qId;
                        return (
                          <div
                            key={qId}
                            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden"
                          >
                            <div className="p-4 flex gap-4">
                              <div className="shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                <User size={20} className="text-gray-500 dark:text-white/50" aria-hidden />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{q.title}</p>
                                <p className="text-sm text-gray-600 dark:text-white/70 mt-1 line-clamp-2">{q.description}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-white/50 flex-wrap">
                                  <span className="font-medium text-gray-700 dark:text-white/70">{q.askedBy?.userName || q.askedBy?.name || 'Student'}</span>
                                  <span className="text-gray-400 dark:text-white/40">•</span>
                                  <span className={PREVIEW_GRADIENT_TEXT}>
                                    {q.createdAt ? new Date(q.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                  </span>
                                  <span className="text-gray-400 dark:text-white/40">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(qId)}
                                    disabled={removingQuestionId === qId}
                                    className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                    aria-label="Remove question"
                                  >
                                    {removingQuestionId === qId ? 'Removing…' : 'Remove'}
                                  </button>
                                </div>
                              </div>
                              <div className="shrink-0 flex flex-col items-center justify-center text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedQuestionId(isExpanded ? null : qId)}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                  aria-label={replyCount === 1 ? '1 reply' : `${replyCount} replies`}
                                >
                                  <MessageSquare size={20} className="text-gray-500 dark:text-white/50 mb-1" aria-hidden />
                                  <span className="text-xs font-medium text-gray-600 dark:text-white/70">{replyCount}</span>
                                </button>
                                {isAnswered && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white mt-2">
                                    <span className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center">✓</span>
                                    ANSWERED
                                  </span>
                                )}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] px-4 pb-4 pt-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-white/50 mb-3">
                                  {replyCount === 1 ? '1 reply' : `${replyCount} replies`}
                                </p>
                                {replyCount > 0 && (
                                  <div className="space-y-3 mb-4">
                                    {(q.replies || []).map((r, idx) => (
                                      <div key={r._id || idx} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                          <User size={14} className="text-gray-500 dark:text-white/50" aria-hidden />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                              {r.repliedBy?.userName || r.repliedBy?.name || 'User'}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                              CREATOR
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                          </p>
                                          <p className="text-sm text-gray-700 dark:text-white/80 mt-1 whitespace-pre-wrap">{r.body}</p>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveReply(qId, r._id || r.id)}
                                            disabled={removingReplyKey === `${qId}-${r._id || r.id}`}
                                            className="text-red-600 dark:text-red-400 hover:underline text-xs mt-1 disabled:opacity-50"
                                            aria-label="Remove reply"
                                          >
                                            {removingReplyKey === `${qId}-${r._id || r.id}` ? 'Removing…' : 'Remove'}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <ReplyBox
                                  questionId={qId}
                                  onPublished={handlePublishReply}
                                  isPublishing={publishingReplyId === qId}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
          {activeTab === 'Comments' && (
            <div className="py-8">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comments</h4>

              {/* Single comment/reply box */}
              {replyingTo && (
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10">
                  <span className="text-sm font-medium text-gray-700 dark:text-white/70">Replying to {replyingTo.userName}</span>
                  <button
                    type="button"
                    onClick={() => { setReplyingTo(null); setCommentText(''); }}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-white/20 text-gray-500 dark:text-white/50"
                    aria-label="Cancel reply"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex gap-3 items-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <User size={20} className="text-gray-500 dark:text-white/50" />
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingTo ? `Reply to ${replyingTo.userName}...` : 'Add a comment...'}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink/50"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCommentSubmit(); } }}
                />
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || (replyingTo ? publishingCommentReplyId === replyingTo.commentId : submittingComment)}
                  className="p-2.5 rounded-lg bg-gray-700 dark:bg-gray-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={replyingTo ? 'Send reply' : 'Send comment'}
                >
                  <Send size={20} />
                </button>
              </div>

              {loadingComments ? (
                <div className="flex justify-center py-8 text-gray-400 dark:text-white/30">Loading comments…</div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-white/40">No comments yet. Be the first to comment.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => {
                    const cId = c._id || c.id;
                    const isExpanded = expandedCommentId === cId;
                    const replyCount = c.replies?.length ?? 0;
                    const commenterName = c.user?.userName || c.user?.name || 'User';
                    return (
                      <div key={cId} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden">
                        <div className="p-4 flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                            <User size={20} className="text-gray-500 dark:text-white/50" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-gray-900 dark:text-white">{commenterName}</p>
                              <div className="relative shrink-0" ref={openCommentMenuId === cId ? commentMenuRef : undefined}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setOpenCommentMenuId(openCommentMenuId === cId ? null : cId); }}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white/60 p-1 rounded"
                                  aria-label="More options"
                                  aria-expanded={openCommentMenuId === cId}
                                >
                                  <MoreHorizontal size={16} />
                                </button>
                                {openCommentMenuId === cId && (
                                  <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-lg z-10">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDeleteComment(cId); }}
                                      disabled={deletingCommentId === cId}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
                                    >
                                      <Trash2 size={14} />
                                      {deletingCommentId === cId ? 'Deleting…' : 'Delete'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{formatTimeAgo(c.createdAt)}</p>
                            <p className="text-sm text-gray-700 dark:text-white/80 mt-2 whitespace-pre-wrap">{c.text}</p>
                            <div className="mt-2 flex items-center gap-3 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setReplyingTo({ commentId: cId, userName: commenterName })}
                                className="text-gray-500 dark:text-white/50 text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-[#FF8C42] hover:to-[#FF3FB4] hover:bg-clip-text hover:text-transparent"
                              >
                                Reply · {formatTimeAgo(c.createdAt)}
                              </button>
                              {replyCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedCommentId(isExpanded ? null : cId)}
                                  className="inline-flex items-center gap-1 hover:underline text-sm font-medium"
                                >
                                  <span className={PREVIEW_GRADIENT_TEXT}>
                                    {isExpanded ? 'Hide replies' : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
                                  </span>
                                  <ChevronDown size={14} stroke="url(#coursePreviewBrandGrad)" className={isExpanded ? 'rotate-180' : ''} aria-hidden />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded && replyCount > 0 && (
                          <div className="border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] px-4 pb-4 pt-2">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-gray-700 dark:text-white/80">Replies:</span>
                              <button
                                type="button"
                                onClick={() => setExpandedCommentId(null)}
                                className={`hover:underline text-sm font-medium ${PREVIEW_GRADIENT_TEXT}`}
                              >
                                Hide replies
                              </button>
                            </div>
                            <div className="space-y-3 pl-2">
                              {(c.replies || []).map((r, idx) => {
                                const replierName = r.user?.userName || r.user?.name || 'User';
                                const replyId = r._id || r.id;
                                const replyMenuKey = replyId ? `${cId}-${replyId}` : null;
                                const isReplyMenuOpen = openReplyMenuKey === replyMenuKey;
                                const isDeletingReply = deletingReplyKey === replyMenuKey;
                                return (
                                  <div key={r._id || idx} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                      <User size={14} className="text-gray-500 dark:text-white/50" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{replierName}</p>
                                        {replyId && (
                                          <div className="relative shrink-0" ref={isReplyMenuOpen ? replyMenuRef : undefined}>
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); setOpenReplyMenuKey(isReplyMenuOpen ? null : replyMenuKey); }}
                                              className="text-gray-400 hover:text-gray-600 dark:hover:text-white/60 p-0.5 rounded"
                                              aria-label="More options"
                                              aria-expanded={isReplyMenuOpen}
                                            >
                                              <MoreHorizontal size={14} />
                                            </button>
                                            {isReplyMenuOpen && (
                                              <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-lg z-10">
                                                <button
                                                  type="button"
                                                  onClick={(e) => { e.stopPropagation(); handleDeleteReply(cId, replyId); }}
                                                  disabled={isDeletingReply}
                                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
                                                >
                                                  <Trash2 size={14} />
                                                  {isDeletingReply ? 'Deleting…' : 'Delete'}
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 dark:text-white/50">{formatTimeAgo(r.createdAt)}</p>
                                      <p className="text-sm text-gray-700 dark:text-white/80 mt-0.5 whitespace-pre-wrap">{r.text}</p>
                                      <button
                                        type="button"
                                        onClick={() => setReplyingTo({ commentId: cId, userName: replierName })}
                                        className="mt-1 text-gray-500 dark:text-white/50 text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-[#FF8C42] hover:to-[#FF3FB4] hover:bg-clip-text hover:text-transparent"
                                      >
                                        Reply · {formatTimeAgo(r.createdAt)}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
