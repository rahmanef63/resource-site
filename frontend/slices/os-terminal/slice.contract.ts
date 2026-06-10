/**
 * Slice contract for `os-terminal` — v1.1.0.
 *
 * Shell emulator (in-memory FsModel) with live passthrough: wire
 * configureTerminal to read through a real fs, exec unknown commands
 * one-shot, and feed neofetch real sys.stats. configurePty injects a PTY
 * transport + VT renderer (e.g. xterm.js) for a real interactive shell;
 * createSsePtyTransport ships the os-vps /api/v1/term SSE wire shape.
 * Shell services are no-op seams in lib/host.ts; the default OsApi is the
 * mock adapter in lib/host-mock.ts (shares the FsModel seed).
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "os-terminal",
  version: "1.2.0",
  category: "ui",
  kind: "ui",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [
      { npm: "react", range: "^19" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button"],
    peers: [],
  },
  provides: {
    tools: [
      "os-terminal.run",
      "os-terminal.cwd",
      "os-terminal.clear"
    ] as string[],
    routes: [] as string[],
    components: ["Terminal"] as string[],
    hooks: [] as string[],
    utils: [
      "configureTerminal",
      "configurePty",
      "createSsePtyTransport",
      "osTerminalApp",
    ] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
