import React, { useEffect, useState } from 'react';
import { Search, Users, Mail, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import adminService from '@/features/admin/services/adminService';
import Skeleton from '@/components/ui/Skeleton';

const statusStyle = {
  active: 'bg-green-500/10 text-green-600 dark:text-green-400',
  approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
  pending_approval: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  pending_enrollment: 'bg-blue-500/10 text-blue-500',
  rejected: 'bg-red-500/10 text-red-500',
};

const roleStyle = {
  admin: 'text-primary-purple',
  instructor: 'text-primary-pink',
  learner: 'text-blue-400',
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    adminService
      .getUsers()
      .then((res) => { if (!cancelled) setUsers(res.data || []); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load users');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.userName?.toLowerCase().includes(q) ||
      u.userEmail?.toLowerCase().includes(q);
    const matchesRole =
      roleFilter === 'all' || u.primaryRole === roleFilter || u.roleNames?.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const counts = {
    all: users.length,
    learner: users.filter((u) => u.primaryRole === 'learner').length,
    instructor: users.filter((u) => u.roleNames?.includes('instructor')).length,
    admin: users.filter((u) => u.roleNames?.includes('admin')).length,
  };

  return (
    <DashboardLayout title="User Center" subtitle="Manage all platform users.">
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary-pink/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'learner', 'instructor', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  roleFilter === role
                    ? 'bg-primary-pink text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {role} ({counts[role] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[32px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  {['User', 'Email', 'Role', 'Status', 'Verified'].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-white/5">
                      <td colSpan={5} className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-white/40">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-purple/10 flex items-center justify-center text-primary-purple font-bold text-sm shrink-0">
                            {(user.userName || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{user.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                          <Mail size={13} className="shrink-0 opacity-50" />
                          {user.userEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(user.roleNames || [user.primaryRole]).map((role) => (
                            <span key={role} className={`flex items-center gap-1 text-xs font-bold capitalize ${roleStyle[role] || 'text-gray-500'}`}>
                              <Shield size={11} /> {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyle[user.status] || statusStyle.active}`}>
                          {user.status === 'pending_approval' ? <Clock size={10} /> : user.status === 'rejected' ? <XCircle size={10} /> : <CheckCircle size={10} />}
                          {user.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${user.isVerified ? 'text-green-500' : 'text-gray-400'}`}>
                          {user.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
              <Users size={14} />
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
