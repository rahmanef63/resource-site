import { describe, expect, it } from "vitest";
import { tokenizeInline } from "./inline-core";
import { normalizeMarkdownTabs } from "./page-core";
import { groupMarkdownNodes, listItemMargin } from "./render-core";
import { MARKDOWN_SNIPPETS } from "./snippets";
import type { MdNode } from "./parse";

describe("markdown framework-neutral core", () => {
  it("tokenizes shared inline grammar", () => {
    expect(tokenizeInline("**bold** [Docs](/docs) $x$" ).map((token) => token.kind)).toEqual([
      "bold", "text", "link", "text", "math",
    ]);
  });

  it("normalizes empty tab sets to read", () => {
    expect(normalizeMarkdownTabs([])).toEqual(["read"]);
    expect(normalizeMarkdownTabs(["write", "review"])).toEqual(["write", "review"]);
  });

  it("groups adjacent lists without crossing ordered boundaries", () => {
    const nodes: MdNode[] = [
      { type: "bullet", text: "a", indent: 0 },
      { type: "todo", text: "b", checked: false, indent: 1 },
      { type: "numbered", text: "c", indent: 0 },
      { type: "paragraph", text: "done" },
    ];
    const groups = groupMarkdownNodes(nodes);
    expect(groups.map((group) => group.kind)).toEqual(["list", "list", "node"]);
    expect(groups[0]?.kind === "list" && groups[0].items.length).toBe(2);
    expect(groups[1]?.kind === "list" && groups[1].ordered).toBe(true);
  });

  it("uses deterministic indentation and one shared snippet registry", () => {
    expect(listItemMargin(2)).toBe("2.5rem");
    expect(listItemMargin(0)).toBeUndefined();
    expect(MARKDOWN_SNIPPETS.map((item) => item.label)).toContain("Diagram");
    expect(MARKDOWN_SNIPPETS.map((item) => item.label)).toContain("Chart");
  });
});
