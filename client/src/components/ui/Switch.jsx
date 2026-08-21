import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const SWITCH_ON_TRACK =
  'bg-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:bg-zinc-400';
export const SWITCH_OFF_TRACK =
  'bg-zinc-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] dark:bg-zinc-700 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]';
export const SWITCH_KNOB =
  'rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22),0_1px_1px_rgba(0,0,0,0.08)] ring-1 ring-black/5';

/**
 * Neutral grey-white switch. Track is charcoal when on, light grey when off; knob stays white.
 */
const Switch = ({
  checked,
  onChange,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      onClick={() => onChange?.(!checked)}
      className={twMerge(
        clsx(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
          checked ? SWITCH_ON_TRACK : SWITCH_OFF_TRACK,
          className
        )
      )}
      {...props}
    >
      <span
        className={twMerge(
          clsx(
            'pointer-events-none h-[18px] w-[18px] transition-transform duration-200 ease-out',
            SWITCH_KNOB,
            checked ? 'translate-x-5' : 'translate-x-0'
          )
        )}
      />
    </button>
  );
};

export default Switch;
