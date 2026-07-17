/**
 * Related courses section — only renders when the parent passes a real list.
 * Fake marketing cards / "Watch Before Coding In" copy were removed for production.
 */
import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

const RelatedCourses = ({ courses = [] }) => {
  if (!Array.isArray(courses) || courses.length === 0) return null;

  return (
    <div className="mt-20 border-t border-white/10 pt-12 font-satoshi">
      <h2 className="text-2xl font-bold mb-8 text-white">Related courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course, idx) => (
          <div key={course.id || course._id || idx} className="group cursor-pointer">
            <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video border border-white/10 group-hover:border-white/20 transition-all duration-500">
              {course.image || course.thumbnail ? (
                <img
                  src={course.image || course.thumbnail}
                  alt={course.title || 'Course'}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-white/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-white text-[16px] leading-tight line-clamp-2">
                {course.title}
              </h3>
              {(course.instructor || course.rating != null) && (
                <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-medium">
                  {course.instructor && <span>{course.instructor}</span>}
                  {course.rating != null && (
                    <>
                      {course.instructor && <span className="w-1 h-1 rounded-full bg-white/20" />}
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="group cursor-pointer h-full min-h-[160px] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 flex flex-col items-center justify-center gap-4 relative overflow-hidden backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500 bg-white/5 relative z-10">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-xs uppercase tracking-widest relative z-10">
            Explore All
          </span>
        </div>
      </div>
    </div>
  );
};

export default RelatedCourses;
