import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/**
 * Active notification bell for dashboard headers.
 * Shows unread badge, dropdown list, mark-read, and navigates to related pages.
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open) return undefined;
    const onOutside = (e) => {
      if (wrapRef.current?.contains(e.target) || e.target.closest('[data-notification-dropdown]')) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      await markRead(item.id);
    }
    setOpen(false);
    if (item.link && item.link.startsWith('/')) {
      navigate(item.link);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-white/40 dark:hover:text-white transition-all group"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={20} className="group-hover:text-primary-pink transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary-pink text-white text-[10px] font-black border-2 border-white dark:border-[#0c091a]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            data-notification-dropdown
            className="fixed w-[min(100vw-1.5rem,22rem)] bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            style={{ top: dropdownRect.top, right: dropdownRect.right }}
            role="menu"
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/5">
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">Notifications</p>
                <p className="text-[11px] text-gray-500 dark:text-white/40 font-medium">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-pink hover:opacity-80 transition-opacity"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[min(70vh,24rem)] overflow-y-auto">
              {loading && items.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-white/40">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-white/15" />
                  <p className="text-sm font-bold text-gray-700 dark:text-white/70">No notifications yet</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-1 leading-relaxed">
                    Course updates, grades, live classes, and certificates will show up here.
                  </p>
                </div>
              )}

              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-white/[0.04] last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                    item.isRead ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!item.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-pink shrink-0" aria-hidden />
                    )}
                    <div className={`min-w-0 flex-1 ${item.isRead ? 'pl-4' : ''}`}>
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="text-xs text-gray-500 dark:text-white/45 mt-0.5 leading-relaxed line-clamp-2">
                          {item.body}
                        </p>
                      )}
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-white/30 mt-1.5 uppercase tracking-wide">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
