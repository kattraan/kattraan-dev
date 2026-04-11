import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Share2, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/store/authSlice';
import BrandLogo from '@/components/common/BrandLogo';
import { ROUTES } from '@/config/routes';

export default function CourseViewPreviewHeader({ courseTitle, onClose, profileRef, showProfileMenu, setShowProfileMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const buttonRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (showProfileMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [showProfileMenu]);

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user?.name || user?.userName || user?.user_name || user?.full_name || user?.username || 'User Profile');
  const initial = (user?.firstName || user?.name || user?.userName || user?.user_name || user?.full_name || user?.username || 'U')[0];

  return (
    <header className="h-[72px] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-[#121212] relative z-20 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-all group" aria-label="Close preview">
          <ArrowLeft size={20} className="text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
        </button>
        <div className="flex items-center gap-4">
          <BrandLogo className="scale-[0.85] origin-left" />
          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" aria-hidden />
          <h1 className="text-[17px] font-bold tracking-tight text-gray-900 dark:text-white/90 truncate max-w-[400px]">
            {courseTitle || 'Course Preview'}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-bold">
          <Share2 size={14} /> Share
        </button>
        <div className="relative" ref={profileRef}>
          <button ref={buttonRef} type="button" onClick={() => setShowProfileMenu((v) => !v)} className="flex items-center gap-3 p-1 pr-4 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-primary-pink/30 transition-all group" aria-expanded={showProfileMenu} aria-haspopup="true">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-pink to-purple-600 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              {user?.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" loading="lazy" /> : <span className="text-xs font-black text-white uppercase">{initial}</span>}
            </div>
            <span className="text-[11px] font-black text-gray-700 dark:text-white/70 group-hover:text-gray-900 dark:group-hover:text-white uppercase tracking-widest hidden sm:block truncate max-w-[140px]">
              {displayName}
            </span>
            <ChevronDown size={14} className={`text-gray-500 dark:text-white/20 group-hover:text-gray-700 dark:group-hover:text-white/40 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
          {showProfileMenu &&
            createPortal(
              <div
                data-profile-dropdown
                className="fixed w-64 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[9999] animate-in fade-in zoom-in-95 duration-200"
                style={{ top: dropdownRect.top, right: dropdownRect.right }}
                role="menu"
              >
              <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-gray-500 dark:text-white/40" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{displayName}</span>
                  <span className="text-[10px] text-gray-500 dark:text-white/30 font-bold uppercase tracking-widest">Logged in</span>
                </div>
              </div>
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate(ROUTES.DASHBOARD_PROFILE);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  <User size={16} /> View profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate(ROUTES.DASHBOARD_MY_ACCOUNT);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  <Settings size={16} /> My account
                </button>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>,
              document.body
            )}
        </div>
      </div>
    </header>
  );
}
