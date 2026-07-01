import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import { uploadAttachment } from '@/features/community/store/communitySlice';
import MentionAutocomplete from '@/components/community/MentionAutocomplete';

/**
 * @param {{
 *   onSend: (body: string, attachment: object | null) => void,
 *   onTyping?: () => void,
 *   disabled?: boolean,
 *   replyingTo?: { senderName: string, body: string } | null,
 *   onCancelReply?: () => void,
 *   editingMessage?: { _id: string, body: string } | null,
 *   onCancelEdit?: () => void,
 *   onEditSave?: (messageId: string, body: string) => void,
 *   members?: Array<{ user: { _id: string, userName: string } }>,
 *   canMentionEveryone?: boolean,
 *   communityId: string,
 * }} props
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
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        setValue(editingMessage?.body || '');
    }, [editingMessage]);

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

    return (
        <div className="border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#0c091a]">
            {replyingTo && !editingMessage && (
                <div className="flex items-center justify-between px-4 pt-3 text-xs">
                    <span className="text-gray-500 dark:text-white/40 truncate">
                        Replying to <span className="font-semibold">{replyingTo.senderName}</span>: {replyingTo.body}
                    </span>
                    <button onClick={onCancelReply} className="text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}

            {editingMessage && (
                <div className="flex items-center justify-between px-4 pt-3 text-xs">
                    <span className="text-primary-pink font-semibold">Editing message</span>
                    <button onClick={onCancelEdit} className="text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}

            {attachment && (
                <div className="flex items-center gap-2 px-4 pt-3">
                    <FileText size={14} className="text-gray-400 dark:text-white/40" />
                    <span className="text-xs text-gray-500 dark:text-white/40 truncate max-w-[200px]">{attachment.filename}</span>
                    <button onClick={() => setAttachment(null)} className="text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="relative flex items-end gap-3 p-4">
                {mentionQuery !== null && (
                    <MentionAutocomplete
                        query={mentionQuery}
                        members={members}
                        canMentionEveryone={canMentionEveryone}
                        onSelect={selectMention}
                    />
                )}

                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="flex-shrink-0 w-11 h-11 rounded-full text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white flex items-center justify-center disabled:opacity-40 transition-all"
                    aria-label="Attach file"
                >
                    <Paperclip size={18} />
                </button>

                <textarea
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? 'You cannot post in this community' : 'Type a message…'}
                    rows={1}
                    className="flex-1 resize-none rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 disabled:opacity-50 max-h-32"
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={disabled || (!value.trim() && !attachment)}
                    className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-r from-primary-pink to-primary-purple text-white flex items-center justify-center disabled:opacity-40 hover:brightness-110 transition-all"
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default MessageComposer;
