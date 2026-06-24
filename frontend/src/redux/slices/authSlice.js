import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import authService from "../../services/authService"

// check user auth status on page refresh
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getMe()
      return user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Not Authenticated",
      )
    }
  },
)

// logout user and clear local storage
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutUser()
      localStorage.removeItem("accessToken")
      return null
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed")
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    // set user after successful oauth login
    handleOAuthSuccess: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem("accessToken", accessToken)
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth states
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
      })

      // logout states
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { handleOAuthSuccess, clearError } = authSlice.actions
export default authSlice.reducer
