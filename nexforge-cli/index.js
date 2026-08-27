#!/usr/bin/env node

import { program } from "commander"

program
  .name("nexforge")
  .description("CLI to some next-level deployment magic for NexForge")
  .version("1.0.0")

import loginCmd from "./src/commands/login.js";
loginCmd(program);
import initCmd from "./src/commands/init.js";
initCmd(program);
import deployCmd from "./src/commands/deploy.js";
deployCmd(program);
import envCmd from "./src/commands/env.js";
envCmd(program);
import logsCmd from "./src/commands/logs.js";
logsCmd(program);
import rollbackCmd from "./src/commands/rollback.js";
rollbackCmd(program);
import renameCmd from "./src/commands/rename.js";
renameCmd(program);
import createCmd from "./src/commands/create.js";
createCmd(program);
import infoCmd from "./src/commands/info.js";
infoCmd(program);
import domainsCmd from "./src/commands/domains.js";
domainsCmd(program);
import openCmd from "./src/commands/open.js";
openCmd(program);

// Parse the arguments passed by the user in the terminal
program.parse(process.argv)
