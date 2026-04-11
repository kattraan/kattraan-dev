import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Shield, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { logout } from "@/features/auth/store/authSlice";

const AdminHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const buttonRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, right: 0 });

  const displayName = user?.userName || user?.name || "Administrator";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current?.contains(e.target) || e.target.closest("[data-profile-dropdown]")) return;
      setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showProfileMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [showProfileMenu]);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-5 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="px-4 py-1.5 rounded-full bg-primary-purple/10 dark:bg-primary-purple/10 border border-primary-purple/20 dark:border-primary-purple/20 flex items-center gap-2">
          <Shield size={14} className="text-primary-purple" />
          <span className="text-[10px] font-bold text-primary-purple uppercase tracking-widest">
            Admin Authorization Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-all">
          <Bell size={20} />
        </button>
        <div className="relative flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-white/10" ref={profileRef}>
          <div className="text-right">
            <p className="text-gray-900 dark:text-white text-sm font-bold">{displayName}</p>
            <p className="text-primary-pink text-[10px] font-bold uppercase tracking-widest">System Admin</p>
          </div>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF3FB4] shadow-lg shadow-pink-500/20 border border-gray-200/50 dark:border-white/20 flex items-center justify-center text-white font-black text-base italic">
              {(user?.name || user?.userName || "A")[0].toUpperCase()}
            </div>
            <ChevronDown size={14} className={`text-gray-500 dark:text-white/40 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
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
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{displayName}</span>
                </div>
                <div className="py-2">
                  <button type="button" onClick={() => { setShowProfileMenu(false); navigate(ROUTES.DASHBOARD_PROFILE); }} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                    <User size={16} /> View profile
                  </button>
                  <button type="button" onClick={() => { setShowProfileMenu(false); navigate(ROUTES.DASHBOARD_MY_ACCOUNT); }} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                    <Settings size={16} /> My account
                  </button>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                  <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
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
};

export default AdminHeader;
