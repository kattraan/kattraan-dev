import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowLeft, Lock, MoreVertical } from 'lucide-react';
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
import { connectSocket, emitWhenConnected } from '@/lib/socket';
import MessageBubble from '@/components/community/MessageBubble';
import MessageComposer from '@/components/community/MessageComposer';
import PinnedMessagesPanel from '@/components/community/PinnedMessagesPanel';
import ChatDateSeparator from '@/components/community/ChatDateSeparator';
import MessageSearchBar from '@/components/community/MessageSearchBar';
import { isOwnMessage } from '@/components/community/communityUtils';
import {
    CommunityChatMenu,
    CommunityInfoPanel,
    CommunityMembersPanel,
    getCommunityAvatar,
} from '@/components/community/CommunityChatPanels';
import { Button, useConfirmDialog, useToast } from '@/components/ui';

const CAN_CHAT = ['owner', 'admin', 'approved'];
const CAN_MODERATE = ['owner', 'admin'];

const PANEL_TITLES = {
    info: 'Community info',
    members: 'Members',
    search: 'Search messages',
};

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function formatDateLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(date, now)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

function buildChatItems(messages) {
    const items = [];
    let lastDateKey = '';

    for (const message of messages) {
        const dateKey = message.createdAt ? new Date(message.createdAt).toDateString() : '';

        if (dateKey && dateKey !== lastDateKey) {
            items.push({ type: 'date', key: `date-${dateKey}`, label: formatDateLabel(message.createdAt) });
            lastDateKey = dateKey;
        }

        items.push({ type: 'message', key: message._id, message });
    }

    return items;
}

const CommunityRoomPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const { currentCommunity, messages, typingUsers, members, pinnedMessages, onlineUserIds } = useSelector(
        (state) => state.community
    );
    const currentUserId = useSelector((state) => state.auth.user?._id);

    const messagesEndRef = useRef(null);
    const messageRefs = useRef({});
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [activePanel, setActivePanel] = useState(location.state?.panel || null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);

    const canModerate = CAN_MODERATE.includes(currentCommunity?.membershipStatus);
    const canChat = CAN_CHAT.includes(currentCommunity?.membershipStatus);
    const avatarUrl = getCommunityAvatar(currentCommunity);
    const chatItems = useMemo(() => buildChatItems(messages), [messages]);
    const showChat = !activePanel || activePanel === 'search';

    const onlineSubtitle = useMemo(() => {
        if (typingUsers.length > 0) return 'typing…';
        if (onlineUserIds.length > 0) return `${onlineUserIds.length} online`;
        return currentCommunity?.course?.title || 'tap for community info';
    }, [typingUsers.length, onlineUserIds.length, currentCommunity?.course?.title]);

    useEffect(() => {
        dispatch(fetchCommunity(id));
        dispatch(fetchMessages({ id }));
        return () => dispatch(clearCurrentCommunity());
    }, [dispatch, id]);

    useEffect(() => {
        if (!canChat) return;
        dispatch(fetchMembers(id));
        dispatch(fetchPinnedMessages(id));
    }, [canChat, id, dispatch]);

    useEffect(() => {
        if (!canChat) return;

        const socket = connectSocket();
        const onConnect = () => socket.emit('join-community', { communityId: id });
        const onConnectError = () => toast.error('Chat connection failed', 'Please refresh the page and try again.');
        const onSocketError = (payload) => toast.error('Message failed', payload?.message || 'Could not complete that action.');

        if (socket.connected) onConnect();
        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('error', onSocketError);

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
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('error', onSocketError);
            socket.off('new-message', onNewMessage);
            socket.off('message-deleted', onMessageDeleted);
            socket.off('message-edited', onMessageEdited);
            socket.off('reaction-updated', onReactionUpdated);
            socket.off('message-pinned', onMessagePinned);
            socket.off('message-unpinned', onMessageUnpinned);
            socket.off('presence-update', onPresenceUpdate);
            socket.off('user-typing', onUserTyping);
        };
    }, [canChat, id, dispatch, toast]);

    useEffect(() => {
        if (showChat && activePanel !== 'search') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, showChat, activePanel]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const jumpToMessage = (messageId) => {
        requestAnimationFrame(() => {
            const el = messageRefs.current[messageId];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlightedMessageId(messageId);
                setTimeout(() => setHighlightedMessageId(null), 2500);
            }
        });
    };

    const handleBack = () => {
        if (activePanel) {
            setActivePanel(null);
            return;
        }
        navigate(-1);
    };

    const openPanel = (panel) => {
        setActivePanel(panel);
        setMenuOpen(false);
        setReplyingTo(null);
        setEditingMessage(null);
    };

    const handleSend = (body, attachment) => {
        emitWhenConnected('send-message', {
            communityId: id,
            body,
            replyTo: replyingTo?._id,
            attachments: attachment ? [attachment] : [],
        });
        setReplyingTo(null);
    };

    const handleEditSave = (messageId, body) => {
        emitWhenConnected('edit-message', { communityId: id, messageId, body });
        setEditingMessage(null);
    };

    const handleReply = (message) => {
        setEditingMessage(null);
        setReplyingTo({
            _id: message._id,
            senderName: message.sender?.userName || 'Member',
            body: message.body.slice(0, 80),
        });
    };

    const handleEdit = (message) => {
        setReplyingTo(null);
        setEditingMessage({ _id: message._id, body: message.body });
    };

    const handleDelete = async (message) => {
        const ok = await confirm({ title: 'Delete this message?', message: 'This cannot be undone.', confirmText: 'Delete' });
        if (!ok) return;
        emitWhenConnected('delete-message', { communityId: id, messageId: message._id });
    };

    const handleReact = (messageId, emoji) => {
        emitWhenConnected('toggle-reaction', { communityId: id, messageId, emoji });
    };

    const handleTogglePin = (message) => {
        const event = message.isPinned ? 'unpin-message' : 'pin-message';
        emitWhenConnected(event, { communityId: id, messageId: message._id });
    };

    const handleUnpin = (messageId) => {
        emitWhenConnected('unpin-message', { communityId: id, messageId });
    };

    if (!currentCommunity) {
        return (
            <div className="flex justify-center items-center h-48 text-gray-500 dark:text-white/40 font-satoshi">
                Loading community…
            </div>
        );
    }

    return (
        <div className="font-satoshi w-full -mx-5 md:-mx-6 flex flex-col h-[calc(100dvh-7.5rem)] min-h-[480px]">
            {!canChat ? (
                <div className="mx-5 md:mx-6 rounded-2xl bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 p-12 flex flex-col items-center justify-center text-center flex-1">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                        <Lock size={28} className="text-gray-400 dark:text-white/35" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white/90 mb-2">Private Community</h2>
                    <p className="text-gray-500 dark:text-white/45 max-w-md text-sm">
                        {currentCommunity.membershipStatus === 'pending'
                            ? 'Your request is currently awaiting instructor approval. Please check back later.'
                            : 'You need an approved membership to view this community and join the conversation.'}
                    </p>
                    <Button variant="primary" className="mt-6 px-6" onClick={() => navigate(-1)}>
                        Back to Hub
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-gray-50 dark:bg-[#0c091a] transition-colors duration-300">
                    <div className="relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/90 dark:bg-[#1a1625]/90 backdrop-blur-sm border-b border-gray-200/80 dark:border-white/10 flex-shrink-0 z-20">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="p-2 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            aria-label={activePanel ? 'Back to chat' : 'Back'}
                        >
                            <ArrowLeft size={20} />
                        </button>

                        {activePanel ? (
                            <div className="min-w-0 flex-1">
                                <h1 className="text-[16px] font-semibold text-gray-900 dark:text-white/90 truncate leading-tight">
                                    {PANEL_TITLES[activePanel]}
                                </h1>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => openPanel('info')}
                                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                            >
                                <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 ring-2 ring-primary-pink/20">
                                    <img src={avatarUrl} alt={currentCommunity.name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-[16px] font-semibold text-gray-900 dark:text-white/90 truncate leading-tight">
                                        {currentCommunity.name}
                                    </h1>
                                    <p className={`text-[13px] truncate leading-tight ${typingUsers.length > 0 ? 'text-primary-purple dark:text-primary-pink' : 'text-gray-500 dark:text-white/45'}`}>
                                        {onlineSubtitle}
                                    </p>
                                </div>
                            </button>
                        )}

                        <div className="relative">
                            <button
                                ref={menuButtonRef}
                                type="button"
                                onClick={() => setMenuOpen((o) => !o)}
                                className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white/90' : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                aria-label="Community menu"
                                aria-expanded={menuOpen}
                            >
                                <MoreVertical size={20} />
                            </button>
                            <CommunityChatMenu open={menuOpen} onClose={() => setMenuOpen(false)} menuRef={menuRef} onSelect={openPanel} />
                        </div>
                    </div>

                    {activePanel === 'info' && (
                        <CommunityInfoPanel
                            community={currentCommunity}
                            memberCount={members.length}
                            onlineCount={onlineUserIds.length}
                            canEdit={canModerate}
                            onUpdated={() => dispatch(fetchCommunity(id))}
                        />
                    )}

                    {activePanel === 'members' && (
                        <CommunityMembersPanel communityId={id} onlineUserIds={onlineUserIds} canModerate={canModerate} />
                    )}

                    {showChat && (
                        <>
                            {activePanel === 'search' && (
                                <div className="flex-shrink-0 bg-white/90 dark:bg-[#1a1625]/90 border-b border-gray-200/80 dark:border-white/10 z-10">
                                    <MessageSearchBar communityId={id} onJumpToMessage={jumpToMessage} compact />
                                </div>
                            )}

                            <PinnedMessagesPanel
                                messages={pinnedMessages}
                                canModerate={canModerate}
                                onUnpin={handleUnpin}
                                onJumpToMessage={jumpToMessage}
                            />

                            <div className="relative flex-1 min-h-0 overflow-hidden">
                                <div className="absolute inset-0 chat-wallpaper" aria-hidden="true" />
                                <div className="relative z-10 h-full overflow-y-auto px-3 sm:px-[4%] py-3 flex flex-col custom-scrollbar">
                                    {messages.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                                            <div className="px-4 py-2 rounded-xl bg-white/90 dark:bg-[#1a1625]/90 text-gray-500 dark:text-white/45 text-sm shadow-sm backdrop-blur-sm max-w-xs border border-gray-200/60 dark:border-white/10">
                                                Send a message to start the conversation.
                                            </div>
                                        </div>
                                    ) : (
                                        chatItems.map((item) => {
                                            if (item.type === 'date') {
                                                return <ChatDateSeparator key={item.key} label={item.label} />;
                                            }

                                            const own = isOwnMessage(item.message, currentUserId);

                                            return (
                                                <div
                                                    key={item.key}
                                                    ref={(el) => {
                                                        if (el) messageRefs.current[item.message._id] = el;
                                                    }}
                                                    className={clsx(
                                                        'flex w-full mb-0.5 rounded-xl transition-all duration-300',
                                                        own ? 'justify-end' : 'justify-start',
                                                        highlightedMessageId === item.message._id &&
                                                            'ring-2 ring-primary-pink/60 bg-primary-pink/5 dark:bg-primary-purple/10'
                                                    )}
                                                >
                                                    <MessageBubble
                                                        message={item.message}
                                                        isOwn={own}
                                                        currentUserId={currentUserId}
                                                        canModerate={canModerate}
                                                        onReact={(emoji) => handleReact(item.message._id, emoji)}
                                                        onReply={() => handleReply(item.message)}
                                                        onEdit={() => handleEdit(item.message)}
                                                        onDelete={() => handleDelete(item.message)}
                                                        onTogglePin={() => handleTogglePin(item.message)}
                                                    />
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} className="h-2 shrink-0" />
                                </div>
                            </div>

                            {activePanel !== 'search' && (
                                <div className="flex-shrink-0 z-10">
                                    <MessageComposer
                                        communityId={id}
                                        onSend={handleSend}
                                        onTyping={() => emitWhenConnected('typing', { communityId: id })}
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
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityRoomPage;
