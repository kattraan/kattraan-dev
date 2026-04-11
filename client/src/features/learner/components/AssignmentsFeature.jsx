import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Circle, CheckCircle2, XCircle, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMyAssignments, submitAssignment } from '@/features/learner/services/learnerAssignmentsService';

const AssignmentsFeature = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [retestForId, setRetestForId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleUpload = (id) => {
    setSelectedId(selectedId === id ? null : id);
    setSubmissionText('');
    setQuizAnswers({});
    setSubmitError('');
    if (selectedId === id) setRetestForId(null);
  };

  const setMcqAnswer = (questionIndex, type, value) => {
    setQuizAnswers((prev) => {
      const next = { ...prev };
      if (type === 'single') next[questionIndex] = { single: value };
      else if (type === 'multiple') {
        const current = prev[questionIndex]?.multiple || [];
        const set = new Set(current);
        if (set.has(value)) set.delete(value);
        else set.add(value);
        next[questionIndex] = { multiple: [...set].sort((a, b) => a - b) };
      } else next[questionIndex] = { subjective: value };
      return next;
    });
  };

  const handleSubmit = async (assignment) => {
    const contentId = assignment.contentId || assignment._id;
    if (!contentId) return;
    const isMcq = assignment.questions?.length > 0;
    const payload = isMcq
      ? {
          submissionText: JSON.stringify({
            type: 'quiz',
            answers: Object.entries(quizAnswers).map(([qi, v]) => ({
              questionIndex: Number(qi),
              ...v,
            })),
          }),
          submissionFileUrl: undefined,
        }
      : {
          submissionText: submissionText.trim() || undefined,
          submissionFileUrl: undefined,
        };
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitAssignment(contentId, payload);
      await load();
      setSelectedId(contentId);
      setSubmissionText('');
      setQuizAnswers({});
      setRetestForId(null);
    } catch (e) {
      setSubmitError(e?.response?.data?.message || e?.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const getResult = (assignment) => assignment?.submission?.latestEvaluation || null;
  const formatIndexesAsOptionText = (indexes = [], optionTexts = []) => {
    if (!Array.isArray(indexes) || indexes.length === 0) return 'Not answered';
    return indexes
      .map((idx) => {
        const label = optionTexts?.[idx];
        return label ? `(${idx + 1}) ${label}` : `Option ${idx + 1}`;
      })
      .join(' | ');
  };

  const statusStyle = (status) => {
    if (status === 'Submitted' || status === 'Graded') return 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400';
    if (status === 'Late') return 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400';
    return 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400';
  };

  const dueDateLabel = (assignment) => {
    if (!assignment.dueDate) return 'No due date';
    const d = new Date(assignment.dueDate);
    const now = new Date();
    if (d < now) return 'Overdue';
    return `Due ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const pending = assignments.filter((a) => a.status !== 'Submitted' && a.status !== 'Graded');

  return (
    <DashboardLayout title="Assignments" subtitle="Submit your work and get instructor feedback.">
      <div className="space-y-10 font-satoshi">
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-white/50">Loading assignments…</div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
            <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4" />
            <p className="text-gray-600 dark:text-white/60 font-medium">No assignments yet</p>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Assignments from your enrolled courses will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {assignments.map((assignment) => {
                const isOpen = selectedId === (assignment.contentId || assignment._id);
                const status = assignment.status || 'Pending';
                const isSubmitted = status === 'Submitted' || status === 'Graded';
                const result = getResult(assignment);
                const hasScore = !!result;
                const isPassed = !!result?.passed;
                const canRetest = !!assignment.quizSettings?.allowRetake;
                const isRetesting = retestForId === (assignment.contentId || assignment._id);
                const lockedRetake = isSubmitted && hasScore && !isPassed && !canRetest;
                return (
                  <div
                    key={assignment.contentId || assignment._id}
                    className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-6 rounded-3xl hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 shadow-sm dark:shadow-none group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                            {assignment.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusStyle(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:flex gap-6 text-sm text-gray-500 dark:text-white/60 font-medium transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {assignment.courseTitle || assignment.course}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {dueDateLabel(assignment)}
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {assignment.points ?? 100} Points
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-end">
                        {isSubmitted ? (
                          hasScore ? (
                            <Button
                              onClick={() => handleToggleUpload(assignment.contentId || assignment._id)}
                              className="w-full md:w-auto px-8 bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 text-white transition-all duration-300"
                            >
                              {isOpen ? 'Hide score' : 'View score'}
                            </Button>
                          ) : (
                          <div className="flex items-center gap-2 text-green-500 font-bold px-4 py-2 bg-green-50 dark:bg-green-500/10 rounded-xl transition-colors duration-300">
                            <CheckCircle size={18} />
                            {status === 'Graded' && assignment.submission?.grade != null
                              ? `Graded: ${assignment.submission.grade}`
                              : 'Under Review'}
                          </div>
                          )
                        ) : (
                          <Button
                            onClick={() => handleToggleUpload(assignment.contentId || assignment._id)}
                            className="w-full md:w-auto px-8 bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 text-white transition-all duration-300"
                          >
                            <Upload size={18} className="mr-2 inline" />
                            {isOpen ? 'Cancel' : 'Upload Works'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-8 p-6 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl bg-gray-50 dark:bg-black/20">
                        {assignment.questions?.length > 0 && isSubmitted && hasScore && !isRetesting ? (
                          <>
                            <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isPassed ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'}`}>
                                  {isPassed ? 'Passed' : 'Failed'}
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  Score: {result.earnedMarks}/{result.totalMarks} ({result.percentage}%)
                                </span>
                                {result.enforcePassingGrade && (
                                  <span className="text-xs text-gray-500 dark:text-white/50">
                                    Pass mark: {result.passingPercentage}%
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-white/50">
                                  Attempt: {assignment.submission?.attemptCount || 1}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4 mb-6">
                              {(result.questions || []).map((qResult, idx) => (
                                <div key={`${assignment.contentId}-result-${idx}`} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {idx + 1}. {qResult.question}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                                        Marks: {qResult.earnedMarks}/{qResult.marks}
                                      </p>
                                      {qResult.type !== 'subjective' && (
                                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                                          Your answer: {formatIndexesAsOptionText(qResult.selectedOptionIndexes || [], qResult.optionTexts || [])}
                                          {' '}|{' '}
                                          Correct: {formatIndexesAsOptionText(qResult.correctOptionIndexes || [], qResult.optionTexts || [])}
                                        </p>
                                      )}
                                    </div>
                                    {qResult.isCorrect === true ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : qResult.isCorrect === false ? (
                                      <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-gray-400 dark:text-white/30" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {!isPassed && canRetest && (
                              <Button
                                onClick={() => {
                                  setQuizAnswers({});
                                  setSubmitError('');
                                  setRetestForId(assignment.contentId || assignment._id);
                                }}
                                className="bg-primary-pink text-white hover:opacity-90"
                              >
                                Start Retest
                              </Button>
                            )}
                            {lockedRetake && (
                              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/80 text-sm font-semibold">
                                <Lock size={15} />
                                Retake disabled by instructor
                              </div>
                            )}
                          </>
                        ) : assignment.questions?.length > 0 ? (
                          <>
                            <p className="text-sm font-bold text-gray-700 dark:text-white/80 mb-4">Answer the following questions:</p>
                            <div className="space-y-6 mb-6">
                              {assignment.questions.map((q, qIdx) => (
                                <div key={qIdx} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                                    {qIdx + 1}. {q.question}
                                    {q.marks != null && <span className="text-gray-500 dark:text-white/50 font-normal ml-1">({q.marks} {q.marks === 1 ? 'point' : 'points'})</span>}
                                  </p>
                                  {q.type === 'single' && (
                                    <div className="space-y-2">
                                      {(q.options || []).map((opt, oIdx) => (
                                        <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                                          <input
                                            type="radio"
                                            name={`q-${assignment.contentId}-${qIdx}`}
                                            checked={(quizAnswers[qIdx]?.single) === oIdx}
                                            onChange={() => setMcqAnswer(qIdx, 'single', oIdx)}
                                            className="sr-only"
                                          />
                                          <span className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/30 group-hover:border-primary-pink/50">
                                            {(quizAnswers[qIdx]?.single) === oIdx ? <CheckCircle2 size={14} className="text-primary-pink" /> : <Circle size={14} className="text-gray-400 dark:text-white/30" />}
                                          </span>
                                          <span className="text-sm text-gray-700 dark:text-white/80">{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {q.type === 'multiple' && (
                                    <div className="space-y-2">
                                      {(q.options || []).map((opt, oIdx) => (
                                        <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                                          <input
                                            type="checkbox"
                                            checked={(quizAnswers[qIdx]?.multiple || []).includes(oIdx)}
                                            onChange={() => setMcqAnswer(qIdx, 'multiple', oIdx)}
                                            className="w-4 h-4 rounded border-gray-300 dark:border-white/30 text-primary-pink focus:ring-primary-pink/30"
                                          />
                                          <span className="text-sm text-gray-700 dark:text-white/80">{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {q.type === 'subjective' && (
                                    <textarea
                                      placeholder="Type your answer..."
                                      value={quizAnswers[qIdx]?.subjective ?? ''}
                                      onChange={(e) => setMcqAnswer(qIdx, 'subjective', e.target.value)}
                                      rows={3}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-pink/30"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <Button
                              onClick={() => handleSubmit(assignment)}
                              disabled={submitting}
                              className="bg-primary-pink text-white hover:opacity-90"
                            >
                              {submitting ? 'Submitting…' : (hasScore && !isPassed ? 'Submit retest' : 'Submit answers')}
                            </Button>
                            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
                          </>
                        ) : (
                          <>
                            <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Your submission (text)</label>
                            <textarea
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              placeholder="Describe your work or paste your response here..."
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-pink/30 mb-4"
                            />
                            <p className="text-xs text-gray-500 dark:text-white/40 mb-4">
                              PDF, ZIP, or other files: upload elsewhere and paste the link in the box above, or ask your instructor.
                            </p>
                            <Button
                              onClick={() => handleSubmit(assignment)}
                              disabled={submitting}
                              className="bg-primary-pink text-white hover:opacity-90"
                            >
                              {submitting ? 'Submitting…' : 'Submit'}
                            </Button>
                            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
                          </>
                        )}
                      </div>
                    )}

                    {assignment.submission?.instructorFeedback && (
                      <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-1">Instructor feedback</p>
                        <p className="text-sm text-gray-700 dark:text-white/80">{assignment.submission.instructorFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-orange-500 w-5 h-5" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Pending Tasks</h2>
                </div>
                <div className="space-y-4">
                  {pending.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-white/40">No pending assignments.</p>
                  ) : (
                    pending.slice(0, 5).map((a) => (
                      <div
                        key={a.contentId || a._id}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 transition-colors duration-300"
                      >
                        <p className="text-gray-900 dark:text-white text-sm font-bold mb-1 transition-colors duration-300">{a.title}</p>
                        <p className="text-orange-600 dark:text-orange-400 text-xs font-bold transition-colors duration-300">{dueDateLabel(a)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentsFeature;
