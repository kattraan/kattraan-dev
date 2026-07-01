import React from 'react';
import { AtSign } from 'lucide-react';

/**
 * Trigger-at-end-of-input mention suggestions list, positioned above the composer.
 * @param {{ query: string, members: Array<{user: {_id: string, userName: string}}>, canMentionEveryone: boolean, onSelect: (userName: string) => void }} props
 */
const MentionAutocomplete = ({ query, members, canMentionEveryone, onSelect }) => {
    const lower = query.toLowerCase();
    const memberMatches = members
        .map((m) => m.user)
        .filter((u) => u && u.userName.toLowerCase().includes(lower))
        .slice(0, 5);

    const showEveryone = canMentionEveryone && 'everyone'.includes(lower);

    if (memberMatches.length === 0 && !showEveryone) return null;

    return (
        <div className="absolute bottom-full left-4 mb-2 w-56 bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
            {showEveryone && (
                <button
                    type="button"
                    onClick={() => onSelect('everyone')}
                    className="w-full text-left px-4 py-2.5 text-orange-600 dark:text-orange-300 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center gap-2 text-sm font-semibold"
                >
                    <AtSign size={14} /> everyone
                </button>
            )}
            {memberMatches.map((u) => (
                <button
                    type="button"
                    key={u._id}
                    onClick={() => onSelect(u.userName)}
                    className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-white/90 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                >
                    <AtSign size={14} className="text-gray-400 dark:text-white/30" /> {u.userName}
                </button>
            ))}
        </div>
    );
};

export default MentionAutocomplete;
