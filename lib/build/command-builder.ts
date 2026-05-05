// Build the npx commands the Bundle Builder displays for copy.
//
// The "mode" is inferred from the chosen template:
//   - sel.template === EXISTING_PROJECT_SLUG → user already has an rr.json
//     project; we emit `add` / `add-skill` commands to extend it.
//   - any other template → fresh scaffold via `init`.

import type { BuildSelection } from "./types";

export type CommandBlock = {
  /** Heading shown above the code block. */
  heading: string;
  /** Multi-line shell script. */
  script: string;
};

/** Sentinel template slug for "I already have an rr.json project". */
export const EXISTING_PROJECT_SLUG = "_existing";

export function isExistingMode(sel: BuildSelection): boolean {
  return sel.template === EXISTING_PROJECT_SLUG;
}

/** Build the appropriate command blocks for the current selection. */
export function buildCommands(sel: BuildSelection, parsedRr?: ParsedRrLike): CommandBlock[] {
  return isExistingMode(sel)
    ? [buildAddCommands(sel, parsedRr)]
    : [buildInitCommand(sel), buildAgentPrompt(sel)];
}

export function buildInitCommand(sel: BuildSelection): CommandBlock {
  const { project, template, features, skills } = sel;
  const app = sanitize(project.appName) || "my-app";
  const parts = [`npx rahman-resources@latest init ${app}`];
  if (template && template !== EXISTING_PROJECT_SLUG) parts.push(`--template ${template}`);
  if (features.length) parts.push(`--features ${features.join(",")}`);
  if (skills.length) parts.push(`--skills ${skills.join(",")}`);
  const script = parts.join(" \\\n  ");
  return { heading: "One-shot scaffold", script };
}

export function buildAgentPrompt(sel: BuildSelection): CommandBlock {
  const lines: string[] = [
    "# Agent brief — paste into Claude Code / Cursor / agent of choice",
    "",
    "Source repo: https://github.com/rahmanef63/resource-site",
    "",
  ];
  if (sel.template && sel.template !== EXISTING_PROJECT_SLUG) lines.push(`Template: ${sel.template}`);
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

type ParsedRrLike = {
  template?: { slug: string };
  features?: { slug: string }[];
  skills?: { slug: string }[];
} | null | undefined;

/**
 * Add-commands script for an existing rr.json project. Diffs the user's
 * selection against an uploaded rr.json so we only emit commands for the
 * NEW additions (no-ops are skipped).
 */
export function buildAddCommands(sel: BuildSelection, parsedRr?: ParsedRrLike): CommandBlock {
  const haveTemplate = parsedRr?.template?.slug;
  const haveFeatures = new Set((parsedRr?.features ?? []).map((f) => f.slug));
  const haveSkills = new Set((parsedRr?.skills ?? []).map((s) => s.slug));

  const lines: string[] = [
    "# Run from inside an existing rr.json project (root of your app).",
    "# Each command patches rr.json + installs into the right slice folder.",
  ];

  // Picking a real template here means "promote my existing project to use this layout".
  // (Assumes the project hasn't already declared one.)
  // We never emit "add _existing" — that's the sentinel, not a slug.
  if (sel.template && sel.template !== EXISTING_PROJECT_SLUG && !haveTemplate) {
    lines.push(`npx rahman-resources@latest add ${sel.template}`);
  }
  for (const f of sel.features) {
    if (!haveFeatures.has(f)) lines.push(`npx rahman-resources@latest add ${f}`);
  }
  for (const s of sel.skills) {
    if (!haveSkills.has(s)) lines.push(`npx rahman-resources@latest add-skill ${s}`);
  }
  if (lines.length === 2) lines.push("# (no new items selected — your rr.json already covers them)");
  return { heading: "Add to existing project", script: lines.join("\n") };
}

function sanitize(s: string) {
  return s.trim().replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}
