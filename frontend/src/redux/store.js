import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import projectReducer from "./slices/projectSlice"
import githubReducer from "./slices/githubSlice"
import domainReducer from "./slices/domainSlice"
import analyticsReducer from "./slices/analyticsSlice"
import aiReducer from "./slices/aiSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    github: githubReducer,
    domain: domainReducer,
    analytics: analyticsReducer,
    ai: aiReducer,
  },
})

export default store
