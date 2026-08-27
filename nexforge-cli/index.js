#!/usr/bin/env node

const { program } = require("commander")

program
  .name("nexforge")
  .description("CLI to some next-level deployment magic for NexForge")
  .version("1.0.0")

require("./src/commands/login")(program)
require("./src/commands/init")(program)
require("./src/commands/deploy")(program)
require("./src/commands/env")(program)
require("./src/commands/logs")(program)
require("./src/commands/rollback")(program)
require("./src/commands/rename")(program)
require("./src/commands/create")(program)

// Parse the arguments passed by the user in the terminal
program.parse(process.argv)
