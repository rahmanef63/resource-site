"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { LibraryIndex } from "./views/LibraryIndex";
import type { LibraryRow } from "./lib/types";

const ROWS: LibraryRow[] = [
  { _id: "1", slug: "ship-prompt", title: "Ship-faster system prompt", excerpt: "A terse system prompt that keeps agents on the vertical-slice rails.", kind: "prompt", tools: ["claude", "cursor"], upvotes: 42 },
  { _id: "2", slug: "cn-util", title: "cn() class merger", excerpt: "The tailwind-merge + clsx helper every component leans on.", kind: "snippet", tools: ["tailwind"], upvotes: 17 },
  { _id: "3", slug: "okhsl-ramp", title: "OKLch theme ramp", excerpt: "Twelve-step perceptual color ramp generator.", kind: "snippet", tools: ["tailwind"], upvotes: 9 },
  { _id: "4", slug: "hero-shot", title: "Product hero render", excerpt: "Studio-lit product hero, 16:9, transparent bg.", kind: "image", tools: ["midjourney"], upvotes: 31 },
  { _id: "5", slug: "review-prompt", title: "Code-review prompt", excerpt: "One-line-per-finding reviewer with severity tags.", kind: "prompt", tools: ["claude"], upvotes: 23 },
];

const SUBSET: Record<string, LibraryRow[]> = {
  "all-kinds": ROWS,
  "prompts-only": ROWS.filter((r) => r.kind === "prompt"),
  empty: [],
};

const preview: SlicePreviewModule = {
  LibraryIndex: ({ variant }) => {
    const scenario = variant.scenario ?? "all-kinds";
    const items = SUBSET[scenario] ?? ROWS;
    return (
      <div className="p-4">
        <LibraryIndex
          items={items}
          copy={{ eyebrow: "Resources", title: "Library", body: "Curated prompts, snippets & assets." }}
        />
      </div>
    );
  },
};
export default preview;
