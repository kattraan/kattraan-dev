import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Archive, MessageCircle, Pencil } from 'lucide-react';
import {
    fetchCommunities,
    createCommunity,
    updateCommunity,
    archiveCommunity,
    fetchPendingRequests,
    decideJoinRequest,
    fetchMembers,
    removeMember,
} from '@/features/community/store/communitySlice';
import { fetchInstructorCourses } from '@/features/courses/store/courseSlice';
import { Button, Badge, useToast, useConfirmDialog } from '@/components/ui';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import EditCommunityModal from '@/components/community/EditCommunityModal';
import JoinRequestRow from '@/components/community/JoinRequestRow';
import MemberListItem from '@/components/community/MemberListItem';

/**
 * Master-detail community management view shared by the instructor and admin
 * "Manage Communities" pages. The backend already scopes the community list by
 * role (instructor: own courses, admin: all), so this component needs no role prop.
 * @param {{ roomBasePath: string }} props - dashboard-scoped base path for the chat room route
 *   (e.g. "/instructor-dashboard/community" or "/admin-dashboard/communities"), so "Open Chat"
 *   stays inside the caller's own dashboard instead of a separate layout.
 */
const ManageCommunitiesView = ({ roomBasePath }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const { communities, pendingRequests, members } = useSelector((state) => state.community);
    const instructorCourses = useSelector((state) => state.courses.courses);

    const [selectedId, setSelectedId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [busyUserId, setBusyUserId] = useState(null);

    useEffect(() => {
        dispatch(fetchCommunities());
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedId) {
            dispatch(fetchPendingRequests(selectedId));
            dispatch(fetchMembers(selectedId));
        }
    }, [dispatch, selectedId]);

    const availableCourses = useMemo(() => {
        const taken = new Set(communities.map((c) => c.course?._id || c.course));
        return (instructorCourses || []).filter((c) => !taken.has(c._id));
    }, [communities, instructorCourses]);

    const selected = communities.find((c) => c._id === selectedId);

    const handleCreate = async (payload) => {
        setCreating(true);
        const result = await dispatch(createCommunity(payload));
        setCreating(false);
        if (createCommunity.fulfilled.match(result)) {
            toast.success('Community created', 'Learners can now request to join.');
            setModalOpen(false);
        } else {
            toast.error('Could not create community', result.payload || 'Please try again.');
        }
    };

    const handleSave = async (payload) => {
        setSaving(true);
        const result = await dispatch(updateCommunity({ id: selectedId, payload }));
        setSaving(false);
        if (updateCommunity.fulfilled.match(result)) {
            toast.success('Community updated');
            setEditModalOpen(false);
        } else {
            toast.error('Could not update community', result.payload || 'Please try again.');
        }
    };

    const handleArchive = async (community) => {
        const ok = await confirm({
            title: 'Archive community?',
            message: `"${community.name}" will be hidden from members. This cannot be undone.`,
        });
        if (!ok) return;
        const result = await dispatch(archiveCommunity(community._id));
        if (archiveCommunity.fulfilled.match(result)) {
            toast.success('Community archived');
            if (selectedId === community._id) setSelectedId(null);
        } else {
            toast.error('Could not archive community', result.payload);
        }
    };

    const handleDecision = async (userId, action) => {
        setBusyUserId(userId);
        const result = await dispatch(decideJoinRequest({ id: selectedId, userId, action }));
        setBusyUserId(null);
        if (decideJoinRequest.fulfilled.match(result)) {
            toast.success(action === 'approve' ? 'Request approved' : 'Request rejected');
            if (action === 'approve') dispatch(fetchMembers(selectedId));
        } else {
            toast.error('Could not update request', result.payload);
        }
    };

    const handleRemoveMember = async (userId) => {
        setBusyUserId(userId);
        const result = await dispatch(removeMember({ id: selectedId, userId }));
        setBusyUserId(null);
        if (removeMember.fulfilled.match(result)) {
            toast.success('Member removed');
        } else {
            toast.error('Could not remove member', result.payload);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Manage Communities</h1>
                    <p className="text-sm text-gray-500 dark:text-white/40">Create communities and review join requests</p>
                </div>
                <Button onClick={() => setModalOpen(true)} disabled={availableCourses.length === 0}>
                    <Plus size={16} className="mr-2" /> Create Community
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <div className="space-y-3">
                    {communities.map((c) => (
                        <button
                            key={c._id}
                            onClick={() => setSelectedId(c._id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                selectedId === c._id
                                    ? 'border-primary-pink/50 bg-primary-pink/5'
                                    : 'border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                            }`}
                        >
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{c.name}</p>
                            <p className="text-xs text-gray-500 dark:text-white/40 truncate">{c.course?.title}</p>
                        </button>
                    ))}
                    {communities.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-white/40">No communities yet.</p>
                    )}
                </div>

                <div>
                    {!selected ? (
                        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[28px] p-10 text-center text-gray-500 dark:text-white/40">
                            Select a community to manage its requests and members.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[28px] p-5 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                                    <p className="text-xs text-gray-500 dark:text-white/40">{selected.course?.title}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => navigate(`${roomBasePath}/${selected._id}`)}
                                    >
                                        <MessageCircle size={14} className="mr-1" /> Open Chat
                                    </Button>
                                    <Button size="sm" variant="muted" onClick={() => setEditModalOpen(true)}>
                                        <Pencil size={14} className="mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="muted" onClick={() => handleArchive(selected)}>
                                        <Archive size={14} className="mr-1" /> Archive
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-600 dark:text-white/70 mb-3 flex items-center gap-2">
                                    Pending Requests <Badge>{pendingRequests.length}</Badge>
                                </h3>
                                <div className="space-y-2">
                                    {pendingRequests.length === 0 ? (
                                        <p className="text-sm text-gray-400 dark:text-white/30">No pending requests.</p>
                                    ) : (
                                        pendingRequests.map((req) => (
                                            <JoinRequestRow
                                                key={req._id}
                                                request={req}
                                                busy={busyUserId === req.user?._id}
                                                onApprove={() => handleDecision(req.user._id, 'approve')}
                                                onReject={() => handleDecision(req.user._id, 'reject')}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-600 dark:text-white/70 mb-3 flex items-center gap-2">
                                    Members <Badge>{members.length}</Badge>
                                </h3>
                                <div className="space-y-2">
                                    {members.map((m) => (
                                        <MemberListItem
                                            key={m._id}
                                            member={m}
                                            busy={busyUserId === m.user?._id}
                                            onRemove={() => handleRemoveMember(m.user._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CreateCommunityModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                courses={availableCourses}
                onCreate={handleCreate}
                loading={creating}
            />

            <EditCommunityModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                community={selected}
                onSave={handleSave}
                loading={saving}
            />
        </div>
    );
};

export default ManageCommunitiesView;
