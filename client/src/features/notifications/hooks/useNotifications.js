import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/services/notificationService';
import { connectSocket, disconnectSocket } from '@/lib/socket';

/**
 * Loads notifications for the logged-in user and keeps them live via socket.
 */
export function useNotifications() {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const { items: next, unreadCount: count } = await fetchNotifications({ limit: 40 });
      setItems(Array.isArray(next) ? next : []);
      setUnreadCount(Number(count) || 0);
    } catch {
      /* keep previous list on transient errors */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      disconnectSocket();
      return undefined;
    }

    refresh();
    const socket = connectSocket();

    const onNotification = (payload) => {
      if (!payload?.id) return;
      setItems((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev].slice(0, 40);
      });
      if (!payload.isRead) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on('notification', onNotification);

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      socket.off('notification', onNotification);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(async (id) => {
    let wasUnread = false;
    setItems((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        wasUnread = !n.isRead;
        return { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() };
      }),
    );
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      const { unreadCount: count } = await markNotificationRead(id);
      setUnreadCount(Number(count) || 0);
    } catch {
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  return {
    items,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
}
