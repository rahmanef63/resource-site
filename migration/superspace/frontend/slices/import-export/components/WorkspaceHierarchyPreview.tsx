"use client";

import React from "react";
import { Building2, GitBranch, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MigrationValidationResult } from "../types";

interface WorkspaceHierarchyPreviewProps {
  preview: NonNullable<MigrationValidationResult["preview"]>;
}

interface TreeNode {
  localId: string;
  name: string;
  type: string;
  parentLocalId: string | null;
  rolesCount: number;
  membersCount: number;
  featuresCount: number;
  children: TreeNode[];
}

function buildTree(
  items: NonNullable<MigrationValidationResult["preview"]>["hierarchy"]
): TreeNode[] {
  const map = new Map<string, TreeNode>();
  items.forEach((item) => {
    map.set(item.localId, { ...item, children: [] });
  });
  const roots: TreeNode[] = [];
  items.forEach((item) => {
    const node = map.get(item.localId)!;
    if (item.parentLocalId) {
      const parent = map.get(item.parentLocalId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function TreeNodeRow({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {depth > 0 && (
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
        {node.children.length > 0 ? (
          <Building2 className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm font-medium flex-1">{node.name}</span>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            {node.type}
          </Badge>
          {node.rolesCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {node.rolesCount} roles
            </Badge>
          )}
          {node.featuresCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {node.featuresCount} features
            </Badge>
          )}
          {node.membersCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {node.membersCount} members
            </Badge>
          )}
        </div>
      </div>
      {node.children.map((child) => (
        <TreeNodeRow key={child.localId} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function WorkspaceHierarchyPreview({
  preview,
}: WorkspaceHierarchyPreviewProps) {
  const tree = buildTree(preview.hierarchy);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-bold">{preview.totalWorkspaces}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Workspaces</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-bold">{preview.rootWorkspaces}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Root</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-bold">{preview.totalRoles}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Custom Roles</div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-2xl font-bold">{preview.totalMembers}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Members</div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Workspace Hierarchy
        </div>
        <div className="divide-y">
          {tree.map((node) => (
            <TreeNodeRow key={node.localId} node={node} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
