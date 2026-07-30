import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
import { fetchCommunities, requestJoin, leaveCommunity } from '@/features/community/store/communitySlice';
import CommunityCard from '@/components/community/CommunityCard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast, useConfirmDialog } from '@/components/ui';
import { ROUTES } from '@/config/routes';

/**
 * Lists the communities visible to the current user with join/open actions.
 */
const CommunityHubPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const { communities, loading } = useSelector((state) => state.community);
    const [joiningId, setJoiningId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchCommunities());
    }, [dispatch]);

    const handleOpen = (community) => {
        navigate(`${ROUTES.COMMUNITY}/${community._id}`);
    };

    const handleJoin = async (community) => {
        setJoiningId(community._id);
        const result = await dispatch(requestJoin(community._id));
        setJoiningId(null);
        if (requestJoin.fulfilled.match(result)) {
            toast.success('Request sent', 'The instructor will review your request to join.');
            dispatch(fetchCommunities());
        } else {
            toast.error('Could not send request', result.payload || 'Please try again.');
        }
    };

    const handleViewMembers = (community) => {
        navigate(`${ROUTES.COMMUNITY}/${community._id}`, { state: { panel: 'members' } });
    };

    const handleLeave = async (community) => {
        const ok = await confirm({
            title: 'Leave this community?',
            message: `You'll need to request to join "${community.name}" again later.`,
            confirmText: 'Leave',
        });
        if (!ok) return;
        const result = await dispatch(leaveCommunity(community._id));
        if (leaveCommunity.fulfilled.match(result)) {
            toast.success('You left the community');
        } else {
            toast.error('Could not leave community', result.payload || 'Please try again.');
        }
    };

    const filteredCommunities = useMemo(() => {
        if (!searchQuery) return communities;
        const lowerQ = searchQuery.toLowerCase();
        return communities.filter(
            (c) =>
                c.name?.toLowerCase().includes(lowerQ) ||
                c.course?.title?.toLowerCase().includes(lowerQ),
        );
    }, [communities, searchQuery]);

    return (
        <DashboardLayout
            title="Community"
            subtitle="Connect, collaborate, and learn together with your peers."
        >
            <div className="space-y-10 font-satoshi">
                <div className="relative w-full max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 transition-colors duration-300" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search communities..."
                        className="w-full bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 transition-all duration-300 shadow-sm dark:shadow-none"
                    />
                </div>

                {loading && (
                    <div className="py-16 text-center text-gray-500 dark:text-white/50">
                        Loading your communities...
                    </div>
                )}

                {!loading && communities.length === 0 && (
                    <div className="bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-6">
                            <MessageCircle size={32} className="text-gray-400 dark:text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            No communities yet
                        </h3>
                        <p className="text-gray-500 dark:text-white/40 text-sm max-w-[320px] transition-colors duration-300">
                            Communities will appear here once your instructors create them for your enrolled courses.
                        </p>
                    </div>
                )}

                {!loading && communities.length > 0 && filteredCommunities.length === 0 && (
                    <div className="bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-6">
                            <MessageCircle size={32} className="text-gray-400 dark:text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            No matches found
                        </h3>
                        <p className="text-gray-500 dark:text-white/40 text-sm max-w-[320px] transition-colors duration-300">
                            Try a different search term.
                        </p>
                    </div>
                )}

                {!loading && filteredCommunities.length > 0 && (
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.06]">
                        {filteredCommunities.map((community) => (
                            <CommunityCard
                                key={community._id}
                                community={community}
                                onOpen={handleOpen}
                                onJoin={handleJoin}
                                onViewMembers={handleViewMembers}
                                onLeave={handleLeave}
                                joining={joiningId === community._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CommunityHubPage;
