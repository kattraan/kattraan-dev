import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ChevronRight, Calendar, HelpCircle, RefreshCw, Download, ChevronLeft, Eye, X, Calculator } from 'lucide-react';
import { Card, Button, Input, ContentCard } from '@/components/ui';
import courseService from '@/features/courses/services/courseService';
import { useToast } from '@/components/ui/Toast';

/**
 * Calculate auto-grade for a quiz submission. Returns { earned, total, percentage } or null.
 */
function calculateQuizGrade(parsedAnswers, questions) {
  if (!parsedAnswers || parsedAnswers.type !== 'quiz' || !Array.isArray(parsedAnswers.answers) || !Array.isArray(questions) || questions.length === 0) return null;
  let earned = 0;
  let total = 0;
  for (const a of parsedAnswers.answers) {
    const q = questions[a.questionIndex];
    if (!q) continue;
    const marks = q.marks != null ? Number(q.marks) : 1;
    total += marks;
    if (q.type === 'single') {
      if (a.single != null && Number(a.single) === Number(q.correctAnswer)) earned += marks;
    } else if (q.type === 'multiple') {
      const correct = (q.correctAnswers || []).map(Number).sort((x, y) => x - y);
      const submitted = (a.multiple || []).map(Number).sort((x, y) => x - y);
      if (correct.length === submitted.length && correct.every((c, i) => c === submitted[i])) earned += marks;
    }
  }
  if (total === 0) return null;
  const percentage = Math.round((earned / total) * 100);
  return { earned, total, percentage };
}

/**
 * Assignment Responses tab: real assignments (quiz contents) and submissions for this course.
 */
