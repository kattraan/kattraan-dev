import React, { useState, useCallback } from 'react';
import {
  Plus,
  Upload,
  FileText,
  Info,
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Target,
  Zap,
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionEditor from './QuestionEditor';
import AssignmentTaskEditor from './AssignmentTaskEditor';

/**
 * Question / task list for QuizModal.
 * Assignments use a simple header; quizzes keep the overview carousel.
 */
const QuestionList = ({
  questions = [],
  quizTitle,
  assessmentMode = 'quiz',
  courseId = null,
  editingQuestionId,
  isAddingQuestion,
  totalMarks,
  isImporting,
  onClone,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  onSaveQuestion,
  onCancelEdit,
  onCancelAdd,
  onStateChange,
  onStartAdding,
  onImportClick,
  onImportCancel,
}) => {
  const isAssignment = assessmentMode === 'assignment';
  const Editor = isAssignment ? AssignmentTaskEditor : QuestionEditor;
  const taskCount = questions.length + (isAddingQuestion ? 1 : 0);

  return (
    <>
      {isAssignment ? (
        <AssignmentHeader
          title={quizTitle}
          taskCount={taskCount}
          totalMarks={totalMarks}
        />
      ) : (
        <OverviewCarousel
          quizTitle={quizTitle}
          questionCount={taskCount}
          totalMarks={totalMarks}
          onImportClick={onImportClick}
        />
      )}

      {isImporting ? (
        <ImportUI onCancel={onImportCancel} isAssignment={isAssignment} />
      ) : (
        <div className="space-y-4 w-full">
          {questions.map((q, idx) =>
            editingQuestionId === q.id ? (
              <Editor
                key={q.id}
                initialData={q}
                courseId={courseId}
                onCancel={onCancelEdit}
                onSave={onSaveQuestion}
                onStateChange={onStateChange}
              />
            ) : (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                isAssignment={isAssignment}
                onRemove={() => onRemove(q.id)}
                onClone={() => onClone(idx)}
                onEdit={() => onEdit(q.id)}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
              />
            )
          )}

          {isAddingQuestion ? (
            <Editor
              onCancel={onCancelAdd}
              onSave={onSaveQuestion}
              onStateChange={onStateChange}
              courseId={courseId}
            />
          ) : (
            <EmptyAdd onStartAdding={onStartAdding} isAssignment={isAssignment} />
          )}
        </div>
      )}
    </>
  );
};

function AssignmentHeader({ title, taskCount, totalMarks }) {
  return (
    <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 font-satoshi">
      <div className="min-w-0">
        <p className="text-sm font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end [-webkit-text-fill-color:transparent]">
          Assignment tasks
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
          {title || 'Untitled assignment'}
        </h1>
        <p className="mt-1.5 text-[13px] text-gray-500 dark:text-white/45 font-medium">
          Build what learners submit — keep each task clear and focused.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a]">
          <span className="text-[11px] font-bold text-gray-400 dark:text-white/40 mr-2">Tasks</span>
          <span className="text-[15px] font-black text-gray-900 dark:text-white">{taskCount}</span>
        </div>
        <div className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a]">
          <span className="text-[11px] font-bold text-gray-400 dark:text-white/40 mr-2">Points</span>
          <span className="text-[15px] font-black text-gray-900 dark:text-white">{totalMarks}</span>
        </div>
      </div>
    </div>
  );
}

