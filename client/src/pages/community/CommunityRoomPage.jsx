import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Search, Circle, Users } from 'lucide-react';
import {
    fetchCommunity,
    fetchMessages,
    fetchMembers,
    fetchPinnedMessages,
    clearCurrentCommunity,
    messageReceived,
    messageDeleted,
    messageEdited,
    reactionUpdated,
    messagePinned,
    messageUnpinned,
    presenceUpdated,
    userTyping,
    clearTyping,
} from '@/features/community/store/communitySlice';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import MessageBubble from '@/components/community/MessageBubble';
import MessageComposer from '@/components/community/MessageComposer';
import PinnedMessagesPanel from '@/components/community/PinnedMessagesPanel';
import MessageSearchBar from '@/components/community/MessageSearchBar';
import ViewMembersModal from '@/components/community/ViewMembersModal';
import { Button, useConfirmDialog } from '@/components/ui';

const CAN_CHAT = ['owner', 'admin', 'approved'];
const CAN_MODERATE = ['owner', 'admin'];

const CommunityRoomPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { confirm } = useConfirmDialog();
    const { currentCommunity, messages, typingUsers, members, pinnedMessages, onlineUserIds } = useSelector(
        (state) => state.community
    );
    const currentUserId = useSelector((state) => state.auth.user?._id);
    const messagesEndRef = useRef(null);

    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);

    const canModerate = CAN_MODERATE.includes(currentCommunity?.membershipStatus);
    const canChat = CAN_CHAT.includes(currentCommunity?.membershipStatus);

    useEffect(() => {
        dispatch(fetchCommunity(id));
        dispatch(fetchMessages({ id }));

        return () => {
            dispatch(clearCurrentCommunity());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (!canChat) return;
        dispatch(fetchMembers(id));
        dispatch(fetchPinnedMessages(id));
    }, [canChat, id, dispatch]);

    useEffect(() => {
        if (!canChat) return;

        const socket = connectSocket();
        socket.emit('join-community', { communityId: id });

        const onNewMessage = (message) => dispatch(messageReceived(message));
        const onMessageDeleted = (payload) => dispatch(messageDeleted(payload));
        const onMessageEdited = (payload) => dispatch(messageEdited(payload));
        const onReactionUpdated = (payload) => dispatch(reactionUpdated(payload));
        const onMessagePinned = (payload) => {
            dispatch(messagePinned(payload));
            dispatch(fetchPinnedMessages(id));
        };
        const onMessageUnpinned = (payload) => dispatch(messageUnpinned(payload));
        const onPresenceUpdate = (payload) => dispatch(presenceUpdated(payload));
        const onUserTyping = (payload) => {
            dispatch(userTyping(payload));
            setTimeout(() => dispatch(clearTyping()), 2000);
        };

        socket.on('new-message', onNewMessage);
        socket.on('message-deleted', onMessageDeleted);
        socket.on('message-edited', onMessageEdited);
        socket.on('reaction-updated', onReactionUpdated);
        socket.on('message-pinned', onMessagePinned);
        socket.on('message-unpinned', onMessageUnpinned);
        socket.on('presence-update', onPresenceUpdate);
        socket.on('user-typing', onUserTyping);

        return () => {
            socket.emit('leave-community', { communityId: id });
            socket.off('new-message', onNewMessage);
            socket.off('message-deleted', onMessageDeleted);
            socket.off('message-edited', onMessageEdited);
            socket.off('reaction-updated', onReactionUpdated);
            socket.off('message-pinned', onMessagePinned);
            socket.off('message-unpinned', onMessageUnpinned);
            socket.off('presence-update', onPresenceUpdate);
            socket.off('user-typing', onUserTyping);
            disconnectSocket();
        };
    }, [canChat, id, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = (body, attachment) => {
        getSocket().emit('send-message', {
            communityId: id,
            body,
            replyTo: replyingTo?._id,
            attachments: attachment ? [attachment] : [],
        });
        setReplyingTo(null);
    };

    const handleEditSave = (messageId, body) => {
        getSocket().emit('edit-message', { communityId: id, messageId, body });
        setEditingMessage(null);
    };

    const handleReply = (message) => {
        setEditingMessage(null);
        setReplyingTo({ _id: message._id, senderName: message.sender?.userName || 'Member', body: message.body.slice(0, 80) });
    };

    const handleEdit = (message) => {
        setReplyingTo(null);
        setEditingMessage({ _id: message._id, body: message.body });
    };

    const handleDelete = async (message) => {
        const ok = await confirm({ title: 'Delete this message?', message: 'This cannot be undone.', confirmText: 'Delete' });
        if (!ok) return;
        getSocket().emit('delete-message', { communityId: id, messageId: message._id });
    };

    const handleReact = (messageId, emoji) => {
        getSocket().emit('toggle-reaction', { communityId: id, messageId, emoji });
    };

    const handleTogglePin = (message) => {
        const event = message.isPinned ? 'unpin-message' : 'pin-message';
        getSocket().emit(event, { communityId: id, messageId: message._id });
    };

    const handleUnpin = (messageId) => {
        getSocket().emit('unpin-message', { communityId: id, messageId });
    };

    if (!currentCommunity) {
        return <div className="text-gray-500 dark:text-white/40 font-satoshi">Loading community…</div>;
    }

    return (
        <div className="max-w-3xl flex flex-col font-satoshi">
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-gray-900 dark:text-white">{currentCommunity.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-white/40 flex items-center gap-2">
                        {currentCommunity.course?.title}
                        {canChat && onlineUserIds.length > 0 && (
                            <span className="flex items-center gap-1 text-green-500">
                                <Circle size={6} className="fill-current" /> {onlineUserIds.length} online
                            </span>
                        )}
                    </p>
                </div>
                {canChat && (
                    <button
                        onClick={() => setSearchOpen((o) => !o)}
                        className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                        aria-label="Search messages"
                    >
                        <Search size={20} />
                    </button>
                )}
                {canChat && (
                    <button
                        onClick={() => setMembersOpen(true)}
                        className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                        aria-label="View members"
                    >
                        <Users size={20} />
                    </button>
                )}
            </div>

            {!canChat ? (
                <div className="flex flex-col items-center justify-center gap-3 text-center py-20">
                    <Lock size={32} className="text-gray-400 dark:text-white/30" />
                    <p className="text-gray-500 dark:text-white/50">
                        {currentCommunity.membershipStatus === 'pending'
                            ? 'Your request is awaiting instructor approval.'
                            : 'You need an approved membership to view this community.'}
                    </p>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Back to Communities
                    </Button>
                </div>
            ) : (
                <div className="h-[70vh] flex flex-col rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden">
                    {searchOpen && <MessageSearchBar communityId={id} onClose={() => setSearchOpen(false)} />}
                    <PinnedMessagesPanel messages={pinnedMessages} canModerate={canModerate} onUnpin={handleUnpin} />

                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-center text-gray-400 dark:text-white/30 text-sm">
                                No messages yet — say hi to start the conversation.
                            </div>
                        ) : (
                            messages.map((message) => (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isOwn={message.sender?._id === currentUserId}
                                    currentUserId={currentUserId}
                                    canModerate={canModerate}
                                    onReact={(emoji) => handleReact(message._id, emoji)}
                                    onReply={() => handleReply(message)}
                                    onEdit={() => handleEdit(message)}
                                    onDelete={() => handleDelete(message)}
                                    onTogglePin={() => handleTogglePin(message)}
                                />
                            ))
                        )}
                        {typingUsers.length > 0 && (
                            <p className="text-xs text-gray-400 dark:text-white/30 italic">Someone is typing…</p>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <MessageComposer
                        communityId={id}
                        onSend={handleSend}
                        onTyping={() => getSocket().emit('typing', { communityId: id })}
                        replyingTo={replyingTo}
                        onCancelReply={() => setReplyingTo(null)}
                        editingMessage={editingMessage}
                        onCancelEdit={() => setEditingMessage(null)}
                        onEditSave={handleEditSave}
                        members={members}
                        canMentionEveryone={canModerate}
                    />
                </div>
            )}

            <ViewMembersModal
                isOpen={membersOpen}
                onClose={() => setMembersOpen(false)}
                communityId={id}
                onlineUserIds={onlineUserIds}
            />
        </div>
    );
};

export default CommunityRoomPage;
