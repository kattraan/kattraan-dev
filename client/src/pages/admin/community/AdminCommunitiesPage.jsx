import React from 'react';
import ManageCommunitiesView from '@/features/community/components/ManageCommunitiesView';
import { ROUTES } from '@/config/routes';

const AdminCommunitiesPage = () => <ManageCommunitiesView roomBasePath={ROUTES.ADMIN_COMMUNITIES} />;

export default AdminCommunitiesPage;
