import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query API for courses. Use for reads (getCourseById, getInstructorCourses);
 * mutations can stay in thunks until fully migrated.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery,
  tagTypes: ['Course', 'CourseList', 'PublicCourses'],
  endpoints: (builder) => ({
    getCourseById: builder.query({
      query: (id) => `/courses/${id}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result, error, id) => (id ? [{ type: 'Course', id }] : []),
    }),
    getInstructorCourses: builder.query({
      query: () => '/courses/instructor',
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['CourseList'],
    }),
    getPublicCourses: builder.query({
      query: () => '/courses/public',
      transformResponse: (response) => response?.data?.data ?? response?.data ?? [],
      providesTags: ['PublicCourses'],
    }),
  }),
});

export const { useGetCourseByIdQuery, useGetInstructorCoursesQuery, useGetPublicCoursesQuery } = coursesApi;
