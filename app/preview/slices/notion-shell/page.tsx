"use client";

import * as React from "react";
import {
  NotionPage,
  NotionSidebar,
  NotionBlock,
  InsertBlockButton,
  type Block,
  type BlockType,
  type Database,
  type Page,
  type PropertyValue,
} from "@/features/notion-shell";
import { NotionDatabase } from "@/features/notion-database";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

/** Live demo for the Notion-style wrapper primitives. Each demo is
 *  fully props-driven — state lives in this preview surface,
 *  callbacks update local React state. */
export default function Page() {
  return (
    <SlicePreviewLayout title="Notion Shell" kind="ui" maxWidth="none">
      <PreviewSection
        title="1. NotionSidebar — tree nav with full page CRUD"
        hint="hover row → +/✎/🗑 · click chevron to collapse · click row to select"
      >
        <SidebarDemo />
      </PreviewSection>

      <PreviewSection
        title="2. NotionPage + NotionBlock — slash menu, markdown triggers, drag-handle slot"
        hint='type "/" inside a block for the picker · "# ", "- ", "[] ", "> ", "``` " convert on the fly · backspace on empty removes · click "+ Add block" to insert'
      >
        <PageDemo />
      </PreviewSection>

      <PreviewSection
        title="3. NotionDatabase + NotionProperty — table view w/ per-cell CRUD"
        hint="edit cells inline · add property / row from footer buttons · hover row for delete"
      >
        <DatabaseDemo />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

const SEED_PAGES = [
  { id: "p1", parentId: null, title: "Inbox", icon: "📥" },
  { id: "p2", parentId: null, title: "Projects", icon: "🚀" },
  { id: "p3", parentId: "p2", title: "Q1 launch", icon: "🎯" },
  { id: "p4", parentId: "p2", title: "Q2 launch", icon: "🌱" },
  { id: "p5", parentId: null, title: "Notes", icon: "📝" },
];

function SidebarDemo() {
  const [pages, setPages] = React.useState(SEED_PAGES);
  const [activeId, setActiveId] = React.useState<string>("p1");
  return (
    <div className="flex h-80 rounded-lg border border-border bg-background">
      <NotionSidebar
        pages={pages}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={(parentId) => setPages((p) => [...p, { id: `p${Date.now()}`, parentId, title: "Untitled", icon: "📄" }])}
        onRename={(id, title) => setPages((p) => p.map((x) => (x.id === id ? { ...x, title } : x)))}
        onDelete={(id) => setPages((p) => p.filter((x) => x.id !== id && x.parentId !== id))}
      />
      <div className="flex-1 p-6 text-sm text-muted-foreground">
        Selected: <span className="font-mono text-foreground">{activeId}</span>
      </div>
    </div>
  );
}

const DEFAULT_BLOCKS: Block[] = [
  { id: "b1", type: "h2", text: "Hello from NotionPage" },
  {
    id: "b2",
    type: "paragraph",
    text: 'Type "/" anywhere to open the block picker. Try "# " for heading, "- " for bullet, "> " for quote, "[] " for todo.',
  },
  { id: "b3", type: "quote", text: "Pure props-driven — host owns the data." },
  { id: "b4", type: "paragraph", text: "" },
];

function PageDemo() {
  const [icon, setIcon] = React.useState("📘");
  const [title, setTitle] = React.useState("Untitled page");
  const [blocks, setBlocks] = React.useState<Block[]>(DEFAULT_BLOCKS);

  const updateBlock = (id: string, patch: Partial<Block>) =>
    setBlocks((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const turnInto = (id: string, type: BlockType) =>
    setBlocks((cur) => cur.map((x) => (x.id === id ? { ...x, type } : x)));

  const removeBlock = (id: string) =>
    setBlocks((cur) => {
      const next = cur.filter((x) => x.id !== id);
      return next.length > 0 ? next : [{ id: `b${Date.now()}`, type: "paragraph", text: "" }];
    });

  const duplicateBlock = (id: string) =>
    setBlocks((cur) => {
      const idx = cur.findIndex((x) => x.id === id);
      if (idx === -1) return cur;
      const src = cur[idx];
      const clone: Block = { ...src, id: `b${Date.now()}` };
      const next = [...cur];
      next.splice(idx + 1, 0, clone);
      return next;
    });

  const insertBlock = (type: BlockType) =>
    setBlocks((cur) => [...cur, { id: `b${Date.now()}`, type, text: "" }]);

  return (
    <div className="h-[28rem] overflow-y-auto rounded-lg border border-border bg-background">
      <NotionPage
        icon={icon}
        title={title}
        onIconChange={setIcon}
        onTitleChange={setTitle}
      >
        <div className="space-y-1">
          {blocks.map((b) => (
            <NotionBlock
              key={b.id}
              block={b}
              onUpdate={(patch) => updateBlock(b.id, patch)}
              onTurnInto={(type) => turnInto(b.id, type)}
              onDuplicate={() => duplicateBlock(b.id)}
              onRemove={() => removeBlock(b.id)}
            />
          ))}
          <div className="pt-3">
            <InsertBlockButton onInsert={insertBlock} label="Add block" />
          </div>
        </div>
      </NotionPage>
    </div>
  );
}

function DatabaseDemo() {
  const [db, setDb] = React.useState<Database>({
    id: "db1",
    name: "Roadmap",
    icon: "🗺️",
    properties: [
      { id: "name", name: "Name", type: "text" },
      { id: "status", name: "Status", type: "select", options: [
        { id: "todo", name: "Todo", color: "gray" },
        { id: "doing", name: "Doing", color: "blue" },
        { id: "done", name: "Done", color: "green" },
      ]},
      { id: "done", name: "Done", type: "checkbox" },
    ],
    rowIds: ["r1", "r2", "r3"],
    views: [],
    activeViewId: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const [rows, setRows] = React.useState<Page[]>([
    { id: "r1", parentId: null, title: "Ship notion-shell", icon: "📦", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "db1", rowProps: { name: "Ship notion-shell", status: "doing", done: false } },
    { id: "r2", parentId: null, title: "Wire template",     icon: "🔌", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "db1", rowProps: { name: "Wire template",     status: "todo",  done: false } },
    { id: "r3", parentId: null, title: "Validate + push",   icon: "✅", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "db1", rowProps: { name: "Validate + push",   status: "todo",  done: false } },
  ]);
  return (
    <NotionDatabase
      db={db}
      rows={rows}
      onPropertyAdd={(type) => {
        const id = `p${Date.now()}`;
        setDb((d) => ({ ...d, properties: [...d.properties, { id, name: "New", type }] }));
      }}
      onPropertyRemove={(propId) => setDb((d) => ({ ...d, properties: d.properties.filter((p) => p.id !== propId) }))}
      onRowAdd={() => {
        const id = `r${Date.now()}`;
        setRows((rs) => [...rs, { id, parentId: null, title: "New row", icon: "📄", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: db.id, rowProps: {} }]);
        setDb((d) => ({ ...d, rowIds: [...d.rowIds, id] }));
      }}
      onRowUpdate={(rowId, propId, value: PropertyValue) =>
        setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, rowProps: { ...r.rowProps, [propId]: value } } : r)))
      }
      onRowRemove={(rowId) => {
        setRows((rs) => rs.filter((r) => r.id !== rowId));
        setDb((d) => ({ ...d, rowIds: d.rowIds.filter((id) => id !== rowId) }));
      }}
    />
  );
}
