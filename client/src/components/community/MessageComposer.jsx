import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Send, Paperclip, X, FileText, Smile } from 'lucide-react';
import { clsx } from 'clsx';
import { uploadAttachment } from '@/features/community/store/communitySlice';
import MentionAutocomplete from '@/components/community/MentionAutocomplete';

const COMPOSER_EMOJIS = [
    '😀', '😂', '😍', '🥰', '😊', '😉', '😢', '😮',
    '👍', '👏', '🙏', '❤️', '🔥', '🎉', '💯', '✨',
    '🤔', '😎', '🥳', '😅', '💪', '👋', '🙌', '⭐',
];

/**
 * Kattraan-branded message composer footer.
 */
const MessageComposer = ({
    onSend,
    onTyping,
    disabled = false,
    replyingTo = null,
    onCancelReply,
    editingMessage = null,
    onCancelEdit,
    onEditSave,
    members = [],
    canMentionEveryone = false,
    communityId,
}) => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(editingMessage?.body || '');
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const textareaRef = useRef(null);

    React.useEffect(() => {
        setValue(editingMessage?.body || '');
    }, [editingMessage]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setEmojiOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const next = e.target.value;
        setValue(next);
        onTyping?.();
        const match = next.match(/@([a-zA-Z0-9_]*)$/);
        setMentionQuery(match ? match[1] : null);
    };

    const selectMention = (userName) => {
        const cleanName = userName === 'everyone' ? 'everyone' : userName.replace(/\s+/g, '');
        setValue((prev) => prev.replace(/@([a-zA-Z0-9_]*)$/, `@${cleanName} `));
        setMentionQuery(null);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        const result = await dispatch(uploadAttachment({ id: communityId, file }));
        setUploading(false);
        if (uploadAttachment.fulfilled.match(result)) {
            setAttachment(result.payload);
        }
    };

    const submit = () => {
        const trimmed = value.trim();
        if ((!trimmed && !attachment) || disabled) return;
        if (editingMessage) {
            onEditSave(editingMessage._id, trimmed);
        } else {
            onSend(trimmed, attachment);
        }
        setValue('');
        setAttachment(null);
        setMentionQuery(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
        if (e.key === 'Escape') {
            if (editingMessage) onCancelEdit?.();
            if (replyingTo) onCancelReply?.();
        }
    };

    const insertEmoji = (emoji) => {
        setValue((prev) => `${prev}${emoji}`);
        setEmojiOpen(false);
        onTyping?.();
        textareaRef.current?.focus();
    };

    const canSend = !disabled && (value.trim() || attachment);

    return (
        <div className="bg-gray-50 dark:bg-[#0c091a] border-t border-gray-200/80 dark:border-white/10 transition-colors duration-300">
            {replyingTo && !editingMessage && (
                <div className="flex items-center justify-between px-4 py-2 text-xs border-b border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#1a1625]/60">
                    <span className="text-gray-500 dark:text-white/45 truncate border-l-[3px] border-primary-purple dark:border-primary-pink pl-2">
                        <span className="font-semibold text-primary-purple dark:text-primary-pink block">{replyingTo.senderName}</span>
                        {replyingTo.body}
                    </span>
                    <button type="button" onClick={onCancelReply} className="text-gray-500 dark:text-white/45 hover:text-gray-900 dark:hover:text-white ml-2">
                        <X size={16} />
                    </button>
                </div>
            )}

            {editingMessage && (
                <div className="flex items-center justify-between px-4 py-2 text-xs border-b border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#1a1625]/60">
                    <span className="text-primary-purple dark:text-primary-pink font-semibold">Editing message</span>
                    <button type="button" onClick={onCancelEdit} className="text-gray-500 dark:text-white/45">
                        <X size={16} />
                    </button>
                </div>
            )}

            {attachment && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200/80 dark:border-white/10">
                    <FileText size={14} className="text-gray-500 dark:text-white/45" />
                    <span className="text-xs text-gray-500 dark:text-white/45 truncate max-w-[200px]">{attachment.filename}</span>
                    <button type="button" onClick={() => setAttachment(null)} className="text-gray-500 dark:text-white/45">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="relative flex items-end gap-2 px-3 py-2 sm:px-4 sm:py-3">
                {mentionQuery !== null && (
                    <MentionAutocomplete
                        query={mentionQuery}
                        members={members}
                        canMentionEveryone={canMentionEveryone}
                        onSelect={selectMention}
                    />
                )}

                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

                <div className="relative flex-shrink-0" ref={emojiRef}>
                    <button
                        type="button"
                        onClick={() => setEmojiOpen((o) => !o)}
                        disabled={disabled}
                        className={clsx(
                            'p-2 rounded-lg transition-colors flex-shrink-0 disabled:opacity-40',
                            emojiOpen
                                ? 'text-primary-purple dark:text-primary-pink bg-primary-pink/10 dark:bg-primary-purple/10'
                                : 'text-gray-500 dark:text-white/45 hover:text-gray-800 dark:hover:text-white'
                        )}
                        aria-label="Emoji"
                        aria-expanded={emojiOpen}
                    >
                        <Smile size={22} />
                    </button>

                    {emojiOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-[280px] sm:w-[300px] p-3 rounded-xl bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 shadow-xl z-50 grid grid-cols-8 gap-1">
                            {COMPOSER_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => insertEmoji(emoji)}
                                    className="text-xl leading-none p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="p-2 text-gray-500 dark:text-white/45 hover:text-gray-800 dark:hover:text-white flex-shrink-0 disabled:opacity-40"
                    aria-label="Attach file"
                >
                    <Paperclip size={22} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? 'You cannot post in this community' : 'Type a message'}
                    rows={1}
                    className="flex-1 resize-none rounded-xl bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 px-4 py-2.5 text-[15px] text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-primary-purple/30 disabled:opacity-50 max-h-28"
                />

                <button
                    type="button"
                    onClick={submit}
                    disabled={!canSend}
                    className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        canSend
                            ? 'bg-primary-pink hover:bg-primary-pink/90 text-white shadow-md'
                            : 'bg-gray-300 dark:bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default MessageComposer;
