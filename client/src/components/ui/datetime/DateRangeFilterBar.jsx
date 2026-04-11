import React from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args) {
  return twMerge(clsx(args));
}

const dateInputClass =
  'min-w-0 w-[min(100%,11.5rem)] rounded-lg border border-gray-200/90 bg-gray-50 px-2.5 py-2 text-sm font-medium text-gray-900 backdrop-blur-sm ' +
  'dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:backdrop-blur-md ' +
  '[color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary-pink/30 focus:border-primary-pink/40';

const labelClass =
  'block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-white/35 mb-1';

/**
 * From / to date filter using `YYYY-MM-DD` strings (empty = no filter).
 * Optional refresh control for learner dashboards.
 */
export default function DateRangeFilterBar({
  filterStart,
  filterEnd,
  onChangeStart,
  onChangeEnd,
  onClear,
  onRefresh,
  loading = false,
  className,
}) {
  const hasRange = Boolean(filterStart || filterEnd);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 shrink-0 pb-0.5 sm:pb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF8C42]/12 to-[#FF3FB4]/12 text-primary-pink ring-1 ring-gray-200/60 dark:ring-white/[0.1]">
            <Filter className="w-4 h-4" aria-hidden />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Date range</p>
            <p className="text-[11px] text-gray-500 dark:text-white/40 hidden sm:block">
              Narrow by session day
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0">
            <label htmlFor="live-filter-from" className={labelClass}>
              From
            </label>
            <input
              id="live-filter-from"
              type="date"
              value={filterStart || ''}
              onChange={(e) => onChangeStart?.(e.target.value)}
              className={dateInputClass}
            />
          </div>
          <span
            className="hidden sm:flex items-center justify-center pb-2 text-gray-300 dark:text-white/20 select-none text-sm"
            aria-hidden
          >
            →
          </span>
          <div className="min-w-0">
            <label htmlFor="live-filter-to" className={labelClass}>
              To
            </label>
            <input
              id="live-filter-to"
              type="date"
              value={filterEnd || ''}
              onChange={(e) => onChangeEnd?.(e.target.value)}
              className={dateInputClass}
            />
          </div>
          {hasRange ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-xs font-bold text-gray-600 backdrop-blur-sm transition-colors hover:bg-gray-100 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white/70 dark:backdrop-blur-md dark:hover:bg-white/[0.1]"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {onRefresh ? (
        <div className="shrink-0 flex items-stretch sm:pl-4 sm:border-l sm:border-gray-200/90 dark:sm:border-white/[0.08]">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-800 backdrop-blur-sm transition-colors hover:border-primary-pink/35 hover:bg-white disabled:opacity-50 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white/90 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] dark:backdrop-blur-xl dark:hover:border-primary-pink/40 dark:hover:bg-white/[0.1] sm:w-auto"
            aria-label="Refresh sessions"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} aria-hidden />
            Refresh
          </button>
        </div>
      ) : null}
    </div>
  );
}
