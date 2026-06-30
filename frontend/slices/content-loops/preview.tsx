"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { ContentLoop } from "./components/ContentLoop";
import { createMockLoopSource } from "./lib/mock-source";
import type { LoopItem } from "./lib/types";

const source = createMockLoopSource({ count: 9 });

function CardVariant({ item }: { item: LoopItem }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">{String(item.fields.title)}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{String(item.fields.excerpt)}</p>
      <p className="mt-2 text-xs text-muted-foreground">— {String(item.fields.author)}</p>
    </div>
  );
}

function FeaturedVariant({ item }: { item: LoopItem }) {
  return (
    <div className="rounded-lg border border-primary bg-primary/5 p-4">
      <h3 className="text-sm font-semibold text-foreground">★ {String(item.fields.title)}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{String(item.fields.excerpt)}</p>
    </div>
  );
}

const preview: SlicePreviewModule = {
  ContentLoop: ({ variant }) => (
    <div className="p-4">
      <ContentLoop
        source={source}
        pagination={(variant.pagination as "none" | "infinite") ?? "none"}
        limit={6}
        pageSize={3}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        variants={[CardVariant, FeaturedVariant]}
      />
    </div>
  ),
};
export default preview;
