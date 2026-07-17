import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Search, Circle, Users, MessageCircle, Sparkles } from 'lucide-react';
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
import { Button, useConfirmDialog, Badge } from '@/components/ui';

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
        return <div className="flex justify-center items-center h-64 text-gray-500 dark:text-white/40 font-satoshi">Loading community…</div>;
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col font-satoshi h-full py-6 px-4 sm:px-6">
            {/* Header */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-purple via-primary-pink to-orange-400 p-1 mb-6 shadow-xl flex-shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <div className="relative bg-white/95 dark:bg-[#1a1625]/95 backdrop-blur-xl rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/70 hover:bg-primary-pink/10 hover:text-primary-pink transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-pink to-primary-purple flex items-center justify-center flex-shrink-0 shadow-inner">
                            <MessageCircle size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-extrabold text-xl text-gray-900 dark:text-white truncate flex items-center gap-2">
                                {currentCommunity.name}
                                {canChat && onlineUserIds.length > 0 && (
                                    <Badge variant="success" className="h-5 px-1.5 text-[10px] uppercase">
                                        <Circle size={6} className="fill-current mr-1 inline" /> {onlineUserIds.length} Online
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-white/50 truncate flex items-center gap-1 mt-0.5">
                                <Sparkles size={12} className="text-primary-pink" />
                                {currentCommunity.course?.title}
                            </p>
                        </div>
                    </div>

                    {canChat && (
                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                            <button
                                onClick={() => setSearchOpen((o) => !o)}
                                className={`p-2.5 rounded-xl transition-colors ${searchOpen ? 'bg-primary-pink text-white shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20'}`}
                                aria-label="Search messages"
                            >
                                <Search size={18} />
                            </button>
                            <button
                                onClick={() => setMembersOpen(true)}
                                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center gap-2 font-medium text-sm"
                                aria-label="View members"
                            >
                                <Users size={18} />
                                <span className="hidden sm:inline">Members</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!canChat ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20 bg-white dark:bg-[#1a1625] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                        <Lock size={32} className="text-gray-400 dark:text-white/30" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Private Community</h2>
                    <p className="text-gray-500 dark:text-white/50 max-w-md">
                        {currentCommunity.membershipStatus === 'pending'
                            ? 'Your request is currently awaiting instructor approval. Please check back later.'
                            : 'You need an approved membership to view this community and join the conversation.'}
                    </p>
                    <Button variant="primary" className="mt-4 px-8" onClick={() => navigate(-1)}>
                        Back to Hub
                    </Button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-[500px] rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1625] shadow-2xl overflow-hidden relative">
                    {/* Background decorations for chat area */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-pink/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-purple/5 rounded-full blur-3xl pointer-events-none"></div>

                    {searchOpen && (
                        <div className="relative z-20 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#1a1625]/80 backdrop-blur-md">
                            <MessageSearchBar communityId={id} onClose={() => setSearchOpen(false)} />
                        </div>
                    )}
                    
                    <PinnedMessagesPanel messages={pinnedMessages} canModerate={canModerate} onUnpin={handleUnpin} />

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 custom-scrollbar relative z-10">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
                                    <MessageCircle size={28} className="text-gray-400 dark:text-white/30" />
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold mb-1">It's quiet here</h3>
                                <p className="text-gray-400 dark:text-white/40 text-sm max-w-sm">
                                    Be the first to say hi and start the conversation in this community!
                                </p>
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
                        {typingUsers.length > 0 && (() => {
                            const names = typingUsers
                                .map(userId => {
                                    const member = members.find(m => m.user?._id === userId);
                                    if (member) return member.user.userName;
                                    if (currentCommunity?.createdBy?._id === userId) return currentCommunity.createdBy.userName;
                                    return null;
                                })
                                .filter(Boolean);
                            
                            let typingText = "Someone is typing…";
                            if (names.length === 1) typingText = `${names[0]} is typing…`;
                            else if (names.length === 2) typingText = `${names[0]} and ${names[1]} are typing…`;
                            else if (names.length > 2) typingText = `${names[0]} and ${names.length - 1} others are typing…`;
                            
                            return (
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/5 self-start px-4 py-2 rounded-full animate-pulse shadow-sm">
                                    <div className="flex gap-1.5 mr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-pink/60 dark:bg-primary-pink/80"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-pink/60 dark:bg-primary-pink/80 animation-delay-200"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-pink/60 dark:bg-primary-pink/80 animation-delay-400"></span>
                                    </div>
                                    <span>{typingText}</span>
                                </div>
                            );
                        })()}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    <div className="relative z-20 border-t border-gray-100 dark:border-white/5 bg-white/95 dark:bg-[#1a1625]/95 backdrop-blur-md p-4">
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
