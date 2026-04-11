import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import courseReducer from '@/features/courses/store/courseSlice';
import { coursesApi } from '@/features/courses/api/coursesApi';

/**
 * Central Redux Store Configuration
 * RTK Query (coursesApi) used for course reads; thunks remain for mutations.
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer,
        [coursesApi.reducerPath]: coursesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['courses'],
            },
        }).concat(coursesApi.middleware),
});

export default store;
