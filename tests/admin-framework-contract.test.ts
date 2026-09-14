// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";
import {
  normalizeActiveSection,
  readSectionFromSearch,
  sectionHref,
} from "../frontend/slices/admin/variants/console/lib/section-core";
import { ADMIN_CONSOLE_SECTIONS } from "../frontend/slices/admin/variants/console/lib/sections";

const root = process.cwd();
const targets: string[] = [];
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-admin-"));
  targets.push(dir);
  return dir;
}

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

function filesUnder(dir: string, suffix?: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) out.push(...filesUnder(file, suffix));
    else if (!suffix || name.endsWith(suffix)) out.push(file);
  }
  return out;
}

afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("admin framework distribution", () => {
  it("keeps React default and declares native Svelte over shared admin cores", () => {
    const slice = JSON.parse(read("frontend/slices/admin/slice.json"));
    expect(slice.version).toBe("0.4.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/admin-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
    expect(slice.variants.items.find((v: { id: string }) => v.id === "shell").convex).toEqual([
      "convex/features/admin",
    ]);
    expect(slice.variants.items.find((v: { id: string }) => v.id === "console").convex).toEqual([
      "convex/features/admin_console",
    ]);
  });

  it("keeps renderer-specific React dependencies out of Svelte", () => {
    const dir = path.join(root, "frontend/slices/admin-svelte");
    const joined = filesUnder(dir)
      .filter((file) => /\.(svelte|ts)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const bad of [
      'from "react"',
      'from "next',
      "lucide-react",
      "@/components/ui/",
      "shared/agentic",
    ]) expect(joined).not.toContain(bad);
  });

  it("compiles every Svelte shell/console surface client+server without warnings", () => {
    for (const filename of filesUnder(path.join(root, "frontend/slices/admin-svelte"), ".svelte")) {
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("shares deterministic section deep-link semantics", () => {
    expect(normalizeActiveSection(ADMIN_CONSOLE_SECTIONS, "leads")).toBe("leads");
    expect(normalizeActiveSection(ADMIN_CONSOLE_SECTIONS, "missing")).toBe("overview");
    expect(readSectionFromSearch("?foo=1&section=audit-log")).toBe("audit-log");
    expect(sectionHref("https://example.test/admin?foo=1#x", "leads")).toBe("/admin?foo=1&section=leads#x");
  });

  it("preserves per-variant Convex/env gating for explicit SvelteKit", () => {
    const cases = [
      ["shell", "convex/features/admin", "SUPER_ADMIN_EMAIL", "convex/features/admin_console", "PLATFORM_ADMIN_EMAILS"],
      ["console", "convex/features/admin_console", "PLATFORM_ADMIN_EMAILS", "convex/features/admin", "SUPER_ADMIN_EMAIL"],
    ] as const;
    for (const [variant, convex, env, otherConvex, otherEnv] of cases) {
      const result = runCli("add", "admin", variant, "--framework", "sveltekit", "--target", target(), "--dry-run");
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`frontend/slices/admin-svelte/variants/${variant} → frontend/slices/admin-svelte`);
      expect(result.stdout).toContain(convex);
      expect(result.stdout).not.toContain(`  ${otherConvex} → ${otherConvex}`);
      expect(result.stdout).toContain(env);
      expect(result.stdout).not.toContain(otherEnv);
      expect(result.stdout).toContain("svelte@^5");
      expect(result.stdout).not.toContain("lucide-react");
      expect(result.stdout).not.toContain("shadcn:");
    }
  });

  it("keeps existing React variant routing and backend gates unchanged", () => {
    for (const [variant, convex, otherConvex] of [
      ["shell", "convex/features/admin", "convex/features/admin_console"],
      ["console", "convex/features/admin_console", "convex/features/admin"],
    ] as const) {
      const result = runCli("add", "admin", variant, "--target", target(), "--dry-run");
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`frontend/slices/admin/variants/${variant} → frontend/slices/admin`);
      expect(result.stdout).toContain(convex);
      expect(result.stdout).not.toContain(`  ${otherConvex} → ${otherConvex}`);
      expect(result.stdout).toContain("lucide-react@^0.400.0");
      expect(result.stdout).toContain("shadcn:");
    }
  });
});
