import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AssignmentStatusBadge from './AssignmentStatusBadge';

/**
 * Compact assignment row card (learner + instructor list).
 * Soft brand tint when graded / selected.
 */
const AssignmentListCard = ({
  title,
  status,
  statusLabel,
  meta,
  highlighted = false,
  selected = false,
  onClick,
  children,
  className,
  rightSlot,
}) => {
  const softHighlight =
    highlighted ||
    status === 'graded' ||
    status === 'all_graded' ||
    selected;

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl border transition-all duration-300 font-satoshi',
          softHighlight
            ? 'bg-primary-pink/[0.06] border-primary-pink/25 dark:bg-primary-pink/10 dark:border-primary-pink/30'
            : 'bg-white border-gray-200 dark:bg-white/[0.03] dark:border-white/10',
          onClick && 'cursor-pointer hover:border-primary-pink/40 dark:hover:border-primary-pink/40',
          className,
        ),
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={clsx(
          'w-full text-left px-4 sm:px-5 py-3.5 flex items-start justify-between gap-3',
          !onClick && 'cursor-default',
        )}
      >
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {status && <AssignmentStatusBadge status={status} label={statusLabel} />}
            {meta && (
              <span className="text-xs font-medium text-gray-500 dark:text-white/45">
                {meta}
              </span>
            )}
          </div>
        </div>
        {rightSlot && <div className="shrink-0 self-center">{rightSlot}</div>}
      </button>
      {children && (
        <div className="px-4 sm:px-5 pb-4 border-t border-gray-100 dark:border-white/5 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default AssignmentListCard;
