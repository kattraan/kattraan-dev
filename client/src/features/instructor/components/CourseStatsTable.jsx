import React from 'react';

/**
 * Feature component for the Instructor domain.
 * Displays a list of courses with enrollment and revenue data.
 */
const CourseStatsTable = ({ courses }) => {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] transition-colors duration-300">
            <th className="px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium transition-colors duration-300">Course Name</th>
            <th className="px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium text-center transition-colors duration-300">Enrollments</th>
            <th className="px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium text-right transition-colors duration-300">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-white/5 transition-colors duration-300">
          {courses.map((course, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors group">
              <td className="px-6 py-4 text-gray-900 dark:text-white font-medium group-hover:text-primary-pink dark:group-hover:text-primary-pink transition-colors">
                {course.name}
              </td>
              <td className="px-6 py-4 text-gray-500 dark:text-white/70 text-center transition-colors duration-300">
                {course.enrollments} Learners
              </td>
              <td className="px-6 py-4 text-green-500 dark:text-green-400 font-bold text-right transition-colors duration-300">
                ${course.revenue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseStatsTable;
