"use client";

/**
 * Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 * Demos <MarkdownPage> across two axes: tabs (read-only vs full CRUD) and
 * content (basic doc vs diagram/chart-heavy doc). Edits persist to
 * localStorage via createDemoStore, keyed per content variant.
 */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { MarkdownPage } from "./components/MarkdownPage";

const BASIC = `## Release notes

Authored as **markdown**, editable in the _Write_ tab.

> [!TIP]
> Switch the \`tabs\` axis to **crud** to write + review.

- [x] Parse inline marks
- [ ] Wire comments to a backend

| Surface | Edits |
|---|:---:|
| Read | no |
| Write | yes |
`;

const RICH = `## Metrics

\`\`\`chart
{ "type": "bar", "title": "Installs / month", "data": [
  { "name": "Apr", "n": 23 }, { "name": "May", "n": 41 }, { "name": "Jun", "n": 58 } ],
  "series": ["n"] }
\`\`\`

## Flow

\`\`\`mermaid
flowchart LR
  A[notion blocks] -- blocksToMarkdown --> B[.md]
  B -- parseMarkdown --> C[this preview]
\`\`\`

Inline math: $e^{i\\pi} + 1 = 0$
`;

const { useDemoStore } = createDemoStore({
  slug: "markdown",
  seed: { basic: BASIC, rich: RICH },
});

const preview: SlicePreviewModule = {
  MarkdownPage: ({ variant }) => {
    const [docs, setDocs, { ready }] = useDemoStore();
    const content = (variant.content === "rich" ? "rich" : "basic") as
      | "basic"
      | "rich";
    if (!ready) return null;
    return (
      <MarkdownPage
        content={docs[content]}
        onContentChange={(next) => setDocs((d) => ({ ...d, [content]: next }))}
        tabs={
          variant.tabs === "crud" ? ["read", "write", "review"] : ["read"]
        }
        commentAuthor="You"
      />
    );
  },
};

export default preview;
