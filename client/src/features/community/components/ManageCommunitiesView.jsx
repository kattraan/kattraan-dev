import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Archive, MessageCircle, Pencil, Settings, Users, ChevronDown, ChevronUp } from 'lucide-react';
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
 * Single-section community management view using expandable cards.
 */
const ManageCommunitiesView = ({ roomBasePath }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const { communities, pendingRequests, members } = useSelector((state) => state.community);
    const instructorCourses = useSelector((state) => state.courses.courses);

    const [expandedId, setExpandedId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [busyUserId, setBusyUserId] = useState(null);
    const [editingCommunity, setEditingCommunity] = useState(null);

    useEffect(() => {
        dispatch(fetchCommunities());
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    useEffect(() => {
        if (expandedId) {
            dispatch(fetchPendingRequests(expandedId));
            dispatch(fetchMembers(expandedId));
        }
    }, [dispatch, expandedId]);

    const availableCourses = useMemo(() => {
        const taken = new Set(communities.map((c) => c.course?._id || c.course));
        return (instructorCourses || []).filter((c) => !taken.has(c._id));
    }, [communities, instructorCourses]);

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
        const result = await dispatch(updateCommunity({ id: editingCommunity._id, payload }));
        setSaving(false);
        if (updateCommunity.fulfilled.match(result)) {
            toast.success('Community updated');
            setEditModalOpen(false);
            setEditingCommunity(null);
        } else {
            toast.error('Could not update community', result.payload || 'Please try again.');
        }
    };

    const openEdit = (e, community) => {
        e.stopPropagation();
        setEditingCommunity(community);
        setEditModalOpen(true);
    };

    const handleArchive = async (e, community) => {
        e.stopPropagation();
        const ok = await confirm({
            title: 'Archive community?',
            message: `"${community.name}" will be hidden from members. This cannot be undone.`,
        });
        if (!ok) return;
        const result = await dispatch(archiveCommunity(community._id));
        if (archiveCommunity.fulfilled.match(result)) {
            toast.success('Community archived');
            if (expandedId === community._id) setExpandedId(null);
        } else {
            toast.error('Could not archive community', result.payload);
        }
    };

    const handleDecision = async (userId, action) => {
        setBusyUserId(userId);
        const result = await dispatch(decideJoinRequest({ id: expandedId, userId, action }));
        setBusyUserId(null);
        if (decideJoinRequest.fulfilled.match(result)) {
            toast.success(action === 'approve' ? 'Request approved' : 'Request rejected');
            if (action === 'approve') dispatch(fetchMembers(expandedId));
        } else {
            toast.error('Could not update request', result.payload);
        }
    };

    const handleRemoveMember = async (userId) => {
        setBusyUserId(userId);
        const result = await dispatch(removeMember({ id: expandedId, userId }));
        setBusyUserId(null);
        if (removeMember.fulfilled.match(result)) {
            toast.success('Member removed');
        } else {
            toast.error('Could not remove member', result.payload);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 bg-white dark:bg-[#1a1625] p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-200 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-pink/10 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Community Management</h1>
                    <p className="text-gray-500 dark:text-white/50 mt-1 max-w-lg">Manage all your hubs from a single place. Expand a community to view requests and members.</p>
                </div>
                <Button onClick={() => setModalOpen(true)} disabled={availableCourses.length === 0} className="shadow-lg shadow-primary-pink/20 hover:shadow-primary-pink/30 transition-shadow relative z-10">
                    <Plus size={18} className="mr-2" /> New Community
                </Button>
            </div>

            <div className="space-y-4">
                {communities.length === 0 ? (
                    <div className="bg-white dark:bg-[#1a1625] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center flex flex-col items-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No communities yet</h3>
                        <p className="text-gray-500 dark:text-white/50 max-w-sm">Create your first community to start connecting with your learners.</p>
                    </div>
                ) : (
                    communities.map((c) => {
                        const isExpanded = expandedId === c._id;
                        return (
                            <div 
                                key={c._id} 
                                className={`bg-white dark:bg-[#1a1625] border rounded-[28px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary-pink shadow-lg' : 'border-gray-200 dark:border-white/10 shadow-sm hover:border-primary-pink/30'}`}
                            >
                                {/* Card Header (Always visible) */}
                                <div 
                                    className={`p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group/header ${isExpanded ? 'bg-primary-pink/5' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
                                    onClick={() => navigate(`${roomBasePath}/${c._id}`)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className={`text-xl font-extrabold transition-colors ${isExpanded ? 'text-primary-pink' : 'text-gray-900 dark:text-white group-hover/header:text-primary-pink'}`}>{c.name}</h2>
                                            {isExpanded && <Badge variant="primary" className="text-[10px] px-2 py-0.5 uppercase tracking-wider">Managing</Badge>}
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-white/50 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/20"></span>
                                            {c.course?.title || 'General'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-1">
                                            <button 
                                                onClick={(e) => openEdit(e, c)} 
                                                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                title="Edit Community"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => handleArchive(e, c)} 
                                                className="p-2 rounded-lg text-gray-500 hover:text-red-500 dark:text-white/50 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                title="Archive Community"
                                            >
                                                <Archive size={16} />
                                            </button>
                                            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(c._id);
                                                }}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${isExpanded ? 'text-primary-pink bg-primary-pink/10' : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                            >
                                                Manage {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-white/5 p-6 sm:p-8 bg-gray-50/80 dark:bg-[#110e18]">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Pending Requests */}
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    Pending Requests
                                                    {pendingRequests.length > 0 && (
                                                        <Badge variant="warning" className="rounded-full px-2">{pendingRequests.length}</Badge>
                                                    )}
                                                </h3>
                                                <div className="space-y-3">
                                                    {pendingRequests.length === 0 ? (
                                                        <div className="text-center py-8 bg-white dark:bg-[#1a1625] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
                                                            <p className="text-sm text-gray-400 dark:text-white/40">No pending requests.</p>
                                                        </div>
                                                    ) : (
                                                        pendingRequests.map((req) => (
                                                            <div key={req._id} className="bg-white dark:bg-[#1a1625] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-2 transition-colors hover:border-gray-200 dark:hover:border-white/10">
                                                                <JoinRequestRow
                                                                    request={req}
                                                                    busy={busyUserId === req.user?._id}
                                                                    onApprove={() => handleDecision(req.user._id, 'approve')}
                                                                    onReject={() => handleDecision(req.user._id, 'reject')}
                                                                />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Members */}
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    Current Members
                                                    <Badge variant="success" className="rounded-full px-2">{members.length}</Badge>
                                                </h3>
                                                <div className="space-y-3">
                                                    {members.length === 0 ? (
                                                        <div className="text-center py-8 bg-white dark:bg-[#1a1625] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
                                                            <p className="text-sm text-gray-400 dark:text-white/40">No members yet.</p>
                                                        </div>
                                                    ) : (
                                                        members.map((m) => (
                                                            <div key={m._id} className="bg-white dark:bg-[#1a1625] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-2 transition-colors hover:border-gray-200 dark:hover:border-white/10">
                                                                <MemberListItem
                                                                    member={m}
                                                                    busy={busyUserId === m.user?._id}
                                                                    onRemove={() => handleRemoveMember(m.user._id)}
                                                                />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <CreateCommunityModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                courses={availableCourses}
                onCreate={handleCreate}
                loading={creating}
            />

            {editingCommunity && (
                <EditCommunityModal
                    isOpen={editModalOpen}
                    onClose={() => { setEditModalOpen(false); setEditingCommunity(null); }}
                    community={editingCommunity}
                    onSave={handleSave}
                    loading={saving}
                />
            )}
        </div>
    );
};

export default ManageCommunitiesView;
