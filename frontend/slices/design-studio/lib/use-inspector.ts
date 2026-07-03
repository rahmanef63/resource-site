"use client";

import { usePublishInspector } from "./host";
import { ASPECTS } from "./model";

type StudioInspector = {
  aspect: string;
  tool: string;
  zoom: number;
  layerCount: number;
  selectedName?: string;
  onAddLayer: () => void;
  onExport: () => void;
  onUndo: () => void;
};

const aspectLabel = (value: string): string =>
  ASPECTS.find((a) => a.value === value)?.ratio ?? value;

// Publishes the design canvas state + real studio handlers to a shell
// Inspector (⌘I). Inert in the catalog build — the host seam's
// usePublishInspector is a no-op until a shell provides the bus.
export function useStudioInspector(s: StudioInspector): void {
  const aspect = aspectLabel(s.aspect);
  usePublishInspector(
    "design-studio",
    {
      subject: "Untitled design",
      props: [
        { label: "Canvas", value: aspect },
        { label: "Layers", value: String(s.layerCount) },
        { label: "Selected", value: s.selectedName ?? "—" },
        { label: "Tool", value: s.tool },
        { label: "Zoom", value: `${s.zoom}%` },
      ],
      actions: [
        { id: "add-layer", label: "Add layer", run: s.onAddLayer },
        { id: "export", label: "Export", run: s.onExport },
        { id: "undo", label: "Undo", run: s.onUndo },
      ],
      context: `Design canvas (${aspect}) with ${s.layerCount} layers`,
      suggestions: ["Improve the layout", "Suggest a color palette", "Make it pop"],
    },
    [s.aspect, s.tool, s.zoom, s.layerCount, s.selectedName],
  );
}
