import React, { memo } from 'react';
import { GripVertical, Copy, Pencil, Trash2 } from 'lucide-react';

const QuestionCard = ({
  question,
  index,
  onRemove,
  onEdit,
  onClone,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const options = question.options || [];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className="bg-[#2A2A2A] border border-white/10 rounded-3xl p-8 mb-6 relative hover:border-primary-pink/30 transition-all duration-500 group shadow-[0_15px_35px_rgba(0,0,0,0.4)] cursor-default"
    >
      <div className="flex items-start justify-between gap-6 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-black border border-white/10 text-white px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase flex-shrink-0 shadow-lg select-none">
              QUESTION {index + 1}
            </div>
            <h3 className="flex-1 text-[16px] font-bold text-white/90 leading-snug">
              {question.question || 'Untitled Question'}
            </h3>
          </div>

          {question.type !== 'subjective' && (
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, optIdx) => {
                const optContent = typeof option === 'string' ? option : option?.content || `Option ${optIdx + 1}`;
                const isCorrect =
                  (question.type === 'single' && question.correctAnswer === optIdx) ||
                  (question.type === 'multiple' && (question.correctAnswers || []).includes(optIdx));
                return (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isCorrect ? 'border-primary-pink/40 bg-primary-pink/[0.08]' : 'border-white/5 bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isCorrect ? 'border-primary-pink bg-primary-pink' : 'border-white/20'
                      }`}
                    >
                      {isCorrect && <div className="w-1 h-1 rounded-full bg-white" />}
                    </div>
                    <span className="text-[13px] text-white/60 font-medium truncate">{optContent}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-8 -mt-2 -mr-2">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
              <button
                onClick={() => onClone(index)}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white/40 hover:text-white transition-all shadow-xl"
                title="Clone Question"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={onEdit}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white/40 hover:text-white transition-all shadow-xl"
                title="Edit Question"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={onRemove}
                className="p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 text-red-500/40 hover:text-red-500 transition-all shadow-xl"
                title="Delete Question"
              >
                <Trash2 size={16} />
              </button>
              <div className="w-px h-6 bg-white/5 mx-1" />
            </div>
            <div className="p-2.5 text-white/20 cursor-grab active:cursor-grabbing hover:text-white/50 transition-all">
              <GripVertical size={20} />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2 rounded-xl border border-white/5 shadow-inner">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">
              Marks:
            </span>
            <span className="text-[15px] font-black text-primary-pink leading-none">{question.marks || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(QuestionCard);
