"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { SelectionProvider, SelectionMarquee } from "@/features/selection";
import { Button } from "@/components/ui/button";
import { CanvasNode, type CanvasNodeData } from "./CanvasNode";

let seq = 100;
const nid = () => `n${seq++}`;

const INITIAL: CanvasNodeData[] = [
  { id: "n1", x: 40, y: 40, text: "Drag the grip to move" },
  { id: "n2", x: 250, y: 90, text: "Marquee to select" },
  { id: "n3", x: 110, y: 190, text: "Type to edit me" },
  { id: "n4", x: 330, y: 230, text: "✕ or Backspace deletes" },
];

/** Empty canvas + floating CRUD nodes — the live showcase for the selection
 *  slice: create (add / dbl-click), update (drag + edit), delete (✕ / bulk),
 *  duplicate (toolbar), and marquee-select across the whole 2-D surface. */
export function SelectionCanvas() {
  const [nodes, setNodes] = React.useState<CanvasNodeData[]>(INITIAL);
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const ids = nodes.map((n) => n.id);

  const add = (x = 60, y = 60) => setNodes((c) => [...c, { id: nid(), x, y, text: "New node" }]);
  const move = (id: string, x: number, y: number) =>
    setNodes((c) => c.map((n) => (n.id === id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n)));
  const edit = (id: string, text: string) =>
    setNodes((c) => c.map((n) => (n.id === id ? { ...n, text } : n)));
  const removeOne = (id: string) => setNodes((c) => c.filter((n) => n.id !== id));
  const removeMany = (del: string[]) => setNodes((c) => c.filter((n) => !del.includes(n.id)));
  const dupMany = (del: string[]) =>
    setNodes((c) => [
      ...c,
      ...c.filter((n) => del.includes(n.id)).map((n) => ({ ...n, id: nid(), x: n.x + 24, y: n.y + 24 })),
    ]);
  const onDbl = (e: React.MouseEvent) => {
    if (e.target !== surfaceRef.current) return; // empty canvas only
    const r = surfaceRef.current.getBoundingClientRect();
    add(e.clientX - r.left, e.clientY - r.top);
  };

  return (
    <SelectionProvider onBulkDelete={removeMany} onBulkDuplicate={dupMany}>
      <div className="mb-3 flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => add()}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add node
        </Button>
        <span className="text-xs text-muted-foreground">…or double-click the canvas. Drag a marquee to select.</span>
      </div>
      <div
        ref={surfaceRef}
        onDoubleClick={onDbl}
        className="relative h-[68vh] w-full overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle,theme(colors.border)_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <SelectionMarquee containerRef={surfaceRef} />
        {nodes.map((n) => (
          <CanvasNode key={n.id} node={n} orderedIds={ids} onMove={move} onEdit={edit} onDelete={removeOne} />
        ))}
      </div>
    </SelectionProvider>
  );
}
