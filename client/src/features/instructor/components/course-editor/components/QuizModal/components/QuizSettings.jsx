import React from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser, Smile, Info, X, Check } from 'lucide-react';
import CustomSwitch from './CustomSwitch';

const TOGGLE_ITEMS = [
  { label: 'Enforce passing grade to proceed', key: 'enforcePassingGrade' },
  { label: 'Enable countdown', key: 'enableCountdown' },
  { label: 'Retake assignment', key: 'allowRetake' },
];

const FORMAT_BUTTONS = [
  { icon: <Bold size={14} />, type: 'bold' },
  { icon: <Underline size={14} />, type: 'underline' },
  { icon: <Italic size={14} />, type: 'italic' },
  { icon: <List size={14} />, type: 'list' },
  { icon: <ListOrdered size={14} />, type: 'ordered' },
  { icon: <Link2 size={14} />, type: 'link' },
  { icon: <Eraser size={14} />, disabled: true },
  { icon: <Smile size={14} />, disabled: true },
];

/**
 * Sidebar with quiz title, description, passing %, and toggles.
 */
const QuizSettings = ({
  quizData,
  setQuizData,
  isDescriptionFocused,
  setIsDescriptionFocused,
  tempDescription,
  setTempDescription,
  descRef,
}) => {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <label className="text-[14px] font-bold text-white flex items-center gap-1.5">
          <span className="text-red-500">*</span> Assignment title
        </label>
        <div className="relative group">
          <input
            value={quizData.title}
            onChange={(e) => setQuizData((p) => ({ ...p, title: e.target.value.slice(0, 100) }))}
            className="w-full h-12 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 text-[13px] font-bold text-white focus:border-primary-pink/40 focus:bg-[#222222] focus:outline-none transition-all placeholder:text-white/10 pr-20"
            placeholder="Assignment name..."
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-bold group-focus-within:text-primary-pink transition-colors">
            {quizData.title.length} / 100
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[14px] font-bold text-white">Content type</label>
        <div className="flex rounded-xl border border-white/10 bg-[#1a1a1a] p-1 gap-1">
          {[
            { id: 'quiz', label: 'Lesson quiz', hint: 'In-course only; not listed under Assignments' },
            { id: 'assignment', label: 'Graded assignment', hint: 'Also listed on the learner Assignments page' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setQuizData((p) => ({ ...p, assessmentMode: id }))}
              className={`flex-1 rounded-lg px-3 py-2.5 text-center text-[12px] font-bold transition-all ${
                (quizData.assessmentMode || 'quiz') === id
                  ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-md'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">
          Lesson quizzes live only in the course. Graded assignments use the same player but also appear on the learner Assignments dashboard for tracking and due dates.
        </p>
      </div>

      <div className="space-y-4">
        <label className="text-[14px] font-bold text-white flex items-center gap-1.5">
          <span className="text-red-500">*</span> Description
        </label>
        <div
          className={`transition-all duration-300 rounded-2xl border ${
            isDescriptionFocused ? 'border-primary-pink/30 bg-[#222222]' : 'border-white/10 bg-[#1a1a1a]'
          } overflow-hidden`}
        >
          {isDescriptionFocused && (
            <div className="flex flex-wrap gap-1 p-2 bg-white/[0.03] border-b border-white/5">
              {FORMAT_BUTTONS.map((tool, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={tool.disabled}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/10 transition-all ${
                    tool.disabled ? 'opacity-20 cursor-not-allowed' : ''
                  }`}
                >
                  {tool.icon}
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={descRef}
            value={isDescriptionFocused ? tempDescription : quizData.description}
            onFocus={() => {
              setTempDescription(quizData.description);
              setIsDescriptionFocused(true);
            }}
            onChange={(e) => setTempDescription(e.target.value)}
            rows={isDescriptionFocused ? 6 : 4}
            className="w-full bg-transparent p-4 text-[13px] font-medium text-white/60 focus:outline-none transition-all resize-none placeholder:text-white/5 leading-relaxed"
            placeholder="Describe what this assignment is about..."
          />
          {isDescriptionFocused && (
            <div className="flex items-center justify-end gap-2 p-3 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setTempDescription(quizData.description);
                  setIsDescriptionFocused(false);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                title="Cancel Changes"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizData((p) => ({ ...p, description: tempDescription }));
                  setIsDescriptionFocused(false);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white/40 hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/20 transition-all"
                title="Save Description"
              >
                <Check size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[14px] font-bold text-white flex items-center gap-1.5">
          Passing percentage
        </label>
        <div className="flex items-center">
          <input
            type="number"
            value={quizData.passingPercentage}
            onChange={(e) => setQuizData((p) => ({ ...p, passingPercentage: parseInt(e.target.value, 10) || 0 }))}
            className="w-full h-12 bg-[#1a1a1a] border border-white/5 rounded-l-xl px-4 text-[16px] font-black text-primary-pink focus:outline-none focus:border-primary-pink/40 focus:bg-[#222222] transition-all"
          />
          <div className="h-12 px-4 bg-white/[0.05] border border-white/5 border-l-0 rounded-r-xl flex items-center justify-center">
            <span className="text-[12px] text-white/20 font-black">%</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        {TOGGLE_ITEMS.map((item) => (
          <div
            key={item.key}
            role="button"
            tabIndex={0}
            onClick={() => setQuizData((p) => ({ ...p, [item.key]: !p[item.key] }))}
            onKeyDown={(e) => e.key === 'Enter' && setQuizData((p) => ({ ...p, [item.key]: !p[item.key] }))}
            className="flex items-center justify-between group cursor-pointer bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl hover:bg-[#222222] hover:border-white/20 transition-all duration-300 shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white/50 group-hover:text-white transition-colors">
                {item.label}
              </span>
              <Info size={12} className="text-white/20" />
            </div>
            <CustomSwitch
              checked={quizData[item.key]}
              onChange={(v) => setQuizData((p) => ({ ...p, [item.key]: v }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSettings;
