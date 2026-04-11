import React, { useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Circle,
  Square,
  CheckSquare,
  Loader2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import {
  submitAssignment,
  getAssignmentRowByContentId,
} from '@/features/learner/services/learnerAssignmentsService';

function buildSubmissionText(answers, questions) {
  const answersArr = questions.map((q, qIdx) => {
    const raw = answers[qIdx];
    if (q.type === 'multiple') {
      return {
        questionIndex: qIdx,
        multiple: Array.isArray(raw) ? [...raw].sort((a, b) => a - b) : [],
      };
    }
    if (q.type === 'subjective') {
      return {
        questionIndex: qIdx,
        subjective: typeof raw === 'string' ? raw : '',
      };
    }
    return { questionIndex: qIdx, single: raw };
  });
  return JSON.stringify({ type: 'quiz', answers: answersArr });
}

function formatOptionLabels(indexes, optionTexts) {
  if (!Array.isArray(indexes) || indexes.length === 0) return '—';
  return indexes
    .map((idx) => {
      const t = optionTexts?.[idx];
      return t ? `${idx + 1}. ${t}` : `Option ${idx + 1}`;
    })
    .join(' · ');
}

function ScoreSummaryRing({ pct, passed }) {
  const size = 128;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(100, pct));
  const offset = c - (dash / 100) * c;
  const strokeColor = passed ? 'rgb(52 211 153)' : 'rgb(251 191 36)';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-1">
        <span className="text-[26px] sm:text-[28px] font-black tabular-nums leading-none tracking-tight whitespace-nowrap">
          {pct}
          <span className="text-[0.65em] font-extrabold text-white/50">%</span>
        </span>
      </div>
    </div>
  );
}

