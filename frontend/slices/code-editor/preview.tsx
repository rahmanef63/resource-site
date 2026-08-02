"use client";

/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { CodeEditor } from "./index";

// Scenario → payload path into the bundled writable mock fs (lib/seed.ts).
// No payload opens the default seed file (/Projects/hello.ts).
const SCENARIO_PAYLOAD: Record<string, { path: string } | undefined> = {
  "sample-tree": undefined,
  "markdown-doc": { path: "/Documents/roadmap.md" },
  "python-script": { path: "/apps/scraper.py" },
};

const preview: SlicePreviewModule = {
  CodeEditor: ({ variant }) => {
    const scenario = variant.scenario ?? "sample-tree";
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border border-border">
          <CodeEditor key={scenario} payload={SCENARIO_PAYLOAD[scenario]} />
        </div>
      </div>
    );
  },
};

export default preview;
