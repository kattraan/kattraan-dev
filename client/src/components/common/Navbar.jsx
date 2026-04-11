import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Menu, X, User, ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import BrandLogo from "./BrandLogo";
import navDecoration from "@/assets/nav-decoration.png";
import { logout } from "@/features/auth/store/authSlice";
import { hasRole } from "@/features/auth/utils/roleUtils";
import { ROUTES } from "@/config/routes";
import CurrencySelector from "@/components/ui/CurrencySelector";
import { useCart } from "@/context/CartContext";

const SCROLL_SOLID_THRESHOLD_PX = 40;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { count: cartCount } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // Home and categories use fixed hero-style nav (same scroll + chrome as landing).
  const isCategoriesPage =
    location.pathname === ROUTES.CATEGORIES ||
    location.pathname.startsWith(`${ROUTES.CATEGORIES}/`);
  const isHeroNavPage =
    location.pathname === ROUTES.HOME || isCategoriesPage;
  const isCourseDetailsPage =
    location.pathname === ROUTES.COURSE_DETAILS ||
    location.pathname.startsWith(`${ROUTES.COURSE_DETAILS}/`);
  const showThemeToggle = !(isHeroNavPage || isCourseDetailsPage);

  useEffect(() => {
    if (!isHeroNavPage) {
      setIsScrolled(false);
      return;
    }
    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHeroNavPage]);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const getNavItems = () => {
    const baseItems = [
      { name: "Explore", hasDropdown: true, path: ROUTES.COURSES },
      { name: "Home", hasDropdown: false, path: ROUTES.HOME },
      { name: "Courses", hasDecoration: true, path: ROUTES.COURSES },
    ];

    if (!isAuthenticated) {
      return [
        ...baseItems,
        { name: "My learnings", hasDropdown: false, path: ROUTES.LOGIN },
        {
          name: "Become an Instructor",
          hasDropdown: false,
          path: ROUTES.INSTRUCTOR_SIGNUP,
        },
        { name: "Help & Support", hasDropdown: false, path: "#" },
      ];
    }

    if (hasRole(user, "instructor")) {
      return [
        ...baseItems,
        { name: "My learnings", hasDropdown: false, path: ROUTES.DASHBOARD },
        {
          name: "Dashboard",
          hasDropdown: false,
          path: ROUTES.INSTRUCTOR_DASHBOARD,
        },
        { name: "Help & Support", hasDropdown: false, path: "#" },
      ];
    }

    if (hasRole(user, "admin")) {
      return [
        ...baseItems,
        {
          name: "Admin Panel",
          hasDropdown: false,
          path: ROUTES.ADMIN_DASHBOARD,
        },
        { name: "Help & Support", hasDropdown: false, path: "#" },
      ];
    }

    return [
      ...baseItems,
      { name: "My learnings", hasDropdown: false, path: ROUTES.DASHBOARD },
      {
        name: "Become an Instructor",
        hasDropdown: false,
        path: ROUTES.INSTRUCTOR_SIGNUP,
      },
      { name: "Help & Support", hasDropdown: false, path: "#" },
    ];
  };

  const navItems = getNavItems();

  const heroNavScrolled = isHeroNavPage && isScrolled;

  return (
    <nav
      className={`${isHeroNavPage ? "fixed" : "absolute"} top-0 left-0 right-0 z-50 pt-3 lg:pt-4 xl:pt-5 transition-[background-color,box-shadow,padding] duration-500 ease-out ${
        heroNavScrolled
          ? "pb-3 lg:pb-4 bg-[#090C03] shadow-[0_12px_40px_-4px_rgba(0,0,0,0.65)]"
          : ""
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative flex items-center justify-between">
        {/* Logo */}
        <BrandLogo className="z-20" showThemeToggle={showThemeToggle} />

        {/* Desktop Navigation Pill */}
        <div
          className={`hidden lg:flex items-center justify-between px-1.5 py-1.5 absolute left-1/2 -translate-x-1/2 z-10 w-max rounded-full transition-[background,backdrop-filter,border-color,box-shadow] duration-500 ease-out ${
            isHeroNavPage
              ? "border border-white/10 bg-transparent backdrop-blur-md shadow-2xl"
              : "border border-gray-200/70 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-transparent shadow-2xl"
          }`}
          style={{
            background:
              "linear-gradient(91.43deg, rgba(217, 217, 217, 0.28) 1.92%, rgba(217, 217, 217, 0.06) 102.33%)",
          }}
        >
          <div className="flex items-center gap-6 pl-0.5 text-base font-normal">
            {navItems.map((item) => {
              const isExplore = item.name === "Explore";

              return (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() =>
                    item.hasDropdown && setIsExploreOpen(true)
                  }
                  onMouseLeave={() =>
                    item.hasDropdown && setIsExploreOpen(false)
                  }
                >
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between whitespace-nowrap transition-all duration-300 relative tracking-wide ${
                      isExplore
                        ? "bg-[#131313] text-white rounded-full px-5 py-2 min-w-[110px] shadow-lg flex items-center gap-3 hover:bg-black dark:bg-[#131313]"
                        : isHeroNavPage
                          ? "text-white hover:text-white/80"
                          : "text-gray-900/80 hover:text-gray-900 dark:text-white dark:hover:text-white/80"
                    }`}
                  >
                    {item.name}

                    {item.hasDecoration && (
                      <img
                        src={navDecoration}
                        alt="Sparkle"
                        className="absolute -top-1.5 -right-3 h-3.5 w-2.5"
                      />
                    )}

                    {item.hasDropdown && (
                      <ChevronDown
                        className={`h-4 w-4 ${
                          isHeroNavPage ? "text-white" : "text-gray-900 dark:text-white"
                        } ${isExplore ? "opacity-100" : "opacity-60"}`}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="flex items-center relative gap-2.5 ml-8 pr-4 group/search">
            <Search
              className={`h-4 w-4 ${
                isHeroNavPage ? "text-white/40 group-focus-within/search:text-white/80" : "text-gray-700/40 group-focus-within/search:text-gray-900/80 dark:text-white/40 dark:group-focus-within/search:text-white/80"
              } transition-colors`}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className={`bg-transparent w-44 text-sm font-light py-1 border-b focus:outline-none transition-all ${
                  isHeroNavPage
                    ? heroNavScrolled
                      ? "text-white placeholder-white/35 border-white/[0.07] focus:border-white/20"
                      : "text-white placeholder-white/40 border-white/10 focus:border-white/30"
                    : "text-gray-900 placeholder-gray-400 border-gray-200/70 focus:border-gray-300 dark:text-white dark:placeholder-white/40 dark:border-white/10 dark:focus:border-white/30"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden lg:flex items-center gap-1 z-20">
          <CurrencySelector />
          {isAuthenticated && (
            <Link
              to={ROUTES.CART}
              className={`relative p-2 rounded-full transition-all ${
                isHeroNavPage
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-gray-800/90 hover:text-gray-900 hover:bg-gray-100 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/10"
              }`}
              title="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary-pink text-white text-[10px] font-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link
                to={ROUTES.LOGIN}
                className={`px-2 py-2 font-medium text-sm transition-all ${
                  isHeroNavPage
                    ? "text-white/90 hover:text-white"
                    : "text-gray-800/90 hover:text-gray-900 dark:text-white/90 dark:hover:text-white"
                }`}
              >
                Login
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white px-6 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-500/20"
              >
                <User className="w-3 h-4" />
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className={`font-bold text-xs ${isHeroNavPage ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  Hi,{" "}
                  {
                    (
                      user?.userName ||
                      user?.name ||
                      user?.firstName ||
                      user?.email?.split("@")[0] ||
                      "Scholar"
                    ).split(" ")[0]
                  }
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-primary-pink font-bold uppercase tracking-widest hover:underline"
                >
                  Logout
                </button>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-pink/20 to-primary-purple/20 border border-white/10 flex items-center justify-center text-white shadow-xl">
                <User size={20} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden ml-auto z-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={isHeroNavPage ? "text-white" : "text-gray-900 dark:text-white"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={`absolute top-full left-0 right-0 p-6 lg:hidden border-t z-50 ${
            isHeroNavPage
              ? "bg-[#0c091a] border-white/10"
              : "bg-white dark:bg-[#0c091a] border-gray-200/70 dark:border-white/10"
          }`}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-medium ${
                  isHeroNavPage
                    ? "text-white/80 hover:text-white"
                    : "text-gray-900/80 hover:text-gray-900 dark:text-white/80 dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to={ROUTES.CART}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 text-lg font-medium ${
                  isHeroNavPage
                    ? "text-white/80 hover:text-white"
                    : "text-gray-900/80 hover:text-gray-900 dark:text-white/80 dark:hover:text-white"
                }`}
              >
                <ShoppingCart size={20} /> Cart{" "}
                {cartCount > 0 && `(${cartCount})`}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
