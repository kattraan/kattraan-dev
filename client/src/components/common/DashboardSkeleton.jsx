import React from 'react';
import RouteSkeleton from '@/components/skeleton/RouteSkeleton';

/**
 * Full-page dashboard skeleton shown while auth or enrollment checks are in-flight.
 * Delegates to RouteSkeleton so the placeholder matches the destination route.
 */
const DashboardSkeleton = ({ pathname }) => <RouteSkeleton pathname={pathname} />;

export default DashboardSkeleton;
