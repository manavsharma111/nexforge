const mongoose = require("mongoose")
require("dotenv").config({ path: __dirname + "/.env" })

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/deployment")
  .then(async () => {
    console.log("Connected to DB. Dropping index...")
    try {
      await mongoose.connection
        .collection("projects")
        .dropIndex("githubRepoUrl_1")
      console.log("Index dropped successfully.")
    } catch (e) {
      console.log("Error or index already dropped:", e.message)
    }
    process.exit(0)
  })
  .catch((err) => {
    console.error("Connection error:", err)
    process.exit(1)
  })
