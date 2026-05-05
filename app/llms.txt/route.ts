import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { features, stack } from "@/lib/content/sections";
import { site } from "@/lib/content/site";

export function GET() {
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
  for (const l of layouts) {
    lines.push(`### ${l.title}`);
    lines.push(`- slug: \`${l.slug}\`  category: \`${l.category}\`  source: ${l.source}`);
    lines.push(`- ${l.description}`);
    lines.push(`- repo path: \`${l.repoPath}\``);
    lines.push(`- primary file: \`${l.primaryFile}\``);
    lines.push(`- detail: ${site.url}/layouts/${l.slug}`);
    lines.push(`- agent recipe: ${l.agentRecipe}`);
    lines.push("");
  }
  lines.push("## Recipes");
  lines.push("");
  for (const r of recipes) {
    lines.push(`### ${r.title}`);
    lines.push(`- slug: \`${r.slug}\`  source: ${r.source}`);
    lines.push(`- ${r.description}`);
    lines.push(`- repo path: \`${r.repoPath}\``);
    lines.push(`- files:`);
    for (const f of r.files) lines.push(`  - \`${f}\``);
    lines.push(`- detail: ${site.url}/recipes/${r.slug}`);
    lines.push(`- agent recipe: ${r.agentRecipe}`);
    lines.push("");
  }
  lines.push("## Hard rules");
  lines.push("");
  lines.push("- NO Clerk. Use @convex-dev/auth.");
  lines.push("- All UI = shadcn primitives. No raw HTML buttons / dialogs / native date/file inputs.");
  lines.push("- Copy-first flow. Never greenfield — copy from a source project, adjust imports.");
  lines.push("- Stack: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.");
  lines.push("- Workspace isolation per Convex query (`.withIndex('by_workspace', …)`).");
  lines.push("- RBAC + audit log on every mutation.");
  lines.push("- Commit `convex/_generated` before deploy.");
  lines.push("- audit-bp score ≥80 before deploy.");
  lines.push("");
  lines.push("## How to install");
  lines.push("");
  lines.push("Manual:");
  lines.push("```");
  lines.push(`git clone ${site.repo} && cd resources/template-base`);
  lines.push("pnpm install --yes --legacy-peer-deps");
  lines.push("npx convex dev --once && git add convex/_generated && git commit");
  lines.push("cp .env.example .env.local");
  lines.push("pnpm audit:bp -- --full");
  lines.push("pnpm dev");
  lines.push("```");
  lines.push("");
  lines.push("## Deploy (Dokploy via si-coder)");
  lines.push("```");
  lines.push("node $HOME/.agents/skills/si-coder/scripts/deploy.js \\");
  lines.push('  "$DOKPLOY_API_URL" "$DOKPLOY_API_KEY" \\');
  lines.push('  "<PROJECT>" "<APP>" "$GITHUB_TOKEN" "<DOMAIN>"');
  lines.push("```");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
