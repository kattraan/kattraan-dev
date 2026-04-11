import React, { useId } from 'react';
import DatePopoverField from './DatePopoverField';
import TimeField from './TimeField';
import { parseDatetimeLocal, toDatetimeLocalValue } from '@/lib/datetimeLocal';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args) {
  return twMerge(clsx(args));
}

/**
 * Start or end schedule: date + time → single datetime-local string in parent state.
 */
export default function ScheduleDateTimeRow({
  label,
  required,
  value,
  onChange,
  className,
}) {
  const baseId = useId();
  const { date, time } = parseDatetimeLocal(value);

  const applyDate = (d) => {
    if (!d) {
      onChange?.('');
      return;
    }
    const t = time || '09:00';
    onChange?.(toDatetimeLocalValue(d, t));
  };

  const applyTime = (t) => {
    let d = date;
    if (!d) {
      d = new Date();
      d.setHours(0, 0, 0, 0);
    }
    if (!t) {
      onChange?.('');
      return;
    }
    onChange?.(toDatetimeLocalValue(d, t));
  };

  const labelId = `${baseId}-label`;

  return (
    <div className={cn('space-y-2', className)}>
      <p id={labelId} className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-white/40">
        {label}
        {required ? <span className="text-red-500 ml-0.5">*</span> : null}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePopoverField value={date} onChange={applyDate} aria-labelledby={labelId} />
        <TimeField value={time} onChange={applyTime} label={`${label} time`} />
      </div>
    </div>
  );
}
