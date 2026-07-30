import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import heroBackground from '@/assets/hero-background.webp';

export function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-shrink-0 w-72 flex-col h-[100dvh] bg-white/60 dark:bg-[#0a0b12]/92 backdrop-blur-3xl border-r border-gray-200 dark:border-white/10 z-50">
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-gray-200 dark:border-white/5">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-5 w-28" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded-lg shrink-0" />
            <Skeleton className="h-3.5 flex-1" style={{ maxWidth: `${55 + i * 8}%` }} />
          </div>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="h-5 w-5 rounded-lg shrink-0" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
    </aside>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="h-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between gap-4 px-5 shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Skeleton className="h-9 w-9 rounded-xl lg:hidden shrink-0" />
        <Skeleton className="hidden md:block h-10 w-96 max-w-full rounded-xl" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </header>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-white/[0.04] p-6">
      <Skeleton className="h-12 w-12 rounded-xl mb-4" />
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function PanelSkeleton({ rows = 3, hasAvatar = false }) {
  return (
    <div className="rounded-[32px] border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-white/[0.04] p-6 space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          {hasAvatar ? (
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          ) : (
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3" style={{ width: `${70 - i * 8}%` }} />
            <Skeleton className="h-2 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListPageSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-2xl" />
      <PanelSkeleton rows={rows} />
    </div>
  );
}

export function TablePageSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>
      <div className="rounded-[24px] border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-white/[0.04] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.06] flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="p-4 border-b border-gray-200 dark:border-white/[0.04] last:border-0 flex gap-4 items-center">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <Skeleton className="h-3 flex-1" style={{ maxWidth: `${60 - i * 5}%` }} />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      ))}
      <Skeleton className="h-12 w-32 rounded-xl" />
    </div>
  );
}

export function CardListSkeleton({ count = 3, height = 128 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-[24px] border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-white/[0.04] p-6 flex gap-4"
          style={{ minHeight: height }}
        >
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LearnerDashboardContentSkeleton() {
  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <PanelSkeleton rows={i === 1 ? 2 : 3} hasAvatar={i === 2} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InstructorDashboardContentSkeleton() {
  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="rounded-[32px] border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-white/[0.04] p-6 space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <PanelSkeleton rows={4} hasAvatar />
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardContentSkeleton() {
  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <PanelSkeleton rows={5} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <CardListSkeleton count={3} height={96} />
        </div>
      </div>
    </div>
  );
}

const CONTENT_VARIANTS = {
  learner: LearnerDashboardContentSkeleton,
  instructor: InstructorDashboardContentSkeleton,
  admin: AdminDashboardContentSkeleton,
  list: ListPageSkeleton,
  table: TablePageSkeleton,
  form: FormPageSkeleton,
  cardList: CardListSkeleton,
};

export function DashboardContentSkeleton({ variant = 'learner', ...props }) {
  const Component = CONTENT_VARIANTS[variant] || LearnerDashboardContentSkeleton;
  return <Component {...props} />;
}

export function DashboardShell({ children, ariaLabel = 'Loading dashboard' }) {
  return (
    <div
      className="min-h-[100dvh] h-[100dvh] bg-gray-100 dark:bg-black flex font-satoshi relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={heroBackground}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-gray-50 dark:via-black/40 dark:to-black" />
      </div>

      <SidebarSkeleton />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10 min-w-0">
        <HeaderSkeleton />

        <div className="flex-1 min-h-0 px-3 sm:px-4 pt-3 sm:pt-4 pb-0 overflow-hidden">
          <div className="h-full bg-white dark:bg-[#070709] rounded-t-2xl overflow-y-auto scrollbar-hide border border-b-0 border-gray-200 dark:border-white/[0.08] shadow-sm">
            <div className="p-6 sm:p-8 lg:p-10">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
