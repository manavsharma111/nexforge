import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getAI } from "../../services/aiService"

// askai
export const askAIAsync = createAsyncThunk(
  "ai/askAI",
  async ({ prompt }, { rejectWithValue }) => {
    try {
      const data = await getAI(prompt)
      return data
    } catch (error) {
      console.log(`Error getting AI response - ${error.message}`)
      return rejectWithValue(error.message)
    }
  },
)

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    response: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAIResponse: (state) => {
      state.response = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askAIAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(askAIAsync.fulfilled, (state, action) => {
        state.loading = false
        state.response = action.payload
      })
      .addCase(askAIAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAIResponse } = aiSlice.actions
export default aiSlice.reducer
