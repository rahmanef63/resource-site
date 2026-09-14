// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const slice = JSON.parse(read("frontend/slices/os-terminal/slice.json"));
const reactApp = read("frontend/slices/os-terminal/app.tsx");
const reactHost = read("frontend/slices/os-terminal/lib/host.ts");
const commands = read("frontend/slices/os-terminal/lib/commands.ts");
const svelte = [
  read("frontend/slices/os-terminal-svelte/components/Terminal.svelte"),
  read("frontend/slices/os-terminal-svelte/components/ExecTerminal.svelte"),
  read("frontend/slices/os-terminal-svelte/components/PtyTerminal.svelte"),
  read("frontend/slices/os-terminal-svelte/components/KeyBar.svelte"),
  read("frontend/slices/os-terminal-svelte/index.ts"),
].join("\n");

describe("os-terminal framework contract", () => {
  it("keeps React default and selects native Svelte over shared shell cores", () => {
    expect(slice.version).toBe("1.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/os-terminal-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain(
      "frontend/slices/os-terminal/lib/host-core.ts",
    );
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain(
      "frontend/slices/os-terminal/lib/use-pty.ts",
    );
  });

  it("makes live adapter and PTY configuration observable in both renderers", () => {
    expect(reactHost).toContain("useSyncExternalStore(subscribeTerminal");
    expect(reactApp).toContain("useSyncExternalStore(subscribePty");
    expect(svelte).toContain("subscribeTerminal(");
    expect(svelte).toContain("subscribePty(");
    expect(svelte).toContain("PtyTerminal");
    expect(svelte).toContain("ExecTerminal");
    expect(commands).toContain('from "./host-core"');
    expect(commands).not.toContain('from "./host"');
  });

  it("keeps React/Next/Lucide/shadcn runtime out of the Svelte distribution", () => {
    expect(svelte).not.toContain('from "react"');
    expect(svelte).not.toContain('from "next');
    expect(svelte).not.toContain("lucide-react");
    expect(svelte).not.toContain("@/components/ui/");
    expect(svelte).toContain("createSsePtyTransport");
    expect(svelte).toContain("osTerminalTools");
  });
});
