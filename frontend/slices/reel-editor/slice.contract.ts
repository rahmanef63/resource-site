/**
 * Slice contract for `reel-editor` — v1.0.0.
 *
 * A layered multi-track video editor (Canvas-2D engine, WYSIWYG realtime WebM
 * export). Self-contained: media in via file picker / fs adapter, toasts via
 * sonner, shell services (inspector/activity) are no-op seams in lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "reel-editor",
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
      { npm: "react-resizable-panels", range: "^4" },
      { npm: "sonner", range: "^1" },
    ],
    shadcn: ["button", "input", "slider", "tooltip", "dialog", "dropdown-menu", "resizable", "sheet", "sonner"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["ReelEditor"] as string[],
    hooks: [] as string[],
    utils: ["configureReelFs", "reelEditorApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
