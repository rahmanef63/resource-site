import type { MdNode } from "./parse";

export type ListNode = Extract<MdNode, { type: "bullet" | "numbered" | "todo" }>;
export type MarkdownRenderGroup =
  | { kind: "node"; node: MdNode }
  | { kind: "list"; ordered: boolean; items: ListNode[] };

export function groupMarkdownNodes(nodes: MdNode[]): MarkdownRenderGroup[] {
  const out: MarkdownRenderGroup[] = [];
  let index = 0;
  while (index < nodes.length) {
    const node = nodes[index]!;
    if (isListNode(node)) {
      const ordered = node.type === "numbered";
      const items: ListNode[] = [];
      while (
        index < nodes.length &&
        isListNode(nodes[index]!) &&
        (nodes[index]!.type === "numbered") === ordered
      ) {
        items.push(nodes[index++]! as ListNode);
      }
      out.push({ kind: "list", ordered, items });
      continue;
    }
    out.push({ kind: "node", node });
    index += 1;
  }
  return out;
}

export function listItemMargin(indent: number): string | undefined {
  return indent ? `${indent * 1.25}rem` : undefined;
}

function isListNode(node: MdNode): node is ListNode {
  return node.type === "bullet" || node.type === "numbered" || node.type === "todo";
}
