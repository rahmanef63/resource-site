export type MarkdownSnippet = { label: string; snippet: string };

export const MARKDOWN_SNIPPETS: MarkdownSnippet[] = [
  { label: "H2", snippet: "\n## Heading\n" },
  { label: "Bold", snippet: "**bold**" },
  { label: "List", snippet: "\n- item\n" },
  { label: "Todo", snippet: "\n- [ ] task\n" },
  { label: "Quote", snippet: "\n> quote\n" },
  { label: "Callout", snippet: "\n> [!TIP]\n> heads up\n" },
  { label: "Code", snippet: "\n```ts\n\n```\n" },
  { label: "Table", snippet: "\n| A | B |\n| --- | --- |\n| 1 | 2 |\n" },
  { label: "Diagram", snippet: "\n```mermaid\nflowchart LR\n  A --> B\n```\n" },
  {
    label: "Chart",
    snippet: '\n```chart\n{ "type": "bar", "data": [{ "name": "A", "value": 3 }, { "name": "B", "value": 5 }] }\n```\n',
  },
];
