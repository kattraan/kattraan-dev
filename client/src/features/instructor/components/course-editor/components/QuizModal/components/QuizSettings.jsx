import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Eraser,
  Smile,
  Info,
  X,
  Check,
  HelpCircle,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import CustomSwitch from './CustomSwitch';

const QUIZ_TOGGLES = [
  { label: 'Enforce passing grade to proceed', key: 'enforcePassingGrade' },
  { label: 'Enable countdown timer', key: 'enableCountdown' },
  { label: 'Allow quiz retakes', key: 'allowRetake' },
];

const ASSIGNMENT_TOGGLES = [
  { label: 'Enforce passing grade to proceed', key: 'enforcePassingGrade' },
  { label: 'Allow assignment retakes', key: 'allowRetake' },
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

const fieldLabel = 'text-sm font-bold text-gray-500 dark:text-white/60';
const fieldInput =
  'w-full h-12 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 text-[13px] font-bold text-gray-900 dark:text-white focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/25 focus:bg-white dark:focus:bg-[#222222] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30';

/**
 * Sidebar with title, description, passing %, and toggles.
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
  const isAssignment = (quizData.assessmentMode || 'quiz') === 'assignment';
  const toggles = isAssignment ? ASSIGNMENT_TOGGLES : QUIZ_TOGGLES;

  return (
    <div className="space-y-8 font-satoshi">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isAssignment
              ? 'bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white shadow-md shadow-[#FF8C42]/20'
              : 'bg-primary-pink/15 border border-primary-pink/25 text-primary-pink'
          }`}
        >
          {isAssignment ? <ClipboardList size={18} /> : <HelpCircle size={18} />}
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {isAssignment ? 'Graded assignment' : 'Lesson quiz'}
          </p>
          <p className="text-[12px] text-gray-500 dark:text-white/45 leading-relaxed mt-0.5">
            {isAssignment
              ? 'Shown on the learner Assignments page with due dates.'
              : 'Stays inside the chapter. Not listed under Assignments.'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className={`${fieldLabel} flex items-center gap-1.5`}>
          {isAssignment ? 'Assignment title' : 'Quiz title'}{' '}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <input
            value={quizData.title}
            onChange={(e) =>
              setQuizData((p) => ({ ...p, title: e.target.value.slice(0, 100) }))
            }
            className={`${fieldInput} pr-16`}
            placeholder={isAssignment ? 'Assignment name…' : 'Quiz name…'}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-white/35 font-bold">
            {quizData.title.length}/100
          </span>
        </div>
      </div>

      {!isAssignment && (
        <div className="space-y-2">
          <label className={fieldLabel}>Content type</label>
          <div className="flex rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] p-1 gap-1">
            {[
              { id: 'quiz', label: 'Lesson quiz' },
              { id: 'assignment', label: 'Graded assignment' },
            ].map(({ id, label }) => {
              const selected = (quizData.assessmentMode || 'quiz') === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setQuizData((p) => ({ ...p, assessmentMode: id }))}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-center text-[12px] font-bold transition-all ${
                    selected
                      ? 'btn-gradient text-white shadow-md shadow-primary-pink/20'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/80'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isAssignment && (
        <div className="space-y-2">
          <label className={`${fieldLabel} flex items-center gap-2`}>
            <Calendar size={14} className="text-gray-400 dark:text-white/45" /> Due date
            <span className="text-gray-400 dark:text-white/35 font-medium text-[11px]">optional</span>
          </label>
          <input
            type="date"
            value={quizData.dueDate || ''}
            onChange={(e) =>
              setQuizData((p) => ({ ...p, dueDate: e.target.value || '' }))
            }
            className={`${fieldInput} [color-scheme:light] dark:[color-scheme:dark]`}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className={`${fieldLabel} flex items-center gap-1.5`}>
          Description <span className="text-red-500">*</span>
        </label>
        <div
          className={`transition-all duration-300 rounded-xl border ${
            isDescriptionFocused
              ? 'border-primary-pink/40 bg-white dark:bg-[#222222] ring-1 ring-primary-pink/20'
              : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a]'
          } overflow-hidden`}
        >
          {isDescriptionFocused && (
            <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/5">
              {FORMAT_BUTTONS.map((tool, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={tool.disabled}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-gray-500 dark:text-white/50 hover:text-primary-pink hover:bg-primary-pink/10 transition-all ${
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
            className="w-full bg-transparent p-4 text-[13px] font-medium text-gray-700 dark:text-white/70 focus:outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-white/25 leading-relaxed"
            placeholder={
              isAssignment
                ? 'What this assignment is about…'
                : 'What this quiz covers…'
            }
          />
          {isDescriptionFocused && (
            <div className="flex items-center justify-end gap-2 p-3 bg-gray-50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setTempDescription(quizData.description);
                  setIsDescriptionFocused(false);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
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
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/20 transition-all"
                title="Save Description"
              >
                <Check size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className={fieldLabel}>Passing percentage</label>
        <div className="flex items-center">
          <input
            type="number"
            value={quizData.passingPercentage}
            onChange={(e) =>
              setQuizData((p) => ({
                ...p,
                passingPercentage: parseInt(e.target.value, 10) || 0,
              }))
            }
            className="w-full h-12 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-l-xl px-4 text-[16px] font-black text-gray-900 dark:text-white focus:outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/25 focus:bg-white dark:focus:bg-[#222222] transition-all"
          />
          <div className="h-12 px-4 bg-gradient-to-r from-gradient-start/15 via-gradient-mid/15 to-gradient-end/15 border border-gray-200 dark:border-white/10 border-l-0 rounded-r-xl flex items-center justify-center">
            <span className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-br from-gradient-start via-gradient-mid to-gradient-end">%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-white/10">
        {toggles.map((item) => (
          <div
            key={item.key}
            role="button"
            tabIndex={0}
            onClick={() => setQuizData((p) => ({ ...p, [item.key]: !p[item.key] }))}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              setQuizData((p) => ({ ...p, [item.key]: !p[item.key] }))
            }
            className="flex items-center justify-between group cursor-pointer bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-[#222222] hover:border-primary-pink/35 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {item.label}
              </span>
              <Info size={12} className="text-gray-400 dark:text-white/30 group-hover:text-primary-pink/80" />
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
