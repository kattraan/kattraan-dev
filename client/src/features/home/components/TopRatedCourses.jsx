import React from 'react';
import CourseSection from './CourseSection';
import { useLandingPublicCourses } from '@/features/home/hooks/useLandingPublicCourses';

const TopRatedCourses = () => {
  const { topRated, isLoading } = useLandingPublicCourses();
  return (
    <CourseSection
      title="Top Rated"
      highlightWord="Courses"
      courses={topRated}
      isLoading={isLoading}
    />
  );
};

export default TopRatedCourses;
