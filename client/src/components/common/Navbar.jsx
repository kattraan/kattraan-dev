import React, { useState, useEffect } from "react";

import { ChevronDown, Menu, X, User, ShoppingCart } from "lucide-react";

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



const DARK_LANDING_PATHS = [

  ROUTES.FAQ,

  ROUTES.ABOUT,

  ROUTES.CONTACT,

  ROUTES.PRIVACY_POLICY,

  ROUTES.TERMS,

  ROUTES.REFUNDS,

  ROUTES.SHIPPING_DELIVERY,

];



const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { count: cartCount } = useCart();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();



  const isCategoriesPage =

    location.pathname === ROUTES.CATEGORIES ||

    location.pathname.startsWith(`${ROUTES.CATEGORIES}/`);

  const isHeroNavPage =

    location.pathname === ROUTES.HOME || isCategoriesPage;

  const isCourseDetailsPage =

    location.pathname === ROUTES.COURSE_DETAILS ||

    location.pathname.startsWith(`${ROUTES.COURSE_DETAILS}/`);

  const isDarkLandingPage = DARK_LANDING_PATHS.includes(location.pathname);

  const isDarkNavChrome = isHeroNavPage || isDarkLandingPage || isCourseDetailsPage;

  const showThemeToggle = !(isHeroNavPage || isCourseDetailsPage || isDarkLandingPage);



  useEffect(() => {

    if (!isDarkNavChrome) {

      setIsScrolled(false);

      return;

    }

    const onScroll = () => {

      setIsScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD_PX);

    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);

  }, [isDarkNavChrome]);



  useEffect(() => {

    setIsMenuOpen(false);

  }, [location.pathname]);



  useEffect(() => {

    if (!isMenuOpen) return;

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = prev;

    };

  }, [isMenuOpen]);



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

    ];

  };



  const navItems = getNavItems();

  const heroNavScrolled = isDarkNavChrome && isScrolled;

  const logoVariant = isDarkNavChrome ? "light" : "dark";

  const mobileMenuBg = isDarkNavChrome

    ? "bg-[#0c091a]/98 border-white/10"

    : "bg-white/98 dark:bg-[#0c091a]/98 border-gray-200/70 dark:border-white/10";

  const mobileLinkClass = isDarkNavChrome

    ? "text-white/85 hover:text-white"

    : "text-gray-900/85 hover:text-gray-900 dark:text-white/85 dark:hover:text-white";

  const iconBtnClass = isDarkNavChrome

    ? "text-white/90 hover:text-white hover:bg-white/10"

    : "text-gray-800/90 hover:text-gray-900 hover:bg-gray-100 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/10";

  const currencyBtnClass = isDarkNavChrome

    ? "text-white/80 hover:text-white hover:bg-white/10"

    : "text-gray-800/90 hover:text-gray-900 hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10";



  return (

    <nav

      className={`${isDarkNavChrome ? "fixed" : "absolute"} top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,padding] duration-500 ease-out ${

        heroNavScrolled

          ? "bg-[#090C03]/95 backdrop-blur-md shadow-[0_12px_40px_-4px_rgba(0,0,0,0.65)] py-2 sm:py-3"

          : "pt-3 sm:pt-4 lg:pt-5 pb-2 sm:pb-3"

      } ${isDarkNavChrome && !heroNavScrolled ? "bg-gradient-to-b from-black/50 to-transparent" : ""}`}

    >

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative flex items-center justify-between gap-3 min-w-0">

        <BrandLogo className="z-20 min-w-0" showThemeToggle={showThemeToggle} variant={logoVariant} />



        {/* Desktop Navigation Pill */}

        <div

          className={`hidden lg:flex items-center justify-between px-1.5 py-1.5 absolute left-1/2 -translate-x-1/2 z-10 w-max max-w-[calc(100%-20rem)] rounded-full transition-[background,backdrop-filter,border-color,box-shadow] duration-500 ease-out ${

            isDarkNavChrome

              ? "border border-white/10 bg-transparent backdrop-blur-md shadow-2xl"

              : "border border-gray-200/70 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-transparent shadow-2xl"

          }`}

          style={{

            background:

              "linear-gradient(91.43deg, rgba(217, 217, 217, 0.28) 1.92%, rgba(217, 217, 217, 0.06) 102.33%)",

          }}

        >

          <div className="flex items-center gap-4 xl:gap-6 pl-0.5 text-sm xl:text-base font-normal">

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

                        ? "bg-[#131313] text-white rounded-full px-4 xl:px-5 py-2 min-w-[96px] xl:min-w-[110px] shadow-lg flex items-center gap-2 xl:gap-3 hover:bg-black dark:bg-[#131313]"

                        : isDarkNavChrome

                          ? "text-white hover:text-white/80"

                          : "text-gray-900/80 hover:text-gray-900 dark:text-white dark:hover:text-white/80"

                    }`}

                  >

                    {item.name}



                    {item.hasDecoration && (

                      <img

                        src={navDecoration}

                        alt=""

                        className="absolute -top-1.5 -right-3 h-3.5 w-2.5"

                      />

                    )}



                    {item.hasDropdown && (

                      <ChevronDown

                        className={`h-4 w-4 ${

                          isDarkNavChrome ? "text-white" : "text-gray-900 dark:text-white"

                        } ${isExplore ? "opacity-100" : "opacity-60"}`}

                      />

                    )}

                  </Link>

                </div>

              );

            })}

          </div>

        </div>



        {/* Desktop User Actions */}

        <div className="hidden lg:flex items-center gap-1 z-20 flex-shrink-0">

          <CurrencySelector buttonClassName={currencyBtnClass} />

          {isAuthenticated && (

            <Link

              to={ROUTES.CART}

              className={`relative p-2 rounded-full transition-all ${iconBtnClass}`}

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

                  isDarkNavChrome

                    ? "text-white/90 hover:text-white"

                    : "text-gray-800/90 hover:text-gray-900 dark:text-white/90 dark:hover:text-white"

                }`}

              >

                Login

              </Link>

              <Link

                to={ROUTES.SIGNUP}

                className="flex items-center gap-2 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white px-5 xl:px-6 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-500/20"

              >

                <User className="w-3 h-4" />

                Sign Up

              </Link>

            </>

          ) : (

            <div className="flex items-center gap-3 xl:gap-4">

              <div className="flex flex-col items-end">

                <span className={`font-bold text-xs ${isDarkNavChrome ? "text-white" : "text-gray-900 dark:text-white"}`}>

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

                  type="button"

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



        {/* Mobile actions */}

        <div className="flex lg:hidden items-center gap-1 sm:gap-2 ml-auto z-20 flex-shrink-0">

          {isAuthenticated && (

            <Link

              to={ROUTES.CART}

              className={`relative p-2 rounded-full transition-all ${iconBtnClass}`}

              title="Cart"

            >

              <ShoppingCart size={20} />

              {cartCount > 0 && (

                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary-pink text-white text-[9px] font-black">

                  {cartCount > 99 ? "99+" : cartCount}

                </span>

              )}

            </Link>

          )}

          <button

            type="button"

            onClick={() => setIsMenuOpen(!isMenuOpen)}

            className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}

            aria-expanded={isMenuOpen}

            aria-label={isMenuOpen ? "Close menu" : "Open menu"}

          >

            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}

          </button>

        </div>

      </div>



      {/* Mobile Menu */}

      {isMenuOpen && (

        <>

          <button

            type="button"

            className="fixed inset-0 z-40 bg-black/50 lg:hidden"

            aria-label="Close menu"

            onClick={() => setIsMenuOpen(false)}

          />

          <div

            className={`fixed top-0 right-0 z-50 h-[100dvh] w-[min(100vw,20rem)] sm:w-80 border-l shadow-2xl lg:hidden overflow-y-auto ${mobileMenuBg}`}

          >

            <div className="flex items-center justify-between p-4 border-b border-white/10">

              <span className={`text-sm font-bold uppercase tracking-widest ${isDarkNavChrome ? "text-white/60" : "text-gray-500"}`}>

                Menu

              </span>

              <button

                type="button"

                onClick={() => setIsMenuOpen(false)}

                className={`p-2 rounded-lg ${iconBtnClass}`}

                aria-label="Close menu"

              >

                <X size={20} />

              </button>

            </div>

            <div className="flex flex-col gap-1 p-4">

              {navItems.map((item) => (

                <Link

                  key={item.name}

                  to={item.path}

                  onClick={() => setIsMenuOpen(false)}

                  className={`text-base font-medium py-3 px-3 rounded-xl transition-colors ${mobileLinkClass} ${isDarkNavChrome ? "hover:bg-white/5" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}

                >

                  {item.name}

                </Link>

              ))}

              <div className={`pt-4 mt-3 border-t flex flex-col gap-3 ${isDarkNavChrome ? "border-white/10" : "border-gray-200/70 dark:border-white/10"}`}>

                <CurrencySelector buttonClassName={currencyBtnClass} />

                {!isAuthenticated ? (

                  <>

                    <Link

                      to={ROUTES.LOGIN}

                      onClick={() => setIsMenuOpen(false)}

                      className={`text-base font-medium py-3 px-3 rounded-xl ${mobileLinkClass}`}

                    >

                      Login

                    </Link>

                    <Link

                      to={ROUTES.SIGNUP}

                      onClick={() => setIsMenuOpen(false)}

                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white px-6 py-3 rounded-full font-medium text-sm"

                    >

                      <User className="w-4 h-4" />

                      Sign Up

                    </Link>

                  </>

                ) : (

                  <button

                    type="button"

                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}

                    className="text-left text-base font-medium text-primary-pink py-3 px-3"

                  >

                    Logout

                  </button>

                )}

              </div>

            </div>

          </div>

        </>

      )}

    </nav>

  );

};



export default Navbar;

