/** Tree helpers for the sidebar's drag-reorder. Flatten the page list into a
 *  depth-tagged render order, hide descendants of collapsed/dragged nodes, and
 *  project a drag's horizontal offset onto a target depth + parent (the
 *  canonical @dnd-kit sortable-tree algorithm, trimmed). */

import { arrayMove } from "@dnd-kit/sortable";
import type { NotionSidebarPage, FlatPage } from "../types";

interface TNode { page: NotionSidebarPage; children: TNode[] }

function buildTree(pages: NotionSidebarPage[]): TNode[] {
  const map = new Map<string, TNode>(pages.map((p) => [p.id, { page: p, children: [] }]));
  const roots: TNode[] = [];
  for (const p of pages) {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) map.get(p.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

/** Flatten ALL pages (including collapsed descendants) into render order. */
export function flatten(pages: NotionSidebarPage[]): FlatPage[] {
  const out: FlatPage[] = [];
  const walk = (nodes: TNode[], depth: number) => {
    for (const n of nodes) {
      out.push({ ...n.page, depth, childCount: n.children.length });
      walk(n.children, depth + 1);
    }
  };
  walk(buildTree(pages), 0);
  return out;
}

/** Drop every descendant of any id in `ids` (used to hide collapsed subtrees
 *  and the dragged node's own children during a drag). */
export function removeDescendantsOf(flat: FlatPage[], ids: string[]): FlatPage[] {
  const exclude = new Set(ids);
  return flat.filter((item) => {
    if (item.parentId && exclude.has(item.parentId)) { exclude.add(item.id); return false; }
    return true;
  });
}

const INDENT = 16;

/** Project a drag onto a target { depth, parentId } from the visible order. */
export function getProjection(
  visible: FlatPage[], activeId: string, overId: string, dragX: number,
): { depth: number; parentId: string | null } {
  const overIndex = visible.findIndex((i) => i.id === overId);
  const activeIndex = visible.findIndex((i) => i.id === activeId);
  const moved = arrayMove(visible, activeIndex, overIndex);
  const prev = moved[overIndex - 1];
  const next = moved[overIndex + 1];
  const projectedDepth = (visible[activeIndex]?.depth ?? 0) + Math.round(dragX / INDENT);
  const maxDepth = prev ? prev.depth + 1 : 0;
  const minDepth = next ? next.depth : 0;
  const depth = Math.max(minDepth, Math.min(projectedDepth, maxDepth));

  let parentId: string | null = null;
  if (depth > 0 && prev) {
    if (depth === prev.depth) parentId = prev.parentId;
    else if (depth > prev.depth) parentId = prev.id;
    else parentId = moved.slice(0, overIndex).reverse().find((i) => i.depth === depth)?.parentId ?? null;
  }
  return { depth, parentId };
}

/** The sibling the dragged page lands in front of, derived from the new order. */
export function beforeIdAfterDrop(
  visible: FlatPage[], activeId: string, overId: string, parentId: string | null,
): string | null {
  const activeIndex = visible.findIndex((i) => i.id === activeId);
  const overIndex = visible.findIndex((i) => i.id === overId);
  const moved = arrayMove(visible, activeIndex, overIndex);
  const pos = moved.findIndex((i) => i.id === activeId);
  for (let k = pos + 1; k < moved.length; k++) {
    if (moved[k]!.parentId === parentId || moved[k]!.id === parentId) {
      return moved[k]!.parentId === parentId ? moved[k]!.id : null;
    }
  }
  return null;
}
