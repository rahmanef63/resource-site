import type { BlockType } from "@notion/shared/types";

export interface BlockDescriptor {
  type: BlockType;
  label: string;
  hint: string;
  keywords: string[];
}

export const BLOCK_CATALOG: BlockDescriptor[] = [
  ["paragraph", "Text", "Plain text", ["text", "paragraph"]],
  ["h1", "Heading 1", "Large heading", ["h1", "heading"]],
  ["h2", "Heading 2", "Medium heading", ["h2", "heading"]],
  ["h3", "Heading 3", "Small heading", ["h3", "heading"]],
  ["h4", "Heading 4", "Compact heading", ["h4", "heading"]],
  ["h5", "Heading 5", "Smaller heading", ["h5", "heading"]],
  ["h6", "Heading 6", "Smallest heading", ["h6", "heading"]],
  ["todo", "To-do", "Checkbox task", ["todo", "task", "check"]],
  ["bullet", "Bulleted list", "Simple list", ["bullet", "list"]],
  ["numbered", "Numbered list", "Ordered list", ["numbered", "list"]],
  ["toggle", "Toggle", "Collapsible content", ["toggle", "collapse"]],
  ["quote", "Quote", "Quoted text", ["quote"]],
  ["callout", "Callout", "Highlighted note", ["callout", "note"]],
  ["code", "Code", "Code block", ["code"]],
  ["equation", "Equation", "LaTeX math", ["math", "latex"]],
  ["divider", "Divider", "Visual separator", ["divider", "hr"]],
  ["image", "Image", "Image URL", ["image", "photo"]],
  ["embed", "Embed", "Embed URL", ["embed", "iframe"]],
  ["audio", "Audio", "Audio URL", ["audio", "sound"]],
  ["video", "Video", "Video URL", ["video", "movie"]],
  ["page", "Page", "Child page", ["page", "subpage"]],
  ["database", "Database", "Inline database", ["database", "table"]],
  ["table", "Simple table", "Grid of text cells", ["table", "grid"]],
  ["button", "Button", "Link button", ["button", "cta"]],
  ["synced", "Synced block", "Reusable content", ["synced", "reuse"]],
  ["toc", "Table of contents", "Heading outline", ["toc", "outline"]],
  ["columns2", "2 Columns", "Two-column layout", ["columns", "layout"]],
  ["columns3", "3 Columns", "Three-column layout", ["columns", "layout"]],
  ["columns4", "4 Columns", "Four-column layout", ["columns", "layout"]],
  ["columns5", "5 Columns", "Five-column layout", ["columns", "layout"]],
].map(([type, label, hint, keywords]) => ({
  type: type as BlockType,
  label: label as string,
  hint: hint as string,
  keywords: keywords as string[],
}));

export function searchBlocks(query: string): BlockDescriptor[] {
  const q = query.trim().toLowerCase();
  if (!q) return BLOCK_CATALOG;
  return BLOCK_CATALOG.filter((item) =>
    item.label.toLowerCase().includes(q) || item.keywords.some((key) => key.includes(q)),
  );
}
