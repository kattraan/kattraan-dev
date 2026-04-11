import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { hasRole } from "@/features/auth/utils/roleUtils";
import { ROUTES } from "@/config/routes";
import { logout } from "@/features/auth/store/authSlice";

const InstructorHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const buttonRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, right: 0 });
  const isInstructor = location.pathname.startsWith("/instructor-dashboard");

  const displayName =
    user?.userName || user?.name || user?.email?.split("@")[0] || "Member";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current?.contains(e.target) ||
        e.target.closest("[data-profile-dropdown]")
      )
        return;
      setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showProfileMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showProfileMenu]);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-5 sticky top-0 z-50 transition-colors duration-300">
      {/* Search Bar */}
      <div className="relative w-96 max-w-full hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/20" />
        <input
          type="text"
          placeholder="Search courses, lessons, assignments..."
          className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-full pl-12 pr-6 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-pink/30 transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Role Switcher - Professional pill toggle */}
        {hasRole(user, "instructor") && (
          <div className="flex items-center rounded-full p-1 bg-gray-100/80 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 shadow-inner transition-colors duration-300">
            <Link
              to="/dashboard"
              className={`min-w-[76px] px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${
                !isInstructor
                  ? "bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-md shadow-primary-pink/25"
                  : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
              }`}
            >
              Learner
            </Link>
            <Link
              to={ROUTES.INSTRUCTOR_DASHBOARD}
              className={`min-w-[76px] px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${
                isInstructor
                  ? "bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-md shadow-primary-pink/25"
                  : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
              }`}
            >
              Instructor
            </Link>
          </div>
        )}

        <button className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-white/40 dark:hover:text-white transition-all group">
          <Bell
            size={20}
            className="group-hover:text-primary-pink transition-colors"
          />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-pink rounded-full border-2 border-white dark:border-[#0c091a]" />
        </button>

        <div
          className="relative flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-white/10"
          ref={profileRef}
        >
          <div className="text-right hidden sm:block">
            <p className="text-gray-900 dark:text-white text-sm font-black transition-colors duration-300">
              {displayName}
            </p>
            <p className="text-primary-pink text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-1.5">
              {hasRole(user, "admin") ? "Administrator" : "Instructor"}
            </p>
          </div>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary-pink/20 object-cover shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF3FB4] shadow-lg shadow-pink-500/20 border border-white/20 flex items-center justify-center text-white font-black text-base italic">
                {(user?.name ||
                  user?.userName ||
                  user?.user_name ||
                  user?.full_name ||
                  user?.email ||
                  "K")[0].toUpperCase()}
              </div>
            )}
            <ChevronDown
              size={14}
              className={`text-gray-500 dark:text-white/40 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
            />
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
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        size={20}
                        className="text-gray-500 dark:text-white/40"
                      />
                    )}
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {displayName}
                  </span>
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
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </header>
  );
};

export default InstructorHeader;
