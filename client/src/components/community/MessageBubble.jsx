import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Reply, SmilePlus, Pencil, Trash2, Pin, PinOff, FileText, CheckCheck } from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const renderBodyWithMentions = (body) => {
    const parts = body.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
        if (!part.startsWith('@')) return part;
        return (
            <span key={i} className="font-semibold text-primary-purple dark:text-primary-pink">
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

const MessageMeta = ({ time, edited, isOwn }) => (
    <span className="inline-flex items-center gap-0.5 float-right ml-3 mt-0.5 shrink-0 select-none leading-none">
        {edited && <span className="text-[10px] text-gray-500 dark:text-white/40">edited</span>}
        <span className="text-[10px] text-gray-500 dark:text-white/40 tabular-nums">{time}</span>
        {isOwn && <CheckCheck size={13} className="text-primary-purple dark:text-primary-pink opacity-90" strokeWidth={2} />}
    </span>
);

/**
 * Kattraan-branded message bubble with inline timestamp (no overlap).
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
        <div className={clsx('group flex w-fit max-w-[82%] sm:max-w-[68%] mb-1', isOwn ? 'ml-auto' : 'mr-auto')}>
            <div className={clsx('flex items-end gap-1 max-w-full', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                <div className="flex flex-col gap-0.5 max-w-full min-w-[72px]">
                    {!isOwn && (
                        <span className="text-[12px] font-semibold text-primary-pink px-1 mb-0.5">
                            {senderName}
                        </span>
                    )}

                    <div
                        className={clsx(
                            'px-2.5 pt-1.5 pb-1.5 text-[14px] leading-[19px] shadow-sm',
                            isOwn
                                ? 'bg-primary-pink/10 dark:bg-[#2a1f3d] text-gray-900 dark:text-white/90 rounded-2xl rounded-tr-sm border border-primary-pink/15 dark:border-primary-purple/20'
                                : 'bg-white dark:bg-[#1a1625]/95 text-gray-900 dark:text-white/90 rounded-2xl rounded-tl-sm border border-gray-200/80 dark:border-white/10'
                        )}
                    >
                        {message.replyTo && (
                            <div className="mb-1.5 px-2 py-1 rounded-lg text-xs border-l-[3px] bg-gray-50 dark:bg-white/5 border-primary-purple dark:border-primary-pink">
                                <span className="font-semibold text-primary-purple dark:text-primary-pink block text-[11px]">
                                    {message.replyTo.senderName}
                                </span>
                                <span className="text-gray-500 dark:text-white/45 line-clamp-2">{message.replyTo.body}</span>
                            </div>
                        )}

                        {message.body && (
                            <p className="whitespace-pre-wrap break-words">
                                {renderBodyWithMentions(message.body)}
                                <MessageMeta time={time} edited={message.editedAt} isOwn={isOwn} />
                            </p>
                        )}

                        {message.attachments?.length > 0 && (
                            <div className={clsx('flex flex-col gap-1.5', message.body ? 'mt-1' : '')}>
                                {message.attachments.map((att, i) =>
                                    att.mimeType?.startsWith('image/') ? (
                                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={att.url}
                                                alt={att.filename}
                                                className="max-w-[240px] max-h-[240px] rounded-lg object-cover"
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            key={i}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/5 dark:bg-black/20"
                                        >
                                            <FileText size={14} />
                                            <span className="text-xs truncate max-w-[140px]">{att.filename}</span>
                                            <span className="text-[10px] opacity-60">{formatBytes(att.size)}</span>
                                        </a>
                                    )
                                )}
                                {!message.body && (
                                    <div className="flex justify-end">
                                        <MessageMeta time={time} edited={message.editedAt} isOwn={isOwn} />
                                    </div>
                                )}
                            </div>
                        )}

                        {!message.body && !message.attachments?.length && (
                            <div className="flex justify-end">
                                <MessageMeta time={time} edited={message.editedAt} isOwn={isOwn} />
                            </div>
                        )}
                    </div>

                    {message.reactions?.length > 0 && (
                        <div className={clsx('flex flex-wrap gap-1 px-1 -mt-1', isOwn ? 'justify-end' : 'justify-start')}>
                            {message.reactions.map((r) => {
                                const reacted = r.users.some((u) => String(u) === String(currentUserId));
                                return (
                                    <button
                                        key={r.emoji}
                                        type="button"
                                        onClick={() => onReact(r.emoji)}
                                        className={clsx(
                                            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-white dark:bg-[#1a1625] border shadow-sm transition-colors',
                                            reacted ? 'border-primary-purple dark:border-primary-pink' : 'border-gray-200 dark:border-white/10'
                                        )}
                                    >
                                        <span>{r.emoji}</span>
                                        <span className="text-gray-500 dark:text-white/45">{r.users.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl p-0.5 flex-shrink-0 shadow-md mb-1">
                    <button
                        type="button"
                        onClick={() => setPickerOpen((o) => !o)}
                        className="p-1 rounded-lg text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5"
                        aria-label="Add reaction"
                    >
                        <SmilePlus size={14} />
                    </button>
                    <button type="button" onClick={onReply} className="p-1 rounded-lg text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Reply">
                        <Reply size={14} />
                    </button>
                    {isOwn && (
                        <button type="button" onClick={onEdit} className="p-1 rounded-lg text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Edit">
                            <Pencil size={14} />
                        </button>
                    )}
                    {canModerate && (
                        <button type="button" onClick={onTogglePin} className="p-1 rounded-lg text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5" aria-label={message.isPinned ? 'Unpin' : 'Pin'}>
                            {message.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                    )}
                    {(isOwn || canModerate) && (
                        <button type="button" onClick={onDelete} className="p-1 rounded-lg text-gray-500 dark:text-white/50 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500" aria-label="Delete">
                            <Trash2 size={14} />
                        </button>
                    )}

                    {pickerOpen && (
                        <div ref={pickerRef} className="absolute bottom-full mb-1 right-0 flex items-center gap-1 bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 shadow-xl z-50">
                            {QUICK_REACTIONS.map((emoji) => (
                                <button key={emoji} type="button" onClick={() => react(emoji)} className="text-base hover:scale-125 transition-transform">
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
