import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import communityService from '@/features/community/services/communityService';

const thunkError = (error, thunkAPI) => {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
};

export const fetchCommunities = createAsyncThunk('community/fetchCommunities', async (_, thunkAPI) => {
    try {
        const data = await communityService.getCommunities();
        return data.communities;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const fetchCommunity = createAsyncThunk('community/fetchCommunity', async (id, thunkAPI) => {
    try {
        const data = await communityService.getCommunity(id);
        return data.community;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const createCommunity = createAsyncThunk('community/createCommunity', async (payload, thunkAPI) => {
    try {
        const data = await communityService.createCommunity(payload);
        return data.community;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const updateCommunity = createAsyncThunk('community/updateCommunity', async ({ id, payload }, thunkAPI) => {
    try {
        const data = await communityService.updateCommunity(id, payload);
        return data.community;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const archiveCommunity = createAsyncThunk('community/archiveCommunity', async (id, thunkAPI) => {
    try {
        await communityService.archiveCommunity(id);
        return id;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const requestJoin = createAsyncThunk('community/requestJoin', async (id, thunkAPI) => {
    try {
        const data = await communityService.requestJoin(id);
        return { id, membership: data.membership };
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const leaveCommunity = createAsyncThunk('community/leaveCommunity', async (id, thunkAPI) => {
    try {
        await communityService.leaveCommunity(id);
        return id;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const fetchPendingRequests = createAsyncThunk('community/fetchPendingRequests', async (id, thunkAPI) => {
    try {
        const data = await communityService.getJoinRequests(id);
        return data.requests;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const decideJoinRequest = createAsyncThunk(
    'community/decideJoinRequest',
    async ({ id, userId, action }, thunkAPI) => {
        try {
            const data = await communityService.decideJoinRequest(id, userId, action);
            return { userId, membership: data.membership };
        } catch (error) {
            return thunkError(error, thunkAPI);
        }
    }
);

export const fetchMembers = createAsyncThunk('community/fetchMembers', async (id, thunkAPI) => {
    try {
        const data = await communityService.getMembers(id);
        return data.members;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const removeMember = createAsyncThunk('community/removeMember', async ({ id, userId }, thunkAPI) => {
    try {
        await communityService.removeMember(id, userId);
        return userId;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const fetchMessages = createAsyncThunk('community/fetchMessages', async ({ id, before }, thunkAPI) => {
    try {
        const data = await communityService.getMessages(id, before);
        return { messages: data.messages, prepend: !!before };
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const searchMessages = createAsyncThunk('community/searchMessages', async ({ id, q }, thunkAPI) => {
    try {
        const data = await communityService.searchMessages(id, q);
        return data.messages;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const fetchPinnedMessages = createAsyncThunk('community/fetchPinnedMessages', async (id, thunkAPI) => {
    try {
        const data = await communityService.getPinnedMessages(id);
        return data.messages;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

export const uploadAttachment = createAsyncThunk('community/uploadAttachment', async ({ id, file }, thunkAPI) => {
    try {
        const data = await communityService.uploadAttachment(id, file);
        return data.attachment;
    } catch (error) {
        return thunkError(error, thunkAPI);
    }
});

const initialState = {
    communities: [],
    currentCommunity: null,
    messages: [],
    members: [],
    pendingRequests: [],
    typingUsers: [],
    pinnedMessages: [],
    onlineUserIds: [],
    searchResults: [],
    searchLoading: false,
    loading: false,
    error: null,
};

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        clearCurrentCommunity: (state) => {
            state.currentCommunity = null;
            state.messages = [];
            state.members = [];
            state.pendingRequests = [];
            state.typingUsers = [];
            state.pinnedMessages = [];
            state.onlineUserIds = [];
            state.searchResults = [];
        },
        // Pushed by the socket connection (see lib/socket.js consumers)
        messageReceived: (state, action) => {
            if (!state.messages.some((m) => m._id === action.payload._id)) {
                state.messages.push(action.payload);
            }
        },
        messageDeleted: (state, action) => {
            state.messages = state.messages.filter((m) => m._id !== action.payload.messageId);
        },
        messageEdited: (state, action) => {
            const { messageId, body, editedAt } = action.payload;
            const message = state.messages.find((m) => m._id === messageId);
            if (message) {
                message.body = body;
                message.editedAt = editedAt;
            }
        },
        reactionUpdated: (state, action) => {
            const { messageId, reactions } = action.payload;
            const message = state.messages.find((m) => m._id === messageId);
            if (message) message.reactions = reactions;
        },
        messagePinned: (state, action) => {
            const { messageId, pinnedAt } = action.payload;
            const message = state.messages.find((m) => m._id === messageId);
            if (message) {
                message.isPinned = true;
                message.pinnedAt = pinnedAt;
            }
        },
        messageUnpinned: (state, action) => {
            const message = state.messages.find((m) => m._id === action.payload.messageId);
            if (message) message.isPinned = false;
            state.pinnedMessages = state.pinnedMessages.filter((m) => m._id !== action.payload.messageId);
        },
        presenceUpdated: (state, action) => {
            state.onlineUserIds = action.payload.onlineUserIds;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        userTyping: (state, action) => {
            if (!state.typingUsers.includes(action.payload.userId)) {
                state.typingUsers.push(action.payload.userId);
            }
        },
        clearTyping: (state) => {
            state.typingUsers = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommunities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCommunities.fulfilled, (state, action) => {
                state.loading = false;
                state.communities = action.payload;
            })
            .addCase(fetchCommunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCommunity.fulfilled, (state, action) => {
                state.currentCommunity = action.payload;
            })
            .addCase(createCommunity.fulfilled, (state, action) => {
                state.communities.unshift(action.payload);
            })
            .addCase(updateCommunity.fulfilled, (state, action) => {
                const index = state.communities.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) state.communities[index] = action.payload;
                if (state.currentCommunity?._id === action.payload._id) {
                    state.currentCommunity = action.payload;
                }
            })
            .addCase(archiveCommunity.fulfilled, (state, action) => {
                state.communities = state.communities.filter((c) => c._id !== action.payload);
            })
            .addCase(requestJoin.fulfilled, (state, action) => {
                if (state.currentCommunity?._id === action.payload.id) {
                    state.currentCommunity.membershipStatus = action.payload.membership.status;
                }
            })
            .addCase(leaveCommunity.fulfilled, (state, action) => {
                const community = state.communities.find((c) => c._id === action.payload);
                if (community) community.membershipStatus = 'none';
                if (state.currentCommunity?._id === action.payload) {
                    state.currentCommunity.membershipStatus = 'none';
                }
            })
            .addCase(fetchPendingRequests.fulfilled, (state, action) => {
                state.pendingRequests = action.payload;
            })
            .addCase(decideJoinRequest.fulfilled, (state, action) => {
                state.pendingRequests = state.pendingRequests.filter(
                    (r) => r.user._id !== action.payload.userId
                );
            })
            .addCase(fetchMembers.fulfilled, (state, action) => {
                state.members = action.payload;
            })
            .addCase(removeMember.fulfilled, (state, action) => {
                state.members = state.members.filter((m) => m.user._id !== action.payload);
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messages = action.payload.prepend
                    ? [...action.payload.messages, ...state.messages]
                    : action.payload.messages;
            })
            .addCase(searchMessages.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchMessages.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchMessages.rejected, (state) => {
                state.searchLoading = false;
            })
            .addCase(fetchPinnedMessages.fulfilled, (state, action) => {
                state.pinnedMessages = action.payload;
            });
    },
});

export const {
    clearCurrentCommunity,
    messageReceived,
    messageDeleted,
    messageEdited,
    reactionUpdated,
    messagePinned,
    messageUnpinned,
    presenceUpdated,
    clearSearchResults,
    userTyping,
    clearTyping,
} = communitySlice.actions;
export default communitySlice.reducer;
