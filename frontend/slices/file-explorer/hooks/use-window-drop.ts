"use client";

import { useState, type DragEvent } from "react";
import type { UseDnd } from "./use-dnd";

// Window-wide drop zone: a dragged file/folder from the OS lands anywhere in the
// explorer (not just on the grid). Internal item moves are ignored at this level
// (they target individual folders/crumbs). Returns the active flag + handlers.
export function useWindowDrop(dnd: UseDnd, path: string) {
  const [dragActive, setDragActive] = useState(false);
  const isFileDrag = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  return {
    dragActive,
    onDragOver: (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      dnd.onDragOver(e, path);
      setDragActive(true);
    },
    onDragLeave: (e: DragEvent) => {
      if (e.relatedTarget === null) setDragActive(false); // left the window entirely
    },
    onDrop: (e: DragEvent) => {
      setDragActive(false);
      if (isFileDrag(e)) dnd.onDrop(e, path);
    },
  };
}
