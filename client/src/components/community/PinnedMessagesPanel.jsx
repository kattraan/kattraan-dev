import React, { useState } from 'react';
import { Pin, ChevronDown, ChevronUp, PinOff } from 'lucide-react';

/**
 * Collapsible strip listing pinned messages, shown above the message list.
 * @param {{ messages: Array<object>, canModerate: boolean, onUnpin: (messageId: string) => void }} props
 */
const PinnedMessagesPanel = ({ messages, canModerate, onUnpin }) => {
    const [open, setOpen] = useState(false);

    if (!messages || messages.length === 0) return null;

    return (
        <div className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-white/60"
            >
                <span className="flex items-center gap-2">
                    <Pin size={14} /> {messages.length} pinned message{messages.length > 1 ? 's' : ''}
                </span>
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {open && (
                <div className="px-5 pb-3 space-y-2 max-h-40 overflow-y-auto">
                    {messages.map((m) => (
                        <div
                            key={m._id}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs"
                        >
                            <span className="truncate text-gray-700 dark:text-white/80">
                                <span className="font-semibold">{m.sender?.userName}:</span> {m.body}
                            </span>
                            {canModerate && (
                                <button
                                    onClick={() => onUnpin(m._id)}
                                    className="text-gray-400 dark:text-white/30 hover:text-red-500 flex-shrink-0"
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