function QuizResultsView({
  evaluation,
  attemptCount,
  onRetake,
  sourceQuestions = [],
  /** From current quiz content metadata (stored evaluation can be stale on retake flag). */
  allowRetakeEnabled = false,
}) {
  const pct = evaluation?.percentage ?? 0;
  const earned = evaluation?.earnedMarks ?? 0;
  const total = evaluation?.totalMarks ?? 0;
  const passed = !!evaluation?.passed;
  const passLine = evaluation?.passingPercentage ?? 0;
  const canRetake = !!allowRetakeEnabled;
  const hasSubjective = !!evaluation?.hasSubjective;
  const evaluated = Array.isArray(evaluation?.questions) ? evaluation.questions : [];
  const marksBarPct = total > 0 ? Math.round((earned / total) * 100) : 0;

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col rounded-none border border-white/10 bg-gradient-to-b from-[#141414] via-[#0f0f0f] to-[#0a0a0a] text-white overflow-hidden">
      <div className="shrink-0 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6 bg-gradient-to-br from-white/[0.04] to-transparent">
        <div className="mx-auto max-w-4xl flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 min-w-0">
            <ScoreSummaryRing pct={pct} passed={passed} />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2 gap-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Results</p>
                {attemptCount > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/50">
                    Attempt {attemptCount}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Quiz complete</h3>
                <span
                  className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                    passed
                      ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/35'
                  }`}
                >
                  {passed ? 'Passed' : 'Not passed'}
                </span>
              </div>
              <div className="space-y-2 max-w-xl">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-white/50">
                    Marks earned
                    {passLine > 0 ? (
                      <span className="text-white/35"> · Pass requires {passLine}%</span>
                    ) : null}
                  </span>
                  <span className="font-bold tabular-nums text-white/90">
                    {earned} <span className="text-white/35 font-semibold">/</span> {total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      passed
                        ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-400'
                        : 'bg-gradient-to-r from-amber-600/90 to-amber-400'
                    }`}
                    style={{ width: `${marksBarPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          {canRetake ? (
            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0 lg:pl-4">
              <p className="text-xs text-white/45 text-center sm:text-right max-w-[220px] sm:max-w-[200px] leading-snug">
                Another attempt is allowed. Your latest score stays on record.
              </p>
              <button
                type="button"
                onClick={onRetake}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white btn-gradient shadow-lg shadow-pink-500/15 transition hover:opacity-95"
              >
                <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                Retake quiz
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto max-w-4xl space-y-4 pb-4">
          {hasSubjective && (
            <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/55">
              Written responses may be reviewed by your instructor and are not auto-scored here.
            </p>
          )}
          <p className="text-[13px] font-semibold text-white/45">Question review</p>
          <ul className="space-y-4">
            {evaluated.map((q) => {
              const status =
                q.isCorrect === true ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/12 px-2 py-1 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Correct
                  </span>
                ) : q.isCorrect === false ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/12 px-2 py-1 text-amber-300 text-xs font-bold">
                    <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Incorrect
                  </span>
                ) : (
                  <span className="inline-flex rounded-lg bg-white/[0.06] px-2 py-1 text-xs font-semibold text-white/45">
                    Pending review
                  </span>
                );
              const src = sourceQuestions[q.questionIndex];
              const explanation =
                typeof src?.explanation === 'string' && src.explanation.trim()
                  ? src.explanation.trim()
                  : null;
              const isMcq = q.type !== 'subjective';
              const yourAns = formatOptionLabels(q.selectedOptionIndexes, q.optionTexts);
              const correctAns = formatOptionLabels(q.correctOptionIndexes, q.optionTexts);

              return (
                <li
                  key={q.questionIndex}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-[15px] font-semibold leading-snug text-white/92 pr-2 flex-1 min-w-[12rem]">
                      {q.question}
                    </p>
                    {status}
                  </div>
                  {q.marks != null && (
                    <p className="mt-2 text-xs text-white/35">
                      {q.earnedMarks ?? 0} / {q.marks} pt{q.marks !== 1 ? 's' : ''} awarded
                    </p>
                  )}
                  {isMcq && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1.5">
                          Your answer
                        </p>
                        <p className="text-sm leading-relaxed text-white/85">{yourAns}</p>
                      </div>
                      <div
                        className={`rounded-xl border px-3 py-3 ${
                          q.isCorrect
                            ? 'border-emerald-500/25 bg-emerald-500/[0.07]'
                            : 'border-white/[0.12] bg-white/[0.04]'
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1.5">
                          Correct answer
                        </p>
                        <p className="text-sm leading-relaxed text-white/90">{correctAns}</p>
                      </div>
                    </div>
                  )}
                  {explanation && (
                    <p className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[13px] leading-relaxed text-white/55">
                      <span className="font-semibold text-white/45">Note: </span>
                      {explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {!canRetake && (
        <div className="shrink-0 border-t border-white/10 bg-black/40 backdrop-blur-sm px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-sm font-semibold text-white/75">Retakes are off for this quiz</p>
            <p className="mt-1 text-sm text-white/45 leading-relaxed">
              Your instructor has not enabled additional attempts. If you need another try, contact them through the course Q&A.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Lesson quiz in the course player: submits to learner assignments API for server-side scoring; supports retake when allowed.
 */
export default function CourseWatchQuizPanel({
  contentId,
  chapterTitle,
  quizContent,
  isLoading = false,
  watchChapterId,
  onQuizSubmitted,
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('taking');
  const [evaluation, setEvaluation] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const quizId = quizContent?._id || quizContent?.id || '';
  const questions = Array.isArray(quizContent?.questions) ? quizContent.questions : [];
  const total = questions.length;
  const current = questions[step];

  const resetTakingState = useCallback(() => {
    setStep(0);
    setAnswers({});
    setSubmitError('');
    setPhase('taking');
  }, []);

  useEffect(() => {
    resetTakingState();
    setEvaluation(null);
    setAttemptCount(0);
    setSubmissionLoading(true);
  }, [quizId, resetTakingState]);

  useEffect(() => {
    if (!quizId) {
      setSubmissionLoading(false);
      return;
    }
    if (isLoading) return;
    let cancelled = false;
    setSubmissionLoading(true);
    getAssignmentRowByContentId(quizId)
      .then((row) => {
        if (cancelled) return;
        const sub = row?.submission;
        const ev = sub?.latestEvaluation;
        setAttemptCount(sub?.attemptCount || 0);
        if (ev && typeof ev === 'object') {
          setEvaluation(ev);
          setPhase('results');
        } else {
          setEvaluation(null);
          setPhase('taking');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvaluation(null);
          setPhase('taking');
        }
      })
      .finally(() => {
        if (!cancelled) setSubmissionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quizId, isLoading]);

  const progressPct = total > 0 ? Math.round(((step + 1) / total) * 100) : 0;

  const hasAnswerForStep = useCallback(
    (idx) => {
      const q = questions[idx];
      if (!q) return false;
      const a = answers[idx];
      if (q.type === 'multiple') {
        return Array.isArray(a) && a.length > 0;
      }
      if (q.type === 'subjective') {
        return typeof a === 'string' && a.trim().length > 0;
      }
      return a !== undefined && a !== null;
    },
    [answers, questions],
  );

  const handleSelect = useCallback(
    (optIdx) => {
      if (!current) return;
      if (current.type === 'multiple') {
        setAnswers((prevAns) => {
          const prev = Array.isArray(prevAns[step]) ? prevAns[step] : [];
          const next = prev.includes(optIdx)
            ? prev.filter((i) => i !== optIdx)
            : [...prev, optIdx];
          return { ...prevAns, [step]: next };
        });
      } else {
        setAnswers((prevAns) => ({ ...prevAns, [step]: optIdx }));
      }
    },
    [current, step],
  );

  const handleSubjectiveChange = useCallback((value) => {
    setAnswers((prevAns) => ({ ...prevAns, [step]: value }));
  }, [step]);

  const isSelected = useCallback(
    (optIdx) => {
      const a = answers[step];
      if (current?.type === 'multiple') return Array.isArray(a) && a.includes(optIdx);
      return a === optIdx;
    },
    [answers, step, current],
  );

  const handleSubmitQuiz = useCallback(async () => {
    if (!contentId || total === 0) return;
    for (let i = 0; i < total; i += 1) {
      if (!hasAnswerForStep(i)) return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const submissionText = buildSubmissionText(answers, questions);
      const data = await submitAssignment(contentId, { submissionText });
      const ev = data?.latestEvaluation;
      if (ev && typeof ev === 'object') {
        setEvaluation(ev);
        if (typeof data?.attemptCount === 'number') {
          setAttemptCount(data.attemptCount);
        }
        setPhase('results');
        onQuizSubmitted?.({
          chapterId: watchChapterId,
          grade: data?.grade ?? ev?.percentage,
          passed: data?.passed ?? ev?.passed,
        });
      } else {
        setSubmitError('Could not read results. Please try again.');
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || 'Failed to submit quiz.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    contentId,
    total,
    answers,
    questions,
    hasAnswerForStep,
    watchChapterId,
    onQuizSubmitted,
  ]);

  const goNext = useCallback(() => {
    if (step >= total - 1) {
      handleSubmitQuiz();
      return;
    }
    setStep((s) => s + 1);
  }, [step, total, handleSubmitQuiz]);

  const goPrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const handleRetake = useCallback(() => {
    resetTakingState();
    setSubmitError('');
  }, [resetTakingState]);

  if (isLoading || submissionLoading) {
    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-none bg-[#0a0a0a] text-white">
        <div
          className="relative flex flex-col items-center justify-center py-16"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-10 w-10 animate-spin text-white/40" aria-hidden />
          <p className="mt-4 text-sm font-medium text-white/50">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (!quizContent || total === 0) {
    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 rounded-none border border-white/10 bg-[#111] px-8 py-16 text-center">
          <ClipboardList className="h-12 w-12 text-white/25" aria-hidden />
          <div>
            <p className="text-lg font-semibold text-white/90">{chapterTitle || 'Quiz'}</p>
            <p className="mt-2 max-w-md text-sm text-white/45">
              No questions are available for this quiz yet. Continue with the rest of the course or check back later.
            </p>
          </div>
      </div>
    );
  }

  if (phase === 'results' && evaluation) {
    return (
      <QuizResultsView
        evaluation={evaluation}
        attemptCount={attemptCount}
        onRetake={handleRetake}
        sourceQuestions={questions}
        allowRetakeEnabled={!!quizContent?.metadata?.allowRetake}
      />
    );
  }

  const options = Array.isArray(current.options) ? current.options : [];
  const typeLabel =
    current.type === 'multiple'
      ? 'Select all that apply'
      : current.type === 'subjective'
        ? 'Written response'
        : 'Single choice';

  const lastStep = step >= total - 1;

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col rounded-none border border-white/10 bg-[#0d0d0d] text-white overflow-hidden">
      <div className="border-b border-white/10 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              <ClipboardList className="h-5 w-5 text-[color:var(--color-gradient-start)]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Quiz</p>
              <p className="truncate text-sm font-semibold text-white/95">{chapterTitle || 'Quiz'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-white/45">
              {step + 1} / {total}
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10 sm:w-40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {submitError ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90">
              {submitError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
              {typeLabel}
            </span>
            {typeof current.marks === 'number' && current.marks > 0 && (
              <span className="text-xs text-white/40">{current.marks} pt{current.marks !== 1 ? 's' : ''}</span>
            )}
          </div>

          <h2 className="text-lg font-semibold leading-snug text-white sm:text-xl">{current.question}</h2>

          {current.type === 'subjective' ? (
            <textarea
              value={typeof answers[step] === 'string' ? answers[step] : ''}
              onChange={(e) => handleSubjectiveChange(e.target.value)}
              rows={6}
              placeholder="Type your answer here…"
              className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[color:var(--color-gradient-start)]/50 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-gradient-start)]/30"
            />
          ) : (
            <ul className="space-y-2">
              {options.map((opt, idx) => {
                const label = typeof opt === 'string' ? opt : opt?.content ?? String(opt);
                const selected = isSelected(idx);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSelect(idx)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-[color:var(--color-gradient-start)]/50 bg-[color:var(--color-gradient-start)]/10'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 text-white/50" aria-hidden>
                        {current.type === 'multiple' ? (
                          selected ? (
                            <CheckSquare className="h-5 w-5 text-[color:var(--color-gradient-start)]" strokeWidth={2} />
                          ) : (
                            <Square className="h-5 w-5" strokeWidth={2} />
                          )
                        ) : (
                          <Circle
                            className={`h-5 w-5 ${selected ? 'fill-[color:var(--color-gradient-start)] text-[color:var(--color-gradient-start)]' : ''}`}
                            strokeWidth={2}
                          />
                        )}
                      </span>
                      <span className="text-white/90">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0 || submitting}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!hasAnswerForStep(step) || submitting}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white btn-gradient disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : lastStep ? (
            <>
              Submit
              <ChevronRight className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
