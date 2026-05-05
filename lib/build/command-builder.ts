// Build the npx commands the Bundle Builder displays for copy.
//
// "new" mode → single `init` command with --template/--features/--skills.
// "existing" mode → multi-line script: `add <slug>` + `add-skill <slug>`.

import type { BuildSelection } from "./types";

export type CommandBlock = {
  /** Heading shown above the code block. */
  heading: string;
  /** Multi-line shell script. */
  script: string;
};

export function buildInitCommand(sel: BuildSelection): CommandBlock {
  const { project, template, features, skills } = sel;
  const app = sanitize(project.appName) || "my-app";
  const parts = [`npx rahman-resources@latest init ${app}`];
  if (template) parts.push(`--template ${template}`);
  if (features.length) parts.push(`--features ${features.join(",")}`);
  if (skills.length) parts.push(`--skills ${skills.join(",")}`);
  const script = parts.join(" \\\n  ");
  return { heading: "One-shot scaffold", script };
}

export function buildExistingCommands(sel: BuildSelection): CommandBlock {
  const lines: string[] = [
    "# Run from inside an existing rr.json project (root of your app).",
    "# Each command patches rr.json + installs into the right slice folder.",
  ];
  if (sel.template) lines.push(`npx rahman-resources@latest add ${sel.template}`);
  for (const f of sel.features) lines.push(`npx rahman-resources@latest add ${f}`);
  for (const s of sel.skills) lines.push(`npx rahman-resources@latest add-skill ${s}`);
  if (lines.length === 2) lines.push("# (no items selected)");
  return { heading: "Add to existing project", script: lines.join("\n") };
}

export function buildAgentPrompt(sel: BuildSelection): CommandBlock {
  const lines: string[] = [
    "# Agent brief — paste into Claude Code / Cursor / agent of choice",
    "",
    "Source repo: https://github.com/rahmanef63/resource-site",
    "",
  ];
  if (sel.template) lines.push(`Template: ${sel.template}`);
  if (sel.features.length) lines.push(`Features: ${sel.features.join(", ")}`);
  if (sel.skills.length) lines.push(`Claude Skills: ${sel.skills.join(", ")}`);
  if (sel.project.brandName) lines.push(`Brand: ${sel.project.brandName}`);
  if (sel.project.ownerEmail) lines.push(`Owner email: ${sel.project.ownerEmail}`);
  lines.push("", "Run:");
  lines.push("```bash");
  lines.push(buildInitCommand(sel).script);
  lines.push("```");
  return { heading: "Agent brief", script: lines.join("\n") };
}

function sanitize(s: string) {
  return s.trim().replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}
