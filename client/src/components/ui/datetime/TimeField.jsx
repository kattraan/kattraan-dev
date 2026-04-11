import React, { useId } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args) {
  return twMerge(clsx(args));
}

/**
 * Styled native time input with clock icon (works with datetime-local workflows).
 */
export default function TimeField({
  value,
  onChange,
  label,
  disabled = false,
  className,
  id: idProp,
  step = 300,
}) {
  const reactId = useId();
  const id = idProp || `time-field-${reactId}`;

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <Clock
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/35"
          aria-hidden
        />
        <input
          id={id}
          type="time"
          step={step}
          value={value || ''}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'w-full rounded-xl border py-3 pl-11 pr-4 text-sm font-semibold tabular-nums transition-all shadow-sm',
            'bg-white dark:bg-[#1a1a1a] border-gray-200/90 dark:border-white/10',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-white/30',
            'hover:border-primary-pink/35 dark:hover:border-primary-pink/30',
            'focus:outline-none focus:ring-2 focus:ring-primary-pink/35 focus:border-primary-pink/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[color-scheme:light] dark:[color-scheme:dark]',
          )}
        />
      </div>
    </div>
  );
}
