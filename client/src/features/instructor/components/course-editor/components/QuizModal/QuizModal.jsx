import React from 'react';
import { ArrowLeft, ExternalLink, Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useQuizBuilder } from './hooks/useQuizBuilder';
import QuestionList from './components/QuestionList';
import QuizSettings from './components/QuizSettings';
import QuizPreview from './components/QuizPreview';

/**
 * QuizModal container. Delegates logic to useQuizBuilder;
 * composes QuestionList, QuizSettings, QuizPreview.
 */
const QuizModal = ({
  isOpen,
  onClose,
  onSave,
  chapterId,
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
    pendingQuestionRef,
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

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] text-white flex flex-col font-satoshi animate-in fade-in duration-300 overflow-hidden">
      <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-3xl fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-7">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2.5 text-white/40 hover:text-white transition-all font-bold text-[11px] uppercase tracking-[0.2em] group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course
          </button>
          <div className="h-4 w-[1px] bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mb-0.5">
              {sectionName || 'Curriculum'}
            </span>
            <h2 className="text-[15px] font-bold text-white tracking-tight leading-none truncate max-w-[240px]">
              {quizData.title || 'Draft Assessment'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/60 font-bold text-[11px] hover:bg-white/5 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <ExternalLink size={14} /> Preview as learner
          </button>
          <button
            type="button"
            onClick={handleMainSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/50 font-bold text-[11px] hover:bg-white/5 transition-all uppercase tracking-widest leading-none"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={handleMainSave}
            disabled={isSaving}
            className="px-10 py-2.5 rounded-xl bg-primary-pink text-white font-black text-[12px] hover:shadow-[0_0_25px_rgba(255,46,155,0.3)] transition-all active:scale-95 flex items-center gap-2.5 uppercase tracking-widest shadow-xl"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 mt-[72px] h-[calc(100vh-72px)] overflow-hidden">
        <aside className="w-[320px] border-r border-white/5 bg-[#2a2a2a] overflow-y-auto px-8 py-10 flex-shrink-0 custom-scrollbar relative z-10 shadow-2xl">
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

        <main className="flex-1 overflow-y-auto px-10 py-12 scroll-smooth custom-scrollbar bg-black/30 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto bg-[#2A2A2A] backdrop-blur-[40px] border border-white/10 rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-pink/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            <QuestionList
              questions={quizData.questions}
              quizTitle={quizData.title}
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
              onStateChange={(state) => {
                setPendingQuestion(state);
              }}
              onStartAdding={startAdding}
              onImportClick={() => setIsImporting(true)}
              onImportCancel={() => setIsImporting(false)}
            />
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
