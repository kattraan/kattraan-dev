import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Play,
  FileText,
  Infinity,
  Smartphone,
  Award,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  enrollInCourse,
  checkEnrollment,
} from "@/features/learner/services/learnerCoursesService";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";

const CourseSidebar = ({
  courseData,
  isAdminReview = false,
  onApprove,
  onReject,
  onRejectOpen,
  approving = false,
  rejecting = false,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const { formatPrice, formatINR, userCurrency } = useCurrency();
  const { addItem, items: cartItems } = useCart();
  const courseId = courseData?._id;
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const isInCart = courseId && cartItems.some((i) => i.courseId === courseId);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentCheckLoading, setEnrollmentCheckLoading] = useState(false);
  const isFree = !courseData?.price || Number(courseData.price) === 0;

  useEffect(() => {
    if (!isAdminReview && isAuthenticated && courseId) {
      let cancelled = false;
      setEnrollmentCheckLoading(true);
      checkEnrollment(courseId)
        .then(({ enrolled }) => {
          if (!cancelled) setIsEnrolled(enrolled);
        })
        .catch(() => {
          if (!cancelled) setIsEnrolled(false);
        })
        .finally(() => {
          if (!cancelled) setEnrollmentCheckLoading(false);
        });
      return () => {
        cancelled = true;
      };
    } else if (!isAuthenticated) {
      setIsEnrolled(false);
    }
  }, [isAdminReview, isAuthenticated, courseId]);

  const handleStartFreeCourse = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      await enrollInCourse(courseId);
      // Keep user in the same screen; update CTA so it doesn't show an "Enrolled" swap.
      setIsEnrolled(true);
      setEnrollModalOpen(false);
      toast.success("Enrolled", "You can find this course in My Courses.");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Enrollment failed.";
      if (err.response?.status === 401) {
        toast.error("Sign in required", "Please sign in to enroll in courses.");
        navigate(ROUTES.LOGIN, { state: { from: window.location.pathname } });
      } else if (
        err.response?.data?.message?.toLowerCase().includes("already enrolled")
      ) {
        setIsEnrolled(true);
        setEnrollModalOpen(false);
      } else {
        toast.error("Enrollment failed", msg);
      }
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <>
      <div className="lg:col-span-4 relative font-satoshi">
        {/* Sticky positioning wrapper */}
        <div className="relative">
          {/* Course Purchase Card - Responsive Width */}
          <div
            className="relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
            style={{
              maxWidth: "382px",
              width: "100%",
              height: "auto",
              borderRadius: "24px",
              background:
                "linear-gradient(180deg, rgba(40, 15, 25, 0.4) 0%, rgba(20, 5, 10, 0.6) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Glass effect background layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/40 z-0" />
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[color:var(--color-gradient-start)]/12 via-transparent to-[color:var(--color-primary-purple)]/18" />
            {/* Ambient Glow Overlay */}
            <div className="absolute top-[20%] left-0 right-0 h-[400px] pointer-events-none z-0 bg-[radial-gradient(circle,rgba(255,140,66,0.12)_0%,rgba(255,63,180,0.08)_45%,transparent_72%)]" />

            {/* Main Content Container Z-Index 10 */}
            <div className="relative z-10 w-full h-full p-[20px] pt-[24px] flex flex-col">
              {/* Inner Layout Box: Video Preview */}
              <div
                className="overflow-hidden relative"
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Video Preview Image Area */}
                <div className="relative w-full h-full cursor-pointer">
                  <img
                    src={courseData.videoPreview}
                    alt="Course Preview"
                    className="w-full h-full object-cover opacity-70 transition-transform duration-700"
                  />
                  {/* Light Overlay to let text pop */}
                  <div className="absolute inset-0 bg-black/40 transition-colors" />
                  {/* Bottom vignette for the text */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />

                  {/* "2025" Big Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <span className="text-[120px] font-black text-white/5 tracking-tighter leading-none select-none mix-blend-overlay scale-125 transition-transform duration-[2s]">
                      2025
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 shadow-2xl">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                  </div>

                  {/* "WATCH BEFORE CODING IN" text */}
                  <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                    <h3 className="text-white font-[900] text-[12px] uppercase tracking-[0.2em] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                      Watch Before{" "}
                      <span className="text-[#d8ea38]">Coding In</span>
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content Section - Adjusted for relative flow */}
              <div className="relative mt-8 flex-1">
                {isAdminReview ? (
                  <>
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-[28px] font-[900] text-white tracking-[-0.03em] leading-none">
                        {formatPrice(courseData.price)}
                      </span>
                      {courseData.originalPrice > 0 && (
                        <span className="text-[14px] text-[#A1A1AA] line-through decoration-1 font-medium">
                          {formatPrice(courseData.originalPrice)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-[15px] mb-4">
                      Review & decide
                    </h4>
                    <div className="space-y-3 mb-8">
                      <button
                        type="button"
                        onClick={onApprove}
                        disabled={approving || rejecting}
                        className="w-full flex items-center justify-center gap-2 rounded-lg btn-gradient font-medium py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {approving ? "Approving…" : "Approve course"}
                      </button>
                      <button
                        type="button"
                        onClick={onRejectOpen}
                        disabled={approving || rejecting}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 text-white font-medium py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-5 h-5" />
                        {rejecting ? "Rejecting…" : "Reject course"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Price Row */}
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-[42px] font-[900] text-white tracking-[-0.03em] leading-none">
                        {formatPrice(courseData.price)}
                      </span>
                      {courseData.originalPrice > 0 && (
                        <span className="text-[18px] text-[#A1A1AA] line-through decoration-1 decoration-[#A1A1AA]/60 font-medium">
                          {formatPrice(courseData.originalPrice)}
                        </span>
                      )}
                      {userCurrency !== "INR" && (
                        <span className="text-[13px] text-[#A1A1AA] font-medium">
                          ({formatINR(courseData.price)} INR)
                        </span>
                      )}
                    </div>

                    {/* Discount Pill */}
                    <div className="inline-flex items-center gap-2 border border-white/20 bg-white/[0.06] backdrop-blur-md text-[11px] font-bold px-4 py-1.5 rounded-full mb-8 shadow-inner shadow-white/10">
                      <span className="text-gradient-brand">61% OFF</span>
                      <span className="text-white/80">• Limited Time</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 mb-8">
                      {isEnrolled ? (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.DASHBOARD_MY_COURSES)}
                            className="w-full relative overflow-hidden rounded-lg btn-gradient transition-all active:scale-[0.98]"
                          >
                            <span className="relative z-10 block py-3.5 text-white font-medium text-[16px]">
                              Go to Courses
                            </span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEnrollModalOpen(true)}
                            disabled={enrollmentCheckLoading}
                            className="w-full relative overflow-hidden rounded-lg btn-gradient transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <span className="relative z-10 block py-3.5 text-white font-medium text-[16px]">
                              {enrollmentCheckLoading
                                ? "Checking…"
                                : "Enroll Now"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!isAuthenticated) {
                                toast.error(
                                  "Sign in required",
                                  "Please sign in to add courses to your cart.",
                                );
                                navigate(ROUTES.LOGIN, {
                                  state: { from: window.location.pathname },
                                });
                                return;
                              }
                              if (isInCart) {
                                toast.success(
                                  "Already in cart",
                                  "View your cart to checkout.",
                                );
                                navigate(ROUTES.CART);
                                return;
                              }
                              setAddingToCart(true);
                              try {
                                const res = await addItem(courseId);
                                toast.success(
                                  "Added to cart",
                                  res.count
                                    ? `${res.count} item${res.count !== 1 ? "s" : ""} in cart.`
                                    : "View cart to checkout.",
                                );
                              } catch (err) {
                                const msg =
                                  err.response?.data?.message ||
                                  err.message ||
                                  "Could not add to cart.";
                                if (err.response?.status === 401) {
                                  toast.error(
                                    "Sign in required",
                                    "Please sign in to add courses to your cart.",
                                  );
                                  navigate(ROUTES.LOGIN, {
                                    state: { from: window.location.pathname },
                                  });
                                } else {
                                  toast.error("Could not add to cart", msg);
                                }
                              } finally {
                                setAddingToCart(false);
                              }
                            }}
                            disabled={addingToCart}
                            className="w-full bg-transparent text-white border border-white/30 font-medium text-[15px] py-3.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            {addingToCart
                              ? "Adding…"
                              : isInCart
                                ? "In cart"
                                : "Add to Cart"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Money Back Text */}
                    {/* <div className="text-center text-[11px] text-[#71717A] font-bold mb-8 tracking-widest uppercase opacity-60">
                      30-Day Money-Back Guarantee
                    </div> */}
                  </>
                )}

                {/* Course Includes List */}
                <div className="space-y-4 px-1">
                  <h4 className="font-bold text-white text-[15px] mb-4">
                    This course includes:
                  </h4>
                  <ul className="space-y-3 text-[14px] text-[#d4d4d8] font-light">
                    {[
                      { icon: Play, text: "15.5 hours on-demand video" },
                      { icon: FileText, text: "42 downloadable resources" },
                      { icon: Infinity, text: "Full lifetime access" },
                      {
                        icon: Smartphone,
                        text: "Access on mobile and desktop",
                      },
                      { icon: Award, text: "Certificate of completion" },
                      { icon: CheckCircle, text: "Self-paced learning" },
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="w-4 h-4 text-white/80 transition-colors stroke-[1.5]" />
                        <span className="tracking-wide text-white/90 transition-colors">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enroll modal: free = Start to open course, paid = Proceed to payment */}
      {!isAdminReview && enrollModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setEnrollModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1625] rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {isFree ? "Start learning" : "Enroll in course"}
            </h3>
            {isFree ? (
              <>
                <p className="text-sm text-gray-500 dark:text-white/70 mb-6">
                  This course is free. Click Start to begin and access all
                  content.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEnrollModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/80 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartFreeCourse}
                    disabled={enrolling}
                    className="flex-1 py-2.5 rounded-lg btn-gradient font-medium transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {enrolling ? "Enrolling…" : "Start"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-white/70 mb-6">
                  This course is paid ({formatPrice(courseData.price)}).
                  Complete payment to access all content.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEnrollModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/80 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollModalOpen(false);
                      navigate(`${ROUTES.CHECKOUT}/${courseId}`);
                    }}
                    className="flex-1 py-2.5 rounded-lg btn-gradient font-medium transition-opacity"
                  >
                    Proceed to payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CourseSidebar;
