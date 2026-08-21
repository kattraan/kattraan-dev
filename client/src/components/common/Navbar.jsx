import React, { useState, useEffect } from "react";

import { Menu, X, User, ShoppingCart } from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import BrandLogo from "./BrandLogo";

import navDecoration from "@/assets/nav-decoration.png";

import { logout } from "@/features/auth/store/authSlice";

import { hasRole, isApprovedInstructor } from "@/features/auth/utils/roleUtils";

import { ROUTES } from "@/config/routes";

import { useLearnerEnrollment } from "@/context/LearnerEnrollmentContext";

import CurrencySelector from "@/components/ui/CurrencySelector";

import { useCart } from "@/context/CartContext";



const SCROLL_SOLID_THRESHOLD_PX = 40;



const DARK_LANDING_PATHS = [

  ROUTES.FAQ,

  ROUTES.ABOUT,

  ROUTES.CONTACT,

  ROUTES.BECOME_INSTRUCTOR,

  ROUTES.PRIVACY_POLICY,

  ROUTES.TERMS,

  ROUTES.REFUNDS,

  ROUTES.SHIPPING_DELIVERY,

];



const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const { hasEnrolledCourses } = useLearnerEnrollment();

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

  const isCoursesPage =

    location.pathname === ROUTES.COURSES ||

    location.pathname.startsWith(`${ROUTES.COURSES}/`);

  const isDarkLandingPage = DARK_LANDING_PATHS.includes(location.pathname);

  const isDarkNavChrome = isHeroNavPage || isDarkLandingPage || isCourseDetailsPage || isCoursesPage;

  const showThemeToggle = !(isHeroNavPage || isCourseDetailsPage || isCoursesPage || isDarkLandingPage);



  useEffect(() => {

    const onScroll = () => {

      setIsScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD_PX);

    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);

  }, [location.pathname]);



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

    const contactUs = { name: "Contact Us", path: ROUTES.CONTACT };

    // Guests: Courses hits protected /courses → login, then return to catalog
    if (!isAuthenticated) {

      return [

        { name: "Home", path: ROUTES.HOME },

        { name: "Courses", hasDecoration: true, path: ROUTES.COURSES },

        { name: "Become Instructor", path: ROUTES.BECOME_INSTRUCTOR },

        contactUs,

      ];

    }



    if (isApprovedInstructor(user)) {

      return [

        { name: "Home", path: ROUTES.HOME },

        { name: "Courses", hasDecoration: true, path: ROUTES.COURSES },

        {

          name: "My Dashboard",

          path: ROUTES.INSTRUCTOR_DASHBOARD,

        },

        contactUs,

      ];

    }



    if (hasRole(user, "admin")) {

      return [

        { name: "Home", path: ROUTES.HOME },

        { name: "Courses", hasDecoration: true, path: ROUTES.COURSES },

        {

          name: "Admin Panel",

          path: ROUTES.ADMIN_DASHBOARD,

        },

        contactUs,

      ];

    }



    const learnerItems = [

      { name: "Home", path: ROUTES.HOME },

      { name: "Courses", hasDecoration: true, path: ROUTES.COURSES },

    ];



    if (hasEnrolledCourses) {

      learnerItems.push({

        name: "My Learning",

        path: ROUTES.DASHBOARD,

      });

    }



    learnerItems.push(

      { name: "Become Instructor", path: ROUTES.BECOME_INSTRUCTOR },

      contactUs,

    );



    return learnerItems;

  };



  const navItems = getNavItems();

  const navScrolled = isScrolled;

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

      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter,padding] duration-300 ease-out ${

        navScrolled

          ? isDarkNavChrome

            ? "bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-150 border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] py-2 sm:py-3"

            : "bg-white/40 dark:bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-150 border-b border-gray-200/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-2 sm:py-3"

          : isDarkNavChrome

            ? "bg-transparent border-b border-transparent pt-3 sm:pt-4 lg:pt-5 pb-2 sm:pb-3"

            : "bg-transparent dark:bg-transparent border-b border-transparent pt-3 sm:pt-4 lg:pt-5 pb-2 sm:pb-3"

      }`}

    >

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative flex items-center justify-between gap-3 min-w-0">

        <BrandLogo className="z-20 min-w-0" showThemeToggle={showThemeToggle} variant={logoVariant} />



        {/* Desktop Navigation Pill */}

        <div

          className={`hidden lg:flex items-center px-1 py-1 absolute left-1/2 -translate-x-1/2 z-10 w-max max-w-[calc(100%-20rem)] rounded-full transition-[background,backdrop-filter,border-color,box-shadow] duration-500 ease-out ${

            isDarkNavChrome

              ? "border border-white/10 bg-transparent backdrop-blur-md shadow-2xl"

              : "border border-gray-200/70 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-transparent shadow-2xl"

          }`}

          style={{

            background:

              "linear-gradient(91.43deg, rgba(217, 217, 217, 0.28) 1.92%, rgba(217, 217, 217, 0.06) 102.33%)",

          }}

        >

          <div className="flex items-center gap-1 xl:gap-1.5 text-sm xl:text-base font-normal">

            {navItems.map((item) => {

              const isCourses = item.name === "Courses";



              return (

                <div

                  key={item.name}

                  className="relative group"

                >

                  <Link

                    to={item.path}

                    className={`flex items-center whitespace-nowrap transition-all duration-300 relative tracking-wide select-none ${

                      isCourses

                        ? "bg-[#131313] text-white rounded-full px-3 py-1.5 shadow-lg hover:bg-black dark:bg-[#131313] overflow-hidden"

                        : isDarkNavChrome

                          ? "text-white hover:text-white/80 px-2.5 py-1.5"

                          : "text-gray-900/80 hover:text-gray-900 dark:text-white dark:hover:text-white/80 px-2.5 py-1.5"

                    }`}

                  >

                    {item.name}



                    {item.hasDecoration && (

                      <img

                        src={navDecoration}

                        alt=""

                        className="absolute top-[4px] right-[6px] h-3 w-2.5 pointer-events-none"

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

                className="flex items-center gap-2 bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white px-5 xl:px-6 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-500/20"

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

                  className={`text-base font-medium py-3 px-3 rounded-xl transition-colors select-none ${mobileLinkClass} ${isDarkNavChrome ? "hover:bg-white/5" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}

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

                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white px-6 py-3 rounded-full font-medium text-sm"

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

