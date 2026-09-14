"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  createEditorContext,
  createEditorCore,
  type CodeEditorContext,
  type EditorCore,
  type SaveState,
} from "./editor-core";

export type { SaveState } from "./editor-core";

// React binding over the framework-neutral observable editor core. The
// returned context has stable method identity and live getters, while
// useSyncExternalStore drives React rerenders when the core snapshot changes.
export function useEditor(): CodeEditorContext {
  const coreRef = useRef<EditorCore | null>(null);
  const ctxRef = useRef<CodeEditorContext | null>(null);
  if (!coreRef.current) {
    coreRef.current = createEditorCore();
    ctxRef.current = createEditorContext(coreRef.current);
  }
  useSyncExternalStore(
    coreRef.current.subscribe,
    coreRef.current.getSnapshot,
    coreRef.current.getSnapshot,
  );
  return ctxRef.current!;
}

// Keep the historical type export reachable for components that imported it.
export type { SaveState as EditorSaveState };
