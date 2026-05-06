/**
 * validateGraphRules — validates the graph invariants of a StudioUISchema.
 *
 * Checked invariants:
 *   1. All root IDs exist in nodes
 *   2. All children IDs exist in nodes
 *   3. No circular references
 *   4. Each node appears in at most one parent's children (single-parent)
 *   5. Root nodes must not appear as children
 *   6. Orphan node detection
 */

import type { StudioUISchema } from "../types/studio";
import type { ValidationIssue, ValidationMode } from "../types/validator";

export interface GraphRulesResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: {
    nodeCount: number;
    rootCount: number;
    maxDepth: number;
    orphanCount: number;
  };
}

export function validateGraphRules(
  schema: StudioUISchema,
  mode: ValidationMode = "strict"
): GraphRulesResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const { root, nodes } = schema;

  const rootSet = new Set(root);
  const nodeIds = new Set(Object.keys(nodes));

  // ── 1. Duplicate root IDs ────────────────────────────────────────────────
  if (root.length !== rootSet.size) {
    const seen = new Set<string>();
    for (const id of root) {
      if (seen.has(id)) {
        errors.push({
          code: "DUPLICATE_ROOT_ID",
          path: "/root",
          message: `Root ID "${id}" appears more than once in root[].`,
          severity: "error",
          details: { id },
        });
      }
      seen.add(id);
    }
  }

  // ── 2. Root IDs must exist in nodes ─────────────────────────────────────
  for (const id of root) {
    if (!nodeIds.has(id)) {
      errors.push({
        code: "UNKNOWN_ROOT_ID",
        path: "/root",
        message: `Root ID "${id}" does not exist in nodes map.`,
        severity: "error",
        nodeId: id,
        details: { id },
      });
    }
  }

  // ── Build parent map + check children existence ──────────────────────────
  const parentMap = new Map<string, string>(); // childId → parentId

  for (const [parentId, node] of Object.entries(nodes)) {
    if (!Array.isArray(node.children)) continue;

    const seenChildren = new Set<string>();
    for (const childId of node.children) {
      // 3. Child must exist in nodes
      if (!nodeIds.has(childId)) {
        errors.push({
          code: "UNKNOWN_CHILD_ID",
          path: `/nodes/${parentId}/children`,
          message: `Node "${parentId}" has child "${childId}" but no such node exists in nodes map.`,
          severity: "error",
          nodeId: parentId,
          details: { parentId, childId },
        });
        continue;
      }

      // 4. Duplicate children within same parent
      if (seenChildren.has(childId)) {
        errors.push({
          code: "DUPLICATE_CHILDREN",
          path: `/nodes/${parentId}/children`,
          message: `Node "${parentId}" lists child "${childId}" more than once in its children array.`,
          severity: "error",
          nodeId: parentId,
          details: { parentId, childId },
        });
      }
      seenChildren.add(childId);

      // 5. Single-parent invariant
      if (parentMap.has(childId)) {
        const otherParent = parentMap.get(childId)!;
        errors.push({
          code: "MULTIPLE_PARENTS",
          path: `/nodes/${parentId}/children`,
          message: `Node "${childId}" appears in both "${otherParent}" and "${parentId}" children arrays. Each node may only have one parent.`,
          severity: "error",
          nodeId: childId,
          details: { childId, parents: [otherParent, parentId] },
        });
      } else {
        parentMap.set(childId, parentId);
      }
    }
  }

  // ── 6. Root nodes must not appear as children ─────────────────────────────
  for (const rootId of root) {
    if (parentMap.has(rootId)) {
      const parentId = parentMap.get(rootId)!;
      errors.push({
        code: "ROOT_HAS_PARENT",
        path: "/root",
        message: `Root node "${rootId}" also appears as a child of "${parentId}". Root nodes must not have a parent.`,
        severity: "error",
        nodeId: rootId,
        details: { rootId, parentId },
      });
    }
  }

  // ── 7. Cycle detection (DFS) ─────────────────────────────────────────────
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycleDetected = new Set<string>();

  function dfs(id: string, path: string[]): boolean {
    if (visiting.has(id)) {
      if (!cycleDetected.has(id)) {
        cycleDetected.add(id);
        errors.push({
          code: "CIRCULAR_REFERENCE",
          path: `/nodes/${id}`,
          message: `Circular reference detected involving node "${id}". Cycle path: ${[...path, id].join(" → ")}.`,
          severity: "error",
          nodeId: id,
          details: { cyclePath: [...path, id] },
        });
      }
      return true;
    }
    if (visited.has(id)) return false;
    visiting.add(id);
    const node = nodes[id];
    if (node?.children) {
      for (const childId of node.children) {
        if (nodeIds.has(childId)) {
          dfs(childId, [...path, id]);
        }
      }
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  for (const rootId of root) {
    if (nodeIds.has(rootId)) dfs(rootId, []);
  }

  // ── 8. Orphan detection ──────────────────────────────────────────────────
  function collectReachable(startIds: string[]): Set<string> {
    const reachable = new Set<string>();
    const queue = [...startIds];
    while (queue.length > 0) {
      const id = queue.pop()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      const node = nodes[id];
      if (node?.children) {
        for (const childId of node.children) {
          if (nodeIds.has(childId) && !reachable.has(childId)) {
            queue.push(childId);
          }
        }
      }
    }
    return reachable;
  }

  const reachable = collectReachable(root.filter(id => nodeIds.has(id)));
  let orphanCount = 0;
  for (const id of nodeIds) {
    if (!reachable.has(id)) {
      orphanCount++;
      const orphanIssue: ValidationIssue = {
        code: "ORPHAN_NODE",
        path: `/nodes/${id}`,
        message: `Node "${id}" is not reachable from root[]. It will not be rendered.`,
        severity: mode === "strict" ? "error" : "warning",
        nodeId: id,
      };
      if (mode === "strict") errors.push(orphanIssue);
      else warnings.push(orphanIssue);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  function maxDepth(id: string, depth: number, seen: Set<string>): number {
    if (seen.has(id)) return depth;
    seen.add(id);
    const node = nodes[id];
    if (!node?.children?.length) return depth;
    return Math.max(...node.children.map(c => maxDepth(c, depth + 1, new Set(seen))));
  }

  const depthValues = root.filter(id => nodeIds.has(id)).map(id => maxDepth(id, 0, new Set()));

  return {
    errors,
    warnings,
    stats: {
      nodeCount: nodeIds.size,
      rootCount: root.length,
      maxDepth: depthValues.length > 0 ? Math.max(...depthValues) : 0,
      orphanCount,
    },
  };
}