const AssignmentResponsesTab = () => {
  const { id: courseId } = useParams();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const loadAssignments = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await courseService.getCourseAssignments(courseId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const loadSubmissions = useCallback(async (contentId) => {
    if (!courseId || !contentId) return;
    setSubmissionsLoading(true);
    try {
      const res = await courseService.getAssignmentSubmissions(courseId, contentId);
      setSubmissions(res?.data?.submissions ?? res?.submissions ?? []);
      setSelectedAssignment(res?.data?.assignment ?? res?.assignment ?? { title: 'Assignment', _id: contentId });
    } catch {
      setSubmissions([]);
      setSelectedAssignment(null);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [courseId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAssignments().finally(() => setIsRefreshing(false));
  };

  const handleExport = () => {
    toast?.info?.('Export', `Exporting ${filteredAssignments.length} assignments to CSV...`);
  };

  const openSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    loadSubmissions(assignment.contentId || assignment.id);
  };

  const filteredAssignments = assignments.filter((asm) =>
    (asm.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dateRangeControl = (
    <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2 gap-3 focus-within:border-primary-pink/30 dark:focus-within:border-primary-pink/30 transition-all duration-300 shadow-sm dark:shadow-none">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="bg-transparent text-xs font-bold text-gray-500 dark:text-white/40 outline-none w-[110px] dark:[color-scheme:dark] transition-colors duration-300"
      />
      <ChevronRight size={14} className="text-gray-400 dark:text-white/10 transition-colors duration-300" />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="bg-transparent text-xs font-bold text-gray-500 dark:text-white/40 outline-none w-[110px] dark:[color-scheme:dark] transition-colors duration-300"
      />
      <Calendar size={16} className="text-gray-400 dark:text-white/40 ml-2 transition-colors duration-300" />
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
      <ContentCard
        title="Assignment Responses"
        subtitle="Track learner submissions and performance across all course assignments."
        variant="flat"
        headerRight={dateRangeControl}
        className="flex-1 min-h-0 min-w-0"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Submission Rate', value: assignments.length > 0 ? `${Math.round(assignments.reduce((a, b) => a + (b.submissions || 0), 0) / Math.max(1, assignments.length))}%` : '—' },
              { label: 'Total Submissions', value: assignments.reduce((a, b) => a + (b.submissions || 0), 0) },
              { label: 'Assignments', value: assignments.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 p-6 space-y-2 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-500 dark:text-white/60 transition-colors duration-300">{stat.label}</span>
                  <HelpCircle size={14} className="text-gray-400 dark:text-white/20 transition-colors duration-300" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 p-8 space-y-8 rounded-[24px] shadow-sm dark:shadow-xl transition-colors duration-300 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by assignment title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-gray-50 dark:bg-[#2A2A2A] border-gray-200 dark:border-white/5 rounded-xl text-sm font-medium focus:border-primary-pink/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 transition-colors duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 pointer-events-none transition-colors duration-300" size={18} />
              </div>
              <Button
                variant="secondary"
                onClick={handleRefresh}
                className={`p-2.5 rounded-xl text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all h-auto bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none ${isRefreshing ? 'animate-spin text-primary-pink' : ''}`}
              >
                <RefreshCw size={18} />
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest h-auto border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none bg-gray-50 dark:bg-white/5"
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>

          <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#2A2A2A]/50 font-satoshi shadow-sm dark:shadow-none transition-colors duration-300">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#2A2A2A] border-b border-gray-200 dark:border-white/10">
                  <th className="text-left px-6 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest w-[20%]">Title</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Submissions</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Drop-off Rate</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Avg. Score</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Passing %</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Retaking %</th>
                  <th className="text-center px-4 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Avg. Time</th>
                  <th className="text-right px-6 py-5 text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-gray-500 dark:text-white/40">Loading assignments…</td>
                  </tr>
                ) : filteredAssignments.length > 0 ? (
                  filteredAssignments.map((asm) => (
                    <tr key={asm.id || asm.contentId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-300 border-b border-gray-100 dark:border-white/5">
                      <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">{asm.title}</td>
                      <td className="px-4 py-5 text-center text-sm font-medium text-gray-500 dark:text-white/60">{(asm.submissions ?? 0)} / {(asm.totalEnrolled ?? 0)}</td>
                      <td className="px-4 py-5 text-center text-sm font-medium text-gray-500 dark:text-white/60">{asm.dropOffRate != null ? `${asm.dropOffRate}%` : '—'}</td>
                      <td className="px-4 py-5 text-center text-sm font-medium text-gray-500 dark:text-white/60">{asm.avgScore != null ? asm.avgScore : '—'}</td>
                      <td className="px-4 py-5 text-center text-sm font-medium text-gray-500 dark:text-white/60">{asm.passingPercent != null ? `${asm.passingPercent}%` : '—'}</td>
                      <td className="px-4 py-5 text-center text-sm font-medium text-gray-500 dark:text-white/60">{asm.retakingPercent != null ? `${asm.retakingPercent}%` : '—'}</td>
                      <td className="px-4 py-5 text-center text-sm font-medium text-gray-500 dark:text-white/60">{asm.avgTime ?? '—'}</td>
                      <td className="px-6 py-5 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="p-2 rounded-lg h-auto"
                          onClick={() => openSubmissions(asm)}
                        >
                          <Eye size={16} /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <p className="text-[13px] text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest">No assignments found</p>
                      <p className="text-xs text-gray-500 dark:text-white/30 mt-1">Add quiz/assignment content in the Curriculum tab to see them here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!loading && filteredAssignments.length > 0 && (
              <div className="border-t border-gray-200 dark:border-white/5 px-6 py-4 flex justify-end items-center gap-4 bg-gray-50 dark:bg-transparent">
                <div className="flex items-center gap-1">
                  <button type="button" className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 text-gray-400 dark:text-white/20 hover:text-gray-900 dark:hover:text-white disabled:opacity-10 transition-colors duration-300" disabled aria-label="Previous page">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-pink text-white text-xs font-black shadow-sm">1</span>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 text-gray-400 dark:text-white/20 hover:text-gray-900 dark:hover:text-white disabled:opacity-10 transition-colors duration-300" disabled aria-label="Next page">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ContentCard>

      {/* Submissions modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedAssignment(null)}>
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedAssignment.title} – Submissions</h3>
              <button type="button" onClick={() => setSelectedAssignment(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {submissionsLoading ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-white/50">Loading submissions…</div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-white/50">No submissions yet.</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => {
                    let parsedSub = null;
                    try {
                      parsedSub = typeof sub.submissionText === 'string' ? JSON.parse(sub.submissionText) : null;
                    } catch { parsedSub = null; }
                    const autoGrade = parsedSub && selectedAssignment?.questions?.length ? calculateQuizGrade(parsedSub, selectedAssignment.questions) : null;
                    const evaluated = sub.latestEvaluation || null;
                    const score = evaluated
                      ? {
                          earned: evaluated.earnedMarks,
                          total: evaluated.totalMarks,
                          percentage: evaluated.percentage,
                        }
                      : autoGrade;
                    const isPassed = typeof evaluated?.passed === 'boolean'
                      ? evaluated.passed
                      : (score ? score.percentage >= 50 : null);
                    return (
                    <div key={sub._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{sub.user?.userName || sub.user?.userEmail || 'Learner'}</p>
                          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                            Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {sub.attemptCount != null && (
                              <span className="text-[11px] font-bold px-2 py-1 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/70">
                                Attempt {sub.attemptCount}
                              </span>
                            )}
                            {score != null && (
                              <span className={`text-[11px] font-bold px-2 py-1 rounded ${isPassed ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'}`}>
                                {isPassed ? 'Passed' : 'Failed'}
                              </span>
                            )}
                          </div>
                          {score != null && (
                            <div className="mt-2 inline-flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-600 dark:text-white/60 flex items-center gap-1">
                                <Calculator size={14} /> Auto score: {score.earned}/{score.total} ({score.percentage}%)
                              </span>
                            </div>
                          )}
                          {sub.status === 'graded' && (
                            <p className="text-sm text-gray-700 dark:text-white/80 mt-1">
                              Grade: <strong>{sub.grade != null ? sub.grade : '—'}</strong>
                              {sub.instructorFeedback && (
                                <span className="block mt-1 text-gray-600 dark:text-white/60">{sub.instructorFeedback}</span>
                              )}
                            </p>
                          )}
                          {(sub.submissionText || sub.submissionFileUrl) && (
                            <div className="mt-2 text-sm text-gray-700 dark:text-white/80 border-l-2 border-primary-pink/30 pl-3 space-y-2">
                              {(() => {
                                let parsed;
                                try {
                                  parsed = typeof sub.submissionText === 'string' ? JSON.parse(sub.submissionText) : null;
                                } catch {
                                  parsed = null;
                                }
                                if (parsed && parsed.type === 'quiz' && Array.isArray(parsed.answers) && selectedAssignment?.questions?.length) {
                                  const questions = selectedAssignment.questions;
                                  return parsed.answers.map((a, i) => {
                                    const q = questions[a.questionIndex];
                                    if (!q) return <p key={i}>Question {a.questionIndex + 1}: —</p>;
                                    let answerLabel = '—';
                                    if (a.single != null && q.options && q.options[a.single] != null) {
                                      answerLabel = q.options[a.single];
                                    } else if (Array.isArray(a.multiple) && q.options) {
                                      answerLabel = a.multiple.map((idx) => q.options[idx]).filter(Boolean).join(', ');
                                    } else if (a.subjective != null && a.subjective !== '') {
                                      answerLabel = a.subjective;
                                    }
                                    return (
                                      <div key={i} className="py-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{a.questionIndex + 1}. {q.question}</p>
                                        <p className="text-gray-600 dark:text-white/70 mt-0.5">→ {answerLabel}</p>
                                      </div>
                                    );
                                  });
                                }
                                return (
                                  <p className="whitespace-pre-wrap">{sub.submissionText || (sub.submissionFileUrl ? `File: ${sub.submissionFileUrl}` : '—')}</p>
                                );
                              })()}
                              {sub.submissionFileUrl && !sub.submissionText?.includes('"type":"quiz"') && (
                                <p className="mt-1 text-gray-600 dark:text-white/60">File: {sub.submissionFileUrl}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col gap-2">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">
                            Auto-graded
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentResponsesTab;
