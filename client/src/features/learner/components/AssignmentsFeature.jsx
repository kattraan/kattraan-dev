import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  AssignmentListShell,
  AssignmentSection,
  AssignmentListCard,
  filterBySearch,
  groupAssignmentsByTimeline,
  isPastWork,
  isTodoItem,
  resolveLearnerStatus,
  formatDueMeta,
} from '@/components/assignments';
import {
  getMyAssignments,
  submitAssignment,
  uploadAssignmentFile,
} from '@/features/learner/services/learnerAssignmentsService';
import AssignmentDetailPanel from './AssignmentDetailPanel';
import { ROUTES } from '@/config/routes';

function learnerCardMeta(assignment, status) {
  const points = assignment.points ?? 100;
  const result = assignment?.submission?.latestEvaluation;
  const gradePct =
    assignment.submission?.grade != null && Number.isFinite(Number(assignment.submission.grade))
      ? Number(assignment.submission.grade)
      : null;
  if (status === 'graded') {
    if (gradePct != null && points > 0) {
      const earned = Math.round((gradePct / 100) * points);
      return `${earned}/${points} points · ${gradePct}%`;
    }
    if (result) return `${result.earnedMarks}/${result.totalMarks} points`;
    if (gradePct != null) return `Grade: ${gradePct}%`;
    return `${points} points`;
  }
  if (status === 'submitted') {
    const submittedAt = assignment.submission?.submittedAt;
    if (submittedAt) {
      const d = new Date(submittedAt);
      const today = new Date();
      const sameDay =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      return sameDay ? 'on Today' : `on ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    return 'Submitted';
  }
  return formatDueMeta(assignment.dueDate);
}

const AssignmentsFeature = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && e.target?.tagName !== 'INPUT' && e.target?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('assignment-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleToggle = (id) => {
    setSelectedId(selectedId === id ? null : id);
    setSubmissionText('');
    setSubmissionFile(null);
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
      } else if (type === 'file') {
        next[questionIndex] = {
          ...(prev[questionIndex] || {}),
          fileUrl: value?.url,
          fileName: value?.fileName,
        };
      } else {
        next[questionIndex] = {
          ...(prev[questionIndex] || {}),
          subjective: value,
        };
      }
      return next;
    });
  };

  const handleTaskFileUpload = async (assignment, questionIndex, file) => {
    const contentId = assignment.contentId || assignment._id;
    if (!contentId || !file) return;
    setUploadingKey(`${contentId}-${questionIndex}`);
    setSubmitError('');
    try {
      const data = await uploadAssignmentFile(contentId, file);
      setMcqAnswer(questionIndex, 'file', {
        url: data.url,
        fileName: data.fileName || file.name,
      });
    } catch (e) {
      setSubmitError(e?.response?.data?.message || e?.message || 'File upload failed.');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleFreeformFileUpload = async (assignment, file) => {
    const contentId = assignment.contentId || assignment._id;
    if (!contentId || !file) return;
    setUploadingKey(`${contentId}-free`);
    setSubmitError('');
    try {
      const data = await uploadAssignmentFile(contentId, file);
      setSubmissionFile({ url: data.url, fileName: data.fileName || file.name });
    } catch (e) {
      setSubmitError(e?.response?.data?.message || e?.message || 'File upload failed.');
    } finally {
      setUploadingKey(null);
    }
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
          submissionFileUrl:
            Object.values(quizAnswers).find((a) => a?.fileUrl)?.fileUrl || undefined,
        }
      : {
          submissionText: submissionText.trim() || undefined,
          submissionFileUrl: submissionFile?.url || undefined,
        };
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitAssignment(contentId, payload);
      await load();
      setSelectedId(contentId);
      setSubmissionText('');
      setSubmissionFile(null);
      setQuizAnswers({});
      setRetestForId(null);
    } catch (e) {
      setSubmitError(e?.response?.data?.message || e?.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const todoItems = useMemo(
    () => assignments.filter((a) => isTodoItem(a)),
    [assignments],
  );
  const pastItems = useMemo(
    () => assignments.filter((a) => isPastWork(a)),
    [assignments],
  );

  const tabItems = activeTab === 'todo' ? todoItems : pastItems;
  const filtered = useMemo(
    () => filterBySearch(tabItems, searchQuery),
    [tabItems, searchQuery],
  );
  const sections = useMemo(
    () => groupAssignmentsByTimeline(filtered),
    [filtered],
  );

  const tabs = [
    { id: 'todo', label: 'Todo', count: todoItems.length },
    { id: 'past', label: 'All Past Works', count: pastItems.length },
  ];

  return (
    <DashboardLayout title="Assignments">
      <AssignmentListShell
        description="Track deadlines, submit work, and review instructor feedback."
        learnMoreTo={ROUTES.FAQ}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          setSelectedId(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        {loading ? (
          <div className="py-16 text-center text-gray-500 dark:text-white/50">
            Loading assignments…
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
            <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4" />
            <p className="text-gray-600 dark:text-white/60 font-medium">No assignments yet</p>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
              Assignments from your enrolled courses will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-white/45">
            {searchQuery
              ? 'No assignments match your search.'
              : activeTab === 'todo'
                ? 'You’re all caught up — nothing in Todo.'
                : 'No past submissions yet.'}
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <AssignmentSection key={section.key} label={section.label}>
                {section.items.map((assignment) => {
                  const id = assignment.contentId || assignment._id;
                  const status = resolveLearnerStatus(assignment);
                  const isOpen = selectedId === id;
                  return (
                    <AssignmentListCard
                      key={id}
                      title={assignment.title}
                      status={status}
                      meta={learnerCardMeta(assignment, status)}
                      selected={isOpen}
                      onClick={() => handleToggle(id)}
                    >
                      {isOpen && (
                        <AssignmentDetailPanel
                          assignment={assignment}
                          submissionText={submissionText}
                          setSubmissionText={setSubmissionText}
                          submissionFile={submissionFile}
                          setSubmissionFile={setSubmissionFile}
                          quizAnswers={quizAnswers}
                          setMcqAnswer={setMcqAnswer}
                          submitting={submitting}
                          uploadingKey={uploadingKey}
                          submitError={submitError}
                          retestForId={retestForId}
                          setRetestForId={(next) => {
                            setQuizAnswers({});
                            setSubmitError('');
                            setRetestForId(next);
                          }}
                          onSubmit={handleSubmit}
                          onTaskFileUpload={handleTaskFileUpload}
                          onFreeformFileUpload={handleFreeformFileUpload}
                        />
                      )}
                    </AssignmentListCard>
                  );
                })}
              </AssignmentSection>
            ))}
          </div>
        )}
      </AssignmentListShell>
    </DashboardLayout>
  );
};

export default AssignmentsFeature;
