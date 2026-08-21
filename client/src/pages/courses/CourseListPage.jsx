import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useGetPublicCoursesQuery } from "@/features/courses/api/coursesApi";
import CourseCard from "@/features/courses/components/CourseCard";
import { CourseGridSkeleton } from "@/components/skeleton";

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
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useGetPublicCoursesQuery(
    { page: 1, limit: 48 },
    {
      skip: false,
    },
  );

  const filteredCourses = (courses || []).filter((c) => {
    const matchesCategory =
      !categoryParam ||
      categoryParam === "All" ||
      (c.category || "").toLowerCase() === categoryParam.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (c.title || "").toLowerCase().includes(query) ||
      (c.instructor || "").toLowerCase().includes(query) ||
      (c.category || "").toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const setCategory = (cat) => {
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  return (
    <div className="dark pt-24 md:pt-32 pb-20 min-h-screen w-full bg-black text-white font-satoshi">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 lg:px-12">
        <header className="mb-12 md:mb-16">
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.22em] text-primary-pink mb-3">
            Catalog
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-5xl font-bold tracking-tight leading-[1.1] mb-3 md:mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#808080]">
              Explore
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end">
              Courses
            </span>
          </h1>
          <p className="text-[15px] text-white/60 max-w-xl mb-6 md:mb-8 leading-relaxed">
            Browse curated programs across development, design, marketing, and more.
          </p>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-[#1a1625] border border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 transition-all duration-300"
            />
          </div>
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
                    ? "bg-transparent text-primary-pink border border-primary-pink/50 hover:bg-primary-pink/10"
                    : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading && <CourseGridSkeleton count={8} variant="dark" />}

          {isError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-red-400 font-medium">
                {error?.data?.message ||
                  error?.message ||
                  "Failed to load courses."}
              </p>
              <p className="text-sm text-white/50 mt-2">
                Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredCourses.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-white/60 text-lg font-medium">
                {searchQuery.trim()
                  ? "No courses match your search."
                  : categoryParam !== "All"
                    ? `No courses in "${categoryParam}" yet.`
                    : "No published courses yet."}
              </p>
              <p className="text-sm text-white/40 mt-2">
                {searchQuery.trim()
                  ? "Try a different search term."
                  : categoryParam !== "All"
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
