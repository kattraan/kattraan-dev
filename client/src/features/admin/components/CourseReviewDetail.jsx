import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Legacy admin review URL — redirects to the full course details page in review mode.
 */
export default function CourseReviewDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      navigate(`${ROUTES.COURSE_DETAILS}/${courseId}?adminReview=1`, { replace: true });
    } else {
      navigate(ROUTES.ADMIN_COURSES, { replace: true });
    }
  }, [courseId, navigate]);

  return (
    <div className="min-h-screen bg-[#090C03] flex items-center justify-center text-white/60">
      Opening course review…
    </div>
  );
}
