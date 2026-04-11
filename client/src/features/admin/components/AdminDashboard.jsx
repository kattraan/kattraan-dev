import React from 'react';
import { Users, UserCheck, BookOpen, TrendingUp, ShieldAlert } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * Admin dashboard content: stats, activity, system health.
 * UI aligned with Learner and Instructor dashboards (same card style, typography, spacing).
 */
const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-400', trend: '+12%' },
    { label: 'Active Instructors', value: '42', icon: UserCheck, color: 'text-primary-purple', trend: '+5%' },
    { label: 'Total Courses', value: '156', icon: BookOpen, color: 'text-primary-pink', trend: '+18%' },
    { label: 'Security Alerts', value: '0', icon: ShieldAlert, color: 'text-green-400' },
  ];

  return (
    <DashboardLayout title="Overview" subtitle="Track platform health and activity.">
      <div className="space-y-10">
        {/* Stats Grid - same as Instructor dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-6 rounded-[28px] shadow-sm dark:shadow-none backdrop-blur-sm hover:border-gray-300 dark:hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 transition-colors duration-300 ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-widest transition-colors duration-300">
                    <TrendingUp size={10} /> {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-gray-400 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest leading-none transition-colors duration-300">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 leading-none transition-colors duration-300">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[32px] p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Recent Platform Activity</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-white/40 group-hover:bg-primary-purple/10 dark:group-hover:bg-primary-purple/20 group-hover:text-primary-purple transition-all duration-300">
                    <Users size={18} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-gray-800 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">New user registration</p>
                    <p className="text-xs text-gray-500 dark:text-white/30 transition-colors duration-300">User #4829 joined the platform</p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest leading-none transition-colors duration-300">2m ago</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-sm font-bold text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300">
              View All Activity
            </button>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[32px] p-8 flex flex-col justify-center text-center transition-colors duration-300">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6 text-primary-purple border border-gray-200 dark:border-white/10 transition-colors duration-300">
              <ShieldAlert size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">System Health: Optimal</h3>
            <p className="text-gray-500 dark:text-white/40 max-w-xs mx-auto mb-8 font-medium transition-colors duration-300">The infrastructure is performing at peak efficiency. No immediate actions required.</p>
            <div className="flex justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-500/20 transition-colors duration-300">Active</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/5 transition-colors duration-300">v1.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
