import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search } from 'lucide-react';
import { fetchCommunities, createCommunity } from '@/features/community/store/communitySlice';
import { fetchInstructorCourses } from '@/features/courses/store/courseSlice';
import { Button, useToast } from '@/components/ui';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import { getCommunityAvatar } from '@/components/community/CommunityChatPanels';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * Instructor community list — tap a row to open the chat room.
 */
const ManageCommunitiesView = ({ roomBasePath }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { communities } = useSelector((state) => state.community);
    const instructorCourses = useSelector((state) => state.courses.courses);

    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchCommunities());
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    const availableCourses = useMemo(() => {
        const taken = new Set(
            communities.map((c) => String(c.course?._id || c.course || '')).filter(Boolean),
        );
        return (instructorCourses || []).filter((c) => !taken.has(String(c._id || c.id)));
    }, [communities, instructorCourses]);

    const filteredCommunities = useMemo(() => {
        if (!searchQuery) return communities;
        const lowerQ = searchQuery.toLowerCase();
        return communities.filter(
            (c) =>
                c.name?.toLowerCase().includes(lowerQ) ||
                c.course?.title?.toLowerCase().includes(lowerQ),
        );
    }, [communities, searchQuery]);

    const handleCreate = async (payload) => {
        if (creating) return;
        setCreating(true);
        try {
            const result = await dispatch(createCommunity(payload));
            if (createCommunity.fulfilled.match(result)) {
                toast.success('Community created', 'Learners can now request to join.');
                setModalOpen(false);
            } else {
                toast.error('Could not create community', result.payload || 'Please try again.');
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <DashboardLayout
            title="Community"
            subtitle="Open a community to chat, manage members, and pin messages for learners."
            headerRight={
                <Button
                    onClick={() => setModalOpen(true)}
                    disabled={availableCourses.length === 0}
                    className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end hover:opacity-90 text-white rounded-xl px-6 shadow-lg transition-all"
                >
                    <Plus size={18} className="mr-2" /> New Community
                </Button>
            }
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

                {communities.length === 0 && (
                    <div className="bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-6">
                            <Users size={32} className="text-gray-400 dark:text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            No communities yet
                        </h3>
                        <p className="text-gray-500 dark:text-white/40 text-sm max-w-[320px] transition-colors duration-300">
                            Create your first community to start connecting with your learners.
                        </p>
                    </div>
                )}

                {communities.length > 0 && filteredCommunities.length === 0 && (
                    <div className="bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-6">
                            <Users size={32} className="text-gray-400 dark:text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            No matches found
                        </h3>
                        <p className="text-gray-500 dark:text-white/40 text-sm max-w-[320px] transition-colors duration-300">
                            Try a different search term.
                        </p>
                    </div>
                )}

                {filteredCommunities.length > 0 && (
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.06]">
                        {filteredCommunities.map((c) => {
                            const thumbnail = getCommunityAvatar(c);
                            return (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => navigate(`${roomBasePath}/${c._id}`)}
                                    className="group w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                                >
                                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10">
                                        <img src={thumbnail} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-[15px] sm:text-base font-semibold truncate text-gray-900 dark:text-white group-hover:text-primary-pink transition-colors">
                                            {c.name}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-white/45 truncate">
                                            {c.course?.title || 'General'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <CreateCommunityModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                courses={availableCourses}
                onCreate={handleCreate}
                loading={creating}
            />
        </DashboardLayout>
    );
};

export default ManageCommunitiesView;
