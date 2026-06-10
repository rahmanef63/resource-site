/**
 * Slice contract for `media-viewer` — v1.1.0.
 *
 * Quick-look viewer for image/video/audio/pdf/text. Self-contained: sample
 * gallery works offline, remote files resolve through an injectable media
 * source, editor handoffs route through an injectable opener (lib/host.ts).
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "media-viewer",
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
    shadcn: ["button", "badge", "separator", "tooltip", "slider"],
    peers: [],
  },
  provides: {
    tools: [
      "media-viewer.info",
      "media-viewer.next",
      "media-viewer.prev",
      "media-viewer.zoom.set"
    ] as string[],
    routes: [] as string[],
    components: ["MediaViewer"] as string[],
    hooks: [] as string[],
    utils: ["configureMediaOpener", "configureMediaSource", "mediaViewerApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
