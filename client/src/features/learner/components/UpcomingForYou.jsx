import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ClipboardList, Video } from 'lucide-react';
import { formatUpcomingWhen } from '@/features/learner/utils/buildUpcomingItems';
import { ROUTES } from '@/config/routes';

const UpcomingForYou = ({ items = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06]">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.06]" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[32px] border border-gray-200 bg-white/95 p-6 text-center shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06]">
        <CalendarClock className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-white/20" />
        <p className="text-sm font-medium text-gray-500 dark:text-white/50">Nothing due soon</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-white/35">
          Assignments and live classes will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
      {items.map((item) => {
        const Icon = item.type === 'live' ? Video : ClipboardList;
        const handleClick = () => {
          if (item.type === 'live' && item.canJoin && item.meetingUrl) {
            window.open(item.meetingUrl, '_blank', 'noopener,noreferrer');
            return;
          }
          if (item.type === 'assignment') {
            navigate(ROUTES.DASHBOARD_ASSIGNMENTS);
            return;
          }
          if (item.type === 'live') {
            navigate(ROUTES.DASHBOARD_CLASSES);
          }
        };

        return (
          <button
            key={item.id}
            type="button"
            onClick={handleClick}
            className="flex w-full items-start gap-3 rounded-2xl border border-gray-100 p-4 text-left transition-colors hover:border-primary-pink/30 hover:bg-gray-50 dark:border-white/[0.08] dark:hover:border-primary-pink/30 dark:hover:bg-white/[0.04]"
          >
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                item.type === 'live'
                  ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10'
                  : item.overdue
                    ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                    : 'bg-purple-50 text-primary-purple dark:bg-primary-purple/10'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                {item.live ? (
                  <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                    Live
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-white/45">{item.subtitle}</p>
              <p
                className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                  item.overdue
                    ? 'text-red-500'
                    : item.urgent
                      ? 'text-amber-500'
                      : 'text-gray-400 dark:text-white/35'
                }`}
              >
                <CalendarClock className="h-3 w-3" />
                {formatUpcomingWhen(item.at)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UpcomingForYou;
