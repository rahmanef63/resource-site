import { defineFeature } from "@/lib/shared/features/defineFeature";

/**
 * `md-reader` — read-only markdown page container with rich text. The sibling
 * read surface to the `notion` block editor: both speak the same markdown
 * grammar, so content authored as notion blocks (serialised via
 * `@notion/shared/lib/markdown` → `blocksToMarkdown`) renders here identically.
 * Self-contained — its own parser + inline renderer, no notion runtime dep.
 */
export const mdReaderFeature = defineFeature({
  slug: "md-reader",
  title: "Markdown Reader",
  category: "content",
  routes: [],
  nav: { label: "MD Reader", group: "content", order: 62 },
});
