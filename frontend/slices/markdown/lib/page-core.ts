export type MarkdownTab = "read" | "write" | "review";

export const MARKDOWN_TAB_LABEL: Record<MarkdownTab, string> = {
  read: "Read",
  write: "Write",
  review: "Review",
};

export function normalizeMarkdownTabs(tabs?: MarkdownTab[]): MarkdownTab[] {
  return tabs?.length ? tabs : ["read"];
}
