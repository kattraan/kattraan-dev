import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
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

    return (
        <div className="space-y-8 font-satoshi">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-pink to-primary-purple flex items-center justify-center">
                    <MessageCircle size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Communities</h1>
                    <p className="text-sm text-gray-500 dark:text-white/40">Chat live with your course instructors and peers</p>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500 dark:text-white/40">Loading communities…</p>
            ) : communities.length === 0 ? (
                <p className="text-gray-500 dark:text-white/40">No communities yet. They appear here once your instructors create one.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {communities.map((community) => (
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
