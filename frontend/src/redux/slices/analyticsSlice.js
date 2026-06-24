import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import analyticsService from "../../services/analyticsService"

export const fetchProjectAnalytics = createAsyncThunk(
  "analytics/fetch",
  async ({ projectId, range }, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getProjectAnalytics(projectId, range)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics",
      )
    }
  },
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectAnalytics.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchProjectAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchProjectAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
