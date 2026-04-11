import React, { useEffect, useState, useRef } from "react";
import EmptyState from "@/features/instructor/components/course-editor/shared/EmptyState";
import { Card, ContentCard } from "@/components/ui";
import qnaService from "@/features/courses/services/qnaService";
import { useParams } from "react-router-dom";
import { User, X, Send, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function formatTimeAgo(date) {
  if (!date) return "—";
  const d = new Date(date);
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

function QnAReplyModal({ question, onClose, onReplyPublished }) {
  const toast = useToast();
  const [replyText, setReplyText] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [removingReplyId, setRemovingReplyId] = useState(null);
  const inputRef = useRef(null);

  if (!question) return null;

  const replyCount = question.replies?.length ?? 0;
  const chapterTitle = question.chapter?.title || "Chapter";
  const questionId = question._id || question.id;

  const handleRemoveReply = async (replyId) => {
    setRemovingReplyId(replyId);
    try {
      const res = await qnaService.deleteReply(questionId, replyId);
      const updated = res?.data ?? res;
      onReplyPublished(updated);
      toast.success("Removed", "Reply has been removed.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to remove reply.";
      toast.error("Remove failed", msg);
    } finally {
      setRemovingReplyId(null);
    }
  };

  const handlePublish = async () => {
    const text = replyText.trim();
    if (!text) return;
    setPublishing(true);
    try {
      const res = await qnaService.addReply(question._id || question.id, text);
      const updated = res?.data ?? res;
      onReplyPublished(updated);
      setReplyText("");
      toast.success("Reply published", "Your reply is visible under this question and under the video.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to publish reply.";
      toast.error("Publish failed", msg);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70" aria-label="Close">
            <X size={20} />
          </button>
          <p className="text-xs font-medium text-gray-500 dark:text-white/50 truncate flex-1 mx-3">
            Course &gt; {chapterTitle}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-gray-500 dark:text-white/50" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-white">
                {question.askedBy?.userName || question.askedBy?.name || "Student"}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                {formatTimeAgo(question.createdAt)}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{question.title}</p>
              <p className="text-sm text-gray-600 dark:text-white/70 mt-0.5 whitespace-pre-wrap">{question.description}</p>
            </div>
          </div>

          {replyCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center mb-3 text-gray-400 dark:text-white/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-white/60">You haven&apos;t replied yet</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-white/50">
                {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </p>
              <div className="space-y-3">
                {(question.replies || []).map((r, idx) => (
                  <div key={r._id || idx} className="flex gap-3 pl-2 border-l-2 border-gray-200 dark:border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <User size={14} className="text-gray-500 dark:text-white/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {r.repliedBy?.userName || r.repliedBy?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/50">{formatTimeAgo(r.createdAt)}</p>
                      <p className="text-sm text-gray-700 dark:text-white/80 mt-1 whitespace-pre-wrap">{r.body}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveReply(r._id)}
                        disabled={removingReplyId === r._id}
                        className="text-red-600 dark:text-red-400 hover:underline text-xs mt-1 disabled:opacity-50"
                      >
                        {removingReplyId === r._id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex gap-2 items-end">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0 flex-shrink-0">
            <User size={14} className="text-gray-500 dark:text-white/50" />
          </div>
          <div className="flex-1 flex gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 min-w-0 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 text-sm focus:outline-none"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePublish(); } }}
            />
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white/60" aria-label="Attach image">
              <ImageIcon size={20} />
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!replyText.trim() || publishing}
              className="p-2 text-primary-pink hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send reply"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * QnA tab for managing learner questions
 */
const QnATab = () => {
  const { id: courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalQuestion, setModalQuestion] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const res = await qnaService.getQuestions({ courseId });
        const data = res?.data ?? res;
        setQuestions(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
      <ContentCard
        title="QnAs"
        subtitle="List of all the questions on your course."
        variant="flat"
        className="flex-1 min-w-0"
      >
        <Card className="rounded-[24px] overflow-hidden bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
          <div className="grid grid-cols-5 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 px-8 py-4 text-[11px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest transition-colors duration-300">
            <div>Question</div>
            <div className="text-center">User</div>
            <div className="text-center">Chapter</div>
            <div className="text-center">Created at</div>
            <div className="text-right">Action</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs font-bold tracking-[0.2em] uppercase text-gray-400 dark:text-white/30">
              Loading questions…
            </div>
          ) : questions.length === 0 ? (
            <EmptyState message="Manage all the questions across different chapters from here" />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {questions.map((q) => (
                <div
                  key={q._id || q.id}
                  className="grid grid-cols-5 items-center px-8 py-4 text-sm text-gray-700 dark:text-white/80"
                >
                  <div className="pr-4 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-pink shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{q.title}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 line-clamp-1 mt-0.5">
                        {q.description}
                      </p>
                      {(q.replies?.length ?? 0) > 0 && (
                        <p className="text-[11px] text-gray-500 dark:text-white/40 mt-1">
                          {q.replies.length} {q.replies.length === 1 ? 'reply' : 'replies'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <User size={16} className="text-gray-400 dark:text-white/40 shrink-0" aria-hidden />
                    <span className="text-xs font-medium">{q.askedBy?.userName || q.askedBy?.name || "Student"}</span>
                  </div>
                  <div className="text-center text-xs">
                    {q.chapter?.title || "—"}
                  </div>
                  <div className="text-center text-xs text-gray-500 dark:text-white/50">
                    {q.createdAt
                      ? new Date(q.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
                      : "—"}
                  </div>
                  <div className="text-right flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setModalQuestion(q)}
                      className="text-primary-pink dark:text-primary-pink/90 hover:underline text-sm font-medium"
                    >
                      {(q.replies?.length ?? 0) > 0 ? "View replies" : "Add a reply"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </ContentCard>

      {modalQuestion && (
        <QnAReplyModal
          question={modalQuestion}
          onClose={() => setModalQuestion(null)}
          onReplyPublished={(updated) => {
            setQuestions((prev) => prev.map((q) => ((q._id || q.id) === (updated._id || updated.id) ? updated : q)));
            setModalQuestion(updated);
          }}
        />
      )}
    </div>
  );
};

export default QnATab;
