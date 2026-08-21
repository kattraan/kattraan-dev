import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChevronRight,
  Calendar,
  HelpCircle,
  RefreshCw,
  Download,
  Eye,
  X,
  Calculator,
  FileText,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Button, ContentCard } from '@/components/ui';
import {
  AssignmentListShell,
  AssignmentSection,
  AssignmentListCard,
  filterBySearch,
  groupInstructorAssignments,
  resolveInstructorStatus,
  formatDueMeta,
} from '@/components/assignments';
import courseService from '@/features/courses/services/courseService';
import { useToast } from '@/components/ui/Toast';

/**
 * Per-submission grade + feedback editor for instructors.
 */
function SubmissionGradePanel({
  submission,
  suggestedGrade,
  maxScore,
  saving,
  onSave,
}) {
  const initialGrade =
    submission.grade != null && Number.isFinite(Number(submission.grade))
      ? String(submission.grade)
      : suggestedGrade != null
        ? String(suggestedGrade)
        : '';
  const [grade, setGrade] = useState(initialGrade);
  const [feedback, setFeedback] = useState(submission.instructorFeedback || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setGrade(initialGrade);
    setFeedback(submission.instructorFeedback || '');
    setError('');
  }, [submission._id, submission.grade, submission.instructorFeedback, initialGrade]);

  const isGraded = submission.status === 'graded';
  const maxLabel = maxScore != null ? ` / ${maxScore}` : ' (0–100)';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = String(grade).trim();
    if (trimmed === '') {
      setError('Enter a grade');
      return;
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      setError('Grade must be a number');
      return;
    }
    const ceiling = maxScore != null ? maxScore : 100;
    if (num < 0 || num > ceiling) {
      setError(`Grade must be between 0 and ${ceiling}`);
      return;
    }
    setError('');
    onSave({ grade: num, instructorFeedback: feedback.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161616] p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/45">
          Instructor grade
        </p>
        {isGraded && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            Saved
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`grade-${submission._id}`}
            className="block text-[12px] font-bold text-gray-600 dark:text-white/55 mb-1.5"
          >
            Score{maxLabel}
          </label>
          <div className="relative">
            <input
              id={`grade-${submission._id}`}
              type="number"
              inputMode="decimal"
              min={0}
              max={maxScore != null ? maxScore : 100}
              step="any"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                if (error) setError('');
              }}
              placeholder={suggestedGrade != null ? String(suggestedGrade) : '0'}
              disabled={saving}
              className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-4 pr-14 text-gray-900 dark:text-white text-[15px] font-bold tabular-nums placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:border-primary-pink/50 focus:ring-2 focus:ring-primary-pink/20 transition-all disabled:opacity-60"
            />
            {maxScore != null && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-white/35">
                / {maxScore}
              </span>
            )}
          </div>
        </div>
        {suggestedGrade != null && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setGrade(String(suggestedGrade));
              setError('');
            }}
            className="shrink-0 text-[11px] font-bold px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
          >
            Use auto score
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor={`feedback-${submission._id}`}
          className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 dark:text-white/55 mb-1.5"
        >
          <MessageSquare size={12} />
          Feedback <span className="font-medium text-gray-400 dark:text-white/30">(optional)</span>
        </label>
        <textarea
          id={`feedback-${submission._id}`}
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={saving}
          placeholder="Notes for the learner…"
          className="w-full resize-y min-h-[64px] max-h-40 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:border-primary-pink/50 focus:ring-2 focus:ring-primary-pink/20 transition-all disabled:opacity-60"
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-0.5">
        <Button
          type="submit"
          size="sm"
          isLoading={saving}
          disabled={saving}
          className="rounded-xl gap-1.5 !px-5 !py-2 text-[12px] tracking-wide"
        >
          {!saving && <Check size={14} strokeWidth={2.5} />}
          {isGraded ? 'Update grade' : 'Save grade'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Calculate auto-grade for a quiz submission. Returns { earned, total, percentage } or null.
 */
function calculateQuizGrade(parsedAnswers, questions) {
  if (
    !parsedAnswers ||
    parsedAnswers.type !== 'quiz' ||
    !Array.isArray(parsedAnswers.answers) ||
    !Array.isArray(questions) ||
    questions.length === 0
  ) {
    return null;
  }
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
      if (correct.length === submitted.length && correct.every((c, i) => c === submitted[i])) {
        earned += marks;
      }
    }
  }
  if (total === 0) return null;
  const percentage = Math.round((earned / total) * 100);
  return { earned, total, percentage };
}

