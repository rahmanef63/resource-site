import { site } from "./content/site";

type Inputs = {
  layoutSlug?: string;
  layoutTitle?: string;
  recipeSlugs?: string[];
  recipeTitles?: string[];
  projectName?: string;
  /** Folders to pull for this template (passed to degit / sparse-checkout). */
  pullPaths?: string[];
  /** Selected highlight files (rendered as a checklist for the agent). */
  files?: string[];
  /** npm packages this template needs. */
  dependencies?: string[];
  /** Free-form recipe text from the layout entry. */
  agentRecipe?: string;
};

const REPO_OWNER = "rahmanef63";
const REPO_NAME = "resource-site";
const REPO_BRANCH = "main";

export function buildAgentPrompt({
  layoutSlug,
  layoutTitle,
  recipeSlugs = [],
  recipeTitles = [],
  projectName = "my-app",
  pullPaths = [],
  files = [],
  dependencies = [],
  agentRecipe,
}: Inputs): string {
  const lines: string[] = [];
  const title = layoutTitle ?? layoutSlug ?? "Rahman Resource";

  lines.push(`# Scaffold "${title}" into ${projectName}`);
  lines.push("");
  lines.push(
    `Pull only the folders + files listed below from \`${REPO_OWNER}/${REPO_NAME}\`. Do not clone the whole repo.`,
  );
  lines.push("");
  lines.push(`📚 Knowledge base: ${site.url}/llms.txt`);
  lines.push(`📦 Source repo:    ${site.repo}`);
  if (layoutSlug) {
    lines.push(`🎯 Template page:  ${site.url}/layouts/${layoutSlug}`);
    lines.push(
      `🧠 Knowledge JSON: ${site.url}/api/knowledge?layout=${layoutSlug}`,
    );
  }
  lines.push("");

  if (pullPaths.length === 0 && layoutSlug) {
    pullPaths = [`cookbook/layouts/${layoutSlug}`];
  }

  // Step 1 — pull explicit folders
  lines.push(`## 1. Pull only these folders`);
  lines.push("");
  lines.push("Option A — `rahman-resources` CLI (recommended, auto-installs deps):");
  lines.push("```bash");
  lines.push(`npx rahman-resources add ${layoutSlug ?? "<slug>"} ${projectName}`);
  lines.push("```");
  lines.push("");
  lines.push("Option B — degit (no .git history, fastest manual path):");
  lines.push("```bash");
  for (const p of pullPaths) {
    lines.push(
      `npx tiged --force ${REPO_OWNER}/${REPO_NAME}/${p}#${REPO_BRANCH} ${projectName}/${p}`,
    );
  }
  lines.push("```");
  lines.push("");
  lines.push("Option C — git sparse-checkout (keeps history, single clone):");
  lines.push("```bash");
  lines.push(
    `git clone --filter=blob:none --sparse --branch ${REPO_BRANCH} https://github.com/${REPO_OWNER}/${REPO_NAME}.git _tmp-${REPO_NAME}`,
  );
  lines.push(`cd _tmp-${REPO_NAME}`);
  lines.push(`git sparse-checkout init --cone`);
  lines.push(`git sparse-checkout set ${pullPaths.join(" ")}`);
  lines.push(`cd ..`);
  for (const p of pullPaths) {
    const dest = `${projectName}/${p}`;
    const destDir = dest.includes("/")
      ? dest.substring(0, dest.lastIndexOf("/"))
      : ".";
    lines.push(`mkdir -p ${destDir} && cp -r _tmp-${REPO_NAME}/${p} ${dest}`);
  }
  lines.push(`rm -rf _tmp-${REPO_NAME}`);
  lines.push("```");
  lines.push("");

  // Step 2 — verify files
  if (files.length > 0) {
    lines.push(`## 2. Verify these files landed`);
    lines.push("");
    for (const f of files) {
      lines.push(`- [ ] ${projectName}/${f}`);
    }
    lines.push("");
  }

  // Step 3 — install deps
  if (dependencies.length > 0) {
    lines.push(`## ${files.length > 0 ? "3" : "2"}. Install dependencies`);
    lines.push("");
    lines.push("```bash");
    lines.push(`cd ${projectName}`);
    lines.push(`pnpm add ${dependencies.join(" ")}`);
    lines.push("```");
    lines.push("");
  }

  // Optional recipes
  if (recipeSlugs.length > 0) {
    const stepNo = (files.length > 0 ? 3 : 2) + (dependencies.length > 0 ? 1 : 0);
    lines.push(`## ${stepNo}. Add recipes on top`);
    lines.push("");
    for (const [i, slug] of recipeSlugs.entries()) {
      const t = recipeTitles[i] ?? slug;
      lines.push(`- ${t} — ${site.url}/recipes/${slug}`);
      lines.push(
        `  \`npx tiged --force ${REPO_OWNER}/${REPO_NAME}/cookbook/recipes/${slug}#${REPO_BRANCH} ${projectName}/cookbook/recipes/${slug}\``,
      );
    }
    lines.push("");
  }

  // Step N — wire into project
  const wireStep =
    2 +
    (files.length > 0 ? 1 : 0) +
    (dependencies.length > 0 ? 1 : 0) +
    (recipeSlugs.length > 0 ? 1 : 0);
  lines.push(`## ${wireStep}. Wire it up`);
  lines.push("");
  if (agentRecipe) {
    lines.push(agentRecipe);
    lines.push("");
  }
  lines.push(
    "Adjust path aliases in `tsconfig.json` so imports resolve (`@/*` → project root).",
  );
  lines.push(
    "Read `CLAUDE.md` of the source repo for hard rules (no Clerk, shadcn-only, copy-first, Next 16 + @convex-dev/auth).",
  );
  lines.push("");

  return lines.join("\n");
}
