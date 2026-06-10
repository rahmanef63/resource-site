/**
 * Slice contract for `image-editor` — v2.0.0.
 *
 * A layered raster image editor (Konva engine) with an AI function-calling
 * command registry and a headless server barrel. Self-contained: image I/O is
 * via props (initialImage / onSave), background removal runs in-browser via
 * @imgly/background-removal, and the AI bridge is injectable through
 * `configureAgentStream` in lib/host.ts (no backend required otherwise).
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "image-editor",
  version: "2.0.0",
  category: "ui",
  kind: "ui",
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
      { npm: "class-variance-authority", range: "^0.7" },
      { npm: "radix-ui", range: "^1" },
    ],
    shadcn: ["button", "input", "label", "separator", "select", "scroll-area", "switch", "dropdown-menu", "tooltip", "resizable", "popover"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["ImageEditor", "EditorProvider"] as string[],
    hooks: ["useEditor", "useEditorCommands"] as string[],
    utils: ["blankDoc", "createLayer", "removeImageBackground", "runEditorAgent", "configureAgentStream", "EDITOR_COMMANDS"] as string[],
    tables: [] as string[],
    // Agentic tool collection (`imageEditorTools`) — a central host registers
    // this so one agent can drive the editor alongside other slices' tools.
    tools: [
      "image-editor.doc.inspect", "image-editor.doc.resize", "image-editor.doc.aspect",
      "image-editor.doc.crop", "image-editor.layer.add", "image-editor.layer.remove",
      "image-editor.layer.duplicate", "image-editor.layer.rename", "image-editor.layer.select",
      "image-editor.layer.order", "image-editor.layer.visibility", "image-editor.layer.lock",
      "image-editor.layer.opacity", "image-editor.transform.set", "image-editor.transform.flip",
      "image-editor.tool.select", "image-editor.brush.set", "image-editor.color.set",
      "image-editor.color.swap", "image-editor.adjust.set", "image-editor.adjust.addLayer",
      "image-editor.adjust.reset", "image-editor.style.stroke", "image-editor.style.shadow",
      "image-editor.style.glow", "image-editor.style.blend", "image-editor.text.edit",
      "image-editor.shape.edit", "image-editor.mask.add", "image-editor.mask.remove",
      "image-editor.edit.undo", "image-editor.edit.redo", "image-editor.export.image",
      "image-editor.image.removeBackground",
    ] as string[],
  },
  conflicts: [],
});

export default contract;
