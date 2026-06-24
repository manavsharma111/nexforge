import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import projectService from "../../services/projectService"

export const fetchAllProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await projectService.getAllProjects()
      return data.projects || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch projects",
      )
    }
  },
)

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await projectService.getProjectById(id)
      return data.project
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project",
      )
    }
  },
)

export const createNewProject = createAsyncThunk(
  "projects/create",
  async (projectData, { rejectWithValue }) => {
    try {
      const data = await projectService.createProject(projectData)
      return data.project
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create project",
      )
    }
  },
)

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projectsList: [],
    currentProject: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProjectError: (state) => {
      state.error = null
    },
    setCurrentProjectStatus: (state, action) => {
      if (
        state.currentProject &&
        state.currentProject._id === action.payload.projectId
      ) {
        state.currentProject.status = action.payload.status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProjects.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.projectsList = action.payload
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProject = action.payload
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      .addCase(createNewProject.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createNewProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.projectsList.push(action.payload)
        state.currentProject = action.payload
      })
      .addCase(createNewProject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearProjectError, setCurrentProjectStatus } =
  projectSlice.actions
export default projectSlice.reducer
