/**
 * Slice contract for `media-studio` — v1.0.0.
 *
 * Lightweight photo/social design canvas: layered editing (text/shape/
 * sticker/image/HTML-embed), live CSS-filter adjustments, clip masks,
 * platform safe-area guides, debounced undo/redo, JSON+HTML export/import.
 * Self-contained: bundled data-URI sample images, host persistence injected
 * via lib/host.ts (`configureMediaStudio`).
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "media-studio",
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
    shadcn: [
      "button",
      "badge",
      "dialog",
      "input",
      "scroll-area",
      "switch",
      "textarea",
      "tooltip",
    ],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["MediaStudio"] as string[],
    hooks: [] as string[],
    utils: ["configureMediaStudio", "parseDoc", "mediaStudioApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
