"use client";

import { FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ASPECT_PRESETS } from "../../lib/model";
import { useEditor } from "../../lib/store";
import type { Layer } from "../../lib/types";
import { TextProps } from "./text-props";
import { ShapeProps } from "./shape-props";

const num = (v: string) => Number(v) || 0;

export function TransformPanel() {
  const { selected, doc, update, setDocSize } = useEditor();

  return (
    <div className="flex flex-col gap-4 p-3 text-sm">
      <section className="flex flex-col gap-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Canvas
        </Label>
        <Select
          onValueChange={(v) => {
            const p = ASPECT_PRESETS.find((x) => x.label === v);
            if (p) setDocSize(p.w, p.h);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aspect preset" />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_PRESETS.map((p) => (
              <SelectItem key={p.label} value={p.label}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">W</Label>
            <Input
              type="number"
              value={doc.width}
              onChange={(e) => setDocSize(num(e.target.value), doc.height)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">H</Label>
            <Input
              type="number"
              value={doc.height}
              onChange={(e) => setDocSize(doc.width, num(e.target.value))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {doc.width} x {doc.height} px
        </p>
      </section>

      <Separator />

      {selected ? (
        <LayerControls
          selected={selected}
          update={update}
        />
      ) : (
        <p className="text-xs text-muted-foreground">Select a layer to edit.</p>
      )}
    </div>
  );
}

function LayerControls({
  selected,
  update,
}: {
  selected: Layer;
  update: (id: string, patch: Partial<Layer>) => void;
}) {
  const id = selected.id;
  const t = selected.t;
  const set = (patch: Partial<Layer["t"]>) =>
    update(id, { t: { ...t, ...patch } });

  return (
    <section className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Layer
      </Label>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">X</Label>
          <Input
            type="number"
            value={t.x}
            onChange={(e) => set({ x: num(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Y</Label>
          <Input
            type="number"
            value={t.y}
            onChange={(e) => set({ y: num(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">
          Rotation {Math.round(t.rotation)}°
        </Label>
        <Slider
          min={0}
          max={360}
          value={[t.rotation]}
          onValueChange={([v]) => set({ rotation: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Scale X %</Label>
          <Input
            type="number"
            value={Math.round(t.scaleX * 100)}
            onChange={(e) => set({ scaleX: num(e.target.value) / 100 })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Scale Y %</Label>
          <Input
            type="number"
            value={Math.round(t.scaleY * 100)}
            onChange={(e) => set({ scaleY: num(e.target.value) / 100 })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => set({ scaleX: -t.scaleX })}
        >
          <FlipHorizontal className="size-4" /> Flip H
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => set({ scaleY: -t.scaleY })}
        >
          <FlipVertical className="size-4" /> Flip V
        </Button>
      </div>

      {selected.kind === "text" ? <TextProps selected={selected} update={update} /> : null}
      {selected.kind === "shape" ? <ShapeProps selected={selected} update={update} /> : null}
    </section>
  );
}

