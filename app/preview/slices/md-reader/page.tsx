"use client";

import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { MarkdownReader } from "@/features/md-reader";
import { blocksToMarkdown } from "@notion/shared/lib/markdown";
import type { Block } from "@notion/shared/types/blocks";

/** md-reader preview — proves the sync contract. A sample notion block tree is
 *  run through `blocksToMarkdown` (the notion bridge) and the resulting
 *  markdown is both shown raw and rendered by <MarkdownReader>. Same grammar,
 *  same content — readable in the notion block page AND here. */

const b = (p: Partial<Block> & { type: Block["type"] }): Block => ({ id: p.type + Math.random(), text: "", ...p });

const NOTION_BLOCKS: Block[] = [
  b({ type: "h2", text: "Release notes" }),
  b({ type: "paragraph", text: "Authored as **notion blocks**, read here as markdown — _zero drift_. See `blocksToMarkdown`." }),
  b({ type: "callout", text: "This whole document is one notion page exported to markdown.", calloutKind: "tip" }),
  b({ type: "h3", text: "Highlights" }),
  b({ type: "bullet", text: "Rich inline: **bold**, _italic_, ~~strike~~, `code`, [links](/docs)" }),
  b({ type: "bullet", text: "GitHub-style callouts + nested toggles" }),
  b({ type: "todo", text: "Ship md-reader slice", checked: true }),
  b({ type: "todo", text: "Wire into docs", checked: false }),
  b({ type: "h3", text: "Math + code" }),
  b({ type: "equation", text: "e^{i\\pi} + 1 = 0" }),
  b({ type: "code", text: "import { MarkdownReader } from '@/features/md-reader';", lang: "ts" }),
  b({ type: "h3", text: "Comparison" }),
  b({ type: "table", tableRows: [["Surface", "Edits?", "Model"], ["notion", "yes", "Block[]"], ["md-reader", "no", "markdown"]], tableHeader: true, tableAlign: ["left", "center", "left"] }),
  b({ type: "toggle", text: "How does sync work?", children: [
    b({ type: "paragraph", text: "Both surfaces speak the same markdown grammar. The notion bridge serialises blocks → md; this reader parses md → nodes. No shared code, just a shared wire format." }),
  ] }),
  b({ type: "quote", text: "One document, two surfaces." }),
];

const MD = blocksToMarkdown(NOTION_BLOCKS);

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Markdown Reader"
      kind="ui"
      description="Read-only rich-text markdown container. Synced with the notion block editor via a shared markdown grammar."
      maxWidth="none"
    >
      <PreviewSection
        title="Rendered — <MarkdownReader content={markdown} />"
        hint="this markdown was produced from a notion Block[] via blocksToMarkdown — same content, read-only surface"
      >
        <div className="rounded-lg border border-border bg-background">
          <MarkdownReader content={MD} title="Release notes" icon="📄" maxWidth="3xl" />
        </div>
      </PreviewSection>

      <PreviewSection
        title="The wire format"
        hint="blocksToMarkdown(notionBlocks) → this exact string. markdownToBlocks() reverses it."
      >
        <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed">
          <code className="font-mono whitespace-pre">{MD}</code>
        </pre>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
