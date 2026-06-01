"use client";

/** App-level block-renderer wiring for the notion-shell preview. notion-shell
 *  ships every self-contained renderer built-in (incl. code/equation); the
 *  host only injects `database` + `toc` (host data + sibling notion-database
 *  slice — compose here). */

import * as React from "react";
import {
  createDefaultBlockRenderers,
  TocBlock,
  focusBlock,
  type BlockRendererProps,
  type BlockRenderers,
  type TocHeading,
} from "@/features/notion-shell";
import { NotionDatabase, type Database, type Page } from "@/features/notion-database";

/** Inline database block — mounts the full notion-database surface. A real
 *  host resolves block.databaseId to its stored db/rows; the preview keeps
 *  a tiny local one. */
const INLINE_DB: Database = {
  id: "inline", name: "Tasks", icon: "✅",
  properties: [
    { id: "name", name: "Name", type: "text" },
    { id: "done", name: "Done", type: "checkbox" },
  ],
  rowIds: ["r1", "r2"], views: [], activeViewId: "",
  createdAt: 0, updatedAt: 0,
};
function DatabaseAdapter(_props: BlockRendererProps) {
  const [rows, setRows] = React.useState<Page[]>([
    { id: "r1", parentId: null, title: "Draft spec", icon: "📝", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "inline", rowProps: { name: "Draft spec", done: true } },
    { id: "r2", parentId: null, title: "Review PR", icon: "🔍", blocks: [], favorite: false, trashed: false, createdAt: 0, updatedAt: 0, rowOfDatabaseId: "inline", rowProps: { name: "Review PR", done: false } },
  ]);
  return (
    <NotionDatabase
      db={INLINE_DB}
      rows={rows}
      onRowUpdate={(id, propId, value) =>
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, rowProps: { ...r.rowProps, [propId]: value } } : r)))}
    />
  );
}

/** ToC reads live page headings from context so the stable adapter never
 *  remounts (rebuilding the registry would drop caret focus mid-type). */
export const TocHeadingsContext = React.createContext<TocHeading[]>([]);
function TocAdapter(_props: BlockRendererProps) {
  const headings = React.useContext(TocHeadingsContext);
  return <TocBlock headings={headings} onJump={(id) => focusBlock(id, 0)} />;
}

export const BLOCK_RENDERERS: BlockRenderers = createDefaultBlockRenderers({
  database: DatabaseAdapter,
  toc: TocAdapter,
});
