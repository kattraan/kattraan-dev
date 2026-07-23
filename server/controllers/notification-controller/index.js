const notificationService = require('../../services/notification.service');

async function listNotifications(req, res) {
  const limit = Number(req.query.limit) || 40;
  const unreadOnly = String(req.query.unreadOnly || '') === 'true';
  const data = await notificationService.listForUser(req.user._id, { limit, unreadOnly });
  const unread = await notificationService.unreadCount(req.user._id);
  res.json({ success: true, data, unreadCount: unread });
}

async function getUnreadCount(req, res) {
  const count = await notificationService.unreadCount(req.user._id);
  res.json({ success: true, data: { count } });
}

async function markNotificationRead(req, res) {
  const data = await notificationService.markRead(req.user._id, req.params.id);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  const unread = await notificationService.unreadCount(req.user._id);
  res.json({ success: true, data, unreadCount: unread });
}

async function markAllNotificationsRead(req, res) {
  const result = await notificationService.markAllRead(req.user._id);
  res.json({ success: true, data: result, unreadCount: 0 });
}

module.exports = {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
