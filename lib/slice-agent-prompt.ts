import type { SliceEntry } from "./content/slices";
import type { LayoutEntry } from "./content/layouts";
import { site } from "./content/site";

/** Stripped @semver tail so display reads `next-themes` not `next-themes@^0.4`. */
function stripVer(spec: string): string {
  const at = spec.lastIndexOf("@");
  return at > 0 ? spec.slice(0, at) : spec;
}

/** Per-slice AI install prompt — copyable to Claude / Cursor / Codex.
 *  Lighter than the multi-step buildAgentPrompt: one slice = one
 *  `npx rr add` line + dep summary + agentRecipe verbatim. The CLI
 *  itself handles the actual file copy + env augmentation, so the
 *  prompt's job is to tell the agent WHY + WHAT TO WIRE after install. */
export function buildSliceAgentPrompt(slice: SliceEntry): string {
  const lines: string[] = [];
  lines.push(`# Install \`${slice.slug}\` — ${slice.title}`);
  lines.push("");
  lines.push(`> ${slice.tagline ?? slice.description.split(".")[0] + "."}`);
  lines.push("");
  lines.push(`📚 Knowledge base : ${site.url}/llms.txt`);
  lines.push(`📦 Slice detail   : ${site.url}/slices/${slice.slug}`);
  lines.push(`🧠 JSON catalog   : ${site.url}/api/knowledge?slice=${slice.slug}`);
  lines.push(`🔗 Source         : ${site.repo}/tree/main/${slice.slicePath}`);
  lines.push("");

  lines.push("## 1. Install");
  lines.push("");
  lines.push("```bash");
  lines.push(slice.install ?? `npx rahman-resources add ${slice.slug}`);
  lines.push("# alias: npx rr add " + slice.slug);
  lines.push("```");
  lines.push("");
  lines.push(
    `The CLI copies \`${slice.slicePath}/\` into your project + augments \`.env.example\` + installs npm deps automatically. Run it from your project root.`,
  );
  lines.push("");

  const npm = (slice.npm ?? []).filter(Boolean);
  const shadcn = (slice.shadcn ?? []).filter(Boolean);
  const peers = (slice.peers ?? []);
  const env = (slice.env ?? []);
  const convex = (slice.convexPaths ?? []).filter(Boolean);

  if (npm.length || shadcn.length || peers.length || env.length || convex.length) {
    lines.push("## 2. What it ships");
    lines.push("");
    if (npm.length) lines.push(`- npm: \`${npm.map(stripVer).join("\`, \`")}\``);
    if (shadcn.length) lines.push(`- shadcn primitives: \`${shadcn.join("\`, \`")}\``);
    if (peers.length) {
      lines.push("- peer slices (cascade install):");
      for (const p of peers) {
        lines.push(`  - \`${p.slug}\`${p.reason ? ` — ${p.reason}` : ""}`);
      }
    }
    if (env.length) {
      lines.push("- env vars:");
      for (const e of env) {
        lines.push(`  - \`${e.name}\` (${e.scope}${e.required ? ", required" : ""})${e.description ? ` — ${e.description}` : ""}`);
      }
    }
    if (convex.length) {
      lines.push(`- convex feature paths: \`${convex.join("\`, \`")}\``);
    }
    lines.push("");
  }

  if (slice.agentRecipe) {
    lines.push("## 3. Wire it up");
    lines.push("");
    lines.push(slice.agentRecipe);
    lines.push("");
  }

  lines.push("## Rules of engagement");
  lines.push("");
  lines.push("- shadcn-only UI primitives. No raw `<button>` / `<dialog>` / native date or file inputs.");
  lines.push("- 200-line hard cap per source file (extract neighbours when over).");
  lines.push("- All Convex queries hit an index (`.withIndex(...)`); never bare `.collect()`.");
  lines.push("- Public mutations/queries declare `args:` validators + authz.");
  lines.push("- Full ruleset: " + site.url + "/best-practice");
  lines.push("");

  return lines.join("\n");
}

/** Layout/template equivalent — reuses the full-fledged buildAgentPrompt
 *  scaffold for legacy compat (templates pull whole directories, not
 *  single slices). Re-exported here so detail pages have one import. */
export function buildLayoutAgentPrompt(layout: LayoutEntry): string {
  const lines: string[] = [];
  lines.push(`# Install template \`${layout.slug}\` — ${layout.title}`);
  lines.push("");
  lines.push(`> ${layout.description}`);
  lines.push("");
  lines.push(`📚 Knowledge base : ${site.url}/llms.txt`);
  lines.push(`🎯 Template page  : ${site.url}/layouts/${layout.slug}`);
  lines.push(`🧠 JSON catalog   : ${site.url}/api/knowledge?layout=${layout.slug}`);
  lines.push(`🔗 Source         : ${site.repo}/tree/main/${layout.repoPath}`);
  lines.push("");

  lines.push("## 1. Install");
  lines.push("");
  lines.push("```bash");
  lines.push(`npx rahman-resources add ${layout.slug}`);
  lines.push("```");
  lines.push("");

  if (layout.dependencies?.length) {
    lines.push("## 2. Dependencies");
    lines.push("");
    for (const d of layout.dependencies) lines.push(`- \`${d}\``);
    lines.push("");
  }

  if (layout.agentRecipe) {
    lines.push("## 3. Wire it up");
    lines.push("");
    lines.push(layout.agentRecipe);
    lines.push("");
  }

  lines.push("## Rules of engagement");
  lines.push("");
  lines.push("- shadcn-only UI primitives. 200-line cap per source file.");
  lines.push("- Full ruleset: " + site.url + "/best-practice");
  lines.push("");

  return lines.join("\n");
}
