/**
 * Slice contract for `image-editor` — v1.0.0.
 *
 * A layered raster image editor (Konva engine). Self-contained: image I/O is
 * via props (initialImage / onSave), background removal runs in-browser via
 * @imgly/background-removal (no backend, no API key). Excluded from app tsc;
 * validated by rr tooling on lift.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "image-editor",
  version: "1.0.0",
  category: "ui",
  kind: "full",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [
      { npm: "react", range: "^19" },
      { npm: "konva", range: "^10" },
      { npm: "react-konva", range: "^19" },
      { npm: "@imgly/background-removal", range: "^1.6.0" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button", "input", "slider", "select", "tabs", "scroll-area", "separator", "tooltip", "popover", "switch", "label", "dropdown-menu", "resizable"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["ImageEditor", "EditorProvider"] as string[],
    hooks: ["useEditor"] as string[],
    utils: ["blankDoc", "createLayer", "removeLayerBackground"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
