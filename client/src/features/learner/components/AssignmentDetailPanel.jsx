import React from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  Circle,
  CheckCircle2,
  XCircle,
  Lock,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const FILE_FORMAT_IDS = new Set(['file', 'pdf', 'doc', 'image', 'zip']);

export function allowsFile(formats = []) {
  return formats.some((f) => FILE_FORMAT_IDS.has(f));
}

export function acceptForFormats(formats = []) {
  const parts = [];
  const hasSpecific = formats.some((f) => ['pdf', 'doc', 'image', 'zip'].includes(f));
  const includeAll = formats.includes('file') && !hasSpecific;
  if (includeAll || formats.includes('pdf')) parts.push('.pdf,application/pdf');
  if (includeAll || formats.includes('doc')) {
    parts.push(
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  }
  if (includeAll || formats.includes('image')) {
    parts.push('image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp');
  }
  if (includeAll || formats.includes('zip')) parts.push('.zip,application/zip');
  return parts.length ? [...new Set(parts.join(',').split(','))].join(',') : undefined;
}

export function formatBadges(formats = []) {
  const labels = {
    text: 'Text',
    link: 'Link',
    file: 'File',
    pdf: 'PDF',
    doc: 'DOC',
    image: 'Image',
    zip: 'ZIP',
  };
  const seen = new Set();
  return formats.reduce((acc, f) => {
    const label = labels[f] || f;
    if (!seen.has(label)) {
      seen.add(label);
      acc.push(label);
    }
    return acc;
  }, []);
}

function formatIndexesAsOptionText(indexes = [], optionTexts = []) {
  if (!Array.isArray(indexes) || indexes.length === 0) return 'Not answered';
  return indexes
    .map((idx) => {
      const label = optionTexts?.[idx];
      return label ? `(${idx + 1}) ${label}` : `Option ${idx + 1}`;
    })
    .join(' | ');
}

/**
 * Expanded assignment work area (quiz / freeform submit + score review).
 */
const AssignmentDetailPanel = ({
  assignment,
  submissionText,
  setSubmissionText,
  submissionFile,
  setSubmissionFile,
  quizAnswers,
  setMcqAnswer,
  submitting,
  uploadingKey,
  submitError,
  retestForId,
  setRetestForId,
  onSubmit,
  onTaskFileUpload,
  onFreeformFileUpload,
}) => {
  const contentId = assignment.contentId || assignment._id;
  const status = assignment.status || 'Pending';
  const isSubmitted = status === 'Submitted' || status === 'Graded';
  const result = assignment?.submission?.latestEvaluation || null;
  const totalPoints =
    Number(assignment.points) ||
    Number(result?.totalMarks) ||
    (assignment.questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0) ||
    100;
  const passMark = 40;
  const instructorGrade =
    assignment.submission?.grade != null && Number.isFinite(Number(assignment.submission.grade))
      ? Number(assignment.submission.grade)
      : null;
  // Prefer instructor grade (%); fall back to auto-evaluation percentage.
  const effectivePercentage =
    instructorGrade != null
      ? instructorGrade
      : result?.percentage != null
        ? Number(result.percentage)
        : null;
  const earnedMarks =
    instructorGrade != null && totalPoints > 0
      ? Math.round((instructorGrade / 100) * totalPoints)
      : result?.earnedMarks != null
        ? Number(result.earnedMarks)
        : null;
  const hasScore =
    effectivePercentage != null ||
    earnedMarks != null ||
    !!result ||
    (status === 'Graded' && instructorGrade != null);
  const isPassed =
    effectivePercentage != null ? effectivePercentage >= passMark : null;
  const canRetest = !!assignment.quizSettings?.allowRetake;
  const isRetesting = retestForId === contentId;
  const lockedRetake = isSubmitted && hasScore && !isPassed && !canRetest;

  return (
    <div className="p-4 sm:p-5 border border-dashed border-gray-200 dark:border-white/15 rounded-xl bg-gray-50/80 dark:bg-black/20 font-satoshi">
      {assignment.questions?.length > 0 && isSubmitted && hasScore && !isRetesting ? (
        <>
          <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  isPassed
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                }`}
              >
                {isPassed ? 'Passed' : 'Failed'}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Score:{' '}
                {earnedMarks != null
                  ? `${earnedMarks}/${totalPoints}`
                  : result
                    ? `${result.earnedMarks}/${result.totalMarks}`
                    : '—'}{' '}
                (
                {effectivePercentage != null
                  ? `${Math.round(effectivePercentage)}%`
                  : result?.percentage != null
                    ? `${result.percentage}%`
                    : '—'}
                )
              </span>
              {instructorGrade != null && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary-pink/10 text-primary-pink border border-primary-pink/20">
                  Grade: {Math.round(instructorGrade)}%
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-white/50">
                Pass mark: {passMark}%
              </span>
              <span className="text-xs text-gray-500 dark:text-white/50">
                Attempt: {assignment.submission?.attemptCount || 1}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {(result?.questions || []).map((qResult, idx) => (
              <div
                key={`${contentId}-result-${idx}`}
                className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {idx + 1}. {qResult.question}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                      Marks:{' '}
                      {qResult.type === 'subjective' &&
                      instructorGrade != null &&
                      (result?.questions || []).filter((q) => q.type === 'subjective')
                        .length === 1
                        ? `${Math.round((instructorGrade / 100) * (Number(qResult.marks) || 0))}/${qResult.marks}`
                        : `${qResult.earnedMarks}/${qResult.marks}`}
                    </p>
                    {qResult.type !== 'subjective' && (
                      <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                        Your answer:{' '}
                        {formatIndexesAsOptionText(
                          qResult.selectedOptionIndexes || [],
                          qResult.optionTexts || [],
                        )}{' '}
                        | Correct:{' '}
                        {formatIndexesAsOptionText(
                          qResult.correctOptionIndexes || [],
                          qResult.optionTexts || [],
                        )}
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
                setRetestForId(contentId);
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
          <p className="text-sm font-bold text-gray-700 dark:text-white/80 mb-4">
            {assignment.questions.every((q) => q.type === 'subjective')
              ? 'Complete the following tasks:'
              : 'Answer the following questions:'}
          </p>
          <div className="space-y-6 mb-6">
            {assignment.questions.map((q, qIdx) => {
              const formats = q.submissionFormats || [];
              const attachments = (q.attachments || []).filter(
                (a) => a?.label?.trim() || a?.url?.trim(),
              );
              const criteria = (q.evaluationCriteria || []).filter((c) => c?.label?.trim());
              const badges = formatBadges(formats);
              const showFile = allowsFile(formats);
              const showText =
                !formats.length ||
                formats.includes('text') ||
                formats.includes('link') ||
                !showFile;
              const isUploading = uploadingKey === `${contentId}-${qIdx}`;
              const uploaded = quizAnswers[qIdx]?.fileUrl
                ? {
                    url: quizAnswers[qIdx].fileUrl,
                    fileName: quizAnswers[qIdx].fileName,
                  }
                : null;
              return (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10"
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                    {qIdx + 1}. {q.question}
                    {q.marks != null && (
                      <span className="text-gray-500 dark:text-white/50 font-normal ml-1">
                        ({q.marks} {q.marks === 1 ? 'point' : 'points'})
                      </span>
                    )}
                  </p>
                  {q.instructions?.trim() && (
                    <p className="text-sm text-gray-600 dark:text-white/60 mb-3 whitespace-pre-wrap leading-relaxed">
                      {q.instructions}
                    </p>
                  )}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-xs font-semibold text-gray-500 dark:text-white/40 mr-1 self-center">
                        Submit as:
                      </span>
                      {badges.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 rounded-md bg-primary-pink/10 text-primary-pink text-[11px] font-bold uppercase tracking-wide"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  {attachments.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide">
                        Resources
                      </p>
                      {attachments.map((a, aIdx) =>
                        a.url ? (
                          <a
                            key={aIdx}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-primary-pink hover:underline"
                          >
                            {a.label || a.url}
                          </a>
                        ) : (
                          <p key={aIdx} className="text-sm text-gray-700 dark:text-white/70">
                            {a.label}
                          </p>
                        ),
                      )}
                    </div>
                  )}
                  {criteria.length > 0 && (
                    <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                      <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide mb-2">
                        How you will be graded
                      </p>
                      <ul className="space-y-1.5">
                        {criteria.map((c, cIdx) => (
                          <li key={cIdx} className="text-sm text-gray-700 dark:text-white/70">
                            <span className="font-semibold">{c.label}</span>
                            {c.description?.trim() && (
                              <span className="text-gray-500 dark:text-white/45">
                                {' '}
                                — {c.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {q.type === 'single' && (
                    <div className="space-y-2">
                      {(q.options || []).map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name={`q-${contentId}-${qIdx}`}
                            checked={quizAnswers[qIdx]?.single === oIdx}
                            onChange={() => setMcqAnswer(qIdx, 'single', oIdx)}
                            className="sr-only"
                          />
                          <span className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/30 group-hover:border-primary-pink/50">
                            {quizAnswers[qIdx]?.single === oIdx ? (
                              <CheckCircle2 size={14} className="text-primary-pink" />
                            ) : (
                              <Circle size={14} className="text-gray-400 dark:text-white/30" />
                            )}
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
                    <div className="space-y-3">
                      {(showText || formats.includes('link')) && (
                        <textarea
                          placeholder={
                            formats.includes('link')
                              ? 'Paste your response or submission link…'
                              : 'Type your submission…'
                          }
                          value={quizAnswers[qIdx]?.subjective ?? ''}
                          onChange={(e) => setMcqAnswer(qIdx, 'subjective', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-pink/30"
                        />
                      )}
                      {showFile && (
                        <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/[0.03] p-4">
                          {uploaded ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className="text-primary-pink shrink-0" />
                                <a
                                  href={uploaded.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-primary-pink truncate hover:underline"
                                >
                                  {uploaded.fileName || 'Uploaded file'}
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMcqAnswer(qIdx, 'file', null)}
                                className="text-xs font-bold text-gray-500 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center gap-2 cursor-pointer">
                              <input
                                type="file"
                                className="sr-only"
                                accept={acceptForFormats(formats)}
                                disabled={!!isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onTaskFileUpload(assignment, qIdx, file);
                                  e.target.value = '';
                                }}
                              />
                              {isUploading ? (
                                <Loader2 size={20} className="animate-spin text-primary-pink" />
                              ) : (
                                <Upload size={20} className="text-primary-pink" />
                              )}
                              <span className="text-sm font-bold text-gray-700 dark:text-white/80">
                                {isUploading ? 'Uploading…' : 'Upload file'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-white/40">
                                Max 50 MB
                              </span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            onClick={() => onSubmit(assignment)}
            disabled={submitting}
            className="bg-primary-pink text-white hover:opacity-90"
          >
            {submitting
              ? 'Submitting…'
              : hasScore && !isPassed
                ? 'Submit retest'
                : 'Submit'}
          </Button>
          {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
        </>
      ) : (
        <>
          <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
            Your submission (text)
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Describe your work or paste your response here..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-pink/30 mb-4"
          />
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/[0.03] p-4 mb-4">
            {submissionFile ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="text-primary-pink shrink-0" />
                  <a
                    href={submissionFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary-pink truncate hover:underline"
                  >
                    {submissionFile.fileName || 'Uploaded file'}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmissionFile(null)}
                  className="text-xs font-bold text-gray-500 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  className="sr-only"
                  disabled={uploadingKey === `${contentId}-free`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFreeformFileUpload(assignment, file);
                    e.target.value = '';
                  }}
                />
                {uploadingKey === `${contentId}-free` ? (
                  <Loader2 size={20} className="animate-spin text-primary-pink" />
                ) : (
                  <Upload size={20} className="text-primary-pink" />
                )}
                <span className="text-sm font-bold text-gray-700 dark:text-white/80">
                  {uploadingKey === `${contentId}-free`
                    ? 'Uploading…'
                    : 'Upload file (optional)'}
                </span>
                <span className="text-xs text-gray-500 dark:text-white/40">
                  PDF, DOC, ZIP, image · Max 50 MB
                </span>
              </label>
            )}
          </div>
          <Button
            onClick={() => onSubmit(assignment)}
            disabled={submitting}
            className="bg-primary-pink text-white hover:opacity-90"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
          {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
        </>
      )}

      {assignment.submission?.instructorFeedback && (
        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-1">
            Instructor feedback
          </p>
          <p className="text-sm text-gray-700 dark:text-white/80">
            {assignment.submission.instructorFeedback}
          </p>
        </div>
      )}

      {isSubmitted && !hasScore && !assignment.questions?.length && (
        <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
          <CheckCircle size={16} />
          {status === 'Graded' && assignment.submission?.grade != null
            ? `Graded: ${assignment.submission.grade}%`
            : 'Under review'}
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailPanel;
