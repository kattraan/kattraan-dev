import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Users, LogOut, Camera } from 'lucide-react';
import { getCommunityAvatar } from '@/components/community/CommunityChatPanels';
import { Button } from '@/components/ui';

function formatChatTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const sameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    if (sameDay) {
        return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate();

    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildPreview(community, isMember) {
    if (!isMember) {
        if (community.membershipStatus === 'pending') return 'Join request pending';
        if (community.membershipStatus === 'rejected') return 'Request was declined';
        return community.course?.title || 'Request to join this community';
    }

    const last = community.lastMessage;
    if (!last) return 'No messages yet — say hello!';

    const prefix = last.senderName ? `${last.senderName}: ` : '';
    if (last.hasAttachment && !last.body?.trim()) {
        return (
            <>
                {prefix}
                <span className="inline-flex items-center gap-1">
                    <Camera size={12} className="inline" /> Photo
                </span>
            </>
        );
    }
    return `${prefix}${last.body || ''}`.trim();
}

/**
 * Chat row for a single course community.
 */
const CommunityCard = ({ community, onOpen, onJoin, onViewMembers, onLeave, joining = false }) => {
    const isMember = ['owner', 'admin', 'approved'].includes(community.membershipStatus);
    const courseThumbnail = getCommunityAvatar(community);
    const courseTitle = community.course?.title || community.name || 'Community';
    const preview = buildPreview(community, isMember);
    const timeLabel = formatChatTime(community.lastMessage?.createdAt);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeAnd = (fn) => (event) => {
        event?.stopPropagation?.();
        setMenuOpen(false);
        fn(community);
    };

    const handleRowClick = () => {
        if (isMember) onOpen(community);
    };

    return (
        <div
            role={isMember ? 'button' : undefined}
            tabIndex={isMember ? 0 : undefined}
            onClick={handleRowClick}
            onKeyDown={(e) => {
                if (isMember && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onOpen(community);
                }
            }}
            className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-2xl transition-colors duration-200 ${
                isMember ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.06]' : ''
            }`}
        >
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10">
                <img src={courseThumbnail} alt={courseTitle} className="w-full h-full object-cover" loading="lazy" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-[15px] sm:text-base font-semibold text-gray-900 dark:text-white truncate min-w-0">
                        {community.name}
                    </h3>
                    {timeLabel && (
                        <span className="shrink-0 text-[11px] sm:text-xs text-gray-400 dark:text-white/40">
                            {timeLabel}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-500 dark:text-white/45 truncate min-w-0">{preview}</p>

                    <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!isMember && community.membershipStatus !== 'pending' && (
                            <Button
                                variant="primary"
                                isLoading={joining}
                                onClick={() => onJoin(community)}
                                className="text-xs px-3 py-1.5 h-auto font-semibold"
                            >
                                Join
                            </Button>
                        )}

                        {isMember && (
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen((open) => !open)}
                                    className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Community options"
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-[#1a1625]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden z-[100] shadow-2xl">
                                        <button
                                            onClick={closeAnd(onViewMembers)}
                                            className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/90 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center gap-3 text-sm font-medium transition-colors"
                                        >
                                            <Users size={16} /> View Members
                                        </button>
                                        {community.membershipStatus !== 'owner' && (
                                            <button
                                                onClick={closeAnd(onLeave)}
                                                className="w-full text-left px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-3 text-sm font-medium transition-colors"
                                            >
                                                <LogOut size={16} /> Leave Group
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;
