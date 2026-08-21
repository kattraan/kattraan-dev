import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useGetPublicCoursesQuery } from "@/features/courses/api/coursesApi";
import { ROUTES } from "@/config/routes";
import { EXPLORE_CATEGORIES } from "./ExploreNavMenu";

/**
 * Mobile accordion for Explore categories + sample courses.
 */
const ExploreMobileSection = ({ isDarkNavChrome, linkClassName, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState(EXPLORE_CATEGORIES[0]);

  const { data: courses = [], isLoading } = useGetPublicCoursesQuery(
    { page: 1, limit: 48, lite: true },
    { skip: !expanded },
  );

  const activeCourses = useMemo(() => {
    return (courses || [])
      .filter((c) => {
        const cat = (c.category || "Other").toLowerCase();
        if (activeCategory === "Other") {
          return (
            cat === "other" ||
            !EXPLORE_CATEGORIES.slice(0, -1).some((x) => x.toLowerCase() === cat)
          );
        }
        return cat === activeCategory.toLowerCase();
      })
      .slice(0, 4);
  }, [courses, activeCategory]);

  const hoverBg = isDarkNavChrome
    ? "hover:bg-white/5"
    : "hover:bg-gray-100 dark:hover:bg-white/5";

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`flex items-center justify-between text-base font-medium py-3 px-3 rounded-xl transition-colors ${linkClassName} ${hoverBg}`}
        aria-expanded={expanded}
      >
        Explore
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-2 pb-2 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5 px-1">
            {EXPLORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  cat === activeCategory
                    ? "bg-[#131313] text-white"
                    : isDarkNavChrome
                      ? "bg-white/5 text-white/70"
                      : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className={`px-3 text-sm ${isDarkNavChrome ? "text-white/40" : "text-gray-400"}`}>
              Loading…
            </p>
          ) : activeCourses.length === 0 ? (
            <p className={`px-3 text-sm ${isDarkNavChrome ? "text-white/40" : "text-gray-400"}`}>
              No courses yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {activeCourses.map((course) => {
                const id = course._id || course.id;
                return (
                  <li key={id}>
                    <Link
                      to={`${ROUTES.COURSE_DETAILS}/${id}`}
                      onClick={onNavigate}
                      className={`block py-2 px-3 rounded-lg text-sm ${linkClassName} ${hoverBg}`}
                    >
                      {course.title || "Untitled Course"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            to={`${ROUTES.COURSES}?category=${encodeURIComponent(activeCategory)}`}
            onClick={onNavigate}
            className="mx-1 mt-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end px-4 py-2.5 text-sm font-medium text-white"
          >
            View {activeCategory} courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExploreMobileSection;
