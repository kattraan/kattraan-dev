import React from 'react';
import CourseEditor from '@/features/instructor/components/editor/CourseEditor';

/**
 * Page wrapper for the Course Editor.
 * This page is used for both creating and editing courses.
 * It stays thin by delegating all editor logic to the Instructor feature module.
 */
const CourseEditorPage = () => {
    return (
        <CourseEditor />
    );
};

export default CourseEditorPage;