function instructorCardMeta(assignment, status) {
  const submitted = Number(assignment.submissions ?? 0);
  const enrolled = Number(assignment.totalEnrolled ?? 0);
  const submissionLabel =
    enrolled > 0 ? `${submitted}/${enrolled} submitted` : `${submitted} submitted`;

  if (assignment.dueDate) {
    if (status === 'needs_grading') {
      return `${formatDueMeta(assignment.dueDate)} · ${submissionLabel}`;
    }
    return `${formatDueMeta(assignment.dueDate)} · ${submissionLabel}`;
  }

  if (assignment.chapterTitle) {
    return `${assignment.chapterTitle} · ${submissionLabel}`;
  }
  return submissionLabel;
}

/**
 * Assignment Responses tab: list UI aligned with learner Assignments page.
 */
const AssignmentResponsesTab = () => {
  const { id: courseId } = useParams();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingId, setGradingId] = useState(null);

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && e.target?.tagName !== 'INPUT' && e.target?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('instructor-assignment-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadSubmissions = useCallback(
    async (contentId) => {
      if (!courseId || !contentId) return;
      setSubmissionsLoading(true);
      try {
        const res = await courseService.getAssignmentSubmissions(courseId, contentId);
        setSubmissions(res?.data?.submissions ?? res?.submissions ?? []);
        setSelectedAssignment(
          res?.data?.assignment ?? res?.assignment ?? { title: 'Assignment', _id: contentId },
        );
      } catch {
        setSubmissions([]);
        setSelectedAssignment(null);
      } finally {
        setSubmissionsLoading(false);
      }
    },
    [courseId],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAssignments().finally(() => setIsRefreshing(false));
  };

  const openSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    loadSubmissions(assignment.contentId || assignment.id);
  };

  const handleGradeSave = async (submissionId, payload) => {
    if (!courseId || !submissionId) return;
    setGradingId(submissionId);
    try {
      const updated = await courseService.gradeSubmission(courseId, submissionId, payload);
      const gradeNum = Number(updated?.grade ?? payload.grade);
      const passedNow = Number.isFinite(gradeNum) ? gradeNum >= 40 : false;
      setSubmissions((prev) =>
        prev.map((s) => {
          if (String(s._id) !== String(submissionId)) return s;
          const prevEval =
            (updated?.latestEvaluation && typeof updated.latestEvaluation === 'object'
              ? updated.latestEvaluation
              : null) ||
            (s.latestEvaluation && typeof s.latestEvaluation === 'object'
              ? s.latestEvaluation
              : null) ||
            {};
          const totalMarks = Number(prevEval.totalMarks) || 0;
          return {
            ...s,
            ...updated,
            grade: Number.isFinite(gradeNum) ? gradeNum : s.grade,
            instructorFeedback:
              updated?.instructorFeedback ?? payload.instructorFeedback,
            status: 'graded',
            passed: passedNow,
            gradedBy: updated?.gradedBy ?? s.gradedBy ?? true,
            gradedAt: updated?.gradedAt ?? new Date().toISOString(),
            latestEvaluation: {
              ...prevEval,
              percentage: Number.isFinite(gradeNum) ? gradeNum : prevEval.percentage,
              passed: passedNow,
              passingPercentage: 40,
              instructorGraded: true,
              ...(totalMarks > 0 && Number.isFinite(gradeNum)
                ? { earnedMarks: Math.round((gradeNum / 100) * totalMarks) }
                : {}),
            },
          };
        }),
      );
      toast?.success?.('Grade saved', 'The learner can see the updated grade.');
      loadAssignments();
    } catch (err) {
      toast?.error?.(
        'Could not save grade',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setGradingId(null);
    }
  };

  const dateFiltered = useMemo(() => {
    return assignments.filter((asm) => {
      if (!asm.dueDate) return true;
      const due = new Date(asm.dueDate);
      if (Number.isNaN(due.getTime())) return true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (due < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (due > end) return false;
      }
      return true;
    });
  }, [assignments, startDate, endDate]);

  const buckets = useMemo(() => {
    const active = [];
    const toGrade = [];
    const past = [];
    for (const a of dateFiltered) {
      const status = resolveInstructorStatus(a);
      if (status === 'needs_grading') toGrade.push(a);
      else if (status === 'all_graded' || status === 'closed') past.push(a);
      else active.push(a);
    }
    // When graded counts aren't available, "To Grade" holds submitted work;
    // keep a copy of those in Active empty — Active = no submissions yet.
    return { active, toGrade, past };
  }, [dateFiltered]);

  const tabItems =
    activeTab === 'to_grade'
      ? buckets.toGrade
      : activeTab === 'past'
        ? buckets.past
        : buckets.active;

  const filtered = useMemo(
    () => filterBySearch(tabItems, searchQuery),
    [tabItems, searchQuery],
  );

  const sections = useMemo(() => {
    if (activeTab === 'to_grade') {
      return filtered.length
        ? [{ key: 'to-grade', label: 'Needs grading', items: filtered }]
        : [];
    }
    if (activeTab === 'past') {
      return filtered.length
        ? [{ key: 'past', label: 'Past assignments', items: filtered }]
        : [];
    }
    return groupInstructorAssignments(filtered);
  }, [filtered, activeTab]);

  const tabs = [
    { id: 'active', label: 'Active', count: buckets.active.length },
    { id: 'to_grade', label: 'To Grade', count: buckets.toGrade.length },
    { id: 'past', label: 'Past', count: buckets.past.length },
  ];

  const handleExport = () => {
    toast?.info?.('Export', `Exporting ${filtered.length} assignments to CSV...`);
  };

  const dateRangeControl = (
    <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2 gap-3 focus-within:border-primary-pink/30 transition-all duration-300 shadow-sm dark:shadow-none">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="bg-transparent text-xs font-bold text-gray-500 dark:text-white/40 outline-none w-[110px] dark:[color-scheme:dark] transition-colors duration-300"
      />
      <ChevronRight size={14} className="text-gray-400 dark:text-white/10" />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="bg-transparent text-xs font-bold text-gray-500 dark:text-white/40 outline-none w-[110px] dark:[color-scheme:dark] transition-colors duration-300"
      />
      <Calendar size={16} className="text-gray-400 dark:text-white/40 ml-2" />
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
      <ContentCard
        title="Assignments"
        subtitle="Track learner submissions and performance across course assignments."
        variant="flat"
        headerRight={dateRangeControl}
        className="flex-1 min-h-0 min-w-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'With submissions',
              value: assignments.filter((a) => (a.submissions || 0) > 0).length,
            },
            {
              label: 'Total Submissions',
              value: assignments.reduce((a, b) => a + (b.submissions || 0), 0),
            },
            { label: 'Assignments', value: assignments.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 p-5 space-y-2 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-500 dark:text-white/60">
                  {stat.label}
                </span>
                <HelpCircle size={14} className="text-gray-400 dark:text-white/20" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <AssignmentListShell
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by assignment title"
          searchInputId="instructor-assignment-search"
          headerExtra={
            <div className="flex items-center gap-2 pb-3">
              <Button
                variant="secondary"
                onClick={handleRefresh}
                className={`p-2.5 rounded-xl text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all h-auto bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 ${
                  isRefreshing ? 'animate-spin text-primary-pink' : ''
                }`}
              >
                <RefreshCw size={18} />
              </Button>
              <Button
                variant="secondary"
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest h-auto border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5"
              >
                <Download size={14} /> Export
              </Button>
            </div>
          }
        >
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500 dark:text-white/50">
              Loading assignments…
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
              <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4" />
              <p className="text-gray-600 dark:text-white/60 font-medium">No assignments yet</p>
              <p className="text-xs text-gray-500 dark:text-white/30 mt-1">
                Add quiz/assignment content in the Curriculum tab to see them here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-white/45">
              {searchQuery
                ? 'No assignments match your search.'
                : activeTab === 'to_grade'
                  ? 'Nothing waiting to be graded.'
                  : activeTab === 'past'
                    ? 'No past assignments in this range.'
                    : 'No active assignments.'}
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => (
                <AssignmentSection key={section.key} label={section.label}>
                  {section.items.map((asm) => {
                    const status = resolveInstructorStatus(asm);
                    const id = asm.id || asm.contentId;
                    return (
                      <AssignmentListCard
                        key={id}
                        title={asm.title}
                        status={status}
                        meta={instructorCardMeta(asm, status)}
                        onClick={() => openSubmissions(asm)}
                        rightSlot={
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-pink">
                            <Eye size={14} /> View
                          </span>
                        }
                      />
                    );
                  })}
                </AssignmentSection>
              ))}
            </div>
          )}
        </AssignmentListShell>
      </ContentCard>

      {selectedAssignment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedAssignment(null)}
        >
          <div
            className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col font-satoshi"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedAssignment.title} – Submissions
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {submissionsLoading ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-white/50">
                  Loading submissions…
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-white/50">
                  No submissions yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => {
                    let parsedSub = null;
                    try {
                      parsedSub =
                        typeof sub.submissionText === 'string'
                          ? JSON.parse(sub.submissionText)
                          : null;
                    } catch {
                      parsedSub = null;
                    }
                    const autoGrade =
                      parsedSub && selectedAssignment?.questions?.length
                        ? calculateQuizGrade(parsedSub, selectedAssignment.questions)
                        : null;
                    const evaluated = sub.latestEvaluation || null;
                    const score = evaluated
                      ? {
                          earned: evaluated.earnedMarks,
                          total: evaluated.totalMarks,
                          percentage: evaluated.percentage,
                        }
                      : autoGrade;
                    const passMark = 40;
                    const effectivePct =
                      sub.grade != null && Number.isFinite(Number(sub.grade))
                        ? Number(sub.grade)
                        : score?.percentage != null
                          ? Number(score.percentage)
                          : null;
                    const isPassed =
                      effectivePct != null ? effectivePct >= passMark : null;
                    const isManuallyGraded = Boolean(sub.gradedBy) || (
                      sub.status === 'graded' && sub.instructorFeedback
                    );
                    const statusBadge =
                      sub.status === 'graded'
                        ? isManuallyGraded
                          ? {
                              label: 'Graded',
                              className:
                                'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                            }
                          : {
                              label: 'Auto-graded',
                              className:
                                'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                            }
                        : {
                            label: 'Needs grading',
                            className:
                              'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300',
                          };
                    // Server stores grade as percentage for quizzes; use that scale for the input.
                    const suggestedGrade =
                      sub.grade != null && Number.isFinite(Number(sub.grade))
                        ? Number(sub.grade)
                        : score?.percentage != null
                          ? score.percentage
                          : null;
                    const maxScore = 100;

                    return (
                      <div
                        key={sub._id}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {sub.user?.userName || sub.user?.userEmail || 'Learner'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                              Submitted{' '}
                              {sub.submittedAt
                                ? new Date(sub.submittedAt).toLocaleString()
                                : '—'}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {sub.attemptCount != null && (
                                <span className="text-[11px] font-bold px-2 py-1 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/70">
                                  Attempt {sub.attemptCount}
                                </span>
                              )}
                              {effectivePct != null && (
                                <span
                                  className={`text-[11px] font-bold px-2 py-1 rounded ${
                                    isPassed
                                      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                                      : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                                  }`}
                                >
                                  {isPassed ? 'Passed' : 'Failed'}
                                </span>
                              )}
                            </div>
                            {score != null && (
                              <div className="mt-2 inline-flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-gray-600 dark:text-white/60 flex items-center gap-1">
                                  <Calculator size={14} /> Auto score: {score.earned}/
                                  {score.total} ({score.percentage}%)
                                </span>
                              </div>
                            )}
                            {(sub.submissionText || sub.submissionFileUrl) && (
                              <div className="mt-2 text-sm text-gray-700 dark:text-white/80 border-l-2 border-primary-pink/30 pl-3 space-y-2">
                                {(() => {
                                  let parsed;
                                  try {
                                    parsed =
                                      typeof sub.submissionText === 'string'
                                        ? JSON.parse(sub.submissionText)
                                        : null;
                                  } catch {
                                    parsed = null;
                                  }
                                  if (
                                    parsed &&
                                    parsed.type === 'quiz' &&
                                    Array.isArray(parsed.answers) &&
                                    selectedAssignment?.questions?.length
                                  ) {
                                    const questions = selectedAssignment.questions;
                                    return parsed.answers.map((a, i) => {
                                      const q = questions[a.questionIndex];
                                      if (!q) {
                                        return (
                                          <p key={i}>Question {a.questionIndex + 1}: —</p>
                                        );
                                      }
                                      let answerLabel = '—';
                                      if (
                                        a.single != null &&
                                        q.options &&
                                        q.options[a.single] != null
                                      ) {
                                        answerLabel = q.options[a.single];
                                      } else if (Array.isArray(a.multiple) && q.options) {
                                        answerLabel = a.multiple
                                          .map((idx) => q.options[idx])
                                          .filter(Boolean)
                                          .join(', ');
                                      } else if (a.subjective != null && a.subjective !== '') {
                                        answerLabel = a.subjective;
                                      }
                                      return (
                                        <div key={i} className="py-1">
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {a.questionIndex + 1}. {q.question}
                                          </p>
                                          <p className="text-gray-600 dark:text-white/70 mt-0.5">
                                            → {answerLabel}
                                          </p>
                                        </div>
                                      );
                                    });
                                  }
                                  return (
                                    <p className="whitespace-pre-wrap">
                                      {sub.submissionText ||
                                        (sub.submissionFileUrl
                                          ? `File: ${sub.submissionFileUrl}`
                                          : '—')}
                                    </p>
                                  );
                                })()}
                                {sub.submissionFileUrl &&
                                  !sub.submissionText?.includes('"type":"quiz"') && (
                                    <p className="mt-1 text-gray-600 dark:text-white/60">
                                      File: {sub.submissionFileUrl}
                                    </p>
                                  )}
                              </div>
                            )}

                            <SubmissionGradePanel
                              submission={sub}
                              suggestedGrade={suggestedGrade}
                              maxScore={maxScore}
                              saving={String(gradingId) === String(sub._id)}
                              onSave={(payload) => handleGradeSave(sub._id, payload)}
                            />
                          </div>
                          <div className="shrink-0 flex flex-col gap-2">
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusBadge.className}`}
                            >
                              {statusBadge.label}
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
