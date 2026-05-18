import { layouts } from "@/lib/content/layouts";
import { features, stack } from "@/lib/content/sections";
import { site } from "@/lib/content/site";
import { slices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";

async function buildBody() {
  "use cache";
  const visibleLayouts = layouts.filter((l) => !isHidden(l.slug));
  const visibleSlices = slices.filter((s) => !isHidden(s.slug));
  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push("");
  lines.push(`> ${site.description}`);
  lines.push("");
  lines.push(`Site: ${site.url}`);
  lines.push(`Repo: ${site.repo}`);
  lines.push(`Author: ${site.author} (${site.authorUrl})`);
  lines.push("");
  lines.push("## Stack");
  lines.push("");
  for (const s of stack) lines.push(`- [${s.name}](${s.url})`);
  lines.push("");
  lines.push("## What's in the box");
  lines.push("");
  for (const f of features) lines.push(`- **${f.title}**: ${f.description}`);
  lines.push("");
  lines.push("## Layouts");
  lines.push("");
  for (const l of visibleLayouts) {
    lines.push(`### ${l.title}`);
    lines.push(`- slug: \`${l.slug}\`  category: \`${l.category}\`  source: ${l.source}`);
    lines.push(`- ${l.description}`);
    lines.push(`- repo path: \`${l.repoPath}\``);
    lines.push(`- primary file: \`${l.primaryFile}\``);
    lines.push(`- detail: ${site.url}/layouts/${l.slug}`);
    lines.push(`- agent recipe: ${l.agentRecipe}`);
    lines.push("");
  }
  lines.push("## Slices");
  lines.push("");
  lines.push(
    "Drop-in vertical features. Each ships the metadata trio (`slice.json` + `slice.contract.ts` + `slice.manifest.json`). Install with `npx rr add <slug>` — CLI auto-augments env, installs deps, and copies into `frontend/slices/<slug>/` (+ optional `convex/features/<slug>/`).",
  );
  lines.push("");
  for (const s of visibleSlices) {
    lines.push(`### ${s.title}`);
    lines.push(`- slug: \`${s.slug}\`  kind: \`${s.kind}\`  category: \`${s.category}\``);
    lines.push(`- ${s.description}`);
    lines.push(`- install: \`npx rr add ${s.slug}\``);
    lines.push(`- detail: ${site.url}/slices/${s.slug}`);
    lines.push("");
  }
  lines.push("## Hard rules (12-rule doctrine — full text at /best-practice)");
  lines.push("");
  lines.push("- NO Clerk. Use @convex-dev/auth.");
  lines.push("- All UI = shadcn primitives. No raw HTML buttons / dialogs / native date/file inputs.");
  lines.push("- Copy-first flow. Never greenfield — copy from a source project, adjust imports.");
  lines.push("- Stack: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.");
  lines.push("- Next 16: use `proxy.ts` not `middleware.ts`; `next/link` + `next/image` only.");
  lines.push("- Workspace isolation per Convex query (`.withIndex('by_workspace', …)`).");
  lines.push("- No bare `.collect()` — use `.withIndex(...).take(N)` or paginate.");
  lines.push("- Every public mutation/query MUST declare `args:` validators + server-side authz (`requireUser`/`requireAdmin`).");
  lines.push("- RBAC + audit log on every mutation.");
  lines.push("- `NEXT_PUBLIC_*` only for non-sensitive values.");
  lines.push("- **File modularity: 200-line hard cap per source file** (excl. catalog/seed/_generated). Compose, don't accumulate. Gate: `npm run audit:file-size`.");
  lines.push("- Slice contract: `slice.json` + `slice.contract.ts` + `slice.manifest.json` mandatory per slice. Imports resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, or relative-within-slice.");
  lines.push("- Solo-dev: push direct to main (no PR); Dokploy auto-deploys on push.");
  lines.push("");
  lines.push("## How to install");
  lines.push("");
  lines.push("Fresh project (recommended):");
  lines.push("```");
  lines.push("npx rahman-resources init my-app   # or alias: npx rr init my-app");
  lines.push("cd my-app");
  lines.push("cp .env.example .env.local         # fill NEXT_PUBLIC_CONVEX_URL");
  lines.push("npm install --legacy-peer-deps");
  lines.push("npx convex dev --once              # generates convex/_generated");
  lines.push("npm run dev");
  lines.push("```");
  lines.push("");
  lines.push("Add a template or slice into an existing project:");
  lines.push("```");
  lines.push("npx rr add <slug>                  # auto-detects TEMPLATE vs SLICE,");
  lines.push("                                   # auto-augments .env.example,");
  lines.push("                                   # auto-installs npm deps");
  lines.push("```");
  lines.push("");
  lines.push("## Audit chain (run before deploy)");
  lines.push("```");
  lines.push("npm run validate:all               # full chain: slices + templates + file-size + manifests + contracts");
  lines.push("npm run audit:slices               # slice contract violations");
  lines.push("npm run audit:templates            # template scaffold violations");
  lines.push("npm run audit:file-size            # 200-line modularity cap");
  lines.push("```");
  lines.push("");
  lines.push("## Deploy (Dokploy via sc-all)");
  lines.push("```");
  lines.push("# Invoke the sc-all skill in Claude Code — orchestrates");
  lines.push("# sc-dokploy + sc-convex: creates repo, pushes, configures Dokploy,");
  lines.push("# deploys self-hosted Convex backend, sets DNS, triggers build.");
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

export async function GET() {
  const body = await buildBody();
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
