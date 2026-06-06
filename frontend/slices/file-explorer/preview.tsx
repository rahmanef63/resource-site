"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { useMemo } from "react";
import { FileExplorer } from "./file-explorer";
import { createMockAdapter } from "./adapter/mock";

const PATHS: Record<string, string> = {
  root: "/",
  documents: "/Documents",
  projects: "/Projects",
};

const preview: SlicePreviewModule = {
  FileExplorer: ({ variant }) => {
    const scenario = variant.scenario ?? "root";
    const initialPath = PATHS[scenario] ?? "/";
    // One mock adapter per mount — CRUD (rename / new folder / move) mutates
    // the in-memory tree, so edits persist while the preview stays mounted.
    const adapter = useMemo(() => createMockAdapter(), []);
    return (
      <div className="p-4">
        <div className="h-[420px] overflow-hidden rounded-lg border bg-background">
          <FileExplorer
            adapter={adapter}
            initialPath={initialPath}
            rootLabel="Files"
            className="h-full"
          />
        </div>
      </div>
    );
  },
};

export default preview;
