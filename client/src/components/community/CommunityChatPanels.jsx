import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, BookOpen, Search, Camera, Pencil } from 'lucide-react';
import {
    fetchMembers,
    fetchPendingRequests,
    updateCommunity,
    uploadCommunityAvatar,
    decideJoinRequest,
    removeMember,
} from '@/features/community/store/communitySlice';
import MemberListItem from '@/components/community/MemberListItem';
import JoinRequestRow from '@/components/community/JoinRequestRow';
import { Button, Input, useToast } from '@/components/ui';

const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';

export const getCommunityAvatar = (community) =>
    community?.avatar || community?.course?.thumbnail || community?.course?.image || PLACEHOLDER_IMAGE;

/** Dropdown menu attached to the three-dot button. */
export const CommunityChatMenu = ({ open, onClose, menuRef, onSelect }) => {
    if (!open) return null;

    const items = [
        { id: 'info', label: 'Community info', icon: BookOpen },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'search', label: 'Search messages', icon: Search },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute right-2 top-full mt-1 w-52 bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
        >
            {items.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => {
                        onSelect(id);
                        onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white/85 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                >
                    <Icon size={16} className="text-primary-purple dark:text-primary-pink shrink-0" />
                    {label}
                </button>
            ))}
        </div>
    );
};

/** Inline community info with optional edit + avatar change for moderators. */
export const CommunityInfoPanel = ({ community, memberCount, onlineCount, canEdit, onUpdated }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(community?.name || '');
    const [description, setDescription] = useState(community?.description || '');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const avatarUrl = getCommunityAvatar(community);

    useEffect(() => {
        setName(community?.name || '');
        setDescription(community?.description || '');
    }, [community]);

    const handleSave = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        setSaving(true);
        const result = await dispatch(updateCommunity({ id: community._id, payload: { name: trimmed, description } }));
        setSaving(false);
        if (updateCommunity.fulfilled.match(result)) {
            toast.success('Community updated');
            setEditing(false);
            onUpdated?.();
        } else {
            toast.error('Could not update', result.payload || 'Please try again.');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !file.type.startsWith('image/')) return;
        setUploadingAvatar(true);
        const result = await dispatch(uploadCommunityAvatar({ id: community._id, file }));
        setUploadingAvatar(false);
        if (uploadCommunityAvatar.fulfilled.match(result)) {
            toast.success('Profile photo updated');
            onUpdated?.();
        } else {
            toast.error('Could not upload photo', result.payload || 'Please try again.');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/90 dark:bg-[#0c091a]/95">
            <div className="flex flex-col items-center pt-10 pb-8 px-6 border-b border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#1a1625]/80 backdrop-blur-sm">
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary-pink/20 shadow-md">
                        <img src={avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                    </div>
                    {canEdit && (
                        <>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary-pink text-white flex items-center justify-center shadow-md hover:bg-primary-pink/90 transition-colors disabled:opacity-60"
                                aria-label="Change profile photo"
                            >
                                <Camera size={14} />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={handleSave} className="w-full max-w-md space-y-3">
                        <Input
                            label="Community name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="flex gap-2 pt-1">
                            <Button type="submit" className="flex-1" isLoading={saving} disabled={!name.trim()}>
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="muted"
                                className="flex-1"
                                onClick={() => {
                                    setEditing(false);
                                    setName(community?.name || '');
                                    setDescription(community?.description || '');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">{community.name}</h2>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="p-1.5 rounded-lg text-gray-500 dark:text-white/45 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary-purple dark:hover:text-primary-pink transition-colors"
                                    aria-label="Edit community"
                                >
                                    <Pencil size={15} />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-white/45 mt-1 text-center">{community.course?.title}</p>
                        {community.description && (
                            <p className="text-sm text-gray-600 dark:text-white/55 mt-4 text-center max-w-md leading-relaxed">
                                {community.description}
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="p-4 space-y-2">
                <div className="px-4 py-3 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-primary-purple dark:text-primary-pink uppercase tracking-wide mb-1">Members</p>
                    <p className="text-sm text-gray-700 dark:text-white/80">
                        {memberCount} total{onlineCount > 0 ? ` · ${onlineCount} online` : ''}
                    </p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-primary-purple dark:text-primary-pink uppercase tracking-wide mb-1">Course</p>
                    <p className="text-sm text-gray-700 dark:text-white/80">{community.course?.title || '—'}</p>
                </div>
            </div>
        </div>
    );
};

/** Inline members list with join-request moderation for owners/admins. */
export const CommunityMembersPanel = ({ communityId, onlineUserIds, canModerate }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const members = useSelector((state) => state.community.members);
    const pendingRequests = useSelector((state) => state.community.pendingRequests);
    const [busyUserId, setBusyUserId] = useState(null);

    useEffect(() => {
        if (communityId) {
            dispatch(fetchMembers(communityId));
            if (canModerate) dispatch(fetchPendingRequests(communityId));
        }
    }, [communityId, canModerate, dispatch]);

    const handleDecision = async (userId, action) => {
        setBusyUserId(userId);
        const result = await dispatch(decideJoinRequest({ id: communityId, userId, action }));
        setBusyUserId(null);
        if (decideJoinRequest.fulfilled.match(result)) {
            toast.success(action === 'approve' ? 'Request approved' : 'Request rejected');
            if (action === 'approve') dispatch(fetchMembers(communityId));
        } else {
            toast.error('Could not update request', result.payload);
        }
    };

    const handleRemoveMember = async (userId) => {
        setBusyUserId(userId);
        const result = await dispatch(removeMember({ id: communityId, userId }));
        setBusyUserId(null);
        if (removeMember.fulfilled.match(result)) {
            toast.success('Member removed');
        } else {
            toast.error('Could not remove member', result.payload);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/90 dark:bg-[#0c091a]/95 p-4">
            {canModerate && pendingRequests.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide px-1 mb-3">
                        Pending requests ({pendingRequests.length})
                    </p>
                    <div className="space-y-2">
                        {pendingRequests.map((req) => (
                            <JoinRequestRow
                                key={req._id}
                                request={req}
                                busy={busyUserId === req.user?._id}
                                onApprove={() => handleDecision(req.user._id, 'approve')}
                                onReject={() => handleDecision(req.user._id, 'reject')}
                            />
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide px-1 mb-3">
                {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
                {members.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-white/40 text-center py-8">No members yet.</p>
                ) : (
                    members.map((m) => (
                        <MemberListItem
                            key={m._id}
                            member={m}
                            isOnline={onlineUserIds?.includes(String(m.user?._id))}
                            onRemove={canModerate && m.role !== 'owner' ? () => handleRemoveMember(m.user._id) : undefined}
                            busy={busyUserId === m.user?._id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export { PLACEHOLDER_IMAGE };
