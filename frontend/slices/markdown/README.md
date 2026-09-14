# markdown

Rich Markdown page container with Read, Write, and Review surfaces. The parser and inline grammar are framework-neutral; both React and Svelte render the same `MdNode` model and comment anchors.

## Frameworks

React/default:

```bash
npx rr add markdown
```

Svelte 5 / SvelteKit:

```bash
npx rr add markdown --framework sveltekit
```

## Shared grammar

Headings, paragraphs, bullets, numbered lists, todos, quotes, GitHub-style callouts, fenced code, Mermaid fences, chart fences, display/inline KaTeX, images, tables, toggles, bold/italic/strike, links, and inline code.

Both frameworks share the same parser, inline tokenizer, comments model, tab model, editor snippets, semantic list grouping, and chart-spec parser.

## Renderer differences

React keeps the existing shadcn/Lucide UI and lazy Recharts canvas. Svelte uses native controls and an SVG chart renderer, so it does not install React, Next, Lucide, shadcn, or Recharts. Mermaid and KaTeX stay lazy-loaded in both because they are content semantics rather than renderer chrome.

## Main exports

- `MarkdownPage` — standalone Read/Write/Review container.
- `MarkdownReader` — read-only rich document.
- `MdNodeView` / `renderNodes` — parsed node rendering.
- `MermaidBlock` / `ChartBlock` — rich fenced blocks.
- `parseMarkdown`, `tokenizeInline` — framework-neutral parsing/tokenization.
- `MdComment`, `newCommentId`, `commentsFor`, `openCount` — review model.
