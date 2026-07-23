import React from 'react';
import {
  BookOpen,
  CheckCircle,
  Flame,
  PlayCircle,
  Trophy,
  MessageSquare,
  Award,
  Activity,
} from 'lucide-react';

const ICONS = {
  enrolled: BookOpen,
  watch: PlayCircle,
  completed: Trophy,
  'assignment-submitted': CheckCircle,
  'assignment-graded': CheckCircle,
  feedback: MessageSquare,
  certificate: Award,
  streak: Flame,
};

const COLORS = {
  enrolled: 'text-primary-pink',
  watch: 'text-primary-pink',
  completed: 'text-amber-400',
  'assignment-submitted': 'text-green-400',
  'assignment-graded': 'text-emerald-400',
  feedback: 'text-primary-purple',
  certificate: 'text-amber-400',
  streak: 'text-orange-400',
};

const RecentActivityFeed = ({ activities = [], onActivityClick, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse gap-4">
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-2 w-1/4 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="rounded-[32px] border border-gray-200 bg-white/95 p-6 text-center shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06]">
        <Activity className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-white/20" />
        <p className="text-sm font-medium text-gray-500 dark:text-white/50">No activity yet</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-white/35">
          Start a lesson and your progress will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
      {activities.map((activity, index) => {
        const Icon = ICONS[activity.kind] || Activity;
        const color = COLORS[activity.kind] || 'text-gray-400';
        const clickable = typeof onActivityClick === 'function';

        return (
          <button
            key={activity.id}
            type="button"
            onClick={() => onActivityClick?.(activity)}
            disabled={!clickable}
            className={`relative flex w-full items-start gap-4 text-left ${
              clickable ? 'cursor-pointer rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]' : 'cursor-default'
            }`}
          >
            {index < activities.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-gray-200 dark:bg-white/15" />
            )}
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100 dark:bg-white/[0.1] dark:ring-white/[0.08] ${color}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-xs font-medium leading-relaxed text-gray-900 dark:text-white/80">
                {activity.text}
              </p>
              <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">{activity.time}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RecentActivityFeed;
