import React, { memo } from 'react';
import { GripVertical, Copy, Pencil, Trash2 } from 'lucide-react';

const FORMAT_LABELS = {
  text: 'Text',
  file: 'File',
  link: 'Link',
  pdf: 'File',
  doc: 'File',
  image: 'File',
  zip: 'File',
};

const QuestionCard = ({
  question,
  index,
  isAssignment = false,
  onRemove,
  onEdit,
  onClone,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const options = question.options || [];
  const formats = question.submissionFormats || [];
  const criteriaCount = (question.evaluationCriteria || []).filter((c) =>
    typeof c === 'string' ? c.trim() : c?.label?.trim()
  ).length;
  const resourceCount = (question.attachments || []).filter(
    (a) => a?.label?.trim() || a?.url?.trim()
  ).length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`w-full border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 mb-4 relative transition-all group cursor-default font-satoshi ${
        isAssignment ? 'hover:border-primary-pink/40' : 'hover:border-primary-pink/30'
      } ${
        isAssignment ? 'bg-gray-50 dark:bg-[#1f1f1f]' : 'bg-white dark:bg-[#2A2A2A] shadow-sm dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-white/50">
              {isAssignment ? `Task ${index + 1}` : `Q${index + 1}`}
            </span>
            <h3 className="flex-1 text-[15px] font-bold text-gray-900 dark:text-white truncate">
              {question.question || (isAssignment ? 'Untitled task' : 'Untitled question')}
            </h3>
          </div>

          {isAssignment ? (
            <div className="space-y-2.5 pl-0 sm:pl-[3.25rem]">
              {question.instructions?.trim() && (
                <p className="text-[13px] text-gray-500 dark:text-white/45 font-medium leading-relaxed line-clamp-2">
                  {question.instructions}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-400 dark:text-white/40 font-medium">
                {formats.length > 0 &&
                  [...new Set(formats.map((f) => FORMAT_LABELS[f] || f))].map((label) => (
                    <span
                      key={label}
                      className="px-2 py-0.5 rounded-md border-gradient-brand text-[11px] font-bold text-gradient-brand"
                    >
                      {label}
                    </span>
                  ))}
                {resourceCount > 0 && <span>{resourceCount} resource{resourceCount === 1 ? '' : 's'}</span>}
                {criteriaCount > 0 && (
                  <span>
                    {criteriaCount} criteri{criteriaCount === 1 ? 'on' : 'a'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            question.type !== 'subjective' && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {options.map((option, optIdx) => {
                  const optContent =
                    typeof option === 'string' ? option : option?.content || `Option ${optIdx + 1}`;
                  const isCorrect =
                    (question.type === 'single' && question.correctAnswer === optIdx) ||
                    (question.type === 'multiple' &&
                      (question.correctAnswers || []).includes(optIdx));
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        isCorrect
                          ? 'border-primary-pink/40 bg-primary-pink/[0.08]'
                          : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.03]'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isCorrect ? 'border-primary-pink bg-primary-pink' : 'border-gray-300 dark:border-white/20'
                        }`}
                      >
                        {isCorrect && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                      <span className="text-[13px] text-gray-600 dark:text-white/60 font-medium truncate">
                        {optContent}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onClone(index)}
                className="p-2 rounded-xl text-gray-400 dark:text-white/35 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                title={isAssignment ? 'Clone task' : 'Clone question'}
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-xl text-gray-400 dark:text-white/35 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                title={isAssignment ? 'Edit task' : 'Edit question'}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="p-2 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title={isAssignment ? 'Delete task' : 'Delete question'}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="p-2 text-gray-300 dark:text-white/20 cursor-grab active:cursor-grabbing hover:text-gray-500 dark:hover:text-white/50 transition-all">
              <GripVertical size={18} />
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a]">
            <span className="text-[11px] font-bold text-gray-400 dark:text-white/35 mr-1.5">
              {isAssignment ? 'Pts' : 'Marks'}
            </span>
            <span
              className={`text-[14px] font-black ${
                isAssignment ? 'text-gray-900 dark:text-white' : 'text-primary-pink'
              }`}
            >
              {question.marks || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(QuestionCard);
