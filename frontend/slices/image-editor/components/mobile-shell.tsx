"use client";

import { useRef, useState, type ReactNode } from "react";
import { Layers, Sparkles, SlidersHorizontal, Move, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";
import { ToolRail } from "./tool-rail";
import { ToolOptionsBar } from "./tool-options-bar";
import { LayersPanel } from "./panels/layers-panel";
import { LayerStylesPanel } from "./panels/layer-styles-panel";
import { AdjustPanel } from "./panels/adjust-panel";
import { TransformPanel } from "./panels/transform-panel";
import { ExportPanel } from "./panels/export-panel";

// Mobile layout: the canvas stays LIVE in the top half while edits happen in a
// bottom sheet (~half height, drag the grip to resize 25–80vh) — so every slider
// tweak previews instantly above. Tools are a horizontal rail above the sheet.
export function MobileShell({ stage, onSave }: { stage: ReactNode; onSave?: (d: string) => void }) {
  const [sheetVh, setSheetVh] = useState(48);
  const drag = useRef<{ y: number; h: number } | null>(null);

  const onGripDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, h: sheetVh };
  };
  const onGripMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dvh = ((drag.current.y - e.clientY) / window.innerHeight) * 100;
    setSheetVh(Math.min(80, Math.max(25, drag.current.h + dvh)));
  };
  const onGripUp = () => (drag.current = null);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <TopBar onSave={onSave} />
      <ToolOptionsBar />
      <div className="relative min-h-0 flex-1">{stage}</div>
      <ToolRail orientation="horizontal" />
      <div className="flex shrink-0 flex-col border-t border-border bg-card" style={{ height: `${sheetVh}vh` }}>
        <div
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={onGripUp}
          className="flex h-5 shrink-0 cursor-row-resize touch-none items-center justify-center"
          aria-label="Resize panel"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        <Tabs defaultValue="layers" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="grid w-full shrink-0 grid-cols-5 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger value="layers" aria-label="Layers"><Layers className="size-4" /></TabsTrigger>
            <TabsTrigger value="adjust" aria-label="Adjustments"><SlidersHorizontal className="size-4" /></TabsTrigger>
            <TabsTrigger value="style" aria-label="Layer styles"><Sparkles className="size-4" /></TabsTrigger>
            <TabsTrigger value="transform" aria-label="Transform"><Move className="size-4" /></TabsTrigger>
            <TabsTrigger value="export" aria-label="Export"><Download className="size-4" /></TabsTrigger>
          </TabsList>
          <ScrollArea className={cn("min-h-0 flex-1")}>
            <TabsContent value="layers" className="m-0 h-full"><LayersPanel /></TabsContent>
            <TabsContent value="adjust" className="m-0"><AdjustPanel /></TabsContent>
            <TabsContent value="style" className="m-0"><LayerStylesPanel /></TabsContent>
            <TabsContent value="transform" className="m-0"><TransformPanel /></TabsContent>
            <TabsContent value="export" className="m-0"><ExportPanel /></TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