function OverviewCarousel({ quizTitle, questionCount, totalMarks, onImportClick }) {
  const [index, setIndex] = useState(0);

  const cards = [
    {
      id: 'overview',
      label: 'Overview',
      icon: HelpCircle,
      content: (
        <div className="flex flex-col h-full justify-between gap-6">
          <div>
            <span className="text-[10px] font-black text-primary-pink uppercase tracking-[0.45em]">
              Quiz overview
            </span>
            <h1 className="mt-3 text-[28px] sm:text-[32px] font-black text-gray-900 dark:text-white leading-tight tracking-tight truncate">
              {quizTitle || 'Untitled quiz'}
            </h1>
            <p className="mt-2 text-[13px] text-gray-500 dark:text-white/60 font-medium">
              Instant in-course knowledge check
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-gray-100 dark:bg-white/[0.04] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10">
              <span className="text-[9px] text-gray-500 dark:text-white/50 font-black uppercase tracking-widest mr-2.5">
                Questions
              </span>
              <span className="text-[18px] font-black text-primary-pink leading-none">
                {questionCount}
              </span>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-white/[0.04] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10">
              <span className="text-[9px] text-gray-500 dark:text-white/50 font-black uppercase tracking-widest mr-2.5">
                Marks
              </span>
              <span className="text-[18px] font-black text-primary-pink leading-none">
                {totalMarks}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'structure',
      label: 'Structure',
      icon: ListChecks,
      content: (
        <div className="flex flex-col h-full justify-between gap-6">
          <div>
            <span className="text-[10px] font-black text-primary-pink/80 uppercase tracking-[0.45em]">
              Quiz structure
            </span>
            <h2 className="mt-3 text-[28px] font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Build clear checks
            </h2>
            <p className="mt-2 text-[13px] text-gray-500 dark:text-white/60 font-medium leading-relaxed max-w-md">
              Mix single-choice, multi-select, and short-answer questions. Keep each item focused on
              one idea.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['MCQ', 'Multi', 'Short'].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-3 py-3 text-center"
              >
                <span className="text-[11px] font-black text-gray-600 dark:text-white/70 uppercase tracking-widest">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      content: (
        <div className="flex flex-col h-full justify-between gap-6">
          <div>
            <span className="text-[10px] font-black text-primary-pink/80 uppercase tracking-[0.45em]">
              Learning goals
            </span>
            <h2 className="mt-3 text-[28px] font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Stay course-only
            </h2>
            <p className="mt-2 text-[13px] text-gray-500 dark:text-white/60 font-medium leading-relaxed max-w-md">
              Lesson quizzes stay inside the chapter. They are not listed on the learner Assignments
              page.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-pink/[0.06] border border-primary-pink/20">
            <Zap size={16} className="text-primary-pink shrink-0" />
            <span className="text-[12px] text-gray-600 dark:text-white/70 font-medium">
              Best for quick checks after a lesson
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      content: (
        <div className="flex flex-col h-full justify-between gap-6">
          <div>
            <span className="text-[10px] font-black text-primary-pink/80 uppercase tracking-[0.45em]">
              Bulk import
            </span>
            <h2 className="mt-3 text-[28px] font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Upload a CSV
            </h2>
            <p className="mt-2 text-[13px] text-gray-500 dark:text-white/60 font-medium leading-relaxed max-w-md">
              Save time by importing multiple questions at once from a spreadsheet template.
            </p>
          </div>
          <button
            type="button"
            onClick={onImportClick}
            className="self-start flex items-center gap-2.5 px-6 py-3 rounded-xl btn-gradient text-[11px] font-black transition-all uppercase tracking-widest"
          >
            <Upload size={15} /> Import questions
          </button>
        </div>
      ),
    },
  ];

  const go = useCallback((dir) => {
    setIndex((i) => (i + dir + 4) % 4);
  }, []);

  return (
    <div className="mb-12 w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.4em]">
          Overview cards
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous quiz overview card"
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-white/60 hover:text-primary-pink hover:border-primary-pink/40 hover:bg-primary-pink/10 flex items-center justify-center transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next quiz overview card"
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-white/60 hover:text-primary-pink hover:border-primary-pink/40 hover:bg-primary-pink/10 flex items-center justify-center transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[28px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1f1f1f]">
        <div
          className="flex w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="min-w-full w-full shrink-0 grow-0 basis-full p-6 sm:p-8 min-h-[220px]"
              >
                <div className="flex items-start gap-5 h-full">
                  <div className="w-11 h-11 rounded-2xl bg-primary-pink/15 border border-primary-pink/25 flex items-center justify-center text-primary-pink shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">{card.content}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-5">
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Go to ${card.label}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-7 bg-primary-pink' : 'w-1.5 bg-gray-300 dark:bg-white/25 hover:bg-primary-pink/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyAdd({ onStartAdding, isAssignment }) {
  return (
    <div className={`pt-2 ${isAssignment ? 'pb-16' : 'pt-6 pb-32'}`}>
      <button
        type="button"
        onClick={onStartAdding}
        className={`w-full py-7 border border-dashed border-gray-300 dark:border-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-white/40 transition-all group active:scale-[0.99] bg-gray-50 dark:bg-[#1a1a1a]/40 font-satoshi ${
          isAssignment
            ? 'hover:border-primary-pink/50 hover:bg-gradient-to-r hover:from-[#FF8C42]/[0.08] hover:to-[#FF3FB4]/[0.08] hover:text-primary-pink'
            : 'hover:border-primary-pink/40 hover:text-primary-pink hover:bg-primary-pink/[0.04]'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full border border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center transition-all ${
            isAssignment ? 'group-hover:border-primary-pink/70' : 'group-hover:border-primary-pink/50'
          }`}
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </div>
        <div className="text-center space-y-1">
          <span
            className={`block text-[13px] font-bold text-gray-600 dark:text-white/70 ${
              isAssignment
                ? 'group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:via-gradient-mid group-hover:to-gradient-end group-hover:bg-clip-text'
                : 'group-hover:text-primary-pink'
            }`}
          >
            {isAssignment ? 'Add task' : 'Add quiz question'}
          </span>
          <span className="block text-[12px] text-gray-400 dark:text-white/35 font-medium">
            {isAssignment
              ? 'Title, instructions, and what to submit'
              : 'MCQ, multi-select, or short answer'}
          </span>
        </div>
      </button>
    </div>
  );
}

const ImportUI = ({ onCancel, isAssignment }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-gray-50 dark:bg-white/[0.02] backdrop-blur-3xl border border-gray-200 dark:border-white/5 rounded-[40px] p-16 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none bg-white/[0.04]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-24 h-24 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 shadow-sm dark:shadow-2xl">
        <div className="relative">
          <FileText size={40} className="text-gray-300 dark:text-white/20" />
          <div className="absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg bg-gray-900 text-white dark:bg-white dark:text-black">
            CSV
          </div>
        </div>
      </div>

      <h2 className="text-[28px] font-black text-gray-900 dark:text-white mb-3 tracking-tight">
        {isAssignment ? 'Import tasks' : 'Import questions'}
      </h2>
      <p className="text-gray-500 dark:text-white/60 text-[15px] font-medium mb-12 max-w-md leading-relaxed">
        {isAssignment
          ? 'Bulk upload submission tasks for this assignment using our template.'
          : 'Bulk upload MCQ/Subjective questions for this quiz using our template.'}
      </p>

      <div className="w-full max-w-2xl aspect-[2/1] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-6 group/drop transition-all duration-500 bg-white dark:bg-white/[0.01] hover:border-primary-pink/40 hover:bg-primary-pink/[0.03]">
        <div className="text-gray-400 dark:text-white/40 transition-colors group-hover/drop:text-primary-pink">
          <Upload size={32} />
        </div>
        <div className="space-y-2">
          <p className="text-[15px] font-bold text-gray-600 dark:text-white/70">Drag and drop your CSV here, or</p>
          <button
            type="button"
            className="px-10 py-3 rounded-xl btn-gradient font-black text-[12px] uppercase tracking-widest active:scale-95"
          >
            Upload CSV
          </button>
        </div>
        <div className="flex items-center gap-6 pt-4">
          <span className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">
            Max questions: 100
          </span>
          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
          <span className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">
            Max size: 50 MB
          </span>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <button
          type="button"
          className="flex items-center gap-2.5 text-primary-pink hover:text-primary-pink/80 transition-all font-bold text-[12px] uppercase tracking-widest border-b border-primary-pink/30 pb-1"
        >
          <Upload size={14} className="rotate-180" /> Download sample CSV template
        </button>
        <p className="text-[11px] font-bold text-gray-400 dark:text-white/40 flex items-center gap-2">
          <Info size={14} className="text-primary-pink/60" /> Need help?{' '}
          <span className="text-primary-pink hover:text-primary-pink/80 cursor-pointer transition-colors underline decoration-primary-pink/30 underline-offset-4">
            How to use the template
          </span>
        </p>
      </div>

      <div className="flex items-center gap-4 mt-12 pt-10 border-t border-gray-200 dark:border-white/5 w-full justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-10 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white font-bold text-[12px] hover:bg-gray-100 dark:hover:bg-white/5 transition-all uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-12 py-3 rounded-xl bg-gray-200 dark:bg-white/20 text-gray-400 dark:text-white/50 cursor-not-allowed font-black text-[12px] transition-all uppercase tracking-widest"
          disabled
        >
          Import
        </button>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-400 dark:text-white/20 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

export default QuestionList;
