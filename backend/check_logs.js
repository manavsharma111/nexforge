const mongoose = require("mongoose");
const Log = require("./src/models/log.model");
const Project = require("./src/models/project.model");

mongoose.connect("mongodb+srv://manavsharma3825:ASUStuf69@complete-backend.i1p18nd.mongodb.net/deployment?retryWrites=true&w=majority")
  .then(async () => {
    const project = await Project.findOne({ githubRepoUrl: /Social/i });
    if (!project) {
        const allProjects = await Project.find();
        console.log("All projects:", allProjects.map(p => p.projectName));
        return process.exit(0);
    }
    console.log("Project:", project.projectName);
    const log = await Log.findOne({ projectId: project._id });
    if(log && log.logs) {
        log.logs.forEach(l => console.log(`[${l.level}] ${l.message}`));
    }
    process.exit(0);
  });
