"use client";

import * as React from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, type TreeNode } from "./file-tree";

interface Props {
  nodes: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}

/** Recursive tree row. Folders auto-open at depth 0; nested ones start
 *  closed so deep slices don't dump everything on the screen. */
export function TreeNodes({ nodes, selectedPath, onSelect, depth = 0 }: Props) {
  return (
    <ul className="text-xs">
      {nodes.map((n) => (
        <TreeRow
          key={n.path}
          node={n}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function TreeRow({
  node,
  selectedPath,
  onSelect,
  depth,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [open, setOpen] = React.useState(depth === 0);
  const pad = { paddingLeft: `${depth * 12 + 6}px` };

  if (node.kind === "file") {
    const isActive = selectedPath === node.path;
    return (
      <li>
        <button
          type="button"
          onClick={() => onSelect(node.path)}
          style={pad}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-sm py-1 pr-2 text-left transition-colors",
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
          )}
        >
          <File className="size-3 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{node.name}</span>
          {typeof node.size === "number" && (
            <span className="shrink-0 text-[10px] text-muted-foreground/70">
              {formatBytes(node.size)}
            </span>
          )}
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={pad}
        className="flex w-full items-center gap-1 rounded-sm py-1 pr-2 text-left text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            "size-3 shrink-0 transition-transform",
            open && "rotate-90",
          )}
        />
        {open ? (
          <FolderOpen className="size-3 shrink-0" />
        ) : (
          <Folder className="size-3 shrink-0" />
        )}
        <span className="flex-1 truncate font-medium">{node.name}</span>
      </button>
      {open && node.children && (
        <TreeNodes
          nodes={node.children}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth + 1}
        />
      )}
    </li>
  );
}
