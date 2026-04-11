import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Share2,
  CreditCard,
  Key,
  LogOut,
  Trash2,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { logout } from '@/features/auth/store/authSlice';

const ACCOUNT_CARDS = [
  {
    icon: User,
    title: 'View profile',
    description: 'View your profile page as others see it',
    path: ROUTES.DASHBOARD_PROFILE,
  },
  {
    icon: User,
    title: 'Personal information',
    description: 'Update your name, bio, gender, birthday and more',
    path: ROUTES.DASHBOARD_PERSONAL_DETAILS,
  },
  {
    icon: Share2,
    title: 'Social accounts',
    description: 'Connect your social accounts',
    path: ROUTES.DASHBOARD_SOCIAL_ACCOUNTS,
  },
  {
    icon: CreditCard,
    title: 'Payment details',
    description: 'Manage your bank account & other payment details',
    path: ROUTES.DASHBOARD_PAYMENT_DETAILS,
  },
  {
    icon: Key,
    title: 'Update number/email',
    description: 'View and update registered phone number & email',
    path: ROUTES.DASHBOARD_UPDATE_CONTACT,
  },
  {
    icon: Settings,
    title: 'Settings',
    description: 'Manage notifications and messages settings',
    path: null, // Uses role-based path
  },
];

export default function MyAccountPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const displayName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user?.userName || user?.name || user?.user_name || user?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = (displayName || 'U')[0].toUpperCase();

  const getCardPath = (card) => {
    if (card.path) return card.path;
    if (card.title === 'Settings') {
      return hasRole(user, 'instructor') ? ROUTES.INSTRUCTOR_SETTINGS : ROUTES.DASHBOARD_SETTINGS;
    }
    return null;
  };

  const handleCardClick = (card) => {
    const path = getCardPath(card);
    if (path) navigate(path);
    // Social accounts, Payment details, Update number/email - placeholder for now
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: upload profile photo via API
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-satoshi">
      {/* Greeting card */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm dark:shadow-none">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Hello, {displayName?.toUpperCase?.() || displayName}
        </h1>
        <button
          type="button"
          onClick={handleProfilePhotoClick}
          className="relative shrink-0 w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary-pink/40 transition-all"
          aria-label="Change profile photo"
        >
          {user?.profilePicture || user?.profileImage ? (
            <img
              src={user.profilePicture || user.profileImage}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-2xl font-black text-gray-400 dark:text-white/40">{initial}</span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera size={24} className="text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>
      </div>

      {/* 2x3 grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {ACCOUNT_CARDS.map((card, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleCardClick(card)}
            className="group text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-white/10 p-6 hover:border-primary-pink/30 hover:shadow-lg hover:shadow-primary-pink/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 text-primary-pink group-hover:scale-105 transition-transform">
                  <card.icon size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">{card.description}</p>
              </div>
              <ChevronRight
                size={20}
                className="shrink-0 text-gray-400 dark:text-white/30 group-hover:text-primary-pink group-hover:translate-x-1 transition-all"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Logout & Delete */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-sm font-bold shadow-lg shadow-primary-pink/20 hover:opacity-90 transition-all"
        >
          Logout
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 size={16} />
          Permanently delete your account
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete account</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-6">
              This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
