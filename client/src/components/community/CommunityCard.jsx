import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, MoreVertical, Users, Pencil, LogOut, Sparkles } from 'lucide-react';
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
 * A single course community shown as a vertical card in the hub grid.
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
        <div className="group relative w-full rounded-2xl bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-visible flex flex-col">
            {/* Top decorative banner */}
            <div className="h-20 w-full rounded-t-2xl bg-gradient-to-r from-primary-pink/80 to-primary-purple/80 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={16} className="text-white" />
                </div>
            </div>
            
            {/* Avatar / Icon overlapping banner */}
            <div className="px-5 relative flex justify-between items-start -mt-8 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#251f35] p-1 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg relative z-10 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-pink to-primary-purple flex items-center justify-center">
                        <MessageCircle size={24} className="text-white" />
                    </div>
                </div>
                <div className="mt-10">
                    <Badge variant={status.variant} className="shadow-sm font-medium">{status.label}</Badge>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 flex-1 flex flex-col relative z-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-primary-pink transition-colors">
                    {community.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-white/50 line-clamp-2 mb-6 flex-1">
                    {community.course?.title || 'General Discussion'}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                    {isMember ? (
                        <Button className="flex-1 font-semibold" variant="secondary" onClick={() => onOpen(community)}>
                            Open Chat
                        </Button>
                    ) : community.membershipStatus === 'pending' ? (
                        <Button className="flex-1 font-semibold opacity-70 cursor-not-allowed" variant="ghost">
                            Pending
                        </Button>
                    ) : (
                        <Button className="flex-1 font-semibold" variant="primary" isLoading={joining} onClick={() => onJoin(community)}>
                            Request to Join
                        </Button>
                    )}

                    {isMember && (
                        <div className="relative flex-shrink-0" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="p-2 rounded-xl text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                                aria-label="Community options"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {menuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-52 bg-white dark:bg-[#1a1625]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden z-[100] shadow-2xl">
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
            </div>
        </div>
    );
};

export default CommunityCard;
