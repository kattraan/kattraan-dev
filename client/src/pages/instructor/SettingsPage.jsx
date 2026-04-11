import React from 'react';
import { useSelector } from 'react-redux';
import { User, Bell, Shield, Wallet, Mail, AtSign, BadgeCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * Shared Settings/Profile page: shows logged-in user details.
 * Used in: Student dashboard (Profile tab), Instructor dashboard (Settings tab), Admin dashboard (Settings tab).
 */
const SettingsPage = () => {
    const user = useSelector((state) => state.auth?.user);

    const displayName = user?.userName ?? user?.name ?? '—';
    const displayEmail = user?.userEmail ?? user?.email ?? '—';
    const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
    const roleLabel = roles.length ? roles.map((r) => String(r).charAt(0).toUpperCase() + String(r).slice(1)).join(', ') : '—';
    const status = user?.status ?? '—';

    return (
        <DashboardLayout title="Settings" subtitle="Manage your account preferences and profile information.">
            <div className="space-y-10 font-satoshi">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="space-y-2">
                        {[
                            { label: 'Profile', icon: User, active: true },
                            { label: 'Notifications', icon: Bell },
                            { label: 'Security', icon: Shield },
                            { label: 'Payouts', icon: Wallet },
                        ].map((item, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`w-full flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 ${item.active ? 'bg-primary-pink text-white shadow-lg shadow-primary-pink/10' : 'text-gray-600 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <item.icon size={18} />
                                <span className="text-sm font-bold">{item.label}</span>
                            </button>
                        ))}
                    </aside>

                    <main className="lg:col-span-3">
                        <div className="bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 transition-colors duration-300">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">
                                Personal Information
                            </h2>
                            {user ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-gray-700 dark:text-white/80 text-sm font-bold ml-1 flex items-center gap-2">
                                                <AtSign size={16} className="text-primary-pink" />
                                                Display Name
                                            </label>
                                            <div className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-[28px] py-4 px-6 text-gray-900 dark:text-white text-sm">
                                                {displayName}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-gray-700 dark:text-white/80 text-sm font-bold ml-1 flex items-center gap-2">
                                                <Mail size={16} className="text-primary-pink" />
                                                Email
                                            </label>
                                            <div className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-[28px] py-4 px-6 text-gray-900 dark:text-white text-sm">
                                                {displayEmail}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-gray-700 dark:text-white/80 text-sm font-bold ml-1 flex items-center gap-2">
                                                <BadgeCheck size={16} className="text-primary-pink" />
                                                Role(s)
                                            </label>
                                            <div className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-[28px] py-4 px-6 text-gray-900 dark:text-white text-sm">
                                                {roleLabel}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-gray-700 dark:text-white/80 text-sm font-bold ml-1">
                                                Account Status
                                            </label>
                                            <div className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-[28px] py-4 px-6 text-gray-900 dark:text-white text-sm capitalize">
                                                {String(status).replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                    </div>
                                    {user?.enrollmentData?.bio && (
                                        <div className="space-y-2">
                                            <label className="text-gray-700 dark:text-white/80 text-sm font-bold ml-1">
                                                About You
                                            </label>
                                            <div className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-[28px] py-4 px-6 text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                                                {user.enrollmentData.bio}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-white/50 text-sm">
                                    Sign in to see your profile details.
                                </p>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
