/**
 * Slice contract for `file-explorer` — v1.0.0.
 *
 * A backend-agnostic file explorer (tree + breadcrumb + grid/list + CRUD +
 * drag-drop + context menu + multi-select). Requires NOTHING external: the
 * backend is injected at the call site as a `FileExplorerAdapter`, and a
 * `createMockAdapter()` ships in-slice. Excluded from app tsc; validated by rr
 * tooling on lift.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "file-explorer",
  version: "1.0.0",
  category: "ui",
  kind: "full",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [
      { npm: "react", range: "^18" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button", "input", "scroll-area", "separator", "dropdown-menu", "sheet"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["FileExplorer", "FileExplorerAdapterProvider"] as string[],
    hooks: ["useFsAdapter"] as string[],
    utils: ["createMockAdapter"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
