#!/usr/bin/env node
// High-severity vulnerability gate with an explicit, reviewed allowlist.
//
// `npm audit --audit-level=high --omit=dev` still reports two high findings that
// cannot be fixed without breaking a shipped feature:
//
//   zod  <4.6.6        GHSA-mrhx-c7xc-m3w5  memory exhaustion in constrained collections
//   @imgly/background-removal >=1.2.0       flagged only because it pins zod ^3.23.8
//
// @imgly has no release on a patched zod, and its published dist bundles zod
// inline (`dist/index.{mjs,cjs}` import nothing named "zod"), so the vulnerable
// nested copy is never loaded at runtime. Downgrading to 1.1.5 (npm's suggested
// "fix") would drop the shipped background-removal build.
//
// Policy: any high/critical advisory NOT listed below fails the gate. Every
// entry names its advisory and the reason it is tolerated, so a new advisory
// cannot ride in on an old allowlist line.
//
// usage: node scripts/security-audit.mjs [--json]

import { execFileSync } from "node:child_process";

const ALLOWED = [
  {
    package: "zod",
    advisory: "GHSA-mrhx-c7xc-m3w5",
    reason:
      "transitive zod@3.25.76 nested under @imgly/background-removal; that dist bundles zod inline and never imports the package, so the code path is unreachable",
  },
  {
    package: "@imgly/background-removal",
    advisory: "GHSA-mrhx-c7xc-m3w5",
    reason:
      "flagged only via its zod pin; upstream has no patched release and downgrading removes the shipped feature",
  },
];

const json = process.argv.includes("--json");

let raw;
try {
  raw = execFileSync("npm", ["audit", "--audit-level=high", "--omit=dev", "--json"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
} catch (err) {
  // npm audit exits 1 when it finds anything, and its JSON still lands on stdout.
  raw = err.stdout;
}

let report;
try {
  report = JSON.parse(raw ?? "");
} catch {
  console.error("✖ security-audit: could not parse npm audit output");
  process.exit(2);
}

const vulns = report.vulnerabilities ?? {};
const allowedByPackage = new Map(ALLOWED.map((entry) => [entry.package, entry]));

const findings = [];
for (const [name, vuln] of Object.entries(vulns)) {
  if (!["high", "critical"].includes(vuln.severity)) continue;
  const advisories = (vuln.via ?? []).filter((v) => typeof v === "object");
  const allowed = allowedByPackage.get(name);

  // A package can also be listed only because something it depends on is
  // vulnerable (`via` holds the dependency name as a bare string). Those rows
  // are covered by the advisory on the dependency itself, so resolve them
  // through that entry instead of failing on the aggregate row.
  const viaDependencies = (vuln.via ?? []).filter((v) => typeof v === "string");
  const allowedViaDependency =
    viaDependencies.length > 0 && viaDependencies.every((dep) => allowedByPackage.has(dep));

  if (allowed && advisories.some((a) => a.url?.endsWith(allowed.advisory))) {
    findings.push({ name, severity: vuln.severity, status: "allowed", reason: allowed.reason });
    continue;
  }
  if (allowedViaDependency) {
    findings.push({ name, severity: vuln.severity, status: "allowed", reason: allowed.reason });
    continue;
  }

  findings.push({
    name,
    severity: vuln.severity,
    status: "blocked",
    titles: advisories.map((a) => `${a.title ?? "advisory"} ${a.url ?? ""}`.trim()),
  });
}

const blocked = findings.filter((f) => f.status === "blocked");
const allowed = findings.filter((f) => f.status === "allowed");

if (json) {
  console.log(JSON.stringify({ blocked, allowed }, null, 2));
} else {
  for (const entry of findings) {
    if (entry.status === "allowed") {
      console.log(`ALLOW ${entry.severity.padEnd(8)} ${entry.name}\n      ${entry.reason}`);
    } else {
      console.log(`BLOCK ${entry.severity.padEnd(8)} ${entry.name}`);
      for (const title of entry.titles) console.log(`      ${title}`);
    }
  }
}

if (blocked.length) {
  console.error(
    `\n✖ security-audit: ${blocked.length} high/critical advisor${blocked.length === 1 ? "y" : "ies"} not in the allowlist`,
  );
  process.exit(1);
}

console.log(
  `\n✓ security-audit: no unlisted high/critical advisories (${allowed.length} allowlisted, each with a documented reason)`,
);
