import React from 'react';
import { Plus, Upload, FileText, Info, X } from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionEditor from './QuestionEditor';

/**
 * Renders the list of questions, add button, and import UI.
 * Composes QuestionCard and QuestionEditor.
 */
const QuestionList = ({
  questions = [],
  quizTitle,
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
  return (
    <>
      <div className="flex items-start justify-between mb-16">
        <div className="space-y-3">
          <span className="text-[10px] font-black text-primary-pink uppercase tracking-[0.5em] select-none">
            Assignment Overview
          </span>
          <h1 className="text-[42px] font-black text-white leading-none tracking-tighter">
            {quizTitle || 'Untitled'}
          </h1>
          <div className="flex items-center gap-6 pt-3">
            <div className="flex items-center bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest mr-2.5">Question(s):</span>
              <span className="text-[18px] font-black text-white leading-none">
                {questions.length + (isAddingQuestion ? 1 : 0)}
              </span>
            </div>
            <div className="flex items-center bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest mr-2.5">Total marks:</span>
              <span className="text-[18px] font-black text-primary-pink leading-none">{totalMarks}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onImportClick}
          className="flex items-center gap-2.5 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest leading-none shadow-2xl backdrop-blur-3xl mt-2"
        >
          <Upload size={16} /> Import questions
        </button>
      </div>

      {isImporting ? (
        <ImportUI onCancel={onImportCancel} />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) =>
            editingQuestionId === q.id ? (
              <QuestionEditor
                key={q.id}
                initialData={q}
                onCancel={onCancelEdit}
                onSave={onSaveQuestion}
                onStateChange={onStateChange}
              />
            ) : (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
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
            <QuestionEditor
              onCancel={onCancelAdd}
              onSave={onSaveQuestion}
              onStateChange={onStateChange}
            />
          ) : (
            <div className="pt-10 pb-32">
              <button
                type="button"
                onClick={onStartAdding}
                className="w-full py-8 border-2 border-dashed border-white/[0.03] rounded-3xl flex flex-col items-center justify-center gap-4 text-white/10 hover:border-primary-pink/20 hover:text-primary-pink/50 hover:bg-primary-pink/[0.02] transition-all group active:scale-[0.99] bg-white/[0.005]"
              >
                <div className="w-11 h-11 rounded-full border border-dashed border-white/10 group-hover:border-primary-pink/30 flex items-center justify-center transition-all bg-white/[0.01]">
                  <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Add new question</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const ImportUI = ({ onCancel }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[40px] p-16 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-pink/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 shadow-2xl">
        <div className="relative">
          <FileText size={40} className="text-white/20" />
          <div className="absolute -bottom-1 -right-1 bg-primary-pink text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">
            CSV
          </div>
        </div>
      </div>

      <h2 className="text-[28px] font-black text-white mb-3 tracking-tight">Import questions</h2>
      <p className="text-white/40 text-[15px] font-medium mb-12 max-w-md leading-relaxed">
        Bulk upload MCQ/Subjective questions for this assignment using our template.
      </p>

      <div className="w-full max-w-2xl aspect-[2/1] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-6 group/drop hover:border-primary-pink/30 hover:bg-primary-pink/[0.01] transition-all duration-500 bg-white/[0.01]">
        <div className="text-white/20 group-hover/drop:text-primary-pink/40 transition-colors">
          <Upload size={32} />
        </div>
        <div className="space-y-2">
          <p className="text-[15px] font-bold text-white/60">Drag and drop your CSV here, or</p>
          <button
            type="button"
            className="px-10 py-3 rounded-xl bg-white text-black font-black text-[12px] uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 shadow-xl"
          >
            Upload CSV
          </button>
        </div>
        <div className="flex items-center gap-6 pt-4">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Max questions: 100</span>
          <div className="w-1 h-1 rounded-full bg-white/5" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Max size: 50 MB</span>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <button
          type="button"
          className="flex items-center gap-2.5 text-primary-pink hover:text-white transition-all font-bold text-[12px] uppercase tracking-widest border-b border-primary-pink/20 pb-1"
        >
          <Upload size={14} className="rotate-180" /> Download sample CSV template
        </button>
        <p className="text-[11px] font-bold text-white/20 flex items-center gap-2">
          <Info size={14} className="opacity-40" /> Need help?{' '}
          <span className="text-white/40 hover:text-white cursor-pointer transition-colors underline decoration-white/10 underline-offset-4">
            How to use the template
          </span>
        </p>
      </div>

      <div className="flex items-center gap-4 mt-12 pt-10 border-t border-white/5 w-full justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-10 py-3 rounded-xl border border-white/10 text-white font-bold text-[12px] hover:bg-white/5 transition-all uppercase tracking-widest"
        >
          Cancel
        </button>
        <button type="button" className="px-12 py-3 rounded-xl bg-white/20 text-white/50 cursor-not-allowed font-black text-[12px] transition-all uppercase tracking-widest" disabled>
          Import
        </button>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

export default QuestionList;
