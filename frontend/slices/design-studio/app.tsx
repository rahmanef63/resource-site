"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { nextImageSource, type AppProps } from "./lib/host";
import { useStudio } from "./lib/use-studio";
import { useScene } from "./lib/use-scene";
import { useKeyboard } from "./lib/use-keyboard";
import { useExport } from "./lib/use-export";
import { useStudioInspector } from "./lib/use-inspector";
import { parseDoc } from "./lib/serialize";
import type { Adjustments } from "./lib/filters";
import type { Layer, LayerKind } from "./lib/model";
import { StudioHeader, StudioFooter } from "./components/studio-chrome";
import { ToolRail } from "./components/tool-rail";
import { CanvasStage } from "./components/canvas-stage";
import { SidePanel } from "./components/side-panel";
import { ExportModal } from "./components/export-modal";

// Media Studio root — a lightweight photo/social design canvas. Fully
// client-side: layers + adjustments live in the debounced-undo store
// (lib/use-studio), exports are JSON/HTML artifacts, demo image layers come
// from bundled data-URI samples. Host wiring (fs persistence, real media
// library, shell inspector) is injected via lib/host.ts.
export default function MediaStudio({ payload }: AppProps) {
  const p = payload as { doc?: string } | undefined;
  const s = useStudio();
  const sc = useScene();
  const rootRef = useRef<HTMLDivElement>(null);

  const applyImport = (r: { layers: Layer[]; aspect?: string; adjustments?: Adjustments }) => {
    s.loadLayers(r.layers);
    if (r.aspect) sc.setAspect(r.aspect);
    if (r.adjustments) s.setAdjustments(r.adjustments);
  };

  const exp = useExport({
    layers: s.layers,
    aspect: sc.aspect,
    adjustments: s.adjustments,
    onImport: applyImport,
    notify: sc.notify,
  });

  // Deep-link payload: an os-rr/layers@1 doc as a JSON string.
  useEffect(() => {
    if (!p?.doc) return;
    const r = parseDoc(p.doc);
    if (r) applyImport(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New image layers pull from the host media pool (bundled samples offline).
  const onAdd = (kind: LayerKind) =>
    s.add(kind, kind === "image" ? { src: nextImageSource() } : {});

  const pickEmoji = (emoji: string) => {
    s.add("sticker", { emoji });
    sc.setEmojiOpen(false);
  };

  useKeyboard({
    rootRef,
    selected: s.selected,
    onTool: sc.setTool,
    onToggleEmoji: () => sc.setEmojiOpen((v) => !v),
    onUndo: s.undo,
    onRedo: s.redo,
    onDelete: s.remove,
    onEscape: () => {
      sc.setEmojiOpen(false);
      s.setSelected(null);
    },
  });

  const selectedLayer = s.layers.find((l) => l.id === s.selected);

  useStudioInspector({
    aspect: sc.aspect,
    tool: sc.tool,
    zoom: sc.zoom,
    layerCount: s.layers.length,
    selectedName: selectedLayer?.name,
    onAddLayer: () => onAdd("text"),
    onExport: () => exp.setOpen(true),
    onUndo: s.undo,
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={rootRef}
        tabIndex={-1}
        className="@container relative flex h-full w-full flex-col bg-background text-foreground outline-none"
      >
        <StudioHeader
          tool={sc.tool}
          canUndo={s.canUndo}
          canRedo={s.canRedo}
          panelOpen={sc.panelOpen}
          onUndo={s.undo}
          onRedo={s.redo}
          onTogglePanel={() => sc.setPanelOpen((v) => !v)}
          onExport={() => exp.setOpen(true)}
        />

        <div className="flex min-h-0 flex-1">
          <ToolRail
            active={sc.tool}
            emojiOpen={sc.emojiOpen}
            onSelect={(id) => {
              sc.setTool(id);
              sc.setEmojiOpen(false);
            }}
            onToggleEmoji={() => sc.setEmojiOpen((v) => !v)}
            onPickEmoji={pickEmoji}
          />
          <CanvasStage
            adjustments={s.adjustments}
            layers={s.layers}
            selected={s.selected}
            tool={sc.tool}
            zoom={sc.zoom}
            aspect={sc.aspect}
            safe={sc.safe}
            platform={sc.platform}
            onSelect={s.setSelected}
            onPlace={(t, x, y) => {
              s.place(t, x, y);
              sc.setTool("move");
            }}
            onMove={(id, x, y) => s.update(id, { x, y })}
            onDragStart={s.commit}
          />
          {sc.panelOpen && (
            <aside className="w-[248px] shrink-0 border-l border-border bg-card @max-md:absolute @max-md:inset-y-11 @max-md:right-0 @max-md:bottom-9 @max-md:z-20 @max-md:shadow-xl">
              <SidePanel
                tab={sc.tab}
                onTab={sc.setTab}
                layers={s.layers}
                selected={s.selected}
                selectedLayer={selectedLayer}
                adjustments={s.adjustments}
                activeFilter={s.activeFilter}
                aspect={sc.aspect}
                safe={sc.safe}
                platform={sc.platform}
                onSelect={s.setSelected}
                onToggle={s.toggle}
                onOpacity={(id, v) => s.update(id, { opacity: v })}
                onMove={s.reorder}
                onDelete={s.remove}
                onRename={(id, name) => s.update(id, { name })}
                onAdd={onAdd}
                onUpdate={(patch) => s.selected && s.update(s.selected, patch)}
                onAdjust={s.adjust}
                onFilter={s.applyFilter}
                onAspect={sc.setAspect}
                onReset={s.resetAdjust}
                onSafe={sc.setSafe}
                onPlatform={sc.setPlatform}
              />
            </aside>
          )}
        </div>

        <StudioFooter aspect={sc.aspect} layerCount={s.layers.length} zoom={sc.zoom} onZoom={sc.setZoom} />

        {sc.status && (
          <Badge variant="secondary" className="absolute bottom-12 left-1/2 z-30 -translate-x-1/2 shadow-md">
            {sc.status}
          </Badge>
        )}

        <ExportModal
          open={exp.open}
          tab={exp.tab}
          text={exp.text}
          hostWired={exp.hostWired}
          onOpenChange={exp.setOpen}
          onTab={exp.setTab}
          onDownload={exp.download}
          onCopy={exp.copy}
          onImport={exp.doImport}
          onHostSave={exp.saveToHost}
        />
      </div>
    </TooltipProvider>
  );
}
