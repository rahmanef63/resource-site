"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "../lib/store";

// Contextual options bar for the active painting tool. Renders nothing unless
// the Brush or Eraser is active.
export function ToolOptionsBar() {
  const { tool, brush, setBrush } = useEditor();
  if (tool !== "brush" && tool !== "eraser") return null;
  const isBrush = tool === "brush";

  return (
    <div className="flex h-11 shrink-0 items-center gap-4 border-b border-border bg-card/60 px-3 text-xs">
      <span className="font-medium capitalize text-muted-foreground">{tool}</span>
      {isBrush && (
        <label className="flex items-center gap-2">
          <Label className="text-muted-foreground">Color</Label>
          <Input type="color" value={brush.color} onChange={(e) => setBrush({ color: e.target.value })} className="h-7 w-9 p-1" />
        </label>
      )}
      <div className="flex items-center gap-2">
        <Label className="text-muted-foreground">Size</Label>
        <Slider className="w-32" min={1} max={200} value={[brush.size]} onValueChange={([v]) => setBrush({ size: v })} />
        <span className="w-8 tabular-nums text-muted-foreground">{brush.size}</span>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-muted-foreground">Opacity</Label>
        <Slider className="w-28" min={5} max={100} value={[Math.round(brush.opacity * 100)]} onValueChange={([v]) => setBrush({ opacity: v / 100 })} />
        <span className="w-9 tabular-nums text-muted-foreground">{Math.round(brush.opacity * 100)}%</span>
      </div>
      {isBrush && (
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">Hardness</Label>
          <Slider className="w-28" min={0} max={100} value={[Math.round(brush.hardness * 100)]} onValueChange={([v]) => setBrush({ hardness: v / 100 })} />
          <span className="w-9 tabular-nums text-muted-foreground">{Math.round(brush.hardness * 100)}%</span>
        </div>
      )}
    </div>
  );
}
