# Markdown — Svelte 5 / SvelteKit

Native Svelte distribution of the Markdown page container. It shares the exact parser, inline tokenizer, comments model, tab model, editor snippets, list grouping, and chart-spec parser with the React distribution.

## Install

```bash
npx rr add markdown --framework sveltekit
```

Runtime dependencies are `svelte@^5`, `katex@^0.16`, and `mermaid@^11`. The Svelte distribution does not pull React, Next, Lucide, shadcn, or Recharts.

## Surfaces

- `MarkdownPage` — Read / Write / Review surfaces.
- `MarkdownReader` — read-only rich Markdown rendering.
- `WriteTab` — source editor with shared snippet toolbar and live preview.
- `ReviewTab` — block-anchored and document comments.
- `MdNodeView` / `MarkdownNodes` — semantic node renderer and grouped lists.
- `MermaidBlock` — lazy Mermaid diagrams.
- `ChartBlock` — native SVG bar / line / area / pie charts using the same chart fence spec.
- `MathSpan` — lazy KaTeX equations.

The shared grammar supports headings, paragraphs, lists, todos, blockquotes, callouts, fenced code, Mermaid, charts, display/inline math, images, tables, toggles, links, bold/italic/strike, and inline code.
