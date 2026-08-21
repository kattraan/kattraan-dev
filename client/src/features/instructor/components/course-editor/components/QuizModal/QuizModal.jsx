import React from 'react';
import { ArrowLeft, ExternalLink, Loader2, Save, HelpCircle, ClipboardList } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ThemeToggle from '@/components/ThemeToggle';
import { useQuizBuilder } from './hooks/useQuizBuilder';
import QuestionList from './components/QuestionList';
import QuizSettings from './components/QuizSettings';
import QuizPreview from './components/QuizPreview';

/**
 * QuizModal container. Delegates logic to useQuizBuilder;
 * composes QuestionList, QuizSettings, QuizPreview.
 * Chrome and accents branch on assessmentMode (quiz vs assignment).
 */
const QuizModal = ({
  isOpen,
  onClose,
  onSave,
  chapterId,
  courseId = null,
  initialData = null,
  sectionName = '',
  chapterName = '',
  preferredAssessmentMode = 'quiz',
}) => {
  const toast = useToast();
  const builder = useQuizBuilder({
    isOpen,
    onClose,
    onSave,
    chapterId,
    initialData,
    chapterName,
    preferredAssessmentMode,
    toast,
  });

  const {
    quizData,
    setQuizData,
    isSaving,
    isAddingQuestion,
    editingQuestionId,
    showPreview,
    setShowPreview,
    isDescriptionFocused,
    setIsDescriptionFocused,
    tempDescription,
    setTempDescription,
    isImporting,
    setIsImporting,
    descRef,
    totalMarks,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleCloneQuestion,
    handleEditQuestion,
    handleSaveNewQuestion,
    startAdding,
    removeQuestion,
    handleMainSave,
    cancelEdit,
    cancelAdd,
    setPendingQuestion,
  } = builder;

  if (!isOpen) return null;

  const isAssignment = (quizData.assessmentMode || 'quiz') === 'assignment';

  return (
    <div className="fixed inset-0 z-[200] bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col font-satoshi animate-in fade-in duration-300 overflow-hidden">
      <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden>
        <defs>
          <linearGradient id="kattraan-brand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8C42" />
            <stop offset="100%" stopColor="#FF3FB4" />
          </linearGradient>
        </defs>
      </svg>
      <header className="h-[72px] shrink-0 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-black/40 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-7 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2.5 text-gray-500 dark:text-white/60 hover:text-primary-pink transition-all font-bold text-[11px] uppercase tracking-[0.2em] group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course
          </button>
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 dark:text-white/40 font-black uppercase tracking-[0.4em] mb-0.5">
              {sectionName || 'Curriculum'}
            </span>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight leading-none truncate max-w-[240px]">
              {quizData.title || (isAssignment ? 'Draft Assignment' : 'Draft Quiz')}
            </h2>
          </div>
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
              isAssignment
                ? 'bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end border-transparent text-white shadow-md shadow-[#FF8C42]/20'
                : 'bg-primary-pink/10 border-primary-pink/20 text-primary-pink'
            }`}
          >
            {isAssignment ? <ClipboardList size={12} /> : <HelpCircle size={12} />}
            {isAssignment ? 'Assignment' : 'Quiz'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 font-bold text-[11px] hover:border-primary-pink/50 hover:text-primary-pink transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <ExternalLink size={14} /> Preview as learner
          </button>
          <button
            type="button"
            onClick={handleMainSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 font-bold text-[11px] hover:border-primary-pink/40 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest leading-none"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={handleMainSave}
            disabled={isSaving}
            className="px-10 py-2.5 rounded-xl btn-gradient font-black text-[12px] transition-all active:scale-95 flex items-center gap-2.5 uppercase tracking-widest disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-[320px] shrink-0 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#2a2a2a] overflow-y-auto overscroll-contain px-8 py-10 custom-scrollbar relative z-10 shadow-sm dark:shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end" />
          <QuizSettings
            quizData={quizData}
            setQuizData={setQuizData}
            isDescriptionFocused={isDescriptionFocused}
            setIsDescriptionFocused={setIsDescriptionFocused}
            tempDescription={tempDescription}
            setTempDescription={setTempDescription}
            descRef={descRef}
          />
        </aside>

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable] custom-scrollbar bg-gray-100 dark:bg-[#111111] relative">
          <div className={`w-full min-h-full ${isAssignment ? 'p-3 lg:p-4' : 'p-6 lg:p-8'}`}>
            <div
              className={`w-full min-h-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden ${
                isAssignment
                  ? 'rounded-2xl p-4'
                  : 'rounded-[32px] p-6 sm:p-8 lg:p-10'
              }`}
            >
              <QuestionList
                questions={quizData.questions}
                quizTitle={quizData.title}
                assessmentMode={quizData.assessmentMode || 'quiz'}
                courseId={courseId}
                editingQuestionId={editingQuestionId}
                isAddingQuestion={isAddingQuestion}
                totalMarks={totalMarks}
                isImporting={isImporting}
                onClone={handleCloneQuestion}
                onEdit={handleEditQuestion}
                onRemove={removeQuestion}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onSaveQuestion={handleSaveNewQuestion}
                onCancelEdit={() => {
                  cancelEdit();
                }}
                onCancelAdd={() => {
                  cancelAdd();
                }}
                onStateChange={setPendingQuestion}
                onStartAdding={startAdding}
                onImportClick={() => setIsImporting(true)}
                onImportCancel={() => setIsImporting(false)}
              />
            </div>
          </div>
        </main>
      </div>

      {showPreview && (
        <QuizPreview quizData={quizData} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default QuizModal;
