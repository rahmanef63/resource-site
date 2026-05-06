#!/usr/bin/env node
// Strict validator — exits non-zero if any layout pullPath is missing on disk
// or if slugs collide. Use in CI before publishing the CLI.
//
// Run: node packages/cli/scripts/validate.mjs

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ps = spawn(
  process.execPath,
  [path.join(__dirname, "gen-manifest.mjs"), "--strict"],
  { stdio: "inherit" },
);
ps.on("exit", (code) => process.exit(code ?? 1));
