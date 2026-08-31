const mongoose = require("mongoose");
const Log = require("./src/models/log.model");
const Project = require("./src/models/project.model");

mongoose.connect("mongodb+srv://manavsharma3825:ASUStuf69@complete-backend.i1p18nd.mongodb.net/deployment?retryWrites=true&w=majority")
  .then(async () => {
    // Find projects related to social media
    const allProjects = await Project.find({ githubRepoUrl: /Social/i });
    if (!allProjects.length) {
        console.log("No social media projects found.");
        return process.exit(0);
    }
    
    // Specifically target the frontend project if it exists
    let project = allProjects.find(p => p.projectName.toLowerCase().includes('front') || p.rootDirectory.toLowerCase().includes('front'));
    
    // If not found by name, just log all to see what we have
    if (!project) {
        console.log("Frontend project not clearly identified. Listing all matches:");
        for (const p of allProjects) {
            console.log(`- ${p.projectName} (Repo: ${p.githubRepoUrl}, Root: ${p.rootDirectory})`);
        }
        project = allProjects[0]; // fallback
    } else {
        console.log(`Found frontend project: ${project.projectName}`);
    }

    const log = await Log.findOne({ projectId: project._id }).sort({ _id: -1 });
    if(log && log.logs) {
        console.log(`\n--- Logs for ${project.projectName} ---`);
        log.logs.forEach(l => console.log(`[${l.level}] ${l.message}`));
    } else {
        console.log("No logs found for this project.");
    }
    process.exit(0);
  });
