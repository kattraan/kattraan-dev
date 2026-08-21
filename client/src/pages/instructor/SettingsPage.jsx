import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  User, Bell, Shield, Wallet, Mail, AtSign, BadgeCheck, CheckCircle, Lock, IndianRupee,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isApprovedInstructor } from '@/features/auth/utils/roleUtils';
import adminService from '@/features/admin/services/adminService';
import { ROUTES } from '@/config/routes';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'payouts', label: 'Payouts', icon: Wallet },
];

const NOTIFY_DEFAULTS = {
  product: true,
  emailDigest: true,
  courseReviews: true,
  security: true,
};

function loadNotifyPrefs(userId) {
  try {
    const raw = localStorage.getItem(`settings.notify.${userId || 'anon'}`);
    return raw ? { ...NOTIFY_DEFAULTS, ...JSON.parse(raw) } : { ...NOTIFY_DEFAULTS };
  } catch {
    return { ...NOTIFY_DEFAULTS };
  }
}

function formatCurrency(n) {
  return `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
}

const Field = ({ icon: Icon, label, children }) => (
  <div className="space-y-2">
    <label className="text-gray-700 dark:text-white/80 text-sm font-bold ml-1 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-primary-pink" />}
      {label}
    </label>
    <div className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-[28px] py-4 px-6 text-gray-900 dark:text-white text-sm">
      {children}
    </div>
  </div>
);

const ToggleRow = ({ label, description, checked, onChange }) => (
  <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.03] cursor-pointer">
    <div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">{description}</p>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-5 w-5 accent-[#9e30ff]"
    />
  </label>
);

const SettingsPage = () => {
  const user = useSelector((state) => state.auth?.user);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdminContext = location.pathname.startsWith(ROUTES.ADMIN_DASHBOARD);
  const isInstructor = isApprovedInstructor(user);

  const tabFromUrl = searchParams.get('tab');
  const activeTab = TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'profile';

  const [notify, setNotify] = useState(() => loadNotifyPrefs(user?._id));
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    setNotify(loadNotifyPrefs(user?._id));
  }, [user?._id]);

  useEffect(() => {
    if (!isAdminContext || activeTab !== 'payouts') return;
    let cancelled = false;
    adminService.getStats()
      .then((res) => { if (!cancelled) setPlatformStats(res.data || null); })
      .catch(() => { if (!cancelled) setPlatformStats(null); });
    return () => { cancelled = true; };
  }, [isAdminContext, activeTab]);

  const setTab = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'profile') next.delete('tab');
    else next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  const updateNotify = (key, value) => {
    const next = { ...notify, [key]: value };
    setNotify(next);
    try {
      localStorage.setItem(`settings.notify.${user?._id || 'anon'}`, JSON.stringify(next));
    } catch { /* ignore quota */ }
  };

  const displayName = user?.userName ?? user?.name ?? '—';
  const displayEmail = user?.userEmail ?? user?.email ?? '—';
  const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
  const roleLabel = roles.length
    ? roles.map((r) => String(r).charAt(0).toUpperCase() + String(r).slice(1)).join(', ')
    : '—';
  const status = user?.status ?? '—';
  const invoice = user?.enrollmentData?.invoiceAddress;

  const payoutCopy = useMemo(() => {
    if (isAdminContext) {
      return {
        title: 'Platform revenue',
        subtitle: 'Paid checkouts captured on the platform (test amounts under ₹50 are excluded).',
      };
    }
    return {
      title: 'Payouts',
      subtitle: isInstructor
        ? 'Bank and invoice details used for instructor payouts.'
        : 'Payout details apply when you teach on the platform.',
    };
  }, [isAdminContext, isInstructor]);

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences and profile information.">
      <div className="space-y-10 font-satoshi">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="space-y-2">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`sidebar-nav-link w-full flex items-center gap-3 px-6 py-3 rounded-2xl select-none ${
                    active
                      ? 'inner-nav-active text-white'
                      : 'text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : ''} />
                  <span className="text-sm font-bold">{item.label}</span>
                </button>
              );
            })}
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 transition-colors duration-300">
              {activeTab === 'profile' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Personal Information</h2>
                  {user ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field icon={AtSign} label="Display Name">{displayName}</Field>
                        <Field icon={Mail} label="Email">{displayEmail}</Field>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field icon={BadgeCheck} label="Role(s)">{roleLabel}</Field>
                        <Field label="Account Status">
                          <span className="capitalize">{String(status).replace(/_/g, ' ')}</span>
                        </Field>
                      </div>
                      {user?.enrollmentData?.bio && (
                        <Field label="About You">
                          <span className="whitespace-pre-wrap">{user.enrollmentData.bio}</span>
                        </Field>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-white/50 text-sm">Sign in to see your profile details.</p>
                  )}
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h2>
                  <p className="text-sm text-gray-500 dark:text-white/40 mb-8">Choose which alerts you want on this device.</p>
                  <div className="space-y-3">
                    <ToggleRow
                      label="Product updates"
                      description="New features and platform announcements"
                      checked={notify.product}
                      onChange={(v) => updateNotify('product', v)}
                    />
                    <ToggleRow
                      label="Email digest"
                      description="Weekly summary of activity"
                      checked={notify.emailDigest}
                      onChange={(v) => updateNotify('emailDigest', v)}
                    />
                    <ToggleRow
                      label="Course reviews"
                      description="When a course needs attention"
                      checked={notify.courseReviews}
                      onChange={(v) => updateNotify('courseReviews', v)}
                    />
                    <ToggleRow
                      label="Security alerts"
                      description="Sign-in and password events"
                      checked={notify.security}
                      onChange={(v) => updateNotify('security', v)}
                    />
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Security</h2>
                  <div className="space-y-6">
                    <Field icon={Mail} label="Sign-in email">{displayEmail}</Field>
                    <Field icon={CheckCircle} label="Email verification">
                      {user?.isVerified ? 'Verified' : 'Not verified'}
                    </Field>
                    <Field icon={Lock} label="Password">
                      Managed through email reset. Use Forgot password on the login page to change it.
                    </Field>
                  </div>
                </>
              )}

              {activeTab === 'payouts' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{payoutCopy.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-white/40 mb-8">{payoutCopy.subtitle}</p>
                  {isAdminContext ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field icon={IndianRupee} label="Captured revenue">
                        {platformStats ? formatCurrency(platformStats.totalRevenue) : 'Loading…'}
                      </Field>
                      <Field icon={Wallet} label="Paid checkouts">
                        {platformStats ? String(platformStats.paidCheckouts || 0) : 'Loading…'}
                      </Field>
                    </div>
                  ) : invoice ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Display name">{invoice.displayName || '—'}</Field>
                      <Field label="GST / legal name">{invoice.gstRegName || '—'}</Field>
                      <Field label="Address">{invoice.address || '—'}</Field>
                      <Field label="Pincode">{invoice.pincode || '—'}</Field>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-white/40">
                      No payout details on file yet. Add them from your account payment settings when available.
                    </p>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
