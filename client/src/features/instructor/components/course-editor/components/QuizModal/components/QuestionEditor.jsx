import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Info,
  Image as ImageIcon,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Eraser,
  Smile,
  ChevronDown,
} from 'lucide-react';
import CustomSwitch from './CustomSwitch';

const DEFAULT_OPTIONS = [
  { id: Date.now() + 1, content: '', type: 'Text' },
  { id: Date.now() + 2, content: '', type: 'Text' },
  { id: Date.now() + 3, content: '', type: 'Text' },
  { id: Date.now() + 4, content: '', type: 'Text' },
];

const TypeDropdown = ({ currentType, onSelect, onClose }) => (
  <div className="absolute right-0 top-full mt-2 w-32 bg-[#1e1e1e] border border-white/10 rounded-xl py-2 shadow-2xl z-[200] animate-in fade-in zoom-in-95 duration-200">
    {[
      { id: 'Text', icon: <Bold size={14} /> },
      { id: 'Image', icon: <ImageIcon size={14} /> },
    ].map((type) => (
      <button
        key={type.id}
        type="button"
        onClick={() => {
          onSelect(type.id);
          onClose();
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold transition-all hover:bg-white/5 ${
          currentType === type.id ? 'text-primary-pink' : 'text-white/60 hover:text-white'
        }`}
      >
        {type.icon}
        {type.id}
      </button>
    ))}
  </div>
);

const FormattingToolbar = ({ className = '' }) => (
  <div
    className={`flex items-center gap-1 p-1 bg-white/[0.05] border-b border-white/5 rounded-t-2xl px-3 animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}
  >
    {[
      { icon: <Bold size={14} />, label: 'Bold' },
      { icon: <Underline size={14} />, label: 'Underline' },
      { icon: <Italic size={14} />, label: 'Italic' },
      { icon: <List size={14} />, label: 'List' },
      { icon: <ListOrdered size={14} />, label: 'Ordered List' },
      { icon: <Link2 size={14} />, label: 'Link' },
      { icon: <Eraser size={14} />, label: 'Clear' },
      { icon: <Smile size={14} />, label: 'Emoji' },
    ].map((tool, i) => (
      <button key={i} type="button" className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all" title={tool.label}>
        {tool.icon}
      </button>
    ))}
  </div>
);

/**
 * Add/Edit question form. Manages its own local state and syncs to parent via onStateChange.
 */
const QuestionEditor = ({ onCancel, onSave, initialData = null, onStateChange }) => {
  const getInitialState = useCallback(() => {
    if (initialData) {
      const opts = (initialData.options || []).map((opt, oIdx) => {
        if (typeof opt === 'string') return { id: Date.now() + oIdx, content: opt, type: 'Text' };
        return {
          id: opt.id || Date.now() + oIdx,
          content: opt.content ?? '',
          type: opt.type || 'Text',
        };
      });
      return {
        ...initialData,
        hasImage: initialData.hasImage || false,
        options: opts.length >= 2 ? opts : opts.length ? [...opts, ...DEFAULT_OPTIONS.slice(opts.length)] : DEFAULT_OPTIONS,
        correctAnswers: initialData.correctAnswers || [],
      };
    }
    return {
      question: '',
      type: 'single',
      marks: 1,
      options: [...DEFAULT_OPTIONS],
      correctAnswer: 0,
      correctAnswers: [],
      hasImage: false,
    };
  }, [initialData?.id]);

  const [qData, setQData] = useState(getInitialState);
  const [focusedInput, setFocusedInput] = useState(null);
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const [draggedOptionIdx, setDraggedOptionIdx] = useState(null);

  useEffect(() => {
    if (onStateChange) onStateChange(qData);
  }, [qData, onStateChange]);

  const handleOptionDragStart = (e, idx) => {
    setDraggedOptionIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleOptionDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedOptionIdx === null || draggedOptionIdx === idx) return;
    const newOpts = [...qData.options];
    const itemToMove = newOpts.splice(draggedOptionIdx, 1)[0];
    newOpts.splice(idx, 0, itemToMove);
    if (qData.type === 'single') {
      let newCorrect = qData.correctAnswer;
      if (qData.correctAnswer === draggedOptionIdx) newCorrect = idx;
      else if (draggedOptionIdx < qData.correctAnswer && idx >= qData.correctAnswer) newCorrect = qData.correctAnswer - 1;
      else if (draggedOptionIdx > qData.correctAnswer && idx <= qData.correctAnswer) newCorrect = qData.correctAnswer + 1;
      setQData((prev) => ({ ...prev, options: newOpts, correctAnswer: newCorrect }));
    } else if (qData.type === 'multiple') {
      const currentCorrects = qData.correctAnswers || [];
      const newCorrects = currentCorrects.map((cIdx) => {
        if (cIdx === draggedOptionIdx) return idx;
        if (draggedOptionIdx < cIdx && idx >= cIdx) return cIdx - 1;
        if (draggedOptionIdx > cIdx && idx <= cIdx) return cIdx + 1;
        return cIdx;
      });
      setQData((prev) => ({ ...prev, options: newOpts, correctAnswers: newCorrects }));
    } else {
      setQData((prev) => ({ ...prev, options: newOpts }));
    }
    setDraggedOptionIdx(idx);
  };

  const handleOptionDragEnd = () => setDraggedOptionIdx(null);

  const updateOption = (idx, val) => {
    const newOpts = [...qData.options];
    newOpts[idx] = { ...newOpts[idx], content: val };
    setQData((prev) => ({ ...prev, options: newOpts }));
  };

  const updateOptionType = (idx, type) => {
    const newOpts = [...qData.options];
    newOpts[idx] = { ...newOpts[idx], type };
    setQData((prev) => ({ ...prev, options: newOpts }));
  };

  const removeOption = (idx) => {
    if (qData.options.length <= 2) return;
    setQData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
  };

  const correctAnswers = qData.correctAnswers || [];
  const isCorrect = (idx) =>
    qData.type === 'single' ? qData.correctAnswer === idx : correctAnswers.includes(idx);

  return (
    <div className="bg-white/[0.05] backdrop-blur-3xl border border-white/20 rounded-3xl p-8 mb-8 animate-in slide-in-from-bottom-5 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-pink/[0.02] rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[18px] font-black text-white tracking-tight">
          {initialData ? 'Edit question' : 'Add new question'}
        </h3>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'single', label: 'Single answer', icon: <Bold size={14} /> },
          { id: 'multiple', label: 'Multiple answers', icon: <Bold size={14} /> },
          { id: 'subjective', label: 'Subjective answer', icon: <FileText size={14} /> },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setQData((p) => ({ ...p, type: type.id }))}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl border transition-all text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${
              qData.type === type.id
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            {type.icon}
            {type.label}
            <Info size={12} className={qData.type === type.id ? 'opacity-40' : 'opacity-20'} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-10">
        <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Add image</span>
        <CustomSwitch checked={qData.hasImage} onChange={(v) => setQData((p) => ({ ...p, hasImage: v }))} />
      </div>

      <div className="space-y-4 mb-10">
        <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Question</label>
        <div
          className={`transition-all duration-300 rounded-2xl border ${
            focusedInput === 'question' ? 'border-primary-pink/40 bg-white/[0.08]' : 'border-white/5 bg-white/[0.03]'
          }`}
        >
          {focusedInput === 'question' && <FormattingToolbar />}
          <input
            type="text"
            value={qData.question}
            onFocus={() => setFocusedInput('question')}
            onChange={(e) => setQData((p) => ({ ...p, question: e.target.value }))}
            placeholder="Add question title here..."
            className="w-full h-14 bg-transparent px-6 text-[15px] font-bold text-white focus:outline-none transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      {qData.type !== 'subjective' && (
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Options</label>
            <div className="bg-primary-pink/5 px-3 py-1 rounded-lg border border-primary-pink/10">
              <span className="text-[9px] text-primary-pink/60 font-medium italic">
                Note: Please select the correct answer by clicking on the circle on the left.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {qData.options.map((opt, idx) => (
              <div
                key={opt.id}
                draggable
                onDragStart={(e) => handleOptionDragStart(e, idx)}
                onDragOver={(e) => handleOptionDragOver(e, idx)}
                onDragEnd={handleOptionDragEnd}
                className="flex items-center gap-3 animate-in fade-in duration-300 group cursor-default"
              >
                <div className="p-2 text-white/30 cursor-grab active:cursor-grabbing hover:text-white/60 transition-all">
                  <GripVertical size={20} strokeWidth={2.5} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (qData.type === 'single') setQData((p) => ({ ...p, correctAnswer: idx }));
                    else {
                      const current = qData.correctAnswers || [];
                      setQData((p) => ({
                        ...p,
                        correctAnswers: current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx],
                      }));
                    }
                  }}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCorrect(idx)
                      ? 'border-primary-pink bg-primary-pink shadow-[0_0_10px_rgba(255,46,155,0.4)]'
                      : 'border-white/10'
                  }`}
                >
                  {isCorrect(idx) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
                <div className="flex-1">
                  <div
                    className={`transition-all duration-300 rounded-xl border relative ${
                      openDropdownIdx === idx ? 'z-[50]' : 'z-10'
                    } ${focusedInput === `opt-${idx}` ? 'border-primary-pink/30 bg-white/[0.08]' : 'border-white/5 bg-white/[0.03]'}`}
                  >
                    {focusedInput === `opt-${idx}` && opt.type === 'Text' && <FormattingToolbar />}
                    <div className="relative">
                      {opt.type === 'Text' ? (
                        <input
                          type="text"
                          value={opt.content}
                          onFocus={() => setFocusedInput(`opt-${idx}`)}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Add option ${idx + 1}...`}
                          className="w-full h-12 bg-transparent px-5 text-[14px] font-medium text-white/80 focus:outline-none transition-all placeholder:text-white/30 pr-24"
                        />
                      ) : (
                        <div className="p-6">
                          <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/[0.01] group/img hover:border-primary-pink/20 transition-all">
                            <div className="text-center space-y-2">
                              <p className="text-[12px] font-medium text-white/40">Works with any .JPG, .PNG, or .GIF file</p>
                              <p className="text-[10px] font-medium text-white/20">Recommended dimension 1728 x 1080 px | Max size 50 MB</p>
                            </div>
                            <button
                              type="button"
                              className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-[11px] font-black text-white hover:bg-white/[0.08] transition-all uppercase tracking-widest leading-none"
                            >
                              <Upload size={14} /> Upload Image
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="absolute right-2 top-2 flex items-center z-[110]">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenDropdownIdx((prev) => (prev === idx ? null : idx));
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/[0.1] rounded-lg border border-white/10 transition-all cursor-pointer relative z-[111]"
                          >
                            <span className="text-[10px] font-bold text-white/40 uppercase select-none pointer-events-none">
                              {opt.type || 'Text'}
                            </span>
                            <ChevronDown size={12} className={`text-white/20 transition-transform duration-300 pointer-events-none ${openDropdownIdx === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {openDropdownIdx === idx && (
                            <TypeDropdown
                              currentType={opt.type || 'Text'}
                              onSelect={(type) => updateOptionType(idx, type)}
                              onClose={() => setOpenDropdownIdx(null)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="p-3 bg-red-500/5 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setQData((p) => ({ ...p, options: [...p.options, { id: Date.now(), content: '', type: 'Text' }] }))}
            className="flex items-center gap-2.5 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-black text-white/30 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest mt-6"
          >
            <Plus size={14} /> Add option <ChevronDown size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-10 border-t border-white/5">
        <div className="flex items-center gap-4 bg-white/[0.02] px-5 py-3 rounded-2xl border border-white/5">
          <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Assign marks:</span>
          <input
            type="number"
            value={qData.marks}
            onChange={(e) => setQData((p) => ({ ...p, marks: parseInt(e.target.value, 10) || 0 }))}
            placeholder="Set question marks"
            className="w-20 text-center text-[15px] font-black text-primary-pink focus:outline-none bg-transparent placeholder:text-white/5"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 rounded-xl border border-white/5 text-white/40 font-bold text-[12px] hover:text-white transition-all uppercase tracking-widest leading-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(qData)}
            className="px-12 py-3 rounded-xl bg-white text-black font-black text-[12px] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest leading-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
