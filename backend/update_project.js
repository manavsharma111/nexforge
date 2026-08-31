const mongoose = require("mongoose")
const Project = require("./src/models/project.model")

mongoose.connect("mongodb+srv://manavsharma3825:ASUStuf69@complete-backend.i1p18nd.mongodb.net/deployment?retryWrites=true&w=majority")
  .then(async () => {
    try {
      const project = await Project.findOne({ projectName: 'w' });
      if (!project) {
          console.log("Project 'w' not found!");
          return process.exit(0);
      }
      
      // Update the fields back to dist
      project.buildCommand = "echo 'Already built'";
      project.outputDirectory = "dist";
      project.installCommand = "echo 'No install needed'";
      
      await project.save();
      console.log("✅ Project 'w' outputDirectory reverted to 'dist' in database!");
    } catch (err) {
      console.error("Error updating project:", err);
    }
    process.exit(0);
  });
