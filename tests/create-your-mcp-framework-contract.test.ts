// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const read = (file: string) => readFileSync(file, "utf8");
const slice = JSON.parse(read("frontend/slices/create-your-mcp/slice.json"));
const svelte = [
  read("frontend/slices/create-your-mcp-svelte/views/McpAdminView.svelte"),
  read("frontend/slices/create-your-mcp-svelte/views/McpSetupPanel.svelte"),
  read("frontend/slices/create-your-mcp-svelte/views/McpTokenTable.svelte"),
  read("frontend/slices/create-your-mcp-svelte/routes/mcp.ts"),
  read("frontend/slices/create-your-mcp-svelte/routes/oauth-token.ts"),
].join("\n");
const clientIndex = read("frontend/slices/create-your-mcp/index.ts");
const serverIndex = read("frontend/slices/create-your-mcp/server.ts");
const svelteClientIndex = read("frontend/slices/create-your-mcp-svelte/index.ts");
const svelteServerIndex = read("frontend/slices/create-your-mcp-svelte/server.ts");
const mcpRoute = read("frontend/slices/create-your-mcp/routes/mcp.route.ts");
const oauthRoute = read("frontend/slices/create-your-mcp/routes/oauth-token.route.ts");
const targets: string[] = [];
const target = () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-create-mcp-"));
  targets.push(dir);
  return dir;
};
const runCli = (...args: string[]) =>
  spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("create-your-mcp framework contract", () => {
  it("keeps React default and selects native SvelteKit over one MCP/OAuth core", () => {
    expect(slice.version).toBe("0.4.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.convex.rootPaths).toEqual(["convex/features/create_your_mcp"]);
    expect(slice.deps.npm).toEqual([
      "convex@^1.16.0",
      "class-variance-authority@^0.7.1",
    ]);
    expect(slice.deps.shadcn).toEqual(["button"]);
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/create-your-mcp-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5", "convex@^1.16.0"], shadcn: [] },
    });
  });

  it("keeps browser barrels free of server-only node modules", () => {
    expect(clientIndex).not.toContain('from "./lib/backend"');
    expect(clientIndex).not.toContain('from "./lib/mcp-http"');
    expect(clientIndex).not.toContain('from "./lib/oauth-http"');
    expect(clientIndex).not.toContain('from "./lib/context"');
    expect(svelteClientIndex).not.toContain("routes/mcp");
    expect(svelteClientIndex).not.toContain('from "./server"');
    expect(serverIndex).toContain("./lib/context");
    expect(svelteServerIndex).toContain("./routes/mcp");
  });

  it("keeps host HTTP adapters thin and removes the missing convex-http dependency", () => {
    expect(mcpRoute).toContain("handleMcpPost");
    expect(oauthRoute).toContain("handleOauthTokenPost");
    expect(mcpRoute).not.toContain("@/shared/lib/convex-http");
    expect(oauthRoute).not.toContain("@/shared/lib/convex-http");
    expect(mcpRoute).not.toContain('from "next/server"');
    expect(oauthRoute).not.toContain('from "next/server"');
    expect(svelte).toContain("createSvelteKitMcpHandlers");
    expect(svelte).toContain("createSvelteKitOauthTokenHandlers");
  });

  it("keeps React/Next/shadcn runtime out of the Svelte distribution", () => {
    for (const token of ['from "react"', 'from "next', "lucide-react", "@/components/ui/"]) {
      expect(svelte).not.toContain(token);
    }
    expect(svelte).toContain("$props()");
    expect(svelte).toContain("$state(true)");
    expect(svelte).toContain("onclick=");
    expect(svelte).not.toContain("on:click");
  });

  it("selects truthful dependencies and never double-prefixes next-public env names", () => {
    const react = runCli("add", "create-your-mcp", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("convex@^1.16.0");
    expect(react.stdout).toContain("class-variance-authority@^0.7.1");
    expect(react.stdout).toContain("shadcn: button");
    expect(react.stdout).toContain("NEXT_PUBLIC_SITE_URL=…");
    expect(react.stdout).not.toContain("NEXT_PUBLIC_NEXT_PUBLIC_SITE_URL");

    const sv = runCli(
      "add",
      "create-your-mcp",
      "--target",
      target(),
      "--framework",
      "sveltekit",
      "--dry-run",
    );
    expect(sv.status).toBe(0);
    expect(sv.stdout).toContain("frontend/slices/create-your-mcp-svelte →");
    expect(sv.stdout).toContain("convex/features/create_your_mcp →");
    expect(sv.stdout).toContain("svelte@^5 convex@^1.16.0");
    expect(sv.stdout).not.toContain("class-variance-authority");
    expect(sv.stdout).not.toContain("shadcn:");
  });
});
