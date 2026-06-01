"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Scissors,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
  FolderOpen,
  FileDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEditor } from "../lib/store";
import { createLayer } from "../lib/model";
import { loadImage } from "../lib/konva-helpers";
import { removeImageBackground } from "../lib/bg-removal";
import { stageToDataURL } from "../lib/export";
import { downloadProject, parseProject } from "../lib/project";

// Top command bar: open an image, remove its background (free, in-browser),
// undo/redo, zoom, and Save (fires onSave with a PNG data URL).
export function TopBar({ onSave }: { onSave?: (dataUrl: string) => void }) {
  const { doc, selected, addLayer, update, undo, redo, canUndo, canRedo, zoom, setZoom, stageRef, exportProject, loadProject } = useEditor();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const projRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function openProject(file: File) {
    const p = parseProject(await file.text());
    if (p) loadProject(p);
  }

  async function openFile(file: File) {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    const max = Math.min(doc.width, doc.height) * 0.9;
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * k);
    const h = Math.round(img.height * k);
    addLayer(createLayer("image", { name: file.name, src: url, t: { x: Math.round((doc.width - w) / 2), y: Math.round((doc.height - h) / 2), width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 } }));
  }

  async function removeBg() {
    if (!selected || selected.kind !== "image" || !selected.src) return;
    setBusy(true);
    try {
      const out = await removeImageBackground(selected.src);
      update(selected.id, { src: out, name: `${selected.name} (cutout)` });
    } finally {
      setBusy(false);
    }
  }

  const canCut = selected?.kind === "image" && !!selected.src;
  const z = (d: number) => setZoom(Math.min(5, Math.max(0.1, Math.round((zoom + d) * 100) / 100)));

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-card px-3">
      <span className="mr-2 text-sm font-semibold">Image Editor</span>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void openFile(f);
          e.target.value = "";
        }}
      />
      <input
        ref={projRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void openProject(f); e.target.value = ""; }}
      />
      <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
        <Upload className="size-4" /> Open
      </Button>
      <Button variant="ghost" size="sm" disabled={!canCut || busy} onClick={() => void removeBg()}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Scissors className="size-4" />} Remove BG
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="sm" onClick={() => projRef.current?.click()}>
        <FolderOpen className="size-4" /> Open Project
      </Button>
      <Button variant="ghost" size="sm" onClick={() => downloadProject(exportProject())}>
        <FileDown className="size-4" /> Save Project
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo} aria-label="Undo">
        <Undo2 className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo} aria-label="Redo">
        <Redo2 className="size-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" onClick={() => z(-0.1)} aria-label="Zoom out">
        <ZoomOut className="size-4" />
      </Button>
      <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
      <Button variant="ghost" size="icon" onClick={() => z(0.1)} aria-label="Zoom in">
        <ZoomIn className="size-4" />
      </Button>
      <div className="flex-1" />
      {onSave && (
        <Button size="sm" onClick={() => { const s = stageRef.current; if (s) onSave(stageToDataURL(s, { format: "png" })); }}>
          <Save className="size-4" /> Save
        </Button>
      )}
    </div>
  );
}
