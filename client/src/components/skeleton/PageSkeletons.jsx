import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { CourseGridSkeleton } from './CourseCardSkeleton';
import { DashboardShell, DashboardContentSkeleton } from './primitives';

export function CourseViewSkeleton() {
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-black flex flex-col"
      role="status"
      aria-label="Loading course"
    >
      <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CourseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0c091a]" role="status" aria-label="Loading course details">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black" role="status" aria-label="Loading checkout">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6" role="status" aria-label="Loading cart">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
          <Skeleton className="h-24 w-36 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MainLayoutSkeleton({ children }) {
  return (
    <div className="min-h-screen bg-[#0c091a]" role="status" aria-label="Loading page">
      <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="px-6 py-10">{children}</div>
    </div>
  );
}

export function SectionSkeleton({ height = 360, className }) {
  return (
    <div
      className={`w-full max-w-[1252px] mx-auto my-10 rounded-[32px] border border-white/10 overflow-hidden ${className || ''}`}
      style={{ minHeight: height }}
      aria-hidden="true"
    >
      <Skeleton className="h-full w-full rounded-[32px]" />
    </div>
  );
}

export function MinimalSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#0c091a] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function DashboardRouteSkeleton({ variant = 'learner' }) {
  return (
    <DashboardShell ariaLabel={`Loading ${variant} dashboard`}>
      {variant === 'courseGrid' ? (
        <div className="pb-20 space-y-8 animate-in fade-in duration-500">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-12 w-full max-w-md rounded-2xl" />
          <CourseGridSkeleton count={6} columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />
        </div>
      ) : (
        <DashboardContentSkeleton variant={variant} />
      )}
    </DashboardShell>
  );
}
