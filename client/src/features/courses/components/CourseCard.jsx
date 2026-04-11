import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BookOpen, Clock, Users, ShoppingCart } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { courseDescriptionPlainText } from '@/utils/courseDescriptionHtml';

/**
 * Course card for public course listing (Navbar Courses page).
 * Thumbnail with category tag; title, description; dynamic stats (sections, duration, enrolled); View details; price; Add to cart.
 */
const CourseCard = ({ course }) => {
  const id = course._id || course.id;
  const title = course.title || 'Untitled Course';
  const category = course.category || 'Course';
  const description = course.description || '';
  const price = Number(course.price) ?? 0;
  const thumbnail = course.thumbnail || course.image || null;
  const isFree = price === 0;
  const { formatPrice } = useCurrency();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const { addItem, items: cartItems } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const isInCart = cartItems.some((i) => i.courseId === id);

  const detailsUrl = `${ROUTES.COURSE_DETAILS}/${id}`;

  // Dynamic counts from API (getPublic returns durationMinutes, learners, enrolledCount)
  const sectionsCount = course.sections?.length ?? course.moduleCount ?? 0;
  const durationMinutes = course.durationMinutes ?? course.duration;
  const duration =
    durationMinutes != null && Number(durationMinutes) >= 0
      ? `${(Number(durationMinutes) / 60).toFixed(1)}h`
      : '—';
  const enrolledCount =
    course.enrolledCount ?? course.learners ?? course.students;
  const enrolledDisplay =
    enrolledCount != null && typeof enrolledCount === 'number'
      ? enrolledCount
      : '—';

  return (
    <Link
      to={detailsUrl}
      className="group relative flex flex-col w-full h-full min-h-[360px] border border-black/10 dark:border-white/10 rounded-[40px] p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-[4px] shadow-2xl transform-gpu will-change-transform text-left bg-white/60 dark:bg-white/[0.03]"
      style={{
        background: 'linear-gradient(91.43deg, rgba(217, 217, 217, 0.224) 1.92%, rgba(217, 217, 217, 0.048) 102.33%)',
      }}
    >
      {/* Course Image */}
      <div className="relative w-full h-[155px] rounded-[22px] overflow-hidden mb-4 flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-pink/20 to-primary-purple/20 dark:from-primary-pink/20 dark:to-primary-purple/20" />
        )}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
            {category}
          </span>
        </div>
        {isAuthenticated && !isFree && (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isInCart) {
                toast.success('Already in cart', 'View cart to checkout.');
                navigate(ROUTES.CART);
                return;
              }
              setAdding(true);
              try {
                const res = await addItem(id);
                toast.success('Added to cart', res.count ? `${res.count} item${res.count !== 1 ? 's' : ''} in cart.` : 'View cart to checkout.');
              } catch (err) {
                if (err.response?.status === 401) {
                  toast.error('Sign in required', 'Please sign in to add to cart.');
                  navigate(ROUTES.LOGIN, { state: { from: window.location.pathname } });
                } else {
                  toast.error('Could not add to cart', err.response?.data?.message || err.message);
                }
              } finally {
                setAdding(false);
              }
            }}
            disabled={adding}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-primary-pink/80 hover:border-primary-pink/50 transition-all disabled:opacity-60"
            title={isInCart ? 'In cart' : 'Add to cart'}
          >
            <ShoppingCart size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-1 text-left min-h-0">
        <h3 className="text-gray-900 dark:text-white text-[15px] font-bold leading-tight mb-2 line-clamp-2" title={title}>
          {title}
        </h3>
        <p className="text-gray-600/80 dark:text-white/50 text-[11px] leading-relaxed line-clamp-2 mb-4">
          {courseDescriptionPlainText(description) || 'No description.'}
        </p>
      </div>

      {/* Footer: Metadata & CTA */}
      <div className="mt-auto px-1 flex-shrink-0">
        <div className="w-full h-[1px] bg-black/10 dark:bg-white/10 mb-4" />
        <div className="flex items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-3 text-gray-600 dark:text-white/50 flex-wrap" aria-label="Course stats">
            <div className="flex items-center gap-1" title="Sections">
              <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="text-[10px] font-medium">{sectionsCount}</span>
            </div>
            <div className="flex items-center gap-1" title="Duration">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="text-[10px] font-medium">{duration}</span>
            </div>
            <div className="flex items-center gap-1" title="Enrolled">
              <Users className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="text-[10px] font-medium">{enrolledDisplay}</span>
            </div>
          </div>
          <span className="bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all flex-shrink-0 shadow-lg shadow-pink-500/10">
            View details
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-tighter">Price</span>
            <span className="text-gray-900 dark:text-white font-bold text-sm leading-none mt-0.5">
              {formatPrice(price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
