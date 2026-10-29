#!/usr/bin/env node
// Local mirror of the blocking CI gates (see .github/workflows/README.md).
// Runs each gate in order via `npm run <script>`, stops at the first failure,
// and exits with that failure's code. Node stdlib only, no deps.
//
// ponytail: does not replicate the template-base or CLI prepublish jobs —
// run those by hand (`cd template-base && npx tsc --noEmit`) when touching
// template-base/** or packages/cli/**. Add them here only if they start
// failing in review often enough to matter.

import { spawnSync } from "node:child_process";

const GATES = ["typecheck", "lint", "test", "slices:check", "build"];

for (const [i, gate] of GATES.entries()) {
  const label = `[${i + 1}/${GATES.length}] npm run ${gate}`;
  console.log(`\n=== ${label} ===`);
  const res = spawnSync("npm", ["run", gate], { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) {
    console.error(`\nFAILED: npm run ${gate} (exit ${res.status ?? "signal " + res.signal})`);
    process.exit(res.status ?? 1);
  }
}

console.log("\nAll local CI gates passed.");
