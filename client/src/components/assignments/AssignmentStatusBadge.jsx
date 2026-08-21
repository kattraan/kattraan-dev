import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const STATUS_STYLES = {
  overdue: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  late: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  submitted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  graded: 'bg-primary-pink/15 text-primary-pink dark:bg-primary-pink/20 dark:text-primary-pink',
  extension: 'bg-primary-purple/15 text-primary-purple dark:bg-primary-purple/25 dark:text-[#d4a8ff]',
  pending: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  needs_grading: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  all_graded: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  active: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300',
  closed: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50',
};

const STATUS_LABELS = {
  overdue: 'Overdue',
  late: 'Late',
  submitted: 'Submitted',
  graded: 'Graded',
  extension: 'Extension',
  pending: 'Pending',
  needs_grading: 'Needs grading',
  all_graded: 'All graded',
  active: 'Active',
  closed: 'Closed',
};

/**
 * Compact status pill matching the Assignments list mock.
 */
const AssignmentStatusBadge = ({ status, label, className }) => {
  const key = (status || 'pending').toLowerCase();
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
          STATUS_STYLES[key] || STATUS_STYLES.pending,
          className,
        ),
      )}
    >
      {label || STATUS_LABELS[key] || status}
    </span>
  );
};

export default AssignmentStatusBadge;
