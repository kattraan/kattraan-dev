import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearSessionAndRedirectToLogin } from '@/utils/authHelpers';
import { refreshAuthSession, recheckAuthAfterRefreshFailure } from '@/api/apiClient';

/**
 * RTK Query API for courses. Use for reads (getCourseById, getInstructorCourses);
 * mutations can stay in thunks until fully migrated.
 */
function normalizeApiBaseUrl(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (() => {
    const isProduction = import.meta.env.MODE === 'production';
    const apiUrl = import.meta.env.VITE_API_URL;
    if (isProduction && (apiUrl === undefined || apiUrl === '')) {
      throw new Error(
        'VITE_API_URL is required in production. Set it in your environment or .env file.',
      );
    }
    return apiUrl
      ? normalizeApiBaseUrl(apiUrl)
      : 'http://localhost:5000/api';
  })(),
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args?.url;
    if (
      typeof url === 'string' &&
      (url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/check-auth'))
    ) {
      return result;
    }

    // Share the same cross-tab lock as axios (avoids dual refresh races).
    try {
      await refreshAuthSession();
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      const user = await recheckAuthAfterRefreshFailure();
      if (user) {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        clearSessionAndRedirectToLogin();
      }
    }
  }

  return result;
};

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery: baseQueryWithReauth,
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
      query: (params = {}) => {
        const page = params?.page || 1;
        const limit = params?.limit || 24;
        const lite = params?.lite ? '&lite=1' : '';
        return `/courses/public?page=${page}&limit=${limit}${lite}`;
      },
      transformResponse: (response) => response?.data ?? [],
      providesTags: ['PublicCourses'],
    }),
  }),
});

export const { useGetCourseByIdQuery, useGetInstructorCoursesQuery, useGetPublicCoursesQuery } = coursesApi;
