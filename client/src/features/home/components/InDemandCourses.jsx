import React from 'react';
import CourseSection from './CourseSection';
import { useLandingPublicCourses } from '@/features/home/hooks/useLandingPublicCourses';

const InDemandCourses = () => {
  const { inDemand, isLoading } = useLandingPublicCourses();
  return (
    <CourseSection
      title="In Demand"
      highlightWord="Courses"
      courses={inDemand}
      isLoading={isLoading}
    />
  );
};

export default InDemandCourses;
