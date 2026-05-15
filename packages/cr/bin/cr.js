#!/usr/bin/env node
// rahman-cr — VPS Control Room installer
// Usage:
//   npx rahman-cr init                   interactive wizard
//   npx rahman-cr ai <claude|codex|gemini>
//   npx rahman-cr install --vps user@ip --domain <d> [--tailscale-key tskey-...]
//   npx rahman-cr doctor

import kleur from "kleur";

import { runInit } from "../src/commands/init.mjs";
import { runAi } from "../src/commands/ai.mjs";
import { runInstall } from "../src/commands/install.mjs";
import { runDoctor } from "../src/commands/doctor.mjs";
import { printHelp, printVersion } from "../src/lib/help.mjs";

const [, , cmd, ...rest] = process.argv;

main().catch((err) => {
  console.error(kleur.red("✖"), err?.message ?? err);
  process.exit(1);
});

async function main() {
  switch (cmd) {
    case "init":
    case "create":
    case "wizard":
      return runInit(rest);
    case "ai":
    case "prompt":
      return runAi(rest);
    case "install":
    case "deploy":
      return runInstall(rest);
    case "doctor":
    case "check":
      return runDoctor(rest);
    case "-v":
    case "--version":
    case "version":
      return printVersion();
    case undefined:
    case "-h":
    case "--help":
    case "help":
      return printHelp();
    default:
      console.error(kleur.red(`Unknown command: ${cmd}`));
      printHelp();
      process.exit(1);
  }
}
