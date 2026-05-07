import fs from "node:fs";
import path from "node:path";

/**
 * Read the version field from a package.json at build time.
 *
 * Used by docs pages so version badges always match the repo state — no
 * hardcoded strings to forget on bump. Falls back to "?" if the file is
 * missing (e.g. running outside the monorepo).
 */
function readVersion(relativePath: string): string {
  try {
    const raw = fs.readFileSync(
      path.join(/* turbopackIgnore: true */ process.cwd(), relativePath),
      "utf-8",
    );
    return JSON.parse(raw).version ?? "?";
  } catch {
    return "?";
  }
}

export const PACKAGE_VERSIONS = {
  cli: readVersion("packages/cli/package.json"),
  mcp: readVersion("packages/mcp/package.json"),
} as const;
