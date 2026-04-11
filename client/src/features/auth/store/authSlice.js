import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/features/auth/services/authService';
import { normalizeUser } from '@/features/auth/utils/roleUtils';

// Async Thunks
export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
    try {
        const response = await authService.login(email, password);
        // Sequential call: Fetch profile after successful login
        const userResponse = await authService.checkAuth();
        return { ...response, user: userResponse.data.user };
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        await authService.register(userData);
        // Auto-login after registration
        const response = await authService.login(userData.email, userData.password);
        // Sequential call: Fetch profile
        const userResponse = await authService.checkAuth();
        return { ...response, user: userResponse.data.user };
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// New Thunk for Instructor Registration
export const registerInstructor = createAsyncThunk('auth/registerInstructor', async (userData, thunkAPI) => {
    try {
        // Register as instructor (Role ID 2)
        const response = await authService.register({ ...userData, roles: [2] });
        return response; // Just return success, no auto-login
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Async Thunk for Enrollment
export const submitEnrollment = createAsyncThunk('auth/submitEnrollment', async (data, thunkAPI) => {
    try {
        const response = await authService.submitEnrollment(data);
        return response.user; // Expecting updated user object
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Async Thunk for Approval (Simulated Admin)
export const approveInstructor = createAsyncThunk('auth/approveInstructor', async ({ userId, action }, thunkAPI) => {
    try {
        const response = await authService.approveInstructor(userId, action);
        return response.user;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Async Thunk for Become Instructor (Existing User Upgrade)
export const becomeInstructor = createAsyncThunk('auth/becomeInstructor', async (email, thunkAPI) => {
    try {
        const response = await authService.becomeInstructor(email);
        return response;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const becomeLearner = createAsyncThunk('auth/becomeLearner', async (_, thunkAPI) => {
    try {
        const response = await authService.becomeLearner();
        return response;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, thunkAPI) => {
    try {
        const response = await authService.checkAuth();
        return response.data.user; // expecting { success: true, data: { user } }
    } catch (error) {
        return thunkAPI.rejectWithValue(null);
    }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ userId, payload }, thunkAPI) => {
    try {
        const response = await authService.updateProfile(userId, payload);
        return response.data; // updated user
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const googleOneTapLoginAction = createAsyncThunk('auth/googleOneTapLogin', async (idToken, thunkAPI) => {
    try {
        const response = await authService.googleOneTapLogin(idToken);
        // Sequential call: Fetch profile
        const userResponse = await authService.checkAuth();
        return userResponse.data.user;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

/**
 * Initial state for Authentication
 * We start isAuthenticated=false until checkAuth confirms.
 * Optionally we can trust localStorage user for specific UI bits but better to be safe.
 */
const getInitialUser = () => {
    try {
        const raw = JSON.parse(localStorage.getItem('user'));
        return raw ? normalizeUser(raw) : null;
    } catch {
        return null;
    }
};

const initialState = {
    user: getInitialUser(),
    isAuthenticated: false, // Will be set to true if checkAuth succeeds
    loading: true, // Start loading to block UI until checkAuth done
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            authService.logout(); // trigger API call
            state.user = null;
            state.isAuthenticated = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action) => {
            const { user } = action.payload;
            state.user = normalizeUser(user);
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(state.user));
        },

    },
    extraReducers: (builder) => {
        builder
            // Login lifecycle
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null; // clear previous error on each new attempt
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
                state.user = normalizeUser(action.payload.user);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register lifecycle
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
                state.user = normalizeUser(action.payload.user);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Instructor Register Lifecycle
            .addCase(registerInstructor.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerInstructor.fulfilled, (state) => {
                state.loading = false;
                // Do not set isAuthenticated true here. User must login manually.
            })
            .addCase(registerInstructor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Submit Enrollment
            .addCase(submitEnrollment.fulfilled, (state, action) => {
                state.loading = false;
                state.user = normalizeUser(action.payload);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            // Approve Instructor
            .addCase(approveInstructor.fulfilled, (state, action) => {
                state.loading = false;
                // Only update if the approved user is the *current* user (e.g. self-check or simulation)
                // If Admin approves someone else, do NOT replace Admin's session data
                if (action.payload && state.user && state.user._id === action.payload._id) {
                    state.user = normalizeUser(action.payload);
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            })
            // Become Instructor
            .addCase(becomeInstructor.pending, (state) => {
                state.loading = true;
            })
            .addCase(becomeInstructor.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.user) {
                    state.user = normalizeUser(action.payload.user);
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            })
            .addCase(becomeInstructor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Become Learner
            .addCase(becomeLearner.pending, (state) => {
                state.loading = true;
            })
            .addCase(becomeLearner.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.user) {
                    state.user = normalizeUser(action.payload.user);
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            })
            .addCase(becomeLearner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Google One Tap
            .addCase(googleOneTapLoginAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(googleOneTapLoginAction.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = normalizeUser(action.payload);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(googleOneTapLoginAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = normalizeUser(action.payload);
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                localStorage.removeItem('user');
            })
            // Update profile
            .addCase(updateProfile.fulfilled, (state, action) => {
                const user = action.payload?.data ?? action.payload;
                if (user) {
                    state.user = normalizeUser(user);
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            });
    },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
