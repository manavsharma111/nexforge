import React, { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { handleOAuthSuccess } from "../redux/slices/authSlice"

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")
    const userStr = searchParams.get("user")

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        dispatch(handleOAuthSuccess({ user, accessToken }))
        navigate("/")
      } catch (error) {
        console.error("Failed to parse user data", error)
        navigate("/login")
      }
    } else {
      navigate("/login")
    }
  }, [searchParams, navigate, dispatch])

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-vercel-lightBlue"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-gray-400 font-medium">Authenticating...</p>
      </div>
    </div>
  )
}

export default AuthCallback
