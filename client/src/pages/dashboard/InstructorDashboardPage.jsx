import React from 'react';
import InstructorDashboard from '@/features/instructor/components/InstructorDashboard';

/**
 * Standardized Instructor Dashboard Page.
 * Lives within the global dashboard directory but delegates 
 * logic to the instructor feature module.
 */
const InstructorDashboardPage = () => {
    return (
        <InstructorDashboard />
    );
};

export default InstructorDashboardPage;
