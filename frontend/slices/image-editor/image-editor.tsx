"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { EditorProvider } from "./lib/store";
import { blankDoc, createLayer } from "./lib/model";
import { imageEditorConfig } from "./config";
import { ToolRail } from "./components/tool-rail";
import { TopBar } from "./components/top-bar";
import { ToolOptionsBar } from "./components/tool-options-bar";
import { SidePanel } from "./components/side-panel";
import { useKeyboard } from "./hooks/use-keyboard";
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

function Shell({ onSave }: { onSave?: (d: string) => void }) {
  useKeyboard();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <TopBar onSave={onSave} />
      <ToolOptionsBar />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <div className="min-w-0 flex-1">
          <EditorStage />
        </div>
        <SidePanel />
      </div>
    </div>
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
        <Shell onSave={onSave} />
      </EditorProvider>
    </div>
  );
}
