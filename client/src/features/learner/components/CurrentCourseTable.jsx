import React from 'react';
import Button from '@/components/ui/Button';

/**
 * Feature component for the Learner domain.
 * Displays a list of active courses with progress and resume actions.
 * Matches logic/style of Instructor's CourseStatsTable.
 */
const CurrentCourseTable = ({ courses }) => {
  return (
    <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 transition-colors duration-300 dark:border-white/[0.08] dark:bg-white/[0.05]">
            <th className="px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium transition-colors duration-300">Course Name</th>
            <th className="px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium text-center transition-colors duration-300">Progress</th>
            <th className="px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium text-right transition-colors duration-300">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 transition-colors duration-300 dark:divide-white/[0.06]">
          {courses.map((course, i) => (
            <tr
              key={i}
              className="group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-medium group-hover:text-primary-pink dark:group-hover:text-primary-pink transition-colors duration-300">
                        {course.title}
                    </span>
                    <span className="text-gray-400 dark:text-white/40 text-xs transition-colors duration-300">by {course.instructor}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center align-middle">
                <div className="w-full max-w-[140px] mx-auto space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 dark:text-white/40 transition-colors duration-300">
                        <span>{course.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden transition-colors duration-300">
                        <div className="h-full bg-primary-pink" style={{ width: `${course.progress}%` }} />
                    </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="secondary" size="sm" className="text-xs px-4 py-2">
                    Resume
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrentCourseTable;
