const axios = require("axios")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/user.model")

// Access Token 15 min
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  })
}

// Refresh Token 7 days
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  )
}

// Redirect to GitHub
const githubAuth = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo`
  res.redirect(githubAuthUrl)
}

// GitHub OAuth Callback
const githubCallback = async (req, res) => {
  const { code } = req.query
  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    )

    const githubAccessToken = tokenResponse.data.access_token

    if (!githubAccessToken) {
      return res
        .status(400)
        .json({ message: "Failed to get access token from GitHub" })
    }

    // Get user info from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    })

    // GitHub users email
    let email = userResponse.data.email
    if (!email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: { Authorization: `Bearer ${githubAccessToken}` },
        },
      )
      const primaryEmailObj = emailResponse.data.find((e) => e.primary)
      email = primaryEmailObj ? primaryEmailObj.email : null
    }

    const {
      id: githubId,
      login: username,
      avatar_url: avatar,
    } = userResponse.data

    // Find or Create User in our Database
    let user = await User.findOne({ githubId })

    if (!user) {
      user = await User.create({
        githubId,
        username,
        email,
        avatar,
        githubToken: githubAccessToken,
      })
    } else {
      user.githubToken = githubAccessToken
      await user.save()
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Store Refresh Token in a secure HTTP-Only cookie
    // For cross-origin (frontend on one domain, backend on another), we need SameSite=None and Secure=true
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Redirect back to frontend with Access Token and User data
    const userObj = {
      githubId: user.githubId,
      githubUsername: user.username,
      avatarUrl: user.avatar,
    }
    res.redirect(
      `https://nexforge-sandy.vercel.app/auth/success?accessToken=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`,
    )
  } catch (error) {
    console.error("GitHub Auth Error:", error.message)
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message })
  }
}

// Exchanging Refresh Token for a new Access Token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token found" })
    }

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    )

    // Ensure user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Issue new access token
    const newAccessToken = generateAccessToken(user._id)

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    console.error("Refresh Token Error:", error.message)
    res.status(403).json({ message: "Invalid or expired refresh token" })
  }
}

// Get current logged in user data
const getMe = async (req, res) => {
  const userObj = req.user.toObject()
  delete userObj.githubToken
  res.status(200).json(userObj)
}

// logout
const logoutUser = async (req, res) => {
  try {
    // For cross-origin (frontend on one domain, backend on another), we need SameSite=None and Secure=true
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout Error:", error.message)
    res.status(500).json({ message: "Logout failed", error: error.message })
  }
}

const generateCliToken = async (req, res) => {
  try {
    const userId = req.user.id
    // Generate a random 64-character hex string (32 bytes)
    const token = "nxf_" + crypto.randomBytes(32).toString("hex")

    await User.findByIdAndUpdate(userId, { cliToken: token })

    res.status(200).json({ cliToken: token })
  } catch (error) {
    console.error("Error generating CLI token:", error.message)
    res.status(500).json({ error: "Server Error" })
  }
}

const getCliToken = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select("cliToken")

    res.status(200).json({ cliToken: user.cliToken || null })
  } catch (error) {
    console.error("Error fetching CLI token:", error.message)
    res.status(500).json({ error: "Server Error" })
  }
}

module.exports = {
  githubAuth,
  githubCallback,
  refreshAccessToken,
  getMe,
  logoutUser,
  generateCliToken,
  getCliToken,
}
