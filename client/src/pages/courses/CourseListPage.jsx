import React from "react";
import { useSearchParams } from "react-router-dom";
import { useGetPublicCoursesQuery } from "@/features/courses/api/coursesApi";
import CourseCard from "@/features/courses/components/CourseCard";

const COURSE_CATEGORIES = [
  "All",
  "Development",
  "Design",
  "Marketing",
  "Business",
  "Other",
];

const CourseListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useGetPublicCoursesQuery(undefined, {
    skip: false,
  });

  const filteredCourses =
    categoryParam && categoryParam !== "All"
      ? (courses || []).filter(
          (c) =>
            (c.category || "").toLowerCase() === categoryParam.toLowerCase(),
        )
      : courses || [];

  const setCategory = (cat) => {
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-20 min-h-screen w-full bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 lg:px-12">
        <header className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Courses
          </h1>
          <p className="text-gray-600 dark:text-white/60 text-base md:text-lg max-w-2xl">
            Browse admin-approved courses. Start learning with curated content
            from our instructors.
          </p>
        </header>

        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap gap-2 md:gap-4 mb-10 md:mb-12">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  categoryParam === cat
                    ? "bg-transparent text-primary-pink border border-primary-pink/40 dark:border-primary-pink/50 hover:bg-primary-pink/5 dark:hover:bg-primary-pink/10"
                    : "border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-[40px] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] animate-pulse p-4 min-h-[360px] flex flex-col"
                >
                  <div className="w-full h-[155px] rounded-[22px] bg-gray-200/70 dark:bg-white/10 mb-4" />
                  <div className="flex-1 space-y-3 px-1">
                    <div className="h-4 bg-gray-200/70 dark:bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-gray-200/70 dark:bg-white/10 rounded w-full" />
                    <div className="h-3 bg-gray-200/70 dark:bg-white/10 rounded w-2/3" />
                  </div>
                  <div className="w-full h-[1px] bg-black/10 dark:bg-white/10 my-4" />
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200/70 dark:bg-white/10 rounded" />
                    <div className="h-8 w-24 bg-gray-200/70 dark:bg-white/10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 dark:bg-red-500/10 p-6 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error?.data?.message ||
                  error?.message ||
                  "Failed to load courses."}
              </p>
              <p className="text-sm text-gray-600 dark:text-white/50 mt-2">
                Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredCourses.length === 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-12 text-center">
              <p className="text-gray-600 dark:text-white/60 text-lg font-medium">
                {categoryParam !== "All"
                  ? `No courses in "${categoryParam}" yet.`
                  : "No published courses yet."}
              </p>
              <p className="text-sm text-gray-500 dark:text-white/40 mt-2">
                {categoryParam !== "All"
                  ? "Try another category or view all courses."
                  : "Courses will appear here after admin approval."}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseListPage;
