import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '@/components/ui';
import { fetchMembers } from '@/features/community/store/communitySlice';
import MemberListItem from '@/components/community/MemberListItem';

/**
 * Read-only member list, viewable by any approved member (not just owner/admin).
 * `onlineUserIds` is only meaningful when opened from a page with a live socket
 * connection (the chat room) — omit it elsewhere and the dot is simply hidden.
 * @param {{ isOpen: boolean, onClose: () => void, communityId: string | null, onlineUserIds?: string[] }} props
 */
const ViewMembersModal = ({ isOpen, onClose, communityId, onlineUserIds }) => {
    const dispatch = useDispatch();
    const members = useSelector((state) => state.community.members);

    useEffect(() => {
        if (isOpen && communityId) {
            dispatch(fetchMembers(communityId));
        }
    }, [isOpen, communityId, dispatch]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Members">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {members.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-white/40 text-center py-6">No members yet.</p>
                ) : (
                    members.map((m) => (
                        <MemberListItem
                            key={m._id}
                            member={m}
                            isOnline={onlineUserIds ? onlineUserIds.includes(String(m.user?._id)) : undefined}
                        />
                    ))
                )}
            </div>
        </Modal>
    );
};

export default ViewMembersModal;
