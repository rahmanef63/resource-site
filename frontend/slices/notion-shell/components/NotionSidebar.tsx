"use client";

/** <NotionSidebar /> — tree nav primitive with full page CRUD.
 *
 *  Pure / callback-based: parent supplies the flat page list, this
 *  component builds the tree. Click → onSelect, hover row → +/✎/🗑.
 *  Each row carries inline operations so the sidebar IS the property
 *  manager — no separate "edit page" dialog needed for basic CRUD.
 */

import { useMemo, useState, type ReactNode } from "react";
import { ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NotionSidebarPage {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
}

export interface NotionSidebarProps {
  pages: NotionSidebarPage[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  /** Header label above the tree, e.g. "Workspace" or "Private". */
  label?: string;
  /** Host-provided icon renderer per row. Default fallback renders the
   *  icon string as plain text (suitable for emoji). Wire
   *  `@/features/icon-picker`'s `DynamicIcon` for full lucide support. */
  renderIcon?: (icon: string, className?: string) => ReactNode;
}

function defaultRenderIcon(icon: string, className?: string) {
  return <span className={className}>{icon}</span>;
}

interface TreeNode { page: NotionSidebarPage; children: TreeNode[] }

function buildTree(pages: NotionSidebarPage[]): TreeNode[] {
  const map = new Map<string, TreeNode>(pages.map((p) => [p.id, { page: p, children: [] }]));
  const roots: TreeNode[] = [];
  for (const p of pages) {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) map.get(p.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export function NotionSidebar({
  pages, activeId,
  onSelect, onCreate, onRename, onDelete,
  className, label = "Pages",
  renderIcon = defaultRenderIcon,
}: NotionSidebarProps) {
  const tree = useMemo(() => buildTree(pages), [pages]);
  return (
    <aside className={cn("flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-card/40 p-2", className)}>
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {onCreate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCreate(null)}
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            aria-label="Add page"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      <ul className="space-y-0.5 overflow-y-auto">
        {tree.map((node) => (
          <SidebarRow
            key={node.page.id} node={node} depth={0}
            activeId={activeId}
            onSelect={onSelect} onCreate={onCreate}
            onRename={onRename} onDelete={onDelete}
            renderIcon={renderIcon}
          />
        ))}
        {tree.length === 0 && (
          <li className="px-2 py-2 text-xs text-muted-foreground italic">No pages yet</li>
        )}
      </ul>
    </aside>
  );
}

interface RowProps {
  node: TreeNode;
  depth: number;
  activeId?: string;
  onSelect?: (id: string) => void;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  renderIcon: (icon: string, className?: string) => ReactNode;
}

function SidebarRow({ node, depth, activeId, onSelect, onCreate, onRename, onDelete, renderIcon }: RowProps) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.page.title);
  const hasChildren = node.children.length > 0;
  const isActive = node.page.id === activeId;
  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent",
          isActive && "bg-accent font-medium text-foreground",
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <Button
          variant="ghost" size="icon"
          onClick={() => setOpen((o) => !o)}
          className={cn("h-4 w-4 p-0 text-muted-foreground", !hasChildren && "invisible")}
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronRight className={cn("h-3 w-3 transition", open && "rotate-90")} />
        </Button>
        {renderIcon(node.page.icon, "text-sm shrink-0")}
        {editing ? (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { if (draft.trim()) onRename?.(node.page.id, draft.trim()); setEditing(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); } if (e.key === "Escape") { setDraft(node.page.title); setEditing(false); } }}
            className="h-auto flex-1 border-0 bg-transparent px-1 py-0 text-xs shadow-none focus-visible:ring-0"
          />
        ) : (
          <Button
            variant="ghost"
            onClick={() => onSelect?.(node.page.id)}
            className="h-auto flex-1 justify-start truncate px-1 py-0 text-left text-xs font-normal hover:bg-transparent"
          >
            {node.page.title || "Untitled"}
          </Button>
        )}
        <div className="ml-auto hidden items-center gap-0.5 group-hover:flex">
          {onCreate && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onCreate(node.page.id); }} className="h-5 w-5 text-muted-foreground" title="New subpage"><Plus className="h-3 w-3" /></Button>}
          {onRename && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="h-5 w-5 text-muted-foreground" title="Rename"><Pencil className="h-3 w-3" /></Button>}
          {onDelete && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(node.page.id); }} className="h-5 w-5 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="h-3 w-3" /></Button>}
        </div>
      </div>
      {open && hasChildren && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <SidebarRow
              key={child.page.id} node={child} depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect} onCreate={onCreate}
              onRename={onRename} onDelete={onDelete}
              renderIcon={renderIcon}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
