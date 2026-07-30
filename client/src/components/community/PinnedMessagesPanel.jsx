import React, { useState } from 'react';
import { Pin, ChevronDown, ChevronUp, PinOff } from 'lucide-react';

/**
 * WhatsApp-style pinned strip — shows latest pin; tap to jump, expand for all.
 */
const PinnedMessagesPanel = ({ messages, canModerate, onUnpin, onJumpToMessage }) => {
    const [expanded, setExpanded] = useState(false);

    if (!messages || messages.length === 0) return null;

    const primary = messages[0];

    const handlePrimaryClick = () => {
        onJumpToMessage?.(primary._id);
    };

    return (
        <div className="border-b border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-[#1a1625]/90 backdrop-blur-sm flex-shrink-0 z-10 transition-colors duration-300">
            <div className="flex items-stretch">
                <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className="flex-1 flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors min-w-0"
                >
                    <Pin size={16} className="text-primary-purple dark:text-primary-pink shrink-0 rotate-45" />
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-primary-purple dark:text-primary-pink uppercase tracking-wide">
                            {messages.length === 1 ? 'Pinned message' : `${messages.length} pinned messages`}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-white/75 truncate mt-0.5">
                            <span className="font-semibold">{primary.sender?.userName}:</span> {primary.body}
                        </p>
                    </div>
                </button>
                {messages.length > 1 && (
                    <button
                        type="button"
                        onClick={() => setExpanded((o) => !o)}
                        className="px-3 text-gray-500 dark:text-white/45 hover:bg-gray-50 dark:hover:bg-white/[0.03] border-l border-gray-200/80 dark:border-white/10 transition-colors"
                        aria-label={expanded ? 'Collapse pinned messages' : 'Expand pinned messages'}
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>

            {expanded && messages.length > 1 && (
                <div className="px-4 pb-3 space-y-2 max-h-40 overflow-y-auto border-t border-gray-200/60 dark:border-white/10">
                    {messages.map((m) => (
                        <div
                            key={m._id}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 text-xs"
                        >
                            <button
                                type="button"
                                onClick={() => onJumpToMessage?.(m._id)}
                                className="truncate text-left text-gray-900 dark:text-white/85 hover:text-primary-purple dark:hover:text-primary-pink transition-colors flex-1 min-w-0"
                            >
                                <span className="font-semibold">{m.sender?.userName}:</span> {m.body}
                            </button>
                            {canModerate && (
                                <button
                                    type="button"
                                    onClick={() => onUnpin(m._id)}
                                    className="text-gray-500 dark:text-white/45 hover:text-red-500 flex-shrink-0 transition-colors"
                                    aria-label="Unpin"
                                >
                                    <PinOff size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PinnedMessagesPanel;
