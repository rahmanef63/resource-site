"use client";

import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { MarkdownPage } from "@/features/markdown";
import { blocksToMarkdown } from "@notion/shared/lib/markdown";
import type { Block } from "@notion/shared/types/blocks";

/** markdown slice preview — the full surface: Read / Write / Review tabs,
 *  mermaid diagram + recharts chart rendering, and the notion sync contract
 *  (the document below is a notion Block[] serialised via blocksToMarkdown).
 *  Comments + edits run on the slice's internal-state fallback — type in
 *  Write, comment in Review. */

const b = (p: Partial<Block> & { type: Block["type"] }): Block => ({ id: p.type + Math.random(), text: "", ...p });

const NOTION_BLOCKS: Block[] = [
  b({ type: "h2", text: "Q2 platform review" }),
  b({ type: "paragraph", text: "Authored as **notion blocks**, served here as markdown — _zero drift_. Edit me in the **Write** tab, comment in **Review**." }),
  b({ type: "callout", text: "Fenced ```mermaid and ```chart blocks below render as live views.", calloutKind: "tip" }),
  b({ type: "h3", text: "Pipeline" }),
  b({ type: "code", lang: "mermaid", text: 'flowchart LR\n  N["notion Block[]"] -- blocksToMarkdown --> M[".md"]\n  M -- parseMarkdown --> R["Read tab"]\n  M -- markdownToBlocks --> N' }),
  b({ type: "h3", text: "Adoption" }),
  b({ type: "code", lang: "chart", text: '{ "type": "bar", "title": "Slice installs / month", "data": [ { "name": "Mar", "installs": 14 }, { "name": "Apr", "installs": 23 }, { "name": "May", "installs": 41 }, { "name": "Jun", "installs": 58 } ], "series": ["installs"] }' }),
  b({ type: "code", lang: "chart", text: '{ "type": "pie", "title": "Surface usage", "data": [ { "name": "Read", "value": 62 }, { "name": "Write", "value": 26 }, { "name": "Review", "value": 12 } ] }' }),
  b({ type: "h3", text: "Status" }),
  b({ type: "todo", text: "CRUD tabs", checked: true }),
  b({ type: "todo", text: "Diagrams + charts", checked: true }),
  b({ type: "todo", text: "Wire comments to Convex (consumer side)", checked: false }),
  b({ type: "table", tableRows: [["Surface", "Edits?", "Model"], ["notion", "yes", "Block[]"], ["markdown", "optional", ".md string"]], tableHeader: true, tableAlign: ["left", "center", "left"] }),
  b({ type: "toggle", text: "How does sync work?", children: [
    b({ type: "paragraph", text: "Both surfaces speak the same markdown grammar. The notion bridge serialises blocks → md; this slice parses md → nodes. No shared code — a shared wire format." }),
  ] }),
  b({ type: "quote", text: "One document, two surfaces, three tabs." }),
];

const MD = blocksToMarkdown(NOTION_BLOCKS);

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Markdown"
      kind="ui"
      description="Markdown (.md) page container — Read / Write / Review tabs, mermaid diagrams, recharts charts. Notion-synced via shared grammar."
      maxWidth="none"
    >
      <PreviewSection
        title="<MarkdownPage tabs={['read','write','review']}> — full CRUD surface"
        hint="Write: edit source, watch live preview · Review: hover a block → 💬 add comment, ✓ resolve · charts + diagram render from fences"
      >
        <div className="rounded-lg border border-border bg-background">
          <MarkdownPage
            content={MD}
            tabs={["read", "write", "review"]}
            title="Q2 platform review"
            icon="📝"
            commentAuthor="You"
          />
        </div>
      </PreviewSection>

      <PreviewSection
        title="The wire format"
        hint="this exact string came from a notion Block[] via blocksToMarkdown — markdownToBlocks() reverses it"
      >
        <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed">
          <code className="font-mono whitespace-pre">{MD}</code>
        </pre>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
