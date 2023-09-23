import {PayloadAction, createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import {getCurrentUser} from "../../api/auth";
import {ApiResponse, User} from "@hotel-management-system/models";

interface AppStateSlice {
    appBarTitle: string;
    snackBarAlert: {
        show: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
    },
    currentlyLoggedInUser?: User;
    loggedIn: boolean;
}

const initialState: AppStateSlice = {
    appBarTitle: 'Hotel Management System',
    snackBarAlert: {
        show: false,
        message: '',
        severity: 'success'
    },
    loggedIn: false
};

export const fetchUserDetails = createAsyncThunk(
    'appState/fetchUserDetails',
    async (_, {rejectWithValue}) => {
        try {
            const response = await getCurrentUser();
            if (response.status === 401) {
                return rejectWithValue({
                    type: 'unauthorized',
                    message: 'You are not authorized to view this page',
                    error: null
                });
            } else {
                const responseData: ApiResponse<User> = await response.json();
                return responseData.data;
            }
        } catch (error) {
            return rejectWithValue({
                type: 'error',
                message: 'Something went wrong',
                error: error
            });
        }
    }
)

const appStateSlice = createSlice({
    name: 'appState',
    initialState,
    reducers: {
        setAppBarTitle: (state, action: PayloadAction<string>) => {
            state.appBarTitle = action.payload;
        },
        setSnackBarAlert: (state, action: PayloadAction<{
            show: boolean,
            message: string,
            severity: 'success' | 'info' | 'warning' | 'error'
        }>) => {
            state.snackBarAlert = action.payload;
        },
        setLoggedInUser: (state, action: PayloadAction<User>) => {
            state.loggedIn = true;
            state.currentlyLoggedInUser = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserDetails.fulfilled, (state, action) => {
            state.currentlyLoggedInUser = action.payload;
            state.loggedIn = true;
        })
        builder.addCase(fetchUserDetails.rejected, (state, action: any) => {
            switch (action.payload?.type) {
                case 'unauthorized':
                    state.loggedIn = false;
                    state.snackBarAlert = {
                        show: true,
                        message: action.payload?.message,
                        severity: 'warning'
                    }
                    break;
                default:
                    state.snackBarAlert = {
                        show: true,
                        message: action.payload?.message,
                        severity: 'error'
                    }
            }
        })
    }
});

export default appStateSlice;