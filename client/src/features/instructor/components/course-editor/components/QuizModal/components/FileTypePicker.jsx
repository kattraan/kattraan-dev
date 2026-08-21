import React from 'react';
import { Check } from 'lucide-react';

export const FILE_TYPE_OPTIONS = [
  { id: 'pdf', label: 'PDF', accept: '.pdf,application/pdf' },
  {
    id: 'doc',
    label: 'Word / DOC',
    accept:
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  { id: 'image', label: 'Image', accept: 'image/jpeg,image/png,image/gif,image/webp' },
  { id: 'zip', label: 'ZIP / code', accept: '.zip,application/zip' },
];

export const ALL_FILE_TYPE_IDS = FILE_TYPE_OPTIONS.map((t) => t.id);

/**
 * Multi-select for assignment allowed file types.
 * Uses native checkboxes so clicks always register.
 */
export default function FileTypePicker({ value = [], onChange }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (id) => {
    const has = selected.includes(id);
    const next = has ? selected.filter((f) => f !== id) : [...selected, id];
    onChange(next.length > 0 ? next : [id]);
  };

  return (
    <div className="relative z-20 rounded-xl border border-primary-pink/30 bg-gradient-to-r from-[#FF8C42]/[0.08] to-[#FF3FB4]/[0.06] p-4 space-y-3">
      <div>
        <p className="text-[13px] font-bold text-gray-900 dark:text-white">Allowed file types</p>
        <p className="text-[12px] text-gray-500 dark:text-white/45 mt-0.5">
          Click to select which file types learners can upload.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Allowed file types">
        {FILE_TYPE_OPTIONS.map(({ id, label }) => {
          const active = selected.includes(id);
          return (
            <label
              key={id}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] font-bold cursor-pointer select-none transition-all ${
                active
                  ? 'border-gradient-brand'
                  : 'border border-gray-200 dark:border-white/15 bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-white/55 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => toggle(id)}
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  active
                    ? 'border-transparent bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white'
                    : 'border-gray-300 dark:border-white/25 bg-transparent'
                }`}
                aria-hidden
              >
                {active ? <Check size={10} strokeWidth={3} /> : null}
              </span>
              <span className={active ? 'text-gradient-brand' : undefined}>{label}</span>
            </label>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-white/40">
        Selected:{' '}
        <span className="font-semibold text-gray-700 dark:text-white/75">
          {selected.length
            ? selected
                .map((id) => FILE_TYPE_OPTIONS.find((t) => t.id === id)?.label || id)
                .join(', ')
            : 'none'}
        </span>
      </p>
    </div>
  );
}
