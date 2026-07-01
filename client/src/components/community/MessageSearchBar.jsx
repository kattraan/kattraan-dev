import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import { searchMessages, clearSearchResults } from '@/features/community/store/communitySlice';

/**
 * Inline search panel for a community's message history.
 * @param {{ communityId: string, onClose: () => void }} props
 */
const MessageSearchBar = ({ communityId, onClose }) => {
    const dispatch = useDispatch();
    const { searchResults, searchLoading } = useSelector((state) => state.community);
    const [query, setQuery] = useState('');

    const runSearch = () => {
        if (!query.trim()) return;
        dispatch(searchMessages({ id: communityId, q: query.trim() }));
    };

    const handleClose = () => {
        dispatch(clearSearchResults());
        onClose();
    };

    return (
        <div className="border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0c091a] p-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                        placeholder="Search messages…"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50"
                    />
                </div>
                <button onClick={handleClose} className="text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {searchLoading ? (
                <p className="text-xs text-gray-400 dark:text-white/30 mt-3">Searching…</p>
            ) : searchResults.length > 0 ? (
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                    {searchResults.map((m) => (
                        <div key={m._id} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 text-xs">
                            <span className="font-semibold text-gray-700 dark:text-white/80">{m.sender?.userName}</span>
                            <span className="text-gray-400 dark:text-white/30 ml-2">
                                {new Date(m.createdAt).toLocaleString()}
                            </span>
                            <p className="text-gray-600 dark:text-white/60 mt-0.5">{m.body}</p>
                        </div>
                    ))}
                </div>
            ) : query.trim() ? (
                <p className="text-xs text-gray-400 dark:text-white/30 mt-3">No messages found.</p>
            ) : null}
        </div>
    );
};

export default MessageSearchBar;
