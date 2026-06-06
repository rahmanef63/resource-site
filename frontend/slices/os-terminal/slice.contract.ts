/**
 * Slice contract for `os-terminal` — v1.0.0.
 *
 * Shell emulator (in-memory FsModel) with live passthrough: wire
 * configureTerminal to read through a real fs and exec unknown commands
 * one-shot. Shell services are no-op seams in lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "os-terminal",
  version: "1.0.0",
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
    shadcn: [],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["Terminal"] as string[],
    hooks: [] as string[],
    utils: ["configureTerminal", "osTerminalApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
