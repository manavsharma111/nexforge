const errorHandler = (err, req, res, next) => {
  console.error(`Error : ${err.message}`)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message || "Internal Server Error"

  // Handle MongoDB Duplicate Key Error (e.g., same Project Name)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `An item with that ${field} already exists. Please choose a different one!`
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}

module.exports = { errorHandler }
