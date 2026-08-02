// Builds the AI-assisted install prompt by composing:
//   - provider-specific anchor (Claude / Codex / Gemini)
//   - shared body (goal, phases, env vars to collect)
//   - API endpoint catalog
//   - skill reference (/sc-all)

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { catalogMarkdown } from "./api-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, "..", "prompts");

const VALID = new Set(["claude", "codex", "gemini"]);

export function buildPrompt(provider = "claude") {
  const slug = VALID.has(provider) ? provider : "claude";
  const header = readFileSync(path.join(PROMPTS_DIR, `${slug}.md`), "utf8");
  const body = readFileSync(path.join(PROMPTS_DIR, "shared.md"), "utf8");
  const catalog = catalogMarkdown();

  return [
    header.trim(),
    "",
    body.trim(),
    "",
    "## API endpoint catalog",
    catalog.trim(),
    "",
    "---",
    "End of prompt. Reply with your first question and I'll provide values.",
  ].join("\n");
}

export function providers() {
  return Array.from(VALID);
}
