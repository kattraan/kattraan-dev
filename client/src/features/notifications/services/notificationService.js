import apiClient from '@/api/apiClient';

/** GET /api/notifications */
export async function fetchNotifications({ limit = 40, unreadOnly = false } = {}) {
  const res = await apiClient.get('/notifications', {
    params: { limit, unreadOnly: unreadOnly ? 'true' : undefined },
  });
  return {
    items: res?.data?.data ?? [],
    unreadCount: res?.data?.unreadCount ?? 0,
  };
}

/** GET /api/notifications/unread-count */
export async function fetchUnreadCount() {
  const res = await apiClient.get('/notifications/unread-count');
  return res?.data?.data?.count ?? 0;
}

/** PATCH /api/notifications/:id/read */
export async function markNotificationRead(id) {
  const res = await apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  return {
    item: res?.data?.data ?? null,
    unreadCount: res?.data?.unreadCount ?? 0,
  };
}

/** PATCH /api/notifications/read-all */
export async function markAllNotificationsRead() {
  const res = await apiClient.patch('/notifications/read-all');
  return res?.data?.data ?? { modified: 0 };
}
