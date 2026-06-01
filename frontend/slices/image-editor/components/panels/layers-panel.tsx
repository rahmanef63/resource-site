"use client";

import { useState } from "react";
import {
  Brush,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Lock,
  Square,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEditor } from "../../lib/store";
import { createLayer } from "../../lib/model";
import { BLEND_MODES, type BlendMode, type Layer } from "../../lib/types";

const KIND_ICON = {
  image: ImageIcon,
  text: Type,
  shape: Square,
  paint: Brush,
} as const;

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7" onClick={onClick}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function LayersPanel() {
  const ed = useEditor();
  const { doc, selectedId } = ed;
  const [editing, setEditing] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const rows = [...doc.layers].reverse();
  const toReal = (display: number) => doc.layers.length - 1 - display;
  const resetDrag = () => {
    setDragIdx(null);
    setOverIdx(null);
  };
  const onDrop = (to: number) => {
    if (dragIdx !== null && dragIdx !== to) ed.reorder(toReal(dragIdx), toReal(to));
    resetDrag();
  };
  const addPaint = () =>
    ed.addLayer(
      createLayer("paint", {
        t: { x: 0, y: 0, width: doc.width, height: doc.height, rotation: 0, scaleX: 1, scaleY: 1 },
      }),
    );

  return (
    <div className="flex h-full flex-col bg-card text-foreground">
      <div className="flex items-center gap-1 border-b border-border p-2">
        <Button size="sm" variant="outline" onClick={() => ed.addLayer(createLayer("text"))}>
          <Type className="size-4" /> Text
        </Button>
        <Button size="sm" variant="outline" onClick={() => ed.addLayer(createLayer("shape"))}>
          <Square className="size-4" /> Shape
        </Button>
        <Button size="sm" variant="outline" onClick={addPaint}>
          <Brush className="size-4" /> Paint
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {rows.map((l: Layer, di: number) => {
            const KindIcon = KIND_ICON[l.kind];
            const isSel = l.id === selectedId;
            const isOver = overIdx === di && dragIdx !== null && dragIdx !== di;
            return (
              <div
                key={l.id}
                className={cn("border-b border-border", isOver && "ring-2 ring-inset ring-primary")}
                draggable
                onDragStart={() => setDragIdx(di)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overIdx !== di) setOverIdx(di);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(di);
                }}
                onDragEnd={resetDrag}
              >
                <div
                  onClick={() => ed.select(l.id)}
                  className={cn("flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent/50", isSel && "bg-accent")}
                >
                  <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/60 active:cursor-grabbing" />
                  <KindIcon className="size-4 shrink-0 text-muted-foreground" />
                  {editing === l.id ? (
                    <Input
                      autoFocus
                      draggable={false}
                      defaultValue={l.name}
                      className="h-6 flex-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        ed.update(l.id, { name: e.target.value });
                        setEditing(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        ed.update(l.id, { name: (e.target as HTMLInputElement).value });
                        setEditing(null);
                      }}
                    />
                  ) : (
                    <span
                      className="flex-1 truncate text-xs"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditing(l.id);
                      }}
                    >
                      {l.name}
                    </span>
                  )}
                  <IconBtn label={l.visible ? "Hide" : "Show"} onClick={() => ed.update(l.id, { visible: !l.visible })}>
                    {l.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted-foreground" />}
                  </IconBtn>
                  <IconBtn label={l.locked ? "Unlock" : "Lock"} onClick={() => ed.update(l.id, { locked: !l.locked })}>
                    {l.locked ? <Lock className="size-4" /> : <Unlock className="size-4 text-muted-foreground" />}
                  </IconBtn>
                </div>

                {isSel && (
                  <div className="flex flex-col gap-2 px-2 pb-2">
                    <div className="flex items-center gap-1">
                      <IconBtn label="Duplicate" onClick={() => ed.duplicateLayer(l.id)}>
                        <Copy className="size-4" />
                      </IconBtn>
                      <IconBtn label="Delete" onClick={() => ed.removeLayer(l.id)}>
                        <Trash2 className="size-4" />
                      </IconBtn>
                      <IconBtn label="Raise" onClick={() => ed.raise(l.id)}>
                        <ChevronUp className="size-4" />
                      </IconBtn>
                      <IconBtn label="Lower" onClick={() => ed.lower(l.id)}>
                        <ChevronDown className="size-4" />
                      </IconBtn>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-xs text-muted-foreground">Opacity</span>
                      <Slider
                        value={[Math.round(l.opacity * 100)]}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => ed.update(l.id, { opacity: v[0] / 100 })}
                      />
                    </div>
                    <Select value={l.style.blend} onValueChange={(v) => ed.patchStyle(l.id, { blend: v as BlendMode })}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLEND_MODES.map((b) => (
                          <SelectItem key={b} value={b} className="text-xs">
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
