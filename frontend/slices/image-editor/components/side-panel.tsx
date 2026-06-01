"use client";

import { Layers, Sparkles, SlidersHorizontal, Move, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayersPanel } from "./panels/layers-panel";
import { LayerStylesPanel } from "./panels/layer-styles-panel";
import { AdjustPanel } from "./panels/adjust-panel";
import { TransformPanel } from "./panels/transform-panel";
import { ExportPanel } from "./panels/export-panel";

// Right dock: tabbed host for the editor panels. Each tab is icon-only so the
// dock stays narrow; the active panel scrolls independently.
export function SidePanel() {
  return (
    <Tabs defaultValue="layers" className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <TabsList className="grid w-full grid-cols-5 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="layers" aria-label="Layers"><Layers className="size-4" /></TabsTrigger>
        <TabsTrigger value="style" aria-label="Layer styles"><Sparkles className="size-4" /></TabsTrigger>
        <TabsTrigger value="adjust" aria-label="Adjustments"><SlidersHorizontal className="size-4" /></TabsTrigger>
        <TabsTrigger value="transform" aria-label="Transform"><Move className="size-4" /></TabsTrigger>
        <TabsTrigger value="export" aria-label="Export"><Download className="size-4" /></TabsTrigger>
      </TabsList>
      <ScrollArea className="flex-1">
        <TabsContent value="layers" className="m-0"><LayersPanel /></TabsContent>
        <TabsContent value="style" className="m-0"><LayerStylesPanel /></TabsContent>
        <TabsContent value="adjust" className="m-0"><AdjustPanel /></TabsContent>
        <TabsContent value="transform" className="m-0"><TransformPanel /></TabsContent>
        <TabsContent value="export" className="m-0"><ExportPanel /></TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
