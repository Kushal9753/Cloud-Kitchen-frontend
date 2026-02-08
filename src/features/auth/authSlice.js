import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// config import removed

// Async thunk for login
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, userData);
        // if (response.data) {
        //     localStorage.setItem('user', JSON.stringify(response.data));
        // }
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Async thunk for register
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, userData);
        // if (response.data) {
        //     localStorage.setItem('user', JSON.stringify(response.data));
        // }
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Async thunk for logout
export const logout = createAsyncThunk('auth/logout', async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
    // localStorage.removeItem('user');
});

// Check auth status
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, thunkAPI) => {
    try {
        console.log('Checking auth status...');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
        console.log('Auth check successful:', response.data?.email);
        return response.data;
    } catch (error) {
        console.log('Auth check failed:', error.response?.status, error.message);
        return thunkAPI.rejectWithValue(error.message);
    }
});

const initialState = {
    user: null, // JSON.parse(localStorage.getItem('user')) || null,
    isError: false,
    isSuccess: false,
    isLoading: true, // Start as true to prevent flash while checking auth on initial load
    isAuthChecked: false, // Track whether initial auth check has completed
    message: '',
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthChecked = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isAuthChecked = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthChecked = true;
                state.user = null;
            })
            .addCase(logout.rejected, (state) => {
                // Even if logout API fails, clear user state locally
                state.isLoading = false;
                state.isAuthChecked = true;
                state.user = null;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthChecked = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isAuthChecked = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthChecked = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.isError = false; // Don't show error for initial check failure (just not logged in)
                state.isAuthChecked = true;
                state.user = null;
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
