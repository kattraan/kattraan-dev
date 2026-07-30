import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { searchMessages, clearSearchResults } from '@/features/community/store/communitySlice';

/**
 * Inline search — runs only on Enter; up/down navigates matches like WhatsApp.
 */
const MessageSearchBar = ({ communityId, onJumpToMessage, compact = false }) => {
    const dispatch = useDispatch();
    const { searchResults, searchLoading } = useSelector((state) => state.community);
    const [query, setQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const sortedResults = useMemo(
        () =>
            [...searchResults].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ),
        [searchResults]
    );

    useEffect(() => {
        dispatch(clearSearchResults());
        setHasSearched(false);
        setActiveIndex(0);
    }, [query, dispatch]);

    useEffect(() => {
        return () => dispatch(clearSearchResults());
    }, [dispatch]);

    const jumpTo = (index) => {
        const message = sortedResults[index];
        if (message) onJumpToMessage?.(message._id);
    };

    const runSearch = () => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setHasSearched(true);
        setActiveIndex(0);
        dispatch(searchMessages({ id: communityId, q: trimmed }));
    };

    useEffect(() => {
        if (hasSearched && sortedResults.length > 0 && !searchLoading) {
            jumpTo(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedResults, hasSearched, searchLoading]);

    const goUp = () => {
        if (sortedResults.length === 0) return;
        const next = activeIndex <= 0 ? sortedResults.length - 1 : activeIndex - 1;
        setActiveIndex(next);
        jumpTo(next);
    };

    const goDown = () => {
        if (sortedResults.length === 0) return;
        const next = activeIndex >= sortedResults.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(next);
        jumpTo(next);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (hasSearched && sortedResults.length > 0) {
                goDown();
            } else {
                runSearch();
            }
        }
    };

    const activeMessage = sortedResults[activeIndex];

    return (
        <div className={compact ? 'p-3 sm:px-4' : 'p-4 sm:p-6 flex-1 flex flex-col min-h-0'}>
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/35" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search messages…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-primary-purple/30"
                    />
                </div>
                {hasSearched && sortedResults.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-500 dark:text-white/40 tabular-nums min-w-[3rem] text-center">
                            {activeIndex + 1}/{sortedResults.length}
                        </span>
                        <button
                            type="button"
                            onClick={goUp}
                            className="p-2 rounded-lg text-gray-500 dark:text-white/45 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            aria-label="Previous match"
                        >
                            <ChevronUp size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={goDown}
                            className="p-2 rounded-lg text-gray-500 dark:text-white/45 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            aria-label="Next match"
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>
                )}
            </div>

            {searchLoading ? (
                <p className="text-xs text-gray-500 dark:text-white/40 mt-3">Searching…</p>
            ) : hasSearched && sortedResults.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-white/40 mt-3">No messages found.</p>
            ) : !hasSearched && !compact ? (
                <p className="text-xs text-gray-500 dark:text-white/40 mt-4">Type a keyword and press Enter to search.</p>
            ) : !hasSearched && compact ? null : activeMessage && !compact ? (
                <div className="mt-4 flex-1 overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => jumpTo(activeIndex)}
                        className="w-full text-left px-3 py-2.5 rounded-xl bg-white dark:bg-[#1a1625] border border-primary-purple/30 dark:border-primary-pink/30 text-xs ring-1 ring-primary-purple/10"
                    >
                        <span className="font-semibold text-gray-900 dark:text-white/85">{activeMessage.sender?.userName}</span>
                        <span className="text-gray-500 dark:text-white/40 ml-2">
                            {new Date(activeMessage.createdAt).toLocaleString()}
                        </span>
                        <p className="text-gray-600 dark:text-white/55 mt-0.5">{activeMessage.body}</p>
                    </button>
                    <p className="text-[11px] text-gray-400 dark:text-white/35 mt-3 text-center">
                        Use ↑ ↓ to jump between matches in the chat
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default MessageSearchBar;
