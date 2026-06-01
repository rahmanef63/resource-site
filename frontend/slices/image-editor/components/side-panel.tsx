"use client";

import { Sparkles, SlidersHorizontal, Move, Download, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LayersPanel } from "./panels/layers-panel";
import { LayerStylesPanel } from "./panels/layer-styles-panel";
import { AdjustPanel } from "./panels/adjust-panel";
import { TransformPanel } from "./panels/transform-panel";
import { ExportPanel } from "./panels/export-panel";

// Right dock, Photoshop "Essentials" layout: a vertically split, resizable
// column — adjustments/properties group on TOP, Layers group on the BOTTOM
// (the signature bottom-right Layers panel). Tools live on the left rail; the
// Options bar is up top. Drag the divider to rebalance the two groups.
export function SidePanel() {
  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={58} minSize={25}>
          <Tabs defaultValue="adjust" className="flex h-full flex-col">
            <TabsList className="grid w-full shrink-0 grid-cols-4 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger value="adjust" aria-label="Adjustments"><SlidersHorizontal className="size-4" /></TabsTrigger>
              <TabsTrigger value="style" aria-label="Layer styles"><Sparkles className="size-4" /></TabsTrigger>
              <TabsTrigger value="transform" aria-label="Transform & canvas"><Move className="size-4" /></TabsTrigger>
              <TabsTrigger value="export" aria-label="Export"><Download className="size-4" /></TabsTrigger>
            </TabsList>
            <ScrollArea className="min-h-0 flex-1">
              <TabsContent value="adjust" className="m-0"><AdjustPanel /></TabsContent>
              <TabsContent value="style" className="m-0"><LayerStylesPanel /></TabsContent>
              <TabsContent value="transform" className="m-0"><TransformPanel /></TabsContent>
              <TabsContent value="export" className="m-0"><ExportPanel /></TabsContent>
            </ScrollArea>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={42} minSize={20}>
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Layers className="size-3.5" /> Layers
            </div>
            <div className="min-h-0 flex-1">
              {/* LayersPanel is h-full + self-scrolling — no extra ScrollArea. */}
              <LayersPanel />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
