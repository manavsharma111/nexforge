import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import domainService from "../../services/domainService"

export const getProjectDomains = createAsyncThunk(
  "domain/getProjectDomains",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await domainService.getProjectDomains(projectId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch domains",
      )
    }
  },
)

export const addCustomDomain = createAsyncThunk(
  "domain/addCustomDomain",
  async (domainData, { rejectWithValue }) => {
    try {
      const response = await domainService.addCustomDomain(domainData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add domain",
      )
    }
  },
)

export const verifyDomain = createAsyncThunk(
  "domain/verifyDomain",
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await domainService.verifyDomain(domainId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify domain",
      )
    }
  },
)

export const removeDomain = createAsyncThunk(
  "domain/removeDomain",
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await domainService.removeDomain(domainId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove domain",
      )
    }
  },
)

const domainSlice = createSlice({
  name: "domain",
  initialState: {
    domains: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearDomainMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Domains
      .addCase(getProjectDomains.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProjectDomains.fulfilled, (state, action) => {
        state.isLoading = false
        state.domains = action.payload
      })
      .addCase(getProjectDomains.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Add Domain
      .addCase(addCustomDomain.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addCustomDomain.fulfilled, (state, action) => {
        state.isLoading = false
        state.domains.push(action.payload.domain)
        state.successMessage = "Domain added successfully"
      })
      .addCase(addCustomDomain.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Verify Domain
      .addCase(verifyDomain.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyDomain.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.domains.findIndex(
          (d) => d._id === action.payload.domain._id,
        )
        if (index !== -1) {
          state.domains[index] = action.payload.domain
        }
        state.successMessage = "Domain verification completed"
      })
      .addCase(verifyDomain.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Remove Domain
      .addCase(removeDomain.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeDomain.fulfilled, (state, action) => {
        state.isLoading = false
        state.domains = state.domains.filter((d) => d._id !== action.meta.arg)
        state.successMessage = "Domain removed successfully"
      })
      .addCase(removeDomain.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearDomainMessages } = domainSlice.actions
export default domainSlice.reducer
