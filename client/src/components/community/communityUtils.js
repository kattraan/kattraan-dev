/** Compare message sender to the logged-in user (handles populated object or raw id). */
export const isOwnMessage = (message, userId) => {
    if (!message || userId == null) return false;
    const senderId = message.sender?._id ?? message.sender;
    return String(senderId) === String(userId);
};
