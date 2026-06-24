const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

const authMiddleware = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token and attach to request
      req.user = await User.findById(decoded.id)

      next()
    } catch (error) {
      console.error("Auth Middleware Error:", error.message)
      res.status(401).json({ message: "Not authorized, token failed" })
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" })
  }
}

module.exports = { authMiddleware }
