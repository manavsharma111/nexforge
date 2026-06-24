import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import githubService from "../../services/githubService"

export const fetchGithubRepos = createAsyncThunk(
  "github/fetchRepos",
  async (_, { rejectWithValue }) => {
    try {
      const data = await githubService.getUserRepositories()
      return data.repositories || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch repositories",
      )
    }
  },
)

const githubSlice = createSlice({
  name: "github",
  initialState: {
    repositories: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearGithubError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGithubRepos.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchGithubRepos.fulfilled, (state, action) => {
        state.isLoading = false
        state.repositories = action.payload
      })
      .addCase(fetchGithubRepos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearGithubError } = githubSlice.actions
export default githubSlice.reducer
