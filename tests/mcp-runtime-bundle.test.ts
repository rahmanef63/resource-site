// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const temps: string[] = [];
afterEach(() => { for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true }); });

describe("standalone MCP runtime bundle", () => {
  it("loads the catalog without a sibling CLI or rahman-resources dependency", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "rr-mcp-runtime-"));
    temps.push(dir);
    cpSync("packages/mcp/src", path.join(dir, "src"), { recursive: true });
    cpSync("packages/mcp/runtime", path.join(dir, "runtime"), { recursive: true });
    writeFileSync(path.join(dir, "package.json"), '{"type":"module"}\n');
    const loader = await import(`${pathToFileURL(path.join(dir, "src/data-loader.mjs")).href}?t=${Date.now()}`);
    expect(loader.getManifest().features.length).toBeGreaterThan(0);
    expect(loader.getSkills().skills.length).toBeGreaterThan(0);
    expect(loader.getInfrastructureResources().resourceClass).toBe("infrastructure");
  });

  it("ships the generated runtime directory and keeps Docker independent from the CLI npm package", () => {
    const pkg = JSON.parse(readFileSync("packages/mcp/package.json", "utf8"));
    const dockerfile = readFileSync("packages/mcp/Dockerfile", "utf8");
    expect(pkg.dependencies["rahman-resources"]).toBeUndefined();
    expect(pkg.files).toContain("runtime");
    expect(dockerfile).toContain("COPY runtime ./runtime");
    expect(dockerfile).not.toContain("npm install rahman-resources");
  });
});
