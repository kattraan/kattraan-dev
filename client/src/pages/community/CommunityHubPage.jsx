import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Sparkles } from 'lucide-react';
import {
    fetchCommunities,
    requestJoin,
    leaveCommunity,
    updateCommunity,
} from '@/features/community/store/communitySlice';
import CommunityCard from '@/components/community/CommunityCard';
import ViewMembersModal from '@/components/community/ViewMembersModal';
import EditCommunityModal from '@/components/community/EditCommunityModal';
import { useToast, useConfirmDialog } from '@/components/ui';
import { ROUTES } from '@/config/routes';

/**
 * Lists the communities visible to the current user (enrolled courses for
 * learners, own courses for instructors, all for admins) with join/open actions.
 */
const CommunityHubPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const { communities, loading } = useSelector((state) => state.community);
    const [joiningId, setJoiningId] = useState(null);
    const [viewMembersId, setViewMembersId] = useState(null);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
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

    const handleViewMembers = (community) => setViewMembersId(community._id);

    const handleEdit = (community) => setEditingCommunity(community);

    const handleSaveEdit = async (payload) => {
        setSavingEdit(true);
        const result = await dispatch(updateCommunity({ id: editingCommunity._id, payload }));
        setSavingEdit(false);
        if (updateCommunity.fulfilled.match(result)) {
            toast.success('Community updated');
            setEditingCommunity(null);
        } else {
            toast.error('Could not update community', result.payload || 'Please try again.');
        }
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
        return communities.filter(c => 
            c.name?.toLowerCase().includes(lowerQ) || 
            c.course?.title?.toLowerCase().includes(lowerQ)
        );
    }, [communities, searchQuery]);

    return (
        <div className="space-y-8 font-satoshi max-w-7xl mx-auto w-full pb-12">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-purple via-primary-pink to-orange-400 p-8 sm:p-12 shadow-2xl">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/20 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <MessageCircle size={36} className="text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-3">
                            <Sparkles size={14} />
                            Hub
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mb-3">
                            Communities
                        </h1>
                        <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                            Connect, collaborate, and learn together. Join course discussions, chat with peers, and get direct access to your instructors in real-time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Your Network
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-sm font-medium">
                        {communities.length}
                    </span>
                </h2>
                
                <div className="relative w-full sm:w-72 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-pink transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search communities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse"></div>
                    ))}
                </div>
            ) : communities.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={28} className="text-gray-400 dark:text-white/40" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No communities yet</h3>
                    <p className="text-gray-500 dark:text-white/50 max-w-sm mx-auto">
                        Communities will appear here once your instructors create them for your enrolled courses.
                    </p>
                </div>
            ) : filteredCommunities.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-white/50">
                    No communities found matching "{searchQuery}"
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCommunities.map((community) => (
                        <CommunityCard
                            key={community._id}
                            community={community}
                            onOpen={handleOpen}
                            onJoin={handleJoin}
                            onViewMembers={handleViewMembers}
                            onEdit={handleEdit}
                            onLeave={handleLeave}
                            joining={joiningId === community._id}
                        />
                    ))}
                </div>
            )}

            <ViewMembersModal
                isOpen={!!viewMembersId}
                onClose={() => setViewMembersId(null)}
                communityId={viewMembersId}
            />

            <EditCommunityModal
                isOpen={!!editingCommunity}
                onClose={() => setEditingCommunity(null)}
                community={editingCommunity}
                onSave={handleSaveEdit}
                loading={savingEdit}
            />
        </div>
    );
};

export default CommunityHubPage;

