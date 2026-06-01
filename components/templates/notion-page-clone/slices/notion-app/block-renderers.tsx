"use client";

/** App-level block-renderer wiring for the notion-clone template. notion-shell
 *  ships every self-contained renderer built-in (incl. code/equation); the
 *  host only injects `database` + `toc`, which depend on host data + the
 *  sibling notion-database slice (notion-shell can't import it — compose
 *  here). This is what gives the editor callout/table/divider/nested-toggle/
 *  columns/video/audio/page/button/code/equation/database/toc. */

import { createContext, useContext, useState, type ComponentType } from "react";
import {
  createDefaultBlockRenderers,
  TocBlock,
  focusBlock,
  type BlockRenderers,
  type BlockRendererProps,
  type TocHeading,
} from "@/features/notion-shell";
import {
  NotionDatabase,
  type Database,
  type Page,
} from "@/features/notion-database";

/** Inline database block — mounts the full notion-database surface. A real
 *  host resolves block.databaseId to its stored db/rows; the template keeps
 *  a tiny local one so the block is live, not gray text. */
const INLINE_DB: Database = {
  id: "inline",
  name: "Tasks",
  icon: "✅",
  properties: [
    { id: "name", name: "Name", type: "text" },
    { id: "done", name: "Done", type: "checkbox" },
  ],
  rowIds: ["r1", "r2"],
  views: [],
  activeViewId: "",
  createdAt: 0,
  updatedAt: 0,
};

function DatabaseRenderer(_props: BlockRendererProps) {
  const [rows, setRows] = useState<Page[]>([
    {
      id: "r1", parentId: null, title: "Draft spec", icon: "📝", blocks: [],
      favorite: false, trashed: false, createdAt: 0, updatedAt: 0,
      rowOfDatabaseId: "inline", rowProps: { name: "Draft spec", done: true },
    },
    {
      id: "r2", parentId: null, title: "Review PR", icon: "🔍", blocks: [],
      favorite: false, trashed: false, createdAt: 0, updatedAt: 0,
      rowOfDatabaseId: "inline", rowProps: { name: "Review PR", done: false },
    },
  ]);
  return (
    <NotionDatabase
      db={INLINE_DB}
      rows={rows}
      onRowUpdate={(id, propId, value) =>
        setRows((rs) =>
          rs.map((r) =>
            r.id === id ? { ...r, rowProps: { ...r.rowProps, [propId]: value } } : r,
          ),
        )
      }
    />
  );
}

/** ToC reads live headings from context so the stable adapter never remounts
 *  (rebuilding the registry would drop caret focus while typing). */
export const TocHeadingsContext = createContext<TocHeading[]>([]);
function TocRenderer(_props: BlockRendererProps) {
  const headings = useContext(TocHeadingsContext);
  return <TocBlock headings={headings} onJump={(id) => focusBlock(id, 0)} />;
}

export const NOTION_BLOCK_RENDERERS: BlockRenderers = createDefaultBlockRenderers({
  database: DatabaseRenderer as ComponentType<BlockRendererProps>,
  toc: TocRenderer as ComponentType<BlockRendererProps>,
});
