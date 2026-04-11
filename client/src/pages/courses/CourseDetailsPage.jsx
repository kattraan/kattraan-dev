
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import heroBackground from '@/assets/hero-background.png';
import CourseDetails from '@/features/courses/components/details/CourseDetails';
import CourseSidebar from '@/features/courses/components/details/CourseSidebar';
// import RelatedCourses from '@/features/courses/components/details/RelatedCourses';
import courseService from '@/features/courses/services/courseService';
import { mapCourseToDetails } from '@/features/courses/utils/mapCourseToDetails';
import { ROUTES } from '@/config/routes';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(!!courseId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError('No course selected');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await courseService.getCourseById(courseId);
        const data = res?.data ?? res;
        if (cancelled) return;
        if (data) {
          setCourseData(mapCourseToDetails(data));
        } else {
          setError('Course not found');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load course.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  if (!courseId) {
    return (
      <div className="min-h-screen bg-[#090C03] font-satoshi text-white flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-white/70">No course selected.</p>
        <button type="button" onClick={() => navigate(ROUTES.HOME)} className="text-primary-pink hover:underline">
          Go to home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090C03] font-satoshi text-white flex flex-col items-center justify-center">
        <div className="animate-pulse text-white/60">Loading course…</div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#090C03] font-satoshi text-white flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-400">{error || 'Course not found'}</p>
        <button type="button" onClick={() => navigate(ROUTES.HOME)} className="text-primary-pink hover:underline">
          Go to home
        </button>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#090C03] font-satoshi text-white selection:bg-primary-pink selection:text-white">
      <Navbar />

      {/* Background Image - Matches Hero Section Style */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none z-0 overflow-hidden">
        <img
          src={heroBackground}
          alt=""
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#090C03] to-transparent" />
      </div>

      <main className="relative z-10 pt-32 lg:pt-40 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <CourseDetails
              courseData={courseData}
              // Used by CourseDetails -> watch links so "Back to course"
              // returns to the same course details screen (not /view-course).
              returnToUrl={`${ROUTES.COURSE_DETAILS}/${courseId}`}
            />
            <CourseSidebar courseData={courseData} />
          </div>

          {/* Fullstack Development Career Track — hidden for now
          <RelatedCourses courseData={courseData} />
          */}

        </div>
      </main>
    </div>
  );
};

export default CourseDetailsPage;
