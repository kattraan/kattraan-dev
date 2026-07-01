import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, MoreVertical, Users, Pencil, LogOut } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

const STATUS_CONFIG = {
    owner: { label: 'Owner', variant: 'primary' },
    admin: { label: 'Admin', variant: 'primary' },
    approved: { label: 'Member', variant: 'success' },
    pending: { label: 'Pending Approval', variant: 'warning' },
    rejected: { label: 'Request Rejected', variant: 'error' },
    removed: { label: 'Removed', variant: 'error' },
    none: { label: 'Not Joined', variant: 'ghost' },
};

/**
 * A single course community shown as a long horizontal "tube" row in the hub list.
 * @param {{
 *   community: object,
 *   onOpen: (community: object) => void,
 *   onJoin: (community: object) => void,
 *   onViewMembers: (community: object) => void,
 *   onEdit: (community: object) => void,
 *   onLeave: (community: object) => void,
 *   joining?: boolean,
 * }} props
 */
const CommunityCard = ({ community, onOpen, onJoin, onViewMembers, onEdit, onLeave, joining = false }) => {
    const status = STATUS_CONFIG[community.membershipStatus] || STATUS_CONFIG.none;
    const isMember = ['owner', 'admin', 'approved'].includes(community.membershipStatus);
    const isOwnerOrAdmin = ['owner', 'admin'].includes(community.membershipStatus);

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

    const closeAnd = (fn) => () => {
        setMenuOpen(false);
        fn(community);
    };

    return (
        <div className="w-full flex items-center gap-4 px-5 py-4 rounded-full bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none hover:shadow-lg hover:border-primary-pink/30 dark:hover:border-primary-pink/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-pink to-primary-purple flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{community.name}</h3>
                    <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/40 truncate">{community.course?.title}</p>
            </div>

            {isMember ? (
                <Button size="sm" variant="secondary" onClick={() => onOpen(community)}>
                    Open Chat
                </Button>
            ) : community.membershipStatus === 'pending' ? (
                <Button size="sm" variant="ghost" disabled>
                    Pending
                </Button>
            ) : (
                <Button size="sm" variant="primary" isLoading={joining} onClick={() => onJoin(community)}>
                    Request to Join
                </Button>
            )}

            {isMember && (
                <div className="relative flex-shrink-0" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="p-2 rounded-full text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors"
                        aria-label="Community options"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[#1a1625]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                            <button
                                onClick={closeAnd(onViewMembers)}
                                className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/90 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center gap-3 text-sm font-medium transition-colors"
                            >
                                <Users size={16} /> View Members
                            </button>
                            {isOwnerOrAdmin && (
                                <button
                                    onClick={closeAnd(onEdit)}
                                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/90 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center gap-3 text-sm font-medium transition-colors"
                                >
                                    <Pencil size={16} /> Edit Community
                                </button>
                            )}
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
    );
};

export default CommunityCard;
