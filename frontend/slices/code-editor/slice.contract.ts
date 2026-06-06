/**
 * Slice contract for `code-editor` — v1.0.0.
 *
 * Overlay syntax editor with a lazy explorer tree. Self-contained: the fs
 * runs on an injectable CodeFsAdapter (writable in-memory mock by default),
 * shell services (inspector) are no-op seams in lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "code-editor",
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
    shadcn: ["button", "badge", "input", "scroll-area", "sheet", "dialog"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["CodeEditor"] as string[],
    hooks: [] as string[],
    utils: ["configureCodeFs", "createMockFs", "codeEditorApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
