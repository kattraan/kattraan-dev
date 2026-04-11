import React, { useEffect, useId, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import 'react-day-picker/style.css';

function cn(...args) {
  return twMerge(clsx(args));
}

/**
 * Calendar popover for picking a single local date (styled for light/dark).
 */
export default function DatePopoverField({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  id: idProp,
  'aria-labelledby': ariaLabelledBy,
  fromYear = 2020,
  toYear = new Date().getFullYear() + 5,
}) {
  const reactId = useId();
  const id = idProp || `date-field-${reactId}`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const labelText = value ? format(value, 'EEE, MMM d, yyyy') : placeholder;

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={ariaLabelledBy}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all shadow-sm',
          'bg-white dark:bg-[#1a1a1a] border-gray-200/90 dark:border-white/10',
          'text-gray-900 dark:text-white',
          'hover:border-primary-pink/35 dark:hover:border-primary-pink/30',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-pink/35 focus-visible:border-primary-pink/40',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF8C42]/15 to-[#FF3FB4]/15 text-primary-pink dark:from-[#FF8C42]/20 dark:to-[#FF3FB4]/20">
            <Calendar className="w-4 h-4" aria-hidden />
          </span>
          <span className={cn('truncate', !value && 'text-gray-400 dark:text-white/40 font-medium')}>
            {labelText}
          </span>
        </span>
        <ChevronDown
          className={cn('w-4 h-4 shrink-0 text-gray-400 dark:text-white/35 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute z-[80] mt-2 left-0 right-0 sm:left-0 sm:right-auto min-w-[min(100%,20rem)] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] p-3 kattraan-daypicker"
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange?.(d);
              setOpen(false);
            }}
            showOutsideDays
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            classNames={{
              root: 'w-full',
              months: 'flex flex-col gap-3',
              month: 'space-y-3',
              month_caption: 'flex justify-center pt-1 relative items-center gap-1',
              caption_label: 'hidden',
              dropdowns: 'flex w-full items-center justify-center gap-2 text-sm font-bold',
              dropdown_root: cn(
                'rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2 py-1.5',
                'text-gray-900 dark:text-white',
              ),
              dropdown: 'bg-transparent font-semibold text-sm outline-none cursor-pointer',
              nav: 'hidden',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex mb-1',
              weekday: 'w-9 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/35 flex items-center justify-center',
              week: 'flex w-full',
              day: 'relative p-0 text-center text-sm',
              day_button: cn(
                'h-9 w-9 rounded-lg font-semibold text-gray-800 dark:text-white/90',
                'hover:bg-gray-100 dark:hover:bg-white/10 transition-colors',
              ),
              selected: cn(
                '!bg-gradient-to-br !from-[#FF8C42] !to-[#FF3FB4] !text-white',
                'hover:!from-[#FF8C42] hover:!to-[#FF3FB4] hover:!text-white',
                'shadow-md shadow-primary-pink/25 rounded-lg',
              ),
              today: 'font-bold text-primary-pink dark:text-[#ff7bc4]',
              outside: 'text-gray-300 dark:text-white/20',
              disabled: 'text-gray-200 dark:text-white/15 opacity-40',
            }}
          />
        </div>
      )}
    </div>
  );
}
