import React from 'react';
import { useLocation } from 'react-router-dom';
import Skeleton from '@/components/ui/Skeleton';
import { getRouteSkeletonVariant } from './getRouteSkeletonVariant';
import {
  DashboardRouteSkeleton,
  CourseViewSkeleton,
  CourseDetailsSkeleton,
  CheckoutSkeleton,
  CartSkeleton,
  MainLayoutSkeleton,
  MinimalSkeleton,
} from './PageSkeletons';
import { CourseGridSkeleton } from './CourseCardSkeleton';

/**
 * Renders a route-appropriate skeleton based on the current pathname.
 * Used by ProtectedRoute, EnrolledCourseGuard, and App Suspense fallback.
 */
function RouteSkeleton({ pathname: pathnameProp, variant: variantOverride }) {
  const location = useLocation();
  const pathname = pathnameProp ?? location.pathname;
  const { layout, variant } = variantOverride
    ? { layout: 'dashboard', variant: variantOverride }
    : getRouteSkeletonVariant(pathname);

  switch (layout) {
    case 'dashboard':
      return <DashboardRouteSkeleton variant={variant} />;

    case 'courseView':
      return <CourseViewSkeleton />;

    case 'courseDetails':
      return <CourseDetailsSkeleton />;

    case 'checkout':
      return <CheckoutSkeleton />;

    case 'main':
      if (variant === 'cart') {
        return (
          <MainLayoutSkeleton>
            <CartSkeleton />
          </MainLayoutSkeleton>
        );
      }
      return (
        <MainLayoutSkeleton>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full max-w-md rounded-2xl" />
            </div>
            <CourseGridSkeleton count={8} variant="dark" />
          </div>
        </MainLayoutSkeleton>
      );

    case 'minimal':
    default:
      return <MinimalSkeleton />;
  }
}

export default RouteSkeleton;
