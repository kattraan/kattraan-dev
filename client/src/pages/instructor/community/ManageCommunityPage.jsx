import React from 'react';
import ManageCommunitiesView from '@/features/community/components/ManageCommunitiesView';
import { ROUTES } from '@/config/routes';

const ManageCommunityPage = () => <ManageCommunitiesView roomBasePath={ROUTES.INSTRUCTOR_COMMUNITY} />;

export default ManageCommunityPage;
