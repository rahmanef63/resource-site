"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorProvider, useEditor } from "./lib/store";
import { blankDoc, createLayer } from "./lib/model";
import { loadAutosave, saveAutosave } from "./lib/project";
import { imageEditorConfig } from "./config";
import { ToolRail } from "./components/tool-rail";
import { TopBar } from "./components/top-bar";
import { ToolOptionsBar } from "./components/tool-options-bar";
import { SidePanel } from "./components/side-panel";
import { MobileShell } from "./components/mobile-shell";
import { useKeyboard } from "./hooks/use-keyboard";
import { useIsMobile } from "./hooks/use-is-mobile";
import type { Doc } from "./lib/types";

// The Konva stage touches `window`/`canvas` at import time, so it is loaded
// client-only (no SSR) — the rest of the chrome renders normally.
const EditorStage = dynamic(
  () => import("./components/stage/editor-stage").then((m) => m.EditorStage),
  { ssr: false, loading: () => <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading canvas…</div> },
);

export type ImageEditorProps = {
  /** Optional image to open on mount (data URL / object URL / remote URL). */
  initialImage?: string;
  /** Optional starting canvas size; defaults to config (1080×1080). */
  width?: number;
  height?: number;
  /** Fired by the Save button with a PNG data URL. Omit to hide Save. */
  onSave?: (dataUrl: string) => void;
  className?: string;
};

// Desktop layout: left tool rail · canvas · right dock (adjust top, layers bottom).
function DesktopShell({ stage, onSave }: { stage: React.ReactNode; onSave?: (d: string) => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <TopBar onSave={onSave} />
      <ToolOptionsBar />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <div className="min-w-0 flex-1">{stage}</div>
        <SidePanel />
      </div>
    </div>
  );
}

// Autosave the editable project to localStorage (debounced); restore it on mount
// when the editor opened blank (no initialImage) so a reload doesn't lose work.
function useAutosave(autoRestore: boolean) {
  const { doc, exportProject, loadProject } = useEditor();
  useEffect(() => {
    if (!autoRestore) return;
    const a = loadAutosave();
    if (a) loadProject(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const t = setTimeout(() => saveAutosave(exportProject()), 800);
    return () => clearTimeout(t);
  }, [doc, exportProject]);
}

// Picks desktop vs mobile layout; both share ONE EditorStage element + provider.
function Shell({ onSave, autoRestore }: { onSave?: (d: string) => void; autoRestore: boolean }) {
  useKeyboard();
  useAutosave(autoRestore);
  const mobile = useIsMobile();
  const stage = <EditorStage />;
  return (
    <TooltipProvider delayDuration={300}>
      {mobile ? <MobileShell stage={stage} onSave={onSave} /> : <DesktopShell stage={stage} onSave={onSave} />}
    </TooltipProvider>
  );
}

// Standalone, self-contained image editor. Drops into any height-bearing box.
export function ImageEditor({ initialImage, width, height, onSave, className }: ImageEditorProps) {
  const initialDoc = useMemo<Doc>(() => {
    const d = blankDoc(width ?? imageEditorConfig.defaultWidth, height ?? imageEditorConfig.defaultHeight);
    if (initialImage) d.layers.push(createLayer("image", { name: "Image", src: initialImage }));
    return d;
  }, [initialImage, width, height]);

  return (
    <div className={cn("h-full w-full", className)}>
      <EditorProvider initialDoc={initialDoc}>
        <Shell onSave={onSave} autoRestore={!initialImage} />
      </EditorProvider>
    </div>
  );
}
