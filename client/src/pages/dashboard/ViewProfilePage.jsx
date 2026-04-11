import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Edit2 } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { SOCIAL_ICONS } from '@/components/icons/SocialPlatformIcons';

const TABS = [{ id: 'posts', label: 'Posts' }];

const PLATFORM_ORDER = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'];

export default function ViewProfilePage() {
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');

  const displayName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user?.userName || user?.name || user?.user_name || user?.full_name || 'User';
  const bio = user?.enrollmentData?.bio || user?.bio || null;
  const socialLinks = user?.enrollmentData?.socialLinks || {};
  const displayOnProfile = user?.enrollmentData?.socialDisplayOnProfile || {};
  const visibleSocials = PLATFORM_ORDER.filter((id) => displayOnProfile[id] && socialLinks[id]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-satoshi">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {user?.profilePicture || user?.profileImage ? (
            <img
              src={user.profilePicture || user.profileImage}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <User size={40} className="text-gray-400 dark:text-white/30" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {displayName}
          </h1>
          <button
            type="button"
            onClick={() => navigate(ROUTES.DASHBOARD_MY_ACCOUNT)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/80 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <Edit2 size={16} />
            Edit profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-white/10 mb-8">
        <div className="flex gap-8" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-pink border-primary-pink'
                  : 'text-gray-500 dark:text-white/40 border-transparent hover:text-gray-700 dark:hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bio + Social links section */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Bio</h3>
            <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed whitespace-pre-wrap mb-4">
              {bio || 'Not added yet.'}
            </p>
            {visibleSocials.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                {visibleSocials.map((id) => {
                  const Icon = SOCIAL_ICONS[id];
                  const url = socialLinks[id];
                  const href = url?.startsWith('http') ? url : url ? `https://${url}` : null;
                  if (!href || !Icon) return null;
                  return (
                    <a
                      key={id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-white/5 hover:opacity-80 transition-opacity"
                      aria-label={`${id} profile`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Feed Posts */}
        <main className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Feed Posts</h3>
          </div>
          <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/10 p-12 flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center mb-4">
              <User size={40} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="text-sm text-gray-600 dark:text-white/60 max-w-[280px]">
              Start creating content! You can post photos, videos, audios and even links! Let's go 👋
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
