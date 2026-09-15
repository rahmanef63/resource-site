// Build the npx commands the Bundle Builder displays for copy.
//
// The "mode" is inferred from the chosen template:
//   - sel.template === EXISTING_PROJECT_SLUG → user already has an rr.json
//     project; we emit `add` / `add-skill` commands to extend it.
//   - any other template → fresh scaffold via `init`.

import type { BuildSelection } from "./types";
import { slices as sliceCatalog } from "@/lib/content/slices";
import { getFrameworkProfile, rrExec } from "@/lib/content/framework-matrix";

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
  const { project, template, features, slices: selectedSlices, skills } = sel;
  const app = sanitize(project.appName) || "my-app";
  const runner = rrExec(project.packageManager);
  const framework = getFrameworkProfile(project.framework);
  const parts = [`${runner} rahman-resources@latest init ${app}`, `--framework ${framework.cliValue}`, `--package-manager ${project.packageManager}`];
  if (template && template !== EXISTING_PROJECT_SLUG) parts.push(`--template ${template}`);
  if (features.length) parts.push(`--features ${features.join(",")}`);
  if (skills.length) parts.push(`--skills ${skills.join(",")}`);
  const lines = [parts.join(" \\\n  ")];

  // Slices land via separate `add` calls AFTER init (peer-aware order).
  const ordered = topoSortSlices(selectedSlices);
  if (ordered.length > 0) {
    lines.push("");
    lines.push(`cd ${app}`);
    for (const slug of ordered) {
      const fw = project.framework === "svelte-sveltekit" ? " --framework sveltekit" : "";
      lines.push(`${runner} rahman-resources@latest add ${slug}${fw} --package-manager ${project.packageManager}`);
    }
  }

  return { heading: "One-shot scaffold", script: lines.join("\n") };
}

/** Peer-aware ordering — slices with peers come AFTER their peers. */
function topoSortSlices(slugs: string[]): string[] {
  const map = new Map(sliceCatalog.map((s) => [s.slug, s]));
  const ordered: string[] = [];
  const seen = new Set<string>();
  function visit(slug: string) {
    if (seen.has(slug)) return;
    seen.add(slug);
    const s = map.get(slug);
    if (!s) return;
    for (const p of s.peers ?? []) {
      if (map.has(p.slug)) visit(p.slug);
    }
    ordered.push(slug);
  }
  for (const slug of slugs) visit(slug);
  return ordered;
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
  if (sel.slices.length) lines.push(`Slices: ${sel.slices.join(", ")}`);
  if (sel.skills.length) lines.push(`Claude Skills: ${sel.skills.join(", ")}`);
  lines.push(`Framework: ${getFrameworkProfile(sel.project.framework).accent}`);
  lines.push(`Package manager: ${sel.project.packageManager}`);
  if (sel.project.brandName) lines.push(`Brand: ${sel.project.brandName}`);
  if (sel.project.ownerEmail) lines.push(`Owner email: ${sel.project.ownerEmail}`);
  lines.push("", "Run:");
  lines.push("```bash");
  lines.push(buildInitCommand(sel).script);
  lines.push("```");
  return { heading: "Agent brief", script: lines.join("\n") };
}

type ParsedRrLike = {
  framework?: string;
  packageManager?: string;
  template?: { slug: string };
  features?: { slug: string }[];
  slices?: { slug: string }[];
  skills?: { slug: string }[];
} | null | undefined;

/**
 * Add-commands script for an existing rr.json project. Diffs the user's
 * selection against an uploaded rr.json so we only emit commands for the
 * NEW additions (no-ops are skipped).
 */
export function buildAddCommands(sel: BuildSelection, parsedRr?: ParsedRrLike): CommandBlock {
  const runner = rrExec(sel.project.packageManager);
  const frameworkArg = sel.project.framework === "svelte-sveltekit" ? " --framework sveltekit" : "";
  const pmArg = ` --package-manager ${sel.project.packageManager}`;
  const haveTemplate = parsedRr?.template?.slug;
  const haveFeatures = new Set((parsedRr?.features ?? []).map((f) => f.slug));
  const haveSlices = new Set((parsedRr?.slices ?? []).map((s) => s.slug));
  const haveSkills = new Set((parsedRr?.skills ?? []).map((s) => s.slug));

  const lines: string[] = [
    "# Run from inside an existing rr.json project (root of your app).",
    "# Each command patches rr.json + installs into the right slice folder.",
  ];

  // Picking a real template here means "promote my existing project to use this layout".
  // (Assumes the project hasn't already declared one.)
  // We never emit "add _existing" — that's the sentinel, not a slug.
  if (sel.template && sel.template !== EXISTING_PROJECT_SLUG && !haveTemplate) {
    lines.push(`${runner} rahman-resources@latest add ${sel.template}${pmArg}`);
  }
  for (const f of sel.features) {
    if (!haveFeatures.has(f)) lines.push(`${runner} rahman-resources@latest add ${f}${pmArg}`);
  }
  // Slices in peer-aware order, only the missing ones.
  const missingSlices = topoSortSlices(sel.slices.filter((s) => !haveSlices.has(s)));
  for (const slug of missingSlices) {
    lines.push(`${runner} rahman-resources@latest add ${slug}${frameworkArg}${pmArg}`);
  }
  for (const s of sel.skills) {
    if (!haveSkills.has(s)) lines.push(`${runner} rahman-resources@latest add-skill ${s}`);
  }
  if (lines.length === 2) lines.push("# (no new items selected — your rr.json already covers them)");
  return { heading: "Add to existing project", script: lines.join("\n") };
}

function sanitize(s: string) {
  return s.trim().replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}
