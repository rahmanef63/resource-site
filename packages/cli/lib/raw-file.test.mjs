// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { isSafeRepoRelativeFile, pullRawFile, rawGithubUrl } from "./raw-file.mjs";

const dirs = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-raw-file-"));
  dirs.push(dir);
  return dir;
}

describe("raw shared-file pull", () => {
  it("accepts only safe repo-relative file paths", () => {
    expect(isSafeRepoRelativeFile("lib/shared/core.ts")).toBe(true);
    expect(isSafeRepoRelativeFile("../secret.txt")).toBe(false);
    expect(isSafeRepoRelativeFile("/etc/passwd")).toBe(false);
    expect(isSafeRepoRelativeFile("lib\\secret.ts")).toBe(false);
    expect(rawGithubUrl("owner/repo", "main", "lib/a b.ts")).toContain("lib/a%20b.ts");
  });

  it("writes one fetched file at the exact destination", async () => {
    const dest = path.join(tempDir(), "lib/shared/core.ts");
    await pullRawFile({
      repo: "owner/repo",
      branch: "main",
      repoPath: "lib/shared/core.ts",
      dest,
      fetchImpl: async () => new Response("export const ok = true;\n", { status: 200 }),
    });
    expect(readFileSync(dest, "utf8")).toBe("export const ok = true;\n");
  });

  it("does not create a destination when the remote file is missing", async () => {
    const dest = path.join(tempDir(), "lib/shared/missing.ts");
    await expect(pullRawFile({
      repo: "owner/repo",
      branch: "main",
      repoPath: "lib/shared/missing.ts",
      dest,
      fetchImpl: async () => new Response("missing", { status: 404 }),
    })).rejects.toThrow("HTTP 404");
    expect(existsSync(dest)).toBe(false);
  });
});
