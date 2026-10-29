// convex-fallback.test.mjs — `rr init` must leave a project that typechecks
// with zero Convex credentials. Scaffolds with --no-install into a temp dir
// and asserts the types-only `convex/_generated` stubs land, plus the starter
// package.json script/dependency contract.
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { writeConvexFallback } from "./convex-fallback.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "../bin/cli.js");
const STARTER_PKG = path.resolve(__dirname, "starter/_package.json");

const dirs = [];
afterAll(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

function scaffold() {
  const root = mkdtempSync(path.join(tmpdir(), "rr-init-"));
  dirs.push(root);
  const r = spawnSync("node", [CLI, "init", "my-app", "--no-install"], {
    cwd: root,
    encoding: "utf8",
  });
  return { project: path.join(root, "my-app"), r };
}

// The end-to-end case spawns the real CLI, which imports kleur + tiged.
// Both are declared in the root devDependencies, so a normal `npm ci` makes
// this run; the guard stays so a partial install skips loudly instead of
// failing with a misleading ERR_MODULE_NOT_FOUND.
const CLI_DEPS_PRESENT = ["kleur", "tiged"].every((dep) =>
  [path.resolve(__dirname, "../node_modules", dep), path.resolve(__dirname, "../../../node_modules", dep)].some(existsSync),
);

describe("rr init — offline convex fallback", () => {
  it.skipIf(!CLI_DEPS_PRESENT)("writes types-only convex/_generated stubs on a bare scaffold", () => {
    const { project, r } = scaffold();
    expect(r.status, r.stderr).toBe(0);
    for (const f of ["server.d.ts", "api.d.ts", "dataModel.d.ts"]) {
      const p = path.join(project, "convex/_generated", f);
      expect(existsSync(p), p).toBe(true);
    }
    const server = readFileSync(path.join(project, "convex/_generated/server.d.ts"), "utf8");
    expect(server).toContain("export declare function query");
    expect(r.stdout).toContain("convex/_generated stubs written");
  });

  it("fallback writes only missing files", () => {
    const root = mkdtempSync(path.join(tmpdir(), "rr-fb-"));
    dirs.push(root);
    const convex = path.join(root, "convex");
    expect(writeConvexFallback(convex)).toHaveLength(3);
    expect(writeConvexFallback(convex)).toHaveLength(0);
  });

  it("starter scripts survive Next 16 (eslint ., smoke file present)", () => {
    const pkg = JSON.parse(readFileSync(STARTER_PKG, "utf8"));
    expect(pkg.scripts.lint).toBe("eslint .");
    expect(existsSync(path.resolve(__dirname, "starter/eslint.config.mjs"))).toBe(true);
    expect(existsSync(path.resolve(__dirname, "starter/scripts/smoke-test.mjs"))).toBe(true);
  });

  it("starter dependency floors keep patched auth ranges", () => {
    const pkg = JSON.parse(readFileSync(STARTER_PKG, "utf8"));
    expect(pkg.dependencies["@convex-dev/auth"]).not.toBe("^0.0.84");
    const minor = Number(pkg.dependencies["@auth/core"].replace(/[^\d.]/g, "").split(".")[1]);
    expect(minor).toBeGreaterThanOrEqual(41);
  });
});
