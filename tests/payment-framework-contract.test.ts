// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";

const targets: string[] = [];
const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-payment-"));
  targets.push(dir);
  return dir;
}

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

function svelteSources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) out.push(...svelteSources(file));
    else if (name.endsWith(".svelte")) out.push(file);
  }
  return out;
}

afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("payment framework + provider distribution", () => {
  it("declares Svelte parity and provider-specific runtime deps in the slice SSOT", () => {
    const slice = JSON.parse(read("frontend/slices/payment/slice.json"));
    expect(slice.version).toBe("0.5.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/payment-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5", "@convex-dev/auth@^0.0.95"], shadcn: [] },
    });
    expect(slice.deps.npm).toEqual(["@convex-dev/auth@^0.0.95"]);
    expect(slice.deps.env).toEqual([]);
    expect(slice.deps.sharedFiles).not.toContain("convex/_shared/auth.ts");
    expect(slice.deps.sharedFiles).toContain("convex/_shared/crypto.ts");

    const doku = slice.variants.items.find((item: { id: string }) => item.id === "doku");
    const midtrans = slice.variants.items.find((item: { id: string }) => item.id === "midtrans");
    expect(doku.deps.npm).toEqual([]);
    expect(doku.deps.env.map((item: { name: string }) => item.name)).toEqual([
      "DOKU_CLIENT_ID",
      "DOKU_SECRET_KEY",
      "DOKU_IS_PRODUCTION",
      "DOKU_NOTIFY_PATH",
    ]);
    expect(doku.convex).toContain("convex/features/payment/actions/doku.ts");
    expect(doku.convex).not.toContain("convex/features/payment/actions/midtrans.ts");

    expect(midtrans.deps.npm).toEqual(["midtrans-client@^1.4.2"]);
    expect(midtrans.deps.env.map((item: { name: string }) => item.name)).toEqual([
      "MIDTRANS_SERVER_KEY",
      "MIDTRANS_CLIENT_KEY",
      "MIDTRANS_IS_PRODUCTION",
    ]);
    expect(midtrans.convex).toContain("convex/features/payment/actions/midtrans.ts");
    expect(midtrans.convex).not.toContain("convex/features/payment/actions/doku.ts");
  });

  it("keeps provider tools framework-neutral and Svelte free of React UI/runtime leakage", () => {
    const tools = read("frontend/slices/payment/lib/tools.ts");
    expect(tools).not.toContain("shared/agentic");
    expect(tools).toContain("dangerous: true");

    const dir = path.join(root, "frontend/slices/payment-svelte");
    const joined = [
      ...svelteSources(dir).map((file) => readFileSync(file, "utf8")),
      read("frontend/slices/payment-svelte/index.ts"),
      read("frontend/slices/payment-svelte/variants/doku/index.ts"),
      read("frontend/slices/payment-svelte/variants/midtrans/index.ts"),
    ].join("\n");
    for (const bad of [
      'from "react"',
      'from "next',
      "lucide-react",
      "@/components/ui/",
      "shared/agentic",
    ]) expect(joined).not.toContain(bad);
  });

  it("compiles every Svelte payment component client+server without warnings", () => {
    const dir = path.join(root, "frontend/slices/payment-svelte");
    for (const filename of svelteSources(dir)) {
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("installs React DOKU without Midtrans SDK/env/action", () => {
    const result = runCli("add", "payment", "doku", "--target", target(), "--dry-run");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("frontend/slices/payment/variants/doku → frontend/slices/payment");
    expect(result.stdout).toContain("convex/features/payment/actions/doku.ts →");
    expect(result.stdout).toContain("convex/_shared/crypto.ts →");
    expect(result.stdout).toContain("@convex-dev/auth@^0.0.95");
    expect(result.stdout).not.toContain("convex/_shared/auth.ts →");
    expect(result.stdout).toContain("DOKU_SECRET_KEY=…");
    expect(result.stdout).not.toContain("midtrans-client");
    expect(result.stdout).not.toContain("actions/midtrans.ts");
    expect(result.stdout).not.toContain("MIDTRANS_SERVER_KEY");
  });

  it("installs React Midtrans with only Midtrans runtime deps", () => {
    const result = runCli("add", "payment", "midtrans", "--target", target(), "--dry-run");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("frontend/slices/payment/variants/midtrans → frontend/slices/payment");
    expect(result.stdout).toContain("convex/features/payment/actions/midtrans.ts →");
    expect(result.stdout).toContain("@convex-dev/auth@^0.0.95");
    expect(result.stdout).toContain("midtrans-client@^1.4.2");
    expect(result.stdout).toContain("MIDTRANS_SERVER_KEY=…");
    expect(result.stdout).toContain("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=…");
    expect(result.stdout).not.toContain("actions/doku.ts");
    expect(result.stdout).not.toContain("DOKU_SECRET_KEY");
  });

  it("keeps Svelte provider installs renderer-clean while preserving provider deps", () => {
    const doku = runCli(
      "add", "payment", "doku", "--framework", "sveltekit", "--target", target(), "--dry-run",
    );
    expect(doku.status).toBe(0);
    expect(doku.stdout).toContain("frontend/slices/payment-svelte/variants/doku → frontend/slices/payment-svelte");
    expect(doku.stdout).toContain("npm: svelte@^5 @convex-dev/auth@^0.0.95");
    expect(doku.stdout).not.toContain("midtrans-client");
    expect(doku.stdout).not.toContain("shadcn:");
    expect(doku.stdout).not.toContain("MIDTRANS_SERVER_KEY");

    const midtrans = runCli(
      "add", "payment", "midtrans", "--framework", "sveltekit", "--target", target(), "--dry-run",
    );
    expect(midtrans.status).toBe(0);
    expect(midtrans.stdout).toContain("frontend/slices/payment-svelte/variants/midtrans → frontend/slices/payment-svelte");
    expect(midtrans.stdout).toContain("npm: svelte@^5 @convex-dev/auth@^0.0.95 midtrans-client@^1.4.2");
    expect(midtrans.stdout).not.toContain("shadcn:");
    expect(midtrans.stdout).not.toContain("DOKU_SECRET_KEY");
  });

  it("add-all keeps the union of provider runtime deps", () => {
    const result = runCli("add", "payment", "--target", target(), "--dry-run");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("convex/features/payment → convex/features/payment");
    expect(result.stdout).toContain("@convex-dev/auth@^0.0.95");
    expect(result.stdout).toContain("midtrans-client@^1.4.2");
    expect(result.stdout).toContain("DOKU_SECRET_KEY=…");
    expect(result.stdout).toContain("MIDTRANS_SERVER_KEY=…");
  });
});
