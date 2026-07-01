import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Reply, SmilePlus, Pencil, Trash2, Pin, PinOff, FileText } from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/** Wraps @token / @everyone substrings in a highlighted span — purely presentational, independent of the resolved mentions array. */
const renderBodyWithMentions = (body) => {
    const parts = body.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
        if (!part.startsWith('@')) return part;
        const isEveryone = part.toLowerCase() === '@everyone';
        return (
            <span
                key={i}
                className={clsx(
                    'font-semibold rounded px-1',
                    isEveryone
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300'
                        : 'bg-primary-pink/15 text-primary-pink'
                )}
            >
                {part}
            </span>
        );
    });
};

const formatBytes = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

/**
 * @param {{
 *   message: object, isOwn: boolean, currentUserId: string, canModerate: boolean,
 *   onReact: (emoji: string) => void, onReply: () => void, onEdit: () => void,
 *   onDelete: () => void, onTogglePin: () => void,
 * }} props
 */
const MessageBubble = ({ message, isOwn, currentUserId, canModerate, onReact, onReply, onEdit, onDelete, onTogglePin }) => {
    const senderName = message.sender?.userName || 'Member';
    const time = message.createdAt
        ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const react = (emoji) => {
        setPickerOpen(false);
        onReact(emoji);
    };

    return (
        <div className={clsx('group flex flex-col gap-1 max-w-[75%] w-fit', isOwn ? 'self-end items-end' : 'self-start items-start')}>
            {!isOwn && <span className="text-[11px] font-semibold text-gray-500 dark:text-white/40 px-1">{senderName}</span>}

            <div className={clsx('flex items-end gap-1.5', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                <div className="flex flex-col gap-1.5 max-w-full">
                    {message.replyTo && (
                        <div className="px-3 py-1.5 rounded-xl text-xs border-l-2 border-primary-pink/50 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40">
                            <span className="font-semibold">{message.replyTo.senderName}</span>{' '}
                            {message.replyTo.body}
                        </div>
                    )}

                    <div
                        className={clsx(
                            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                            isOwn
                                ? 'bg-gradient-to-r from-primary-pink to-primary-purple text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white/85 border border-gray-200 dark:border-white/5 rounded-bl-md'
                        )}
                    >
                        {message.body && <p>{renderBodyWithMentions(message.body)}</p>}
                        {message.editedAt && (
                            <span className="text-[10px] opacity-60 ml-1">(edited)</span>
                        )}

                        {message.attachments?.length > 0 && (
                            <div className="mt-2 flex flex-col gap-2">
                                {message.attachments.map((att, i) =>
                                    att.mimeType?.startsWith('image/') ? (
                                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={att.url}
                                                alt={att.filename}
                                                className="max-w-[240px] max-h-[240px] rounded-xl object-cover border border-white/10"
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            key={i}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/10 dark:bg-black/20 hover:bg-black/20 dark:hover:bg-black/30 transition-colors"
                                        >
                                            <FileText size={16} />
                                            <span className="text-xs truncate max-w-[160px]">{att.filename}</span>
                                            <span className="text-[10px] opacity-60">{formatBytes(att.size)}</span>
                                        </a>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {message.reactions?.length > 0 && (
                        <div className={clsx('flex flex-wrap gap-1', isOwn ? 'justify-end' : 'justify-start')}>
                            {message.reactions.map((r) => {
                                const reacted = r.users.some((u) => String(u) === String(currentUserId));
                                return (
                                    <button
                                        key={r.emoji}
                                        onClick={() => onReact(r.emoji)}
                                        className={clsx(
                                            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors',
                                            reacted
                                                ? 'bg-primary-pink/15 border-primary-pink/40 text-primary-pink'
                                                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60'
                                        )}
                                    >
                                        <span>{r.emoji}</span>
                                        <span>{r.users.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Hover toolbar */}
                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-full p-0.5 shadow-sm flex-shrink-0">
                    <button
                        onClick={() => setPickerOpen((o) => !o)}
                        className="p-1.5 rounded-full text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        aria-label="Add reaction"
                    >
                        <SmilePlus size={14} />
                    </button>
                    <button
                        onClick={onReply}
                        className="p-1.5 rounded-full text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        aria-label="Reply"
                    >
                        <Reply size={14} />
                    </button>
                    {isOwn && (
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-full text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                            aria-label="Edit"
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                    {canModerate && (
                        <button
                            onClick={onTogglePin}
                            className="p-1.5 rounded-full text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                            aria-label={message.isPinned ? 'Unpin' : 'Pin'}
                        >
                            {message.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                    )}
                    {(isOwn || canModerate) && (
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-full text-gray-500 dark:text-white/50 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}

                    {pickerOpen && (
                        <div
                            ref={pickerRef}
                            className="absolute bottom-full mb-2 right-0 flex items-center gap-1 bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-full px-2 py-1.5 shadow-xl z-50"
                        >
                            {QUICK_REACTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => react(emoji)}
                                    className="text-base hover:scale-125 transition-transform"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <span className="text-[10px] text-gray-400 dark:text-white/25 px-1">{time}</span>
        </div>
    );
};

export default MessageBubble;
