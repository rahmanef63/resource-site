// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  addDependenciesSpec,
  detectPackageManager,
  installAllSpec,
  packageExecutor,
  runScriptText,
} from "./package-manager.mjs";

const dirs = [];
const temp = () => { const d = mkdtempSync(path.join(tmpdir(), "rr-pm-")); dirs.push(d); return d; };
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

describe("package manager contract", () => {
  it("recognizes modern and legacy Bun lockfiles", () => {
    const modern = temp(); writeFileSync(path.join(modern, "bun.lock"), "");
    const legacy = temp(); writeFileSync(path.join(legacy, "bun.lockb"), "");
    expect(detectPackageManager(modern)).toBe("bun");
    expect(detectPackageManager(legacy)).toBe("bun");
  });
  it("prefers explicit/packageManager declarations before lockfiles", () => {
    const d = temp();
    writeFileSync(path.join(d, "package.json"), JSON.stringify({ packageManager: "bun@1.4.2" }));
    writeFileSync(path.join(d, "package-lock.json"), "{}");
    expect(detectPackageManager(d)).toBe("bun");
    expect(detectPackageManager(d, "npm")).toBe("npm");
  });
  it("emits truthful npm and Bun commands", () => {
    expect(packageExecutor("npm")).toBe("npx");
    expect(packageExecutor("bun")).toBe("bunx");
    expect(installAllSpec("npm")).toEqual({ cmd: "npm", args: ["install", "--legacy-peer-deps", "--include=dev"] });
    expect(installAllSpec("bun")).toEqual({ cmd: "bun", args: ["install"] });
    expect(addDependenciesSpec("bun", ["svelte"])).toEqual({ cmd: "bun", args: ["add", "svelte"] });
    expect(runScriptText("bun", "dev")).toBe("bun run dev");
  });
});
