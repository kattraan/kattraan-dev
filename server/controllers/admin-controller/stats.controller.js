const mongoose = require('mongoose');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Course = require('../../models/Course');
const Order = require('../../models/Order');
const LearnerCourses = require('../../models/LearnerCourses');
const Community = require('../../models/Community');
const AuditLog = require('../../models/AuditLog');

const ACTION_LABELS = {
  SIGNUP: 'New account registered',
  EMAIL_VERIFIED: 'Email verified',
  LOGIN: 'User signed in',
  LOGIN_FAILED: 'Failed sign-in attempt',
  LOGOUT: 'User signed out',
  LOGOUT_ALL: 'Signed out of all devices',
  PASSWORD_RESET_REQUEST: 'Password reset requested',
  PASSWORD_RESET_SUCCESS: 'Password reset completed',
};

function formatActivityMessage(log, userName) {
  const name = userName || log.details?.email || 'Someone';
  switch (log.action) {
    case 'SIGNUP':
      return `${name} joined the platform`;
    case 'EMAIL_VERIFIED':
      return `${name} verified their email`;
    case 'LOGIN':
      return `${name} signed in`;
    case 'LOGIN_FAILED':
      return `Failed sign-in for ${log.details?.email || name}`;
    case 'LOGOUT':
    case 'LOGOUT_ALL':
      return `${name} signed out`;
    case 'PASSWORD_RESET_REQUEST':
      return `${name} requested a password reset`;
    case 'PASSWORD_RESET_SUCCESS':
      return `${name} reset their password`;
    default:
      return `${name} — ${log.action}`;
  }
}

/**
 * GET /api/admin/stats
 * Platform-wide overview for the admin dashboard.
 */
async function getAdminStats(req, res) {
  try {
    const instructorRole = await Role.findOne({ roleName: 'instructor' }).lean();
    const instructorRoleId = instructorRole?.roleId;

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeInstructors,
      totalCourses,
      publishedCourses,
      draftCourses,
      pendingInstructorApps,
      pendingCourseReviews,
      enrollmentAgg,
      revenueAgg,
      totalCommunities,
      failedLogins24h,
      newUsers30d,
      newCourses30d,
      recentLogs,
      recentCourses,
    ] = await Promise.all([
      User.countDocuments(),
      instructorRoleId
        ? User.countDocuments({ roles: instructorRoleId, status: 'approved' })
        : 0,
      Course.countDocuments({ isDeleted: { $ne: true } }),
      Course.countDocuments({ status: 'published', isDeleted: { $ne: true } }),
      Course.countDocuments({ status: 'draft', isDeleted: { $ne: true } }),
      User.countDocuments({ status: 'pending_approval' }),
      Course.countDocuments({ status: 'pending_approval', isDeleted: { $ne: true } }),
      LearnerCourses.aggregate([
        { $project: { count: { $size: { $ifNull: ['$courses', []] } } } },
        { $group: { _id: null, total: { $sum: '$count' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$coursePricing' } } },
      ]),
      Community.countDocuments({ isDeleted: { $ne: true } }),
      AuditLog.countDocuments({ action: 'LOGIN_FAILED', createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ action: 'SIGNUP', createdAt: { $gte: last30Days } }),
      Course.countDocuments({
        isDeleted: { $ne: true },
        createdAt: { $gte: last30Days },
      }),
      AuditLog.find({ action: { $in: ['SIGNUP', 'EMAIL_VERIFIED', 'LOGIN', 'LOGIN_FAILED', 'PASSWORD_RESET_REQUEST'] } })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'userName userEmail')
        .lean(),
      Course.find({ isDeleted: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status updatedAt createdBy learners')
        .populate('createdBy', 'userName')
        .lean(),
    ]);

    const totalEnrollments = enrollmentAgg[0]?.total || 0;
    const totalRevenue = Math.round(revenueAgg[0]?.total || 0);
    const pendingActions = pendingInstructorApps + pendingCourseReviews;

    const recentActivity = recentLogs.map((log) => ({
      id: log._id,
      action: log.action,
      title: ACTION_LABELS[log.action] || log.action,
      message: formatActivityMessage(log, log.userId?.userName),
      email: log.userId?.userEmail || log.details?.email || null,
      createdAt: log.createdAt,
      severity: log.action === 'LOGIN_FAILED' ? 'warning' : 'info',
    }));

    const pendingItems = [];
    if (pendingInstructorApps > 0) {
      pendingItems.push({
        type: 'instructor',
        label: 'Instructor applications',
        count: pendingInstructorApps,
        path: '/admin-dashboard/instructors',
      });
    }
    if (pendingCourseReviews > 0) {
      pendingItems.push({
        type: 'course',
        label: 'Courses awaiting review',
        count: pendingCourseReviews,
        path: '/admin-dashboard/courses',
      });
    }

    const dbHealthy = mongoose.connection.readyState === 1;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeInstructors,
        totalCourses,
        publishedCourses,
        draftCourses,
        pendingInstructorApps,
        pendingCourseReviews,
        pendingActions,
        totalEnrollments,
        totalRevenue,
        totalCommunities,
        failedLogins24h,
        newUsers30d,
        newCourses30d,
        recentActivity,
        recentCourses: recentCourses.map((c) => ({
          courseId: c._id,
          title: c.title,
          status: c.status,
          learners: c.learners || 0,
          instructorName: c.createdBy?.userName || 'Unknown',
          updatedAt: c.updatedAt,
        })),
        pendingItems,
        systemHealth: {
          status: dbHealthy ? 'healthy' : 'degraded',
          database: dbHealthy ? 'connected' : 'disconnected',
          pendingActions,
          failedLogins24h,
        },
      },
    });
  } catch (err) {
    console.error('getAdminStats Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to load admin stats' });
  }
}

module.exports = { getAdminStats };
