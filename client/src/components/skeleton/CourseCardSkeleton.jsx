import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { clsx } from 'clsx';

/**
 * Mirrors CourseCard layout for catalog, dashboard, and landing variants.
 */
export function CourseCardSkeleton({
  variant = 'light',
  className,
  showFooter = true,
}) {
  const isDark = variant === 'dark' || variant === 'landing';

  return (
    <div
      className={clsx(
        'flex flex-col min-h-[360px]',
        isDark
          ? 'rounded-3xl sm:rounded-[40px] border border-white/10 bg-white/5 p-1'
          : 'rounded-[40px] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton
        className={clsx(
          'w-full shrink-0 mb-4',
          isDark
            ? 'h-[190px] sm:h-[170px] lg:h-[155px] rounded-[22px]'
            : 'h-[155px] rounded-[22px]',
        )}
      />

      <div className="flex-1 space-y-3 px-0.5 sm:px-1">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>

      {showFooter && (
        <>
          <div className={clsx('w-full h-[1px] my-4', isDark ? 'bg-white/5' : 'bg-black/10 dark:bg-white/10')} />
          <div className="flex justify-between items-center px-0.5 sm:px-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </>
      )}
    </div>
  );
}

export function CourseGridSkeleton({
  count = 4,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  variant = 'light',
  className,
}) {
  return (
    <div className={clsx('grid gap-6', columns, className)} role="status" aria-label="Loading courses">
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export function CourseCarouselSkeleton({
  count = 4,
  variant = 'landing',
  className,
}) {
  return (
    <div className={clsx('flex gap-4 sm:gap-6 overflow-hidden py-3', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton
          key={i}
          variant={variant}
          className="w-[min(calc(100vw-3rem),360px)] sm:w-[300px] flex-shrink-0 snap-center min-h-[420px] sm:min-h-[400px] lg:h-[360px]"
          showFooter={false}
        />
      ))}
    </div>
  );
}

export function EnrolledCourseCardSkeleton({ className }) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden rounded-xl',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}

export function EnrolledCoursesGridSkeleton({ count = 3, className }) {
  return (
    <div
      className={clsx('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full', className)}
      role="status"
      aria-label="Loading your courses"
    >
      {Array.from({ length: count }, (_, i) => (
        <EnrolledCourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
