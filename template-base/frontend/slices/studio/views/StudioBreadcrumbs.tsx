/**
 * StudioBreadcrumbs — shows the AST path from root to selected node.
 * Format: Page > section > div > button
 * Click on any ancestor to select + focus it.
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useSharedCanvas } from '@/frontend/shared/builder';
import type { Node, Edge } from 'reactflow';

interface StudioBreadcrumbsProps {
  selectedNodeId: string | null;
}

function buildPath(nodeId: string | null, nodes: Node[], edges: Edge[]): Node[] {
  if (!nodeId) return [];
  const path: Node[] = [];
  let current: string | null = nodeId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const node = nodes.find(n => n.id === current);
    if (node) path.unshift(node);
    const parentEdge = edges.find(e => e.target === current);
    current = parentEdge ? parentEdge.source : null;
  }
  return path;
}

export function StudioBreadcrumbs({ selectedNodeId }: StudioBreadcrumbsProps) {
  const { nodes, edges, setSelectedNodeId, focusNode } = useSharedCanvas();

  const path = buildPath(selectedNodeId, nodes as Node[], edges as Edge[]);

  if (!selectedNodeId || path.length === 0) {
    return <div className="shrink-0" />;
  }

  return (
    <div className="flex items-center gap-0.5 px-3 py-1 border-b border-border/40 bg-background/50 shrink-0 overflow-x-auto">
      {path.map((node, idx) => {
        const isLast = idx === path.length - 1;
        const label = node.data?.comp || node.type || node.id.slice(0, 6);
        return (
          <React.Fragment key={node.id}>
            <button
              onClick={() => {
                setSelectedNodeId(node.id);
                focusNode(node.id);
              }}
              className={`text-[10px] transition-colors whitespace-nowrap ${
                isLast
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
            {!isLast && (
              <ChevronRight size={10} className="text-muted-foreground/40 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
