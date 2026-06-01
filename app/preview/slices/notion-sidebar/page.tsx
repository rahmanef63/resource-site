"use client";

import * as React from "react";
import { ArrowLeftRight, MousePointerClick, Pencil, Image as ImageIcon } from "lucide-react";
import { NotionSidebar, type NotionSidebarPage } from "@/features/notion-sidebar";
import { DynamicIcon, IconPickerPopover } from "@/features/icon-picker";

let seq = 100;
const nid = () => `p${seq++}`;

const SEED: NotionSidebarPage[] = [
  { id: "p1", title: "Getting started", icon: "🚀", parentId: null },
  { id: "p2", title: "Setup", icon: "⚙️", parentId: "p1" },
  { id: "p3", title: "First steps", icon: "👣", parentId: "p1" },
  { id: "p4", title: "Projects", icon: "📁", parentId: null },
  { id: "p5", title: "Roadmap", icon: "🗺️", parentId: "p4" },
  { id: "p6", title: "Notes", icon: "📝", parentId: null },
];

function renderIcon(icon: string, className?: string) {
  return <DynamicIcon value={icon} className={className} />;
}
function renderIconPicker({
  value, onChange, children,
}: { value: string; onChange: (next: string) => void; children: React.ReactNode }) {
  return (
    <IconPickerPopover value={value} onChange={onChange} onClear={() => onChange("📄")}>
      {children}
    </IconPickerPopover>
  );
}

/** notion-sidebar preview — a live workspace tree. Double-click a title to
 *  rename, drag the grip to reorder + reparent, click a row's icon to pick a
 *  new one, hover for +subpage / delete. The right pane echoes the selection. */
export default function Page() {
  const [pages, setPages] = React.useState<NotionSidebarPage[]>(SEED);
  const [activeId, setActiveId] = React.useState("p1");
  const active = pages.find((p) => p.id === activeId);

  const onCreate = (parentId: string | null) => {
    const id = nid();
    setPages((c) => [...c, { id, title: "Untitled", icon: "📄", parentId }]);
    setActiveId(id);
  };
  const onRename = (id: string, title: string) =>
    setPages((c) => c.map((p) => (p.id === id ? { ...p, title } : p)));
  const onIconChange = (id: string, icon: string) =>
    setPages((c) => c.map((p) => (p.id === id ? { ...p, icon } : p)));
  const onDelete = (id: string) => {
    const kill = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const p of pages) if (p.parentId && kill.has(p.parentId) && !kill.has(p.id)) { kill.add(p.id); grew = true; }
    }
    setPages((c) => c.filter((p) => !kill.has(p.id)));
  };
  const onMove = (id: string, parentId: string | null, beforeId: string | null) => {
    if (id === parentId) return;
    setPages((c) => {
      const moved = { ...c.find((p) => p.id === id)!, parentId };
      const rest = c.filter((p) => p.id !== id);
      const at = beforeId ? rest.findIndex((p) => p.id === beforeId) : -1;
      if (at < 0) rest.push(moved); else rest.splice(at, 0, moved);
      return rest;
    });
  };

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      <NotionSidebar
        pages={pages}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={onCreate}
        onRename={onRename}
        onDelete={onDelete}
        onMove={onMove}
        onIconChange={onIconChange}
        renderIcon={renderIcon}
        renderIconPicker={renderIconPicker}
        label="Workspace"
      />
      <section className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="flex items-center gap-3 text-4xl">
          {active ? <DynamicIcon value={active.icon} /> : "📄"}
          <h1 className="text-2xl font-semibold">{active?.title ?? "No page"}</h1>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><MousePointerClick className="h-4 w-4" /> Click a row to open it</li>
          <li className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Double-click a title to rename</li>
          <li className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> Drag the grip to reorder + nest</li>
          <li className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Click a row icon to pick a new one</li>
        </ul>
      </section>
    </main>
  );
}
